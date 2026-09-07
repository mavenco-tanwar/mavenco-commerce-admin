import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getDefaultPdpConfig, PDP_PRESET_TEMPLATES } from '@/lib/pdp-presets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant = (
      searchParams.get('tenant') ||
      searchParams.get('tenantSlug') ||
      req.headers.get('x-tenant-slug') ||
      req.headers.get('x-store-slug') ||
      'lumina'
    )
      .toLowerCase()
      .trim();
    const templateId = searchParams.get('template');
    const isPreview = searchParams.get('preview') === 'draft' || searchParams.get('status') === 'draft';

    const db = await getDatabase();
    if (db) {
      const tenantMatchConditions = [
        { tenantSlug: tenant },
        { tenantId: tenant },
        { storeSlug: tenant },
        { tenantId: `store_${tenant}` },
        { storeId: `store_${tenant}` },
      ];

      let doc = null;
      if (templateId && templateId !== 'default_fashion') {
        doc = await db.collection('product_page_templates').findOne({
          $and: [
            { $or: tenantMatchConditions },
            { templateId: templateId },
          ],
        });
      }

      if (!doc) {
        doc = await db.collection('product_page_templates').findOne(
          {
            $and: [
              { $or: tenantMatchConditions },
              {
                $or: [
                  { status: 'published' },
                  { published: { $exists: true, $ne: null } },
                  { isDefault: true },
                ],
              },
            ],
          },
          { sort: { publishedAt: -1, updatedAt: -1 } }
        );
      }

      if (!doc) {
        doc = await db.collection('product_page_templates').findOne(
          { $or: tenantMatchConditions },
          { sort: { updatedAt: -1 } }
        );
      }

      if (doc) {
        const activeConfig = isPreview && doc.draft ? doc.draft : doc.published || doc.draft;
        if (activeConfig) {
          return NextResponse.json(
            {
              success: true,
              data: activeConfig,
              draft: doc.draft || doc.published,
              published: doc.published,
              templateId: doc.templateId || templateId || 'default_fashion',
              isDefault: doc.isDefault ?? true,
              updatedAt: doc.updatedAt,
              source: 'product_page_templates',
            },
            { headers: corsHeaders() }
          );
        }
      }

      // cms_pages fallback
      const cmsDoc = await db.collection('cms_pages').findOne(
        {
          type: 'product-page',
          $or: tenantMatchConditions,
        },
        { sort: { updatedAt: -1 } }
      );

      if (cmsDoc?.config) {
        return NextResponse.json(
          {
            success: true,
            data: cmsDoc.config,
            draft: cmsDoc.config,
            published: cmsDoc.config,
            templateId: templateId || 'default_fashion',
            isDefault: true,
            updatedAt: cmsDoc.updatedAt,
            source: 'cms_pages',
          },
          { headers: corsHeaders() }
        );
      }
    }

    const fallbackPreset = PDP_PRESET_TEMPLATES[templateId || 'default_fashion']?.config || getDefaultPdpConfig(tenant);
    return NextResponse.json(
      {
        success: true,
        data: fallbackPreset,
        draft: fallbackPreset,
        published: fallbackPreset,
        templateId: templateId || 'default_fashion',
        isDefault: true,
        fallback: true,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('PDP GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const tenantParam = searchParams.get('tenant') || searchParams.get('tenantSlug');

    const tenant = (body.tenant || body.tenantSlug || tenantParam || 'lumina').toLowerCase().trim();
    const templateId = body.templateId || 'default_fashion';
    const status = body.status || 'published';
    const config = body.config || body;
    const isDefault = body.isDefault !== undefined ? body.isDefault : true;

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid configuration object' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanTenant = String(tenant).toLowerCase().trim();
    const db = await getDatabase();

    if (!db) {
      return NextResponse.json(
        { success: true, message: 'MongoDB unavailable, acknowledged locally', data: config },
        { headers: corsHeaders() }
      );
    }

    const collection = db.collection('product_page_templates');
    const now = new Date().toISOString();

    const updateDoc: any = {
      updatedAt: now,
      tenantSlug: cleanTenant,
      tenantId: cleanTenant,
      storeSlug: cleanTenant,
      storeId: `store_${cleanTenant}`,
      templateId: templateId,
      isDefault: isDefault,
      status: status,
    };

    if (status === 'published') {
      updateDoc.published = config;
      updateDoc.draft = config;
      updateDoc.publishedAt = now;

      // 1. Archive to versions
      await db.collection('product_page_versions').insertOne({
        tenantSlug: cleanTenant,
        tenantId: cleanTenant,
        templateId: templateId,
        config: config,
        versionId: `ver_${Date.now()}`,
        publishedAt: now,
        summary: `Published ${templateId} template`,
      });

      // 2. Mirror to cms_pages
      await db.collection('cms_pages').updateOne(
        {
          type: 'product-page',
          $or: [
            { tenantSlug: cleanTenant },
            { tenantId: cleanTenant },
            { storeSlug: cleanTenant },
            { tenantId: `store_${cleanTenant}` },
          ],
        },
        {
          $set: {
            type: 'product-page',
            tenantSlug: cleanTenant,
            tenantId: cleanTenant,
            title: `PDP Template (${cleanTenant})`,
            config: config,
            status: 'published',
            updatedAt: now,
          },
        },
        { upsert: true }
      );
    } else {
      updateDoc.draft = config;
    }

    // 3. Upsert into product_page_templates
    await collection.updateOne(
      {
        $or: [
          { tenantSlug: cleanTenant, templateId: templateId },
          { tenantId: cleanTenant, templateId: templateId },
          { tenantSlug: cleanTenant, isDefault: true },
          { tenantId: cleanTenant, isDefault: true },
          { tenantSlug: cleanTenant },
        ],
      },
      { $set: updateDoc },
      { upsert: true }
    );

    // Also update the primary default record so generic queries find this newly published configuration
    await collection.updateOne(
      {
        tenantSlug: cleanTenant,
        templateId: 'default_fashion',
      },
      {
        $set: {
          ...updateDoc,
          templateId: 'default_fashion',
        },
      },
      { upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Product Page template for ${cleanTenant} successfully ${status}!`,
        data: config,
        status,
        updatedAt: now,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('PDP POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
