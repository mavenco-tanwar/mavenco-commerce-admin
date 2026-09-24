import { ApiClient } from './api';

export interface TenantPlan {
  id: string;
  name: string;
  code: 'starter' | 'pro' | 'enterprise';
  oneTimeFeeInr: number;
  oneTimeFeeUsd: number;
  annualMaintenanceInr: number;
  monthlyEquivalentInr: number;
  domainPolicy: string;
  maxProducts: number;
  maxOrdersMonthly: number;
  maxStorageMb: number;
  maxStaff: number;
  features: Record<string, boolean>;
  cloudCostBreakdown: {
    mongodbAtlas: number;
    serverlessHosting: number;
    transactionalMail: number;
    mediaCdn: number;
    platformSupportBuffer: number;
  };
}

export interface TenantDomain {
  id: string;
  domain: string;
  type: 'subdomain' | 'custom' | 'storefront' | 'admin';
  isPrimary: boolean;
  status: 'connected' | 'verifying' | 'pending' | 'failed';
  sslActive: boolean;
  createdAt: string;
}

export interface TenantStore {
  id: string;
  name: string;
  slug: string;
  code: string;
  tagline: string;
  status: 'active' | 'trial' | 'suspended' | 'provisioning' | 'archived';
  planId: string;
  planName: string;
  features?: Record<string, boolean>;
  databaseName: string;
  currency: string;
  ownerEmail: string;
  ownerName: string;
  primaryDomain: string;
  adminCustomDomain?: string;
  domains: TenantDomain[];
  category?: string;
  preset?: string;
  categoryLabel?: string;
  navLinks?: Array<{ label: string; href: string; badge?: string }>;
  footerShopLinks?: Array<{ label: string; href: string }>;
  footerCareLinks?: Array<{ label: string; href: string }>;
  theme: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headingFont: string;
    bodyFont: string;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  };
  metrics: {
    products: number;
    orders: number;
    customers: number;
    monthlyRevenue: number;
    storageUsedMb: number;
    categories?: number;
    collections?: number;
  };
  password?: string;
  temporaryPassword?: string;
  isTemporaryPassword?: boolean;
  passwordUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformBroadcast {
  id: string;
  message: string;
  type: 'info' | 'warning';
  status?: 'active' | 'archived';
  active?: boolean;
  publishedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformActivityLog {
  id: string;
  event: string;
  actor: string;
  tenantId?: string;
  tenantName?: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  createdAt?: string;
}

export interface PlatformInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  brandName?: string;
  interestedPlan?: string;
  message?: string;
  source: string;
  status: 'new' | 'contacted' | 'provisioned' | 'archived';
  createdAt: string;
  ipAddress?: string;
}

export interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  mrrInr: number;
  mrrUsd: number;
  totalProducts: number;
  totalOrders: number;
  totalPlatformSalesInr: number;
  totalPlatformSalesUsd: number;
  systemHealth: {
    status: 'healthy' | 'degraded' | 'maintenance';
    uptimePercentage: number;
    apiLatencyMs: number;
    dbClusterStatus: string;
  };
}

export interface PlatformModuleMeta {
  key: string;
  name: string;
  category: "Catalog" | "Sales & Ops" | "Customers" | "Marketing & AI" | "CMS & Design" | "Ecosystem & Developers" | "Governance";
  desc: string;
}

export const ALL_PLATFORM_MODULES: PlatformModuleMeta[] = [
  // 1. Catalog & Products
  { key: "products", name: "Products & SKUs", category: "Catalog", desc: "Product catalog, multidimensional variants & inventory sync" },
  { key: "categories", name: "Categories & Taxonomy", category: "Catalog", desc: "Hierarchical categories and taxonomy filters" },
  { key: "collections", name: "Collections & Merchandising", category: "Catalog", desc: "Manual & automated curated product collections" },
  { key: "inventory", name: "Inventory & Warehouses", category: "Catalog", desc: "Multi-location inventory tracking & transfer alerts" },

  // 2. Sales & Operations
  { key: "orders", name: "Orders & Fulfillment", category: "Sales & Ops", desc: "Order tracking, processing workflows & dispatch" },
  { key: "shipping", name: "Shipping & Logistics", category: "Sales & Ops", desc: "Carrier integrations, zone rules & live delivery rates" },
  { key: "returns", name: "Returns & Refunds", category: "Sales & Ops", desc: "Return authorizations, size exchanges & refund approvals" },
  { key: "invoices", name: "Invoices & Documents", category: "Sales & Ops", desc: "Automated GST/VAT compliance invoices & PDF series" },
  { key: "payments", name: "Payment Gateways Orchestration", category: "Sales & Ops", desc: "Razorpay, Stripe, COD & unified checkout gateways" },
  { key: "finance", name: "Finance & General Ledger", category: "Sales & Ops", desc: "Double-entry platform ledger, payouts & settlements" },
  { key: "tax", name: "Tax & Compliance", category: "Sales & Ops", desc: "Automated GST/VAT rates, nexus rules & tax exemptions" },

  // 3. Customers & Loyalty
  { key: "customers", name: "Customers & CRM", category: "Customers", desc: "Customer directory, 360-degree purchase history & tags" },
  { key: "reviews", name: "Customer Reviews & UGC", category: "Customers", desc: "Verified buyer reviews, star ratings & moderation" },
  { key: "loyalty", name: "Loyalty & VIP Club", category: "Customers", desc: "Points earn/burn program, VIP tiers & client wallet" },
  { key: "giftCards", name: "Gift Cards & Store Credit", category: "Customers", desc: "Digital vouchers, store credit & gift certificates" },

  // 4. Marketing & AI
  { key: "marketing", name: "Marketing Automations", category: "Marketing & AI", desc: "Lifecycle marketing, event journeys & triggers" },
  { key: "communications", name: "Omnichannel Communications", category: "Marketing & AI", desc: "Transactional SMS, WhatsApp alerts & broadcast notifications" },
  { key: "discounts", name: "Discounts & Rule Engine", category: "Marketing & AI", desc: "BOGO, percentage, fixed amount & automatic discounts" },
  { key: "abandonedCart", name: "Abandoned Cart Recovery", category: "Marketing & AI", desc: "Automated recovery emails, SMS nudges & analytics" },
  { key: "campaigns", name: "Marketing Campaigns", category: "Marketing & AI", desc: "Seasonal promotional blast broadcasts & analytics" },
  { key: "coupons", name: "Coupons & Vouchers", category: "Marketing & AI", desc: "Single-use and bulk promotional voucher generation" },
  { key: "seoSettings", name: "SEO Settings & Studio", category: "Marketing & AI", desc: "Custom meta tags, OpenGraph previews & XML sitemaps" },
  { key: "search", name: "Search & Product Discovery", category: "Marketing & AI", desc: "Instant search, autocomplete, synonyms & merchandising rules" },
  { key: "ai", name: "AI Copywriting & Intelligence Studio", category: "Marketing & AI", desc: "Generative product descriptions, visual tags & smart suggestions" },
  { key: "analytics", name: "Advanced Funnel Analytics", category: "Marketing & AI", desc: "Multi-touch attribution, conversion funnels & retention cohorts" },

  // 5. CMS & Design
  { key: "themeStudio", name: "Theme & Design Studio", category: "CMS & Design", desc: "Theme colors, typography, layout tokens & appearance" },
  { key: "productCards", name: "Product Card Builder", category: "CMS & Design", desc: "Custom product card hover badges, swatches & CTAs" },
  { key: "headerBuilder", name: "Header & Navbar Builder", category: "CMS & Design", desc: "Visual mega menu, announcement bar & header layout studio" },
  { key: "footerBuilder", name: "Footer Builder", category: "CMS & Design", desc: "Multi-column footer layout designer & legal links" },
  { key: "homepageBuilder", name: "Homepage Visual Builder", category: "CMS & Design", desc: "Drag-and-drop section builder with real-time preview" },
  { key: "collectionsBuilder", name: "Collection Pages Studio", category: "CMS & Design", desc: "PLP product grid layouts, banner hero & filter sidebar" },
  { key: "productPageBuilder", name: "Product Page Builder", category: "CMS & Design", desc: "PDP layout designer with sticky add-to-cart & tabs" },
  { key: "customPages", name: "Custom Pages Studio", category: "CMS & Design", desc: "About, Contact, FAQ & custom markdown landing pages" },
  { key: "richCms", name: "Visual Drag-Drop CMS & Blocks", category: "CMS & Design", desc: "Modular block library, promotional banners & widgets" },
  { key: "media", name: "Media Library & CDN", category: "CMS & Design", desc: "Cloud media asset management, WebP optimization & CDN" },
  { key: "navigation", name: "Navigation Menus", category: "CMS & Design", desc: "Header, footer & mobile navigation menu trees" },

  // 6. Ecosystem & Developers
  { key: "multiStore", name: "Multi-Store & Fleet Management", category: "Ecosystem & Developers", desc: "Multi-tenant store branches, domain partitioning & localized stores" },
  { key: "channels", name: "Channels & Headless Commerce", category: "Ecosystem & Developers", desc: "Headless storefront SDK, mobile app & marketplace feeds" },
  { key: "customDomains", name: "Custom Domains & SSL Ingress", category: "Ecosystem & Developers", desc: "White-label custom domain binding with automatic TLS certs" },
  { key: "apiAccess", name: "REST API & Webhooks Engine", category: "Ecosystem & Developers", desc: "API key management, webhook dispatchers & developer logs" },
  { key: "integrations", name: "Integration Hub & Connectors", category: "Ecosystem & Developers", desc: "Third-party accounting, CRM, ERP & courier connectors" },
  { key: "automations", name: "No-Code Workflow Automations", category: "Ecosystem & Developers", desc: "Event-driven triggers, conditional filters & webhook actions" },
  { key: "apps", name: "App Marketplace", category: "Ecosystem & Developers", desc: "1-click modular SaaS plugins & add-on extensions" },
  { key: "developers", name: "Developer Portal & Sandbox", category: "Ecosystem & Developers", desc: "Interactive API documentation, SDKs & sandbox tester" },

  // 7. Governance
  { key: "users", name: "Admin Users & Team Access", category: "Governance", desc: "Multi-user staff accounts & login credentials" },
  { key: "roles", name: "Roles & Fine-Grained RBAC", category: "Governance", desc: "Custom roles, granular permission matrices & policy guards" },
  { key: "activity", name: "Audit Activity Logs", category: "Governance", desc: "Immutable platform activity audit trail & security monitoring" },
  { key: "billing", name: "Plans & SaaS Billing Console", category: "Governance", desc: "Merchant plan subscription self-service & server renewal" },
];

export function getDefaultFeaturesForPlan(planId: string = "plan_pro"): Record<string, boolean> {
  const allKeys = ALL_PLATFORM_MODULES.map(m => m.key);
  const result: Record<string, boolean> = {};

  if (planId === "plan_enterprise") {
    allKeys.forEach(k => { result[k] = true; });
    return result;
  }

  if (planId === "plan_pro") {
    const disabledForPro = new Set(["multiStore", "channels", "finance", "communications", "automations", "apps", "developers", "activity"]);
    allKeys.forEach(k => {
      result[k] = !disabledForPro.has(k);
    });
    return result;
  }

  // Starter Boutique: Essential retail core only
  const starterEnabled = new Set([
    "products", "categories", "collections", "inventory",
    "orders", "shipping", "returns", "invoices", "payments", "tax",
    "customers", "reviews", "discounts", "coupons",
    "themeStudio", "productCards", "headerBuilder", "footerBuilder",
    "homepageBuilder", "customPages", "richCms", "media", "navigation",
    "users", "billing"
  ]);
  allKeys.forEach(k => {
    result[k] = starterEnabled.has(k);
  });
  return result;
}

export const INITIAL_PLANS: TenantPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter Boutique',
    code: 'starter',
    oneTimeFeeInr: 24999,
    oneTimeFeeUsd: 329,
    annualMaintenanceInr: 24000,
    monthlyEquivalentInr: 2000,
    domainPolicy: 'Custom domain renewal billed separately (excl.)',
    maxProducts: 250,
    maxOrdersMonthly: 1000,
    maxStorageMb: 2048,
    maxStaff: 3,
    features: getDefaultFeaturesForPlan('plan_starter'),
    cloudCostBreakdown: {
      mongodbAtlas: 300,
      serverlessHosting: 400,
      transactionalMail: 150,
      mediaCdn: 250,
      platformSupportBuffer: 900,
    },
  },
  {
    id: 'plan_pro',
    name: 'Professional Scale',
    code: 'pro',
    oneTimeFeeInr: 49999,
    oneTimeFeeUsd: 699,
    annualMaintenanceInr: 48000,
    monthlyEquivalentInr: 4000,
    domainPolicy: 'Custom domain renewal billed separately (excl.)',
    maxProducts: 2500,
    maxOrdersMonthly: 10000,
    maxStorageMb: 10240,
    maxStaff: 15,
    features: getDefaultFeaturesForPlan('plan_pro'),
    cloudCostBreakdown: {
      mongodbAtlas: 500,
      serverlessHosting: 800,
      transactionalMail: 300,
      mediaCdn: 500,
      platformSupportBuffer: 1900,
    },
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Global',
    code: 'enterprise',
    oneTimeFeeInr: 139999,
    oneTimeFeeUsd: 1899,
    annualMaintenanceInr: 96000,
    monthlyEquivalentInr: 8000,
    domainPolicy: 'Custom domain renewal billed separately (excl.)',
    maxProducts: 50000,
    maxOrdersMonthly: 250000,
    maxStorageMb: 102400,
    maxStaff: 100,
    features: getDefaultFeaturesForPlan('plan_enterprise'),
    cloudCostBreakdown: {
      mongodbAtlas: 1200,
      serverlessHosting: 1800,
      transactionalMail: 600,
      mediaCdn: 1400,
      platformSupportBuffer: 3000,
    },
  },
];

export const INITIAL_TENANTS: TenantStore[] = [];

export const INITIAL_ACTIVITY_LOGS: PlatformActivityLog[] = [];

const PLATFORM_STORAGE_KEY = 'jq_saas_platform_tenants_v1';
const CURRENT_STORE_KEY = 'jq_saas_active_tenant_id';
const IMPERSONATION_KEY = 'jq_saas_impersonation_state';

export class PlatformService {
  public static async seedTenant(tenantSlug: string, preset: string = 'apparel'): Promise<any> {
    const seedPayload = { tenantSlug, preset };

    // 1. Trigger Storefront seed API if reachable
    try {
      const storefrontUrl =
        (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_STOREFRONT_URL) ||
        process.env.NEXT_PUBLIC_STOREFRONT_URL ||
        'http://localhost:3000';
      await fetch(`${storefrontUrl}/api/v1/platform/tenants/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seedPayload),
      }).catch(() => {});
    } catch (sfErr) {
      console.warn('[PlatformService.seedTenant] Storefront seed notice:', sfErr);
    }

    // 2. Trigger Admin API seed route for direct database synchronization
    try {
      const res = await ApiClient.post('/api/v1/platform/tenants/seed', seedPayload);
      if (res && res.success) return res;
    } catch (err) {
      console.warn('Primary platform seed failed, using products/seed fallback:', err);
    }
    return await ApiClient.post('/api/v1/products/seed', seedPayload);
  }

  public static getPlatformModules(): PlatformModuleMeta[] {
    return ALL_PLATFORM_MODULES;
  }

  public static getDefaultFeaturesForPlan(planId: string): Record<string, boolean> {
    return getDefaultFeaturesForPlan(planId);
  }

  private static tenants: TenantStore[] = this.loadTenants();
  private static loadPlans(): TenantPlan[] {
    if (typeof window === 'undefined') return INITIAL_PLANS;
    try {
      const stored = localStorage.getItem('jq_platform_plans_v4');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PLANS;
  }

  private static savePlans(plans: TenantPlan[]) {
    this.plans = plans;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jq_platform_plans_v4', JSON.stringify(plans));
      } catch {}
    }
  }

  private static plans: TenantPlan[] = this.loadPlans();
  private static activities: PlatformActivityLog[] = INITIAL_ACTIVITY_LOGS;

    public static filterForClientUser(tenants: TenantStore[]): TenantStore[] {
    if (!Array.isArray(tenants)) return [];
    // Purge any stale mock lumina store
    const cleaned = tenants.filter(t => t.slug !== 'lumina' && t.id !== 'store_lumina');
    if (typeof window === 'undefined') return cleaned;
    try {
      if (window.location.pathname.startsWith('/platform')) {
        return cleaned;
      }
      const userRaw = localStorage.getItem('jq_admin_user');
      if (!userRaw) return cleaned;
      const u = JSON.parse(userRaw);
      const isSuper =
        u.role === 'superadmin' ||
        u.roleId === 'role_superadmin' ||
        (u.email && (u.email.toLowerCase().includes('superadmin') || u.email.toLowerCase() === 'admin@mavenco.com'));
      if (isSuper) return cleaned;

      if (u.tenantSlug && u.tenantSlug !== 'all') {
        const clean = u.tenantSlug.toLowerCase().trim();
        const matched = cleaned.filter(
          (t) =>
            t.slug.toLowerCase() === clean ||
            t.id.toLowerCase().includes(clean) ||
            (t.ownerEmail && t.ownerEmail.toLowerCase() === (u.email || '').toLowerCase())
        );
        if (matched.length > 0) return matched;
      }
    } catch {}
    return cleaned;
  }

  private static loadTenants(): TenantStore[] {

    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(PLATFORM_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(t => t.slug !== "lumina" && t.id !== "store_lumina");
          if (window.location.pathname.startsWith("/platform")) return cleaned;
          return cleaned;
        }
      }
    } catch {}
    return [];
  }

  public static async fetchTenantsFromDb(): Promise<TenantStore[]> {
    try {
      const res = await ApiClient.get<TenantStore[]>('/api/v1/platform/tenants', { bypassCache: true });
      const list = res?.data || [];
      if (Array.isArray(list)) {
        this.saveTenants(list);
        const cleaned = list.filter(t => t.slug !== "lumina" && t.id !== "store_lumina");
        return cleaned;
      }
    } catch (err) {
      console.warn('Failed to fetch tenants from MongoDB Atlas:', err);
    }
    return this.loadTenants();
  }

  private static saveTenants(list: TenantStore[]) {
    this.tenants = list;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify(list));
      } catch {}
    }
  }

  public static updateTenant(tenantId: string, updates: Partial<TenantStore>): TenantStore | null {
    const list = this.loadTenants();
    const idx = list.findIndex((t) => t.id === tenantId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      theme: {
        ...list[idx].theme,
        ...(updates.theme || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    this.saveTenants(list);
    return list[idx];
  }

  public static getAllTenants(): TenantStore[] {
    return this.loadTenants();
  }

  // Active Store Context (Tenant Switcher)
  public static getActiveTenantId(): string {
    if (typeof window === 'undefined') return 'store_jq-trends';

    // 1. Check active impersonation session
    try {
      const impRaw = localStorage.getItem(IMPERSONATION_KEY);
      if (impRaw) {
        const imp = JSON.parse(impRaw);
        if (imp && (imp.id || imp.slug)) {
          return imp.id || `store_${imp.slug}`;
        }
      }
    } catch {}

    // 2. Check URL path for /stores/[slug] or /tenant/[slug]
    const pathMatch = window.location.pathname.match(/^\/(stores|tenant)\/([a-zA-Z0-9_-]+)/);
    if (pathMatch) {
      const slug = pathMatch[2].toLowerCase();
      if (slug !== 'lumina') {
        const match = this.tenants.find((t) => t.slug.toLowerCase() === slug || t.id.toLowerCase() === slug);
        if (match) {
          localStorage.setItem(CURRENT_STORE_KEY, match.id);
          localStorage.setItem('jq_saas_active_tenant_slug', match.slug);
          return match.id;
        }
        return `store_${slug}`;
      }
    }

    // 3. Check search params ?tenant=[slug]
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant');
    if (tenantParam && tenantParam.toLowerCase() !== 'lumina') {
      const clean = tenantParam.toLowerCase().trim();
      const match = this.tenants.find(
        (t) => t.slug.toLowerCase() === clean || t.id.toLowerCase() === clean
      );
      if (match) {
        localStorage.setItem(CURRENT_STORE_KEY, match.id);
        localStorage.setItem('jq_saas_active_tenant_slug', match.slug);
        return match.id;
      }
      return clean.startsWith('store_') ? clean : `store_${clean}`;
    }

    // 4. Stored active tenant ID (highest priority for user who switched stores)
    const storedActive = localStorage.getItem(CURRENT_STORE_KEY);
    if (storedActive && storedActive !== 'store_lumina' && storedActive !== 'lumina' && storedActive !== 'store_demo' && storedActive !== 'demo') {
      return storedActive;
    }

    const storedSlug = localStorage.getItem('jq_saas_active_tenant_slug');
    if (storedSlug && storedSlug !== 'all' && storedSlug !== 'lumina') {
      return storedSlug.startsWith('store_') ? storedSlug : `store_${storedSlug}`;
    }

    // 5. Check logged-in user tenant affiliation
    try {
      const userRaw = localStorage.getItem('jq_admin_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.tenantSlug && u.tenantSlug !== 'all' && u.tenantSlug !== 'lumina') {
          const clean = u.tenantSlug.toLowerCase().trim();
          const targetId = u.tenantId || `store_${clean}`;
          return targetId;
        }
      }
    } catch {}

    return 'store_jq-trends';
  }

  public static setActiveTenantId(tenantId: string): void {
    if (typeof window !== 'undefined') {
      const cleanSlug = tenantId.replace(/^store_/, '').toLowerCase().trim();
      const normalizedId = tenantId.startsWith('store_') ? tenantId : `store_${tenantId}`;
      localStorage.setItem(CURRENT_STORE_KEY, normalizedId);
      localStorage.setItem('jq_saas_active_tenant_slug', cleanSlug);
      window.dispatchEvent(new Event('tenant_updated'));
    }
  }

  public static getDefaultTenant(): TenantStore {
    return {
      id: 'store_jq-trends',
      name: 'JQ Trends',
      slug: 'jq-trends',
      code: 'JQ',
      tagline: 'Modern Headless Commerce Store',
      status: 'active',
      planId: 'plan_enterprise',
      planName: 'Enterprise Global',
      databaseName: 'tenant_jq-trends',
      currency: 'INR',
      ownerEmail: 'admin@jqtrends.com',
      ownerName: 'Store Admin',
      primaryDomain: 'jqtrends.com',
      domains: [],
      theme: {
        primaryColor: '#e11d48',
        secondaryColor: '#FFFFFF',
        accentColor: '#4f46e5',
        headingFont: 'Playfair Display',
        bodyFont: 'Plus Jakarta Sans',
        borderRadius: 'md',
      },
      metrics: { products: 2, orders: 0, customers: 0, monthlyRevenue: 0, storageUsedMb: 12 },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
  }

  public static getActiveTenant(): TenantStore {
    const list = this.loadTenants();
    const activeId = this.getActiveTenantId();
    const cleanSlug = activeId.replace(/^store_/, '').toLowerCase().trim();

    // 1. Primary check: Locate the store matching the actively selected tenant ID / slug
    const found =
      list.find(
        (t) =>
          t.slug !== 'lumina' &&
          t.id !== 'store_lumina' &&
          (t.id.toLowerCase() === activeId.toLowerCase() ||
            t.slug.toLowerCase() === cleanSlug ||
            t.id.toLowerCase() === `store_${cleanSlug}` ||
            (t.code && t.code.toLowerCase() === cleanSlug))
      );
    if (found) return found;

    // 2. Check active impersonation session
    if (typeof window !== 'undefined') {
      try {
        const impRaw = localStorage.getItem(IMPERSONATION_KEY);
        if (impRaw) {
          const imp = JSON.parse(impRaw);
          if (imp && (imp.id || imp.slug)) return imp;
        }
      } catch {}
    }

    // 3. Fallback: check logged-in user credentials if activeId was not found in registered list
    if (typeof window !== 'undefined') {
      const userRaw = localStorage.getItem('jq_admin_user');
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          if (u.tenantSlug && u.tenantSlug !== 'all' && u.tenantSlug !== 'lumina') {
            const clean = u.tenantSlug.toLowerCase().trim();
            const clientStore = list.find(
              (t) =>
                t.slug.toLowerCase() === clean ||
                t.id.toLowerCase().includes(clean) ||
                (t.ownerEmail && t.ownerEmail.toLowerCase() === (u.email || '').toLowerCase())
            );
            if (clientStore) return clientStore;
          }
        } catch {}
      }
    }

    if (cleanSlug === 'muskan-clothing-store' || cleanSlug === 'muskan-clothing') {
      return {
        id: 'store_muskan-clothing-store',
        name: 'Muskan Clothing Store',
        slug: 'muskan-clothing-store',
        code: 'MUSK',
        tagline: 'Luxury Boutique Fashion',
        status: 'active',
        planId: 'plan_starter',
        planName: 'Starter Boutique',
        databaseName: 'tenant_muskan-clothing-store',
        currency: 'INR',
        ownerEmail: 'muskan@clothing.com',
        ownerName: 'Muskan Tanwar',
        primaryDomain: 'muskanclothing.ourplatform.com',
        domains: [],
        theme: {
          primaryColor: '#e11d48',
          secondaryColor: '#FFFFFF',
          accentColor: '#58587e',
          headingFont: 'Playfair Display',
          bodyFont: 'Plus Jakarta Sans',
          borderRadius: 'md',
        },
        metrics: { products: 2, orders: 0, customers: 0, monthlyRevenue: 0, storageUsedMb: 4 },
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
    }

    return {
      id: 'store_jq-trends',
      name: 'JQ Trends',
      slug: 'jq-trends',
      code: 'JQ',
      tagline: 'Modern Headless Commerce Store',
      status: 'active',
      planId: 'plan_enterprise',
      planName: 'Enterprise Global',
      databaseName: 'tenant_jq-trends',
      currency: 'INR',
      ownerEmail: 'admin@jqtrends.com',
      ownerName: 'Store Admin',
      primaryDomain: 'jqtrends.com',
      domains: [],
      theme: {
        primaryColor: '#e11d48',
        secondaryColor: '#FFFFFF',
        accentColor: '#4f46e5',
        headingFont: 'Playfair Display',
        bodyFont: 'Plus Jakarta Sans',
        borderRadius: 'md',
      },
      metrics: { products: 2, orders: 0, customers: 0, monthlyRevenue: 0, storageUsedMb: 12 },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
  }

  // Impersonation Support
  public static getImpersonationState(): { isImpersonating: boolean; tenant?: TenantStore } {
    if (typeof window === 'undefined') return { isImpersonating: false };
    try {
      const raw = localStorage.getItem(IMPERSONATION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { isImpersonating: true, tenant: parsed };
      }
    } catch {}
    return { isImpersonating: false };
  }

  public static startImpersonation(tenant: TenantStore): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(tenant));
      this.setActiveTenantId(tenant.id);
      this.logActivity({
        id: `act_${Date.now()}`,
        event: `Superadmin started impersonation session for ${tenant.name}`,
        actor: 'superadmin@platform.com',
        tenantId: tenant.id,
        tenantName: tenant.name,
        ipAddress: '127.0.0.1',
        severity: 'warning',
        timestamp: 'Just now',
      });
    }
  }

  public static stopImpersonation(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(IMPERSONATION_KEY);
    }
  }

  // Platform Metrics
  public static async getMetrics(): Promise<PlatformMetrics> {
    const list = await this.listTenants();
    const active = list.filter((t) => t.status === 'active').length;
    const trial = list.filter((t) => t.status === 'trial').length;
    const suspended = list.filter((t) => t.status === 'suspended').length;
    const mrrInr = list.reduce((acc, t) => {
      const plan = this.plans.find((p) => p.id === t.planId);
      return acc + (plan ? (plan.monthlyEquivalentInr || 4000) : 4000);
    }, 0);
    const mrrUsd = list.reduce((acc, t) => {
      const plan = this.plans.find((p) => p.id === t.planId);
      return acc + (plan ? Math.round((plan.oneTimeFeeUsd || 799) / 12) : 50);
    }, 0);
    const products = list.reduce((acc, t) => acc + (t.metrics?.products || 0), 0);
    const orders = list.reduce((acc, t) => acc + (t.metrics?.orders || 0), 0);
    const totalPlatformSalesInr = list.reduce((acc, t) => acc + (t.metrics?.monthlyRevenue || 0), 0);

    return {
      totalTenants: list.length,
      activeTenants: active,
      trialTenants: trial,
      suspendedTenants: suspended,
      mrrInr,
      mrrUsd,
      totalProducts: products,
      totalOrders: orders,
      totalPlatformSalesInr,
      totalPlatformSalesUsd: Math.round(totalPlatformSalesInr / 83),
      systemHealth: {
        status: 'healthy',
        uptimePercentage: 99.98,
        apiLatencyMs: 24,
        dbClusterStatus: 'MongoDB Atlas Multi-Region Cluster (Active & Synchronized)',
      },
    };
  }

  public static async listTenants(): Promise<TenantStore[]> {
    try {
      const res = await ApiClient.get<any>('/api/v1/platform/tenants', { bypassCache: true });
      if (res && Array.isArray(res.data)) {
        const dbTenants: TenantStore[] = res.data.map((t: any) => ({
          id: t.id || `store_${t.slug}`,
          name: t.name,
          slug: t.slug,
          code: t.code || t.name.substring(0, 4).toUpperCase(),
          tagline: t.tagline || 'Modern Commerce Store',
          status: t.status || 'active',
          planId: t.planId || 'plan_starter',
          planName: t.planName || 'Starter Boutique',
          databaseName: t.databaseName || `tenant_${t.slug}`,
          currency: t.currency || 'USD',
          ownerEmail: t.ownerEmail || t.contact?.email || t.email || '',
          ownerName: t.ownerName || 'Store Owner',
          primaryDomain: t.primaryDomain || `${t.slug}.com`,
          features: (t.features && Object.keys(t.features).length > 0) ? t.features : PlatformService.getDefaultFeaturesForPlan(t.planId || 'plan_pro'),
          domains: t.domains || [
            {
              id: `dom_${t.slug}`,
              domain: `${t.slug}.com`,
              type: 'custom',
              isPrimary: true,
              status: 'connected',
              sslActive: true,
              createdAt: t.createdAt || new Date().toISOString(),
            },
          ],
          theme: {
            logoUrl: t.theme?.logoUrl || '',
            primaryColor: t.theme?.primaryColor || '#111111',
            secondaryColor: t.theme?.secondaryColor || '#FFFFFF',
            accentColor: t.theme?.accentColor || '#E11D48',
            headingFont: t.theme?.headingFont || 'Playfair Display',
            bodyFont: t.theme?.bodyFont || 'Plus Jakarta Sans',
            borderRadius: t.theme?.borderRadius || 'md',
          },
          metrics: t.metrics || {
            products: 16,
            orders: 24,
            customers: 19,
            monthlyRevenue: 12400,
            storageUsedMb: 28,
          },
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString(),
        }));
        this.saveTenants(dbTenants);
        const cleaned = dbTenants.filter(t => t.slug !== "lumina" && t.id !== "store_lumina");
        if (typeof window !== "undefined" && window.location.pathname.startsWith("/platform")) {
          return cleaned;
        }
        return cleaned;
      }
    } catch (err) {
      console.error('Failed to fetch platform tenants from DB:', err);
    }
    return this.loadTenants();
  }

  public static async getTenantById(id: string): Promise<TenantStore | null> {
    const list = await this.listTenants();
    return list.find((t) => t.id === id || t.slug === id) || null;
  }

  // 5-Step Store Provisioning Engine
  public static async provisionStore(payload: {
    name: string;
    slug: string;
    tagline: string;
    ownerName: string;
    ownerEmail: string;
    currency: string;
    planId: string;
    status?: TenantStore['status'];
    primaryColor?: string;
    accentColor?: string;
    subdomain?: string;
    customDomain?: string;
    temporaryPassword?: string;
    features?: Record<string, boolean>;
    category?: string;
    preset?: string;
    categoryLabel?: string;
    theme?: any;
  }): Promise<TenantStore> {
    const tenantId = `store_${payload.slug.replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const plan = this.plans.find((p) => p.id === payload.planId) || this.plans[1];
    const tempPass = payload.temporaryPassword || `Mavenco@2026!${payload.slug.toLowerCase().trim()}`;
    const storeFeatures = payload.features || plan.features;

    const domains: TenantDomain[] = [
      {
        id: `dom_${Date.now()}_1`,
        domain: `${payload.slug}.ourplatform.com`,
        type: 'subdomain',
        isPrimary: !payload.customDomain,
        status: 'connected',
        sslActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    if (payload.customDomain) {
      domains.push({
        id: `dom_${Date.now()}_2`,
        domain: payload.customDomain.replace(/^https?:\/\//, ''),
        type: 'custom',
        isPrimary: true,
        status: 'verifying',
        sslActive: false,
        createdAt: new Date().toISOString(),
      });
    }

    const newStore: any = {
      id: tenantId,
      name: payload.name,
      slug: payload.slug.toLowerCase().trim(),
      code: payload.name.substring(0, 3).toUpperCase(),
      tagline: payload.tagline || 'Modern Commerce Store',
      status: payload.status || 'active',
      planId: plan.id,
      planName: plan.name,
      features: storeFeatures,
      databaseName: `tenant_${payload.slug.toLowerCase()}`,
      currency: payload.currency || 'USD',
      ownerEmail: payload.ownerEmail,
      ownerName: payload.ownerName,
      temporaryPassword: tempPass,
      password: tempPass,
      isTemporaryPassword: true,
      primaryDomain: payload.customDomain || `${payload.slug}.ourplatform.com`,
      domains,
      category: payload.category || payload.preset,
      preset: payload.preset || payload.category,
      categoryLabel: payload.categoryLabel,
      theme: {
        logoUrl: '',
        primaryColor: payload.primaryColor || payload.theme?.primaryColor || '#0F172A',
        secondaryColor: '#FFFFFF',
        accentColor: payload.accentColor || payload.theme?.accentColor || '#E11D48',
        headingFont: payload.theme?.headingFont || (payload.category === 'jewelry' ? 'Playfair Display' : 'Plus Jakarta Sans'),
        bodyFont: payload.theme?.bodyFont || 'Plus Jakarta Sans',
        borderRadius: payload.theme?.borderRadius || 'md',
        layoutPreset: payload.theme?.layoutPreset || 'flagship_luxury',
        headerLayout: payload.theme?.headerLayout || 'glassmorphism_mega',
        footerLayout: payload.theme?.footerLayout || 'editorial_4_column',
        productCardStyle: payload.theme?.productCardStyle || 'minimal_hover_zoom',
        ...(payload.theme || {}),
      },
      metrics: {
        products: 4,
        orders: 0,
        customers: 0,
        monthlyRevenue: 0,
        storageUsedMb: 12,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = this.loadTenants();
    const updated = [newStore, ...current];
    this.saveTenants(updated);

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `New tenant store ${newStore.name} provisioned with database ${newStore.databaseName}`,
      actor: payload.ownerEmail,
      tenantId: newStore.id,
      tenantName: newStore.name,
      ipAddress: '127.0.0.1',
      severity: 'info',
      timestamp: 'Just now',
    });

    try {
      await ApiClient.post('/api/v1/platform/tenants', newStore);
    } catch {}

    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/v1/platform/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStore),
        });
      }
    } catch {}

    // Real-time sync with storefront API
    try {
      fetch(`https://mavenco-storefront.vercel.app/api/v1/tenant-config?tenant=${newStore.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStore.name,
          slug: newStore.slug,
          tagline: newStore.tagline,
          currency: newStore.currency,
          theme: newStore.theme,
          ownerName: newStore.ownerName,
          ownerEmail: newStore.ownerEmail,
          contact: {
            email: newStore.ownerEmail,
          },
        }),
      }).catch(() => {});
    } catch {}

    return newStore;
  }

  public static async updateTenantStatus(id: string, status: TenantStore['status']): Promise<void> {
    const list = this.loadTenants();
    const updated = list.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
    this.saveTenants(updated);

    const tenant = list.find((t) => t.id === id);

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `Tenant ${tenant?.name || id} status changed to ${status.toUpperCase()}`,
      actor: 'superadmin@platform.com',
      tenantId: id,
      ipAddress: '127.0.0.1',
      severity: status === 'suspended' ? 'critical' : 'info',
      timestamp: 'Just now',
    });

    try {
      await ApiClient.patch(`/api/v1/platform/tenants`, { id, slug: tenant?.slug, status });
    } catch {}

    // Real-time sync with storefront API
    if (tenant?.slug) {
      try {
        await fetch(`https://mavenco-storefront.vercel.app/api/v1/tenant-config?tenant=${tenant.slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      } catch {}
    }
  }

  public static async updateTenantPlan(id: string, planId: string): Promise<void> {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return;

    const list = this.loadTenants();
    const updated = list.map((t) =>
      t.id === id ? { ...t, planId: plan.id, planName: plan.name, updatedAt: new Date().toISOString() } : t
    );
    this.saveTenants(updated);

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `Tenant ${id} plan changed to ${plan.name}`,
      actor: 'superadmin@platform.com',
      tenantId: id,
      ipAddress: '127.0.0.1',
      severity: 'info',
      timestamp: 'Just now',
    });
  }

  public static async updateTenantDetails(
    id: string,
    updates: Partial<Pick<TenantStore, 'name' | 'slug' | 'tagline' | 'currency' | 'ownerEmail' | 'ownerName' | 'planId' | 'status' | 'theme' | 'features' | 'password' | 'temporaryPassword' | 'isTemporaryPassword'>>
  ): Promise<TenantStore | null> {
    const list = this.loadTenants();
    const plan = updates.planId ? this.plans.find((p) => p.id === updates.planId) : null;

    let updatedStore: TenantStore | null = null;
    const updated = list.map((t) => {
      if (t.id === id || t.slug === id) {
        updatedStore = {
          ...t,
          ...updates,
          features: updates.features !== undefined ? updates.features : (t.features || {}),
          planName: plan ? plan.name : t.planName,
          theme: updates.theme ? { ...t.theme, ...updates.theme } : t.theme,
          updatedAt: new Date().toISOString(),
        };
        return updatedStore;
      }
      return t;
    });

    if (updatedStore) {
      this.saveTenants(updated);

      // Notify window of updated tenant features
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tenant_updated', { detail: updatedStore }));
      }

      this.logActivity({
        id: `act_${Date.now()}`,
        event: `Tenant ${(updatedStore as TenantStore).name} configuration & feature flags updated by Superadmin`,
        actor: 'superadmin@mavenco.com',
        tenantId: id,
        tenantName: (updatedStore as TenantStore).name,
        ipAddress: '127.0.0.1',
        severity: 'info',
        timestamp: 'Just now',
      });

      // Synchronize directly with live database API
      try {
        await ApiClient.patch('/api/v1/platform/tenants', {
          tenantId: (updatedStore as TenantStore).slug,
          name: (updatedStore as TenantStore).name,
          tagline: (updatedStore as TenantStore).tagline,
          planId: (updatedStore as TenantStore).planId,
          planName: (updatedStore as TenantStore).planName,
          status: (updatedStore as TenantStore).status,
          currency: (updatedStore as TenantStore).currency,
          theme: (updatedStore as TenantStore).theme,
          features: (updatedStore as TenantStore).features,
          ownerName: (updatedStore as TenantStore).ownerName,
          ownerEmail: (updatedStore as TenantStore).ownerEmail,
          password: (updatedStore as any).password,
          temporaryPassword: (updatedStore as any).temporaryPassword,
          isTemporaryPassword: (updatedStore as any).isTemporaryPassword,
        });
      } catch (err) {
        console.error('Failed to sync tenant updates to MongoDB API:', err);
      }

      try {
        if (typeof window !== 'undefined') {
          await fetch('/api/v1/platform/tenants', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: (updatedStore as TenantStore).id,
              slug: (updatedStore as TenantStore).slug,
              name: (updatedStore as TenantStore).name,
              tagline: (updatedStore as TenantStore).tagline,
              planId: (updatedStore as TenantStore).planId,
              planName: (updatedStore as TenantStore).planName,
              status: (updatedStore as TenantStore).status,
              currency: (updatedStore as TenantStore).currency,
              theme: (updatedStore as TenantStore).theme,
              features: (updatedStore as TenantStore).features,
              ownerName: (updatedStore as TenantStore).ownerName,
              ownerEmail: (updatedStore as TenantStore).ownerEmail,
              password: (updatedStore as any).password,
              temporaryPassword: (updatedStore as any).temporaryPassword,
              isTemporaryPassword: (updatedStore as any).isTemporaryPassword,
            }),
          });
        }
      } catch {}
    }

    return updatedStore;
  }

  public static async deleteTenant(id: string): Promise<boolean> {
    const list = this.loadTenants();
    const tenant = list.find((t) => t.id === id || t.slug === id);
    const targetSlugOrId = tenant?.slug || tenant?.id || id;
    const cleanSlug = targetSlugOrId.replace(/^store_/, '');

    const filtered = list.filter((t) => t.id !== id && t.slug !== id && t.slug !== cleanSlug);
    this.saveTenants(filtered);

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `Tenant ${tenant?.name || cleanSlug} (${tenant?.databaseName || `tenant_${cleanSlug}`}) was deleted by Superadmin`,
      actor: 'superadmin@mavenco.com',
      tenantId: id,
      tenantName: tenant?.name || cleanSlug,
      ipAddress: '127.0.0.1',
      severity: 'critical',
      timestamp: 'Just now',
    });

    // Real-time sync with Database API to delete tenant from platform_tenants_registry & drop tenant DB
    try {
      await ApiClient.delete(`/api/v1/platform/tenants?tenantId=${encodeURIComponent(cleanSlug)}&id=${encodeURIComponent(cleanSlug)}&slug=${encodeURIComponent(cleanSlug)}`);
    } catch (err) {
      console.error("Failed to delete tenant from MongoDB via ApiClient, trying direct fetch:", err);
      try {
        await fetch(`/api/v1/platform/tenants?tenantId=${encodeURIComponent(cleanSlug)}`, { method: 'DELETE' });
      } catch (fErr) {
        console.error("Direct fetch delete also failed:", fErr);
      }
    }

    ApiClient.clearCache('/api/v1/platform/tenants');
    return true;
  }

  public static async updatePlanFeatures(
    planId: string,
    features: Record<string, boolean>
  ): Promise<void> {
    const list = this.loadPlans();
    const plan = list.find((p) => p.id === planId);
    if (!plan) return;

    plan.features = { ...plan.features, ...features };
    this.savePlans(list);

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `Plan ${plan.name} features updated by Superadmin`,
      actor: 'superadmin@mavenco.com',
      tenantId: 'platform',
      ipAddress: '127.0.0.1',
      severity: 'info',
      timestamp: 'Just now',
    });
  }

  public static async resetPlanFeaturesToDefault(planId: string): Promise<void> {
    const defaultFeatures = getDefaultFeaturesForPlan(planId);
    await this.updatePlanFeatures(planId, defaultFeatures);
  }

  public static async listPlans(): Promise<TenantPlan[]> {
    return this.loadPlans();
  }

  public static async listActivityLogs(): Promise<PlatformActivityLog[]> {
    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
    try {
      const res = await fetch('/api/v1/platform/activity');
      if (res.ok) {
        const data = await res.json();
        if (data.activities && Array.isArray(data.activities) && data.activities.length > 0) {
          const freshActivities = data.activities.filter((a: PlatformActivityLog) => {
            if (!a.createdAt) return true;
            return new Date(a.createdAt).getTime() >= fiveDaysAgo;
          });
          this.activities = freshActivities;
          return freshActivities;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch activity logs from MongoDB API:', err);
    }
    return this.activities.filter((a) => {
      if (!a.createdAt) return true;
      return new Date(a.createdAt).getTime() >= fiveDaysAgo;
    });
  }

  public static async logActivity(log: Partial<PlatformActivityLog> & { event: string }) {
    const now = new Date();
    const newLog: PlatformActivityLog = {
      id: log.id || `act_${Date.now()}`,
      event: log.event,
      actor: log.actor || 'superadmin@platform.com',
      tenantId: log.tenantId,
      tenantName: log.tenantName,
      ipAddress: log.ipAddress || '127.0.0.1',
      severity: log.severity || 'info',
      timestamp: 'Just now',
      createdAt: log.createdAt || now.toISOString(),
    };

    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
    this.activities = [newLog, ...this.activities].filter((a) => {
      if (!a.createdAt) return true;
      return new Date(a.createdAt).getTime() >= fiveDaysAgo;
    });

    try {
      await fetch('/api/v1/platform/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
    } catch (err) {
      console.error('Failed to persist activity log to MongoDB:', err);
    }
  }

  // Inquiries & Demo Leads Management
  public static async listInquiries(): Promise<PlatformInquiry[]> {
    try {
      const res = await fetch('/api/v1/platform/inquiries').then((r) => (r.ok ? r.json() : null));
      if (res?.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to fetch inquiries from DB:', err);
    }
    return [];
  }

  public static async updateInquiryStatus(id: string, status: PlatformInquiry['status']): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/platform/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
      return false;
    }
  }

  public static async deleteInquiry(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/platform/inquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      return false;
    }
  }

  // Global Platform Broadcast Management
  public static async getPlatformBroadcast(): Promise<PlatformBroadcast | null> {
    try {
      let bcast: PlatformBroadcast | null = null;
      // 1. Try local admin API
      try {
        const res = await fetch('/api/v1/platform/broadcast').then((r) => (r.ok ? r.json() : null));
        if (res?.broadcast) bcast = res.broadcast;
      } catch {}

      // 2. Fallback to ApiClient (storefront API)
      if (!bcast) {
        try {
          const apiRes = await ApiClient.get<{ broadcast: PlatformBroadcast | null }>('/api/v1/platform/broadcast');
          if (apiRes?.data?.broadcast || (apiRes as any)?.broadcast) {
            bcast = apiRes.data?.broadcast || (apiRes as any).broadcast;
          }
        } catch {}
      }

      if (bcast) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('jq_platform_active_broadcast', JSON.stringify(bcast));
        }
        return bcast;
      }
    } catch (err) {
      console.warn('Failed to fetch broadcast from DB:', err);
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('jq_platform_active_broadcast');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    return null;
  }

  public static async publishPlatformBroadcast(message: string, type: 'info' | 'warning' = 'info'): Promise<PlatformBroadcast> {
    const payload = { message, type, publishedBy: 'superadmin@platform.com' };
    const res = await fetch('/api/v1/platform/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => (r.ok ? r.json() : null));

    const bcast: PlatformBroadcast = res?.broadcast || {
      id: `bcast_${Date.now()}`,
      message,
      type,
      status: 'active',
      active: true,
      publishedBy: 'superadmin@platform.com',
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('jq_platform_active_broadcast', JSON.stringify(bcast));
      try {
        const dismissed = JSON.parse(localStorage.getItem('jq_dismissed_broadcasts') || '[]');
        const updated = dismissed.filter((id: string) => id !== bcast.id);
        localStorage.setItem('jq_dismissed_broadcasts', JSON.stringify(updated));
      } catch {}

      window.dispatchEvent(new CustomEvent('platform_broadcast_updated', { detail: bcast }));
    }

    return bcast;
  }

  public static dismissPlatformBroadcast(id: string): void {
    if (typeof window !== 'undefined') {
      try {
        const dismissed = JSON.parse(localStorage.getItem('jq_dismissed_broadcasts') || '[]');
        if (!dismissed.includes(id)) {
          dismissed.push(id);
          localStorage.setItem('jq_dismissed_broadcasts', JSON.stringify(dismissed));
        }
      } catch {}
      window.dispatchEvent(new CustomEvent('platform_broadcast_dismissed', { detail: { id } }));
    }
  }

}
