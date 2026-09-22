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
  SplitSquareVertical,
  Columns,
  View,
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

/**
 * SectionVisualRenderer
 * Faithfully renders each section with real typography, live images, slider arrows/dots,
 * button placements, orientation, colors, border-radius, and overlays.
 */

const FONT_FAMILY_OPTIONS = [
  { label: "Theme Default", value: "inherit" },
  { label: "Playfair Display (Editorial Serif)", value: "'Playfair Display', Georgia, serif" },
  { label: "Cinzel (Imperial Luxury Serif)", value: "'Cinzel', Georgia, serif" },
  { label: "Cormorant Garamond (Fine Jewelry Serif)", value: "'Cormorant Garamond', Georgia, serif" },
  { label: "Bodoni Moda (High Fashion)", value: "'Bodoni Moda', Georgia, serif" },
  { label: "Plus Jakarta Sans (Modern Clean Sans)", value: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { label: "Outfit (Geometric Contemporary)", value: "'Outfit', system-ui, sans-serif" },
  { label: "Montserrat (Bold Architectural)", value: "'Montserrat', system-ui, sans-serif" },
  { label: "Inter (Technical Neutral)", value: "'Inter', system-ui, sans-serif" },
  { label: "Syne (Avant-Garde Pret)", value: "'Syne', system-ui, sans-serif" },
  { label: "Space Grotesk (Neo-Brutalist)", value: "'Space Grotesk', monospace, sans-serif" },
];

const FONT_WEIGHT_OPTIONS = [
  { label: "300 Light", value: "300" },
  { label: "400 Normal", value: "400" },
  { label: "500 Medium", value: "500" },
  { label: "600 Semi-Bold", value: "600" },
  { label: "700 Bold", value: "700" },
  { label: "800 Extra-Bold", value: "800" },
  { label: "900 Black", value: "900" },
];

const LETTER_SPACING_OPTIONS = [
  { label: "Tight (-0.03em)", value: "-0.03em" },
  { label: "Normal (0em)", value: "0em" },
  { label: "Wide (0.05em)", value: "0.05em" },
  { label: "Widest (0.15em)", value: "0.15em" },
  { label: "Expanded (0.25em)", value: "0.25em" },
];

const TEXT_TRANSFORM_OPTIONS = [
  { label: "None", value: "none" },
  { label: "UPPERCASE", value: "uppercase" },
  { label: "Capitalize", value: "capitalize" },
  { label: "lowercase", value: "lowercase" },
];

function SectionVisualRenderer({
  section,
  device = 'desktop',
  onCustomize,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp = false,
  canMoveDown = false,
  showActions = true,
  activeSlideIdx = 0,
  onSlideChange,
}: {
  section: HomepageSection;
  device?: 'desktop' | 'tablet' | 'mobile';
  onCustomize?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  showActions?: boolean;
  activeSlideIdx?: number;
  onSlideChange?: (idx: number) => void;
}) {
  const [internalSlide, setInternalSlide] = useState(0);
  const slideIdx = onSlideChange ? activeSlideIdx : internalSlide;
  const changeSlide = onSlideChange || setInternalSlide;

  const isSecHero =
    section.type === 'hero' ||
    section.type === 'slider' ||
    section.type === 'hero_slider' ||
    section.type === 'hero-slider';

  const layout = section.data?.layout || (isSecHero ? (section.type === 'hero_slider' ? 'slider' : 'slider') : 'standard');
  const slides = (section.data?.slides as HeroSlide[]) || [];
  const curSlide = slides[slideIdx % (slides.length || 1)] || {};

  const bgImg = curSlide.desktopImage || section.data?.desktopImage || section.data?.bgImage || '';
  const overlayOp =
    typeof curSlide.overlayOpacity === 'number'
      ? curSlide.overlayOpacity <= 1
        ? curSlide.overlayOpacity * 100
        : curSlide.overlayOpacity
      : typeof section.data?.overlayOpacity === 'number'
      ? section.data.overlayOpacity <= 1
        ? section.data.overlayOpacity * 100
        : section.data.overlayOpacity
      : 45;

  // Exact Alignment & Width Configuration
  const isFullWidth = (section.data?.containerWidth || 'contained') === 'full_width';
  const containerClass = isFullWidth ? 'w-full px-4 sm:px-8' : 'max-w-6xl mx-auto px-4 sm:px-6';
  const align = section.data?.contentAlign || section.data?.textAlignment || 'center';

  // Button placements & styles
  const btnPlacement = section.data?.buttonPlacement || align || 'center';
  const btnOrientation = section.data?.buttonOrientation || 'inline';
  const btnRadius = section.data?.btnBorderRadius || '8px';
  const primaryBg = section.data?.primaryBtnColor || '#E11D48';
  const primaryText = section.data?.primaryBtnTextColor || '#FFFFFF';
  const secondaryBg = section.data?.secondaryBtnColor || '#FFFFFF';
  const secondaryText = section.data?.secondaryBtnTextColor || '#111827';

  // Spacing & background
  const sectionBg = section.data?.bgColor || section.styles?.backgroundColor;
  const sectionText = section.data?.textColor || section.styles?.color;
  const padTop = section.data?.paddingTop || section.styles?.paddingTop || '48px';
  const padBottom = section.data?.paddingBottom || section.styles?.paddingBottom || '48px';

  // Section-level Typography Configuration
  const headingFont = section.data?.headingFontFamily || section.data?.headingFont || section.styles?.headingFont;
  const headingColor = section.data?.headingColor || section.data?.textColor || section.styles?.color;
  const headingSize = section.data?.headingFontSize || section.styles?.headingFontSize;
  const headingWeight = section.data?.headingFontWeight || section.styles?.headingFontWeight;
  const headingTracking = section.data?.headingLetterSpacing || section.styles?.headingLetterSpacing;
  const headingLineHeight = section.data?.headingLineHeight || section.styles?.headingLineHeight;
  const headingTransform = section.data?.headingTextTransform || section.styles?.headingTextTransform;

  const subtitleFont = section.data?.subtitleFontFamily || section.data?.subtitleFont || section.styles?.subtitleFont;
  const subtitleColor = section.data?.subtitleColor || section.styles?.subtitleColor;
  const subtitleSize = section.data?.subtitleFontSize || section.styles?.subtitleFontSize;
  const subtitleWeight = section.data?.subtitleFontWeight || section.styles?.subtitleFontWeight;
  const subtitleTracking = section.data?.subtitleLetterSpacing || section.styles?.subtitleLetterSpacing;
  const subtitleLineHeight = section.data?.subtitleLineHeight || section.styles?.subtitleLineHeight;

  const badgeFont = section.data?.badgeFontFamily;
  const badgeColor = section.data?.badgeColor;
  const badgeBg = section.data?.badgeBgColor;
  const badgeSize = section.data?.badgeFontSize;
  const badgeWeight = section.data?.badgeFontWeight;
  const badgeTracking = section.data?.badgeLetterSpacing;
  const badgeTransform = section.data?.badgeTextTransform;

  const btnFont = section.data?.btnFontFamily;
  const btnSize = section.data?.btnFontSize;
  const btnWeight = section.data?.btnFontWeight;
  const btnTracking = section.data?.btnLetterSpacing;
  const btnTransform = section.data?.btnTextTransform;

  const headingStyle: React.CSSProperties = {
    ...(headingFont && headingFont !== 'inherit' ? { fontFamily: headingFont } : {}),
    ...(headingColor ? { color: headingColor } : {}),
    ...(headingSize ? { fontSize: headingSize } : {}),
    ...(headingWeight ? { fontWeight: headingWeight } : {}),
    ...(headingTracking ? { letterSpacing: headingTracking } : {}),
    ...(headingLineHeight ? { lineHeight: headingLineHeight } : {}),
    ...(headingTransform ? { textTransform: headingTransform as any } : {}),
  };

  const subtitleStyle: React.CSSProperties = {
    ...(subtitleFont && subtitleFont !== 'inherit' ? { fontFamily: subtitleFont } : {}),
    ...(subtitleColor ? { color: subtitleColor } : {}),
    ...(subtitleSize ? { fontSize: subtitleSize } : {}),
    ...(subtitleWeight ? { fontWeight: subtitleWeight } : {}),
    ...(subtitleTracking ? { letterSpacing: subtitleTracking } : {}),
    ...(subtitleLineHeight ? { lineHeight: subtitleLineHeight } : {}),
  };

  const badgeStyle: React.CSSProperties = {
    ...(badgeFont && badgeFont !== 'inherit' ? { fontFamily: badgeFont } : {}),
    ...(badgeColor ? { color: badgeColor } : {}),
    ...(badgeBg ? { backgroundColor: badgeBg } : {}),
    ...(badgeSize ? { fontSize: badgeSize } : {}),
    ...(badgeWeight ? { fontWeight: badgeWeight } : {}),
    ...(badgeTracking ? { letterSpacing: badgeTracking } : {}),
    ...(badgeTransform ? { textTransform: badgeTransform as any } : {}),
  };

  const primaryBtnStyle: React.CSSProperties = {
    backgroundColor: primaryBg,
    color: primaryText,
    borderRadius: btnRadius,
    ...(btnFont && btnFont !== 'inherit' ? { fontFamily: btnFont } : {}),
    ...(btnSize ? { fontSize: btnSize } : {}),
    ...(btnWeight ? { fontWeight: btnWeight } : {}),
    ...(btnTracking ? { letterSpacing: btnTracking } : {}),
    ...(btnTransform ? { textTransform: btnTransform as any } : {}),
  };

  const secondaryBtnStyle: React.CSSProperties = {
    backgroundColor: secondaryBg,
    color: secondaryText,
    borderRadius: btnRadius,
    ...(btnFont && btnFont !== 'inherit' ? { fontFamily: btnFont } : {}),
    ...(btnSize ? { fontSize: btnSize } : {}),
    ...(btnWeight ? { fontWeight: btnWeight } : {}),
    ...(btnTracking ? { letterSpacing: btnTracking } : {}),
    ...(btnTransform ? { textTransform: btnTransform as any } : {}),
  };

  return (
    <div
      className="relative group/section w-full transition-all"
      style={{
        backgroundColor: sectionBg,
        color: sectionText,
      }}
    >
      {/* Visual Hover Action Toolbar (For Canvas Mode) */}
      {showActions && (
        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover/section:opacity-100 transition-all duration-200 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/90 border border-slate-700 shadow-2xl backdrop-blur-md">
          <span className="text-[10px] font-mono font-bold text-rose-400 px-2 uppercase">
            {section.name}
          </span>
          {onCustomize && (
            <button
              onClick={onCustomize}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              title="Customize Section"
            >
              <Edit className="w-3 h-3" />
              <span>Customize</span>
            </button>
          )}
          {onMoveUp && canMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Move Up"
            >
              <MoveUp className="w-3.5 h-3.5" />
            </button>
          )}
          {onMoveDown && canMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Move Down"
            >
              <MoveDown className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
              title="Delete Section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 1. HERO SECTION / SLIDER */}
      {isSecHero && (
        <div
          className="relative w-full overflow-hidden flex items-center justify-center text-white"
          style={{
            minHeight: device === 'mobile' ? '400px' : (section.data?.minHeight || '580px'),
            backgroundImage: bgImg ? `url('${bgImg}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: section.data?.bgColor || '#0F172A',
            paddingTop: padTop,
            paddingBottom: padBottom,
          }}
        >
          {/* Darkening Overlay */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundColor: section.data?.overlayColor || '#000000',
              opacity: overlayOp / 100,
            }}
          />

          {/* Slider Prev / Next Arrows */}
          {layout === 'slider' && slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => changeSlide(slideIdx > 0 ? slideIdx - 1 : slides.length - 1)}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-transform hover:scale-110 cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={() => changeSlide((slideIdx + 1) % slides.length)}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-transform hover:scale-110 cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                {slides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => changeSlide(dotIdx)}
                    className={`transition-all cursor-pointer ${
                      slideIdx % slides.length === dotIdx
                        ? 'w-6 h-1.5 rounded-full bg-rose-500'
                        : 'w-1.5 h-1.5 rounded-full bg-white/50 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Content Container respecting containerWidth & contentAlign */}
          {layout === 'split_left' || layout === 'split_right' ? (
            /* Split Screen Layout */
            <div className={`relative z-10 w-full ${containerClass} grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
              layout === 'split_left' ? '' : 'md:[&>*:first-child]:order-2'
            }`}>
              <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] relative border border-white/10 bg-slate-900">
                <img src={bgImg || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop'} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-rose-400 border border-white/10">
                  {curSlide.tagline || section.data?.tagline || 'ATELIER LUXURY'}
                </div>
              </div>

              <div className={`space-y-4 ${
                align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start'
              }`}>
                {(curSlide.tagline || section.data?.tagline) && (
                  <span style={badgeStyle} className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-600 text-white inline-block shadow-md">
                    {curSlide.tagline || section.data?.tagline}
                  </span>
                )}
                <h2 style={headingStyle} className="text-2xl sm:text-4xl font-serif font-black tracking-tight leading-tight drop-shadow-md">
                  {curSlide.title || section.data?.heading || section.name}
                </h2>
                <p style={subtitleStyle} className="text-xs sm:text-sm text-slate-200 leading-relaxed drop-shadow">
                  {curSlide.subtitle || section.data?.subheading || section.data?.description}
                </p>

                <div className={`flex items-center gap-3 pt-2 ${
                  btnPlacement === 'left' ? 'justify-start' : btnPlacement === 'right' ? 'justify-end' : 'justify-center'
                } ${btnOrientation === 'stacked' ? 'flex-col' : 'flex-row flex-wrap'}`}>
                  {(curSlide.primaryBtnText || section.data?.primaryBtnText) && (
                    <button
                      style={primaryBtnStyle}
                      className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      {curSlide.primaryBtnText || section.data?.primaryBtnText}
                    </button>
                  )}
                  {(curSlide.secondaryBtnText || section.data?.secondaryBtnText) && (
                    <button
                      style={secondaryBtnStyle}
                      className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      {curSlide.secondaryBtnText || section.data?.secondaryBtnText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Centered / Slider / Editorial Standard */
            <div
              className={`relative z-10 w-full ${containerClass} ${
                align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
              }`}
            >
              {(curSlide.tagline || section.data?.tagline) && (
                <span style={badgeStyle} className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-600 text-white inline-block mb-3 shadow-lg">
                  {curSlide.tagline || section.data?.tagline}
                </span>
              )}

              <h2 style={headingStyle} className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-tight mb-4 drop-shadow-md">
                {curSlide.title || section.data?.heading || section.name}
              </h2>

              <p style={subtitleStyle} className={`text-xs sm:text-sm text-slate-200 mb-6 leading-relaxed drop-shadow ${
                align === 'center' ? 'max-w-xl mx-auto' : align === 'right' ? 'max-w-xl ml-auto' : 'max-w-xl'
              }`}>
                {curSlide.subtitle || section.data?.subheading || section.data?.description}
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
                {(curSlide.primaryBtnText || section.data?.primaryBtnText) && (
                  <button
                    style={primaryBtnStyle}
                    className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    {curSlide.primaryBtnText || section.data?.primaryBtnText}
                  </button>
                )}

                {(curSlide.secondaryBtnText || section.data?.secondaryBtnText) && (
                  <button
                    style={secondaryBtnStyle}
                    className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    {curSlide.secondaryBtnText || section.data?.secondaryBtnText}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CATEGORIES SHOWCASE */}
      {section.type === 'categories' && (
        <div
          className="border-b border-black/5"
          style={{
            paddingTop: padTop,
            paddingBottom: padBottom,
          }}
        >
          <div className={containerClass}>
            {/* Header respecting contentAlign */}
            <div className={`mb-8 space-y-1.5 ${
              align === 'center' ? 'text-center mx-auto max-w-xl' : align === 'right' ? 'text-right ml-auto max-w-xl' : 'text-left max-w-xl'
            }`}>
              <h2 style={headingStyle} className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                {section.data?.heading || 'Shop By Category'}
              </h2>
              {section.data?.subtitle && (
                <p style={subtitleStyle} className="text-xs text-slate-600">{section.data?.subtitle}</p>
              )}
            </div>

            {/* Dynamic Grid with exact aspect ratio & border radius */}
            {(() => {
              const catList = (section.data?.categoriesList as any[]) || [];
              const aspect = section.data?.aspectRatio || '3/4';
              const aspectClass = aspect === '1/1' ? 'aspect-square' : aspect === '16/9' ? 'aspect-[16/9]' : 'aspect-[3/4]';
              const radius = section.data?.cardBorderRadius || '16px';
              const catCols = device === 'mobile' ? 2 : Math.min(Math.max(catList.length, 1), 4);

              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${catCols}, minmax(0, 1fr))`,
                    gap: '1rem',
                  }}
                >
                  {catList.map((cat, idx) => (
                    <div
                      key={idx}
                      className={`group relative overflow-hidden bg-gradient-to-tr from-slate-200 via-stone-200 to-rose-100 shadow-md cursor-pointer ${aspectClass}`}
                      style={{ borderRadius: radius }}
                    >
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                        {cat.badge && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                            {cat.badge}
                          </span>
                        )}
                        <span className="font-bold text-sm leading-tight">{cat.label}</span>
                        {cat.count && <span className="text-[10px] text-slate-300 mt-0.5">{cat.count}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 3. PRODUCTS GRID */}
      {(section.type === 'products_grid' || section.type === 'product_carousel') && (
        <div
          className="border-b border-black/5"
          style={{
            paddingTop: padTop,
            paddingBottom: padBottom,
          }}
        >
          <div className={containerClass}>
            {/* Header strictly following contentAlign */}
            {align === 'center' ? (
              <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  {section.data?.querySource?.replace(/_/g, ' ')?.toUpperCase() || 'COLLECTION'}
                </span>
                <h2 style={headingStyle} className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                  {section.data?.heading || 'Featured Essentials'}
                </h2>
                {section.data?.subtitle && <p style={subtitleStyle} className="text-xs text-slate-600">{section.data?.subtitle}</p>}
                {section.data?.showViewAll !== false && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-rose-600 inline-flex items-center gap-1 cursor-pointer hover:underline">
                      <span>View Full Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            ) : align === 'right' ? (
              <div className="text-right max-w-2xl ml-auto mb-8 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  {section.data?.querySource?.replace(/_/g, ' ')?.toUpperCase() || 'COLLECTION'}
                </span>
                <h2 style={headingStyle} className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                  {section.data?.heading || 'Featured Essentials'}
                </h2>
                {section.data?.subtitle && <p style={subtitleStyle} className="text-xs text-slate-600">{section.data?.subtitle}</p>}
                {section.data?.showViewAll !== false && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-rose-600 inline-flex items-center gap-1 cursor-pointer hover:underline">
                      <span>View Full Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                    {section.data?.querySource?.replace(/_/g, ' ')?.toUpperCase() || 'COLLECTION'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 mt-1">
                    {section.data?.heading || 'Featured Essentials'}
                  </h2>
                  {section.data?.subtitle && <p style={subtitleStyle} className="text-xs text-slate-600 mt-1">{section.data?.subtitle}</p>}
                </div>
                {section.data?.showViewAll !== false && (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1 cursor-pointer hover:underline">
                    <span>View Full Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            )}

            {/* DYNAMIC GRID strictly following columnsDesktop, columnsTablet, columnsMobile */}
            {(() => {
              const pCols =
                device === 'mobile'
                  ? (section.data?.columnsMobile || 1)
                  : device === 'tablet'
                  ? (section.data?.columnsTablet || 2)
                  : (section.data?.columnsDesktop || 4);
              const pLimit = section.data?.limit || 8;

              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${pCols}, minmax(0, 1fr))`,
                    gap: '1rem',
                  }}
                >
                  {[
                    { title: 'Chanderi Silk Co-ord Set', price: '$280', tag: 'Bestseller', color: '#B77A68' },
                    { title: 'Hand-Tailored Linen Trench', price: '$420', tag: 'New Season', color: '#1E1B4B' },
                    { title: 'Pleated Organza Evening Gown', price: '$590', tag: 'Runway', color: '#E11D48' },
                    { title: 'Bespoke Atelier Tote Bag', price: '$340', tag: 'Limited', color: '#0F172A' },
                    { title: 'Gold Embroidered Co-ord', price: '$310', tag: 'Exclusive', color: '#D97706' },
                    { title: 'Bespoke Cashmere Knitwear', price: '$260', tag: 'Seasonal', color: '#475569' },
                  ].slice(0, pLimit).map((prod, pIdx) => (
                    <div key={pIdx} className="group rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-sm flex flex-col transition-all hover:shadow-md">
                      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-tr from-slate-100 via-stone-100 to-rose-50 flex items-center justify-center p-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110" style={{ backgroundColor: prod.color }}>
                          <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-md">
                          {prod.tag}
                        </span>
                      </div>
                      <div className="p-3 space-y-1 bg-white">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{prod.title}</h4>
                        <span className="text-xs font-mono font-bold text-rose-600 block">{prod.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. VALUE PROPOSITIONS */}
      {section.type === 'value_props' && (
        <div
          className="border-b border-black/5"
          style={{
            paddingTop: padTop,
            paddingBottom: padBottom,
          }}
        >
          <div className={containerClass}>
            {/* Header respecting contentAlign */}
            {section.data?.heading && (
              <div className={`mb-8 space-y-1.5 ${
                align === 'center' ? 'text-center mx-auto max-w-xl' : align === 'right' ? 'text-right ml-auto max-w-xl' : 'text-left max-w-xl'
              }`}>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                  {section.data.heading}
                </h2>
                {section.data?.subheading && <p className="text-xs text-slate-600">{section.data.subheading}</p>}
              </div>
            )}

            {(() => {
              const vList = (section.data?.items as any[]) || [];
              const vCols = device === 'mobile' ? 1 : (section.data?.columns || 4);
              const cardStyle = section.data?.cardStyle || 'bordered';

              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${vCols}, minmax(0, 1fr))`,
                    gap: '1.25rem',
                  }}
                >
                  {vList.map((v, idx) => (
                    <div
                      key={idx}
                      className={`p-4 flex items-start gap-3.5 transition-all ${
                        cardStyle === 'tinted'
                          ? 'bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md'
                          : cardStyle === 'minimal'
                          ? 'bg-transparent border-0'
                          : 'bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className={`font-bold text-xs ${cardStyle === 'tinted' ? 'text-white' : 'text-slate-900'}`}>
                          {v.title}
                        </h4>
                        <p className={`text-[11px] leading-relaxed ${cardStyle === 'tinted' ? 'text-slate-300' : 'text-slate-500'}`}>
                          {v.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 5. PROMOTIONAL BANNER */}
      {section.type === 'promotional_banner' && (() => {
        const minH = section.data?.bannerHeight === 'compact' ? '200px' : section.data?.bannerHeight === 'tall' ? '420px' : '300px';

        return (
          <div className="py-6 sm:py-10">
            <div
              className={`relative overflow-hidden text-white flex flex-col justify-center ${
                isFullWidth ? 'w-full px-6 sm:px-12' : 'max-w-5xl mx-auto px-6 sm:px-12 rounded-3xl shadow-xl'
              } ${align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start'}`}
              style={{
                backgroundColor: section.data?.bgColor || '#0F172A',
                minHeight: minH,
                paddingTop: padTop,
                paddingBottom: padBottom,
              }}
            >
              {section.data?.tagline && (
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 block mb-2">
                  {section.data.tagline}
                </span>
              )}
              <h2 style={headingStyle} className="text-xl sm:text-3xl font-serif font-black mb-2 leading-tight">
                {section.data?.heading}
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mb-4 leading-relaxed">
                {section.data?.description}
              </p>
              {section.data?.btnText && (
                <button className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105">
                  {section.data.btnText}
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* 6. SPLIT EDITORIAL */}
      {section.type === 'image_text' && (
        <div
          className="border-b border-black/5"
          style={{
            paddingTop: padTop,
            paddingBottom: padBottom,
          }}
        >
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${containerClass} ${
              section.data?.imagePosition === 'right' ? 'md:[&>*:first-child]:order-2' : ''
            }`}
          >
            <div className={`rounded-2xl overflow-hidden shadow-lg bg-slate-100 ${
              section.data?.aspectRatio === 'square' ? 'aspect-square' : section.data?.aspectRatio === 'wide' ? 'aspect-[16/9]' : 'aspect-[3/4]'
            }`}>
              <img
                src={section.data?.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop'}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <div className={`space-y-3 ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
              {section.data?.tagline && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  {section.data.tagline}
                </span>
              )}
              <h3 style={headingStyle} className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                {section.data?.heading}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {section.data?.description}
              </p>
              {section.data?.btnText && (
                <button className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                  {section.data.btnText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. COUNTDOWN */}
      {section.type === 'countdown' && (
        <div
          className="text-white border-b border-black/5"
          style={{
            backgroundColor: section.data?.bgColor || '#0F172A',
            paddingTop: padTop,
            paddingBottom: padBottom,
          }}
        >
          <div className={`${containerClass} ${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`}>
            <h3 className="text-xl sm:text-2xl font-serif font-black mb-1">{section.data?.heading}</h3>
            {section.data?.subtitle && <p className="text-xs text-slate-300 mb-6">{section.data?.subtitle}</p>}
            <div className={`flex items-center gap-3 font-mono font-bold mb-6 ${align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'}`}>
              <div className="bg-white/10 px-4 py-2.5 rounded-xl text-center min-w-[64px]">
                <span className="text-lg text-rose-400 block">03</span>
                <span className="text-[9px] text-slate-400 uppercase">Days</span>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-xl text-center min-w-[64px]">
                <span className="text-lg text-rose-400 block">14</span>
                <span className="text-[9px] text-slate-400 uppercase">Hours</span>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-xl text-center min-w-[64px]">
                <span className="text-lg text-rose-400 block">28</span>
                <span className="text-[9px] text-slate-400 uppercase">Mins</span>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-xl text-center min-w-[64px]">
                <span className="text-lg text-rose-400 block">45</span>
                <span className="text-[9px] text-slate-400 uppercase">Secs</span>
              </div>
            </div>
            {section.data?.btnText && (
              <button className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
                {section.data.btnText}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 8. TESTIMONIALS */}
      {section.type === 'testimonials' && (
        <div
          className="border-b border-black/5"
          style={{
            paddingTop: padTop,
            paddingBottom: padBottom,
          }}
        >
          <div className={containerClass}>
            <div className={`mb-8 space-y-1.5 ${align === 'center' ? 'text-center mx-auto max-w-xl' : align === 'right' ? 'text-right ml-auto max-w-xl' : 'text-left max-w-xl'}`}>
              <h2 style={headingStyle} className="text-2xl font-serif font-black text-slate-900">{section.data?.heading || 'Patron Reflections'}</h2>
              {section.data?.subtitle && <p className="text-xs text-slate-600 mt-1">{section.data?.subtitle}</p>}
            </div>

            {(() => {
              const tCols = device === 'mobile' ? 1 : (section.data?.columns || 2);
              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${tCols}, minmax(0, 1fr))`,
                    gap: '1.25rem',
                  }}
                >
                  {((section.data?.testimonialsList as any[]) || []).map((t, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                      {section.data?.showStars !== false && (
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, s) => (
                            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-slate-700 italic leading-relaxed">"{t.text}"</p>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{t.name}</span>
                        <span className="text-[10px] text-slate-500">{t.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 9. NEWSLETTER */}
      {section.type === 'newsletter' && (
        <div
          className="border-b border-black/5"
          style={{
            paddingTop: padTop,
            paddingBottom: padBottom,
          }}
        >
          <div className={`${containerClass} ${align === 'center' ? 'text-center max-w-xl mx-auto' : align === 'right' ? 'text-right max-w-xl ml-auto' : 'text-left max-w-xl'}`}>
            <h3 style={headingStyle} className="text-xl sm:text-2xl font-serif font-black text-slate-900">{section.data?.heading || 'Join The Private Circle'}</h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">{section.data?.description}</p>
            <div className={`flex items-center gap-2 max-w-md ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`}>
              <input
                type="email"
                placeholder={section.data?.placeholder || 'Enter your email...'}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                readOnly
              />
              <button className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs uppercase tracking-wider shrink-0">
                {section.data?.btnText || 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      )}

            {/* 11. COLLECTIONS / LOOKBOOK */}
      {(section.type === "collections" || section.type === "lookbook" || section.type === "collections_grid") && (
        <div className="border-b border-black/5" style={{ paddingTop: padTop, paddingBottom: padBottom }}>
          <div className={containerClass}>
            <div className={`mb-8 space-y-1.5 ${align === "center" ? "text-center mx-auto max-w-xl" : align === "right" ? "text-right ml-auto max-w-xl" : "text-left max-w-xl"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                {section.data?.badge || "CURATED STORIES"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                {section.data?.heading || section.data?.title || "Collections & Lookbooks"}
              </h2>
              {section.data?.subheading && <p className="text-xs text-slate-600">{section.data.subheading}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Festive Atelier", count: "8 Products", color: "#B77A68" },
                { title: "Resort & Riviera Edit", count: "6 Products", color: "#1E1B4B" },
                { title: "Midnight Noir", count: "4 Products", color: "#0F172A" },
              ].map((col, cIdx) => (
                <div key={cIdx} className="group rounded-2xl overflow-hidden bg-slate-900 text-white relative aspect-[4/5] p-6 flex flex-col justify-end shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300">{col.count}</span>
                    <h3 className="text-lg font-serif font-bold text-white">{col.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 12. BRAND PARTNERS */}
      {(section.type === "brands" || section.type === "brand-partners" || section.type === "press") && (
        <div className="border-b border-black/5 py-8" style={{ paddingTop: padTop, paddingBottom: padBottom }}>
          <div className={containerClass}>
            <div className={`mb-6 ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {section.data?.heading || "AS FEATURED IN"}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {["VOGUE", "ELLE", "HARPERS BAZAAR", "GQ", "L’OFFICIEL"].map((b, bIdx) => (
                <span key={bIdx} className="font-serif font-black text-sm tracking-widest text-slate-700">{b}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 13. FAQ ACCORDION */}
      {(section.type === "faq" || section.type === "faqs" || section.type === "accordion") && (
        <div className="border-b border-black/5" style={{ paddingTop: padTop, paddingBottom: padBottom }}>
          <div className={containerClass}>
            <div className={`mb-8 space-y-1.5 ${align === "center" ? "text-center mx-auto max-w-xl" : align === "right" ? "text-right ml-auto max-w-xl" : "text-left max-w-xl"}`}>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                {section.data?.heading || "Frequently Asked Questions"}
              </h2>
            </div>
            <div className="max-w-2xl mx-auto space-y-3">
              {[
                "What is your return & exchange policy?",
                "How do I track my order shipment?",
                "Do you offer bespoke custom tailoring?",
              ].map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{q}</span>
                  <span className="text-slate-400 font-normal">+</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

{/* 10. SPACER */}
      {section.type === 'spacer' && (
        <div
          className="w-full flex items-center justify-center text-[10px] text-slate-400 font-mono select-none"
          style={{ height: device === 'mobile' ? (section.data?.heightMobile || '30px') : (section.data?.heightDesktop || '60px') }}
        >
          <span className="opacity-40">--- Spacer ({device === 'mobile' ? (section.data?.heightMobile || '30px') : (section.data?.heightDesktop || '60px')}) ---</span>
        </div>
      )}
    </div>
  );
}

export default function HomepageBuilderStudio() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'canvas' | 'library' | 'catalog' | 'responsive' | 'seo'>('canvas');
  const [canvasViewMode, setCanvasViewMode] = useState<'split' | 'visual' | 'pipeline'>('split');
  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals & State
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'layout' | 'content' | 'styles' | 'responsive'>('layout');
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);

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
    window.addEventListener("tenant_updated", loadData);
    return () => window.removeEventListener("tenant_updated", loadData);
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
    if (editingSection?.id === secId) {
      setEditingSection(null);
    }
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

  const isSliderMode =
    isHeroOrSlider &&
    (editingSection?.data?.layout === 'slider' ||
      editingSection?.type === 'hero_slider' ||
      editingSection?.type === 'slider');

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
                WYSIWYG LIVE BUILDER
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Store: <span className="text-slate-200 font-semibold">{activeTenant?.name || doc.tenantSlug}</span> &bull; {doc.sections.length} Sections Configured
            </p>
          </div>
        </div>

        {/* Center Device Viewport Switcher */}
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

        {/* Right Action Buttons */}
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
            <span className="hidden sm:inline">Fullscreen Simulator</span>
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

      {/* 2. SUB-NAVIGATION & VIEW MODE BAR */}
      <div className="bg-[#0A0E17] border-b border-slate-800/80 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {/* Main Tabs */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'canvas'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Studio Canvas ({doc.sections.length})</span>
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
            <span>Component Library</span>
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
            <span>SEO &amp; Social</span>
          </button>
        </div>

        {/* Visual Studio View Mode Segmented Controls (When on Canvas Tab) */}
        {activeTab === 'canvas' && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider hidden xl:inline">
              Canvas View:
            </span>
            <button
              onClick={() => setCanvasViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                canvasViewMode === 'split'
                  ? 'bg-slate-800 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Split View: Drag Pipeline on Left + Live Visual Viewport on Right"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split Studio</span>
            </button>

            <button
              onClick={() => setCanvasViewMode('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                canvasViewMode === 'visual'
                  ? 'bg-slate-800 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full Visual WYSIWYG Viewport"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visual Canvas</span>
            </button>

            <button
              onClick={() => setCanvasViewMode('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                canvasViewMode === 'pipeline'
                  ? 'bg-slate-800 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pipeline List for Quick Drag and Drop"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pipeline List</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 p-3 sm:p-6 w-full mx-auto space-y-6">
        {/* TAB 1: CANVAS - SPLIT / VISUAL / PIPELINE */}
        {activeTab === 'canvas' && (
          <div className="w-full">
            {/* SPLIT STUDIO MODE: Pipeline on Left, Real-Time Interactive Visual Viewport on Right */}
            {canvasViewMode === 'split' && (
              <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
                {/* Left Side: Pipeline List (400px wide) */}
                <div className="w-full lg:w-[420px] shrink-0 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                        Section Structure ({doc.sections.length})
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Drag to reorder. Click Customize to edit.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('library')}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
                    {doc.sections.map((section, sIdx) => {
                      const isSecHero =
                        section.type === 'hero' ||
                        section.type === 'slider' ||
                        section.type === 'hero_slider' ||
                        section.type === 'hero-slider';
                      const currentLayout = section.data?.layout || (isSecHero ? 'slider' : 'standard');

                      return (
                        <div
                          key={section.id}
                          draggable={true}
                          onDragStart={() => handleDragStart(sIdx)}
                          onDragOver={(e) => handleDragOver(e, sIdx)}
                          onDrop={() => handleDrop(sIdx)}
                          className={`p-3.5 rounded-xl border transition-all ${
                            draggedSectionIndex === sIdx
                              ? 'opacity-40 scale-95 border-rose-500 bg-rose-950/20'
                              : dragOverIndex === sIdx
                              ? 'border-t-2 border-t-rose-500 bg-slate-800'
                              : section.enabled
                              ? 'bg-[#0D111A] border-slate-800/90 shadow-md hover:border-slate-700'
                              : 'bg-slate-950/40 border-dashed border-slate-800/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-300 shrink-0" />
                              <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-rose-400 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                                {sIdx + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs font-bold text-white truncate max-w-[150px]">
                                    {section.name}
                                  </h4>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                                    {section.type}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {isSecHero ? `Layout: ${currentLayout.toUpperCase()}` : section.data?.heading || section.subtitle || 'Component'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenInspector(section)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Customize</span>
                              </button>

                              <button
                                onClick={() => {
                                  const next = {
                                    ...doc,
                                    sections: doc.sections.map((s) => (s.id === section.id ? { ...s, enabled: !s.enabled } : s)),
                                  };
                                  setDoc(next);
                                  pushHistory(next);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
                                title={section.enabled ? 'Hide Section' : 'Show Section'}
                              >
                                {section.enabled ? (
                                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Embedded Live Real-Time Interactive Visual Viewport */}
                <div className="flex-1 min-w-0 bg-[#080B12] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  {/* Viewport Header Bar */}
                  <div className="h-12 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Live Storefront Viewport
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        (WYSIWYG Interactive Rendering &bull; Hover any section to customize)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800">
                      <button
                        onClick={() => setDevice('desktop')}
                        className={`p-1 rounded ${device === 'desktop' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Desktop View"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDevice('tablet')}
                        className={`p-1 rounded ${device === 'tablet' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Tablet View"
                      >
                        <Tablet className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDevice('mobile')}
                        className={`p-1 rounded ${device === 'mobile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Mobile View"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Viewport Body */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black/60 flex flex-col items-center justify-start min-h-[600px] max-h-[calc(100vh-220px)]">
                    <div
                      className={`transition-all duration-300 bg-[#FAFAF9] rounded-2xl shadow-2xl overflow-hidden border border-white/10 w-full ${
                        device === 'desktop'
                          ? 'max-w-5xl'
                          : device === 'tablet'
                          ? 'max-w-[768px]'
                          : 'max-w-[390px]'
                      }`}
                    >
                      {doc.sections
                        .filter((s) => s.enabled)
                        .map((sec, sIdx) => (
                          <SectionVisualRenderer
                            key={sec.id}
                            section={sec}
                            device={device}
                            onCustomize={() => handleOpenInspector(sec)}
                            onMoveUp={() => handleMoveSection(sIdx, 'up')}
                            onMoveDown={() => handleMoveSection(sIdx, 'down')}
                            onDelete={() => handleDeleteSection(sec.id)}
                            canMoveUp={sIdx > 0}
                            canMoveDown={sIdx < doc.sections.length - 1}
                            showActions={true}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FULL VISUAL CANVAS MODE */}
            {canvasViewMode === 'visual' && (
              <div className="w-full flex flex-col items-center justify-start space-y-4">
                <div className="flex items-center justify-between w-full max-w-5xl pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Storefront Live Interactive Canvas
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Hover any section to move, customize, or reconfigure.
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('library')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Insert Component</span>
                  </button>
                </div>

                <div
                  className={`transition-all duration-300 bg-[#FAFAF9] rounded-2xl shadow-2xl overflow-hidden border border-white/10 w-full ${
                    device === 'desktop'
                      ? 'max-w-5xl'
                      : device === 'tablet'
                      ? 'max-w-[768px]'
                      : 'max-w-[390px]'
                  }`}
                >
                  {doc.sections
                    .filter((s) => s.enabled)
                    .map((sec, sIdx) => (
                      <SectionVisualRenderer
                        key={sec.id}
                        section={sec}
                        device={device}
                        onCustomize={() => handleOpenInspector(sec)}
                        onMoveUp={() => handleMoveSection(sIdx, 'up')}
                        onMoveDown={() => handleMoveSection(sIdx, 'down')}
                        onDelete={() => handleDeleteSection(sec.id)}
                        canMoveUp={sIdx > 0}
                        canMoveDown={sIdx < doc.sections.length - 1}
                        showActions={true}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* PIPELINE LIST MODE */}
            {canvasViewMode === 'pipeline' && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide">Homepage Section Pipeline</h2>
                    <p className="text-xs text-slate-400">
                      Drag and drop cards to reorder homepage rendering sequence.
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

                <div className="space-y-3">
                  {doc.sections.map((section, sIdx) => (
                    <div
                      key={section.id}
                      draggable={true}
                      onDragStart={() => handleDragStart(sIdx)}
                      onDragOver={(e) => handleDragOver(e, sIdx)}
                      onDrop={() => handleDrop(sIdx)}
                      className={`p-4 rounded-2xl border transition-all ${
                        draggedSectionIndex === sIdx
                          ? 'opacity-40 scale-95 border-rose-500 bg-rose-950/20'
                          : dragOverIndex === sIdx
                          ? 'border-t-2 border-t-rose-500 bg-slate-800/80'
                          : section.enabled
                          ? 'bg-[#0D111A] border-slate-800/90 shadow-xl hover:border-slate-700'
                          : 'bg-slate-950/40 border-dashed border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-300" />
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-rose-400">
                            {sIdx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white truncate">{section.name}</h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
                                {section.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {section.subtitle || section.data?.heading || 'Component'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenInspector(section)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Customize</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPONENT LIBRARY */}
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

      {/* 4. EXECUTIVE SECTION CUSTOMIZATION INSPECTOR MODAL WITH LIVE COMPONENT VISUALIZER */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-7xl bg-[#0B0E17] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
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
                    Live visual representation: edit any control on the left and see it update instantly on the right.
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

            {/* Split Screen Inspector Body */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* LEFT COLUMN: 4-TAB CONTROL PANEL (55% Width) */}
              <div className="w-full lg:w-[55%] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
                {/* Inspector Tab Bar */}
                <div className="bg-[#080B12] border-b border-slate-800/80 px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
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

                {/* Form Controls Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
                  {/* TAB 1: LAYOUT & STRUCTURE */}
                  {inspectorTab === 'layout' && (
                    <div className="space-y-6">
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

                      {/* HERO LAYOUT CONTROLS */}
                      {isHeroOrSlider && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-5">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                            <Sparkles className="w-4 h-4 text-rose-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                              Hero Layout Engine
                            </h4>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                              Hero Layout Variant
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                              Hero Minimum Height
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

                      {/* PRODUCTS COLUMNS */}
                      {(editingSection.type === 'products_grid' || editingSection.type === 'product_carousel') && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                            Product Grid Columns &amp; Limits
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Desktop Columns</label>
                              <select
                                value={editingSection.data?.columnsDesktop || 4}
                                onChange={(e) => updateSectionData('columnsDesktop', parseInt(e.target.value, 10))}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                              >
                                {[2, 3, 4, 5, 6].map((c) => (
                                  <option key={c} value={c}>{c} Columns</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Tablet Columns</label>
                              <select
                                value={editingSection.data?.columnsTablet || 2}
                                onChange={(e) => updateSectionData('columnsTablet', parseInt(e.target.value, 10))}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                              >
                                {[2, 3].map((c) => (
                                  <option key={c} value={c}>{c} Columns</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Mobile Columns</label>
                              <select
                                value={editingSection.data?.columnsMobile || 1}
                                onChange={(e) => updateSectionData('columnsMobile', parseInt(e.target.value, 10))}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                              >
                                {[1, 2].map((c) => (
                                  <option key={c} value={c}>{c} Columns</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: CONTENT & MEDIA */}
                  {inspectorTab === 'content' && (
                    <div className="space-y-6">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Section Display Name
                        </label>
                        <input
                          type="text"
                          value={editingSection.name}
                          onChange={(e) => handleUpdateEditingSection({ name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      {/* MULTI-SLIDE CAROUSEL MANAGER */}
                      {isSliderMode ? (
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-5">
                          {/* Playback Settings */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-rose-400" />
                              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                                Carousel Controls
                              </h4>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingSection.data?.autoplay !== false}
                                  onChange={(e) => updateSectionData('autoplay', e.target.checked)}
                                  className="w-4 h-4 accent-rose-600 rounded"
                                />
                                <span>Autoplay</span>
                              </label>

                              <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingSection.data?.showArrows !== false}
                                  onChange={(e) => updateSectionData('showArrows', e.target.checked)}
                                  className="w-4 h-4 accent-rose-600 rounded"
                                />
                                <span>Arrows</span>
                              </label>

                              <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingSection.data?.showDots !== false}
                                  onChange={(e) => updateSectionData('showDots', e.target.checked)}
                                  className="w-4 h-4 accent-rose-600 rounded"
                                />
                                <span>Dots</span>
                              </label>
                            </div>
                          </div>

                          {/* Slide Tabs */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                                Carousel Slides ({(editingSection.data?.slides || []).length})
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

                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                              {((editingSection.data?.slides as HeroSlide[]) || []).map((slide, sIdx) => (
                                <button
                                  key={slide.id || sIdx}
                                  type="button"
                                  onClick={() => setActiveSlideIdx(sIdx)}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-2 ${
                                    activeSlideIdx === sIdx
                                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950'
                                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
                                  }`}
                                >
                                  <span>Slide #{sIdx + 1}</span>
                                  <span className="text-[10px] opacity-75 truncate max-w-[80px]">
                                    {slide.title || 'Untitled'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Active Slide Form */}
                          {editingSection.data?.slides?.[activeSlideIdx] && (() => {
                            const curSlide = editingSection.data.slides[activeSlideIdx] as HeroSlide;
                            return (
                              <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                                  <span className="text-xs font-bold text-white flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-lg bg-rose-600/20 text-rose-400 text-[11px] font-bold flex items-center justify-center font-mono">
                                      {activeSlideIdx + 1}
                                    </span>
                                    Slide #{activeSlideIdx + 1} Content
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveSlide(activeSlideIdx, 'left')}
                                      disabled={activeSlideIdx === 0}
                                      className={`p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white ${
                                        activeSlideIdx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                      }`}
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveSlide(activeSlideIdx, 'right')}
                                      disabled={activeSlideIdx === (editingSection.data?.slides || []).length - 1}
                                      className={`p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white ${
                                        activeSlideIdx === (editingSection.data?.slides || []).length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                      }`}
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSlide(activeSlideIdx)}
                                      className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Slide Eyebrow Tagline</label>
                                    <input
                                      type="text"
                                      value={curSlide.tagline || ''}
                                      onChange={(e) => handleUpdateSlide(activeSlideIdx, { tagline: e.target.value })}
                                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Slide Main Headline</label>
                                    <input
                                      type="text"
                                      value={curSlide.title || ''}
                                      onChange={(e) => handleUpdateSlide(activeSlideIdx, { title: e.target.value })}
                                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-serif"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Slide Subtitle Copy</label>
                                    <textarea
                                      rows={2}
                                      value={curSlide.subtitle || ''}
                                      onChange={(e) => handleUpdateSlide(activeSlideIdx, { subtitle: e.target.value })}
                                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                      <label className="text-[10px] text-slate-400 block mb-0.5">Primary CTA Button</label>
                                      <input
                                        type="text"
                                        value={curSlide.primaryBtnText || ''}
                                        onChange={(e) => handleUpdateSlide(activeSlideIdx, { primaryBtnText: e.target.value })}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                        placeholder="Shop Now"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-400 block mb-0.5">Primary Link Target</label>
                                      <input
                                        type="text"
                                        value={curSlide.primaryBtnLink || ''}
                                        onChange={(e) => handleUpdateSlide(activeSlideIdx, { primaryBtnLink: e.target.value })}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                                        placeholder="/collections"
                                      />
                                    </div>
                                  </div>

                                  <div className="pt-2">
                                    <ImageUploadInput
                                      label="Slide Background Banner Image"
                                      value={curSlide.desktopImage || ''}
                                      onChange={(url) => handleUpdateSlide(activeSlideIdx, { desktopImage: url })}
                                      aspectRatio="banner"
                                      folder="Hero"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        /* SINGLE HERO / STANDARD CONTENT */
                        <div className="space-y-4">
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                              Eyebrow / Tagline
                            </label>
                            <input
                              type="text"
                              value={editingSection.data?.tagline || ''}
                              onChange={(e) => updateSectionData('tagline', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                              Main Headline
                            </label>
                            <input
                              type="text"
                              value={editingSection.data?.heading || ''}
                              onChange={(e) => updateSectionData('heading', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-serif"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                              Subtitle / Description
                            </label>
                            <textarea
                              rows={2}
                              value={editingSection.data?.subheading || editingSection.data?.description || ''}
                              onChange={(e) => updateSectionMultipleData({ subheading: e.target.value, description: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Primary Button Text</label>
                              <input
                                type="text"
                                value={editingSection.data?.primaryBtnText || editingSection.data?.btnText || ''}
                                onChange={(e) => updateSectionMultipleData({ primaryBtnText: e.target.value, btnText: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Link Target</label>
                              <input
                                type="text"
                                value={editingSection.data?.primaryBtnLink || editingSection.data?.btnLink || ''}
                                onChange={(e) => updateSectionMultipleData({ primaryBtnLink: e.target.value, btnLink: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="pt-2">
                            <ImageUploadInput
                              label="Section Main Image"
                              value={editingSection.data?.desktopImage || editingSection.data?.image || editingSection.data?.bgImage || ''}
                              onChange={(url) => updateSectionMultipleData({ desktopImage: url, image: url, bgImage: url })}
                              aspectRatio="banner"
                              folder="Homepage"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: DESIGN & STYLING */}
                  {inspectorTab === 'styles' && (
                    <div className="space-y-6">
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Background &amp; Overlay Darkening
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Background Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingSection.data?.bgColor || '#0F172A'}
                                onChange={(e) => updateSectionData('bgColor', e.target.value)}
                                className="w-8 h-8 rounded bg-transparent border border-slate-700 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={editingSection.data?.bgColor || '#0F172A'}
                                onChange={(e) => updateSectionData('bgColor', e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Overlay Opacity</label>
                            <div className="flex items-center gap-2 pt-2">
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
                                onChange={(e) => updateSectionData('overlayOpacity', parseInt(e.target.value, 10))}
                                className="flex-1 accent-rose-500 cursor-pointer"
                              />
                              <span className="text-xs font-mono font-bold text-rose-400 w-10 text-right">
                                {typeof editingSection.data?.overlayOpacity === 'number'
                                  ? (editingSection.data.overlayOpacity <= 1
                                      ? Math.round(editingSection.data.overlayOpacity * 100)
                                      : Math.round(editingSection.data.overlayOpacity))
                                  : 45}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Custom Button Styling */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Button Geometry &amp; Colors
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Primary Button BG</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingSection.data?.primaryBtnColor || '#E11D48'}
                                onChange={(e) => updateSectionData('primaryBtnColor', e.target.value)}
                                className="w-8 h-8 rounded bg-transparent border border-slate-700 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={editingSection.data?.primaryBtnColor || '#E11D48'}
                                onChange={(e) => updateSectionData('primaryBtnColor', e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Primary Button Text</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingSection.data?.primaryBtnTextColor || '#FFFFFF'}
                                onChange={(e) => updateSectionData('primaryBtnTextColor', e.target.value)}
                                className="w-8 h-8 rounded bg-transparent border border-slate-700 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={editingSection.data?.primaryBtnTextColor || '#FFFFFF'}
                                onChange={(e) => updateSectionData('primaryBtnTextColor', e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1.5">Border Radius</label>
                          <div className="grid grid-cols-5 gap-2">
                            {['0px', '4px', '8px', '16px', '9999px'].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => updateSectionData('btnBorderRadius', r)}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center ${
                                  (editingSection.data?.btnBorderRadius || '8px') === r
                                    ? 'bg-rose-600 text-white border-rose-500'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {r === '9999px' ? 'Pill' : r}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Typography Panel 1: Heading & Title */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-rose-400" />
                            <span>Heading &amp; Title Typography</span>
                          </h4>
                          <span className="text-[10px] font-mono text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                            H1 / H2 / Title
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* Font Family */}
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Font Family</label>
                            <select
                              value={editingSection.data?.headingFontFamily || 'inherit'}
                              onChange={(e) => updateSectionData('headingFontFamily', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none font-sans"
                            >
                              {FONT_FAMILY_OPTIONS.map((f) => (
                                <option key={f.value} value={f.value}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Font Color & Size */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Heading Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editingSection.data?.headingColor || '#FFFFFF'}
                                  onChange={(e) => updateSectionData('headingColor', e.target.value)}
                                  className="w-8 h-8 rounded bg-transparent border border-slate-700 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={editingSection.data?.headingColor || '#FFFFFF'}
                                  onChange={(e) => updateSectionData('headingColor', e.target.value)}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] text-slate-400">Font Size</label>
                                <span className="text-xs font-mono font-bold text-rose-400">
                                  {editingSection.data?.headingFontSize || '40px'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="range"
                                  min="18"
                                  max="80"
                                  step="2"
                                  value={parseInt(editingSection.data?.headingFontSize || '40', 10)}
                                  onChange={(e) => updateSectionData('headingFontSize', `${e.target.value}px`)}
                                  className="flex-1 accent-rose-500 cursor-pointer"
                                />
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                {[
                                  { label: 'S', val: '24px' },
                                  { label: 'M', val: '32px' },
                                  { label: 'L', val: '40px' },
                                  { label: 'XL', val: '52px' },
                                  { label: 'Display', val: '64px' },
                                ].map((p) => (
                                  <button
                                    key={p.val}
                                    type="button"
                                    onClick={() => updateSectionData('headingFontSize', p.val)}
                                    className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                                      editingSection.data?.headingFontSize === p.val
                                        ? 'bg-rose-600/30 text-rose-300 border-rose-500'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Font Weight & Letter Spacing */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Font Weight</label>
                              <select
                                value={editingSection.data?.headingFontWeight || '700'}
                                onChange={(e) => updateSectionData('headingFontWeight', e.target.value)}
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                              >
                                {FONT_WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Letter Spacing (Tracking)</label>
                              <select
                                value={editingSection.data?.headingLetterSpacing || '0em'}
                                onChange={(e) => updateSectionData('headingLetterSpacing', e.target.value)}
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                              >
                                {LETTER_SPACING_OPTIONS.map((ls) => (
                                  <option key={ls.value} value={ls.value}>
                                    {ls.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Line Height & Text Transform */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Line Height</label>
                              <select
                                value={editingSection.data?.headingLineHeight || '1.15'}
                                onChange={(e) => updateSectionData('headingLineHeight', e.target.value)}
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                              >
                                <option value="1.05">Tight (1.05)</option>
                                <option value="1.15">Snug (1.15)</option>
                                <option value="1.25">Normal (1.25)</option>
                                <option value="1.4">Relaxed (1.4)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Text Transform</label>
                              <div className="grid grid-cols-4 gap-1">
                                {TEXT_TRANSFORM_OPTIONS.map((tt) => (
                                  <button
                                    key={tt.value}
                                    type="button"
                                    onClick={() => updateSectionData('headingTextTransform', tt.value)}
                                    className={`py-1.5 rounded text-[10px] font-bold border transition-colors text-center ${
                                      (editingSection.data?.headingTextTransform || 'none') === tt.value
                                        ? 'bg-rose-600 text-white border-rose-500'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                    }`}
                                  >
                                    {tt.label === 'UPPERCASE' ? 'AA' : tt.label === 'Capitalize' ? 'Aa' : tt.label === 'lowercase' ? 'aa' : 'Off'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Typography Panel 2: Subtitle & Body */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-blue-400" />
                            <span>Subtitle &amp; Body Typography</span>
                          </h4>
                          <span className="text-[10px] font-mono text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                            Subhead / Description
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* Font Family */}
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Font Family</label>
                            <select
                              value={editingSection.data?.subtitleFontFamily || 'inherit'}
                              onChange={(e) => updateSectionData('subtitleFontFamily', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                            >
                              {FONT_FAMILY_OPTIONS.map((f) => (
                                <option key={f.value} value={f.value}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Font Color & Size */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Subtitle Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editingSection.data?.subtitleColor || '#CBD5E1'}
                                  onChange={(e) => updateSectionData('subtitleColor', e.target.value)}
                                  className="w-8 h-8 rounded bg-transparent border border-slate-700 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={editingSection.data?.subtitleColor || '#CBD5E1'}
                                  onChange={(e) => updateSectionData('subtitleColor', e.target.value)}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] text-slate-400">Font Size</label>
                                <span className="text-xs font-mono font-bold text-blue-400">
                                  {editingSection.data?.subtitleFontSize || '15px'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="range"
                                  min="11"
                                  max="24"
                                  step="1"
                                  value={parseInt(editingSection.data?.subtitleFontSize || '15', 10)}
                                  onChange={(e) => updateSectionData('subtitleFontSize', `${e.target.value}px`)}
                                  className="flex-1 accent-blue-500 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Font Weight & Line Height */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Font Weight</label>
                              <select
                                value={editingSection.data?.subtitleFontWeight || '400'}
                                onChange={(e) => updateSectionData('subtitleFontWeight', e.target.value)}
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                              >
                                <option value="300">300 Light</option>
                                <option value="400">400 Regular</option>
                                <option value="500">500 Medium</option>
                                <option value="600">600 Semi-Bold</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Line Height</label>
                              <select
                                value={editingSection.data?.subtitleLineHeight || '1.6'}
                                onChange={(e) => updateSectionData('subtitleLineHeight', e.target.value)}
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                              >
                                <option value="1.4">Compact (1.4)</option>
                                <option value="1.6">Normal (1.6)</option>
                                <option value="1.8">Relaxed (1.8)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Typography Panel 3: Badge & Eyebrow */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-amber-400" />
                            <span>Badge &amp; Eyebrow Typography</span>
                          </h4>
                          <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            Tagline / Pill
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Badge Text Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingSection.data?.badgeColor || '#FFFFFF'}
                                onChange={(e) => updateSectionData('badgeColor', e.target.value)}
                                className="w-8 h-8 rounded bg-transparent border border-slate-700 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={editingSection.data?.badgeColor || '#FFFFFF'}
                                onChange={(e) => updateSectionData('badgeColor', e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Badge Background</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingSection.data?.badgeBgColor || '#E11D48'}
                                onChange={(e) => updateSectionData('badgeBgColor', e.target.value)}
                                className="w-8 h-8 rounded bg-transparent border border-slate-700 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={editingSection.data?.badgeBgColor || '#E11D48'}
                                onChange={(e) => updateSectionData('badgeBgColor', e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Font Size</label>
                            <select
                              value={editingSection.data?.badgeFontSize || '10px'}
                              onChange={(e) => updateSectionData('badgeFontSize', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                            >
                              <option value="9px">9px Micro</option>
                              <option value="10px">10px Small</option>
                              <option value="11px">11px Medium</option>
                              <option value="12px">12px Standard</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Font Weight</label>
                            <select
                              value={editingSection.data?.badgeFontWeight || '800'}
                              onChange={(e) => updateSectionData('badgeFontWeight', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                            >
                              <option value="600">600 Semi-Bold</option>
                              <option value="700">700 Bold</option>
                              <option value="800">800 Extra-Bold</option>
                              <option value="900">900 Black</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Letter Spacing</label>
                            <select
                              value={editingSection.data?.badgeLetterSpacing || '0.15em'}
                              onChange={(e) => updateSectionData('badgeLetterSpacing', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                            >
                              <option value="0.05em">Wide (0.05em)</option>
                              <option value="0.1em">Wider (0.1em)</option>
                              <option value="0.15em">Widest (0.15em)</option>
                              <option value="0.25em">Expanded (0.25em)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Typography Panel 4: Button & CTA */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Button Typography &amp; Font Styling</span>
                          </h4>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            CTA Buttons
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Button Font Family</label>
                            <select
                              value={editingSection.data?.btnFontFamily || 'inherit'}
                              onChange={(e) => updateSectionData('btnFontFamily', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                            >
                              {FONT_FAMILY_OPTIONS.map((f) => (
                                <option key={f.value} value={f.value}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Button Font Weight</label>
                            <select
                              value={editingSection.data?.btnFontWeight || '700'}
                              onChange={(e) => updateSectionData('btnFontWeight', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                            >
                              <option value="500">500 Medium</option>
                              <option value="600">600 Semi-Bold</option>
                              <option value="700">700 Bold</option>
                              <option value="800">800 Extra-Bold</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Font Size</label>
                            <select
                              value={editingSection.data?.btnFontSize || '12px'}
                              onChange={(e) => updateSectionData('btnFontSize', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                            >
                              <option value="11px">11px Compact</option>
                              <option value="12px">12px Standard</option>
                              <option value="13px">13px Medium</option>
                              <option value="14px">14px Large</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Letter Spacing</label>
                            <select
                              value={editingSection.data?.btnLetterSpacing || '0.05em'}
                              onChange={(e) => updateSectionData('btnLetterSpacing', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                            >
                              <option value="0em">Normal</option>
                              <option value="0.05em">Wide</option>
                              <option value="0.1em">Widest</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Transform</label>
                            <select
                              value={editingSection.data?.btnTextTransform || 'uppercase'}
                              onChange={(e) => updateSectionData('btnTextTransform', e.target.value)}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-rose-500 focus:outline-none"
                            >
                              <option value="uppercase">UPPERCASE</option>
                              <option value="capitalize">Capitalize</option>
                              <option value="none">Normal</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: RESPONSIVE */}
                  {inspectorTab === 'responsive' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Device Viewport Toggles
                        </h4>
                        <div className="space-y-2">
                          {[
                            { id: 'desktop', label: 'Desktop (1024px+)', icon: Monitor },
                            { id: 'tablet', label: 'Tablet (768px - 1023px)', icon: Tablet },
                            { id: 'mobile', label: 'Mobile (< 768px)', icon: Smartphone },
                          ].map((dev) => {
                            const DevIcon = dev.icon;
                            return (
                              <div key={dev.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                                <div className="flex items-center gap-2">
                                  <DevIcon className="w-4 h-4 text-rose-400" />
                                  <span className="text-xs font-bold text-white">{dev.label}</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={editingSection.responsive?.[dev.id as 'desktop']?.visible !== false}
                                  onChange={(e) => updateSectionResponsive(dev.id as any, e.target.checked)}
                                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE REAL-TIME SECTION VISUALIZER (45% Width) */}
              <div className="hidden lg:flex lg:w-[45%] flex-col bg-[#07090E] overflow-hidden">
                {/* Visualizer Header */}
                <div className="h-12 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Live Component Visualizer
                    </span>
                  </div>

                  {/* Device Preview Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
                    <button
                      onClick={() => setDevice('desktop')}
                      className={`p-1 rounded ${device === 'desktop' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Desktop View"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDevice('tablet')}
                      className={`p-1 rounded ${device === 'tablet' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Tablet View"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDevice('mobile')}
                      className={`p-1 rounded ${device === 'mobile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Mobile View"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visualizer Render Window */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start bg-black/50">
                  <div
                    className={`transition-all duration-300 bg-[#FAFAF9] rounded-2xl shadow-2xl overflow-hidden border border-white/10 w-full ${
                      device === 'mobile' ? 'max-w-[340px]' : device === 'tablet' ? 'max-w-[480px]' : 'max-w-full'
                    }`}
                  >
                    <SectionVisualRenderer
                      section={editingSection}
                      device={device}
                      showActions={false}
                      activeSlideIdx={activeSlideIdx}
                      onSlideChange={setActiveSlideIdx}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                Visual changes automatically synced to active draft.
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

      {/* 5. FULLSCREEN LIVE SIMULATOR */}
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
                .map((sec, sIdx) => (
                  <SectionVisualRenderer
                    key={sec.id}
                    section={sec}
                    device={device}
                    canMoveUp={sIdx > 0}
                    canMoveDown={sIdx < doc.sections.length - 1}
                    showActions={false}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
