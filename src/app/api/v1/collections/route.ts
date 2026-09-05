import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug, x-user-name, X-Store-ID, X-API-Key, X-Tenant-Slug, x-store-id, x-api-key, *',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTenant =
      searchParams.get('tenant') ||
      searchParams.get('store') ||
      req.headers.get('x-tenant-slug') ||
      req.headers.get('x-tenant') ||
      req.headers.get('X-Tenant-Slug');

    const tenantSlug = rawTenant ? rawTenant.trim().toLowerCase() : undefined;
    const cleanTenant = tenantSlug ? tenantSlug.replace(/^(store_|_)/, '').trim().toLowerCase() : undefined;

    let tenantAliases = new Set<string>();
    if (tenantSlug) tenantAliases.add(tenantSlug);
    if (cleanTenant) tenantAliases.add(cleanTenant);

    const db = await getDatabase();
    if (db) {
      const collection = db.collection('collections');

      // Resolve tenant aliases from tenants collection and platform_tenants_registry
      if (cleanTenant && cleanTenant !== 'all') {
        const collectionsToInspect = ['tenants', 'platform_tenants_registry'];
        for (const collName of collectionsToInspect) {
          try {
            const tenantDocs = await db.collection(collName).find({
              $or: [
                { slug: cleanTenant },
                { tenantId: cleanTenant },
                { id: cleanTenant },
                { id: `store_${cleanTenant}` },
                { id: `store__${cleanTenant}` },
                { slug: new RegExp(cleanTenant, 'i') },
                { id: new RegExp(cleanTenant, 'i') },
              ],
            }).toArray();
            for (const tDoc of tenantDocs) {
              if (tDoc.slug) tenantAliases.add(tDoc.slug.toLowerCase());
              if (tDoc.tenantId) tenantAliases.add(tDoc.tenantId.toLowerCase());
              if (tDoc.id) {
                const idStr = String(tDoc.id).toLowerCase();
                tenantAliases.add(idStr);
                tenantAliases.add(idStr.replace(/^store_/, ''));
                tenantAliases.add(idStr.replace(/^store__/, ''));
              }
            }
          } catch (err) {
            console.warn(`[Collections API] Error reading ${collName}:`, err);
          }
        }
      }

      // Also find products belonging to this tenant to match any collections containing them
      let tenantProductIds: string[] = [];
      if (cleanTenant && cleanTenant !== 'all') {
        try {
          const aliasArr = Array.from(tenantAliases);
          const tProds = await db.collection('products').find({
            $or: [
              { tenantId: { $in: aliasArr } },
              { storeSlug: { $in: aliasArr } },
              { storeId: { $in: aliasArr } },
            ],
          }).project({ id: 1 }).toArray();
          tenantProductIds = tProds.map(p => p.id).filter(Boolean);
        } catch (err) {
          console.warn('[Collections API] Error finding tenant products:', err);
        }
      }

      let query: Record<string, any> = {};
      if (cleanTenant && cleanTenant !== 'all') {
        const aliasList = Array.from(tenantAliases);
        const orConditions: any[] = [];
        for (const a of aliasList) {
          orConditions.push(
            { tenantId: a },
            { tenantId: `store_${a}` },
            { tenantId: `store__${a}` },
            { tenantSlug: a },
            { tenantSlug: `store_${a}` },
            { tenantSlug: `store__${a}` },
            { storeSlug: a },
            { storeSlug: `store_${a}` },
            { storeSlug: `store__${a}` }
          );
        }
        if (tenantProductIds.length > 0) {
          orConditions.push({ productIds: { $in: tenantProductIds } });
        }
        query = { $or: orConditions };
      }

      let docs = await collection.find(query).sort({ createdAt: -1 }).toArray();

      // If no tenant-specific collection found and looking for demo/all, fallback to all collections
      if (docs.length === 0 && (!cleanTenant || cleanTenant === 'all' || cleanTenant === 'demo' || cleanTenant === 'jq-trends')) {
        docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
      }

      // Enrich collections with real assigned product images
      for (const doc of docs) {
        if (Array.isArray(doc.productIds) && doc.productIds.length > 0) {
          try {
            const assignedProds = await db.collection('products').find({
              $or: [
                { id: { $in: doc.productIds } },
                { slug: { $in: doc.productIds } },
              ],
            }).toArray();

            if (assignedProds.length > 0) {
              const assignedImages: string[] = [];
              for (const p of assignedProds) {
                const img =
                  Array.isArray(p.images) && p.images.length > 0
                    ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
                    : p.image;
                if (img && !assignedImages.includes(img)) {
                  assignedImages.push(img);
                }
              }

              if (assignedImages.length > 0) {
                (doc as any).assignedProductImages = assignedImages;
                (doc as any).productImage = assignedImages[0];
                // If no custom image was uploaded, use the real assigned product image!
                if (!doc.imageUrl || doc.imageUrl.includes('photo-1490481651871-ab68de25d43d')) {
                  doc.imageUrl = assignedImages[0];
                }
              }
            }
          } catch {}
        }
      }

      const clean = docs.map(({ _id, ...rest }) => ({
        ...rest,
        id: rest.id || _id?.toString(),
      }));
      return NextResponse.json({ success: true, data: clean, count: clean.length }, { headers: corsHeaders() });
    }

    return NextResponse.json({ success: true, data: [] }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch collections' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const rawTenant =
      body.tenantSlug ||
      body.storeSlug ||
      body.tenantId ||
      searchParams.get('tenant') ||
      searchParams.get('store') ||
      req.headers.get('x-tenant-slug') ||
      req.headers.get('x-tenant') ||
      req.headers.get('X-Tenant-Slug') ||
      'jq-trends';

    const tenantSlug = rawTenant.replace(/^store_/, '').trim().toLowerCase();

    const db = await getDatabase();
    const now = new Date().toISOString();
    const cleanId = body.id || `col_${Date.now()}`;
    const cleanTitle = body.title || body.name || 'New Collection';
    const cleanSlug = body.slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newCollection = {
      ...body,
      id: cleanId,
      title: cleanTitle,
      slug: cleanSlug,
      tenantId: tenantSlug,
      tenantSlug: tenantSlug,
      storeSlug: tenantSlug,
      productIds: Array.isArray(body.productIds) ? body.productIds : [],
      productCount: Array.isArray(body.productIds) ? body.productIds.length : (body.productCount || 0),
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await db.collection('collections').updateOne(
        { $or: [{ id: cleanId }, { slug: cleanSlug, tenantId: tenantSlug }] },
        { $set: newCollection },
        { upsert: true }
      );
    }

    return NextResponse.json(
      { success: true, data: newCollection, message: 'Collection saved in MongoDB' },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id') || searchParams.get('slug');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id || body?.slug;
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Collection ID or slug is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanId = decodeURIComponent(id).trim();
    const db = await getDatabase();
    if (db) {
      const { ObjectId } = await import('mongodb');
      let objId = null;
      try {
        if (ObjectId.isValid(cleanId) && cleanId.length === 24) objId = new ObjectId(cleanId);
      } catch {}

      await db.collection('collections').deleteMany({
        $or: [{ id: cleanId }, { slug: cleanId }, ...(objId ? [{ _id: objId }] : [])],
      });
    }

    return NextResponse.json(
      { success: true, message: 'Collection deleted successfully' },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
