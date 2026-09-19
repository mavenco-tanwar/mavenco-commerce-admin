import { NextRequest, NextResponse } from "next/server";
import { getPlatformDatabase, getTenantDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-tenant-slug, X-Tenant-Slug, x-tenant, x-store-slug, x-store-id, x-user-name, X-Store-ID, X-API-Key, *",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("list") === "all") {
    try {
      const db = await getPlatformDatabase();
      if (db) {
        let docs = await db
          .collection("platform_tenants_registry")
          .find({ status: { $ne: "deleted" } })
          .sort({ createdAt: -1 })
          .toArray();

        if (!docs || docs.length === 0) {
          docs = await db
            .collection("tenants")
            .find({ status: { $ne: "deleted" } })
            .sort({ createdAt: -1 })
            .toArray();
        }

        if (docs && docs.length > 0) {
          const cleanDocs = docs.map(({ _id, ...rest }) => rest);
          return NextResponse.json(
            {
              data: cleanDocs,
              count: cleanDocs.length,
              status: "success",
            },
            { headers: corsHeaders() }
          );
        }
      }
    } catch (err) {
      console.error("MongoDB tenant list error:", err);
    }

    return NextResponse.json(
      { data: [], count: 0, status: "success" },
      { headers: corsHeaders() }
    );
  }

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
        const { _id, ...tenantData } = doc;
        return NextResponse.json(
          {
            data: tenantData,
            tenant: tenantSlug,
            status: "success",
          },
          { headers: corsHeaders() }
        );
      }
    }

    const platformDb = await getPlatformDatabase();
    if (platformDb) {
      const regDoc = await platformDb.collection("platform_tenants_registry").findOne({
        $or: [{ slug: tenantSlug }, { tenantId: tenantSlug }, { id: tenantSlug }],
        status: { $ne: "deleted" },
      });
      if (regDoc) {
        const { _id, ...tenantData } = regDoc;
        return NextResponse.json(
          {
            data: tenantData,
            tenant: tenantSlug,
            status: "success",
          },
          { headers: corsHeaders() }
        );
      }
    }
  } catch (err) {
    console.error("MongoDB tenant fetch error:", err);
  }

  return NextResponse.json(
    {
      data: null,
      tenant: tenantSlug,
      status: "inactive",
      error: `Store "${tenantSlug}" is not found or inactive`,
    },
    { status: 404, headers: corsHeaders() }
  );
}

export async function PUT(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const now = new Date().toISOString();
    const ownerEmail = (body.ownerEmail || body.contact?.email || "").toLowerCase().trim();
    const ownerName = body.ownerName || "";

    try {
      const db = await getTenantDatabase(tenantSlug);
      if (db) {
        const setPayload: any = {
          ...body,
          slug: tenantSlug,
          status: body.status || "active",
          updatedAt: now,
        };
        delete setPayload.createdAt;
        delete setPayload._id;

        if (ownerEmail) {
          setPayload.ownerEmail = ownerEmail;
          if (!setPayload.contact) setPayload.contact = {};
          setPayload.contact.email = ownerEmail;
        }
        if (ownerName) setPayload.ownerName = ownerName;

        await db.collection("tenants").updateOne(
          { $or: [{ slug: tenantSlug }, { id: tenantSlug }, { id: `store_${tenantSlug}` }] },
          {
            $set: setPayload,
            $setOnInsert: { createdAt: now },
          },
          { upsert: true }
        );
      }
    } catch (err) {
      console.error("Tenant DB write error:", err);
    }

    try {
      const platformDb = await getPlatformDatabase();
      if (platformDb) {
        await platformDb.collection("platform_tenants_registry").updateOne(
          { slug: tenantSlug },
          {
            $set: {
              name: body.name,
              slug: tenantSlug,
              status: body.status || "active",
              currency: body.currency,
              theme: body.theme,
              ...(ownerEmail ? { ownerEmail } : {}),
              ...(ownerName ? { ownerName } : {}),
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          { upsert: true }
        );
      }
    } catch {}

    return NextResponse.json(
      {
        data: body,
        tenant: tenantSlug,
        status: "success",
        message: `Tenant ${tenantSlug} updated and persisted in tenant DB`,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update tenant" },
      { status: 400, headers: corsHeaders() }
    );
  }
}
