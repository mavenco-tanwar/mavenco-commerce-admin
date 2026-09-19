'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Save,
  Eye,
  EyeOff,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Calendar,
  X,
  Monitor,
  Tablet,
  Smartphone,
  MoveUp,
  MoveDown,
  Trash2,
  Copy,
  Edit,
  GripVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  ShoppingBag,
  Tag,
  Sliders,
  Type,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Share2,
  HelpCircle,
  Clock as CountdownIcon,
  Code,
  Minus,
  Check,
  Loader2,
  FolderTree,
  Boxes,
  Palette,
  Search,
  ArrowRight,
  Play,
  Pause,
  Settings2,
  Maximize2,
  Grid,
  Star,
  Award,
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  SlidersHorizontal,
  Info,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';
import { CategoryService } from '@/services/categories';

interface HeroSlide {
  id: string;
  tagline?: string;
  title?: string;
  subtitle?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  desktopImage?: string;
  mobileImage?: string;
  overlayOpacity?: number;
  overlayColor?: string;
  bgColor?: string;
  contentAlign?: 'left' | 'center' | 'right';
  textColor?: string;
}

interface HomepageSection {
  id: string;
  type: string;
  name: string;
  subtitle?: string;
  badge?: string;
  enabled: boolean;
  order: number;
  data: Record<string, any>;
  styles?: Record<string, any>;
  responsive?: {
    desktop?: { visible?: boolean };
    tablet?: { visible?: boolean };
    mobile?: { visible?: boolean };
  };
}

interface HomepageDocument {
  id: string;
  tenantSlug: string;
  name: string;
  type: 'homepage';
  status: 'draft' | 'published';
  version: number;
  sections: HomepageSection[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  settings?: {
    headerTransparent?: boolean;
    pageBackground?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

const SECTION_TEMPLATES = [
  {
    type: 'hero_slider',
    name: 'Multi-Slide Hero Carousel (Slider)',
    description: 'Immersive sliding hero with multi-slide storytelling, autoplay timer, arrows, and pagination dots.',
    icon: Sparkles,
    category: 'HERO & PROMO',
    defaultData: {
      layout: 'slider',
      autoplay: true,
      autoplayInterval: 5000,
      showArrows: true,
      showDots: true,
      pauseOnHover: true,
      minHeight: '700px',
      buttonPlacement: 'center',
      buttonOrientation: 'inline',
      btnBorderRadius: '8px',
      primaryBtnColor: '#E11D48',
      primaryBtnTextColor: '#FFFFFF',
      secondaryBtnColor: '#FFFFFF',
      secondaryBtnTextColor: '#111827',
      slides: [
        {
          id: 'slide-1',
          tagline: 'HAUTE ATELIER DROP 2026',
          title: 'Timeless Elegance Redefined',
          subtitle: 'Experience runway-inspired luxury handcrafted with ethical organic textiles and artisan precision.',
          primaryBtnText: 'EXPLORE NEW ARRIVALS',
          primaryBtnLink: '/collections',
          secondaryBtnText: 'OUR HERITAGE',
          secondaryBtnLink: '/about',
          desktopImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
          overlayOpacity: 45,
          overlayColor: '#000000',
          contentAlign: 'center',
        },
        {
          id: 'slide-2',
          tagline: 'SUMMER RUNWAY EDIT',
          title: 'Effortless Modern Silhouettes',
          subtitle: 'Breathable chanderi silk and structured linen essentials designed for seamless transition from day to evening.',
          primaryBtnText: 'SHOP SUMMER EDIT',
          primaryBtnLink: '/collections/summer',
          secondaryBtnText: 'VIEW LOOKBOOK',
          secondaryBtnLink: '/lookbook',
          desktopImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
          overlayOpacity: 40,
          overlayColor: '#000000',
          contentAlign: 'center',
        },
        {
          id: 'slide-3',
          tagline: 'PRIVATE ATELIER ACCESS',
          title: 'Bridal & Ceremonial Couture',
          subtitle: 'Hand-embroidered zardozi and artisanal motifs tailored exclusively for celebratory moments.',
          primaryBtnText: 'REQUEST CONSULTATION',
          primaryBtnLink: '/contact',
          secondaryBtnText: 'DISCOVER BRIDAL',
          secondaryBtnLink: '/bridal',
          desktopImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
          overlayOpacity: 50,
          overlayColor: '#000000',
          contentAlign: 'center',
        },
      ],
    },
  },
  {
    type: 'hero',
    name: 'Full-Width Hero Banner',
    description: 'Immersive visual header with headline, subtitle, dual CTAs, layout variants, and background media.',
    icon: LayoutTemplate,
    category: 'HERO & PROMO',
    defaultData: {
      tagline: 'SPRING DROP 2026',
      heading: 'Elegance Designed For You',
      subheading: 'Discover bespoke tailoring and handcrafted essentials engineered for modern living.',
      primaryBtnText: 'SHOP THE COLLECTION',
      primaryBtnLink: '/collections',
      secondaryBtnText: 'EXPLORE LOOKBOOK',
      secondaryBtnLink: '/about',
      bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
      overlayOpacity: 40,
      overlayColor: '#000000',
      contentAlign: 'center',
      layout: 'centered',
      minHeight: '650px',
      buttonPlacement: 'center',
      buttonOrientation: 'inline',
      btnBorderRadius: '8px',
      primaryBtnColor: '#E11D48',
      primaryBtnTextColor: '#FFFFFF',
      secondaryBtnColor: '#FFFFFF',
      secondaryBtnTextColor: '#111827',
    },
  },
  {
    type: 'collections',
    name: 'Curated Collections & Lookbooks',
    description: 'Showcase seasonal lookbooks, bridal edits, and curated boutique stories with dynamic catalog bindings.',
    icon: Boxes,
    category: 'COMMERCE',
    defaultData: {
      tagline: 'CURATED ATELIER STORIES',
      heading: 'Collections & Lookbooks',
      subheading: 'Curate seasonal edits, attach lookbook products, and organize fashion stories for your boutique.',
      primaryBtnText: 'VIEW ALL COLLECTIONS & LOOKBOOKS',
      primaryBtnLink: '/collections',
    },
  },
  {
    type: 'value_props',
    name: 'Brand Value Propositions & Guarantees',
    description: '4-column highlight cards showcasing brand guarantees, quality commitments, and doorstep shipping perks.',
    icon: Sparkles,
    category: 'CONTENT',
    defaultData: {
      heading: 'Brand Value Propositions',
      items: [
        {
          icon: 'sparkles',
          title: 'Trendy Collections',
          description: 'Handpicked, fashion-forward silhouettes updated every week.',
        },
        {
          icon: 'award',
          title: 'Premium Quality',
          description: 'Breathable, skin-friendly fabrics crafted with utmost attention to detail.',
        },
        {
          icon: 'tag',
          title: 'Affordable Luxury',
          description: 'Runway-inspired luxury aesthetics at direct-to-consumer prices.',
        },
        {
          icon: 'truck',
          title: 'Easy Delivery & Returns',
          description: 'Complimentary express delivery with hassle-free doorstep returns.',
        },
      ],
    },
  },
  {
    type: 'products_grid',
    name: 'Featured Products Grid',
    description: 'Dynamic product grid query (Newest, Best Selling, On Sale) with responsive columns.',
    icon: ShoppingBag,
    category: 'COMMERCE',
    defaultData: {
      heading: 'Featured Essentials',
      subtitle: 'Curated artisanal pieces crafted for timeless versatility.',
      querySource: 'best_sellers',
      columnsDesktop: 4,
      columnsTablet: 2,
      columnsMobile: 1,
      limit: 8,
      showViewAll: true,
      viewAllLink: '/collections',
    },
  },
  {
    type: 'product_carousel',
    name: 'Product Carousel / Slider',
    description: 'Smooth sliding product carousel with swipe navigation and auto-rotation.',
    icon: Sparkles,
    category: 'COMMERCE',
    defaultData: {
      heading: 'Trending Now',
      subtitle: 'Most coveted silhouettes of the season.',
      querySource: 'trending',
      autoplay: true,
      slidesDesktop: 4,
      slidesMobile: 1,
    },
  },
  {
    type: 'categories',
    name: 'Shop by Category Tiles',
    description: 'Visual category cards with hover zoom and product count badges.',
    icon: FolderTree,
    category: 'COMMERCE',
    defaultData: {
      heading: 'Shop By Category',
      subtitle: 'Explore curated departments crafted with premium materials.',
      categoriesList: [
        { label: 'Women', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', href: '/women', count: '48 Items', badge: 'Trending' },
        { label: 'Men', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop', href: '/men', count: '36 Items', badge: 'New Season' },
        { label: 'Kids', image: 'https://images.unsplash.com/photo-1503944547408-b6559a445e0f?q=80&w=800&auto=format&fit=crop', href: '/kids', count: '24 Items', badge: 'Popular' },
        { label: 'Accessories', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', href: '/accessories', count: '18 Items', badge: 'Atelier' },
      ],
    },
  },
  {
    type: 'image_text',
    name: 'Split Image + Story Editorial',
    description: '2-column editorial story with high-resolution imagery and brand narrative.',
    icon: ImageIcon,
    category: 'CONTENT',
    defaultData: {
      tagline: 'OUR HERITAGE',
      heading: 'Artisanal Craftsmanship & Ethical Textiles',
      description: 'Each piece is cut and assembled by master artisans using organic chanderi silk and sustainably sourced linen.',
      btnText: 'READ OUR STORY',
      btnLink: '/about',
      imagePosition: 'left',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    type: 'promotional_banner',
    name: 'Promotional Campaign Banner',
    description: 'High-impact conversion banner with background accent and discount messaging.',
    icon: Tag,
    category: 'HERO & PROMO',
    defaultData: {
      tagline: 'LIMITED TIME ATELIER PRIVILEGE',
      heading: 'Complimentary Express Worldwide Shipping',
      description: 'Enjoy door-to-door express delivery on all orders above $200. No coupon code needed.',
      btnText: 'CLAIM PRIVILEGE',
      btnLink: '/collections',
      bgColor: '#111827',
      textColor: '#FFFFFF',
    },
  },
  {
    type: 'countdown',
    name: 'Flash Sale Countdown Timer',
    description: 'Live urgency countdown clock for private flash sales and limited releases.',
    icon: CountdownIcon,
    category: 'HERO & PROMO',
    defaultData: {
      heading: 'Private Seasonal Flash Sale',
      subtitle: 'Enjoy up to 30% OFF selected archive silhouettes before release closes.',
      targetDate: '2026-10-31T23:59:59',
      btnText: 'SHOP SALE NOW',
      btnLink: '/sale',
    },
  },
  {
    type: 'newsletter',
    name: 'VIP Newsletter Box',
    description: 'Email capture form with incentive description and privacy assurance.',
    icon: Sliders,
    category: 'COMMERCE',
    defaultData: {
      heading: 'Join The Private Circle',
      description: 'Subscribe to receive private collection previews, seasonal trunk shows, and exclusive atelier access.',
      placeholder: 'Enter your email address...',
      btnText: 'SUBSCRIBE',
      successMsg: 'Welcome to our private circle.',
    },
  },
  {
    type: 'testimonials',
    name: 'Customer Reviews & Press Quotes',
    description: 'Verified customer feedback quotes with star ratings and avatar images.',
    icon: MessageSquare,
    category: 'SOCIAL PROOF',
    defaultData: {
      heading: 'What Our Patrons Say',
      subtitle: 'Read authentic reflections from clientele across the globe.',
      testimonialsList: [
        { name: 'Elena Rostova', role: 'Verified Collector', text: 'The drape of the chanderi silk co-ord is unmatched. Exquisite craftsmanship and rapid delivery.', rating: 5 },
        { name: 'Aria Montgomery', role: 'Fashion Stylist', text: 'Mavenco standards are world-class. The luxury packaging and stitch precision exceeded expectations.', rating: 5 },
      ],
    },
  },
  {
    type: 'brands',
    name: 'Brand Partners & Press Logos',
    description: 'Monochrome partner logos with grayscale hover effect.',
    icon: Sparkles,
    category: 'SOCIAL PROOF',
    defaultData: {
      heading: 'AS FEATURED IN',
      logos: ['VOGUE', 'HARPER’S BAZAAR', 'ELLE', 'GQ', 'FORBES'],
    },
  },
  {
    type: 'faq',
    name: 'FAQ Accordions',
    description: 'Expandable frequently asked questions list for customer concierge clarity.',
    icon: HelpCircle,
    category: 'CONTENT',
    defaultData: {
      heading: 'Frequently Asked Questions',
      subtitle: 'Instant answers to concierge, shipping, and bespoke care inquiries.',
      faqList: [
        { q: 'What is the shipping timeframe for international orders?', a: 'Standard international dispatch takes 3–5 business days via DHL Express.' },
        { q: 'How do returns and atelier exchanges work?', a: 'We offer complimentary 7-day doorstep returns and size exchanges.' },
      ],
    },
  },
  {
    type: 'social_grid',
    name: 'Instagram / Social Gallery',
    description: 'Dynamic social photo grid showcasing community looks.',
    icon: Share2,
    category: 'SOCIAL PROOF',
    defaultData: {
      heading: 'Styled by You • #MavencoAtelier',
      subtitle: 'Tag your looks on Instagram for a chance to be featured.',
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop',
      ],
    },
  },
  {
    type: 'spacer',
    name: 'Vertical Spacer',
    description: 'Customizable whitespace rhythm between sections.',
    icon: Minus,
    category: 'UTILITIES',
    defaultData: {
      heightDesktop: '60px',
      heightMobile: '30px',
    },
  },
];

function getDefaultHomepageDocument(tenantSlug: string = 'lumina', storeName: string = 'Lumina Atelier'): HomepageDocument {
  const dynamicName = storeName || tenantSlug.toUpperCase();

  return {
    id: `homepage_${tenantSlug}`,
    tenantSlug,
    name: 'Main Storefront Homepage',
    type: 'homepage',
    status: 'published',
    version: 1,
    settings: {
      headerTransparent: true,
      pageBackground: '#FAFAF9',
    },
    seo: {
      metaTitle: `${dynamicName} — Artisanal Luxury Fashion & Boutiques`,
      metaDescription: `Discover bespoke collections, precision tailoring, and modern lifestyle essentials at ${dynamicName}.`,
    },
    sections: [
      {
        id: 'sec_hero',
        type: 'hero',
        name: 'Hero Section / Multi-Slide Carousel',
        subtitle: 'Main storefront entry visual banner with slider, layout options, and custom CTA styling.',
        badge: '1',
        enabled: true,
        order: 1,
        data: {
          layout: 'slider',
          autoplay: true,
          autoplayInterval: 5000,
          showArrows: true,
          showDots: true,
          pauseOnHover: true,
          minHeight: '700px',
          buttonPlacement: 'center',
          buttonOrientation: 'inline',
          btnBorderRadius: '8px',
          primaryBtnColor: '#E11D48',
          primaryBtnTextColor: '#FFFFFF',
          secondaryBtnColor: '#FFFFFF',
          secondaryBtnTextColor: '#111827',
          tagline: 'SPRING DROP 2026',
          heading: 'Elegance Designed For You',
          subheading: `Discover bespoke tailoring and handcrafted essentials by ${dynamicName}.`,
          primaryBtnText: 'SHOP THE COLLECTION',
          primaryBtnLink: '/collections',
          secondaryBtnText: 'EXPLORE LOOKBOOK',
          secondaryBtnLink: '/about',
          bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
          desktopImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
          overlayOpacity: 45,
          overlayColor: '#000000',
          contentAlign: 'center',
          slides: [
            {
              id: 'slide-1',
              tagline: 'HAUTE ATELIER DROP 2026',
              title: 'Timeless Elegance Redefined',
              subtitle: `Experience runway-inspired luxury handcrafted with ethical organic textiles by ${dynamicName}.`,
              primaryBtnText: 'EXPLORE NEW ARRIVALS',
              primaryBtnLink: '/collections',
              secondaryBtnText: 'OUR HERITAGE',
              secondaryBtnLink: '/about',
              desktopImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
              overlayOpacity: 45,
              overlayColor: '#000000',
              contentAlign: 'center',
            },
            {
              id: 'slide-2',
              tagline: 'SUMMER RUNWAY EDIT',
              title: 'Effortless Modern Silhouettes',
              subtitle: 'Breathable chanderi silk and structured linen essentials designed for seamless day-to-evening style.',
              primaryBtnText: 'SHOP SUMMER EDIT',
              primaryBtnLink: '/collections/summer',
              secondaryBtnText: 'VIEW LOOKBOOK',
              secondaryBtnLink: '/lookbook',
              desktopImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
              overlayOpacity: 40,
              overlayColor: '#000000',
              contentAlign: 'center',
            },
            {
              id: 'slide-3',
              tagline: 'PRIVATE ATELIER ACCESS',
              title: 'Bridal & Ceremonial Couture',
              subtitle: 'Hand-embroidered zardozi and artisanal motifs tailored exclusively for celebratory moments.',
              primaryBtnText: 'REQUEST CONSULTATION',
              primaryBtnLink: '/contact',
              secondaryBtnText: 'DISCOVER BRIDAL',
              secondaryBtnLink: '/bridal',
              desktopImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
              overlayOpacity: 50,
              overlayColor: '#000000',
              contentAlign: 'center',
            },
          ],
        },
      },
      {
        id: 'sec_categories',
        type: 'categories',
        name: 'Shop by Category Tiles',
        subtitle: 'Curated 4-column department cards with hover zoom.',
        badge: '2',
        enabled: true,
        order: 2,
        data: {
          heading: 'Shop By Category',
          subtitle: 'Explore curated departments crafted with fine textiles.',
          categoriesList: [
            { label: 'Women', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', href: '/women', count: '48 Items', badge: 'Trending' },
            { label: 'Men', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop', href: '/men', count: '36 Items', badge: 'New Season' },
            { label: 'Kids', image: 'https://images.unsplash.com/photo-1503944547408-b6559a445e0f?q=80&w=800&auto=format&fit=crop', href: '/kids', count: '24 Items', badge: 'Popular' },
            { label: 'Collections', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', href: '/collections', count: '18 Items', badge: 'Atelier' },
          ],
        },
      },
      {
        id: 'sec_products',
        type: 'products_grid',
        name: 'Featured Best Sellers Grid',
        subtitle: 'Dynamic 4-column product grid populated from catalog.',
        badge: '3',
        enabled: true,
        order: 3,
        data: {
          heading: 'Featured Essentials',
          subtitle: 'Curated artisanal pieces crafted for timeless versatility.',
          querySource: 'best_sellers',
          columnsDesktop: 4,
          columnsTablet: 2,
          columnsMobile: 1,
          limit: 8,
          showViewAll: true,
          viewAllLink: '/collections',
        },
      },
      {
        id: 'sec_promo',
        type: 'promotional_banner',
        name: 'Promotional Campaign Banner',
        subtitle: 'High-impact campaign banner highlighting free shipping.',
        badge: '4',
        enabled: true,
        order: 4,
        data: {
          tagline: 'LIMITED TIME PRIVILEGE',
          heading: 'Complimentary Express Doorstep Shipping',
          description: 'Enjoy door-to-door express delivery on all orders above $200. Hand-packaged with care.',
          btnText: 'CLAIM PRIVILEGE',
          btnLink: '/collections',
          bgColor: '#0F172A',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'sec_value_props',
        type: 'value_props',
        name: 'Brand Value Propositions',
        subtitle: '4-column highlight cards with icons & commitments.',
        badge: '5',
        enabled: true,
        order: 5,
        data: {
          heading: 'Why Shop With Us',
          items: [
            { icon: 'sparkles', title: 'Trendy Collections', description: 'Handpicked, fashion-forward silhouettes updated every week.' },
            { icon: 'award', title: 'Premium Quality', description: 'Breathable, skin-friendly fabrics crafted with utmost attention.' },
            { icon: 'tag', title: 'Affordable Luxury', description: 'Runway-inspired luxury aesthetics at direct prices.' },
            { icon: 'truck', title: 'Easy Delivery & Returns', description: 'Complimentary express delivery with hassle-free doorstep returns.' },
          ],
        },
      },
      {
        id: 'sec_editorial',
        type: 'image_text',
        name: 'Split Editorial Story',
        subtitle: 'Brand heritage story with artisanal photography.',
        badge: '6',
        enabled: true,
        order: 6,
        data: {
          tagline: 'OUR ATELIER STORY',
          heading: 'Artisanal Craftsmanship & Ethical Textiles',
          description: 'Each piece is cut and assembled by master artisans using organic chanderi silk and sustainably sourced linen.',
          btnText: 'READ OUR STORY',
          btnLink: '/about',
          imagePosition: 'left',
          image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop',
        },
      },
      {
        id: 'sec_testimonials',
        type: 'testimonials',
        name: 'Customer Reviews & Quotes',
        subtitle: 'Verified clientele feedback cards.',
        badge: '7',
        enabled: true,
        order: 7,
        data: {
          heading: 'What Our Patrons Say',
          subtitle: 'Read authentic reflections from clientele across the globe.',
          testimonialsList: [
            { name: 'Elena Rostova', role: 'Verified Collector', text: 'The drape of the chanderi silk co-ord is unmatched. Exquisite craftsmanship and rapid delivery.', rating: 5 },
            { name: 'Aria Montgomery', role: 'Fashion Stylist', text: 'Mavenco standards are world-class. The luxury packaging and stitch precision exceeded expectations.', rating: 5 },
          ],
        },
      },
      {
        id: 'sec_newsletter',
        type: 'newsletter',
        name: 'VIP Newsletter Box',
        subtitle: 'Subscriber acquisition capture box.',
        badge: '8',
        enabled: true,
        order: 8,
        data: {
          heading: 'Join The Private Circle',
          description: 'Subscribe to receive private collection previews, seasonal trunk shows, and exclusive atelier access.',
          placeholder: 'Enter your email address...',
          btnText: 'SUBSCRIBE',
          successMsg: 'Welcome to our private circle.',
        },
      },
    ],
  };
}

export default function HomepageBuilderStudio() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'canvas' | 'library' | 'catalog' | 'responsive' | 'seo'>('canvas');
  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals & State
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'layout' | 'content' | 'styles' | 'responsive'>('layout');
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [simulatorSlideIdx, setSimulatorSlideIdx] = useState<number>(0);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);

  // Core Configuration State
  const [doc, setDoc] = useState<HomepageDocument>(getDefaultHomepageDocument('lumina', 'Lumina Atelier'));

  // Drag and Drop State
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<HomepageDocument[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const pushHistory = (newDoc: HomepageDocument) => {
    const next = history.slice(0, historyIdx + 1);
    next.push(JSON.parse(JSON.stringify(newDoc)));
    setHistory(next);
    setHistoryIdx(next.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setDoc(JSON.parse(JSON.stringify(prev)));
      setHistoryIdx(historyIdx - 1);
      showToast('Undo performed', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setDoc(JSON.parse(JSON.stringify(next)));
      setHistoryIdx(historyIdx + 1);
      showToast('Redo performed', 'info');
    }
  };

  // Load Initial Document
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const tenant = PlatformService.getActiveTenant();
        setActiveTenant(tenant);
        const slug = (tenant?.slug || 'lumina').toLowerCase().trim();

        const res = await ApiClient.get<any>(`/api/v1/content/homepage?tenant=${slug}&preview=draft&_t=${Date.now()}`);
        if (res.data?.sections && Array.isArray(res.data.sections) && res.data.sections.length > 0) {
          const initial: HomepageDocument = {
            id: res.data.id || `homepage_${slug}`,
            tenantSlug: slug,
            name: res.data.name || 'Main Storefront Homepage',
            type: 'homepage',
            status: res.data.status || 'published',
            version: res.data.version || 1,
            sections: res.data.sections.map((s: any, idx: number) => ({
              id: s.id || `sec_${idx + 1}`,
              type: s.type || 'hero',
              name: s.name || s.title || `Section ${idx + 1}`,
              subtitle: s.subtitle || s.description || '',
              badge: String(idx + 1),
              enabled: s.enabled !== false && s.isVisible !== false,
              order: s.order || s.displayOrder || idx + 1,
              data: s.data || s.settings || {},
              styles: s.styles || {},
              responsive: s.responsive || { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
            })),
            seo: res.data.seo || {},
            settings: res.data.settings || {},
          };
          setDoc(initial);
          setHistory([JSON.parse(JSON.stringify(initial))]);
          setHistoryIdx(0);
        } else {
          const initial = getDefaultHomepageDocument(slug, tenant?.name || 'Lumina Atelier');
          setDoc(initial);
          setHistory([JSON.parse(JSON.stringify(initial))]);
          setHistoryIdx(0);
        }
      } catch (err) {
        console.warn('Failed to fetch homepage from CMS API, using default seed:', err);
        const t = PlatformService.getActiveTenant();
        const initial = getDefaultHomepageDocument(t?.slug || 'lumina', t?.name || 'Lumina Atelier');
        setDoc(initial);
        setHistory([JSON.parse(JSON.stringify(initial))]);
        setHistoryIdx(0);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const slug = activeTenant?.slug || doc.tenantSlug || 'lumina';
      await ApiClient.put(`/api/v1/content/homepage?tenant=${slug}`, {
        ...doc,
        tenantSlug: slug,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      });
      showToast('Draft homepage saved to MongoDB Atlas', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Live
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const slug = activeTenant?.slug || doc.tenantSlug || 'lumina';
      const nextVersion = (doc.version || 1) + 1;
      const pubDoc: HomepageDocument = {
        ...doc,
        tenantSlug: slug,
        version: nextVersion,
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ApiClient.put(`/api/v1/content/homepage?tenant=${slug}`, pubDoc);
      setDoc(pubDoc);
      pushHistory(pubDoc);
      showToast(`Homepage Version ${nextVersion} published live to storefront!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish live', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Section Management Handlers
  const handleAddSection = (templateType: string) => {
    const tmpl = SECTION_TEMPLATES.find((t) => t.type === templateType);
    if (!tmpl) return;

    const newIdx = doc.sections.length + 1;
    const newSection: HomepageSection = {
      id: `sec_${templateType}_${Date.now()}`,
      type: tmpl.type,
      name: tmpl.name,
      subtitle: tmpl.description,
      badge: String(newIdx),
      enabled: true,
      order: newIdx,
      data: JSON.parse(JSON.stringify(tmpl.defaultData)),
      responsive: {
        desktop: { visible: true },
        tablet: { visible: true },
        mobile: { visible: true },
      },
    };

    const next = { ...doc, sections: [...doc.sections, newSection] };
    setDoc(next);
    pushHistory(next);
    setActiveTab('canvas');
    showToast(`Added ${newSection.name}`, 'info');
  };

  const handleDeleteSection = (secId: string) => {
    if (doc.sections.length <= 1) {
      showToast('You must keep at least one homepage section.', 'info');
      return;
    }
    const nextSections = doc.sections
      .filter((s) => s.id !== secId)
      .map((s, idx) => ({ ...s, order: idx + 1, badge: String(idx + 1) }));
    const next = { ...doc, sections: nextSections };
    setDoc(next);
    pushHistory(next);
    showToast('Section removed', 'info');
  };

  const handleDuplicateSection = (secId: string) => {
    const target = doc.sections.find((s) => s.id === secId);
    if (!target) return;
    const cloned: HomepageSection = JSON.parse(JSON.stringify(target));
    cloned.id = `sec_${cloned.type}_copy_${Date.now()}`;
    cloned.name = `${cloned.name} (Copy)`;
    cloned.order = doc.sections.length + 1;
    cloned.badge = String(doc.sections.length + 1);

    const next = { ...doc, sections: [...doc.sections, cloned] };
    setDoc(next);
    pushHistory(next);
    showToast('Section duplicated', 'info');
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const list = [...doc.sections];
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    const next = {
      ...doc,
      sections: list.map((s, i) => ({ ...s, order: i + 1, badge: String(i + 1) })),
    };
    setDoc(next);
    pushHistory(next);
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedSectionIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedSectionIndex === null || draggedSectionIndex === targetIndex) {
      setDraggedSectionIndex(null);
      setDragOverIndex(null);
      return;
    }

    const list = [...doc.sections];
    const [moved] = list.splice(draggedSectionIndex, 1);
    list.splice(targetIndex, 0, moved);

    const next = {
      ...doc,
      sections: list.map((s, i) => ({ ...s, order: i + 1, badge: String(i + 1) })),
    };

    setDoc(next);
    pushHistory(next);
    setDraggedSectionIndex(null);
    setDragOverIndex(null);
    showToast('Sections reordered', 'info');
  };

  // Section Customization Helper Functions
  const handleOpenInspector = (section: HomepageSection) => {
    setEditingSection(section);
    setInspectorTab('layout');
    setActiveSlideIdx(0);
  };

  const handleUpdateEditingSection = (updated: Partial<HomepageSection>) => {
    if (!editingSection) return;
    const modified = { ...editingSection, ...updated };
    setEditingSection(modified);

    const nextSections = doc.sections.map((s) => (s.id === editingSection.id ? modified : s));
    const next = { ...doc, sections: nextSections };
    setDoc(next);
    pushHistory(next);
  };

  const updateSectionData = (key: string, value: any) => {
    if (!editingSection) return;
    const nextData = { ...(editingSection.data || {}), [key]: value };
    handleUpdateEditingSection({ data: nextData });
  };

  const updateSectionMultipleData = (patch: Record<string, any>) => {
    if (!editingSection) return;
    const nextData = { ...(editingSection.data || {}), ...patch };
    handleUpdateEditingSection({ data: nextData });
  };

  const updateSectionStyles = (key: string, value: any) => {
    if (!editingSection) return;
    const nextStyles = { ...(editingSection.styles || {}), [key]: value };
    handleUpdateEditingSection({ styles: nextStyles });
  };

  const updateSectionResponsive = (targetDevice: 'desktop' | 'tablet' | 'mobile', visible: boolean) => {
    if (!editingSection) return;
    const currentResp = editingSection.responsive || {
      desktop: { visible: true },
      tablet: { visible: true },
      mobile: { visible: true },
    };
    const nextResp = {
      ...currentResp,
      [targetDevice]: { ...currentResp[targetDevice], visible },
    };
    handleUpdateEditingSection({ responsive: nextResp });
  };

  // Slide Management Handlers for Hero Slider
  const handleAddSlide = () => {
    if (!editingSection) return;
    const currentSlides = editingSection.data?.slides || [];
    const newSlide: HeroSlide = {
      id: `slide_${Date.now()}`,
      tagline: 'EXCLUSIVE ATELIER DROP',
      title: 'Haute Couture & Bespoke Tailoring',
      subtitle: 'Handcrafted silhouettes made from organic chanderi silk and fine sustainable wool.',
      primaryBtnText: 'EXPLORE COLLECTION',
      primaryBtnLink: '/collections',
      secondaryBtnText: 'VIEW LOOKBOOK',
      secondaryBtnLink: '/about',
      desktopImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
      mobileImage: '',
      overlayOpacity: 45,
      overlayColor: '#000000',
      contentAlign: 'center',
    };
    const nextSlides = [...currentSlides, newSlide];
    updateSectionData('slides', nextSlides);
    setActiveSlideIdx(nextSlides.length - 1);
    showToast('New slide added to carousel', 'success');
  };

  const handleUpdateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    if (!editingSection) return;
    const currentSlides = [...(editingSection.data?.slides || [])];
    if (!currentSlides[idx]) return;
    currentSlides[idx] = { ...currentSlides[idx], ...patch };
    updateSectionData('slides', currentSlides);
  };

  const handleDeleteSlide = (idx: number) => {
    if (!editingSection) return;
    const currentSlides = [...(editingSection.data?.slides || [])];
    if (currentSlides.length <= 1) {
      showToast('Carousel requires at least one slide', 'info');
      return;
    }
    currentSlides.splice(idx, 1);
    updateSectionData('slides', currentSlides);
    setActiveSlideIdx(Math.max(0, idx - 1));
    showToast('Slide removed', 'info');
  };

  const handleMoveSlide = (idx: number, dir: 'left' | 'right') => {
    if (!editingSection) return;
    const currentSlides = [...(editingSection.data?.slides || [])];
    const targetIdx = dir === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentSlides.length) return;
    const temp = currentSlides[idx];
    currentSlides[idx] = currentSlides[targetIdx];
    currentSlides[targetIdx] = temp;
    updateSectionData('slides', currentSlides);
    setActiveSlideIdx(targetIdx);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading {activeTenant?.name ? `${activeTenant.name} ` : ''}Homepage Studio...
        </span>
      </div>
    );
  }

  const isHeroOrSlider =
    editingSection?.type === 'hero' ||
    editingSection?.type === 'slider' ||
    editingSection?.type === 'hero_slider' ||
    editingSection?.type === 'hero-slider';

  const isSliderMode = isHeroOrSlider && (editingSection?.data?.layout === 'slider' || editingSection?.type === 'hero_slider' || editingSection?.type === 'slider');

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans">
      {/* 1. TOP EXECUTIVE APP BAR */}
      <header className="h-16 border-b border-slate-800/80 bg-[#090D15]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-white">Homepage Visual Studio</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                PRO BUILDER
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tenant: <span className="text-slate-200 font-semibold">{activeTenant?.name || doc.tenantSlug}</span> &bull; {doc.sections.length} Sections Configured
            </p>
          </div>
        </div>

        {/* Center Device & Preview Controls */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setDevice('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === 'desktop' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === 'tablet' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === 'mobile' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* History Undo / Redo */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 mr-2">
            <button
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
                historyIdx <= 0 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="Undo change"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
                historyIdx >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="Redo change"
            >
              <RotateCcw className="w-3.5 h-3.5 -scale-x-100" />
            </button>
          </div>

          <button
            onClick={() => setIsLivePreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Live Simulator</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-blue-400" />}
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-950/60"
          >
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Publish Live</span>
          </button>
        </div>
      </header>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="bg-[#0A0E17] border-b border-slate-800/80 px-4 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'canvas'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Canvas &amp; Section Layout ({doc.sections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'library'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Section Library</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Catalog Binding</span>
        </button>

        <button
          onClick={() => setActiveTab('responsive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'responsive'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Responsive Viewports</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>SEO &amp; Social Graph</span>
        </button>
      </div>

      {/* 3. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* TAB 1: CANVAS SECTION LIST (DRAG AND DROP) */}
        {activeTab === 'canvas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Homepage Section Pipeline</h2>
                <p className="text-xs text-slate-400">
                  Drag and drop to reorder sections. Click <span className="text-rose-400 font-bold">Customize</span> to edit layouts, slides, buttons, backgrounds, and styling.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('library')}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Section</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {doc.sections.map((section, sIdx) => {
                const isSecHero =
                  section.type === 'hero' ||
                  section.type === 'slider' ||
                  section.type === 'hero_slider' ||
                  section.type === 'hero-slider';
                const currentLayout = section.data?.layout || (isSecHero ? 'slider' : 'standard');
                const slideCount = section.data?.slides?.length || (isSecHero ? 1 : 0);

                return (
                  <div
                    key={section.id}
                    draggable={true}
                    onDragStart={() => handleDragStart(sIdx)}
                    onDragOver={(e) => handleDragOver(e, sIdx)}
                    onDrop={() => handleDrop(sIdx)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      draggedSectionIndex === sIdx
                        ? 'opacity-40 scale-95 border-rose-500 bg-rose-950/20'
                        : dragOverIndex === sIdx
                        ? 'border-t-2 border-t-rose-500 bg-slate-800/80'
                        : section.enabled
                        ? 'bg-[#0D111A] border-slate-800/90 shadow-xl hover:border-slate-700'
                        : 'bg-slate-950/40 border-dashed border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Drag & Meta */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-300" />
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-rose-400">
                            {section.badge || sIdx + 1}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white tracking-wide truncate">{section.name}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
                              {section.type}
                            </span>
                            {/* Visual Layout Pills */}
                            {isSecHero && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {currentLayout.toUpperCase()} {currentLayout === 'slider' ? `(${slideCount} SLIDES)` : ''}
                              </span>
                            )}
                            {section.data?.buttonPlacement && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                BTN: {section.data.buttonPlacement} ({section.data.buttonOrientation || 'inline'})
                              </span>
                            )}
                            {section.data?.querySource && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                SOURCE: {section.data.querySource}
                              </span>
                            )}
                            {section.data?.categoriesList && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {section.data.categoriesList.length} CATEGORIES
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {section.subtitle || section.data?.heading || 'Configurable homepage component'}
                          </p>
                        </div>
                      </div>

                      {/* Right Action Controls */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Reorder Up / Down */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                          <button
                            onClick={() => handleMoveSection(sIdx, 'up')}
                            disabled={sIdx === 0}
                            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ${
                              sIdx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Move Section Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveSection(sIdx, 'down')}
                            disabled={sIdx === doc.sections.length - 1}
                            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ${
                              sIdx === doc.sections.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Move Section Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicateSection(section.id)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Duplicate Section"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Visibility */}
                        <button
                          onClick={() => {
                            const next = {
                              ...doc,
                              sections: doc.sections.map((s) => (s.id === section.id ? { ...s, enabled: !s.enabled } : s)),
                            };
                            setDoc(next);
                            pushHistory(next);
                          }}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                          title={section.enabled ? 'Hide Section' : 'Show Section'}
                        >
                          {section.enabled ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </button>

                        {/* Customize Inspector Button */}
                        <button
                          onClick={() => handleOpenInspector(section)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-500 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/40"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Customize</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Section Prompt at bottom */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setActiveTab('library')}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-2 border-dashed border-slate-800 hover:border-rose-500/50 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg group"
                >
                  <Plus className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span>Add Another Component to Homepage</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECTION LIBRARY */}
        {activeTab === 'library' && (
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Section Component Library</h3>
              <p className="text-xs text-slate-400">
                Select any pre-built, conversion-engineered component to insert into your storefront homepage pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECTION_TEMPLATES.map((tmpl) => {
                const IconComp = tmpl.icon;
                return (
                  <div
                    key={tmpl.type}
                    onClick={() => handleAddSection(tmpl.type)}
                    className="p-5 rounded-2xl bg-[#090D15] hover:bg-slate-900 border border-slate-800/80 hover:border-rose-500/80 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                          {tmpl.category}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                        {tmpl.name}
                      </h4>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
                      <span>+ Insert Component</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC CATALOG BINDING */}
        {activeTab === 'catalog' && (
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Dynamic Catalog Data Binding</h3>
              <p className="text-xs text-slate-400">
                Configure how product grids, hero carousels, and category cards dynamically connect to your tenant inventory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Automated Inventory Sync</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When sections query products (e.g. Best Sellers, New Arrivals, On Sale), items are pulled directly from your tenant MongoDB database in real-time.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Live Stock Availability</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Out-of-stock items are automatically deprioritized to preserve storefront conversion and avoid checkout friction.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESPONSIVE VIEWPORTS */}
        {activeTab === 'responsive' && (
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Responsive Viewport Architecture</h3>
              <p className="text-xs text-slate-400">
                Ensure every component on your storefront homepage adapts seamlessly from high-resolution desktop monitors down to mobile smartphones.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Desktop (1024px+)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Full 4-5 column product grids, multi-slide carousels, dual hero buttons side-by-side, and expanded category lookbooks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <Tablet className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Tablet (768px - 1023px)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Adaptive 2-column product layouts, touch swipe carousels, balanced editorial storytelling, and optimized padding rhythms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Mobile (&lt; 768px)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Thumb-friendly 1-column layouts, stacked CTA buttons, horizontal snap scroll categories, and instant mobile touch responsiveness.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SEO & META TAGS */}
        {activeTab === 'seo' && (
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Homepage Search Engine Optimization</h3>
              <p className="text-xs text-slate-400">
                Configure meta tags, OpenGraph sharing preview, and search engine snippets for your homepage.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Meta Page Title
                </label>
                <input
                  type="text"
                  value={doc.seo?.metaTitle || ''}
                  onChange={(e) => {
                    const next = { ...doc, seo: { ...doc.seo, metaTitle: e.target.value } };
                    setDoc(next);
                    pushHistory(next);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={doc.seo?.metaDescription || ''}
                  onChange={(e) => {
                    const next = { ...doc, seo: { ...doc.seo, metaDescription: e.target.value } };
                    setDoc(next);
                    pushHistory(next);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. EXECUTIVE SECTION CUSTOMIZATION INSPECTOR MODAL */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#0B0E17] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Customize {editingSection.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {editingSection.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Comprehensive visual controls for layout, content, buttons, styles, and responsive viewports.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingSection(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Inspector Tab Bar */}
            <div className="bg-[#080B12] border-b border-slate-800/80 px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'layout', label: 'Layout & Structure', icon: LayoutTemplate },
                { id: 'content', label: 'Content & Media', icon: Type },
                { id: 'styles', label: 'Design & Styling', icon: Palette },
                { id: 'responsive', label: 'Responsive & Devices', icon: Smartphone },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = inspectorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInspectorTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inspector Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
              {/* ========================================================= */}
              {/* TAB 1: LAYOUT & STRUCTURE */}
              {/* ========================================================= */}
              {inspectorTab === 'layout' && (
                <div className="space-y-6">
                  {/* Container Width & Content Alignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Container Width
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'contained', label: 'Contained (Max 7xl)' },
                          { id: 'full_width', label: 'Full Bleed (Edge-to-Edge)' },
                        ].map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => updateSectionData('containerWidth', w.id)}
                            className={`py-2 px-3 rounded-xl font-bold transition-all border text-center ${
                              (editingSection.data?.containerWidth || 'contained') === w.id
                                ? 'bg-rose-600 text-white border-rose-500'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Content Text Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'left', label: 'Left', icon: AlignLeft },
                          { id: 'center', label: 'Center', icon: AlignCenter },
                          { id: 'right', label: 'Right', icon: AlignRight },
                        ].map((al) => {
                          const AlIcon = al.icon;
                          const isSel = (editingSection.data?.contentAlign || editingSection.data?.textAlignment || 'center') === al.id;
                          return (
                            <button
                              key={al.id}
                              type="button"
                              onClick={() => {
                                updateSectionData('contentAlign', al.id);
                                updateSectionData('textAlignment', al.id);
                              }}
                              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border ${
                                isSel
                                  ? 'bg-rose-600 text-white border-rose-500'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              <AlIcon className="w-3.5 h-3.5" />
                              <span>{al.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* HERO / SLIDER LAYOUT CONTROLS */}
                  {isHeroOrSlider && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-5">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <Sparkles className="w-4 h-4 text-rose-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Hero Section Layout Engine
                        </h4>
                      </div>

                      {/* Layout Variant Chips */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          Hero Layout Variant
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { id: 'slider', label: 'Multi-Slide Slider', desc: 'Carousels with swipe & auto' },
                            { id: 'centered', label: 'Full Bleed Centered', desc: 'Classic centered luxury' },
                            { id: 'split_left', label: 'Split Left', desc: 'Image Left, Text Right' },
                            { id: 'split_right', label: 'Split Right', desc: 'Text Left, Framed Image' },
                            { id: 'editorial', label: 'Editorial Magazine', desc: 'Minimalist haute couture' },
                          ].map((l) => (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => {
                                updateSectionData('layout', l.id);
                                if (l.id === 'slider' && (!editingSection.data?.slides || editingSection.data.slides.length === 0)) {
                                  // Auto seed default 3 slides if none exist
                                  const defaultSlides: HeroSlide[] = [
                                    {
                                      id: 'slide-1',
                                      tagline: editingSection.data?.tagline || 'SPRING DROP 2026',
                                      title: editingSection.data?.heading || 'Timeless Elegance Redefined',
                                      subtitle: editingSection.data?.subheading || 'Experience runway-inspired luxury handcrafted with ethical organic textiles.',
                                      primaryBtnText: editingSection.data?.primaryBtnText || 'Shop Collection',
                                      primaryBtnLink: editingSection.data?.primaryBtnLink || '/collections',
                                      secondaryBtnText: editingSection.data?.secondaryBtnText || 'Explore Lookbook',
                                      secondaryBtnLink: editingSection.data?.secondaryBtnLink || '/about',
                                      desktopImage: editingSection.data?.desktopImage || editingSection.data?.bgImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
                                      overlayOpacity: 45,
                                      overlayColor: '#000000',
                                      contentAlign: 'center',
                                    },
                                    {
                                      id: 'slide-2',
                                      tagline: 'SUMMER RUNWAY EDIT',
                                      title: 'Effortless Modern Silhouettes',
                                      subtitle: 'Breathable chanderi silk and structured linen essentials designed for seamless style.',
                                      primaryBtnText: 'SHOP SUMMER EDIT',
                                      primaryBtnLink: '/collections/summer',
                                      secondaryBtnText: 'VIEW LOOKBOOK',
                                      secondaryBtnLink: '/lookbook',
                                      desktopImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
                                      overlayOpacity: 40,
                                      overlayColor: '#000000',
                                      contentAlign: 'center',
                                    },
                                    {
                                      id: 'slide-3',
                                      tagline: 'PRIVATE ATELIER ACCESS',
                                      title: 'Bridal & Ceremonial Couture',
                                      subtitle: 'Hand-embroidered zardozi and artisanal motifs tailored exclusively for celebratory moments.',
                                      primaryBtnText: 'REQUEST CONSULTATION',
                                      primaryBtnLink: '/contact',
                                      secondaryBtnText: 'DISCOVER BRIDAL',
                                      secondaryBtnLink: '/bridal',
                                      desktopImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
                                      overlayOpacity: 50,
                                      overlayColor: '#000000',
                                      contentAlign: 'center',
                                    },
                                  ];
                                  updateSectionData('slides', defaultSlides);
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                (editingSection.data?.layout || 'slider') === l.id
                                  ? 'bg-rose-600/20 border-rose-500 text-white shadow-md'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                            >
                              <div className="font-bold text-xs">{l.label}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{l.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Button Placement & Orientation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                            Button Placement
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {['left', 'center', 'right'].map((pos) => (
                              <button
                                key={pos}
                                type="button"
                                onClick={() => updateSectionData('buttonPlacement', pos)}
                                className={`py-2 px-2 rounded-xl font-bold uppercase text-[11px] transition-all border text-center ${
                                  (editingSection.data?.buttonPlacement || 'center') === pos
                                    ? 'bg-rose-600 text-white border-rose-500'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                            Button Orientation
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'inline', label: 'Inline (Side by Side)' },
                              { id: 'stacked', label: 'Stacked (Vertical Column)' },
                            ].map((o) => (
                              <button
                                key={o.id}
                                type="button"
                                onClick={() => updateSectionData('buttonOrientation', o.id)}
                                className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all border text-center ${
                                  (editingSection.data?.buttonOrientation || 'inline') === o.id
                                    ? 'bg-rose-600 text-white border-rose-500'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {o.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Hero Min Height */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          Hero Section Minimum Height
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {['500px', '600px', '650px', '750px', '850px', '100vh'].map((h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => updateSectionData('minHeight', h)}
                              className={`py-2 px-2 rounded-xl font-bold font-mono text-[11px] transition-all border text-center ${
                                (editingSection.data?.minHeight || '650px') === h
                                  ? 'bg-rose-600 text-white border-rose-500'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PRODUCTS GRID / CAROUSEL LAYOUT CONTROLS */}
                  {(editingSection.type === 'products_grid' || editingSection.type === 'product_carousel') && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Product Grid &amp; Column Dimensions
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Desktop Columns</label>
                          <select
                            value={editingSection.data?.columnsDesktop || 4}
                            onChange={(e) => updateSectionData('columnsDesktop', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns (Standard)</option>
                            <option value={5}>5 Columns (Wide)</option>
                            <option value={6}>6 Columns (Compact)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Tablet Columns</label>
                          <select
                            value={editingSection.data?.columnsTablet || 2}
                            onChange={(e) => updateSectionData('columnsTablet', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value={2}>2 Columns (Recommended)</option>
                            <option value={3}>3 Columns</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Mobile Columns</label>
                          <select
                            value={editingSection.data?.columnsMobile || 1}
                            onChange={(e) => updateSectionData('columnsMobile', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value={1}>1 Column (Standard Feed)</option>
                            <option value={2}>2 Columns (Instagram Grid)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Total Products Limit</label>
                          <select
                            value={editingSection.data?.limit || 8}
                            onChange={(e) => updateSectionData('limit', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value={4}>4 Products</option>
                            <option value={8}>8 Products (Recommended)</option>
                            <option value={12}>12 Products</option>
                            <option value={16}>16 Products</option>
                            <option value={24}>24 Products</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 pt-5">
                          <input
                            type="checkbox"
                            id="showViewAll"
                            checked={editingSection.data?.showViewAll !== false}
                            onChange={(e) => updateSectionData('showViewAll', e.target.checked)}
                            className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                          />
                          <label htmlFor="showViewAll" className="text-xs font-bold text-white cursor-pointer">
                            Display "View All Collection" Button
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORIES LAYOUT CONTROLS */}
                  {editingSection.type === 'categories' && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <FolderTree className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Category Grid Presentation
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Card Aspect Ratio</label>
                          <select
                            value={editingSection.data?.aspectRatio || '3/4'}
                            onChange={(e) => updateSectionData('aspectRatio', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="3/4">Portrait 3:4 (Luxury High Fashion)</option>
                            <option value="1/1">Square 1:1 (Classic Boutique)</option>
                            <option value="16/9">Landscape 16:9 (Wide Banners)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Card Corner Radius</label>
                          <select
                            value={editingSection.data?.cardBorderRadius || '16px'}
                            onChange={(e) => updateSectionData('cardBorderRadius', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="0px">0px (Sharp Atelier)</option>
                            <option value="8px">8px (Subtle)</option>
                            <option value="16px">16px (Modern Rounded)</option>
                            <option value="24px">24px (Soft)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VALUE PROPOSITIONS LAYOUT */}
                  {editingSection.type === 'value_props' && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Value Props Card Layout
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Columns Count</label>
                          <select
                            value={editingSection.data?.columns || 4}
                            onChange={(e) => updateSectionData('columns', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns (Standard)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Card Style</label>
                          <select
                            value={editingSection.data?.cardStyle || 'bordered'}
                            onChange={(e) => updateSectionData('cardStyle', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="bordered">Bordered Cards with Subtle Glow</option>
                            <option value="minimal">Minimal (No Box Borders)</option>
                            <option value="tinted">Tinted Dark Canvas</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SPLIT EDITORIAL STORY LAYOUT */}
                  {editingSection.type === 'image_text' && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Split Story Layout Placement
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Image Alignment</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['left', 'right'].map((pos) => (
                              <button
                                key={pos}
                                type="button"
                                onClick={() => updateSectionData('imagePosition', pos)}
                                className={`py-2 px-3 rounded-xl font-bold uppercase text-[11px] transition-all border text-center ${
                                  (editingSection.data?.imagePosition || 'left') === pos
                                    ? 'bg-rose-600 text-white border-rose-500'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                Image {pos}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Image Aspect Ratio</label>
                          <select
                            value={editingSection.data?.aspectRatio || 'portrait'}
                            onChange={(e) => updateSectionData('aspectRatio', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="portrait">Portrait 3:4 (Fashion Standard)</option>
                            <option value="square">Square 1:1</option>
                            <option value="wide">Wide 16:9</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PROMOTIONAL BANNER LAYOUT */}
                  {editingSection.type === 'promotional_banner' && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <Tag className="w-4 h-4 text-rose-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Banner Height &amp; Alignment
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Banner Height</label>
                          <select
                            value={editingSection.data?.bannerHeight || 'medium'}
                            onChange={(e) => updateSectionData('bannerHeight', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="compact">Compact (240px)</option>
                            <option value="medium">Medium (340px - Standard)</option>
                            <option value="tall">Tall (460px - Impact)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SPACER LAYOUT */}
                  {editingSection.type === 'spacer' && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <Minus className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Whitespace Spacing Heights
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Desktop Height</label>
                          <input
                            type="text"
                            value={editingSection.data?.heightDesktop || '60px'}
                            onChange={(e) => updateSectionData('heightDesktop', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            placeholder="60px"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Mobile Height</label>
                          <input
                            type="text"
                            value={editingSection.data?.heightMobile || '30px'}
                            onChange={(e) => updateSectionData('heightMobile', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            placeholder="30px"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: CONTENT & MEDIA */}
              {/* ========================================================= */}
              {inspectorTab === 'content' && (
                <div className="space-y-6">
                  {/* Common Section Label */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Section Admin Display Label
                    </label>
                    <input
                      type="text"
                      value={editingSection.name}
                      onChange={(e) => handleUpdateEditingSection({ name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-medium"
                    />
                  </div>

                  {/* MULTI-SLIDE CAROUSEL MANAGER (WHEN IN SLIDER MODE) */}
                  {isSliderMode ? (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-6">
                      {/* Playback Controls Bar */}
                      <div className="pb-4 border-b border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-rose-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                              Slider Playback &amp; Navigation Controls
                            </h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="autoplayToggle"
                                checked={editingSection.data?.autoplay !== false}
                                onChange={(e) => updateSectionData('autoplay', e.target.checked)}
                                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                              />
                              <label htmlFor="autoplayToggle" className="text-xs font-bold text-white cursor-pointer">
                                Autoplay
                              </label>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="arrowsToggle"
                                checked={editingSection.data?.showArrows !== false}
                                onChange={(e) => updateSectionData('showArrows', e.target.checked)}
                                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                              />
                              <label htmlFor="arrowsToggle" className="text-xs font-bold text-white cursor-pointer">
                                Arrows
                              </label>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="dotsToggle"
                                checked={editingSection.data?.showDots !== false}
                                onChange={(e) => updateSectionData('showDots', e.target.checked)}
                                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                              />
                              <label htmlFor="dotsToggle" className="text-xs font-bold text-white cursor-pointer">
                                Dots
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[11px] font-medium text-slate-400 block mb-1">
                              Autoplay Interval (Speed)
                            </label>
                            <select
                              value={editingSection.data?.autoplayInterval || 5000}
                              onChange={(e) => updateSectionData('autoplayInterval', parseInt(e.target.value, 10))}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                            >
                              <option value={3000}>3 Seconds (Fast)</option>
                              <option value={5000}>5 Seconds (Balanced Luxury)</option>
                              <option value={7000}>7 Seconds (Deliberate)</option>
                              <option value={10000}>10 Seconds (Relaxed)</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2 pt-5">
                            <input
                              type="checkbox"
                              id="pauseOnHover"
                              checked={editingSection.data?.pauseOnHover !== false}
                              onChange={(e) => updateSectionData('pauseOnHover', e.target.checked)}
                              className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                            />
                            <label htmlFor="pauseOnHover" className="text-xs font-bold text-slate-300 cursor-pointer">
                              Pause Autoplay When Patron Hovers Mouse
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Slide Tabs Navigation */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                            Hero Carousel Slides ({(editingSection.data?.slides || []).length})
                          </label>

                          <button
                            type="button"
                            onClick={handleAddSlide}
                            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Slide</span>
                          </button>
                        </div>

                        {/* Slide Selector Buttons */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {((editingSection.data?.slides as HeroSlide[]) || []).map((slide, sIdx) => (
                            <button
                              key={slide.id || sIdx}
                              type="button"
                              onClick={() => setActiveSlideIdx(sIdx)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-2 ${
                                activeSlideIdx === sIdx
                                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950'
                                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                              }`}
                            >
                              <span>Slide #{sIdx + 1}</span>
                              <span className="text-[10px] opacity-75 truncate max-w-[90px]">
                                {slide.title || 'Untitled'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active Slide Editor Panel */}
                      {editingSection.data?.slides?.[activeSlideIdx] && (() => {
                        const curSlide = editingSection.data.slides[activeSlideIdx] as HeroSlide;
                        return (
                          <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-5 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                              <span className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-rose-600/20 text-rose-400 text-xs font-bold flex items-center justify-center font-mono">
                                  {activeSlideIdx + 1}
                                </span>
                                Editing Slide #{activeSlideIdx + 1}: {curSlide.title || 'Untitled Slide'}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleMoveSlide(activeSlideIdx, 'left')}
                                  disabled={activeSlideIdx === 0}
                                  className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white ${
                                    activeSlideIdx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                  title="Move Slide Left"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSlide(activeSlideIdx, 'right')}
                                  disabled={activeSlideIdx === (editingSection.data?.slides || []).length - 1}
                                  className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white ${
                                    activeSlideIdx === (editingSection.data?.slides || []).length - 1
                                      ? 'opacity-30 cursor-not-allowed'
                                      : ''
                                  }`}
                                  title="Move Slide Right"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlide(activeSlideIdx)}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                                  title="Delete Slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                                  Slide Eyebrow / Tagline
                                </label>
                                <input
                                  type="text"
                                  value={curSlide.tagline || ''}
                                  onChange={(e) => handleUpdateSlide(activeSlideIdx, { tagline: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                  placeholder="e.g. HAUTE ATELIER DROP 2026"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                                  Slide Main Headline
                                </label>
                                <input
                                  type="text"
                                  value={curSlide.title || ''}
                                  onChange={(e) => handleUpdateSlide(activeSlideIdx, { title: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                  placeholder="e.g. Timeless Elegance Redefined"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                                Slide Subtitle / Narrative Copy
                              </label>
                              <textarea
                                rows={2}
                                value={curSlide.subtitle || ''}
                                onChange={(e) => handleUpdateSlide(activeSlideIdx, { subtitle: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                placeholder="e.g. Experience runway-inspired luxury handcrafted with ethical organic textiles."
                              />
                            </div>

                            {/* Dual Buttons for Slide */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                                  Primary Button CTA
                                </span>
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Button Text</label>
                                  <input
                                    type="text"
                                    value={curSlide.primaryBtnText || ''}
                                    onChange={(e) => handleUpdateSlide(activeSlideIdx, { primaryBtnText: e.target.value })}
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0D14] border border-slate-700 text-xs text-white"
                                    placeholder="Shop The Collection"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Link Target URL</label>
                                  <input
                                    type="text"
                                    value={curSlide.primaryBtnLink || ''}
                                    onChange={(e) => handleUpdateSlide(activeSlideIdx, { primaryBtnLink: e.target.value })}
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0D14] border border-slate-700 text-xs text-white font-mono"
                                    placeholder="/collections"
                                  />
                                </div>
                              </div>

                              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                                  Secondary Button CTA
                                </span>
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Button Text</label>
                                  <input
                                    type="text"
                                    value={curSlide.secondaryBtnText || ''}
                                    onChange={(e) => handleUpdateSlide(activeSlideIdx, { secondaryBtnText: e.target.value })}
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0D14] border border-slate-700 text-xs text-white"
                                    placeholder="Explore Lookbook"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Link Target URL</label>
                                  <input
                                    type="text"
                                    value={curSlide.secondaryBtnLink || ''}
                                    onChange={(e) => handleUpdateSlide(activeSlideIdx, { secondaryBtnLink: e.target.value })}
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0D14] border border-slate-700 text-xs text-white font-mono"
                                    placeholder="/about"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Slide Background Image & Media */}
                            <div className="space-y-4 pt-2 border-t border-slate-800/80">
                              <ImageUploadInput
                                label="Slide Desktop Background Image"
                                description="High-resolution banner visual for this carousel slide"
                                value={curSlide.desktopImage || ''}
                                onChange={(url) => handleUpdateSlide(activeSlideIdx, { desktopImage: url })}
                                aspectRatio="banner"
                                folder="Hero"
                              />

                              <ImageUploadInput
                                label="Slide Mobile Background Image (Optional)"
                                description="Optional vertical 3:4 crop optimized specifically for smartphone displays"
                                value={curSlide.mobileImage || ''}
                                onChange={(url) => handleUpdateSlide(activeSlideIdx, { mobileImage: url })}
                                aspectRatio="3/4"
                                folder="Hero"
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* SINGLE HERO / STANDARD CONTENT FIELDS */
                    <div className="space-y-4">
                      {/* Eyebrow / Tagline */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Eyebrow / Badge Tagline
                        </label>
                        <input
                          type="text"
                          value={editingSection.data?.tagline || ''}
                          onChange={(e) => updateSectionData('tagline', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          placeholder="e.g. SPRING DROP 2026"
                        />
                      </div>

                      {/* Heading */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Main Headline (H1 / H2)
                        </label>
                        <input
                          type="text"
                          value={editingSection.data?.heading || ''}
                          onChange={(e) => updateSectionData('heading', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-serif text-sm"
                          placeholder="e.g. Elegance Designed For You"
                        />
                      </div>

                      {/* Subheading / Description */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Subtitle / Narrative Description
                        </label>
                        <textarea
                          rows={3}
                          value={editingSection.data?.subheading || editingSection.data?.description || editingSection.data?.subtitle || ''}
                          onChange={(e) => {
                            updateSectionMultipleData({
                              subheading: e.target.value,
                              description: e.target.value,
                              subtitle: e.target.value,
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                          placeholder="e.g. Discover bespoke tailoring and handcrafted essentials engineered for modern living."
                        />
                      </div>

                      {/* Primary Button */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                            Primary CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={editingSection.data?.primaryBtnText || editingSection.data?.btnText || ''}
                            onChange={(e) => {
                              updateSectionMultipleData({
                                primaryBtnText: e.target.value,
                                btnText: e.target.value,
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                            placeholder="SHOP NOW"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                            Primary Link Target
                          </label>
                          <input
                            type="text"
                            value={editingSection.data?.primaryBtnLink || editingSection.data?.btnLink || ''}
                            onChange={(e) => {
                              updateSectionMultipleData({
                                primaryBtnLink: e.target.value,
                                btnLink: e.target.value,
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            placeholder="/collections"
                          />
                        </div>
                      </div>

                      {/* Secondary Button */}
                      {(isHeroOrSlider || editingSection.data?.secondaryBtnText !== undefined) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                              Secondary CTA Button Text
                            </label>
                            <input
                              type="text"
                              value={editingSection.data?.secondaryBtnText || ''}
                              onChange={(e) => updateSectionData('secondaryBtnText', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                              placeholder="EXPLORE LOOKBOOK"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                              Secondary Link Target
                            </label>
                            <input
                              type="text"
                              value={editingSection.data?.secondaryBtnLink || ''}
                              onChange={(e) => updateSectionData('secondaryBtnLink', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              placeholder="/about"
                            />
                          </div>
                        </div>
                      )}

                      {/* Main Image Asset */}
                      <div className="space-y-4 pt-3 border-t border-slate-800/80">
                        <ImageUploadInput
                          label="Primary Image Asset / Banner"
                          description="Main visual rendered for this component"
                          value={
                            editingSection.data?.desktopImage ||
                            editingSection.data?.image ||
                            editingSection.data?.bgImage ||
                            ''
                          }
                          onChange={(url) => {
                            updateSectionMultipleData({
                              desktopImage: url,
                              image: url,
                              bgImage: url,
                            });
                          }}
                          aspectRatio="banner"
                          folder="Homepage"
                        />

                        {isHeroOrSlider && (
                          <ImageUploadInput
                            label="Mobile Background Image (Optional)"
                            description="Portrait orientation banner for mobile smartphones"
                            value={editingSection.data?.mobileImage || ''}
                            onChange={(url) => updateSectionData('mobileImage', url)}
                            aspectRatio="3/4"
                            folder="Hero"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* PRODUCTS GRID QUERY SOURCE */}
                  {(editingSection.type === 'products_grid' || editingSection.type === 'product_carousel') && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Product Catalog Query Strategy
                      </label>
                      <select
                        value={editingSection.data?.querySource || 'best_sellers'}
                        onChange={(e) => updateSectionData('querySource', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0D14] border border-slate-700 text-xs text-white"
                      >
                        <option value="best_sellers">Best Sellers (Highest Conversion)</option>
                        <option value="new_arrivals">Newest Arrivals (Latest Releases)</option>
                        <option value="trending">Trending Now</option>
                        <option value="on_sale">On Sale / Promotional Markdown</option>
                        <option value="featured">Featured Handpicked Boutique</option>
                      </select>
                    </div>
                  )}

                  {/* CATEGORIES LIST MANAGER */}
                  {(editingSection.type === 'categories' || editingSection.data?.categoriesList !== undefined) && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                            Category Showcase Cards ({((editingSection.data?.categoriesList as any[]) || []).length})
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Configure category department cards with custom images and links.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const tenant = PlatformService.getActiveTenant();
                              const slug = (tenant?.slug || 'lumina').toLowerCase().trim();
                              const cats = await CategoryService.getFlatList();
                              if (!cats || cats.length === 0) {
                                showToast('No custom categories found in store database.', 'info');
                                return;
                              }
                              const syncedList = cats.slice(0, 8).map((c: any) => ({
                                label: c.name || c.title || 'Department',
                                href: `/collections/${c.slug || c.id}`,
                                image: c.image || c.thumbnail || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
                                count: c.productCount ? `${c.productCount} Items` : 'Explore Collection',
                                badge: c.isFeatured ? 'Featured' : '',
                              }));
                              updateSectionData('categoriesList', syncedList);
                              showToast(`✨ Synced ${syncedList.length} store categories to homepage!`, 'success');
                            } catch (err: any) {
                              showToast('Failed to sync categories: ' + err.message, 'error');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                          <span>Sync from Store Categories</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {((editingSection.data?.categoriesList as any[]) || []).map((catItem, idx) => (
                          <div key={idx} className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                {catItem.label || `Card #${idx + 1}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...(editingSection.data?.categoriesList || [])];
                                  list.splice(idx, 1);
                                  updateSectionData('categoriesList', list);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Department Label</label>
                                <input
                                  type="text"
                                  value={catItem.label || ''}
                                  onChange={(e) => {
                                    const list = [...(editingSection.data?.categoriesList || [])];
                                    list[idx] = { ...list[idx], label: e.target.value };
                                    updateSectionData('categoriesList', list);
                                  }}
                                  className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                                  placeholder="e.g. Dresses, Luxury Sets"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tagline / Subtext</label>
                                <input
                                  type="text"
                                  value={catItem.count || catItem.tagline || ''}
                                  onChange={(e) => {
                                    const list = [...(editingSection.data?.categoriesList || [])];
                                    list[idx] = { ...list[idx], count: e.target.value, tagline: e.target.value };
                                    updateSectionData('categoriesList', list);
                                  }}
                                  className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                                  placeholder="e.g. Handcrafted couture"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Link URL</label>
                                <input
                                  type="text"
                                  value={catItem.href || ''}
                                  onChange={(e) => {
                                    const list = [...(editingSection.data?.categoriesList || [])];
                                    list[idx] = { ...list[idx], href: e.target.value };
                                    updateSectionData('categoriesList', list);
                                  }}
                                  className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs font-mono"
                                  placeholder="/dresses"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Badge Callout</label>
                                <input
                                  type="text"
                                  value={catItem.badge || ''}
                                  onChange={(e) => {
                                    const list = [...(editingSection.data?.categoriesList || [])];
                                    list[idx] = { ...list[idx], badge: e.target.value };
                                    updateSectionData('categoriesList', list);
                                  }}
                                  className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                                  placeholder="e.g. Bestselling, New"
                                />
                              </div>
                            </div>

                            <div>
                              <ImageUploadInput
                                label="Card Background Image"
                                description="High-resolution visual portrait for this category"
                                value={catItem.image || catItem.imageUrl || ''}
                                onChange={(url) => {
                                  const list = [...(editingSection.data?.categoriesList || [])];
                                  list[idx] = { ...list[idx], image: url, imageUrl: url };
                                  updateSectionData('categoriesList', list);
                                }}
                                aspectRatio="3/4"
                                folder="Categories"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const list = [...(editingSection.data?.categoriesList || [])];
                            list.push({
                              label: 'New Department',
                              image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
                              href: '/collections',
                              count: 'Explore Collection',
                              badge: 'Trending',
                            });
                            updateSectionData('categoriesList', list);
                          }}
                          className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-rose-500/50 bg-slate-900/40 hover:bg-rose-500/5 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-rose-400" />
                          <span>+ Add Another Category Tile</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VALUE PROPOSITIONS LIST MANAGER */}
                  {(editingSection.type === 'value_props' || editingSection.type === 'value-props' || Array.isArray(editingSection.data?.items)) && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                            Value Proposition Cards ({((editingSection.data?.items as any[]) || []).length})
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Highlight commitments, express shipping, and luxury guarantees.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {((editingSection.data?.items as any[]) || []).map((vItem, idx) => (
                          <div key={idx} className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                {vItem.title || `Item #${idx + 1}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...(editingSection.data?.items || [])];
                                  list.splice(idx, 1);
                                  updateSectionData('items', list);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Card Icon Symbol</label>
                                <select
                                  value={vItem.icon || 'sparkles'}
                                  onChange={(e) => {
                                    const list = [...(editingSection.data?.items || [])];
                                    list[idx] = { ...list[idx], icon: e.target.value };
                                    updateSectionData('items', list);
                                  }}
                                  className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                                >
                                  <option value="sparkles">✨ Sparkles / Trendy</option>
                                  <option value="award">🏆 Award / Premium Quality</option>
                                  <option value="tag">🏷️ Tag / Direct Prices</option>
                                  <option value="truck">🚚 Truck / Express Delivery</option>
                                  <option value="shield">🛡️ Shield / Secure Guarantee</option>
                                  <option value="heart">❤️ Heart / Ethical Textiles</option>
                                  <option value="refresh">🔄 Refresh / Easy Returns</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Card Headline</label>
                                <input
                                  type="text"
                                  value={vItem.title || ''}
                                  onChange={(e) => {
                                    const list = [...(editingSection.data?.items || [])];
                                    list[idx] = { ...list[idx], title: e.target.value };
                                    updateSectionData('items', list);
                                  }}
                                  className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                                  placeholder="e.g. Trendy Collections"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Card Description</label>
                              <textarea
                                rows={2}
                                value={vItem.description || ''}
                                onChange={(e) => {
                                  const list = [...(editingSection.data?.items || [])];
                                  list[idx] = { ...list[idx], description: e.target.value };
                                  updateSectionData('items', list);
                                }}
                                className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                                placeholder="e.g. Handpicked, fashion-forward silhouettes updated every week."
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const list = [...(editingSection.data?.items || [])];
                            list.push({
                              icon: 'sparkles',
                              title: 'New Value Proposition',
                              description: 'Runway-inspired luxury aesthetics crafted with utmost attention to detail.',
                            });
                            updateSectionData('items', list);
                          }}
                          className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-rose-500/50 bg-slate-900/40 hover:bg-rose-500/5 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-rose-400" />
                          <span>+ Add Value Proposition Card</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TESTIMONIALS MANAGER */}
                  {editingSection.type === 'testimonials' && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Client Testimonials &amp; Quotes
                      </h4>

                      <div className="space-y-3">
                        {((editingSection.data?.testimonialsList as any[]) || []).map((tItem, idx) => (
                          <div key={idx} className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                {tItem.name || 'Patron Review'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...(editingSection.data?.testimonialsList || [])];
                                  list.splice(idx, 1);
                                  updateSectionData('testimonialsList', list);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Author Name</label>
                                <input
                                  type="text"
                                  value={tItem.name || ''}
                                  onChange={(e) => {
                                    const list = [...(editingSection.data?.testimonialsList || [])];
                                    list[idx] = { ...list[idx], name: e.target.value };
                                    updateSectionData('testimonialsList', list);
                                  }}
                                  className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                                  placeholder="e.g. Elena Rostova"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Role / Location</label>
                                <input
                                  type="text"
                                  value={tItem.role || ''}
                                  onChange={(e) => {
                                    const list = [...(editingSection.data?.testimonialsList || [])];
                                    list[idx] = { ...list[idx], role: e.target.value };
                                    updateSectionData('testimonialsList', list);
                                  }}
                                  className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                                  placeholder="e.g. Verified Patron"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Review Quote</label>
                              <textarea
                                rows={2}
                                value={tItem.text || ''}
                                onChange={(e) => {
                                  const list = [...(editingSection.data?.testimonialsList || [])];
                                  list[idx] = { ...list[idx], text: e.target.value };
                                  updateSectionData('testimonialsList', list);
                                }}
                                className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                                placeholder="Review quote..."
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const list = [...(editingSection.data?.testimonialsList || [])];
                            list.push({
                              name: 'Bespoke Client',
                              role: 'Verified Patron',
                              text: 'World-class craftsmanship and attentive packaging.',
                              rating: 5,
                            });
                            updateSectionData('testimonialsList', list);
                          }}
                          className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-rose-500/50 bg-slate-900/40 hover:bg-rose-500/5 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-rose-400" />
                          <span>+ Add Review Quote</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* COUNTDOWN TARGET TIMER */}
                  {editingSection.type === 'countdown' && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Flash Sale Countdown Target Date &amp; Time
                      </label>
                      <input
                        type="datetime-local"
                        value={editingSection.data?.targetDate ? editingSection.data.targetDate.slice(0, 16) : '2026-10-31T23:59'}
                        onChange={(e) => updateSectionData('targetDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0D14] border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: DESIGN & STYLING */}
              {/* ========================================================= */}
              {inspectorTab === 'styles' && (
                <div className="space-y-6">
                  {/* Background Type & Color */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Section Background &amp; Ambient Palette
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Background Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingSection.data?.bgColor || editingSection.styles?.backgroundColor || '#0F172A'}
                            onChange={(e) => {
                              updateSectionData('bgColor', e.target.value);
                              updateSectionStyles('backgroundColor', e.target.value);
                            }}
                            className="w-9 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingSection.data?.bgColor || editingSection.styles?.backgroundColor || '#0F172A'}
                            onChange={(e) => {
                              updateSectionData('bgColor', e.target.value);
                              updateSectionStyles('backgroundColor', e.target.value);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            placeholder="#0F172A"
                          />
                        </div>

                        {/* Luxury Swatches */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {['#FAFAF9', '#0B0D14', '#0F172A', '#1E1B4B', '#111827', '#2A0815'].map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => {
                                updateSectionData('bgColor', hex);
                                updateSectionStyles('backgroundColor', hex);
                              }}
                              className="w-6 h-6 rounded-md border border-slate-700 transition-transform hover:scale-110"
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Section Text Theme
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: '#FFFFFF', label: 'Light on Dark (White)' },
                            { id: '#111827', label: 'Dark on Light (Ink)' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                updateSectionData('textColor', t.id);
                                updateSectionStyles('color', t.id);
                              }}
                              className={`py-2 px-3 rounded-xl font-bold transition-all border text-center text-xs ${
                                (editingSection.data?.textColor || '#FFFFFF') === t.id
                                  ? 'bg-rose-600 text-white border-rose-500'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Media Darkening Overlay Slider */}
                    <div className="space-y-2 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Background Image Darkening Overlay
                        </label>
                        <span className="text-xs font-mono font-bold text-rose-400">
                          {typeof editingSection.data?.overlayOpacity === 'number'
                            ? (editingSection.data.overlayOpacity <= 1
                                ? Math.round(editingSection.data.overlayOpacity * 100)
                                : Math.round(editingSection.data.overlayOpacity))
                            : 45}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={
                          typeof editingSection.data?.overlayOpacity === 'number'
                            ? (editingSection.data.overlayOpacity <= 1
                                ? Math.round(editingSection.data.overlayOpacity * 100)
                                : Math.round(editingSection.data.overlayOpacity))
                            : 45
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          updateSectionData('overlayOpacity', val);
                        }}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-slate-400">Overlay Tint:</span>
                        <input
                          type="color"
                          value={editingSection.data?.overlayColor || '#000000'}
                          onChange={(e) => updateSectionData('overlayColor', e.target.value)}
                          className="w-7 h-7 rounded bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <span className="text-xs text-slate-300 font-mono">{editingSection.data?.overlayColor || '#000000'}</span>
                      </div>
                    </div>
                  </div>

                  {/* CUSTOM BUTTON STYLING (FOR HERO, PROMO, ETC.) */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Custom Button Styling &amp; Geometry
                    </h4>

                    {/* Primary Button Colors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Primary Button BG Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingSection.data?.primaryBtnColor || '#E11D48'}
                            onChange={(e) => updateSectionData('primaryBtnColor', e.target.value)}
                            className="w-9 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingSection.data?.primaryBtnColor || '#E11D48'}
                            onChange={(e) => updateSectionData('primaryBtnColor', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            placeholder="#E11D48"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Primary Button Text Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingSection.data?.primaryBtnTextColor || '#FFFFFF'}
                            onChange={(e) => updateSectionData('primaryBtnTextColor', e.target.value)}
                            className="w-9 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingSection.data?.primaryBtnTextColor || '#FFFFFF'}
                            onChange={(e) => updateSectionData('primaryBtnTextColor', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Secondary Button Colors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Secondary Button BG / Border
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingSection.data?.secondaryBtnColor || '#FFFFFF'}
                            onChange={(e) => updateSectionData('secondaryBtnColor', e.target.value)}
                            className="w-9 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingSection.data?.secondaryBtnColor || '#FFFFFF'}
                            onChange={(e) => updateSectionData('secondaryBtnColor', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Secondary Button Text Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingSection.data?.secondaryBtnTextColor || '#111827'}
                            onChange={(e) => updateSectionData('secondaryBtnTextColor', e.target.value)}
                            className="w-9 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingSection.data?.secondaryBtnTextColor || '#111827'}
                            onChange={(e) => updateSectionData('secondaryBtnTextColor', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                            placeholder="#111827"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Button Corner Radius */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Button Border Radius
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { val: '0px', label: '0px (Sharp)' },
                          { val: '4px', label: '4px (Subtle)' },
                          { val: '8px', label: '8px (Rounded)' },
                          { val: '16px', label: '16px (Curved)' },
                          { val: '9999px', label: 'Pill' },
                        ].map((rad) => (
                          <button
                            key={rad.val}
                            type="button"
                            onClick={() => updateSectionData('btnBorderRadius', rad.val)}
                            className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border text-center ${
                              (editingSection.data?.btnBorderRadius || '8px') === rad.val
                                ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {rad.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION PADDINGS (TOP & BOTTOM) */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Section Padding &amp; Vertical Rhythm
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-medium text-slate-400">Padding Top</label>
                          <span className="text-xs font-mono text-rose-400">
                            {editingSection.data?.paddingTop || editingSection.styles?.paddingTop || '60px'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="160"
                          step="10"
                          value={parseInt(editingSection.data?.paddingTop || editingSection.styles?.paddingTop || '60', 10) || 60}
                          onChange={(e) => {
                            const val = `${e.target.value}px`;
                            updateSectionMultipleData({ paddingTop: val });
                            updateSectionStyles('paddingTop', val);
                          }}
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-medium text-slate-400">Padding Bottom</label>
                          <span className="text-xs font-mono text-rose-400">
                            {editingSection.data?.paddingBottom || editingSection.styles?.paddingBottom || '60px'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="160"
                          step="10"
                          value={parseInt(editingSection.data?.paddingBottom || editingSection.styles?.paddingBottom || '60', 10) || 60}
                          onChange={(e) => {
                            const val = `${e.target.value}px`;
                            updateSectionMultipleData({ paddingBottom: val });
                            updateSectionStyles('paddingBottom', val);
                          }}
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: RESPONSIVE & VISIBILITY */}
              {/* ========================================================= */}
              {inspectorTab === 'responsive' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Device Viewport Display Toggles
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Control exactly which devices render this section on the live storefront.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-5 h-5 text-rose-400" />
                          <div>
                            <div className="text-xs font-bold text-white">Desktop Computers &amp; Laptops</div>
                            <div className="text-[10px] text-slate-400">Screens 1024px and wider</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={editingSection.responsive?.desktop?.visible !== false}
                          onChange={(e) => updateSectionResponsive('desktop', e.target.checked)}
                          className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <Tablet className="w-5 h-5 text-amber-400" />
                          <div>
                            <div className="text-xs font-bold text-white">iPads &amp; Tablet Displays</div>
                            <div className="text-[10px] text-slate-400">Screens 768px to 1023px</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={editingSection.responsive?.tablet?.visible !== false}
                          onChange={(e) => updateSectionResponsive('tablet', e.target.checked)}
                          className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-emerald-400" />
                          <div>
                            <div className="text-xs font-bold text-white">Smartphones &amp; Mobile Screens</div>
                            <div className="text-[10px] text-slate-400">Screens less than 768px</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={editingSection.responsive?.mobile?.visible !== false}
                          onChange={(e) => updateSectionResponsive('mobile', e.target.checked)}
                          className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                All changes automatically reflected in draft state.
              </span>

              <button
                onClick={() => setEditingSection(null)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/60"
              >
                Apply &amp; Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FULLSCREEN STOREFRONT LIVE SIMULATOR */}
      {isLivePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-md flex flex-col">
          <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Storefront Homepage Live Simulator
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                {device.toUpperCase()} VIEW
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    device === 'desktop' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    device === 'tablet' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    device === 'mobile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <button
                onClick={() => setIsLivePreviewOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-10 flex flex-col items-center justify-start bg-black/50">
            <div
              className={`transition-all duration-300 bg-[#FAFAF9] text-[#111111] rounded-2xl shadow-2xl overflow-hidden border border-white/10 ${
                device === 'desktop'
                  ? 'w-full max-w-6xl'
                  : device === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[390px]'
              }`}
            >
              {doc.sections
                .filter((s) => s.enabled)
                .map((sec) => {
                  const isSecHero =
                    sec.type === 'hero' ||
                    sec.type === 'slider' ||
                    sec.type === 'hero_slider' ||
                    sec.type === 'hero-slider';
                  const layout = sec.data?.layout || (isSecHero ? 'slider' : 'centered');
                  const slides = (sec.data?.slides as HeroSlide[]) || [];
                  const activeSlide = slides[simulatorSlideIdx % (slides.length || 1)] || {};
                  const bgImg = activeSlide.desktopImage || sec.data?.desktopImage || sec.data?.bgImage || '';
                  const overlayOp = typeof activeSlide.overlayOpacity === 'number'
                    ? (activeSlide.overlayOpacity <= 1 ? activeSlide.overlayOpacity * 100 : activeSlide.overlayOpacity)
                    : (typeof sec.data?.overlayOpacity === 'number'
                      ? (sec.data.overlayOpacity <= 1 ? sec.data.overlayOpacity * 100 : sec.data.overlayOpacity)
                      : 45);

                  // Button styling
                  const btnPlacement = sec.data?.buttonPlacement || sec.data?.contentAlign || 'center';
                  const btnOrientation = sec.data?.buttonOrientation || 'inline';
                  const btnRadius = sec.data?.btnBorderRadius || '8px';
                  const primaryBg = sec.data?.primaryBtnColor || '#E11D48';
                  const primaryText = sec.data?.primaryBtnTextColor || '#FFFFFF';
                  const secondaryBg = sec.data?.secondaryBtnColor || '#FFFFFF';
                  const secondaryText = sec.data?.secondaryBtnTextColor || '#111827';

                  if (isSecHero) {
                    return (
                      <div
                        key={sec.id}
                        className="relative w-full overflow-hidden flex items-center justify-center text-white"
                        style={{
                          minHeight: device === 'mobile' ? '450px' : (sec.data?.minHeight || '600px'),
                          backgroundImage: bgImg ? `url('${bgImg}')` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: sec.data?.bgColor || '#0F172A',
                        }}
                      >
                        {/* Darkening Overlay */}
                        <div
                          className="absolute inset-0 z-0"
                          style={{
                            backgroundColor: sec.data?.overlayColor || '#000000',
                            opacity: overlayOp / 100,
                          }}
                        />

                        {/* Slider Prev / Next Arrows */}
                        {layout === 'slider' && slides.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setSimulatorSlideIdx((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
                              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-transform hover:scale-110"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSimulatorSlideIdx((prev) => (prev + 1) % slides.length)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-transform hover:scale-110"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                              {slides.map((_, dotIdx) => (
                                <button
                                  key={dotIdx}
                                  type="button"
                                  onClick={() => setSimulatorSlideIdx(dotIdx)}
                                  className={`transition-all ${
                                    simulatorSlideIdx % slides.length === dotIdx
                                      ? 'w-7 h-2 rounded-full bg-rose-500'
                                      : 'w-2 h-2 rounded-full bg-white/50 hover:bg-white'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        {/* Content Container */}
                        <div
                          className={`relative z-10 w-full max-w-4xl px-6 py-12 ${
                            btnPlacement === 'left' ? 'text-left' : btnPlacement === 'right' ? 'text-right' : 'text-center'
                          }`}
                        >
                          {(activeSlide.tagline || sec.data?.tagline) && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-600 text-white inline-block mb-3 shadow-lg">
                              {activeSlide.tagline || sec.data.tagline}
                            </span>
                          )}

                          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-tight mb-4 drop-shadow-md">
                            {activeSlide.title || sec.data?.heading || sec.name}
                          </h2>

                          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto mb-6 leading-relaxed drop-shadow">
                            {activeSlide.subtitle || sec.data?.subheading || sec.data?.description}
                          </p>

                          {/* Dual Buttons */}
                          <div
                            className={`flex items-center gap-3 ${
                              btnPlacement === 'left'
                                ? 'justify-start'
                                : btnPlacement === 'right'
                                ? 'justify-end'
                                : 'justify-center'
                            } ${btnOrientation === 'stacked' ? 'flex-col' : 'flex-row flex-wrap'}`}
                          >
                            {(activeSlide.primaryBtnText || sec.data?.primaryBtnText) && (
                              <button
                                style={{
                                  backgroundColor: primaryBg,
                                  color: primaryText,
                                  borderRadius: btnRadius,
                                }}
                                className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                              >
                                {activeSlide.primaryBtnText || sec.data.primaryBtnText}
                              </button>
                            )}

                            {(activeSlide.secondaryBtnText || sec.data?.secondaryBtnText) && (
                              <button
                                style={{
                                  backgroundColor: secondaryBg,
                                  color: secondaryText,
                                  borderRadius: btnRadius,
                                }}
                                className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                              >
                                {activeSlide.secondaryBtnText || sec.data.secondaryBtnText}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // CATEGORIES SHOWCASE
                  if (sec.type === 'categories') {
                    const catList = (sec.data?.categoriesList as any[]) || [];
                    return (
                      <div key={sec.id} className="py-12 px-6 sm:px-12 bg-[#FAFAF9] border-b border-black/5">
                        <div className="text-center max-w-xl mx-auto mb-8">
                          <h2 className="text-2xl font-serif font-black text-slate-900">{sec.data?.heading || 'Shop By Category'}</h2>
                          <p className="text-xs text-slate-600 mt-1">{sec.data?.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {catList.map((cat, idx) => (
                            <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-200 shadow-md">
                              {cat.image && (
                                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                                {cat.badge && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 mb-1">{cat.badge}</span>
                                )}
                                <span className="font-bold text-sm">{cat.label}</span>
                                <span className="text-[10px] text-slate-300">{cat.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // VALUE PROPOSITIONS
                  if (sec.type === 'value_props') {
                    const vList = (sec.data?.items as any[]) || [];
                    return (
                      <div key={sec.id} className="py-10 px-6 sm:px-12 bg-white border-b border-black/5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {vList.map((v, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900">{v.title}</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{v.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // PROMOTIONAL BANNER
                  if (sec.type === 'promotional_banner') {
                    return (
                      <div
                        key={sec.id}
                        className="py-12 px-6 sm:px-12 text-center text-white relative overflow-hidden"
                        style={{ backgroundColor: sec.data?.bgColor || '#0F172A' }}
                      >
                        {sec.data?.tagline && (
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 block mb-2">
                            {sec.data.tagline}
                          </span>
                        )}
                        <h2 className="text-xl sm:text-2xl font-serif font-black mb-2">{sec.data?.heading}</h2>
                        <p className="text-xs text-slate-300 max-w-xl mx-auto mb-4">{sec.data?.description}</p>
                        {sec.data?.btnText && (
                          <button className="px-6 py-2.5 rounded-lg bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
                            {sec.data.btnText}
                          </button>
                        )}
                      </div>
                    );
                  }

                  // DEFAULT SECTION CARD FALLBACK
                  return (
                    <div key={sec.id} className="py-10 px-6 sm:px-12 border-b border-black/5 last:border-0">
                      <div className="text-center max-w-2xl mx-auto space-y-3">
                        {sec.data?.tagline && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white inline-block">
                            {sec.data.tagline}
                          </span>
                        )}
                        <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                          {sec.data?.heading || sec.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600">
                          {sec.data?.subheading || sec.data?.description || sec.subtitle}
                        </p>
                        {sec.data?.primaryBtnText && (
                          <div className="pt-2">
                            <button className="px-6 py-2.5 rounded-lg bg-slate-950 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                              {sec.data.primaryBtnText}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
