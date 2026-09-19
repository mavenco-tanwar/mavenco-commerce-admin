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

    const product = await db.collection('products').findOne({
      $or: [
        { id },
        { slug: id },
        { sku: id },
        ...(objId ? [{ _id: objId }] : []),
      ],
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404, headers: corsHeaders() });
    }

    const { _id, ...clean } = product;
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
    const tenantParam =
      searchParams.get('tenant') ||
      searchParams.get('tenantSlug') ||
      searchParams.get('storeSlug') ||
      req.headers.get('x-tenant-slug') ||
      req.headers.get('X-Tenant-Slug') ||
      req.headers.get('x-store-slug') ||
      body.tenantSlug ||
      body.storeSlug ||
      '';

    const cleanSlug = tenantParam.replace(/^(store_|_)/, '').toLowerCase().trim();
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500, headers: corsHeaders() });
    }

    const { ObjectId } = await import('mongodb');
    let objId = null;
    try {
      if (ObjectId.isValid(id) && id.length === 24) objId = new ObjectId(id);
    } catch {}

    const matchQuery = {
      $or: [
        { id },
        { slug: id },
        { sku: id },
        ...(objId ? [{ _id: objId }] : []),
      ],
    };

    const updatePayload: Record<string, any> = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload._id;

    // Harmonize flags & badges without dot notation conflict
    const isFeatured = Boolean(body.badges?.isFeatured ?? body.flags?.isFeatured ?? body.isFeatured ?? false);
    const isNewArrival = Boolean(body.badges?.isNewArrival ?? body.flags?.isNew ?? body.isNewArrival ?? false);
    const isBestSeller = Boolean(body.badges?.isBestSeller ?? body.flags?.isBestSeller ?? body.isBestSeller ?? false);

    updatePayload.flags = {
      ...(body.flags && typeof body.flags === 'object' ? body.flags : {}),
      isFeatured,
      isNew: isNewArrival,
      isBestSeller,
    };
    updatePayload.badges = {
      ...(body.badges && typeof body.badges === 'object' ? body.badges : {}),
      isFeatured,
      isNewArrival,
      isBestSeller,
    };
    updatePayload.isFeatured = isFeatured;
    updatePayload.isNewArrival = isNewArrival;
    updatePayload.isBestSeller = isBestSeller;

    // Ensure no conflicting dot-notation keys exist
    delete updatePayload['flags.isFeatured'];
    delete updatePayload['flags.isNew'];
    delete updatePayload['flags.isBestSeller'];
    delete updatePayload['badges.isFeatured'];
    delete updatePayload['badges.isNewArrival'];
    delete updatePayload['badges.isBestSeller'];

    if (body.shipping?.weightKg !== undefined) {
      updatePayload.weight = body.shipping.weightKg;
    }

    const result = await db.collection('products').updateMany(matchQuery, { $set: updatePayload });
    try {
      await db.collection('pim_products').updateMany(matchQuery, { $set: updatePayload });
    } catch {}

    // If product was not yet persisted in DB, upsert it so it is reliably saved
    if (result.matchedCount === 0) {
      const fullDoc = {
        ...updatePayload,
        id,
        slug: body.slug || id,
        title: body.title || body.name || 'Untitled Product',
        tenantId: `store_${cleanSlug || 'jq-trends'}`,
        tenantSlug: cleanSlug || 'jq-trends',
        storeSlug: cleanSlug || 'jq-trends',
        status: body.status || 'published',
        createdAt: body.createdAt || new Date().toISOString(),
      };
      await db.collection('products').updateOne({ id }, { $set: fullDoc }, { upsert: true });
      try {
        await db.collection('pim_products').updateOne({ id }, { $set: fullDoc }, { upsert: true });
      } catch {}
    }

    return NextResponse.json({ success: true, message: 'Product updated successfully' }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('[API Products PATCH Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  return PATCH(req, context);
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
      $or: [
        { id },
        { slug: id },
        { sku: id },
        ...(objId ? [{ _id: objId }] : []),
      ],
    };

    await db.collection('products').deleteMany(matchQuery);
    try {
      await db.collection('pim_products').deleteMany(matchQuery);
    } catch {}

    return NextResponse.json({ success: true, message: 'Product deleted from database' }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
