import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getTenantDatabase } from '@/lib/mongodb';

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
    const tenantParam =
      searchParams.get('tenant') ||
      searchParams.get('tenantSlug') ||
      searchParams.get('storeSlug') ||
      req.headers.get('x-tenant-slug') ||
      req.headers.get('X-Tenant-Slug') ||
      req.headers.get('x-store-slug') ||
      '';

    const cleanSlug = tenantParam.replace(/^(store_|_)/, '').toLowerCase().trim();
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (!db) {
      return NextResponse.json({ success: true, data: [] }, { headers: corsHeaders() });
    }

    const query: any = {};
    if (cleanSlug && cleanSlug !== 'all') {
      query.$or = [
        { tenantSlug: cleanSlug },
        { storeSlug: cleanSlug },
        { tenantId: cleanSlug },
        { tenantId: `store_${cleanSlug}` },
      ];
    }

    const docs = await db.collection('products')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const clean = docs.map(({ _id, ...rest }) => ({ ...rest, id: rest.id || _id.toString() }));
    return NextResponse.json({ success: true, data: clean, count: clean.length }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const tenantParam =
      body.tenantSlug ||
      body.storeSlug ||
      searchParams.get('tenant') ||
      req.headers.get('x-tenant-slug') ||
      req.headers.get('X-Tenant-Slug') ||
      '';

    const cleanSlug = (tenantParam || 'jq-trends').replace(/^(store_|_)/, '').toLowerCase().trim();
    const db = (await getTenantDatabase(cleanSlug)) || (await getDatabase());
    const now = new Date().toISOString();

    const title = body.title || body.name || 'Untitled Product';
    const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = body.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newProduct = {
      ...body,
      id,
      title,
      slug,
      tenantId: `store_${cleanSlug}`,
      tenantSlug: cleanSlug,
      storeSlug: cleanSlug,
      status: body.status || 'published',
      createdAt: body.createdAt || now,
      updatedAt: now,
    };
    delete (newProduct as any)._id;

    if (db) {
      await db.collection('products').updateOne(
        { $or: [{ id }, { slug, tenantSlug: cleanSlug }] },
        { $set: newProduct },
        { upsert: true }
      );
      try {
        await db.collection('pim_products').updateOne(
          { $or: [{ id }, { slug, tenantSlug: cleanSlug }] },
          { $set: newProduct },
          { upsert: true }
        );
      } catch {}
    }

    return NextResponse.json(
      { success: true, data: newProduct, message: 'Product saved to database' },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500, headers: corsHeaders() });
    }

    const { ids, status } = body;
    if (Array.isArray(ids) && ids.length > 0 && status) {
      const updateData = { status, updatedAt: new Date().toISOString() };
      await db.collection('products').updateMany(
        { $or: [{ id: { $in: ids } }, { slug: { $in: ids } }] },
        { $set: updateData }
      );
      try {
        await db.collection('pim_products').updateMany(
          { $or: [{ id: { $in: ids } }, { slug: { $in: ids } }] },
          { $set: updateData }
        );
      } catch {}

      return NextResponse.json({ success: true, message: `Updated status for ${ids.length} products` }, { headers: corsHeaders() });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400, headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
