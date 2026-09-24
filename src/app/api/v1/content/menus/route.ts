import { NextRequest, NextResponse } from 'next/server';
import { getTenantDatabase, getDatabase } from '@/lib/mongodb';
import { DEMO_PRESETS } from '@/app/api/v1/platform/tenants/publish-demo-presets/presets-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Store-ID, X-API-Key, X-Tenant-Slug, x-tenant-slug, x-tenant',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    Pragma: 'no-cache',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

function resolveBlueprintPreset(presetKey: string) {
  const key = (presetKey || 'apparel').toLowerCase().trim();
  const slugMap: Record<string, string> = {
    jewelry: 'demo-jewelry',
    'demo-jewelry': 'demo-jewelry',
    jewels: 'demo-jewelry',
    watches: 'demo-jewelry',
    diamonds: 'demo-jewelry',
    fashion: 'demo-fashion',
    'demo-fashion': 'demo-fashion',
    apparel: 'demo-fashion',
    clothing: 'demo-fashion',
    electronics: 'demo-electronics',
    'demo-electronics': 'demo-electronics',
    tech: 'demo-electronics',
    audio: 'demo-electronics',
    home: 'demo-home',
    'demo-home': 'demo-home',
    decor: 'demo-home',
    living: 'demo-home',
    beauty: 'demo-beauty',
    'demo-beauty': 'demo-beauty',
    cosmetics: 'demo-beauty',
    skincare: 'demo-beauty',
    activewear: 'demo-fitness',
    'demo-fitness': 'demo-fitness',
    fitness: 'demo-fitness',
    sports: 'demo-fitness',
    grocery: 'demo-grocery',
    'demo-grocery': 'demo-grocery',
    organics: 'demo-grocery',
    footwear: 'demo-footwear',
    'demo-footwear': 'demo-footwear',
    shoes: 'demo-footwear',
    sneakers: 'demo-footwear',
  };

  const targetSlug = slugMap[key] || (key.startsWith('demo-') ? key : 'demo-fashion');
  return DEMO_PRESETS.find((p) => p.slug === targetSlug) || DEMO_PRESETS[0];
}

function inferTenantPreset(tenantDoc: any, tenantSlug?: string): string {
  if (tenantDoc?.preset && typeof tenantDoc.preset === 'string') return tenantDoc.preset;
  if (tenantDoc?.category && typeof tenantDoc.category === 'string') return tenantDoc.category;

  const textToScan = [
    tenantSlug || '',
    tenantDoc?.slug || '',
    tenantDoc?.name || '',
    tenantDoc?.tagline || '',
    tenantDoc?.description || '',
    tenantDoc?.categoryLabel || '',
  ]
    .join(' ')
    .toLowerCase();

  if (textToScan.includes('jewel') || textToScan.includes('silvora') || textToScan.includes('gold') || textToScan.includes('diamond') || textToScan.includes('watch') || textToScan.includes('gem')) {
    return 'jewelry';
  }
  if (textToScan.includes('veg') || textToScan.includes('grocery') || textToScan.includes('coffee') || textToScan.includes('superfood') || textToScan.includes('organic')) {
    return 'grocery';
  }
  if (textToScan.includes('volt') || textToScan.includes('electronic') || textToScan.includes('gadget') || textToScan.includes('audio') || textToScan.includes('headphone')) {
    return 'electronics';
  }
  if (textToScan.includes('glow') || textToScan.includes('beauty') || textToScan.includes('cosmetic') || textToScan.includes('skincare') || textToScan.includes('botanica')) {
    return 'beauty';
  }
  if (textToScan.includes('apex') || textToScan.includes('fit') || textToScan.includes('activewear') || textToScan.includes('athletic') || textToScan.includes('gym')) {
    return 'activewear';
  }
  if (textToScan.includes('aura') || textToScan.includes('furniture') || textToScan.includes('decor') || textToScan.includes('living') || textToScan.includes('nordic')) {
    return 'home';
  }
  if (textToScan.includes('kick') || textToScan.includes('shoe') || textToScan.includes('sneaker') || textToScan.includes('footwear') || textToScan.includes('boot')) {
    return 'footwear';
  }
  return 'fashion';
}

/**
 * GET /api/v1/content/menus
 * Lists all navigation menus (header-menu, footer-menu-shop, footer-menu-care)
 * Backed by tenant MongoDB with category-aligned seed fallbacks.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = (
    searchParams.get('tenant') ||
    searchParams.get('tenantSlug') ||
    searchParams.get('store') ||
    request.headers.get('x-tenant-slug') ||
    request.headers.get('X-Tenant-Slug') ||
    'demo'
  )
    .replace(/^store_/, '')
    .toLowerCase()
    .trim();

  try {
    const db = await getTenantDatabase(tenantSlug);
    const platformDb = await getDatabase();

    if (db) {
      const docs = await db.collection('cms_menus').find({}).toArray();

      if (docs && docs.length > 0) {
        const cleanDocs = docs.map(({ _id, ...rest }) => ({
          ...rest,
          tenantSlug,
        }));
        return NextResponse.json(
          {
            success: true,
            data: cleanDocs,
            menus: cleanDocs,
          },
          { headers: corsHeaders() }
        );
      }

      // If no menus are stored in MongoDB yet, derive from tenantDoc or category blueprint
      let tenantDoc: any = null;
      try {
        tenantDoc = await db.collection('tenants').findOne({
          $or: [{ slug: tenantSlug }, { id: tenantSlug }, { id: `store_${tenantSlug}` }, { tenantId: tenantSlug }],
        });
      } catch {}

      if (!tenantDoc && platformDb) {
        try {
          tenantDoc = await platformDb.collection('tenants').findOne({
            $or: [{ slug: tenantSlug }, { id: tenantSlug }, { id: `store_${tenantSlug}` }, { tenantId: tenantSlug }],
          });
        } catch {}
      }

      const preset = inferTenantPreset(tenantDoc, tenantSlug);
      const blueprint = resolveBlueprintPreset(preset);
      const storePrefix = tenantSlug && tenantSlug !== 'demo' && tenantSlug !== 'storefront' ? `/stores/${tenantSlug}` : '';

      // 1. Header Menu Items
      let headerItems: any[] = [];
      if (Array.isArray(tenantDoc?.navLinks) && tenantDoc.navLinks.length > 0) {
        headerItems = tenantDoc.navLinks.map((link: any, idx: number) => ({
          id: `nav_${idx + 1}`,
          label: link.label,
          type: 'link',
          url: link.href.startsWith('/stores/') || link.href.startsWith('http') ? link.href : `${storePrefix}${link.href.startsWith('/') ? link.href : `/${link.href}`}`,
          badge: link.badge,
          isVisible: true,
        }));
      } else if (Array.isArray(blueprint?.navLinks) && blueprint.navLinks.length > 0) {
        headerItems = blueprint.navLinks.map((link: any, idx: number) => ({
          id: `nav_${idx + 1}`,
          label: link.label,
          type: 'link',
          url: link.href.startsWith('/stores/') || link.href.startsWith('http') ? link.href : `${storePrefix}${link.href.startsWith('/') ? link.href : `/${link.href}`}`,
          badge: link.badge,
          isVisible: true,
        }));
      } else {
        headerItems = [
          { id: 'nav_1', label: 'All Products', type: 'collection', url: `${storePrefix}/collections`, isVisible: true },
          { id: 'nav_2', label: 'Featured Collections', type: 'collection', url: `${storePrefix}/collections`, isVisible: true },
        ];
      }

      // 2. Footer Shop Items
      let footerShopItems: any[] = [];
      if (Array.isArray(tenantDoc?.footerShopLinks) && tenantDoc.footerShopLinks.length > 0) {
        footerShopItems = tenantDoc.footerShopLinks.map((link: any, idx: number) => ({
          id: `nav_f${idx + 1}`,
          label: link.label,
          type: 'link',
          url: link.href.startsWith('/stores/') || link.href.startsWith('http') ? link.href : `${storePrefix}${link.href.startsWith('/') ? link.href : `/${link.href}`}`,
          isVisible: true,
        }));
      } else if (Array.isArray(blueprint?.footerShopLinks) && blueprint.footerShopLinks.length > 0) {
        footerShopItems = blueprint.footerShopLinks.map((link: any, idx: number) => ({
          id: `nav_f${idx + 1}`,
          label: link.label,
          type: 'link',
          url: link.href.startsWith('/stores/') || link.href.startsWith('http') ? link.href : `${storePrefix}${link.href.startsWith('/') ? link.href : `/${link.href}`}`,
          isVisible: true,
        }));
      } else {
        footerShopItems = [
          { id: 'nav_f1', label: 'All Collections', type: 'collection', url: `${storePrefix}/collections`, isVisible: true },
          { id: 'nav_f2', label: 'Store Catalog', type: 'collection', url: `${storePrefix}/collections`, isVisible: true },
        ];
      }

      // 3. Footer Care Items
      let footerCareItems: any[] = [];
      if (Array.isArray(tenantDoc?.footerCareLinks) && tenantDoc.footerCareLinks.length > 0) {
        footerCareItems = tenantDoc.footerCareLinks.map((link: any, idx: number) => ({
          id: `nav_care_${idx + 1}`,
          label: link.label,
          type: 'link',
          url: link.href.startsWith('/stores/') || link.href.startsWith('http') ? link.href : `${storePrefix}${link.href.startsWith('/') ? link.href : `/${link.href}`}`,
          isVisible: true,
        }));
      } else if (Array.isArray(blueprint?.footerCareLinks) && blueprint.footerCareLinks.length > 0) {
        footerCareItems = blueprint.footerCareLinks.map((link: any, idx: number) => ({
          id: `nav_care_${idx + 1}`,
          label: link.label,
          type: 'link',
          url: link.href.startsWith('/stores/') || link.href.startsWith('http') ? link.href : `${storePrefix}${link.href.startsWith('/') ? link.href : `/${link.href}`}`,
          isVisible: true,
        }));
      } else {
        footerCareItems = [
          { id: 'nav_c1', label: 'Contact Us', type: 'page', url: `${storePrefix}/contact`, isVisible: true },
          { id: 'nav_c2', label: 'Shipping & Delivery', type: 'page', url: `${storePrefix}/shipping`, isVisible: true },
          { id: 'nav_c3', label: 'Returns & Exchanges', type: 'page', url: `${storePrefix}/returns`, isVisible: true },
          { id: 'nav_c4', label: 'FAQ', type: 'page', url: `${storePrefix}/faq`, isVisible: true },
        ];
      }

      const storeDisplayName = tenantDoc?.name || tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1);
      const generatedMenus = [
        {
          id: `menu_header_${tenantSlug}`,
          title: `${storeDisplayName} Header Navigation`,
          slug: 'header-menu',
          items: headerItems,
          tenantSlug,
          updatedAt: new Date().toISOString(),
        },
        {
          id: `menu_footer_shop_${tenantSlug}`,
          title: `${storeDisplayName} Footer Shop Links`,
          slug: 'footer-menu-shop',
          items: footerShopItems,
          tenantSlug,
          updatedAt: new Date().toISOString(),
        },
        {
          id: `menu_footer_care_${tenantSlug}`,
          title: `${storeDisplayName} Customer Care`,
          slug: 'footer-menu-care',
          items: footerCareItems,
          tenantSlug,
          updatedAt: new Date().toISOString(),
        },
      ];

      // Auto-seed into tenant database for persistence
      try {
        for (const menu of generatedMenus) {
          await db.collection('cms_menus').updateOne(
            { slug: menu.slug },
            { $set: menu },
            { upsert: true }
          );
        }
      } catch (seedErr) {
        console.warn('[Admin Menus API] Auto-seed warning:', seedErr);
      }

      return NextResponse.json(
        {
          success: true,
          data: generatedMenus,
          menus: generatedMenus,
        },
        { headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.warn('[GET /api/v1/content/menus] Error in admin:', err);
  }

  return NextResponse.json(
    {
      success: true,
      data: [],
      menus: [],
    },
    { headers: corsHeaders() }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const tenantSlug = (
      body.tenantSlug ||
      body.tenantId ||
      body.storeSlug ||
      searchParams.get('tenant') ||
      searchParams.get('tenantSlug') ||
      request.headers.get('x-tenant-slug') ||
      'demo'
    )
      .replace(/^store_/, '')
      .toLowerCase()
      .trim();

    const db = await getTenantDatabase(tenantSlug);
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database unavailable' },
        { status: 503, headers: corsHeaders() }
      );
    }

    const menuData = {
      id: body.id || `menu_${Date.now()}`,
      title: body.title || 'New Navigation Menu',
      slug: body.slug || body.code || `menu-${Date.now()}`,
      items: Array.isArray(body.items) ? body.items : [],
      tenantSlug: tenantSlug,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await db.collection('cms_menus').updateOne(
      { $or: [{ id: menuData.id }, { slug: menuData.slug }] },
      { $set: menuData },
      { upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: menuData,
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
