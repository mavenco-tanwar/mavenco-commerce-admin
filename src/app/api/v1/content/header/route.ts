import { NextRequest, NextResponse } from "next/server";
import { getTenantDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-tenant-slug, X-Tenant-Slug, x-tenant, x-store-id, x-store-slug, X-Store-ID, X-API-Key, *",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
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
      const doc = await db.collection("cms_pages").findOne(
        {
          $or: [
            { tenantSlug: tenantSlug, type: "header" },
            { type: "header" },
          ],
        },
        { sort: { publishedAt: -1, updatedAt: -1 } }
      );

      if (doc) {
        const { _id, ...cleanDoc } = doc;
        return NextResponse.json(
          {
            success: true,
            data: {
              ...cleanDoc,
              id: cleanDoc.id || _id.toString(),
              tenantSlug: tenantSlug,
            },
            status: "success",
            source: "tenant_db",
          },
          { headers: corsHeaders() }
        );
      }
    }
  } catch (err) {
    console.warn("MongoDB Header fetch warning:", err);
  }

  return NextResponse.json(
    {
      success: true,
      data: null,
      status: "empty",
    },
    { headers: corsHeaders() }
  );
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    const body = await request.json();
    const tenantSlug = (
      body.tenantSlug ||
      body.tenant ||
      searchParams.get("tenant") ||
      searchParams.get("tenantSlug") ||
      request.headers.get("x-tenant-slug") ||
      request.headers.get("X-Tenant-Slug") ||
      "demo"
    )
      .replace(/^store_/, "")
      .toLowerCase()
      .trim();

    const db = await getTenantDatabase(tenantSlug);
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Tenant database unavailable" },
        { status: 503, headers: corsHeaders() }
      );
    }

    const now = new Date().toISOString();
    const isPublish = body.status === "published";
    const nextVersion = Number(body.version || 1);

    const docToSave = {
      ...body,
      id: body.id || `header_${tenantSlug}`,
      tenantSlug: tenantSlug,
      tenantId: tenantSlug,
      type: "header",
      status: body.status || "published",
      version: nextVersion,
      updatedAt: now,
      ...(isPublish ? { publishedAt: now } : {}),
    };
    delete (docToSave as any)._id;

    await db.collection("cms_pages").updateOne(
      {
        $or: [
          { tenantSlug: tenantSlug, type: "header" },
          { type: "header" },
        ],
      },
      {
        $set: docToSave,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Header for ${tenantSlug} saved in tenant DB`,
        data: docToSave,
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update header" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}
