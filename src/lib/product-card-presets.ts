import { ProductCardConfig } from '../types/product-card.types';

export function getDefaultProductCardConfig(tenantId: string = 'lumina'): ProductCardConfig {
  return {
    id: `pc_config_${tenantId}`,
    tenantId,
    name: 'Fashion Boutique Default Card',
    status: 'published',
    version: 1,
    layout: {
      orientation: 'vertical',
      contentAlignment: 'left',
      padding: '16px',
      gap: '12px',
    },
    image: {
      aspectRatio: '3/4',
      objectFit: 'cover',
      hoverEffect: 'second_image',
      borderRadius: '8px',
      showSecondaryImage: true,
    },
    badges: {
      enabled: true,
      position: 'top-left',
      style: 'solid',
      showDiscount: true,
      discountFormat: 'percent',
      showNew: true,
      showSoldOut: true,
      customBadges: [],
    },
    wishlist: {
      enabled: true,
      position: 'top-right',
      iconStyle: 'heart',
      color: '#111827',
      activeColor: '#E11D48',
    },
    quickView: {
      enabled: true,
      trigger: 'hover',
      position: 'bottom-card',
      label: 'Quick View',
    },
    brand: {
      enabled: false,
      fontSize: '11px',
      color: '#71717A',
      textTransform: 'uppercase',
    },
    title: {
      enabled: true,
      maxLines: 2,
      fontSize: '14px',
      fontWeight: '600',
      color: '#18181B',
      hoverColor: '#E11D48',
    },
    subtitle: {
      enabled: false,
      fontSize: '12px',
      color: '#A1A1AA',
    },
    rating: {
      enabled: true,
      showCount: true,
      starColor: '#F59E0B',
      starSize: '14px',
    },
    price: {
      enabled: true,
      fontSize: '15px',
      fontWeight: '700',
      color: '#09090B',
      showCompareAt: true,
      compareColor: '#A1A1AA',
      compareFontSize: '12px',
    },
    variants: {
      enabled: true,
      displayType: 'color_swatches',
      maxVisible: 4,
      allowImageSwap: true,
      swatchSize: '14px',
      swatchShape: 'circle',
    },
    addToCart: {
      enabled: true,
      style: 'quick_sizes',
      variant: 'primary',
      text: 'Add to Bag',
      borderRadius: '8px',
      fontSize: '12px',
      padding: '10px 16px',
    },
    card: {
      background: '#FFFFFF',
      border: 'solid',
      borderWidth: '1px',
      borderColor: '#F4F4F5',
      borderRadius: '12px',
      shadow: '0 1px 3px rgba(0,0,0,0.05)',
      hoverShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      hoverLift: true,
    },
    responsive: {
      desktopColumns: 4,
      tabletColumns: 3,
      mobileColumns: 2,
      hideRatingOnMobile: false,
      hideSwatchesOnMobile: false,
    },
  };
}

export const PRODUCT_CARD_PRESETS: {
  id: string;
  name: string;
  description: string;
  getConfig: (tenantId: string) => ProductCardConfig;
}[] = [
  {
    id: 'fashion',
    name: 'Fashion Boutique (JQ Trends / Lumina)',
    description: '3:4 ratio editorial imagery, second-image hover swap, quick size drawer, and floating wishlist trigger.',
    getConfig: (tId) => { const c = getDefaultProductCardConfig(tId); c.presetId = 'fashion'; return c; },
  },
  {
    id: 'luxury',
    name: 'Luxury Haute Couture & Atelier',
    description: 'Minimal borderless card, 4:5 dramatic vertical framing, serif titles, and gold accents.',
    getConfig: (tId) => {
      const c = getDefaultProductCardConfig(tId);
      c.name = 'Luxury Haute Couture Card';
      c.presetId = 'luxury';
      c.image.aspectRatio = '4/5';
      c.image.borderRadius = '2px';
      c.card.borderRadius = '4px';
      c.card.borderColor = 'rgba(212, 175, 55, 0.2)';
      c.card.background = '#FFFFFF';
      c.title.fontSize = '15px';
      c.price.color = '#000000';
      c.addToCart.style = 'button';
      c.addToCart.variant = 'outline';
      c.addToCart.text = 'View Creation';
      return c;
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist Scandinavian Studio',
    description: '1:1 square canvas, clean geometric typography, hidden non-essentials, and high-contrast styling.',
    getConfig: (tId) => {
      const c = getDefaultProductCardConfig(tId);
      c.name = 'Minimalist Studio Card';
      c.presetId = 'minimalist';
      c.image.aspectRatio = '1/1';
      c.image.borderRadius = '0px';
      c.card.borderRadius = '0px';
      c.card.shadow = 'none';
      c.card.hoverShadow = 'none';
      c.card.hoverLift = false;
      c.rating.enabled = false;
      c.addToCart.style = 'icon';
      return c;
    },
  },
  {
    id: 'modern_vibrant',
    name: 'Modern Vibrant Retail',
    description: 'Rounded pill badges, electric accents, animated Add to Cart bar, and rating pill.',
    getConfig: (tId) => {
      const c = getDefaultProductCardConfig(tId);
      c.name = 'Modern Vibrant Card';
      c.presetId = 'modern_vibrant';
      c.image.aspectRatio = '4/5';
      c.image.borderRadius = '14px';
      c.card.borderRadius = '18px';
      c.badges.style = 'pill';
      c.addToCart.borderRadius = '9999px';
      c.addToCart.variant = 'primary';
      return c;
    },
  },
  {
    id: 'compact',
    name: 'High-Density Catalog Grid',
    description: 'Compact height for bulk multi-category browsing with small price points and direct Add button.',
    getConfig: (tId) => {
      const c = getDefaultProductCardConfig(tId);
      c.name = 'Compact Catalog Card';
      c.presetId = 'compact';
      c.image.aspectRatio = '1/1';
      c.layout.padding = '10px';
      c.title.fontSize = '12px';
      c.title.maxLines = 1;
      c.price.fontSize = '13px';
      c.responsive.desktopColumns = 5;
      c.responsive.tabletColumns = 4;
      c.responsive.mobileColumns = 2;
      return c;
    },
  },
  {
    id: 'editorial',
    name: 'Magazine & Lifestyle Editorial',
    description: 'Spacious storytelling layout with brand badges, subtitled product notes, and center alignment.',
    getConfig: (tId) => {
      const c = getDefaultProductCardConfig(tId);
      c.name = 'Editorial Story Card';
      c.presetId = 'editorial';
      c.layout.contentAlignment = 'center';
      c.image.aspectRatio = '3/4';
      c.brand.enabled = true;
      c.subtitle.enabled = true;
      c.rating.enabled = true;
      return c;
    },
  },
];
