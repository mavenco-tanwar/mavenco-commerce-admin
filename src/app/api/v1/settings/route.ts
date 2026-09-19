import { NextRequest, NextResponse } from "next/server";
import { getPlatformDatabase, getTenantDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Store-ID, X-API-Key, x-tenant-slug, X-Tenant-Slug, x-tenant, x-store-slug",
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = (
    searchParams.get("tenant") ||
    searchParams.get("tenantSlug") ||
    request.headers.get("x-tenant-slug") ||
    request.headers.get("X-Tenant-Slug") ||
    "demo"
  )
    .replace(/^store_/, "")
    .toLowerCase()
    .trim();

  try {
    const db = await getTenantDatabase(tenantSlug);
    if (db) {
      const doc = await db.collection("tenants").findOne({
        $or: [
          { slug: tenantSlug },
          { id: tenantSlug },
          { id: `store_${tenantSlug}` },
        ],
        status: { $ne: "deleted" },
      });

      if (doc) {
        return NextResponse.json(
          {
            success: true,
            tenant: tenantSlug,
            data: {
              storeName: doc.name || "JQ Trends",
              tagline: doc.tagline || "",
              currency: doc.currency || "INR",
              currencySymbol: doc.currencySymbol || "₹",
              contact: doc.contact || {},
              theme: doc.theme || {},
              announcements: doc.announcements || {},
            },
          },
          { headers: corsHeaders() }
        );
      }
    }
  } catch (err) {
    console.error("Settings DB fetch error:", err);
  }

  return NextResponse.json(
    {
      success: true,
      tenant: tenantSlug,
      data: {
        storeName: "Store",
        tagline: "",
        currency: "INR",
        currencySymbol: "₹",
      },
    },
    { headers: corsHeaders() }
  );
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = (
    searchParams.get("tenant") ||
    searchParams.get("tenantSlug") ||
    request.headers.get("x-tenant-slug") ||
    request.headers.get("X-Tenant-Slug") ||
    "demo"
  )
    .replace(/^store_/, "")
    .toLowerCase()
    .trim();

  try {
    const body = await request.json();
    const db = await getTenantDatabase(tenantSlug);

    if (db) {
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };
      if (body.storeName || body.name) updateData.name = body.storeName || body.name;
      if (body.tagline) updateData.tagline = body.tagline;
      if (body.currency) updateData.currency = body.currency;
      if (body.contact) updateData.contact = body.contact;
      if (body.theme) updateData.theme = body.theme;
      if (body.announcements) updateData.announcements = body.announcements;

      await db.collection("tenants").updateOne(
        {
          $or: [
            { slug: tenantSlug },
            { id: tenantSlug },
            { id: `store_${tenantSlug}` },
          ],
        },
        { $set: updateData },
        { upsert: true }
      );
    }

    try {
      const platformDb = await getPlatformDatabase();
      if (platformDb) {
        const regUpdate: any = { updatedAt: new Date().toISOString() };
        if (body.storeName || body.name) regUpdate.name = body.storeName || body.name;
        if (body.currency) regUpdate.currency = body.currency;
        if (body.theme) regUpdate.theme = body.theme;

        await platformDb.collection("platform_tenants_registry").updateOne(
          { slug: tenantSlug },
          { $set: regUpdate }
        );
      }
    } catch {}

    return NextResponse.json(
      {
        success: true,
        tenant: tenantSlug,
        message: `Settings for tenant ${tenantSlug} updated in tenant DB.`,
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update tenant settings" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
