import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, getTenantDatabase } from '@/lib/mongodb';
import { getDefaultCollectionPageConfig } from '@/lib/collection-page-presets';
import { CollectionPageConfig } from '@/types/collection-page.types';

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
  const templateId = searchParams.get('template');
  const isPreview = searchParams.get('preview') === 'draft' || searchParams.get('status') === 'draft';

  let defaultCfg = getDefaultCollectionPageConfig(tenantSlug);

  try {
    const platformDb = await getDatabase();
    if (platformDb) {
      const tenantDoc = await platformDb.collection('tenants').findOne({
        $or: [{ slug: tenantSlug }, { id: tenantSlug }, { id: `store_${tenantSlug}` }],
      });
      if (tenantDoc?.category || tenantDoc?.preset) {
        defaultCfg = getDefaultCollectionPageConfig(tenantSlug, tenantDoc.category || tenantDoc.preset);
      }
    }
  } catch {}

  try {
    const tenantDb = await getTenantDatabase(tenantSlug);
    const platformDb = await getDatabase();
    const databases = [tenantDb, platformDb].filter(Boolean) as any[];

    const tenantMatchConditions = [
      { tenantId: tenantSlug },
      { tenantSlug: tenantSlug },
      { storeId: `store_${tenantSlug}` },
      { storeSlug: tenantSlug },
    ];

    let doc = null;

    for (const db of databases) {
      if (doc) break;

      // 1. If explicit templateId is provided (not generic default_fashion), check it first
      if (templateId && templateId !== 'default_fashion') {
        doc = await db.collection('collection_page_configs').findOne({
          $and: [
            { $or: tenantMatchConditions },
            { templateId: templateId },
          ],
        });
      }

      // 2. Otherwise, fetch the most recently published or updated configuration for this tenant
      if (!doc) {
        doc = await db.collection('collection_page_configs').findOne(
          {
            $and: [
              { $or: tenantMatchConditions },
              {
                $or: [
                  { status: 'published' },
                  { published: { $exists: true, $ne: null } },
                ],
              },
            ],
          },
          { sort: { publishedAt: -1, updatedAt: -1 } }
        );
      }

      // 3. Fallback: any doc for this tenant
      if (!doc) {
        doc = await db.collection('collection_page_configs').findOne(
          { $or: tenantMatchConditions },
          { sort: { updatedAt: -1 } }
        );
      }

      // 4. Fallback check in cms_pages
      if (!doc) {
        const cmsDoc = await db.collection('cms_pages').findOne(
          {
            $and: [
              { $or: tenantMatchConditions },
              { $or: [{ type: 'collection-page' }, { type: 'plp' }] },
            ],
          },
          { sort: { updatedAt: -1 } }
        );
        if (cmsDoc?.config || cmsDoc?.published || cmsDoc?.hero) {
          doc = cmsDoc.config || cmsDoc.published || cmsDoc;
        }
      }
    }

    if (doc) {
      if (isPreview && doc.draft) {
        return NextResponse.json(
          { success: true, data: { ...defaultCfg, ...doc.draft, tenantId: tenantSlug } },
          { headers: corsHeaders() }
        );
      }
      if (doc.published) {
        return NextResponse.json(
          { success: true, data: { ...defaultCfg, ...doc.published, tenantId: tenantSlug } },
          { headers: corsHeaders() }
        );
      }
      if (doc.draft) {
        return NextResponse.json(
          { success: true, data: { ...defaultCfg, ...doc.draft, tenantId: tenantSlug } },
          { headers: corsHeaders() }
        );
      }
      return NextResponse.json(
        { success: true, data: { ...defaultCfg, ...doc, tenantId: tenantSlug } },
        { headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.warn('Collection page config fetch error, falling back to preset:', err);
  }

  return NextResponse.json({ success: true, data: defaultCfg }, { headers: corsHeaders() });
}

async function handleSaveCollectionPage(request: NextRequest) {
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
    const body: CollectionPageConfig = await request.json();
    const tenantDb = await getTenantDatabase(tenantSlug);
    const platformDb = await getDatabase();
    const targetDbs = [tenantDb, platformDb].filter(Boolean) as any[];

    if (targetDbs.length === 0) {
      return NextResponse.json(
        { success: true, message: 'Local fallback acknowledged', data: body },
        { headers: corsHeaders() }
      );
    }

    const templateId = body.templateId || 'default_fashion';
    const now = new Date().toISOString();
    const isPublish = body.status === 'published';

    const updateQuery: any = {
      $set: {
        tenantId: tenantSlug,
        tenantSlug: tenantSlug,
        storeId: `store_${tenantSlug}`,
        templateId,
        updatedAt: now,
      },
    };

    let publishedDoc: CollectionPageConfig | null = null;
    let pubVersion = body.version || Date.now();

    if (isPublish) {
      pubVersion = body.version || Date.now();
      publishedDoc = {
        ...body,
        tenantId: tenantSlug,
        templateId,
        status: 'published',
        version: pubVersion,
        publishedAt: now,
        updatedAt: now,
      };

      updateQuery.$set.published = publishedDoc;
      updateQuery.$set.draft = publishedDoc;
    } else {
      const draftDoc: CollectionPageConfig = {
        ...body,
        tenantId: tenantSlug,
        templateId,
        status: 'draft',
        updatedAt: now,
      };
      updateQuery.$set.draft = draftDoc;
    }

    for (const db of targetDbs) {
      if (isPublish && publishedDoc) {
        // Save version snapshot
        try {
          await db.collection('collection_page_versions').insertOne({
            tenantId: tenantSlug,
            tenantSlug: tenantSlug,
            templateId,
            version: pubVersion,
            name: `Version ${pubVersion}`,
            config: publishedDoc,
            publishedAt: now,
            createdAt: now,
          });
        } catch {}

        // Synchronize into cms_pages for unified query accessibility
        try {
          await db.collection('cms_pages').updateOne(
            {
              $or: [
                { tenantSlug: tenantSlug, type: 'collection-page' },
                { tenantId: tenantSlug, type: 'collection-page' },
              ],
            },
            {
              $set: {
                tenantSlug: tenantSlug,
                tenantId: tenantSlug,
                type: 'collection-page',
                status: 'published',
                version: pubVersion,
                config: publishedDoc,
                hero: publishedDoc.hero,
                grid: publishedDoc.grid,
                updatedAt: now,
              },
            },
            { upsert: true }
          );
        } catch {}
      }

      // 1. Upsert for specific templateId
      await db.collection('collection_page_configs').updateOne(
        {
          $or: [
            { tenantId: tenantSlug, templateId },
            { tenantSlug: tenantSlug, templateId },
          ],
        },
        updateQuery,
        { upsert: true }
      );

      // 2. Also update primary default record so any query finds this newly published template
      await db.collection('collection_page_configs').updateOne(
        {
          $or: [
            { tenantId: tenantSlug, templateId: 'default_fashion' },
            { tenantSlug: tenantSlug, templateId: 'default_fashion' },
            { tenantId: tenantSlug },
            { tenantSlug: tenantSlug },
          ],
        },
        updateQuery,
        { upsert: true }
      );
    }

    try {
      revalidatePath('/collections');
      revalidatePath(`/stores/${tenantSlug}/collections`);
      revalidatePath(`/stores/${tenantSlug}/collections/`);
      revalidatePath('/women');
      revalidatePath('/kids');
      revalidatePath('/new-arrivals');
      revalidatePath('/sale');
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: isPublish ? 'Collection page template published live' : 'Draft configuration saved',
        data: body,
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update collection page template' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(request: NextRequest) {
  return handleSaveCollectionPage(request);
}

export async function POST(request: NextRequest) {
  return handleSaveCollectionPage(request);
}
