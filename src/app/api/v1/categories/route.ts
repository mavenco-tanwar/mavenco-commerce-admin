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

    const cleanSlug = tenantParam.replace(/^store_/, '').toLowerCase().trim();
    if (!cleanSlug || cleanSlug === 'all') {
      return NextResponse.json({ success: true, data: [] }, { headers: corsHeaders() });
    }

    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (db) {
      const collection = db.collection('categories');
      const docs = await collection
        .find({
          $or: [
            { tenantSlug: cleanSlug },
            { storeSlug: cleanSlug },
            { tenantId: cleanSlug },
            { tenantId: `store_${cleanSlug}` },
          ],
        })
        .sort({ displayOrder: 1 })
        .toArray();

      const clean = docs.map(({ _id, ...rest }) => rest);
      return NextResponse.json({ success: true, data: clean, count: clean.length }, { headers: corsHeaders() });
    }

    return NextResponse.json({ success: true, data: [] }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
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

    const cleanSlug = (tenantParam || 'jq-trends').replace(/^store_/, '').toLowerCase().trim();
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    const now = new Date().toISOString();

    const cleanName = body.name || 'New Category';
    const catSlug = body.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catId = body.id || `cat_${catSlug}_${cleanSlug}`;

    const newCategory = {
      ...body,
      id: catId,
      name: cleanName,
      slug: catSlug,
      tenantId: `store_${cleanSlug}`,
      tenantSlug: cleanSlug,
      storeSlug: cleanSlug,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await db.collection('categories').updateOne(
        { $or: [{ id: catId }, { slug: catSlug, tenantSlug: cleanSlug }] },
        { $set: newCategory },
        { upsert: true }
      );
    }

    return NextResponse.json(
      { success: true, data: newCategory, message: 'Category saved to database' },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
