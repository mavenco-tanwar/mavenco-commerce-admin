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
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';
import { CategoryService } from '@/services/categories';

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
    type: 'hero',
    name: 'Full-Width Hero Banner',
    description: 'Immersive visual header with headline, subtitle, dual CTAs, and background media.',
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
      bgImage: '/images/hero/luxury-hero-banner.jpg',
      overlayOpacity: 0.35,
      contentAlign: 'center',
      minHeight: '700px',
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
        { label: 'Women', image: '/images/categories/women.jpg', href: '/women', count: '48 Items' },
        { label: 'Men', image: '/images/categories/men.jpg', href: '/men', count: '36 Items' },
        { label: 'Kids', image: '/images/categories/kids.jpg', href: '/kids', count: '24 Items' },
        { label: 'Accessories', image: '/images/categories/accessories.jpg', href: '/accessories', count: '18 Items' },
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
      image: '/images/editorial/craftsmanship.jpg',
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
      targetDate: '2026-09-15T23:59:59',
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
      heading: 'Styled by You &bull; #MavencoAtelier',
      subtitle: 'Tag your looks on Instagram for a chance to be featured.',
      images: [
        '/images/social/look1.jpg',
        '/images/social/look2.jpg',
        '/images/social/look3.jpg',
        '/images/social/look4.jpg',
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
        name: 'Full-Width Hero Banner',
        subtitle: 'Main storefront entry visual banner with primary & secondary CTAs.',
        badge: '1',
        enabled: true,
        order: 1,
        data: {
          tagline: 'SPRING DROP 2026',
          heading: 'Elegance Designed For You',
          subheading: `Discover bespoke tailoring and handcrafted essentials by ${dynamicName}.`,
          primaryBtnText: 'SHOP THE COLLECTION',
          primaryBtnLink: '/collections',
          secondaryBtnText: 'EXPLORE LOOKBOOK',
          secondaryBtnLink: '/about',
          bgImage: '/images/hero/luxury-hero-banner.jpg',
          overlayOpacity: 0.35,
          contentAlign: 'center',
          minHeight: '650px',
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
            { label: 'Women', image: '/images/categories/women.jpg', href: '/women', count: '48 Items' },
            { label: 'Men', image: '/images/categories/men.jpg', href: '/men', count: '36 Items' },
            { label: 'Kids', image: '/images/categories/kids.jpg', href: '/kids', count: '24 Items' },
            { label: 'Collections', image: '/images/categories/accessories.jpg', href: '/collections', count: '18 Items' },
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
        },
      },
      {
        id: 'sec_editorial',
        type: 'image_text',
        name: 'Split Editorial Story',
        subtitle: 'Brand heritage story with artisanal photography.',
        badge: '5',
        enabled: true,
        order: 5,
        data: {
          tagline: 'OUR ATELIER STORY',
          heading: 'Artisanal Craftsmanship & Ethical Textiles',
          description: 'Each piece is cut and assembled by master artisans using organic chanderi silk and sustainably sourced linen.',
          btnText: 'READ OUR STORY',
          btnLink: '/about',
          imagePosition: 'left',
          image: '/images/editorial/craftsmanship.jpg',
        },
      },
      {
        id: 'sec_testimonials',
        type: 'testimonials',
        name: 'Customer Reviews & Quotes',
        subtitle: 'Verified clientele feedback cards.',
        badge: '6',
        enabled: true,
        order: 6,
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
        badge: '7',
        enabled: true,
        order: 7,
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
      showToast('Undid last change', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setDoc(JSON.parse(JSON.stringify(next)));
      setHistoryIdx(historyIdx + 1);
      showToast('Redid change', 'info');
    }
  };

  // Load Homepage Document on Mount
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

  const handleUpdateEditingSection = (updated: Partial<HomepageSection>) => {
    if (!editingSection) return;
    const modified = { ...editingSection, ...updated };
    setEditingSection(modified);

    const nextSections = doc.sections.map((s) => (s.id === editingSection.id ? modified : s));
    const next = { ...doc, sections: nextSections };
    setDoc(next);
    pushHistory(next);
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

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none max-w-7xl mx-auto">
      {/* 1. TOP HEADER STUDIO BAR (Matches Header, Footer, and Theme Builders) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800/60 shadow-sm">
              Visual Theme Studio
            </span>
            <span className="text-xs font-mono text-slate-400">
              Store: <strong className="text-white">{activeTenant?.name || 'Lumina Atelier'}</strong>{' '}
              <span className="text-slate-600">({activeTenant?.slug || 'lumina'})</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <LayoutTemplate className="w-7 h-7 text-rose-500" />
            <span>Homepage &amp; Visual Storefront Builder</span>
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Visually arrange, reorder, and configure high-converting storefront homepage sections with dynamic ecommerce catalog bindings in real-time.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('library')}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Section</span>
          </button>

          <button
            onClick={() => setIsLivePreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Live Preview</span>
          </button>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors ${
                historyIdx <= 0 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors ${
                historyIdx >= history.length - 1 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Redo"
            >
              <RotateCcw className="w-4 h-4 scale-x-[-1]" />
            </button>
          </div>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS BAR (Pill Tabs matching Header & Footer Builder) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'canvas'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Page Sections &amp; Canvas ({doc.sections.length} Sections)</span>
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
          <span>Add Section Library ({SECTION_TEMPLATES.length} Types)</span>
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
          <span>Dynamic Catalog Binding</span>
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

      {/* 3. TAB 1: SECTION CANVAS (Clean Card Architecture with Full Drag and Drop) */}
      {activeTab === 'canvas' && (
        <div className="space-y-4">
          {doc.sections.map((section, sIdx) => (
            <div
              key={section.id}
              draggable={true}
              onDragStart={() => handleDragStart(sIdx)}
              onDragOver={(e) => handleDragOver(e, sIdx)}
              onDrop={() => handleDrop(sIdx)}
              className={`p-5 rounded-2xl border transition-all ${
                draggedSectionIndex === sIdx
                  ? 'opacity-40 scale-95 border-rose-500 bg-rose-950/20'
                  : dragOverIndex === sIdx
                  ? 'border-t-2 border-t-rose-500 bg-slate-800'
                  : section.enabled
                  ? 'bg-[#0D111A] border-slate-800/90 shadow-xl'
                  : 'bg-slate-950/40 border-dashed border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left Section Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-300" />
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-rose-400">
                      {section.badge || sIdx + 1}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-wide truncate">{section.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
                        {section.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {section.subtitle || 'Configurable homepage section'}
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

                  {/* Edit Properties */}
                  <button
                    onClick={() => setEditingSection(section)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
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
          ))}

          {/* Add Section Prompt at bottom of canvas */}
          <div className="flex justify-center pt-3">
            <button
              onClick={() => setActiveTab('library')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-2 border-dashed border-slate-800 hover:border-rose-500/50 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg group"
            >
              <Plus className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Add Another Section to Canvas</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. TAB 2: SECTION LIBRARY */}
      {activeTab === 'library' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Section Template Library</h3>
            <p className="text-xs text-slate-400">
              Select any pre-built, conversion-optimized section to insert into your storefront homepage.
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
                    <span>+ Insert Section</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 3: DYNAMIC CATALOG BINDING */}
      {activeTab === 'catalog' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Catalog Data Binding</h3>
            <p className="text-xs text-slate-400">
              Configure how product grids and category collections dynamically query your inventory in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Default Query Strategy</h4>
              <p className="text-xs text-slate-400">
                When sections query products dynamically, they automatically sort by best-selling metrics and inventory availability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: RESPONSIVE VIEWPORTS */}
      {activeTab === 'responsive' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Responsive Viewport Settings</h3>
            <p className="text-xs text-slate-400">
              Fine-tune how sections render across Desktop (1440px), Tablet (768px), and Mobile (390px) screen sizes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            Sections automatically adapt columns (4 on desktop &rarr; 2 on tablet &rarr; 1 on mobile). You can customize per-section visibility in the canvas.
          </div>
        </div>
      )}

      {/* 7. TAB 5: SEO & META TAGS */}
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

      {/* MODAL 1: SECTION CUSTOMIZE INSPECTOR */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Customize {editingSection.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">{editingSection.type}</span>
              </div>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {/* Common Fields */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Section Label
                </label>
                <input
                  type="text"
                  value={editingSection.name}
                  onChange={(e) => handleUpdateEditingSection({ name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Tagline / Eyebrow */}
              {editingSection.data?.tagline !== undefined && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Eyebrow / Badge Tagline
                  </label>
                  <input
                    type="text"
                    value={editingSection.data?.tagline || ''}
                    onChange={(e) =>
                      handleUpdateEditingSection({
                        data: { ...editingSection.data, tagline: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              )}

              {/* Heading */}
              {editingSection.data?.heading !== undefined && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Main Headline (H1 / H2)
                  </label>
                  <input
                    type="text"
                    value={editingSection.data?.heading || ''}
                    onChange={(e) =>
                      handleUpdateEditingSection({
                        data: { ...editingSection.data, heading: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              )}

              {/* Subheading / Description */}
              {(editingSection.data?.subheading !== undefined || editingSection.data?.description !== undefined || editingSection.data?.subtitle !== undefined) && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subtitle / Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingSection.data?.subheading || editingSection.data?.description || editingSection.data?.subtitle || ''}
                    onChange={(e) =>
                      handleUpdateEditingSection({
                        data: {
                          ...editingSection.data,
                          subheading: e.target.value,
                          description: e.target.value,
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              )}

              {/* Primary Button */}
              {editingSection.data?.primaryBtnText !== undefined && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={editingSection.data?.primaryBtnText || ''}
                      onChange={(e) =>
                        handleUpdateEditingSection({
                          data: { ...editingSection.data, primaryBtnText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Button Link Target
                    </label>
                    <input
                      type="text"
                      value={editingSection.data?.primaryBtnLink || ''}
                      onChange={(e) =>
                        handleUpdateEditingSection({
                          data: { ...editingSection.data, primaryBtnLink: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Section Image / Banner Upload */}
              {(editingSection.data?.desktopImage !== undefined ||
                editingSection.data?.image !== undefined ||
                editingSection.data?.bgImage !== undefined ||
                editingSection.type === 'hero' ||
                editingSection.type === 'image_text' ||
                editingSection.type === 'promotional_banner' ||
                editingSection.type === 'countdown') && (
                <div className="space-y-4 pt-3 border-t border-slate-800/80">
                  <ImageUploadInput
                    label="Primary Desktop Image / Banner"
                    description="Main banner asset rendered on large screens"
                    value={
                      editingSection.data?.desktopImage ||
                      editingSection.data?.image ||
                      editingSection.data?.bgImage ||
                      ''
                    }
                    onChange={(url) =>
                      handleUpdateEditingSection({
                        data: {
                          ...editingSection.data,
                          desktopImage: url,
                          image: url,
                          bgImage: url,
                        },
                      })
                    }
                    aspectRatio="banner"
                    folder="Homepage"
                  />

                  {editingSection.data?.mobileImage !== undefined && (
                    <ImageUploadInput
                      label="Mobile Optimized Image (Optional)"
                      description="Custom portrait/compact ratio for smartphones"
                      value={editingSection.data?.mobileImage || ''}
                      onChange={(url) =>
                        handleUpdateEditingSection({
                          data: {
                            ...editingSection.data,
                            mobileImage: url,
                          },
                        })
                      }
                      aspectRatio="3/4"
                      folder="Homepage"
                    />
                  )}
                </div>
              )}

              {/* Department & Category Cards Editor */}
              {(editingSection.type === 'categories' || editingSection.data?.categoriesList !== undefined) && (
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-200">Department / Category Showcase Cards</span>
                      <p className="text-[11px] text-slate-400">
                        Customize cards shown on the storefront homepage or sync them dynamically from your store catalog.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const storeCats = await CategoryService.getAll();
                          if (storeCats.length === 0) {
                            showToast('No categories created in this store yet. Create categories in Catalog > Categories first!', 'info');
                            return;
                          }
                          // Only sync root departments (not subcategories) to Shop By Department
                          const storeDepartments = storeCats.filter((c) => !c.parentId || c.parentId === '' || c.parentId === 'none');
                          const targetList = storeDepartments.length > 0 ? storeDepartments : storeCats;
                          const syncedList = targetList.map((c) => ({
                            id: c.id || c.slug,
                            label: c.name,
                            image: c.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
                            href: `/${(c.slug || c.id || '').replace(/^cat_/, '').replace(/_[a-z0-9-]+$/, '')}`,
                            count: c.description || 'Explore Collection',
                            badge: c.seo?.title || 'Collection',
                          }));
                          handleUpdateEditingSection({
                            data: {
                              ...editingSection.data,
                              categoriesList: syncedList,
                            },
                          });
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
                              handleUpdateEditingSection({
                                data: {
                                  ...editingSection.data,
                                  categoriesList: list,
                                },
                              });
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
                                handleUpdateEditingSection({
                                  data: { ...editingSection.data, categoriesList: list },
                                });
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
                                handleUpdateEditingSection({
                                  data: { ...editingSection.data, categoriesList: list },
                                });
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
                                handleUpdateEditingSection({
                                  data: { ...editingSection.data, categoriesList: list },
                                });
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
                                handleUpdateEditingSection({
                                  data: { ...editingSection.data, categoriesList: list },
                                });
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
                              handleUpdateEditingSection({
                                data: { ...editingSection.data, categoriesList: list },
                              });
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
                          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
                          href: '/collections',
                          count: 'Explore Collection',
                          badge: 'Trending',
                        });
                        handleUpdateEditingSection({
                          data: { ...editingSection.data, categoriesList: list },
                        });
                      }}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-rose-500/50 bg-slate-900/40 hover:bg-rose-500/5 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-rose-400" />
                      <span>+ Add Department Card</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Value Propositions / Guarantees Cards Editor */}
              {(editingSection.type === 'value_props' || editingSection.type === 'value-props' || Array.isArray(editingSection.data?.items)) && (
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">Brand Value Proposition Cards</span>
                      <p className="text-[11px] text-slate-400">
                        Highlight your store customer promises, material quality, authentic craftsmanship, and shipping perks.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {((editingSection.data?.items as any[]) || []).map((vItem, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                            Card #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(editingSection.data?.items || [])];
                              list.splice(idx, 1);
                              handleUpdateEditingSection({
                                data: { ...editingSection.data, items: list },
                              });
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400"
                            title="Remove Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Icon</label>
                            <select
                              value={vItem.icon || 'sparkles'}
                              onChange={(e) => {
                                const list = [...(editingSection.data?.items || [])];
                                list[idx] = { ...list[idx], icon: e.target.value };
                                handleUpdateEditingSection({
                                  data: { ...editingSection.data, items: list },
                                });
                              }}
                              className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-800 rounded-lg text-white text-xs"
                            >
                              <option value="sparkles">Sparkles (Trends)</option>
                              <option value="award">Award (Premium Quality)</option>
                              <option value="tag">Tag (Affordable Luxury)</option>
                              <option value="truck">Truck (Easy Delivery)</option>
                              <option value="shield">Shield (Authenticity)</option>
                              <option value="heart">Heart (Handmade)</option>
                              <option value="refresh">Refresh (Easy Exchange)</option>
                              <option value="clock">Clock (Fast Dispatch)</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Card Title</label>
                            <input
                              type="text"
                              value={vItem.title || ''}
                              onChange={(e) => {
                                const list = [...(editingSection.data?.items || [])];
                                list[idx] = { ...list[idx], title: e.target.value };
                                handleUpdateEditingSection({
                                  data: { ...editingSection.data, items: list },
                                });
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
                              handleUpdateEditingSection({
                                data: { ...editingSection.data, items: list },
                              });
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
                        handleUpdateEditingSection({
                          data: { ...editingSection.data, items: list },
                        });
                      }}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-rose-500/50 bg-slate-900/40 hover:bg-rose-500/5 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-rose-400" />
                      <span>+ Add Value Proposition Card</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setEditingSection(null)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FULLSCREEN LIVE PREVIEW SIMULATOR */}
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

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-start bg-black/50">
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
                .map((sec) => (
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
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
