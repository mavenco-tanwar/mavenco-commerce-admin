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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id;
    const id = decodeURIComponent(rawId || '').trim();
    const { searchParams } = new URL(req.url);
    const tenantParam = searchParams.get('tenant') || req.headers.get('x-tenant-slug') || '';
    const cleanSlug = tenantParam.replace(/^(store_|_)/, '').toLowerCase().trim();
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500, headers: corsHeaders() });
    }

    const { ObjectId } = await import('mongodb');
    let objId = null;
    try {
      if (ObjectId.isValid(id) && id.length === 24) objId = new ObjectId(id);
    } catch {}

    const col = await db.collection('collections').findOne({
      $or: [{ id }, { slug: id }, ...(objId ? [{ _id: objId }] : [])],
    });

    if (!col) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404, headers: corsHeaders() });
    }

    const { _id, ...clean } = col;
    return NextResponse.json({ success: true, data: { ...clean, id: clean.id || _id.toString() } }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id;
    const id = decodeURIComponent(rawId || '').trim();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const tenantParam = body.tenantSlug || searchParams.get('tenant') || req.headers.get('x-tenant-slug') || '';
    const cleanSlug = tenantParam.replace(/^(store_|_)/, '').toLowerCase().trim();
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500, headers: corsHeaders() });
    }

    const { ObjectId } = await import('mongodb');
    let objId = null;
    try {
      if (ObjectId.isValid(id) && id.length === 24) objId = new ObjectId(id);
    } catch {}

    const matchQuery = {
      $or: [{ id }, { slug: id }, ...(objId ? [{ _id: objId }] : [])],
    };

    const updatePayload: Record<string, any> = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload._id;

    if (Array.isArray(body.productIds)) {
      updatePayload.productCount = body.productIds.length;
    }

    await db.collection('collections').updateMany(matchQuery, { $set: updatePayload });
    try {
      await db.collection('pim_collections').updateMany(matchQuery, { $set: updatePayload });
    } catch {}

    return NextResponse.json({ success: true, message: 'Collection updated successfully' }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(req: NextRequest, ctx: any) {
  return PATCH(req, ctx);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id;
    const id = decodeURIComponent(rawId || '').trim();
    const { searchParams } = new URL(req.url);
    const tenantParam = searchParams.get('tenant') || req.headers.get('x-tenant-slug') || '';
    const cleanSlug = tenantParam.replace(/^(store_|_)/, '').toLowerCase().trim();
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500, headers: corsHeaders() });
    }

    const { ObjectId } = await import('mongodb');
    let objId = null;
    try {
      if (ObjectId.isValid(id) && id.length === 24) objId = new ObjectId(id);
    } catch {}

    const matchQuery = {
      $or: [{ id }, { slug: id }, ...(objId ? [{ _id: objId }] : [])],
    };

    await db.collection('collections').deleteMany(matchQuery);
    try {
      await db.collection('pim_collections').deleteMany(matchQuery);
    } catch {}

    return NextResponse.json({ success: true, message: 'Collection deleted from database' }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
