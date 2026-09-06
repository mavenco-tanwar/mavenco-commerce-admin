/**
 * Module 38: Production-Grade Elementor-Style Visual Page Builder Types
 * Fully serializable, deterministic, multi-tenant page builder schema.
 */

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface ResponsiveValue<T> {
  desktop: T;
  tablet?: T;
  mobile?: T;
}

export interface NodeSpacing {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  unit?: 'px' | 'rem' | '%' | 'em';
  isLinked?: boolean;
}

export interface NodeTypography {
  fontFamily?: string;
  fontSize?: ResponsiveValue<string>;
  fontWeight?: string;
  lineHeight?: ResponsiveValue<string>;
  letterSpacing?: string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
  color?: string;
}

export interface NodeBorder {
  style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  width?: NodeSpacing;
  color?: string;
  radius?: NodeSpacing;
}

export interface NodeShadow {
  x?: string;
  y?: string;
  blur?: string;
  spread?: string;
  color?: string;
  inset?: boolean;
}

export interface NodeBackground {
  type?: 'none' | 'color' | 'gradient' | 'image';
  color?: string;
  gradient?: string;
  imageUrl?: string;
  position?: string;
  size?: 'cover' | 'contain' | 'auto';
  repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface NodeStyle {
  typography?: NodeTypography;
  spacing?: {
    margin?: ResponsiveValue<NodeSpacing>;
    padding?: ResponsiveValue<NodeSpacing>;
    gap?: ResponsiveValue<string>;
  };
  size?: {
    width?: ResponsiveValue<string>;
    minWidth?: string;
    maxWidth?: ResponsiveValue<string>;
    height?: ResponsiveValue<string>;
    minHeight?: ResponsiveValue<string>;
    maxHeight?: string;
  };
  position?: {
    type?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    zIndex?: number;
  };
  border?: NodeBorder;
  shadow?: NodeShadow;
  background?: NodeBackground;
  opacity?: number;
  customClasses?: string;
}

export interface DynamicDataSource {
  sourceType: 'product' | 'collection' | 'category' | 'customer' | 'store' | 'market';
  field: string;
  fallback?: string;
  format?: 'raw' | 'currency' | 'date' | 'uppercase';
}

export interface BuilderNode {
  id: string;
  type: string; // root, container, section, column, inner_container, heading, text, button, image, etc.
  parentId: string | null;
  children: BuilderNode[];
  content: Record<string, any>;
  style: NodeStyle;
  responsive?: {
    visibility?: ResponsiveValue<boolean>;
  };
  dataSource?: Record<string, DynamicDataSource>;
  settings?: Record<string, any>;
  metadata?: {
    name?: string;
    isLocked?: boolean;
    isGlobal?: boolean;
    globalWidgetId?: string;
  };
}

export interface PageDocument {
  id: string;
  tenantId: string;
  storeId?: string;
  environmentId?: string;
  channelId?: string;
  marketId?: string;
  name: string;
  slug: string;
  type: 'standard' | 'homepage' | 'landing' | 'policy' | 'product' | 'collection' | 'custom';
  status: 'draft' | 'published' | 'archived';
  version: number;
  schemaVersion: string; // "1.0"
  content: {
    root: BuilderNode;
  };
  seo?: {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    robots?: string;
  };
  settings?: {
    headerTransparent?: boolean;
    pageBackground?: string;
    customCss?: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PageVersion {
  id: string;
  pageId: string;
  tenantId: string;
  version: number;
  name: string;
  slug: string;
  type: string;
  content: {
    root: BuilderNode;
  };
  seo?: Record<string, any>;
  settings?: Record<string, any>;
  publishReason?: string;
  publishedAt: string;
  publishedBy?: string;
}

export interface BuilderTemplate {
  id: string;
  tenantId: string;
  type: 'page' | 'section' | 'block' | 'global_widget';
  name: string;
  category?: string;
  thumbnail?: string;
  content: BuilderNode;
  metadata?: Record<string, any>;
  isPlatform?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalWidget {
  id: string;
  tenantId: string;
  name: string;
  widgetType: string;
  node: BuilderNode;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentRegistryItem {
  type: string;
  label: string;
  category: 'layout' | 'basic' | 'media' | 'ecommerce' | 'marketing' | 'navigation' | 'dynamic';
  icon: any; // Lucide icon
  description: string;
  defaultProps: {
    content?: Record<string, any>;
    style?: NodeStyle;
  };
  supportsChildren: boolean;
  allowedChildren?: string[];
  supportedContexts?: string[];
  render: React.ComponentType<{
    node: BuilderNode;
    mode: 'editor' | 'storefront';
    activeDevice?: DeviceType;
    contextData?: Record<string, any>;
  }>;
}
