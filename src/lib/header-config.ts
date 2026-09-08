export interface HeaderBlockStyles {
  backgroundColor?: string;
  textColor?: string;
  hoverColor?: string;
  activeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  letterSpacing?: string;
  lineHeight?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  gap?: string;
  border?: string;
  borderColor?: string;
  borderRadius?: string;
  shadow?: string;
  opacity?: number;
}

export interface HeaderBlock {
  id: string;
  type:
    | 'logo'
    | 'brand'
    | 'tagline'
    | 'navigation'
    | 'search'
    | 'account'
    | 'wishlist'
    | 'cart'
    | 'currency'
    | 'language'
    | 'country'
    | 'whatsapp'
    | 'phone'
    | 'announcement'
    | 'cta'
    | 'icon'
    | 'text'
    | 'divider'
    | 'spacer';
  zone:
    | 'announcement.left'
    | 'announcement.center'
    | 'announcement.right'
    | 'main.left'
    | 'main.center'
    | 'main.right';
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
  styles?: HeaderBlockStyles;
  responsive?: {
    desktop?: { visible: boolean; order?: number; size?: string };
    tablet?: { visible: boolean; order?: number; size?: string };
    mobile?: { visible: boolean; order?: number; size?: string };
  };
  visibility?: {
    startDate?: string;
    endDate?: string;
    scheduleEnabled?: boolean;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  order: number;
  enabled: boolean;
  target?: '_self' | '_blank';
  badge?: {
    text: string;
    type?: 'fresh' | 'hot' | 'new' | 'sale' | 'limited' | 'custom';
    bg?: string;
    color?: string;
  };
  children?: NavigationItem[];
  megaMenu?: {
    enabled: boolean;
    columns: Array<{
      id: string;
      title: string;
      links: Array<{ label: string; url: string; badge?: string }>;
      promoBanner?: {
        image: string;
        heading: string;
        description?: string;
        ctaText: string;
        ctaUrl: string;
      };
    }>;
  };
}

export interface HeaderConfig {
  id: string;
  tenantSlug: string;
  preset: 'luxury' | 'classic' | 'centered' | 'editorial' | 'minimal';
  presetId?: string;
  theme: 'luxury-light' | 'luxury-dark' | 'minimal' | 'editorial' | 'modern' | 'classic';
  campaign?: {
    enabled: boolean;
    name?: string;
    startDate?: string;
    endDate?: string;
  };
  announcementBar: {
    enabled: boolean;
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
    responsive?: {
      desktop?: boolean;
      tablet?: boolean;
      mobile?: boolean;
    };
    mode?: 'static' | 'rotate' | 'marquee' | 'countdown';
    marqueeSpeed?: number;
    countdown?: {
      targetDate: string;
      label: string;
      expiredText?: string;
    };
    height: number;
    rotationEnabled: boolean;
    rotationInterval: number;
    pauseOnHover: boolean;
    styles: {
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      borderColor: string;
      fontSize: string;
      fontFamily: string;
      letterSpacing: string;
    };
    blocks: HeaderBlock[];
  };
  mainHeader: {
    enabled: boolean;
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
    responsive?: {
      desktop?: boolean;
      tablet?: boolean;
      mobile?: boolean;
    };
    height: number;
    containerWidth: 'full' | 'contained' | 'custom';
    maxWidth?: number;
    styles: {
      backgroundColor: string;
      textColor: string;
      hoverColor: string;
      accentColor: string;
      borderColor: string;
      borderBottomWidth: string;
      shadow: string;
      fontFamily: string;
    };
    blocks: HeaderBlock[];
  };
  sticky: {
    enabled: boolean;
    behavior: 'always' | 'on-scroll-up' | 'after-threshold';
    thresholdPx: number;
    shrinkOnScroll: boolean;
    scrolledHeight: number;
    stickyBg?: string;
    stickyTextColor?: string;
  };
  transparent: {
    enabledOnHomepage: boolean;
    enabledOnSelectedPages: string[];
    transparentLogo?: string;
    transparentTextColor?: string;
  };
  mobile: {
    enabled: boolean;
    height: number;
    drawer: {
      background: string;
      textColor: string;
      accentColor: string;
      showSocialIcons: boolean;
      showCurrency: boolean;
      promoCard?: {
        enabled: boolean;
        image: string;
        heading: string;
        description: string;
        ctaText: string;
        ctaUrl: string;
      };
      socialLinks?: {
        instagram?: string;
        tiktok?: string;
        whatsapp?: string;
        facebook?: string;
      };
      quickActions?: {
        showPhone: boolean;
        showWhatsApp: boolean;
        showStoreLocator: boolean;
      };
    };
    blocks: HeaderBlock[];
  };
  navigationMenu: NavigationItem[];
  version: number;
  status: 'draft' | 'published';
  updatedAt: string;
}

export const LUXURY_PRESET_TEMPLATES: Record<string, { name: string; description: string; icon: string; getConfig: (tenantSlug: string, name?: string) => Partial<HeaderConfig> }> = {
  luxury_flagship: {
    name: 'Luxury Flagship',
    description: 'Iconic centered logo with balanced split menus on left and right, luxury dark announcement bar, and gold accent styling.',
    icon: '🏛️',
    getConfig: (tenantSlug: string, name: string = 'Lumina Atelier') => ({
      preset: 'luxury',
      presetId: 'luxury_flagship',
      theme: 'luxury-light',
      announcementBar: {
        enabled: true,
        height: 38,
        mode: 'marquee',
        rotationEnabled: false,
        rotationInterval: 5,
        pauseOnHover: true,
        styles: {
          backgroundColor: '#0F1117',
          textColor: '#F8FAFC',
          accentColor: '#F59E0B',
          borderColor: 'rgba(255,255,255,0.1)',
          fontSize: '11px',
          fontFamily: 'Playfair Display, serif',
          letterSpacing: '0.08em',
        },
        blocks: [
          {
            id: 'ann_marquee_1',
            type: 'announcement',
            zone: 'announcement.center',
            enabled: true,
            order: 1,
            settings: { text: 'COMPLIMENTARY WORLDWIDE COURIER DELIVERY • EXCLUSIVE BESPOKE PACKAGING • PRIVATE ATELIER CLIENT SERVICE' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
      mainHeader: {
        enabled: true,
        height: 85,
        containerWidth: 'contained',
        maxWidth: 1400,
        styles: {
          backgroundColor: '#FFFDFC',
          textColor: '#111111',
          hoverColor: '#E11D48',
          accentColor: '#E11D48',
          borderColor: '#E8DED8',
          borderBottomWidth: '1px',
          shadow: 'none',
          fontFamily: 'Playfair Display, serif',
        },
        blocks: [
          {
            id: 'nav_split_left',
            type: 'navigation',
            zone: 'main.left',
            enabled: true,
            order: 1,
            settings: { splitSide: 'first-half', label: 'Navigation (Left Half)' },
            responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
          },
          {
            id: 'main_logo_center',
            type: 'logo',
            zone: 'main.center',
            enabled: true,
            order: 1,
            settings: { logoText: name.toUpperCase(), badgeText: 'HAUTE COUTURE' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
          {
            id: 'nav_split_right',
            type: 'navigation',
            zone: 'main.right',
            enabled: true,
            order: 1,
            settings: { splitSide: 'second-half', label: 'Navigation (Right Half)' },
            responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
          },
          {
            id: 'main_search_right',
            type: 'search',
            zone: 'main.right',
            enabled: true,
            order: 2,
            settings: { mode: 'icon-label', label: 'SEARCH' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
    }),
  },
  modern_ecommerce: {
    name: 'Modern Ecommerce',
    description: 'High-converting layout with left brand logo, full center navigation menu, and right search/wishlist/cart actions.',
    icon: '🛍️',
    getConfig: (tenantSlug: string, name: string = 'Lumina Atelier') => ({
      preset: 'classic',
      presetId: 'modern_ecommerce',
      theme: 'modern',
      announcementBar: {
        enabled: true,
        height: 38,
        mode: 'countdown',
        countdown: {
          targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          label: 'FLASH SALE: 25% OFF APPAREL',
        },
        rotationEnabled: false,
        rotationInterval: 5,
        pauseOnHover: true,
        styles: {
          backgroundColor: '#E11D48',
          textColor: '#FFFFFF',
          accentColor: '#FFFFFF',
          borderColor: 'rgba(255,255,255,0.2)',
          fontSize: '11px',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          letterSpacing: '0.05em',
        },
        blocks: [
          {
            id: 'ann_cd_1',
            type: 'announcement',
            zone: 'announcement.center',
            enabled: true,
            order: 1,
            settings: { text: 'FLASH SALE: 25% OFF APPAREL — ENDS IN 3 DAYS', ctaText: 'SHOP SALE', ctaUrl: '/women' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
      mainHeader: {
        enabled: true,
        height: 75,
        containerWidth: 'contained',
        maxWidth: 1400,
        styles: {
          backgroundColor: '#FFFFFF',
          textColor: '#0F172A',
          hoverColor: '#E11D48',
          accentColor: '#E11D48',
          borderColor: '#F1F5F9',
          borderBottomWidth: '1px',
          shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        },
        blocks: [
          {
            id: 'main_logo_left',
            type: 'logo',
            zone: 'main.left',
            enabled: true,
            order: 1,
            settings: { logoText: name.toUpperCase() },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
          {
            id: 'main_nav_center',
            type: 'navigation',
            zone: 'main.center',
            enabled: true,
            order: 1,
            settings: { splitSide: 'all', label: 'Primary Navigation' },
            responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
          },
          {
            id: 'main_search_right',
            type: 'search',
            zone: 'main.right',
            enabled: true,
            order: 1,
            settings: { mode: 'icon-label', label: 'SEARCH' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
    }),
  },
  editorial_magazine: {
    name: 'Editorial Magazine',
    description: 'Avant-garde editorial magazine layout with bold serif headlines, clean spacing, and luxury spotlight banners.',
    icon: '📰',
    getConfig: (tenantSlug: string, name: string = 'Lumina Atelier') => ({
      preset: 'editorial',
      presetId: 'editorial_magazine',
      theme: 'editorial',
      announcementBar: {
        enabled: true,
        height: 42,
        mode: 'static',
        rotationEnabled: false,
        rotationInterval: 5,
        pauseOnHover: true,
        styles: {
          backgroundColor: '#1E1B4B',
          textColor: '#FDF4FF',
          accentColor: '#F59E0B',
          borderColor: '#312E81',
          fontSize: '11px',
          fontFamily: 'Playfair Display, serif',
          letterSpacing: '0.12em',
        },
        blocks: [
          {
            id: 'ann_mag_1',
            type: 'text',
            zone: 'announcement.left',
            enabled: true,
            order: 1,
            settings: { text: 'PARIS • MILAN • NEW YORK' },
            responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
          },
          {
            id: 'ann_mag_2',
            type: 'announcement',
            zone: 'announcement.center',
            enabled: true,
            order: 1,
            settings: { text: 'THE AUTUMN / WINTER 2026 COUTURE RUNWAY REPORT', ctaText: 'READ EDITORIAL', ctaUrl: '/women' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
      mainHeader: {
        enabled: true,
        height: 90,
        containerWidth: 'contained',
        maxWidth: 1400,
        styles: {
          backgroundColor: '#FAF7F2',
          textColor: '#1A1817',
          hoverColor: '#9333EA',
          accentColor: '#9333EA',
          borderColor: '#E7DFD5',
          borderBottomWidth: '1px',
          shadow: 'none',
          fontFamily: 'Playfair Display, serif',
        },
        blocks: [
          {
            id: 'main_logo_center',
            type: 'logo',
            zone: 'main.center',
            enabled: true,
            order: 1,
            settings: { logoText: name.toUpperCase(), badgeText: 'ISSUE N° 14 • 2026' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
    }),
  },
  global_commerce: {
    name: 'Global Enterprise Commerce',
    description: 'Full-featured enterprise layout with top-bar multi-currency switcher, WhatsApp concierge, and quick search.',
    icon: '🌐',
    getConfig: (tenantSlug: string, name: string = 'Lumina Atelier') => ({
      preset: 'classic',
      presetId: 'global_commerce',
      theme: 'modern',
      announcementBar: {
        enabled: true,
        height: 38,
        mode: 'static',
        rotationEnabled: false,
        rotationInterval: 5,
        pauseOnHover: true,
        styles: {
          backgroundColor: '#090D16',
          textColor: '#E2E8F0',
          accentColor: '#38BDF8',
          borderColor: 'rgba(255,255,255,0.08)',
          fontSize: '11px',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          letterSpacing: '0.04em',
        },
        blocks: [
          {
            id: 'ann_wa_1',
            type: 'whatsapp',
            zone: 'announcement.left',
            enabled: true,
            order: 1,
            settings: { label: 'WhatsApp Concierge', phone: '18004125864' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: false } },
          },
          {
            id: 'ann_center_1',
            type: 'announcement',
            zone: 'announcement.center',
            enabled: true,
            order: 1,
            settings: { text: 'DUTIES & TAXES INCLUDED AT CHECKOUT • GLOBAL FAST DISPATCH' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
          {
            id: 'ann_curr_1',
            type: 'currency',
            zone: 'announcement.right',
            enabled: true,
            order: 1,
            settings: { label: 'Currency' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
      mainHeader: {
        enabled: true,
        height: 80,
        containerWidth: 'contained',
        maxWidth: 1400,
        styles: {
          backgroundColor: '#FFFFFF',
          textColor: '#0F172A',
          hoverColor: '#0284C7',
          accentColor: '#0284C7',
          borderColor: '#E2E8F0',
          borderBottomWidth: '1px',
          shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        },
        blocks: [
          {
            id: 'main_logo_left',
            type: 'logo',
            zone: 'main.left',
            enabled: true,
            order: 1,
            settings: { logoText: name.toUpperCase() },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
          {
            id: 'main_nav_center',
            type: 'navigation',
            zone: 'main.center',
            enabled: true,
            order: 1,
            settings: { splitSide: 'all', label: 'Primary Navigation' },
            responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
          },
          {
            id: 'main_search_right',
            type: 'search',
            zone: 'main.right',
            enabled: true,
            order: 1,
            settings: { mode: 'inline', placeholder: 'Search 10,000+ luxury products...' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
    }),
  },
  minimal_boutique: {
    name: 'Minimal Boutique',
    description: 'Ultra-clean white header with centered wordmark, razor-thin border, and icon-only utility bar. Perfect for minimalist fashion and slow-fashion brands.',
    icon: '🕊️',
    getConfig: (tenantSlug: string, name: string = 'Lumina Atelier') => ({
      preset: 'minimal',
      presetId: 'minimal_boutique',
      theme: 'minimal',
      announcementBar: {
        enabled: true,
        height: 34,
        mode: 'static',
        rotationEnabled: false,
        rotationInterval: 5,
        pauseOnHover: true,
        styles: {
          backgroundColor: '#FAFAFA',
          textColor: '#374151',
          accentColor: '#111827',
          borderColor: '#E5E7EB',
          fontSize: '10px',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.15em',
        },
        blocks: [
          {
            id: 'ann_min_1',
            type: 'announcement',
            zone: 'announcement.center',
            enabled: true,
            order: 1,
            settings: { text: 'COMPLIMENTARY SHIPPING ON ALL ORDERS OVER £150' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
      mainHeader: {
        enabled: true,
        height: 70,
        containerWidth: 'contained',
        maxWidth: 1200,
        styles: {
          backgroundColor: '#FFFFFF',
          textColor: '#111827',
          hoverColor: '#374151',
          accentColor: '#111827',
          borderColor: '#F3F4F6',
          borderBottomWidth: '1px',
          shadow: 'none',
          fontFamily: 'Inter, sans-serif',
        },
        blocks: [
          {
            id: 'min_nav_left',
            type: 'navigation',
            zone: 'main.left',
            enabled: true,
            order: 1,
            settings: { splitSide: 'first-half', label: 'Navigation Left' },
            responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
          },
          {
            id: 'min_logo_center',
            type: 'logo',
            zone: 'main.center',
            enabled: true,
            order: 1,
            settings: { logoText: name.toUpperCase() },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
          {
            id: 'min_search_right',
            type: 'search',
            zone: 'main.right',
            enabled: true,
            order: 1,
            settings: { mode: 'icon-only' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
    }),
  },
  dark_luxury_obsidian: {
    name: 'Dark Luxury Obsidian',
    description: 'Sophisticated all-dark header with deep obsidian backdrop, gold accent navigation, and split-menu logo layout. Ideal for premium streetwear and exclusive luxury drops.',
    icon: '🖤',
    getConfig: (tenantSlug: string, name: string = 'Lumina Atelier') => ({
      preset: 'luxury',
      presetId: 'dark_luxury_obsidian',
      theme: 'luxury-dark',
      announcementBar: {
        enabled: true,
        height: 36,
        mode: 'marquee',
        rotationEnabled: false,
        rotationInterval: 5,
        pauseOnHover: true,
        styles: {
          backgroundColor: '#000000',
          textColor: '#D4AF37',
          accentColor: '#D4AF37',
          borderColor: 'rgba(212,175,55,0.2)',
          fontSize: '10px',
          fontFamily: 'Cinzel, serif',
          letterSpacing: '0.14em',
        },
        blocks: [
          {
            id: 'ann_obsidian_1',
            type: 'announcement',
            zone: 'announcement.center',
            enabled: true,
            order: 1,
            settings: { text: 'EXCLUSIVE MEMBERS-ONLY DROP • LIMITED TO 100 PIECES WORLDWIDE • REGISTER YOUR INTEREST' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
      mainHeader: {
        enabled: true,
        height: 90,
        containerWidth: 'contained',
        maxWidth: 1400,
        styles: {
          backgroundColor: '#0A0A0A',
          textColor: '#FAFAFA',
          hoverColor: '#D4AF37',
          accentColor: '#D4AF37',
          borderColor: 'rgba(212,175,55,0.15)',
          borderBottomWidth: '1px',
          shadow: 'none',
          fontFamily: 'Cinzel, serif',
        },
        blocks: [
          {
            id: 'obsidian_nav_left',
            type: 'navigation',
            zone: 'main.left',
            enabled: true,
            order: 1,
            settings: { splitSide: 'first-half', label: 'Navigation (Left)' },
            responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
          },
          {
            id: 'obsidian_logo_center',
            type: 'logo',
            zone: 'main.center',
            enabled: true,
            order: 1,
            settings: { logoText: name.toUpperCase(), badgeText: '✦ MAISON' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
          {
            id: 'obsidian_nav_right',
            type: 'navigation',
            zone: 'main.right',
            enabled: true,
            order: 1,
            settings: { splitSide: 'second-half', label: 'Navigation (Right)' },
            responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
          },
          {
            id: 'obsidian_search_right',
            type: 'search',
            zone: 'main.right',
            enabled: true,
            order: 2,
            settings: { mode: 'icon-only' },
            responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
          },
        ],
      },
    }),
  },
};

export function getDefaultHeaderConfig(tenantSlug: string = 'lumina'): HeaderConfig {
  return {
    id: `header_${tenantSlug}`,
    tenantSlug,
    preset: 'luxury',
    theme: 'luxury-light',
    announcementBar: {
      enabled: true,
      height: 38,
      rotationEnabled: false,
      rotationInterval: 5,
      pauseOnHover: true,
      styles: {
        backgroundColor: '#1E1B4B',
        textColor: '#FFFFFF',
        accentColor: '#F59E0B',
        borderColor: 'rgba(255,255,255,0.1)',
        fontSize: '11px',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        letterSpacing: '0.05em',
      },
      blocks: [],
    },
    mainHeader: {
      enabled: true,
      height: 80,
      containerWidth: 'contained',
      maxWidth: 1400,
      styles: {
        backgroundColor: '#FFFDFC',
        textColor: '#111111',
        hoverColor: '#F59E0B',
        accentColor: '#F59E0B',
        borderColor: '#E8DED8',
        borderBottomWidth: '1px',
        shadow: 'none',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      },
      blocks: [
        {
          id: 'main_logo_1',
          type: 'logo',
          zone: 'main.left',
          enabled: true,
          order: 1,
          settings: {
            logoText: tenantSlug ? tenantSlug.toUpperCase() : 'STORE',
            link: `/stores/${tenantSlug}`,
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
        },
        {
          id: 'main_nav_1',
          type: 'navigation',
          zone: 'main.center',
          enabled: true,
          order: 1,
          settings: {
            menuId: 'main-menu',
            fontSize: '12px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: '600',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
        },
        {
          id: 'main_search_1',
          type: 'search',
          zone: 'main.right',
          enabled: true,
          order: 1,
          settings: {
            mode: 'icon-label',
            label: 'SEARCH',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
        },
        {
          id: 'main_wishlist_1',
          type: 'wishlist',
          zone: 'main.right',
          enabled: true,
          order: 2,
          settings: {
            showLabel: false,
            label: 'WISHLIST',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
        },
        {
          id: 'main_cart_1',
          type: 'cart',
          zone: 'main.right',
          enabled: true,
          order: 3,
          settings: {
            showLabel: false,
            label: 'BAG',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
        },
        {
          id: 'main_account_1',
          type: 'account',
          zone: 'main.right',
          enabled: true,
          order: 4,
          settings: {
            showLabel: true,
            label: 'SIGN IN',
            loggedInLabel: 'ACCOUNT',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
        },
      ],
    },
    sticky: {
      enabled: true,
      behavior: 'always',
      thresholdPx: 40,
      shrinkOnScroll: true,
      scrolledHeight: 68,
      stickyBg: 'rgba(255,253,252,0.95)',
      stickyTextColor: '#111111',
    },
    transparent: {
      enabledOnHomepage: false,
      enabledOnSelectedPages: [],
    },
    mobile: {
      enabled: true,
      height: 64,
      drawer: {
        background: '#FFFDFC',
        textColor: '#111111',
        accentColor: '#F59E0B',
        showSocialIcons: true,
        showCurrency: true,
      },
      blocks: [],
    },
    navigationMenu: [],
    version: 1,
    status: 'published',
    updatedAt: new Date().toISOString(),
  };
}
