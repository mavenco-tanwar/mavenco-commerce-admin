export interface FilterDefinition {
  id: string;
  key: string;
  label: string;
  type: 'checkbox' | 'range' | 'color' | 'swatch' | 'dropdown' | 'boolean';
  enabled: boolean;
  collapsed: boolean;
  position: number;
}

export interface SortOption {
  key: string;
  label: string;
  enabled: boolean;
  position: number;
}

export interface CollectionPageStyles {
  backgroundColor?: string;
  textColor?: string;
  headingColor?: string;
  accentColor?: string;
  cardBackgroundColor?: string;
  filterBackgroundColor?: string;
  toolbarBackgroundColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
}

export interface CollectionPageConfig {
  id?: string;
  tenantId?: string;
  templateId?: string;
  name?: string;
  status?: 'draft' | 'published';
  version?: number;

  hero: {
    enabled: boolean;
    title: string;
    description: string;
    bgImage: string;
    mobileImage: string;
    overlayOpacity: number;
    alignment: 'left' | 'center' | 'right';
    height: 'small' | 'medium' | 'large' | 'auto';
    ctaText: string;
    ctaLink: string;
    badgeText?: string;
  };

  breadcrumbs: {
    enabled: boolean;
    showHome: boolean;
    separator: string;
  };

  header: {
    enabled: boolean;
    showCount: boolean;
    showDescription: boolean;
    alignment: 'left' | 'center' | 'right';
  };

  toolbar: {
    showCount: boolean;
    showFilterBtn: boolean;
    showSort: boolean;
    showViewToggle: boolean;
    defaultView: 'grid' | 'list';
  };

  filters: {
    position: 'left' | 'right' | 'none';
    sticky: boolean;
    items: FilterDefinition[];
  };

  sorting: {
    defaultSort: string;
    items: SortOption[];
  };

  grid: {
    desktopColumns: number;
    tabletColumns: number;
    mobileColumns: number;
    gap: string;
  };

  pagination: {
    type: 'pagination' | 'load_more' | 'infinite_scroll';
    productsPerPage: number;
  };

  promo: {
    enabled: boolean;
    insertAfterIndex: number;
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    colSpan: '1' | '2' | 'full';
  };

  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ogImage: string;
  };

  styles?: CollectionPageStyles;

  updatedAt?: string;
  publishedAt?: string;
}
