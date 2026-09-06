/**
 * Module 38: Page Document Schema Adapter
 * Seamlessly adapts legacy section-based pages or unconfigured documents into the full BuilderNode schema.
 */

import { PageDocument, BuilderNode } from './types';
import { createDefaultRootNode, generateUniqueId } from './tree-utils';

export function adaptLegacySectionsToTree(sections: any[] = []): BuilderNode {
  const root = createDefaultRootNode();

  if (Array.isArray(sections) && sections.length > 0) {
    root.children = sections.map((sec: any) => {
      const secType = sec.type === 'featured-products' ? 'product_grid' : sec.type;
      return {
        id: sec.id || generateUniqueId(secType),
        type: secType,
        parentId: root.id,
        children: [],
        content: {
          heading: sec.title,
          subheading: sec.subtitle,
          ...(sec.settings || sec.data || sec),
        },
        style: {
          spacing: {
            padding: { desktop: { top: '32px', right: '16px', bottom: '32px', left: '16px' } },
          },
        },
        responsive: {
          visibility: { desktop: true, tablet: true, mobile: true },
        },
        metadata: { name: sec.title || sec.type },
      };
    });
  }

  return root;
}

export function ensurePageDocument(raw: any, defaultTenantId: string = 'lumina'): PageDocument {
  const tenantId = raw?.tenantId || raw?.tenantSlug || defaultTenantId;
  const name = raw?.name || raw?.title || 'Custom Boutique Page';
  const slug = raw?.slug || 'page';
  const id = raw?.id || raw?._id?.toString() || `page_${slug}_${tenantId}`;

  // If already full Builder Document with content.root
  if (raw?.content?.root && typeof raw.content.root === 'object') {
    return {
      id,
      tenantId,
      storeId: raw.storeId || 'store_primary',
      name,
      slug,
      type: raw.type || 'standard',
      status: raw.status || 'published',
      version: raw.version || 1,
      schemaVersion: raw.schemaVersion || '1.0',
      content: raw.content,
      seo: raw.seo || {
        title: `${name} | Luxury Boutique`,
        description: `Explore ${name} handcrafted collections and modern silhouettes.`,
      },
      settings: raw.settings || {},
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
      publishedAt: raw.publishedAt,
    };
  }

  // Convert legacy sections array to content.root
  const root = adaptLegacySectionsToTree(raw?.sections);

  return {
    id,
    tenantId,
    storeId: raw?.storeId || 'store_primary',
    name,
    slug,
    type: raw?.type || 'standard',
    status: raw?.status || 'published',
    version: raw?.version || 1,
    schemaVersion: '1.0',
    content: { root },
    seo: raw?.seo || {
      title: `${name} | Luxury Boutique`,
      description: `Explore ${name} handcrafted collections.`,
    },
    settings: raw?.settings || {},
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
    publishedAt: raw?.publishedAt,
  };
}
