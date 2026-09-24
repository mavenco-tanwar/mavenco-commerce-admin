import { getDefaultWebsitePages } from "@/lib/cms-page-presets";
import { ApiClient } from './api';
import { PlatformService } from './platform';
import { INITIAL_HOMEPAGE_BLOCKS } from '@/lib/mock-data';
import type { ContentBlock, HomepageConfig, Page } from '@/types';

function normalizeBlock(raw: any): ContentBlock {
  const blockData = raw.data || raw.settings || raw.content || {};
  const title = blockData.title || blockData.heading || raw.title || raw.name || 'Untitled Section';
  const subtitle = blockData.subtitle || blockData.subheading || blockData.description || raw.subtitle || '';
  const badge = blockData.badge || blockData.tagline || blockData.badgeText || '';
  const desktopImage = blockData.desktopImage || blockData.image || blockData.bannerImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&auto=format&fit=crop';
  const mobileImage = blockData.mobileImage || blockData.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop';
  const primaryCtaText = blockData.primaryCtaText || blockData.ctaText || blockData.primaryBtnText || 'Shop Now';
  const primaryCtaUrl = blockData.primaryCtaUrl || blockData.ctaUrl || blockData.primaryBtnLink || '/women';
  const secondaryCtaText = blockData.secondaryCtaText || blockData.secondaryBtnText || '';
  const secondaryCtaUrl = blockData.secondaryCtaUrl || blockData.secondaryBtnLink || '';

  const mergedData = {
    title,
    heading: title,
    subtitle,
    badge,
    tagline: badge,
    desktopImage,
    mobileImage,
    image: desktopImage,
    primaryCtaText,
    primaryBtnText: primaryCtaText,
    primaryCtaUrl,
    primaryBtnLink: primaryCtaUrl,
    secondaryCtaText,
    secondaryBtnText: secondaryCtaText,
    secondaryCtaUrl,
    secondaryBtnLink: secondaryCtaUrl,
    ctaText: primaryCtaText,
    ctaUrl: primaryCtaUrl,
    code: blockData.code || blockData.couponCode || '',
    categoryIds: blockData.categoryIds || ['cat_women', 'cat_kids', 'cat_dresses', 'cat_kurtis'],
    collectionId: blockData.collectionId || 'col_trending',
    limit: blockData.limit || 4,
    columns: blockData.columns || 4,
    overlayOpacity: blockData.overlayOpacity ?? 40,
    ...blockData,
  };

  return {
    id: raw.id || `sec_${raw.type || 'hero'}_${Date.now()}`,
    type: raw.type || 'hero',
    name: raw.name || title,
    title,
    subtitle,
    isVisible: typeof raw.isVisible === 'boolean' ? raw.isVisible : true,
    displayOrder: typeof raw.displayOrder === 'number' ? raw.displayOrder : 1,
    visibilityDevice: raw.visibilityDevice || { desktop: true, tablet: true, mobile: true },
    schedule: raw.schedule,
    data: mergedData,
    settings: mergedData,
    updatedAt: raw.updatedAt || new Date().toISOString(),
  } as any;
}

export class ContentService {
  private static localBlocks: ContentBlock[] = INITIAL_HOMEPAGE_BLOCKS.map(normalizeBlock);
  private static versionHistory: { version: number; updatedAt: string; publishedAt?: string; sections: ContentBlock[] }[] = [
    {
      version: 1,
      updatedAt: '2026-08-25T10:00:00Z',
      publishedAt: '2026-08-25T10:05:00Z',
      sections: INITIAL_HOMEPAGE_BLOCKS.map(normalizeBlock),
    },
  ];
  private static localPages: Page[] = [
    {
      id: 'page_about',
      title: 'About JQ Trends',
      slug: 'about-us',
      status: 'published',
      blocks: [],
      seo: { title: 'About Us | JQ Trends', description: 'Affordable Luxury Fashion designed for timeless grace.' },
      updatedAt: '2026-08-20T10:00:00Z',
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'page_shipping',
      title: 'Shipping & Delivery Policy',
      slug: 'shipping-policy',
      status: 'published',
      blocks: [],
      seo: { title: 'Shipping Policy | JQ Trends' },
      updatedAt: '2026-08-20T10:00:00Z',
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'page_returns',
      title: 'Returns & Exchange Policy',
      slug: 'return-policy',
      status: 'published',
      blocks: [],
      seo: { title: 'Returns & Exchange | JQ Trends' },
      updatedAt: '2026-08-20T10:00:00Z',
      createdAt: '2026-08-01T00:00:00Z',
    },
  ];

  static async getHomepage(preview = false): Promise<HomepageConfig> {
    const tenantSlug = PlatformService.getActiveTenant().slug || 'jqtrends';
    try {
      const res = await ApiClient.get<any>(`/api/v1/content/homepage?tenant=${tenantSlug}${preview ? '&preview=draft' : ''}`);
      if (res.data?.sections && Array.isArray(res.data.sections) && res.data.sections.length > 0) {
        const normalized = res.data.sections.map(normalizeBlock);
        this.localBlocks = normalized;
        return {
          version: res.data.version || this.versionHistory.length,
          status: res.data.status || 'published',
          sections: normalized,
          updatedAt: res.data.updatedAt || new Date().toISOString(),
        };
      }
    } catch {
      // Mock Fallback
    }

    return {
      version: this.versionHistory.length,
      status: 'published',
      sections: this.localBlocks.map(normalizeBlock),
      updatedAt: new Date().toISOString(),
    };
  }

  static async saveDraft(sections: ContentBlock[]): Promise<HomepageConfig> {
    const tenantSlug = PlatformService.getActiveTenant().slug || 'jqtrends';
    const normalized = sections.map(normalizeBlock);
    this.localBlocks = normalized;
    try {
      await ApiClient.put(`/api/v1/content/homepage?tenant=${tenantSlug}`, { sections: normalized, status: 'draft' });
    } catch {
      // Mock Fallback
    }

    return {
      version: this.versionHistory.length,
      status: 'draft',
      sections: this.localBlocks,
      updatedAt: new Date().toISOString(),
    };
  }

  static async publishHomepage(sections: ContentBlock[]): Promise<HomepageConfig> {
    const tenantSlug = PlatformService.getActiveTenant().slug || 'jqtrends';
    const normalized = sections.map(normalizeBlock);
    this.localBlocks = normalized;
    const newVersion = this.versionHistory.length + 1;
    const newSnapshot = {
      version: newVersion,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      sections: JSON.parse(JSON.stringify(normalized)),
    };
    this.versionHistory.unshift(newSnapshot);

    try {
      // Direct update and publish to CMS backend
      await ApiClient.put(`/api/v1/content/homepage?tenant=${tenantSlug}`, { sections: normalized, status: 'published' });
    } catch {
      // Mock Fallback
    }

    return {
      version: newVersion,
      status: 'published',
      sections: this.localBlocks,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
  }

  static async getHistory(): Promise<{ version: number; updatedAt: string; publishedAt?: string; sections: ContentBlock[] }[]> {
    try {
      const res = await ApiClient.get<any[]>('/api/v1/content/homepage/history');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((r) => ({
          version: r.version,
          updatedAt: r.updated_at || r.updatedAt || new Date().toISOString(),
          publishedAt: r.published_at || r.publishedAt,
          sections: typeof r.sections === 'string' ? JSON.parse(r.sections) : (r.sections || this.localBlocks),
        }));
      }
    } catch {
      // Fallback
    }
    return this.versionHistory;
  }

  static async restoreVersion(versionNumber: number): Promise<ContentBlock[]> {
    const found = this.versionHistory.find((v) => v.version === versionNumber);
    if (!found) throw new Error(`Version ${versionNumber} not found`);
    this.localBlocks = JSON.parse(JSON.stringify(found.sections)).map(normalizeBlock);

    try {
      await ApiClient.put('/api/v1/content/homepage', { sections: this.localBlocks, status: 'published' });
    } catch {
      // Fallback
    }
    return this.localBlocks;
  }

  static async getPages(tenantSlug?: string): Promise<Page[]> {
    const active = tenantSlug || PlatformService.getActiveTenant().slug || "jqtrends";
    try {
      const res = await ApiClient.get<any[]>(`/api/v1/content/pages?tenant=${active}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        this.localPages = res.data.map((p: any) => ({
          id: p.id || `page_${Date.now()}`,
          title: p.title || "Page",
          slug: p.slug || "page-slug",
          status: p.status || "published",
          type: p.type || "website-page",
          blocks: p.blocks || [],
          sectionsEnabled: p.sectionsEnabled || { hero: true, body: true, customSections: true, valueProps: true },
          customSections: p.customSections || [],
          design: p.design || p.styles || {},
          styles: p.styles || p.design || {},
          seo: p.seo || { title: p.title },
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        }));
        return this.localPages;
      }
    } catch {
      // Fallback
    }
    const tenantDoc = PlatformService.getActiveTenant();
    const presets = getDefaultWebsitePages(active, tenantDoc);
    this.localPages = presets.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      type: p.type,
      blocks: p.blocks,
      sectionsEnabled: p.sectionsEnabled,
      customSections: p.customSections,
      design: p.design,
      styles: p.design,
      seo: p.seo,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    return this.localPages;
  }

  static async createPage(page: Partial<Page>): Promise<Page> {
    const newP: Page = {
      id: `page_${Date.now()}`,
      title: page.title || 'New Page',
      slug: page.slug || `page-${Date.now()}`,
      status: page.status || 'draft',
      blocks: page.blocks || [],
      seo: page.seo || { title: page.title },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const tenantSlug = (page as any).tenantSlug || PlatformService.getActiveTenant().slug || "jqtrends";
      const res = await ApiClient.post<any>(`/api/v1/content/pages?tenant=${tenantSlug}`, newP);
      if (res.data) {
        const persisted = {
          id: res.data.id || newP.id,
          title: res.data.title || newP.title,
          slug: res.data.slug || newP.slug,
          status: res.data.status || newP.status,
          blocks: res.data.blocks || newP.blocks,
          seo: res.data.seo || newP.seo,
          createdAt: res.data.createdAt || newP.createdAt,
          updatedAt: res.data.updatedAt || newP.updatedAt,
        };
        this.localPages.push(persisted);
        return persisted;
      }
    } catch {
      // Fallback
    }

    this.localPages.push(newP);
    return newP;
  }

  static async updatePage(id: string, updates: Partial<Page>): Promise<Page> {
    try {
      const tenantSlug = (updates as any).tenantSlug || PlatformService.getActiveTenant().slug || "jqtrends";
      await ApiClient.patch(`/api/v1/content/pages/${id}?tenant=${tenantSlug}`, updates);
    } catch {
      // Fallback
    }

    this.localPages = this.localPages.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    const updated = this.localPages.find((p) => p.id === id);
    if (!updated) throw new Error('Page not found');
    return updated;
  }

  static async deletePage(id: string): Promise<void> {
    try {
      await ApiClient.delete(`/api/v1/content/pages/${id}`);
    } catch {
      // Fallback
    }
    this.localPages = this.localPages.filter((p) => p.id !== id);
  }
}
