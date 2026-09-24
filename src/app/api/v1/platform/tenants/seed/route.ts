import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getTenantDatabase } from '@/lib/mongodb';
import { DEMO_PRESETS } from '@/app/api/v1/platform/tenants/publish-demo-presets/presets-data';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug, X-Store-ID, X-API-Key',
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
    pret: 'demo-fashion',
    electronics: 'demo-electronics',
    'demo-electronics': 'demo-electronics',
    tech: 'demo-electronics',
    gadgets: 'demo-electronics',
    audio: 'demo-electronics',
    home: 'demo-home',
    'demo-home': 'demo-home',
    decor: 'demo-home',
    furniture: 'demo-home',
    living: 'demo-home',
    nordic: 'demo-home',
    beauty: 'demo-beauty',
    'demo-beauty': 'demo-beauty',
    cosmetics: 'demo-beauty',
    skincare: 'demo-beauty',
    botanicals: 'demo-beauty',
    activewear: 'demo-fitness',
    'demo-fitness': 'demo-fitness',
    fitness: 'demo-fitness',
    sports: 'demo-fitness',
    athletics: 'demo-fitness',
    gym: 'demo-fitness',
    grocery: 'demo-grocery',
    'demo-grocery': 'demo-grocery',
    organics: 'demo-grocery',
    food: 'demo-grocery',
    footwear: 'demo-footwear',
    'demo-footwear': 'demo-footwear',
    shoes: 'demo-footwear',
    sneakers: 'demo-footwear',
    eyewear: 'demo-eyewear',
    'demo-eyewear': 'demo-eyewear',
    glasses: 'demo-eyewear',
    optics: 'demo-eyewear',
    multipurpose: 'demo',
    universal: 'demo',
    megastore: 'demo',
    demo: 'demo',
  };

  const targetSlug = slugMap[key] || (key.startsWith('demo-') ? key : 'demo-fashion');
  return DEMO_PRESETS.find((p) => p.slug === targetSlug) || DEMO_PRESETS[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantSlug = (body.tenantSlug || body.slug || 'clothing').toLowerCase().trim();
    const rawPreset = (body.preset || 'apparel').toLowerCase().trim();

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500, headers: corsHeaders() });
    }

    const now = new Date().toISOString();
    const blueprint = resolveBlueprintPreset(rawPreset);

    // Retrieve existing tenant info from platform registry if available
    const existingTenant = await db.collection('tenants').findOne({
      $or: [{ slug: tenantSlug }, { id: tenantSlug }, { id: `store_${tenantSlug}` }],
    });

    const storeName = existingTenant?.name || body.name || tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1);
    const tagline = existingTenant?.tagline || blueprint.tagline;
    const currency = existingTenant?.currency || body.currency || blueprint.currency || 'USD';
    const currencySymbol = currency === 'INR' ? '₹' : (blueprint.currencySymbol || '$');

    // 1. Prepare Seeded Products
    let seededProducts: any[] = [];
    if (blueprint.products && blueprint.products.length > 0) {
      seededProducts = blueprint.products.map((p, idx) => ({
        ...p,
        id: `prod_${tenantSlug}_${idx + 1}_${Date.now()}`,
        slug: `${(p.slug || `product-${idx + 1}`).replace(/-demo-[a-z]+$/, '')}-${tenantSlug}`,
        sku: `${tenantSlug.substring(0, 3).toUpperCase()}-${(p.sku || `SKU-${idx + 1}`).split('-').slice(1).join('-') || `${idx + 1}`}`,
        tenantSlug,
        storeSlug: tenantSlug,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      }));
    } else {
      seededProducts = DEMO_PRESETS[0].products.map((p, idx) => ({
        ...p,
        id: `prod_${tenantSlug}_${idx + 1}_${Date.now()}`,
        slug: `${p.slug}-${tenantSlug}`,
        sku: `${tenantSlug.substring(0, 3).toUpperCase()}-${(p.sku || `${idx + 1}`).split('-').slice(1).join('-')}`,
        tenantSlug,
        storeSlug: tenantSlug,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      }));
    }

    // 2. Prepare Seeded Categories
    let seededCategories: any[] = [];
    if (blueprint.categories && blueprint.categories.length > 0) {
      seededCategories = blueprint.categories.map((c, idx) => ({
        ...c,
        id: `cat_${tenantSlug}_${idx + 1}`,
        tenantSlug,
        slug: `${c.slug || `cat-${idx + 1}`}`,
        createdAt: now,
      }));
    } else {
      seededCategories = [
        { id: `cat_${tenantSlug}_1`, name: 'New Arrivals', slug: `new-arrivals-${tenantSlug}`, tenantSlug, count: 4 },
        { id: `cat_${tenantSlug}_2`, name: 'Signature Collection', slug: `signature-${tenantSlug}`, tenantSlug, count: 4 },
        { id: `cat_${tenantSlug}_3`, name: 'Atelier Essentials', slug: `essentials-${tenantSlug}`, tenantSlug, count: 2 },
        { id: `cat_${tenantSlug}_4`, name: 'Seasonal Lookbook', slug: `seasonal-${tenantSlug}`, tenantSlug, count: 2 },
      ];
    }

    // 3. Prepare CMS Document from Blueprint Sections & Theme Styles
    const cmsDoc = {
      tenantSlug,
      type: 'homepage',
      version: Date.now(),
      status: 'published',
      sections: blueprint.sections,
      config: { sections: blueprint.sections },
      styles: blueprint.themeStyles || {},
      themeStyles: blueprint.themeStyles || {},
      updatedAt: now,
      publishedAt: now,
    };

    // 4. Prepare Brand Configuration
    const brandDoc = {
      id: `store_${tenantSlug}`,
      tenantId: tenantSlug,
      slug: tenantSlug,
      name: storeName,
      tagline,
      description: blueprint.description,
      status: 'active',
      category: rawPreset,
      preset: rawPreset,
      currency,
      currencySymbol,
      theme: {
        ...blueprint.theme,
        ...(existingTenant?.theme || {}),
      },
      contact: blueprint.contact,
      announcements: blueprint.announcements,
      navLinks: blueprint.navLinks,
      footerShopLinks: blueprint.footerShopLinks,
      footerCareLinks: blueprint.footerCareLinks,
      updatedAt: now,
    };

    // 5. Seed Dedicated Tenant Database
    let tenantDbSeeded = false;
    try {
      const tenantDb = await getTenantDatabase(tenantSlug);
      if (tenantDb) {
        await Promise.all([
          // CMS Pages
          tenantDb.collection('cms_pages').updateOne(
            { $or: [{ tenantSlug, type: 'homepage' }, { type: 'homepage' }] },
            { $set: cmsDoc },
            { upsert: true }
          ),
          // Brand config
          tenantDb.collection('tenants').updateOne(
            { $or: [{ slug: tenantSlug }, { id: tenantSlug }, { id: `store_${tenantSlug}` }] },
            { $set: brandDoc, $setOnInsert: { createdAt: now } },
            { upsert: true }
          ),
          // Products
          tenantDb.collection('products').deleteMany({
            $or: [{ tenantSlug }, { storeSlug: tenantSlug }],
          }).then(() => tenantDb.collection('products').insertMany(seededProducts)),
          // Categories
          tenantDb.collection('categories').deleteMany({ tenantSlug }).then(() =>
            tenantDb.collection('categories').insertMany(seededCategories)
          ),
          // Navigation Menus
          ...[
            {
              id: `menu_header_${tenantSlug}`,
              title: `${storeName} Header Navigation`,
              slug: 'header-menu',
              items: (blueprint.navLinks || []).map((l: any, i: number) => ({
                id: `nav_${i + 1}`,
                label: l.label,
                type: 'link',
                url: l.href.startsWith('/stores/') || l.href.startsWith('http') ? l.href : `/stores/${tenantSlug}${l.href.startsWith('/') ? '' : '/'}${l.href || ''}`,
                badge: l.badge,
                isVisible: true,
              })),
              tenantSlug,
              updatedAt: now,
            },
            {
              id: `menu_footer_shop_${tenantSlug}`,
              title: `${storeName} Footer Shop Links`,
              slug: 'footer-menu-shop',
              items: (blueprint.footerShopLinks || []).map((l: any, i: number) => ({
                id: `nav_f_${i + 1}`,
                label: l.label,
                type: 'link',
                url: l.href.startsWith('/stores/') || l.href.startsWith('http') ? l.href : `/stores/${tenantSlug}${l.href.startsWith('/') ? '' : '/'}${l.href || ''}`,
                isVisible: true,
              })),
              tenantSlug,
              updatedAt: now,
            },
            {
              id: `menu_footer_care_${tenantSlug}`,
              title: `${storeName} Customer Care`,
              slug: 'footer-menu-care',
              items: (blueprint.footerCareLinks || []).map((l: any, i: number) => ({
                id: `nav_care_${i + 1}`,
                label: l.label,
                type: 'link',
                url: l.href.startsWith('/stores/') || l.href.startsWith('http') ? l.href : `/stores/${tenantSlug}${l.href.startsWith('/') ? '' : '/'}${l.href || ''}`,
                isVisible: true,
              })),
              tenantSlug,
              updatedAt: now,
            },
          ].map((menu) =>
            tenantDb.collection('cms_menus').updateOne(
              { slug: menu.slug },
              { $set: menu },
              { upsert: true }
            )
          ),
        ]);
        tenantDbSeeded = true;
      }
    } catch (tenantErr) {
      console.warn(`Tenant DB seeding notice for ${tenantSlug}:`, tenantErr);
    }

    // 6. Synchronize Platform Registry & Platform Fallbacks
    const platformUpdate = {
      name: storeName,
      tagline,
      description: blueprint.description,
      status: 'active',
      category: rawPreset,
      preset: rawPreset,
      databaseName: `tenant_${tenantSlug}`,
      databaseIdentifier: `tenant_${tenantSlug}`,
      theme: brandDoc.theme,
      currency,
      currencySymbol,
      'metrics.products': seededProducts.length,
      'metrics.storageUsedMb': 32,
      updatedAt: now,
    };

    await Promise.allSettled([
      db.collection('tenants').updateOne(
        { $or: [{ slug: tenantSlug }, { id: tenantSlug }, { id: `store_${tenantSlug}` }] },
        { $set: platformUpdate }
      ),
      db.collection('platform_tenants_registry').updateOne(
        { $or: [{ slug: tenantSlug }, { id: tenantSlug }, { id: `store_${tenantSlug}` }] },
        { $set: platformUpdate }
      ),
      db.collection('cms_pages').updateOne(
        { $or: [{ tenantSlug, type: 'homepage' }] },
        { $set: cmsDoc },
        { upsert: true }
      ),
      db.collection('products').deleteMany({ $or: [{ tenantSlug }, { storeSlug: tenantSlug }] }).then(() =>
        db.collection('products').insertMany(seededProducts)
      ),
      db.collection('categories').deleteMany({ tenantSlug }).then(() =>
        db.collection('categories').insertMany(seededCategories)
      ),
      db.collection('platform_activities').insertOne({
        event: `Seeded ${blueprint.name} blueprint (${seededProducts.length} SKUs, ${seededCategories.length} categories, ${blueprint.sections.length} CMS sections) into ${tenantSlug}`,
        actor: 'superadmin@platform.com',
        tenantId: `store_${tenantSlug}`,
        tenantName: storeName,
        ipAddress: '127.0.0.1',
        severity: 'info',
        timestamp: 'Just now',
        createdAt: now,
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        count: seededProducts.length,
        categoriesCount: seededCategories.length,
        sectionsCount: blueprint.sections.length,
        tenantSlug,
        preset: rawPreset,
        blueprintName: blueprint.name,
        tenantDbSeeded,
        source: 'mongodb_atlas',
        message: `Successfully seeded '${blueprint.name}' blueprint (${seededProducts.length} products, ${blueprint.sections.length} homepage sections) for '${storeName}' (${tenantSlug})!`,
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error('Platform seed API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
