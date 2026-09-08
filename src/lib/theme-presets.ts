import { ThemeDocument } from '../types/theme.types';

export function getDefaultTheme(tenantId: string = 'lumina', storeName: string = 'Lumina Atelier'): ThemeDocument {
  return {
    id: `theme_${tenantId}`,
    tenantId,
    name: `${storeName} Official Design System`,
    version: 1,
    status: 'published',
    colors: {
      primary: '#111827',
      primaryHover: '#000000',
      secondary: '#E2E8F0',
      secondaryHover: '#CBD5E1',
      accent: '#E11D48',
      accentHover: '#BE123C',
      background: '#FAFAF9',
      surface: '#FFFFFF',
      surfaceSecondary: '#F5F5F4',
      text: '#1C1917',
      textSecondary: '#57534E',
      textMuted: '#A8A29E',
      heading: '#0C0A09',
      border: '#E7E5E4',
      borderLight: '#F5F5F4',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      overlay: 'rgba(0, 0, 0, 0.65)',
      disabled: '#E7E5E4',
      white: '#FFFFFF',
      black: '#000000',
      gradients: {
        enabled: false,
        type: 'linear',
        angle: 135,
        startColor: '#111827',
        endColor: '#E11D48',
        opacity: 0.9,
      },
    },
    typography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
      navigationFont: 'Plus Jakarta Sans, sans-serif',
      buttonFont: 'Plus Jakarta Sans, sans-serif',
      h1: {
        fontSize: '48px',
        fontWeight: '800',
        lineHeight: '1.1',
        letterSpacing: '-0.02em',
        responsive: { tablet: { fontSize: '38px' }, mobile: { fontSize: '30px' } },
      },
      h2: {
        fontSize: '36px',
        fontWeight: '700',
        lineHeight: '1.2',
        letterSpacing: '-0.015em',
        responsive: { tablet: { fontSize: '30px' }, mobile: { fontSize: '24px' } },
      },
      h3: {
        fontSize: '28px',
        fontWeight: '600',
        lineHeight: '1.25',
        letterSpacing: '-0.01em',
        responsive: { tablet: { fontSize: '24px' }, mobile: { fontSize: '20px' } },
      },
      h4: {
        fontSize: '20px',
        fontWeight: '600',
        lineHeight: '1.3',
        letterSpacing: '0em',
      },
      h5: {
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '1.4',
        letterSpacing: '0em',
      },
      h6: {
        fontSize: '14px',
        fontWeight: '700',
        lineHeight: '1.4',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      },
      bodyLarge: {
        fontSize: '18px',
        fontWeight: '400',
        lineHeight: '1.6',
        letterSpacing: '0em',
      },
      body: {
        fontSize: '15px',
        fontWeight: '400',
        lineHeight: '1.6',
        letterSpacing: '0em',
      },
      bodySmall: {
        fontSize: '13px',
        fontWeight: '400',
        lineHeight: '1.5',
        letterSpacing: '0.01em',
      },
      caption: {
        fontSize: '11px',
        fontWeight: '500',
        lineHeight: '1.4',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      },
      overline: {
        fontSize: '10px',
        fontWeight: '700',
        lineHeight: '1.2',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      },
    },
    buttons: {
      shape: 'rounded',
      borderRadius: '10px',
      variants: {
        primary: {
          background: '#111827',
          textColor: '#FFFFFF',
          border: 'transparent',
          borderWidth: '0px',
          borderRadius: '10px',
          padding: '12px 24px',
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.05em',
          hoverBackground: '#E11D48',
          hoverTextColor: '#FFFFFF',
          hoverBorder: 'transparent',
        },
        secondary: {
          background: '#F5F5F4',
          textColor: '#1C1917',
          border: '#E7E5E4',
          borderWidth: '1px',
          borderRadius: '10px',
          padding: '12px 24px',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.02em',
          hoverBackground: '#E7E5E4',
          hoverTextColor: '#0C0A09',
          hoverBorder: '#D6D3D1',
        },
        outline: {
          background: 'transparent',
          textColor: '#111827',
          border: '#111827',
          borderWidth: '1.5px',
          borderRadius: '10px',
          padding: '11px 22px',
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.04em',
          hoverBackground: '#111827',
          hoverTextColor: '#FFFFFF',
          hoverBorder: '#111827',
        },
        ghost: {
          background: 'transparent',
          textColor: '#1C1917',
          border: 'transparent',
          borderWidth: '0px',
          borderRadius: '10px',
          padding: '10px 18px',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.02em',
          hoverBackground: 'rgba(0, 0, 0, 0.05)',
          hoverTextColor: '#E11D48',
          hoverBorder: 'transparent',
        },
        link: {
          background: 'transparent',
          textColor: '#E11D48',
          border: 'transparent',
          borderWidth: '0px',
          borderRadius: '0px',
          padding: '0px',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.02em',
          hoverBackground: 'transparent',
          hoverTextColor: '#BE123C',
          hoverBorder: 'transparent',
        },
        danger: {
          background: '#EF4444',
          textColor: '#FFFFFF',
          border: 'transparent',
          borderWidth: '0px',
          borderRadius: '10px',
          padding: '12px 24px',
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.02em',
          hoverBackground: '#DC2626',
          hoverTextColor: '#FFFFFF',
          hoverBorder: 'transparent',
        },
      },
      sizes: {
        small: { padding: '8px 14px', fontSize: '11px' },
        medium: { padding: '12px 22px', fontSize: '13px' },
        large: { padding: '16px 30px', fontSize: '15px' },
      },
    },
    forms: {
      background: '#FFFFFF',
      text: '#1C1917',
      placeholder: '#A8A29E',
      border: '#E7E5E4',
      focusBorder: '#111827',
      focusShadow: '0 0 0 3px rgba(17, 24, 39, 0.1)',
      borderRadius: '10px',
      height: '46px',
      padding: '0 16px',
      fontSize: '14px',
      labelColor: '#44403C',
      errorColor: '#EF4444',
      successColor: '#10B981',
    },
    cards: {
      background: '#FFFFFF',
      border: '#E7E5E4',
      borderWidth: '1px',
      borderRadius: '14px',
      shadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      padding: '24px',
      hoverShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.12)',
      hoverTransform: 'translateY(-3px)',
      productCardDefaults: {
        imageRadius: '10px',
        cardRadius: '14px',
        cardBackground: '#FFFFFF',
        titleFont: 'Plus Jakarta Sans, sans-serif',
        titleColor: '#1C1917',
        priceFont: 'Plus Jakarta Sans, sans-serif',
        priceColor: '#0C0A09',
        comparePriceColor: '#A8A29E',
        badgeStyle: 'solid',
        showWishlist: true,
        showQuickView: true,
        showAddToCart: true,
        hoverEffect: 'zoom',
      },
    },
    badges: {
      borderRadius: '6px',
      padding: '4px 8px',
      fontSize: '10px',
      fontWeight: '800',
      types: {
        new: { background: '#111827', text: '#FFFFFF' },
        sale: { background: '#E11D48', text: '#FFFFFF' },
        soldOut: { background: '#78716C', text: '#FFFFFF' },
        featured: { background: '#F59E0B', text: '#000000' },
        limited: { background: '#8B5CF6', text: '#FFFFFF' },
        custom: { background: '#0D9488', text: '#FFFFFF' },
      },
    },
    links: {
      color: '#1C1917',
      hoverColor: '#E11D48',
      activeColor: '#BE123C',
      underlineMode: 'hover',
      underlineThickness: '1px',
      underlineOffset: '3px',
    },
    icons: {
      family: 'lucide',
      defaultSize: '18px',
      strokeWidth: '1.75px',
      color: '#44403C',
      hoverColor: '#111827',
    },
    borders: {
      none: '0px',
      thin: '1px solid #E7E5E4',
      medium: '2px solid #E7E5E4',
      thick: '3px solid #E7E5E4',
      colors: {
        border: '#E7E5E4',
        borderLight: '#F5F5F4',
        borderDark: '#D6D3D1',
      },
    },
    radius: {
      none: '0px',
      xs: '3px',
      sm: '6px',
      md: '10px',
      lg: '14px',
      xl: '20px',
      '2xl': '28px',
      full: '9999px',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
      '3xl': '64px',
      '4xl': '96px',
    },
    layout: {
      container: {
        small: '960px',
        medium: '1200px',
        large: '1440px',
        full: '100%',
      },
      pagePadding: {
        desktop: '32px',
        tablet: '24px',
        mobile: '16px',
      },
      sectionSpacing: {
        desktop: '80px',
        tablet: '60px',
        mobile: '40px',
      },
    },
    responsive: {
      breakpoints: {
        mobile: '767px',
        tablet: '1023px',
        desktop: '1024px',
      },
    },
    customCss: '',
  };
}

export const THEME_PRESETS: { id: string; name: string; description: string; getTheme: (tenantId: string, storeName: string) => ThemeDocument }[] = [
  {
    id: 'fashion',
    name: 'Fashion & Boutique (JQ Trends / Lumina)',
    description: 'Sophisticated modern couture styling with warm off-white surface, deep charcoal contrast, and elegant Playfair serif titles.',
    getTheme: (tId, name) => {
      const theme = getDefaultTheme(tId, name);
      (theme as any).presetId = 'fashion';
      return theme;
    },
  },
  {
    id: 'luxury',
    name: 'Luxury Atelier & Haute Couture',
    description: 'Deep obsidian black, gleaming imperial gold #D4AF37 accents, Cinzel display typography, and ultra-crisp borders.',
    getTheme: (tId, name) => {
      const theme = getDefaultTheme(tId, name);
      theme.name = `${name} Luxury Atelier`;
      (theme as any).presetId = 'luxury';
      theme.colors.primary = '#0A0A0B';
      theme.colors.accent = '#D4AF37';
      theme.colors.accentHover = '#B89628';
      theme.colors.background = '#0F0F12';
      theme.colors.surface = '#18181D';
      theme.colors.surfaceSecondary = '#22222A';
      theme.colors.text = '#F4F4F5';
      theme.colors.textSecondary = '#A1A1AA';
      theme.colors.heading = '#FFFFFF';
      theme.colors.border = 'rgba(212, 175, 55, 0.2)';
      theme.typography.headingFont = 'Cinzel, serif';
      theme.buttons.shape = 'square';
      theme.buttons.borderRadius = '2px';
      theme.buttons.variants.primary.background = '#D4AF37';
      theme.buttons.variants.primary.textColor = '#0A0A0B';
      theme.buttons.variants.primary.borderRadius = '2px';
      theme.buttons.variants.primary.hoverBackground = '#FFFFFF';
      theme.cards.background = '#18181D';
      theme.cards.border = 'rgba(212, 175, 55, 0.15)';
      theme.cards.borderRadius = '4px';
      theme.cards.productCardDefaults.cardBackground = '#18181D';
      theme.cards.productCardDefaults.titleColor = '#FFFFFF';
      theme.cards.productCardDefaults.priceColor = '#D4AF37';
      return theme;
    },
  },
  {
    id: 'minimal',
    name: 'Minimalist Monochrome Studio',
    description: 'Ultra-clean Scandinavian aesthetic, pure black & pure white palette, geometric Inter sans-serif, and subtle micro-radius.',
    getTheme: (tId, name) => {
      const theme = getDefaultTheme(tId, name);
      theme.name = `${name} Minimalist`;
      (theme as any).presetId = 'minimal';
      theme.colors.primary = '#000000';
      theme.colors.accent = '#000000';
      theme.colors.accentHover = '#333333';
      theme.colors.background = '#FFFFFF';
      theme.colors.surface = '#FAFAFA';
      theme.colors.surfaceSecondary = '#F4F4F5';
      theme.colors.text = '#18181B';
      theme.colors.heading = '#000000';
      theme.colors.border = '#E4E4E7';
      theme.typography.headingFont = 'Inter, sans-serif';
      theme.typography.bodyFont = 'Inter, sans-serif';
      theme.buttons.shape = 'slight';
      theme.buttons.borderRadius = '4px';
      theme.buttons.variants.primary.borderRadius = '4px';
      theme.cards.borderRadius = '6px';
      return theme;
    },
  },
  {
    id: 'modern_vibrant',
    name: 'Modern Vibrant Retail',
    description: 'Dynamic slate blue #0F172A backdrop with electric rose-pink CTA and energetic Outfit geometric sans.',
    getTheme: (tId, name) => {
      const theme = getDefaultTheme(tId, name);
      theme.name = `${name} Modern Vibrant`;
      (theme as any).presetId = 'modern_vibrant';
      theme.colors.primary = '#0F172A';
      theme.colors.accent = '#E11D48';
      theme.colors.accentHover = '#BE123C';
      theme.typography.headingFont = 'Outfit, sans-serif';
      theme.typography.bodyFont = 'Plus Jakarta Sans, sans-serif';
      theme.buttons.shape = 'pill';
      theme.buttons.borderRadius = '9999px';
      theme.buttons.variants.primary.borderRadius = '9999px';
      theme.cards.borderRadius = '20px';
      theme.radius.md = '16px';
      return theme;
    },
  },
  {
    id: 'editorial',
    name: 'Editorial & Literary Magazine',
    description: 'Rich espresso brown, warm terracotta tones, Cormorant Garamond typography for story-driven commerce.',
    getTheme: (tId, name) => {
      const theme = getDefaultTheme(tId, name);
      theme.name = `${name} Editorial`;
      (theme as any).presetId = 'editorial';
      theme.colors.primary = '#292524';
      theme.colors.accent = '#C2410C';
      theme.colors.accentHover = '#9A3412';
      theme.colors.background = '#FAF7F2';
      theme.colors.surface = '#FFFFFF';
      theme.colors.heading = '#1C1917';
      theme.typography.headingFont = 'Cormorant Garamond, serif';
      theme.typography.bodyFont = 'Lora, serif';
      return theme;
    },
  },
  {
    id: 'classic_ecommerce',
    name: 'Classic Multi-Category Marketplace',
    description: 'Trust-inspiring deep navy #1E3A8A, emerald green trust badges, and standard clean commercial radius.',
    getTheme: (tId, name) => {
      const theme = getDefaultTheme(tId, name);
      theme.name = `${name} Classic`;
      (theme as any).presetId = 'classic_ecommerce';
      theme.colors.primary = '#1E3A8A';
      theme.colors.accent = '#10B981';
      theme.colors.accentHover = '#059669';
      theme.typography.headingFont = 'Montserrat, sans-serif';
      theme.typography.bodyFont = 'Roboto, sans-serif';
      theme.buttons.shape = 'rounded';
      theme.buttons.borderRadius = '8px';
      theme.cards.borderRadius = '10px';
      return theme;
    },
  },
];
