export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  accentHover: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  heading: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  overlay: string;
  disabled: string;
  white: string;
  black: string;
  heroBackground?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  headerBackground?: string;
  headerText?: string;
  announcementBackground?: string;
  announcementText?: string;
  footerBackground?: string;
  footerHeading?: string;
  footerText?: string;
  cardPrice?: string;
  cardSalePrice?: string;
  gradients?: {
    enabled?: boolean;
    type: 'linear' | 'radial';
    angle: number;
    startColor: string;
    endColor: string;
    opacity: number;
  };
}

export interface TypographyLevel {
  fontFamily?: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  responsive?: {
    tablet?: { fontSize?: string; lineHeight?: string };
    mobile?: { fontSize?: string; lineHeight?: string };
  };
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  navigationFont: string;
  buttonFont: string;
  h1: TypographyLevel;
  h2: TypographyLevel;
  h3: TypographyLevel;
  h4: TypographyLevel;
  h5: TypographyLevel;
  h6: TypographyLevel;
  bodyLarge: TypographyLevel;
  body: TypographyLevel;
  bodySmall: TypographyLevel;
  caption: TypographyLevel;
  overline: TypographyLevel;
}

export interface ButtonVariantStyle {
  background: string;
  textColor: string;
  border: string;
  borderWidth: string;
  borderRadius: string;
  padding: string;
  fontFamily?: string;
  fontSize: string;
  fontWeight: string;
  letterSpacing: string;
  hoverBackground: string;
  hoverTextColor: string;
  hoverBorder: string;
  activeBackground?: string;
}

export interface ThemeButtons {
  shape: 'square' | 'slight' | 'rounded' | 'pill';
  borderRadius: string;
  variants: {
    primary: ButtonVariantStyle;
    secondary: ButtonVariantStyle;
    outline: ButtonVariantStyle;
    ghost: ButtonVariantStyle;
    link: ButtonVariantStyle;
    danger: ButtonVariantStyle;
  };
  sizes: {
    small: { padding: string; fontSize: string };
    medium: { padding: string; fontSize: string };
    large: { padding: string; fontSize: string };
  };
}

export interface ThemeForms {
  background: string;
  text: string;
  placeholder: string;
  border: string;
  focusBorder: string;
  focusShadow: string;
  borderRadius: string;
  height: string;
  padding: string;
  fontSize: string;
  labelColor: string;
  errorColor: string;
  successColor: string;
}

export interface ThemeCards {
  background: string;
  border: string;
  borderWidth: string;
  borderRadius: string;
  shadow: string;
  padding: string;
  hoverShadow: string;
  hoverTransform: string;
  productCardDefaults: {
    imageRadius: string;
    cardRadius: string;
    cardBackground: string;
    titleFont: string;
    titleColor: string;
    priceFont: string;
    priceColor: string;
    comparePriceColor: string;
    badgeStyle: 'solid' | 'subtle' | 'outline';
    showWishlist: boolean;
    showQuickView: boolean;
    showAddToCart: boolean;
    hoverEffect: 'zoom' | 'fade' | 'slide' | 'none';
  };
}

export interface ThemeBadges {
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: string;
  types: {
    new: { background: string; text: string };
    sale: { background: string; text: string };
    soldOut: { background: string; text: string };
    featured: { background: string; text: string };
    limited: { background: string; text: string };
    custom: { background: string; text: string };
  };
}

export interface ThemeLinks {
  color: string;
  hoverColor: string;
  activeColor: string;
  visitedColor?: string;
  underlineMode: 'always' | 'hover' | 'never';
  underlineThickness: string;
  underlineOffset: string;
}

export interface ThemeIcons {
  family: 'lucide' | 'feather' | 'heroicons';
  defaultSize: string;
  strokeWidth: string;
  color: string;
  hoverColor: string;
}

export interface ThemeBorders {
  none: string;
  thin: string;
  medium: string;
  thick: string;
  colors: {
    border: string;
    borderLight: string;
    borderDark: string;
  };
}

export interface ThemeRadius {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  custom?: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeLayout {
  container: {
    small: string;
    medium: string;
    large: string;
    full: string;
  };
  pagePadding: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  sectionSpacing: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
}

export interface ThemeResponsive {
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface ThemeDocument {
  id: string;
  tenantId: string;
  name: string;
  version: number;
  status: 'draft' | 'published';
  colors: ThemeColors;
  typography: ThemeTypography;
  buttons: ThemeButtons;
  forms: ThemeForms;
  cards: ThemeCards;
  badges: ThemeBadges;
  links: ThemeLinks;
  icons: ThemeIcons;
  borders: ThemeBorders;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  spacing: ThemeSpacing;
  layout: ThemeLayout;
  responsive: ThemeResponsive;
  customCss?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}
