import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase } from '@/lib/mongodb';
import { getDefaultTheme } from '@/lib/theme-presets';
import { ThemeDocument } from '@/types/theme.types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, x-tenant-slug, X-Tenant-Slug, x-tenant, x-store-id, x-store-slug, X-Store-ID, X-API-Key, *',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
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
    searchParams.get('tenantSlug') ||
    request.headers.get('x-tenant-slug') ||
    request.headers.get('x-store-slug') ||
    'lumina'
  )
    .toLowerCase()
    .trim();
  const isPreview = searchParams.get('preview') === 'draft';

  const defaultDoc = getDefaultTheme(tenantSlug);

  try {
    const db = await getDatabase();
    if (db) {
      const tenantMatchConditions = [
        { tenantId: tenantSlug },
        { tenantSlug: tenantSlug },
        { storeId: `store_${tenantSlug}` },
        { storeSlug: tenantSlug },
      ];

      const doc = await db.collection('themes').findOne(
        { $or: tenantMatchConditions },
        { sort: { publishedAt: -1, updatedAt: -1 } }
      );

      if (doc) {
        if (isPreview && doc.draft) {
          const merged = deepMerge(defaultDoc, { ...doc.draft, tenantId: tenantSlug });
          return NextResponse.json({ success: true, data: merged }, { headers: corsHeaders() });
        }
        if (doc.published) {
          const merged = deepMerge(defaultDoc, { ...doc.published, tenantId: tenantSlug });
          return NextResponse.json({ success: true, data: merged }, { headers: corsHeaders() });
        }
        if (doc.draft) {
          const merged = deepMerge(defaultDoc, { ...doc.draft, tenantId: tenantSlug });
          return NextResponse.json({ success: true, data: merged }, { headers: corsHeaders() });
        }
      }
    }
  } catch (err) {
    console.warn('Theme DB Fetch error, using default seed:', err);
  }

  return NextResponse.json({ success: true, data: defaultDoc }, { headers: corsHeaders() });
}

async function handleSaveTheme(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = (
    searchParams.get('tenant') ||
    searchParams.get('tenantSlug') ||
    request.headers.get('x-tenant-slug') ||
    request.headers.get('x-store-slug') ||
    'lumina'
  )
    .toLowerCase()
    .trim();

  try {
    const body: ThemeDocument = await request.json();
    const db = await getDatabase();

    if (!db) {
      return NextResponse.json(
        { success: true, message: 'Local fallback acknowledged', data: body },
        { headers: corsHeaders() }
      );
    }

    const now = new Date().toISOString();
    const isPublish = body.status === 'published';

    const updateQuery: any = {
      $set: {
        tenantId: tenantSlug,
        tenantSlug: tenantSlug,
        storeId: `store_${tenantSlug}`,
        presetId: (body as any).presetId || 'fashion',
        updatedAt: now,
      },
    };

    if (isPublish) {
      const publishedVersion = body.version || Date.now();
      const publishedDoc: ThemeDocument = {
        ...body,
        tenantId: tenantSlug,
        status: 'published',
        version: publishedVersion,
        publishedAt: now,
        updatedAt: now,
      };

      updateQuery.$set.published = publishedDoc;
      updateQuery.$set.draft = publishedDoc;

      // 1. Save version snapshot
      await db.collection('theme_versions').insertOne({
        tenantId: tenantSlug,
        tenantSlug: tenantSlug,
        version: publishedVersion,
        name: `Version ${publishedVersion}`,
        theme: publishedDoc,
        publishedAt: now,
        createdAt: now,
      });

      // 2. Synchronize essential tokens into tenants collection
      await db.collection('tenants').updateOne(
        {
          $or: [
            { slug: tenantSlug },
            { id: tenantSlug },
            { id: `store_${tenantSlug}` },
          ],
        },
        {
          $set: {
            'theme.primaryColor': publishedDoc.colors?.primary,
            'theme.secondaryColor': publishedDoc.colors?.background || publishedDoc.colors?.secondary,
            'theme.accentColor': publishedDoc.colors?.accent,
            'theme.headingFont': publishedDoc.typography?.headingFont,
            'theme.bodyFont': publishedDoc.typography?.bodyFont,
            primaryColor: publishedDoc.colors?.primary,
            secondaryColor: publishedDoc.colors?.background || publishedDoc.colors?.secondary,
            accentColor: publishedDoc.colors?.accent,
            headingFont: publishedDoc.typography?.headingFont,
            bodyFont: publishedDoc.typography?.bodyFont,
            updatedAt: now,
          },
        },
        { upsert: false }
      );
    } else {
      const draftDoc: ThemeDocument = {
        ...body,
        tenantId: tenantSlug,
        status: 'draft',
        updatedAt: now,
      };
      updateQuery.$set.draft = draftDoc;
    }

    await db.collection('themes').updateOne(
      {
        $or: [
          { tenantId: tenantSlug },
          { tenantSlug: tenantSlug },
          { storeId: `store_${tenantSlug}` },
        ],
      },
      updateQuery,
      { upsert: true }
    );

    try {
      revalidatePath('/', 'layout');
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: isPublish ? 'Theme published live' : 'Draft theme saved',
        data: body,
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update theme' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(request: NextRequest) {
  return handleSaveTheme(request);
}

export async function POST(request: NextRequest) {
  return handleSaveTheme(request);
}
