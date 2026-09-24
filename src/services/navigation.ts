import { ApiClient } from './api';
import { PlatformService } from './platform';
import type { NavigationMenu, NavigationItem } from '@/types';

function normalizeMenu(raw: any): NavigationMenu {
  return {
    id: raw.id || `menu_${Date.now()}`,
    title: raw.title || raw.name || 'Navigation Menu',
    slug: raw.slug || raw.code || 'header-menu',
    items: Array.isArray(raw.items)
      ? raw.items.map((it: any) => ({
          id: it.id || `nav_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          label: it.label || it.title || 'Link',
          type: it.type || 'custom',
          url: it.url || it.href || '/',
          isVisible: it.isVisible !== false,
          children: Array.isArray(it.children) ? it.children : undefined,
        }))
      : [],
  };
}

export function getCategoryFallbackMenus(category?: string, storeName: string = 'Store', tenantSlug: string = 'store'): NavigationMenu[] {
  const cat = (category || '').toLowerCase().trim();
  const name = storeName || tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1);
  const prefix = tenantSlug && tenantSlug !== 'demo' && tenantSlug !== 'storefront' ? `/stores/${tenantSlug}` : '';

  // 1. 💎 LUXURY JEWELRY, WATCHES & GEMS (18K Gold & Solitaires)
  if (cat.includes('jewel') || cat.includes('silvora') || cat.includes('gold') || cat.includes('diamond') || cat.includes('watch') || cat.includes('gem')) {
    return [
      {
        id: `menu_header_${tenantSlug}`,
        title: `${name} Header Navigation`,
        slug: 'header-menu',
        items: [
          { id: 'nav_1', label: 'SOLITAIRE DIAMONDS', type: 'link', url: `${prefix}/collections/diamonds`, isVisible: true },
          { id: 'nav_2', label: '18K SOLID GOLD', type: 'link', url: `${prefix}/collections/gold`, isVisible: true },
          { id: 'nav_3', label: 'SWISS CHRONOMETERS', type: 'link', url: `${prefix}/collections/watches`, isVisible: true },
          { id: 'nav_4', label: 'BRIDAL SUITES', type: 'link', url: `${prefix}/collections/bridal`, isVisible: true },
          { id: 'nav_5', label: 'PRIVATE APPOINTMENT', type: 'link', url: `${prefix}/contact`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_shop_${tenantSlug}`,
        title: `${name} Footer Shop Links`,
        slug: 'footer-menu-shop',
        items: [
          { id: 'nav_f1', label: 'Solitaire Diamond Rings', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f2', label: '18K Gold Cuban Chains', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f3', label: 'Automatic Tourbillon Watches', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f4', label: 'South Sea Pearl Necklaces', type: 'link', url: `${prefix}/collections`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_care_${tenantSlug}`,
        title: `${name} Customer Care`,
        slug: 'footer-menu-care',
        items: [
          { id: 'nav_care_1', label: 'GIA Diamond Verification', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_2', label: 'Insured Armored Transit', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_3', label: 'Lifetime Cleaning & Sizing', type: 'link', url: `${prefix}/about`, isVisible: true },
          { id: 'nav_care_4', label: 'Conflict-Free Provenance', type: 'link', url: `${prefix}/about`, isVisible: true },
        ],
      },
    ];
  }

  // 2. 🌿 GOURMET GROCERY & ORGANICS
  if (cat.includes('groc') || cat.includes('veg') || cat.includes('food') || cat.includes('organic') || cat.includes('coffee')) {
    return [
      {
        id: `menu_header_${tenantSlug}`,
        title: `${name} Header Navigation`,
        slug: 'header-menu',
        items: [
          { id: 'nav_1', label: 'SINGLE-ESTATE COFFEE', type: 'link', url: `${prefix}/collections/coffee`, isVisible: true },
          { id: 'nav_2', label: 'COLD-PRESSED OILS', type: 'link', url: `${prefix}/collections/oils`, isVisible: true },
          { id: 'nav_3', label: 'CEREMONIAL MATCHA', type: 'link', url: `${prefix}/collections/tea`, isVisible: true },
          { id: 'nav_4', label: 'ORGANIC PANTRY', type: 'link', url: `${prefix}/collections/pantry`, isVisible: true },
          { id: 'nav_5', label: 'FARM PROVENANCE', type: 'link', url: `${prefix}/about`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_shop_${tenantSlug}`,
        title: `${name} Footer Shop Links`,
        slug: 'footer-menu-shop',
        items: [
          { id: 'nav_f1', label: 'Ethiopian Yirgacheffe Beans', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f2', label: 'Cold-Pressed Avocado Oil', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f3', label: 'Uji Ceremonial Matcha', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f4', label: 'Raw Forest Wild Honey', type: 'link', url: `${prefix}/collections`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_care_${tenantSlug}`,
        title: `${name} Customer Care`,
        slug: 'footer-menu-care',
        items: [
          { id: 'nav_care_1', label: 'Farm-to-Table Guarantee', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_2', label: 'Cold-Chain Delivery', type: 'link', url: `${prefix}/shipping`, isVisible: true },
          { id: 'nav_care_3', label: 'Organic Certifications', type: 'link', url: `${prefix}/about`, isVisible: true },
          { id: 'nav_care_4', label: 'Fresh Harvest Policy', type: 'link', url: `${prefix}/returns`, isVisible: true },
        ],
      },
    ];
  }

  // 3. ⚡ ELECTRONICS & SMART GADGETS
  if (cat.includes('elect') || cat.includes('tech') || cat.includes('audio') || cat.includes('gadget') || cat.includes('volt')) {
    return [
      {
        id: `menu_header_${tenantSlug}`,
        title: `${name} Header Navigation`,
        slug: 'header-menu',
        items: [
          { id: 'nav_1', label: 'STUDIO HEADPHONES', type: 'link', url: `${prefix}/collections/audio`, isVisible: true },
          { id: 'nav_2', label: 'HI-FI AUDIO DACS', type: 'link', url: `${prefix}/collections/dacs`, isVisible: true },
          { id: 'nav_3', label: 'WIRELESS EARBUDS', type: 'link', url: `${prefix}/collections/wireless`, isVisible: true },
          { id: 'nav_4', label: 'SMART WEARABLES', type: 'link', url: `${prefix}/collections/wearables`, isVisible: true },
          { id: 'nav_5', label: 'TECH SUPPORT', type: 'link', url: `${prefix}/contact`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_shop_${tenantSlug}`,
        title: `${name} Footer Shop Links`,
        slug: 'footer-menu-shop',
        items: [
          { id: 'nav_f1', label: 'Active Noise-Cancelling Cans', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f2', label: 'Balanced Armature IEMs', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f3', label: 'Hi-Res Bluetooth Amplifiers', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f4', label: 'Silver Braided Audiophile Cables', type: 'link', url: `${prefix}/collections`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_care_${tenantSlug}`,
        title: `${name} Customer Care`,
        slug: 'footer-menu-care',
        items: [
          { id: 'nav_care_1', label: '2-Year Global Warranty', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_2', label: 'Worldwide Express Shipping', type: 'link', url: `${prefix}/shipping`, isVisible: true },
          { id: 'nav_care_3', label: 'Firmware & Driver Downloads', type: 'link', url: `${prefix}/support`, isVisible: true },
          { id: 'nav_care_4', label: 'Acoustic Lab Calibration', type: 'link', url: `${prefix}/about`, isVisible: true },
        ],
      },
    ];
  }

  // 4. 💄 BEAUTY & SKINCARE
  if (cat.includes('beauty') || cat.includes('skin') || cat.includes('cosmetic') || cat.includes('glow')) {
    return [
      {
        id: `menu_header_${tenantSlug}`,
        title: `${name} Header Navigation`,
        slug: 'header-menu',
        items: [
          { id: 'nav_1', label: 'RADIANCE SERUMS', type: 'link', url: `${prefix}/collections/serums`, isVisible: true },
          { id: 'nav_2', label: 'RESTORATIVE BALMS', type: 'link', url: `${prefix}/collections/balms`, isVisible: true },
          { id: 'nav_3', label: 'NICHE PERFUMES', type: 'link', url: `${prefix}/collections/fragrance`, isVisible: true },
          { id: 'nav_4', label: 'CLEAN LIPSTICKS', type: 'link', url: `${prefix}/collections/lips`, isVisible: true },
          { id: 'nav_5', label: 'SKIN DIAGNOSTIC', type: 'link', url: `${prefix}/quiz`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_shop_${tenantSlug}`,
        title: `${name} Footer Shop Links`,
        slug: 'footer-menu-shop',
        items: [
          { id: 'nav_f1', label: 'Botanical Radiance Serums', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f2', label: 'Midnight Rose Night Balm', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f3', label: 'Santal & Amber Perfumes', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f4', label: 'Peptide Hydration Lip Care', type: 'link', url: `${prefix}/collections`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_care_${tenantSlug}`,
        title: `${name} Customer Care`,
        slug: 'footer-menu-care',
        items: [
          { id: 'nav_care_1', label: 'Clean Botanical Standards', type: 'link', url: `${prefix}/about`, isVisible: true },
          { id: 'nav_care_2', label: 'Dermatologist Testing', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_3', label: 'Sample With Every Order', type: 'link', url: `${prefix}/shipping`, isVisible: true },
          { id: 'nav_care_4', label: 'Eco Glass Recycling', type: 'link', url: `${prefix}/about`, isVisible: true },
        ],
      },
    ];
  }

  // 5. 🏃 SPORTS & ACTIVEWEAR
  if (cat.includes('active') || cat.includes('sport') || cat.includes('gym') || cat.includes('fit') || cat.includes('apex')) {
    return [
      {
        id: `menu_header_${tenantSlug}`,
        title: `${name} Header Navigation`,
        slug: 'header-menu',
        items: [
          { id: 'nav_1', label: 'CARBON SPEED RUNNERS', type: 'link', url: `${prefix}/collections/footwear`, isVisible: true },
          { id: 'nav_2', label: 'COMPRESSIVE LEGGINGS', type: 'link', url: `${prefix}/collections/leggings`, isVisible: true },
          { id: 'nav_3', label: 'STORM-PROOF JACKETS', type: 'link', url: `${prefix}/collections/jackets`, isVisible: true },
          { id: 'nav_4', label: 'PRECISION KETTLEBELLS', type: 'link', url: `${prefix}/collections/equipment`, isVisible: true },
          { id: 'nav_5', label: 'TRAINING LAB', type: 'link', url: `${prefix}/lab`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_shop_${tenantSlug}`,
        title: `${name} Footer Shop Links`,
        slug: 'footer-menu-shop',
        items: [
          { id: 'nav_f1', label: 'AeroFoam Speed Trainers', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f2', label: 'High-Rise Seamless Tights', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f3', label: 'Hyper-Vent Shell Jackets', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f4', label: 'Cast Iron Kettlebells', type: 'link', url: `${prefix}/collections`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_care_${tenantSlug}`,
        title: `${name} Customer Care`,
        slug: 'footer-menu-care',
        items: [
          { id: 'nav_care_1', label: '30-Day Sweat Test Trial', type: 'link', url: `${prefix}/returns`, isVisible: true },
          { id: 'nav_care_2', label: 'Compression Sizing Chart', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_3', label: 'Recycled Fiber Provenance', type: 'link', url: `${prefix}/about`, isVisible: true },
          { id: 'nav_care_4', label: 'Free Exchanges & Transit', type: 'link', url: `${prefix}/shipping`, isVisible: true },
        ],
      },
    ];
  }

  // 6. 🛋️ HOME & LIVING
  if (cat.includes('home') || cat.includes('furn') || cat.includes('decor') || cat.includes('living') || cat.includes('aura')) {
    return [
      {
        id: `menu_header_${tenantSlug}`,
        title: `${name} Header Navigation`,
        slug: 'header-menu',
        items: [
          { id: 'nav_1', label: 'MODULAR SOFAS', type: 'link', url: `${prefix}/collections/sofas`, isVisible: true },
          { id: 'nav_2', label: 'SOLID OAK DINING', type: 'link', url: `${prefix}/collections/dining`, isVisible: true },
          { id: 'nav_3', label: 'SCULPTURAL LIGHTING', type: 'link', url: `${prefix}/collections/lighting`, isVisible: true },
          { id: 'nav_4', label: 'HAND-WOVEN RUGS', type: 'link', url: `${prefix}/collections/rugs`, isVisible: true },
          { id: 'nav_5', label: 'INTERIOR CONSULTATION', type: 'link', url: `${prefix}/contact`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_shop_${tenantSlug}`,
        title: `${name} Footer Shop Links`,
        slug: 'footer-menu-shop',
        items: [
          { id: 'nav_f1', label: 'Modular Linen Sectionals', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f2', label: 'Fluted Ceramic Table Lamps', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f3', label: 'Brushed Brass Pendant Chandeliers', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f4', label: 'Belgian Linen Cushion Covers', type: 'link', url: `${prefix}/collections`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_care_${tenantSlug}`,
        title: `${name} Customer Care`,
        slug: 'footer-menu-care',
        items: [
          { id: 'nav_care_1', label: 'White Glove Room Placement', type: 'link', url: `${prefix}/shipping`, isVisible: true },
          { id: 'nav_care_2', label: 'FSC-Certified Hardwoods', type: 'link', url: `${prefix}/about`, isVisible: true },
          { id: 'nav_care_3', label: 'Fabric & Leather Care Guide', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_4', label: '30-Day In-Home Return Trial', type: 'link', url: `${prefix}/returns`, isVisible: true },
        ],
      },
    ];
  }

  // 7. 👟 FOOTWEAR & SNEAKERS
  if (cat.includes('shoe') || cat.includes('sneaker') || cat.includes('footwear') || cat.includes('kick')) {
    return [
      {
        id: `menu_header_${tenantSlug}`,
        title: `${name} Header Navigation`,
        slug: 'header-menu',
        items: [
          { id: 'nav_1', label: 'RETRO HIGH-TOPS', type: 'link', url: `${prefix}/collections/high-tops`, isVisible: true },
          { id: 'nav_2', label: 'CARBON MARATHON RUNNERS', type: 'link', url: `${prefix}/collections/running`, isVisible: true },
          { id: 'nav_3', label: 'ITALIAN CHELSEA BOOTS', type: 'link', url: `${prefix}/collections/boots`, isVisible: true },
          { id: 'nav_4', label: 'LIMITED COLLABORATIONS', type: 'link', url: `${prefix}/collections/collabs`, isVisible: true },
          { id: 'nav_5', label: 'RELEASE CALENDAR', type: 'link', url: `${prefix}/releases`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_shop_${tenantSlug}`,
        title: `${name} Footer Shop Links`,
        slug: 'footer-menu-shop',
        items: [
          { id: 'nav_f1', label: 'Classic Retro Court Sneaker', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f2', label: 'Cloud-Foam Speed Trainers', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f3', label: 'Waxed Suede Chelsea Boots', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f4', label: 'Vulcanized Canvas Low-Tops', type: 'link', url: `${prefix}/collections`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_care_${tenantSlug}`,
        title: `${name} Customer Care`,
        slug: 'footer-menu-care',
        items: [
          { id: 'nav_care_1', label: '100% Deadstock Authenticity', type: 'link', url: `${prefix}/about`, isVisible: true },
          { id: 'nav_care_2', label: 'Sneaker Size Translation Guide', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_3', label: 'Waterproof Sneaker Shield Care', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_4', label: 'Insured Priority Shipping', type: 'link', url: `${prefix}/shipping`, isVisible: true },
        ],
      },
    ];
  }

  // 8. 👗 FASHION & LUXURY APPAREL (Default fallback for apparel brands)
  if (cat.includes('fashion') || cat.includes('cloth') || cat.includes('apparel') || cat.includes('saree') || cat.includes('kurti')) {
    return [
      {
        id: `menu_header_${tenantSlug}`,
        title: `${name} Header Navigation`,
        slug: 'header-menu',
        items: [
          { id: 'nav_1', label: 'NEW ARRIVALS', type: 'link', url: `${prefix}/collections/new-arrivals`, isVisible: true },
          { id: 'nav_2', label: 'SILK SAREES', type: 'link', url: `${prefix}/collections/sarees`, isVisible: true },
          { id: 'nav_3', label: 'KURTIS & TUNICS', type: 'link', url: `${prefix}/collections/kurtis`, isVisible: true },
          { id: 'nav_4', label: 'BRIDAL LEHENGAS', type: 'link', url: `${prefix}/collections/bridal`, isVisible: true },
          { id: 'nav_5', label: 'FESTIVE EDIT', type: 'link', url: `${prefix}/collections/festive`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_shop_${tenantSlug}`,
        title: `${name} Footer Shop Links`,
        slug: 'footer-menu-shop',
        items: [
          { id: 'nav_f1', label: 'Banarasi Silk Sarees', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f2', label: 'Hand-Embroidered Kurtis', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f3', label: 'Wedding Anarkalis', type: 'link', url: `${prefix}/collections`, isVisible: true },
          { id: 'nav_f4', label: 'Chanderi Festive Dupattas', type: 'link', url: `${prefix}/collections`, isVisible: true },
        ],
      },
      {
        id: `menu_footer_care_${tenantSlug}`,
        title: `${name} Customer Care`,
        slug: 'footer-menu-care',
        items: [
          { id: 'nav_care_1', label: 'Custom Tailoring & Blouse Sizing', type: 'link', url: `${prefix}/faq`, isVisible: true },
          { id: 'nav_care_2', label: 'Pure Silk Care & Storage', type: 'link', url: `${prefix}/about`, isVisible: true },
          { id: 'nav_care_3', label: 'Worldwide Insured Dispatch', type: 'link', url: `${prefix}/shipping`, isVisible: true },
          { id: 'nav_care_4', label: '7-Day Easy Exchange Policy', type: 'link', url: `${prefix}/returns`, isVisible: true },
        ],
      },
    ];
  }

  // 9. 🛍️ UNIVERSAL MULTI-PURPOSE MEGASTORE
  return [
    {
      id: `menu_header_${tenantSlug}`,
      title: `${name} Header Navigation`,
      slug: 'header-menu',
      items: [
        { id: 'nav_1', label: 'ALL PRODUCTS', type: 'collection', url: `${prefix}/collections`, isVisible: true },
        { id: 'nav_2', label: 'FEATURED COLLECTIONS', type: 'collection', url: `${prefix}/collections`, isVisible: true },
        { id: 'nav_3', label: 'BEST SELLERS', type: 'collection', url: `${prefix}/collections`, isVisible: true },
        { id: 'nav_4', label: 'NEW ARRIVALS', type: 'collection', url: `${prefix}/collections`, isVisible: true },
        { id: 'nav_5', label: 'SPECIAL OFFERS', type: 'collection', url: `${prefix}/sale`, isVisible: true },
      ],
    },
    {
      id: `menu_footer_shop_${tenantSlug}`,
      title: `${name} Footer Shop Links`,
      slug: 'footer-menu-shop',
      items: [
        { id: 'nav_f1', label: 'Featured Collections', type: 'collection', url: `${prefix}/collections`, isVisible: true },
        { id: 'nav_f2', label: 'Trending This Week', type: 'collection', url: `${prefix}/collections`, isVisible: true },
        { id: 'nav_f3', label: 'Catalog Directory', type: 'collection', url: `${prefix}/collections`, isVisible: true },
        { id: 'nav_f4', label: 'Seasonal Lookbook', type: 'collection', url: `${prefix}/collections`, isVisible: true },
      ],
    },
    {
      id: `menu_footer_care_${tenantSlug}`,
      title: `${name} Customer Care`,
      slug: 'footer-menu-care',
      items: [
        { id: 'nav_care_1', label: 'Customer Concierge & Help', type: 'page', url: `${prefix}/contact`, isVisible: true },
        { id: 'nav_care_2', label: 'Shipping & Delivery Timelines', type: 'page', url: `${prefix}/shipping`, isVisible: true },
        { id: 'nav_care_3', label: 'Hassle-Free Returns & Warranty', type: 'page', url: `${prefix}/returns`, isVisible: true },
        { id: 'nav_care_4', label: 'Frequently Asked Questions', type: 'page', url: `${prefix}/faq`, isVisible: true },
      ],
    },
  ];
}

export class NavigationService {
  private static localMenus: NavigationMenu[] = [];

  static async getAll(targetTenantSlug?: string): Promise<NavigationMenu[]> {
    const activeTenant = PlatformService.getActiveTenant();
    const effectiveSlug = (
      targetTenantSlug ||
      activeTenant?.slug ||
      PlatformService.getActiveTenantId()
    )
      .replace(/^store_/, '')
      .toLowerCase()
      .trim();

    try {
      const res = await ApiClient.get<any[]>(`/api/v1/content/menus?tenant=${encodeURIComponent(effectiveSlug)}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        this.localMenus = res.data.map(normalizeMenu);
        return this.localMenus;
      }
    } catch (err) {
      console.warn('[NavigationService] API fetch notice, using category blueprint fallback:', err);
    }

    // Category-aligned blueprint fallback
    this.localMenus = getCategoryFallbackMenus(
      activeTenant?.category || activeTenant?.preset,
      activeTenant?.name,
      effectiveSlug
    );
    return this.localMenus;
  }

  static async updateMenu(id: string, items: NavigationItem[], targetTenantSlug?: string): Promise<NavigationMenu> {
    const activeTenant = PlatformService.getActiveTenant();
    const effectiveSlug = (
      targetTenantSlug ||
      activeTenant?.slug ||
      PlatformService.getActiveTenantId()
    )
      .replace(/^store_/, '')
      .toLowerCase()
      .trim();

    const targetMenu = this.localMenus.find((m) => m.id === id || m.slug === id);
    const code = targetMenu?.slug || id;

    try {
      await ApiClient.put(`/api/v1/content/menus/code/${code}?tenant=${encodeURIComponent(effectiveSlug)}`, {
        items,
        tenantSlug: effectiveSlug,
      });
    } catch (err) {
      console.warn('[NavigationService] PUT menu notice:', err);
    }

    this.localMenus = this.localMenus.map((m) =>
      m.id === id || m.slug === id ? { ...m, items } : m
    );
    const updated = this.localMenus.find((m) => m.id === id || m.slug === id);
    if (!updated) throw new Error('Menu not found');
    return updated;
  }
}
