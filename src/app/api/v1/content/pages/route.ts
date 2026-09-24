import { getDefaultContactPageConfig, getDefaultAboutPageConfig, getDefaultWebsitePages } from "@/lib/cms-page-presets";
import { NextRequest, NextResponse } from "next/server";
import { getTenantDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Store-ID, X-API-Key, X-Tenant-Slug, x-tenant-slug",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
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
  const slug = (searchParams.get("slug") || "").toLowerCase().trim();
  const pageType = (searchParams.get("type") || "").toLowerCase().trim();

  try {
    const db = await getTenantDatabase(tenantSlug);
    if (db) {
      if (slug || (pageType && pageType !== "custom" && pageType !== "page" && pageType !== "website-page")) {
        const targetSlug = slug || pageType;
        const doc = await db.collection("cms_pages").findOne({
          $or: [
            { slug: targetSlug },
            { slug: `/${targetSlug}` },
            { id: targetSlug },
            { type: targetSlug },
          ],
        });

        if (doc) {
          const { _id, ...cleanDoc } = doc;
          return NextResponse.json(
            {
              success: true,
              data: {
                id: cleanDoc.id || _id.toString(),
                ...cleanDoc,
                tenantSlug,
              },
              status: "success",
            },
            { headers: corsHeaders() }
          );
        }

        if (targetSlug === "contact-page" || targetSlug === "contact") {
          const tenantDoc = await db.collection("tenants").findOne({ slug: tenantSlug });
          const contactConfig = getDefaultContactPageConfig(tenantSlug, tenantDoc);
          return NextResponse.json(
            {
              success: true,
              data: {
                id: "contact-page",
                type: "contact-page",
                slug: "contact",
                title: "Contact & Store Locator",
                status: "published",
                config: contactConfig,
                styles: contactConfig.design,
                tenantSlug,
              },
              status: "success",
              source: "preset",
            },
            { headers: corsHeaders() }
          );
        }

        if (targetSlug === "about-page" || targetSlug === "about") {
          const tenantDoc = await db.collection("tenants").findOne({ slug: tenantSlug });
          const aboutConfig = getDefaultAboutPageConfig(tenantSlug, tenantDoc);
          return NextResponse.json(
            {
              success: true,
              data: {
                id: "about-page",
                type: "about-page",
                slug: "about",
                title: "About Us & Atelier Heritage",
                status: "published",
                config: aboutConfig,
                styles: aboutConfig.design,
                tenantSlug,
              },
              status: "success",
              source: "preset",
            },
            { headers: corsHeaders() }
          );
        }

        const tenantDoc = await db.collection("tenants").findOne({ slug: tenantSlug });
        const defaultPages = getDefaultWebsitePages(tenantSlug, tenantDoc);
        const matchingDefault = defaultPages.find(
          (p) =>
            p.slug === targetSlug ||
            p.slug === `/${targetSlug}` ||
            p.id === targetSlug ||
            p.slug.replace(/^\//, "") === targetSlug.replace(/^\//, "")
        );

        if (matchingDefault) {
          try {
            await db.collection("cms_pages").updateOne(
              { slug: matchingDefault.slug },
              { $set: matchingDefault },
              { upsert: true }
            );
          } catch {}
          return NextResponse.json(
            {
              success: true,
              data: matchingDefault,
              status: "success",
              source: "preset",
            },
            { headers: corsHeaders() }
          );
        }

        return NextResponse.json(
          {
            success: false,
            data: null,
            status: "not_found",
            error: `Page "${targetSlug}" not found`,
          },
          { status: 404, headers: corsHeaders() }
        );
      }

      const systemTypes = ["homepage", "header", "footer", "collection-page", "product-page"];
      const query: any = {
        $or: [
          { type: { $in: ["page", "custom", "website-page", "policy", "blog"] } },
          { blocks: { $exists: true } },
          { type: { $nin: systemTypes } },
        ],
      };

      let docs = await db.collection("cms_pages").find(query).toArray();
      const tenantDoc = await db.collection("tenants").findOne({ slug: tenantSlug });
      const defaultPages = getDefaultWebsitePages(tenantSlug, tenantDoc);

      const isJewelryTenant =
        tenantSlug.includes("silvora") ||
        tenantSlug.includes("jewel") ||
        tenantSlug.includes("aurum") ||
        tenantDoc?.category?.toLowerCase().includes("jewel") ||
        tenantDoc?.categoryLabel?.toLowerCase().includes("jewel");

      const hasGenericApparelPages = docs.some(
        (d) =>
          d.title?.toLowerCase().includes("jq trends") ||
          d.seo?.title?.toLowerCase().includes("jq trends") ||
          (isJewelryTenant && d.title?.toLowerCase().includes("apparel"))
      );

      if (!docs || docs.length === 0 || (isJewelryTenant && hasGenericApparelPages)) {
        try {
          if (isJewelryTenant && hasGenericApparelPages) {
            await db.collection("cms_pages").deleteMany({
              $or: [
                { title: { $regex: "JQ Trends", $options: "i" } },
                { "seo.title": { $regex: "JQ Trends", $options: "i" } },
              ],
            });
          }
          for (const dp of defaultPages) {
            await db.collection("cms_pages").updateOne(
              { slug: dp.slug },
              { $set: dp },
              { upsert: true }
            );
          }
          docs = await db.collection("cms_pages").find(query).toArray();
        } catch (seedErr) {
          console.warn("[Pages API] Seeding initial category website pages:", seedErr);
        }
      }

      const cleanPages = (docs.length > 0 ? docs : defaultPages).map((doc: any) => {
        const { _id, ...clean } = doc;
        return {
          id: clean.id || _id?.toString() || `page_${clean.slug}`,
          title: clean.title || "Untitled Page",
          slug: clean.slug ? clean.slug.replace(/^\//, "") : "page",
          status: clean.status || "published",
          type: clean.type || "website-page",
          blocks: clean.blocks || [],
          sectionsEnabled: clean.sectionsEnabled || { hero: true, body: true, customSections: true, valueProps: true },
          customSections: clean.customSections || [],
          design: clean.design || (clean as any).styles || {},
          seo: clean.seo || { title: clean.title },
          tenantSlug: tenantSlug,
          updatedAt: clean.updatedAt || new Date().toISOString(),
          createdAt: clean.createdAt || new Date().toISOString(),
        };
      });

      return NextResponse.json(
        {
          success: true,
          data: cleanPages,
          status: "success",
          count: cleanPages.length,
        },
        { headers: corsHeaders() }
      );
    }
  } catch (err: any) {
    console.error("MongoDB CMS pages error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }

  return NextResponse.json(
    { success: true, data: [], status: "empty" },
    { headers: corsHeaders() }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const tenantSlug = (
      searchParams.get("tenant") ||
      searchParams.get("tenantSlug") ||
      body.tenantSlug ||
      body.tenant ||
      request.headers.get("x-tenant-slug") ||
      request.headers.get("X-Tenant-Slug") ||
      "demo"
    )
      .replace(/^store_/, "")
      .toLowerCase()
      .trim();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Page title is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanSlug = (body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^\//, "");
    const pageId = body.id || `page_${Date.now()}`;
    const now = new Date().toISOString();

    const newPageDoc = {
      id: pageId,
      title: body.title,
      slug: cleanSlug,
      status: body.status || "published",
      type: body.type || "website-page",
      blocks: body.blocks || [],
      sectionsEnabled: body.sectionsEnabled || { hero: true, body: true, customSections: true, valueProps: true },
      customSections: body.customSections || [],
      design: body.design || body.styles || {},
      styles: body.styles || body.design || {},
      seo: body.seo || { title: `${body.title} | Store` },
      tenantSlug: tenantSlug,
      tenantId: tenantSlug,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    const db = await getTenantDatabase(tenantSlug);
    if (db) {
      await db.collection("cms_pages").updateOne(
        { $or: [{ id: pageId }, { slug: cleanSlug }] },
        { $set: newPageDoc },
        { upsert: true }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newPageDoc,
        message: "Page created and published live in tenant DB",
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create page" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const tenantSlug = (
      searchParams.get("tenant") ||
      searchParams.get("tenantSlug") ||
      body.tenantSlug ||
      body.tenant ||
      request.headers.get("x-tenant-slug") ||
      request.headers.get("X-Tenant-Slug") ||
      "demo"
    )
      .replace(/^store_/, "")
      .toLowerCase()
      .trim();

    const cleanSlug = (body.slug || (body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "page")).replace(/^\//, "");
    const pageId = body.id || `page_${Date.now()}`;
    const now = new Date().toISOString();

    const updateDoc: Record<string, any> = {
      id: pageId,
      title: body.title || cleanSlug,
      slug: cleanSlug,
      status: body.status || "published",
      type: body.type || (cleanSlug === "contact" ? "contact-page" : cleanSlug === "about" ? "about-page" : "page"),
      blocks: body.blocks || [],
      seo: body.seo || { title: body.title },
      tenantSlug: tenantSlug,
      tenantId: tenantSlug,
      updatedAt: now,
    };

    if (body.config !== undefined) {
      updateDoc.config = body.config;
    }
    if (body.styles !== undefined) {
      updateDoc.styles = body.styles;
    }
    if (body.design !== undefined) {
      updateDoc.design = body.design;
    }

    const filterOr: any[] = [
      { id: pageId },
      { slug: cleanSlug },
      { slug: `/${cleanSlug}` },
    ];
    if (body.type) {
      filterOr.push({ type: body.type });
    }
    if (cleanSlug === "contact" || body.type === "contact-page") {
      filterOr.push({ type: "contact-page" }, { slug: "contact" });
    }
    if (cleanSlug === "about" || body.type === "about-page") {
      filterOr.push({ type: "about-page" }, { slug: "about" });
    }

    const db = await getTenantDatabase(tenantSlug);
    if (db) {
      await db.collection("cms_pages").updateOne(
        { $or: filterOr },
        {
          $set: updateDoc,
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updateDoc,
        message: "Page updated successfully in tenant DB",
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update page" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
