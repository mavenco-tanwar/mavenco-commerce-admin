export interface ProductCardConfig {
  id?: string;
  tenantId?: string;
  version?: number;
  status?: 'draft' | 'published';
  name?: string;
  presetId?: string;

  layout: {
    orientation: 'vertical' | 'horizontal' | 'compact' | 'editorial';
    contentAlignment: 'left' | 'center' | 'right';
    padding: string;
    gap: string;
  };

  image: {
    aspectRatio: '1/1' | '4/5' | '3/4' | '4/3' | '16/9' | 'auto';
    objectFit: 'cover' | 'contain';
    hoverEffect: 'second_image' | 'zoom' | 'fade' | 'slide' | 'none';
    borderRadius: string;
    showSecondaryImage: boolean;
  };

  badges: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    style: 'solid' | 'outline' | 'pill' | 'glass';
    showDiscount: boolean;
    discountFormat: 'percent' | 'amount';
    showNew: boolean;
    showSoldOut: boolean;
    customBadges: Array<{
      id: string;
      text: string;
      bgColor: string;
      textColor: string;
    }>;
  };

  wishlist: {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right';
    iconStyle: 'heart' | 'bookmark';
    color: string;
    activeColor: string;
  };

  quickView: {
    enabled: boolean;
    trigger: 'hover' | 'button';
    position: 'center' | 'bottom-card' | 'top-right';
    label: string;
  };

  brand: {
    enabled: boolean;
    fontSize: string;
    color: string;
    textTransform: 'uppercase' | 'none' | 'capitalize';
  };

  title: {
    enabled: boolean;
    maxLines: 1 | 2 | 3 | 0;
    fontSize: string;
    fontWeight: string;
    color: string;
    hoverColor: string;
  };

  subtitle: {
    enabled: boolean;
    fontSize: string;
    color: string;
  };

  rating: {
    enabled: boolean;
    showCount: boolean;
    starColor: string;
    starSize: string;
  };

  price: {
    enabled: boolean;
    fontSize: string;
    fontWeight: string;
    color: string;
    showCompareAt: boolean;
    compareColor: string;
    compareFontSize: string;
  };

  variants: {
    enabled: boolean;
    displayType: 'color_swatches' | 'size_chips' | 'count_badge' | 'none';
    maxVisible: number;
    allowImageSwap: boolean;
    swatchSize: string;
    swatchShape: 'circle' | 'square' | 'rounded';
  };

  addToCart: {
    enabled: boolean;
    style: 'button' | 'icon' | 'quick_sizes' | 'reveal_on_hover';
    variant: 'primary' | 'secondary' | 'outline' | 'ghost';
    text: string;
    borderRadius: string;
    fontSize: string;
    padding: string;
  };

  card: {
    background: string;
    border: string;
    borderWidth: string;
    borderColor: string;
    borderRadius: string;
    shadow: string;
    hoverShadow: string;
    hoverLift: boolean;
  };

  responsive: {
    desktopColumns: number;
    tabletColumns: number;
    mobileColumns: number;
    hideRatingOnMobile: boolean;
    hideSwatchesOnMobile: boolean;
  };

  updatedAt?: string;
  publishedAt?: string;
}
