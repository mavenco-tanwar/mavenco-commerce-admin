import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getDefaultProductCardConfig } from '@/lib/product-card-presets';
import { ProductCardConfig } from '@/types/product-card.types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Store-ID, X-API-Key, x-tenant-slug',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

function deepMerge<T extends Record<string, any>>(target: T, source?: any): T {
  if (!source || typeof source !== 'object') return target;
  const result: any = { ...target };
  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = target[key];
    if (sVal && typeof sVal === 'object' && !Array.isArray(sVal) && tVal && typeof tVal === 'object') {
      result[key] = deepMerge(tVal, sVal);
    } else if (sVal !== undefined) {
      result[key] = sVal;
    }
  }
  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = (
    searchParams.get('tenant') ||
    request.headers.get('x-tenant-slug') ||
    'lumina'
  )
    .toLowerCase()
    .trim();
  const isPreview = searchParams.get('preview') === 'draft';

  const defaultCfg = getDefaultProductCardConfig(tenantSlug);

  try {
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection('product_card_configs').findOne({
        tenantId: tenantSlug,
      });

      if (doc) {
        const headers = {
          ...corsHeaders(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        };

        if (isPreview && doc.draft) {
          const merged = deepMerge(defaultCfg, { ...doc.draft, tenantId: tenantSlug });
          return NextResponse.json({ success: true, data: merged }, { headers });
        }
        if (doc.published) {
          const merged = deepMerge(defaultCfg, { ...doc.published, tenantId: tenantSlug });
          return NextResponse.json({ success: true, data: merged }, { headers });
        }
        if (doc.draft) {
          const merged = deepMerge(defaultCfg, { ...doc.draft, tenantId: tenantSlug });
          return NextResponse.json({ success: true, data: merged }, { headers });
        }
      }
    }
  } catch (err) {
    console.warn('Product card DB Fetch error, using default seed:', err);
  }

  return NextResponse.json(
    { success: true, data: defaultCfg },
    {
      headers: {
        ...corsHeaders(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = (
    searchParams.get('tenant') ||
    request.headers.get('x-tenant-slug') ||
    'lumina'
  )
    .toLowerCase()
    .trim();

  try {
    const body: ProductCardConfig = await request.json();
    const db = await getDatabase();

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable' },
        { status: 503, headers: corsHeaders() }
      );
    }

    const now = new Date().toISOString();
    const isPublish = body.status === 'published';

    const updateQuery: any = {
      $set: {
        tenantId: tenantSlug,
        updatedAt: now,
      },
    };

    if (isPublish) {
      const publishedVersion = body.version || 1;
      const publishedDoc: ProductCardConfig = {
        ...body,
        tenantId: tenantSlug,
        status: 'published',
        version: publishedVersion,
        publishedAt: now,
        updatedAt: now,
      };

      updateQuery.$set.published = publishedDoc;
      updateQuery.$set.draft = publishedDoc;

      // Save version snapshot
      await db.collection('product_card_versions').insertOne({
        tenantId: tenantSlug,
        version: publishedVersion,
        name: `Version ${publishedVersion}`,
        config: publishedDoc,
        publishedAt: now,
        createdAt: now,
      });
    } else {
      const draftDoc: ProductCardConfig = {
        ...body,
        tenantId: tenantSlug,
        status: 'draft',
        updatedAt: now,
      };
      updateQuery.$set.draft = draftDoc;
    }

    await db.collection('product_card_configs').updateOne(
      { tenantId: tenantSlug },
      updateQuery,
      { upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: isPublish ? 'Product card configuration published live' : 'Draft configuration saved',
        data: body,
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update product card configuration' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
