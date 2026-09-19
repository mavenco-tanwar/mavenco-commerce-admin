export type PermissionCode =
  | 'dashboard.read'
  | 'products.read'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'products.publish'
  | 'categories.read'
  | 'categories.create'
  | 'categories.update'
  | 'categories.delete'
  | 'collections.read'
  | 'collections.create'
  | 'collections.update'
  | 'collections.delete'
  | 'inventory.read'
  | 'inventory.update'
  | 'orders.read'
  | 'orders.create'
  | 'orders.update'
  | 'orders.cancel'
  | 'orders.refund'
  | 'orders.fulfill'
  | 'customers.read'
  | 'customers.create'
  | 'customers.update'
  | 'customers.delete'
  | 'reviews.read'
  | 'reviews.manage'
  | 'discounts.read'
  | 'discounts.create'
  | 'discounts.update'
  | 'discounts.delete'
  | 'marketing.read'
  | 'marketing.manage'
  | 'content.read'
  | 'content.create'
  | 'content.update'
  | 'content.delete'
  | 'content.publish'
  | 'media.read'
  | 'media.upload'
  | 'media.delete'
  | 'navigation.read'
  | 'navigation.update'
  | 'settings.read'
  | 'settings.update'
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'roles.read'
  | 'roles.manage'
  | 'activity.read'
  | '*';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  roleId: string;
  roleName: string;
  status: 'active' | 'invited' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  permissions: PermissionCode[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  options: {
    size?: string;
    color?: string;
    material?: string;
    [key: string]: any;
  };
  imageUrl?: string;
  barcode?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  sku: string;
  brand: string;
  categoryIds: string[];
  department?: string;
  category?: string;
  categoryName?: string;
  categorySlug?: string;
  collectionIds: string[];
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  images: {
    id: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
  }[];
  variants: ProductVariant[];
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  trackInventory: boolean;
  stock: number;
  lowStockThreshold: number;
  allowBackorders: boolean;
  seo: {
    title?: string;
    description?: string;
    slug?: string;
    socialImage?: string;
  };
  shipping: {
    weightKg: number;
    isExpressAvailable: boolean;
  };
  flags?: any;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  badges: {
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  displayOrder: number;
  isVisible: boolean;
  productCount?: number;
  seo: {
    title?: string;
    description?: string;
  };
  children?: Category[];
}

export interface CollectionRule {
  field: 'price' | 'category' | 'tag' | 'stock' | 'title';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  type: 'manual' | 'automated';
  rules?: CollectionRule[];
  productIds?: string[];
  productCount?: number;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  sku: string;
  availableStock: number;
  reservedStock: number;
  totalOnHand: number;
  lowStockThreshold: number;
  locationName: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'authorized' | 'paid' | 'partially_refunded' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned';

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  variantTitle?: string;
  sku: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  paymentMethod: 'upi' | 'card' | 'net_banking' | 'cod';
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  status: OrderStatus;
  carrier?: string;
  trackingNumber?: string;
  trackingTimeline?: {
    stage: string;
    timestamp: string;
    location: string;
    completed: boolean;
  }[];
  timeline?: any[];
  adminNotes?: string[];
  notes?: any[];
  placedAt?: string;
  billingAddress?: any;
  updatedAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
  status: 'active' | 'inactive';
  addresses: {
    id: string;
    type: 'home' | 'work' | 'other';
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  isFeatured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  startAt: string;
  endAt?: string;
  applicableCategoryIds?: string[];
  applicableProductIds?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  altText?: string;
  folder: 'All' | 'Homepage' | 'Products' | 'Women' | 'Kids' | 'Banners' | 'Campaigns';
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  usedInCount?: number;
  usedIn?: string[];
  createdAt: string;
}

export type ContentBlockType =
  | 'hero'
  | 'category-grid'
  | 'categories'
  | 'trending'
  | 'product-grid'
  | 'product-carousel'
  | 'new-arrivals'
  | 'image-banner'
  | 'text-section'
  | 'collection-banner'
  | 'womens-editorial'
  | 'kids-editorial'
  | 'best-sellers'
  | 'reviews'
  | 'testimonials'
  | 'instagram'
  | 'instagram-feed'
  | 'newsletter'
  | 'promo-banner'
  | 'value-props'
  | 'video'
  | 'smart-search'
  | 'promo-tags'
  | 'analytics-dashboard'
  | 'star-ratings-qa'
  | 'store-locator'
  | 'gift-cards'
  | 'referral-loyalty'
  | 'order-tracking'
  | (string & {});

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  name: string;
  isVisible: boolean;
  displayOrder: number;
  visibilityDevice: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  schedule?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
  };
  data: Record<string, any>;
  updatedAt: string;
}

export interface HomepageConfig {
  version: number;
  status: 'draft' | 'published' | 'archived';
  sections: ContentBlock[];
  updatedAt: string;
  publishedAt?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  blocks: ContentBlock[];
  seo: {
    title?: string;
    description?: string;
  };
  updatedAt: string;
  createdAt: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  type: 'category' | 'collection' | 'page' | 'custom';
  targetId?: string;
  url: string;
  isVisible: boolean;
  children?: NavigationItem[];
}

export interface NavigationMenu {
  id: string;
  title: string;
  slug: 'header-menu' | 'footer-menu-shop' | 'footer-menu-care' | 'footer-menu-company';
  items: NavigationItem[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactEmail: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
  logoUrl?: string;
  faviconUrl?: string;
  shipping: {
    freeShippingThreshold: number;
    standardRate: number;
    expressRate: number;
    codAvailable: boolean;
  };
  payments: {
    upiEnabled: boolean;
    cardsEnabled: boolean;
    netBankingEnabled: boolean;
    codEnabled: boolean;
  };
  tax: {
    gstEnabled: boolean;
    pricesIncludeTax: boolean;
    defaultGSTRate: number;
  };
  social: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    pinterest?: string;
    youtube?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImageUrl?: string;
  };
}

export interface ThemeSettings {
  template: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  headerLayout: 'standard' | 'centered' | 'minimal';
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  ipAddress: string;
  createdAt: string;
}
