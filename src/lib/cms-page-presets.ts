export interface ContactStoreLocation {
  city: string;
  address: string;
  phone: string;
  hours: string;
  image?: string;
}

export interface CustomHtmlSection {
  id: string;
  title: string;
  enabled: boolean;
  html: string;
  containerWidth?: 'full' | 'standard' | 'narrow';
  backgroundColor?: string;
}

export interface ContactPageConfig {
  pageTitle: string;
  pageSubtitle: string;
  badgeText: string;
  notificationEmail: string;
  stores: ContactStoreLocation[];
  formSubjectOptions: string[];
  sectionsEnabled?: {
    header?: boolean;
    stores?: boolean;
    form?: boolean;
    customSections?: boolean;
  };
  customSections?: CustomHtmlSection[];
  design: {
    // 1. Page-level styles
    backgroundColor: string;
    textColor: string;
    mutedTextColor: string;
    headingFont: string;
    bodyFont: string;
    accentColor: string;

    // 2. Header & Intro Section
    headerBadgeBg: string;
    headerBadgeText: string;
    headerBadgeBorder: string;
    headerTitleColor: string;
    headerSubtitleColor: string;

    // 3. Boutiques & Salons Section
    storeCardBg: string;
    storeCardBorder: string;
    storeCardTitleColor: string;
    storeCardTextColor: string;
    storeCardIconColor: string;

    // 4. Concierge Form Section
    formCardBg: string;
    formCardBorder: string;
    formCardTitleColor: string;
    formInputBg: string;
    formInputBorder: string;
    formInputTextColor: string;
    formButtonBg: string;
    formButtonTextColor: string;
    buttonText: string;

    badgeText?: string;
    themeMode?: 'dark' | 'light' | 'luxury';
    showMap?: boolean;
  };
}

export interface AboutPillar {
  title: string;
  desc: string;
}

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutPageConfig {
  heroBadge: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  founderName: string;
  founderRole: string;
  founderQuote: string;
  founderImage: string;
  pillars: AboutPillar[];
  stats: AboutStat[];
  showPressLogos: boolean;
  sectionsEnabled?: {
    hero?: boolean;
    founder?: boolean;
    pillars?: boolean;
    stats?: boolean;
    cta?: boolean;
    customSections?: boolean;
  };
  customSections?: CustomHtmlSection[];
  design: {
    // 1. Page-level styles
    backgroundColor: string;
    textColor: string;
    mutedTextColor: string;
    headingFont: string;
    bodyFont: string;
    accentColor: string;

    // 2. Atelier Hero Section
    heroBadgeBg: string;
    heroBadgeText: string;
    heroBadgeBorder: string;
    heroTitleColor: string;
    heroSubtextColor: string;
    heroOverlayOpacity: number;

    // 3. Founder Statement Section
    founderCardBg: string;
    founderCardBorder: string;
    founderQuoteColor: string;
    founderNameColor: string;
    founderRoleColor: string;
    founderBadgeBg: string;

    // 4. Craft Pillars Section
    pillarSectionTitleColor: string;
    pillarCardBg: string;
    pillarCardBorder: string;
    pillarBadgeBg: string;
    pillarBadgeText: string;
    pillarTitleColor: string;
    pillarDescColor: string;

    // 5. Key Metrics & Stats Section
    statsContainerBg: string;
    statsContainerBorder: string;
    statNumberColor: string;
    statLabelColor: string;

    // 6. Concierge CTA Section
    ctaBannerBg: string;
    ctaBannerBorder: string;
    ctaBannerTitleColor: string;
    ctaBannerTextColor: string;
    ctaButtonBg: string;
    ctaButtonTextColor: string;
    ctaButtonText: string;

    themeMode?: 'dark' | 'light' | 'luxury';
  };
}

export function getDefaultContactPageConfig(tenantSlug: string, tenantDoc?: any): ContactPageConfig {
  const cleanSlug = (tenantSlug || 'demo').toLowerCase().trim();
  const isJewelry =
    cleanSlug.includes('silvora') ||
    cleanSlug.includes('jewel') ||
    cleanSlug.includes('aurum') ||
    cleanSlug.includes('watch') ||
    tenantDoc?.category?.toLowerCase().includes('jewel') ||
    tenantDoc?.categoryLabel?.toLowerCase().includes('jewel');

  const storeName = tenantDoc?.name || (cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1));
  const contact = tenantDoc?.contact || {};
  const phone = contact.phone || '+91 98765 43210';
  const email = contact.email || `care@${cleanSlug}.com`;
  const address =
    contact.address ||
    (isJewelry
      ? `${storeName} High Jewelry Salon, Connaught Place, New Delhi, India`
      : `${storeName} Flagship Store, Indiranagar, Bengaluru, Karnataka 560038`);
  const accentColor = tenantDoc?.theme?.accentColor || (isJewelry ? '#EAB308' : '#F43F5E');

  const sectionsEnabled = {
    header: true,
    stores: true,
    form: true,
    customSections: true,
  };

  const customSections: CustomHtmlSection[] = [];

  if (isJewelry) {
    return {
      pageTitle: `Visit Our Haute Salons & Concierge Desk`,
      pageSubtitle: `Experience our certified solitaire diamonds, 18K solid gold, and Swiss chronometers in person or connect with our master gemologists.`,
      badgeText: 'DIRECT ATELIER ACCESS',
      notificationEmail: email,
      stores: [
        {
          city: `${storeName} Flagship Haute Salon (New Delhi)`,
          address: address,
          phone: phone,
          hours: 'Mon-Sun: 10:30 AM – 8:30 PM (Private Salon by Appointment)',
          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop',
        },
        {
          city: `${storeName} Mumbai High Jewelry Atelier`,
          address: 'Kala Ghoda Heritage Arts Precinct, Fort, Mumbai, Maharashtra 400001',
          phone: '+91 98765 43211',
          hours: 'Mon-Sat: 11:00 AM – 8:00 PM',
          image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop',
        },
      ],
      formSubjectOptions: [
        'Bespoke Bridal Suite Appointment',
        'GIA Solitaire Diamond Consultation',
        '18K Solid Gold & Custom Horology Commission',
        'Heirloom Restyling & Gem Valuation',
        'Insured Armored Courier & Order Status',
      ],
      sectionsEnabled,
      customSections,
      design: {
        // Page-level
        backgroundColor: '#07090E',
        textColor: '#F8FAFC',
        mutedTextColor: '#94A3B8',
        headingFont: 'Playfair Display, serif',
        bodyFont: 'Plus Jakarta Sans, sans-serif',
        accentColor: accentColor,

        // Header
        headerBadgeBg: `${accentColor}1A`,
        headerBadgeText: accentColor,
        headerBadgeBorder: `${accentColor}40`,
        headerTitleColor: '#FFFFFF',
        headerSubtitleColor: '#94A3B8',

        // Stores
        storeCardBg: '#0E111C',
        storeCardBorder: 'rgba(255, 255, 255, 0.08)',
        storeCardTitleColor: accentColor,
        storeCardTextColor: '#CBD5E1',
        storeCardIconColor: '#94A3B8',

        // Form
        formCardBg: '#101320',
        formCardBorder: 'rgba(255, 255, 255, 0.1)',
        formCardTitleColor: '#FFFFFF',
        formInputBg: '#080A10',
        formInputBorder: '#334155',
        formInputTextColor: '#FFFFFF',
        formButtonBg: `linear-gradient(135deg, ${accentColor}, #B45309)`,
        formButtonTextColor: '#000000',
        buttonText: 'Send Direct Inquiry to Stylist Concierge',

        badgeText: 'DIRECT ATELIER ACCESS',
        themeMode: 'dark',
        showMap: true,
      },
    };
  }

  return {
    pageTitle: `Visit Our Ateliers & Concierge Desk`,
    pageSubtitle: `Experience our curated collections in person or connect with our personal stylists and fulfillment specialists.`,
    badgeText: 'DIRECT ATELIER ACCESS',
    notificationEmail: email,
    stores: [
      {
        city: `${storeName} Flagship Atelier`,
        address: address,
        phone: phone,
        hours: 'Mon-Sun: 11:00 AM – 9:00 PM',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop',
      },
      {
        city: `${storeName} Design Studio`,
        address: 'Kala Ghoda Arts Precinct, Fort, Mumbai, Maharashtra 400001',
        phone: '+91 82390 19096',
        hours: 'Mon-Sat: 10:30 AM – 8:00 PM',
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&auto=format&fit=crop',
      },
    ],
    formSubjectOptions: [
      'Bespoke Styling Appointment',
      'B2B Wholesale Inquiry',
      'Order Delivery & Exchange Assistance',
      'Press & Media Collaborations',
    ],
    sectionsEnabled,
    customSections,
    design: {
      backgroundColor: '#07090E',
      textColor: '#F8FAFC',
      mutedTextColor: '#94A3B8',
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
      accentColor: accentColor,

      headerBadgeBg: `${accentColor}1A`,
      headerBadgeText: accentColor,
      headerBadgeBorder: `${accentColor}40`,
      headerTitleColor: '#FFFFFF',
      headerSubtitleColor: '#94A3B8',

      storeCardBg: '#0E111C',
      storeCardBorder: 'rgba(255, 255, 255, 0.08)',
      storeCardTitleColor: accentColor,
      storeCardTextColor: '#CBD5E1',
      storeCardIconColor: '#94A3B8',

      formCardBg: '#101320',
      formCardBorder: 'rgba(255, 255, 255, 0.1)',
      formCardTitleColor: '#FFFFFF',
      formInputBg: '#080A10',
      formInputBorder: '#334155',
      formInputTextColor: '#FFFFFF',
      formButtonBg: `linear-gradient(135deg, ${accentColor}, #B45309)`,
      formButtonTextColor: '#000000',
      buttonText: 'Send Direct Inquiry to Stylist Concierge',

      badgeText: 'DIRECT ATELIER ACCESS',
      themeMode: 'dark',
      showMap: true,
    },
  };
}

export function getDefaultAboutPageConfig(tenantSlug: string, tenantDoc?: any): AboutPageConfig {
  const cleanSlug = (tenantSlug || 'demo').toLowerCase().trim();
  const isJewelry =
    cleanSlug.includes('silvora') ||
    cleanSlug.includes('jewel') ||
    cleanSlug.includes('aurum') ||
    cleanSlug.includes('watch') ||
    tenantDoc?.category?.toLowerCase().includes('jewel') ||
    tenantDoc?.categoryLabel?.toLowerCase().includes('jewel');

  const storeName = tenantDoc?.name || (cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1));
  const accentColor = tenantDoc?.theme?.accentColor || (isJewelry ? '#EAB308' : '#F43F5E');

  const sectionsEnabled = {
    hero: true,
    founder: true,
    pillars: true,
    stats: true,
    cta: true,
    customSections: true,
  };

  const customSections: CustomHtmlSection[] = [];

  if (isJewelry) {
    return {
      heroBadge: 'HERITAGE HAUTE JOAILLERIE • EST. 2018',
      heroHeadline: `Master Artisanry, Conflict-Free Solitaires & Swiss Precision`,
      heroSubtext: `Every creation from ${storeName} embodies uncompromising metallurgical perfection, hand-selected D-F color diamonds, and generations of master goldsmith heritage.`,
      heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop',
      founderName: 'Aria Montgomery',
      founderRole: 'Master Gemologist & Creative Director',
      founderQuote: 'True luxury jewelry is not merely decorative; it is an enduring heirloom of light, patience, and ethical craftsmanship passing across generations.',
      founderImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop',
      pillars: [
        {
          title: '100% GIA & IGI Certified',
          desc: 'Every diamond is ethically sourced, conflict-free, laser-inscribed, and certified for 4Cs grading.',
        },
        {
          title: 'Hallmarked 18K & 24K Gold',
          desc: 'Solid metallurgical purity tested and certified with official government BIS and international hallmarks.',
        },
        {
          title: 'Master Atelier Craftsmanship',
          desc: 'Individually prong-set and hand-polished by multi-generation master goldsmiths and diamond cutters.',
        },
        {
          title: 'Lifetime Care & Insured Transit',
          desc: 'Complimentary annual ultrasonic cleaning, prong inspection, and fully insured armored transit worldwide.',
        },
      ],
      stats: [
        { value: '18K & 24K', label: 'Solid Hallmarked Gold' },
        { value: '100%', label: 'Conflict-Free Solitaires' },
        { value: '15,000+', label: 'Heirlooms Crafted' },
        { value: 'Lifetime', label: 'Complimentary Care' },
      ],
      showPressLogos: true,
      sectionsEnabled,
      customSections,
      design: {
        backgroundColor: '#07090E',
        textColor: '#F8FAFC',
        mutedTextColor: '#94A3B8',
        headingFont: 'Playfair Display, serif',
        bodyFont: 'Plus Jakarta Sans, sans-serif',
        accentColor: accentColor,

        heroBadgeBg: `${accentColor}1A`,
        heroBadgeText: accentColor,
        heroBadgeBorder: `${accentColor}40`,
        heroTitleColor: '#FFFFFF',
        heroSubtextColor: '#CBD5E1',
        heroOverlayOpacity: 0.35,

        founderCardBg: 'linear-gradient(135deg, #121522, #170E1A)',
        founderCardBorder: 'rgba(255, 255, 255, 0.08)',
        founderQuoteColor: '#F8FAFC',
        founderNameColor: '#FFFFFF',
        founderRoleColor: accentColor,
        founderBadgeBg: accentColor,

        pillarSectionTitleColor: '#FFFFFF',
        pillarCardBg: '#0E111C',
        pillarCardBorder: 'rgba(255, 255, 255, 0.08)',
        pillarBadgeBg: `${accentColor}1A`,
        pillarBadgeText: accentColor,
        pillarTitleColor: '#FFFFFF',
        pillarDescColor: '#94A3B8',

        statsContainerBg: '#0B0D16',
        statsContainerBorder: 'rgba(255, 255, 255, 0.08)',
        statNumberColor: accentColor,
        statLabelColor: '#94A3B8',

        ctaBannerBg: 'linear-gradient(135deg, #111422, #1A1320)',
        ctaBannerBorder: 'rgba(255, 255, 255, 0.08)',
        ctaBannerTitleColor: '#FFFFFF',
        ctaBannerTextColor: '#94A3B8',
        ctaButtonBg: `linear-gradient(135deg, ${accentColor}, #B45309)`,
        ctaButtonTextColor: '#000000',
        ctaButtonText: 'Book Private Salon Session',

        themeMode: 'dark',
      },
    };
  }

  return {
    heroBadge: 'SINCE 2018 • ATELIER HERITAGE',
    heroHeadline: `Crafting Timeless Elegance Through Pure Artisanry`,
    heroSubtext: `Every silhouette at ${storeName} tells a story of generation-old craftsmanship blended with modern haute couture.`,
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop',
    founderName: 'Ananya Singhania',
    founderRole: 'Founder & Creative Director',
    founderQuote: 'We believe luxury lies in patience, handspun textiles, and empowering artisan communities with 100% fair-wage commerce.',
    founderImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop',
    pillars: [
      {
        title: '100% Handcrafted Certified',
        desc: 'Handcrafted on authentic wooden looms without synthetic blends or compromises.',
      },
      {
        title: 'Zero Compromise Purity',
        desc: 'Pure mulberry silks, certified organic cottons, and genuine gold zari.',
      },
      {
        title: 'Fair-Trade Artisans',
        desc: 'Direct partnership with over 450+ master weaver families across India.',
      },
      {
        title: 'Conscious Luxury',
        desc: 'Plastic-free biodegradable packaging and carbon-neutral deliveries.',
      },
    ],
    stats: [
      { value: '450+', label: 'Master Artisans' },
      { value: '100%', label: 'Pure Fibers' },
      { value: '25,000+', label: 'Patrons Served' },
      { value: 'Zero', label: 'Synthetic Blends' },
    ],
    showPressLogos: true,
    sectionsEnabled,
    customSections,
    design: {
      backgroundColor: '#07090E',
      textColor: '#F8FAFC',
      mutedTextColor: '#94A3B8',
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
      accentColor: accentColor,

      heroBadgeBg: `${accentColor}1A`,
      heroBadgeText: accentColor,
      heroBadgeBorder: `${accentColor}40`,
      heroTitleColor: '#FFFFFF',
      heroSubtextColor: '#CBD5E1',
      heroOverlayOpacity: 0.35,

      founderCardBg: 'linear-gradient(135deg, #121522, #170E1A)',
      founderCardBorder: 'rgba(255, 255, 255, 0.08)',
      founderQuoteColor: '#F8FAFC',
      founderNameColor: '#FFFFFF',
      founderRoleColor: accentColor,
      founderBadgeBg: accentColor,

      pillarSectionTitleColor: '#FFFFFF',
      pillarCardBg: '#0E111C',
      pillarCardBorder: 'rgba(255, 255, 255, 0.08)',
      pillarBadgeBg: `${accentColor}1A`,
      pillarBadgeText: accentColor,
      pillarTitleColor: '#FFFFFF',
      pillarDescColor: '#94A3B8',

      statsContainerBg: '#0B0D16',
      statsContainerBorder: 'rgba(255, 255, 255, 0.08)',
      statNumberColor: accentColor,
      statLabelColor: '#94A3B8',

      ctaBannerBg: 'linear-gradient(135deg, #111422, #1A1320)',
      ctaBannerBorder: 'rgba(255, 255, 255, 0.08)',
      ctaBannerTitleColor: '#FFFFFF',
      ctaBannerTextColor: '#94A3B8',
      ctaButtonBg: `linear-gradient(135deg, ${accentColor}, #B45309)`,
      ctaButtonTextColor: '#000000',
      ctaButtonText: 'Book Private Viewing Session',

      themeMode: 'dark',
    },
  };
}

export type StoreCategoryType =
  | 'fashion'
  | 'electronics'
  | 'home'
  | 'beauty'
  | 'sports'
  | 'jewelry'
  | 'grocery'
  | 'footwear'
  | 'universal';

export function detectStoreCategory(
  tenantSlug: string,
  tenantDoc?: any
): StoreCategoryType {
  const cleanSlug = (tenantSlug || '').toLowerCase().trim();
  const categoryRaw = (
    tenantDoc?.category ||
    tenantDoc?.categoryLabel ||
    tenantDoc?.industry ||
    tenantDoc?.categoryName ||
    ''
  ).toLowerCase();

  // 1. Jewelry & Watches
  if (
    cleanSlug.includes('silvora') ||
    cleanSlug.includes('jewel') ||
    cleanSlug.includes('aurum') ||
    cleanSlug.includes('watch') ||
    cleanSlug.includes('gem') ||
    cleanSlug.includes('gold') ||
    categoryRaw.includes('jewel') ||
    categoryRaw.includes('gem') ||
    categoryRaw.includes('gold') ||
    categoryRaw.includes('watch') ||
    categoryRaw.includes('solitaire')
  ) {
    return 'jewelry';
  }

  // 2. Electronics & Audio
  if (
    cleanSlug.includes('tech') ||
    cleanSlug.includes('electr') ||
    cleanSlug.includes('gadget') ||
    cleanSlug.includes('audio') ||
    cleanSlug.includes('anc') ||
    categoryRaw.includes('tech') ||
    categoryRaw.includes('electr') ||
    categoryRaw.includes('gadget') ||
    categoryRaw.includes('audio') ||
    categoryRaw.includes('wearable')
  ) {
    return 'electronics';
  }

  // 3. Home, Furniture & Modern Living
  if (
    cleanSlug.includes('home') ||
    cleanSlug.includes('furnitur') ||
    cleanSlug.includes('decor') ||
    cleanSlug.includes('teak') ||
    cleanSlug.includes('living') ||
    categoryRaw.includes('home') ||
    categoryRaw.includes('furnitur') ||
    categoryRaw.includes('decor') ||
    categoryRaw.includes('living') ||
    categoryRaw.includes('teak')
  ) {
    return 'home';
  }

  // 4. Beauty, Cosmetics & Skincare
  if (
    cleanSlug.includes('beauty') ||
    cleanSlug.includes('glow') ||
    cleanSlug.includes('cosmet') ||
    cleanSlug.includes('skin') ||
    cleanSlug.includes('serum') ||
    cleanSlug.includes('perfume') ||
    categoryRaw.includes('beauty') ||
    categoryRaw.includes('skin') ||
    categoryRaw.includes('cosmet') ||
    categoryRaw.includes('serum') ||
    categoryRaw.includes('perfume')
  ) {
    return 'beauty';
  }

  // 5. Sports, Gym & Activewear
  if (
    cleanSlug.includes('sport') ||
    cleanSlug.includes('gym') ||
    cleanSlug.includes('active') ||
    cleanSlug.includes('fit') ||
    cleanSlug.includes('runner') ||
    categoryRaw.includes('sport') ||
    categoryRaw.includes('gym') ||
    categoryRaw.includes('activewear') ||
    categoryRaw.includes('fitness') ||
    categoryRaw.includes('running')
  ) {
    return 'sports';
  }

  // 6. Gourmet Grocery & Organics
  if (
    cleanSlug.includes('grocery') ||
    cleanSlug.includes('organic') ||
    cleanSlug.includes('coffee') ||
    cleanSlug.includes('superfood') ||
    cleanSlug.includes('gourmet') ||
    categoryRaw.includes('grocery') ||
    categoryRaw.includes('organic') ||
    categoryRaw.includes('coffee') ||
    categoryRaw.includes('superfood') ||
    categoryRaw.includes('gourmet')
  ) {
    return 'grocery';
  }

  // 7. Footwear & Streetwear Sneakers
  if (
    cleanSlug.includes('footwear') ||
    cleanSlug.includes('sneaker') ||
    cleanSlug.includes('shoe') ||
    cleanSlug.includes('kicks') ||
    cleanSlug.includes('street') ||
    categoryRaw.includes('footwear') ||
    categoryRaw.includes('sneaker') ||
    categoryRaw.includes('shoe') ||
    categoryRaw.includes('streetwear') ||
    categoryRaw.includes('boots')
  ) {
    return 'footwear';
  }

  // 8. Multi-Purpose Universal Megastore
  if (
    cleanSlug.includes('mega') ||
    cleanSlug.includes('universal') ||
    cleanSlug.includes('omnia') ||
    cleanSlug.includes('all-in-one') ||
    categoryRaw.includes('universal') ||
    categoryRaw.includes('megastore') ||
    categoryRaw.includes('all-in-one')
  ) {
    return 'universal';
  }

  // 9. Fashion & Luxury Apparel (Default)
  return 'fashion';
}

export interface WebsitePageDesign {
  pageBg: string;
  textColor: string;
  mutedTextColor: string;
  headingFont: string;
  bodyFont: string;
  accentColor: string;
  heroBg?: string;
  heroTitleColor?: string;
  heroSubtitleColor?: string;
  cardBg?: string;
  cardBorder?: string;
}

export interface WebsitePageConfig {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  type: string;
  blocks: Array<{
    type: string;
    data: Record<string, any>;
  }>;
  sectionsEnabled: {
    hero: boolean;
    body: boolean;
    customSections: boolean;
    valueProps: boolean;
  };
  customSections: CustomHtmlSection[];
  design: WebsitePageDesign;
  seo: {
    title: string;
    description: string;
    keywords?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  tenantSlug?: string;
}

/**
 * Generates category-aligned Website Pages for any tenant:
 * 1. Shipping & Delivery Timelines (slug: shipping-policy, aliases: shipping)
 * 2. Hassle-Free Returns & Warranty (slug: return-policy, aliases: returns)
 * 3. Frequently Asked Questions (slug: faq, aliases: frequently-asked-questions)
 * 4. About Us (slug: about-us, aliases: about)
 * (plus Authenticity Guarantee for high jewelry)
 */
export function getDefaultWebsitePages(tenantSlug: string, tenantDoc?: any): WebsitePageConfig[] {
  const category = detectStoreCategory(tenantSlug, tenantDoc);
  const cleanSlug = (tenantSlug || 'demo').toLowerCase().trim();
  const rawName = tenantDoc?.name || (cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1));
  const isSilvora = cleanSlug.includes('silvora');
  const storeName = isSilvora ? 'Silvora High Jewelry' : rawName;
  const now = new Date().toISOString();

  // ── 1. 💎 LUXURY JEWELRY, WATCHES & GEMS (18K Gold & Solitaires) ──
  if (category === 'jewelry') {
    const goldAccent = '#EAB308';
    const jewelryDesign: WebsitePageDesign = {
      pageBg: '#07090E',
      textColor: '#F8FAFC',
      mutedTextColor: '#94A3B8',
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
      accentColor: goldAccent,
      heroBg: '#111422',
      heroTitleColor: '#FFFFFF',
      heroSubtitleColor: '#E2E8F0',
      cardBg: '#0E111C',
      cardBorder: 'rgba(234, 179, 8, 0.2)',
    };

    return [
      {
        id: `page_shipping_${cleanSlug}`,
        title: 'Shipping & Delivery Timelines',
        slug: 'shipping-policy',
        status: 'published',
        type: 'policy',
        blocks: [
          {
            type: 'hero',
            data: {
              badge: 'HIGH-VALUE ARMORED LOGISTICS',
              title: 'Insured Armored Transit & Delivery Timelines',
              subtitle: 'Every precious solitaire and timepiece is 100% underwritten by global underwriters and fulfilled via Brink\'s & Malca-Amit specialized armored couriers.',
              image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&auto=format&fit=crop',
            },
          },
          {
            type: 'rich-text',
            data: {
              heading: 'Secured Armored Delivery Protocols & Metropolitan Timelines',
              content: `<p>Transporting rare solitaire diamonds, 18K solid gold, and Swiss chronometry requires military-grade security. At ${storeName}, your consignment is protected under unyielding transit safeguards.</p>
<h3>100% Comprehensive All-Risk Transit Underwriting</h3>
<p>From the moment your heirloom leaves our central vault until it is physically handed to you, the shipment is 100% covered by comprehensive all-risk transit insurance up to ₹50,00,000 at zero additional premium to you.</p>
<h3>Specialized Armored Couriers & Discretion</h3>
<p>Consignments are fulfilled via authorized high-value armored couriers including Brink's Global Services, Malca-Amit, and BlueDart Apex High-Value Vault network. To eliminate interception risks, all exterior boxes are completely discreet and unbranded.</p>
<h3>Mandatory Two-Factor OTP & Government Photo ID Handover</h3>
<p>Armored deliveries will never be left unattended or with third parties. Handover requires a one-time passcode (OTP) sent to your registered phone number, alongside physical government photo ID matching the invoice name.</p>
<h3>Standard Delivery Timelines</h3>
<ul>
  <li><strong>Metropolitan Centers (Delhi, Mumbai, Bengaluru, Chennai):</strong> 24–48 hours via priority armored air transit.</li>
  <li><strong>Tier-1 & Tier-2 Regional Hubs:</strong> 2–3 business days with vault-to-vault secure staging.</li>
  <li><strong>Bespoke Sizing & Custom Atelier Commissions:</strong> 7–10 days handcrafted in atelier before armored dispatch.</li>
</ul>`,
            },
          },
        ],
        sectionsEnabled: { hero: true, body: true, customSections: true, valueProps: true },
        customSections: [
          {
            id: 'security-badges',
            title: 'Vault Delivery Standards',
            enabled: true,
            containerWidth: 'standard',
            backgroundColor: '#0E111C',
            html: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 10px 0;">
  <div style="padding: 18px; background: #121524; border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 12px; text-align: center;">
    <div style="font-size: 24px; margin-bottom: 6px;">🛡️</div>
    <div style="font-weight: bold; color: #FFFFFF; font-size: 13px;">100% Underwritten</div>
    <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">Zero liability transit coverage up to ₹50,00,000</div>
  </div>
  <div style="padding: 18px; background: #121524; border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 12px; text-align: center;">
    <div style="font-size: 24px; margin-bottom: 6px;">🔐</div>
    <div style="font-weight: bold; color: #FFFFFF; font-size: 13px;">OTP & Photo ID Handover</div>
    <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">Strictly delivered to verified named buyer</div>
  </div>
  <div style="padding: 18px; background: #121524; border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 12px; text-align: center;">
    <div style="font-size: 24px; margin-bottom: 6px;">📦</div>
    <div style="font-weight: bold; color: #FFFFFF; font-size: 13px;">Discrete Vault Outer Box</div>
    <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">Triple-layer serialized tamper seals</div>
  </div>
</div>`,
          },
        ],
        design: jewelryDesign,
        seo: {
          title: `Shipping & Delivery Timelines | ${storeName}`,
          description: `Learn about ${storeName}'s insured armored transit, OTP delivery protocols, and express metropolitan timelines.`,
        },
        createdAt: now,
        updatedAt: now,
        tenantSlug: cleanSlug,
      },
      {
        id: `page_returns_${cleanSlug}`,
        title: 'Hassle-Free Returns & Warranty',
        slug: 'return-policy',
        status: 'published',
        type: 'policy',
        blocks: [
          {
            type: 'hero',
            data: {
              badge: 'LIFETIME ATELIER GUARANTEE',
              title: 'Hassle-Free Returns, Resizing & Lifetime Warranty',
              subtitle: 'We stand behind every solitaire diamond, natural gem, and 18K solid gold creation with unconditional lifetime craftsmanship assurance.',
              image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&auto=format&fit=crop',
            },
          },
          {
            type: 'rich-text',
            data: {
              heading: '15-Day Inspection Period & Lifetime Heirloom Care',
              content: `<p>Every bespoke piece and ready-to-wear jewel from ${storeName} represents an heirloom intended to endure across generations.</p>
<h3>15-Day Unconditional Inspection Window</h3>
<p>Inspect your jewelry piece in the comfort of your home. If it does not exceed your expectations, return it within 15 days in unworn condition with its original GIA certificate and security tags intact for a 100% refund.</p>
<h3>Complimentary 30-Day Ring Resizing</h3>
<p>We provide one complimentary ring resizing within 30 days of delivery. Our master goldsmiths will adjust your solitaire or band to your exact millimetric measurement with no loss of structural integrity.</p>
<h3>100% Lifetime Solitaire Upgrade Program</h3>
<p>Your investment grows with you. At any time, exchange your certified ${storeName} solitaire diamond for a larger stone and receive 100% of the original stone's value credited directly toward your new acquisition.</p>
<h3>Lifetime Ultrasonic Cleaning & Prong Inspection</h3>
<p>Visit any ${storeName} salon worldwide for complimentary ultrasonic steam cleaning, prong tightening, rhodium replating, and gemstone health audits.</p>`,
            },
          },
        ],
        sectionsEnabled: { hero: true, body: true, customSections: true, valueProps: true },
        customSections: [],
        design: jewelryDesign,
        seo: {
          title: `Hassle-Free Returns & Warranty | ${storeName}`,
          description: `15-day inspection window, complimentary ring resizing, lifetime solitaire upgrade, and atelier maintenance.`,
        },
        createdAt: now,
        updatedAt: now,
        tenantSlug: cleanSlug,
      },
      {
        id: `page_faq_${cleanSlug}`,
        title: 'Frequently Asked Questions',
        slug: 'faq',
        status: 'published',
        type: 'page',
        blocks: [
          {
            type: 'hero',
            data: {
              badge: 'CONCIERGE HELP & ADVISORY',
              title: 'Frequently Asked Questions',
              subtitle: 'Common inquiries regarding GIA diamond certification, 18K/22K BIS hallmarking, armored transit, and salon appointments.',
              image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop',
            },
          },
          {
            type: 'rich-text',
            data: {
              heading: 'Gemological Authenticity, Shipping & Care FAQ',
              content: `<p>Our high jewelry concierge is available to answer any questions about your fine jewelry acquisition.</p>
<h3>How do I verify the authenticity and GIA certificate of my diamond?</h3>
<p>Every natural solitaire exceeding 0.30 carats is accompanied by a dossier from the Gemological Institute of America (GIA) or IGI. A micro-laser inscription is etched onto the diamond girdle matching the certificate report number.</p>
<h3>What is the purity standard of the gold used in your creations?</h3>
<p>We work exclusively with certified 18K Solid Gold (750 hallmark) and 22K Solid Gold (916 hallmark) authenticated by Bureau of Indian Standards (BIS) authorized assaying centers, stamped with a 6-digit alphanumeric HUID.</p>
<h3>Is my shipment completely safe during armored delivery?</h3>
<p>Yes. Every shipment is underwritten by all-risk transit insurance and delivered via specialized armored logistics (Brink's / Malca-Amit) requiring OTP and government photo ID verification.</p>
<h3>Can I customize or resize my ring after delivery?</h3>
<p>Yes, we provide one complimentary ring resizing within 30 days of delivery. Custom commissions can also be scheduled with our master CAD design team.</p>`,
            },
          },
        ],
        sectionsEnabled: { hero: true, body: true, customSections: true, valueProps: true },
        customSections: [
          {
            id: 'solitaire-lookup',
            title: 'GIA & IGI Solitaire Report Verification Widget',
            enabled: true,
            containerWidth: 'standard',
            backgroundColor: '#0E111C',
            html: `<div style="padding: 24px; background: linear-gradient(135deg, #121524 0%, #1a1028 100%); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 16px; text-align: center;">
  <span style="display: inline-block; padding: 4px 12px; background: rgba(234, 179, 8, 0.15); color: #EAB308; border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 9999px; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">Solitaire Dossier Lookup</span>
  <h3 style="font-family: serif; font-size: 20px; color: #FFFFFF; margin-bottom: 8px; font-weight: bold;">Verify Your Laser-Inscribed GIA Diamond</h3>
  <p style="color: #94A3B8; font-size: 13px; max-width: 520px; margin: 0 auto 16px; line-height: 1.6;">Every solitaire in the ${storeName} atelier is registered in global gemological registries. Enter your report number to verify cut grade, color, and carat weight.</p>
  <div style="display: flex; justify-content: center; gap: 8px; max-width: 440px; margin: 0 auto;">
    <input type="text" placeholder="Enter 10-Digit GIA / IGI Report Number" style="flex: 1; padding: 10px 14px; background: #0B0D16; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #FFFFFF; font-size: 12px;" />
    <button type="button" style="padding: 10px 18px; background: #EAB308; color: #000000; font-weight: bold; font-size: 12px; border: none; border-radius: 8px; cursor: pointer;">Verify Solitaire</button>
  </div>
</div>`,
          },
        ],
        design: jewelryDesign,
        seo: {
          title: `Frequently Asked Questions | ${storeName}`,
          description: `Answers regarding diamond certification, BIS hallmarking, armored shipping, and lifetime jewelry care.`,
        },
        createdAt: now,
        updatedAt: now,
        tenantSlug: cleanSlug,
      },
      {
        id: `page_about_${cleanSlug}`,
        title: `About ${storeName}`,
        slug: 'about-us',
        status: 'published',
        type: 'website-page',
        blocks: [
          {
            type: 'hero',
            data: {
              badge: 'EST. 2026 • HAUTE JOAILLERIE & HORLOGERIE',
              title: `The Heritage of ${storeName}`,
              subtitle: 'Pioneering the synthesis of GIA-certified solitaire diamonds, 18K solid gold alchemy, and master Swiss mechanical chronometry.',
              image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop',
            },
          },
          {
            type: 'rich-text',
            data: {
              heading: 'Where Unrivaled Gemological Rarity Meets Timeless Goldsmithing',
              content: `<p>Founded with an uncompromising devotion to precious artistry, ${storeName} represents the pinnacle of modern fine jewelry. Each creation is born from a rare union of master lapidary cutting, ethically sourced conflict-free diamonds, and centuries-old hallmarked goldsmithing techniques.</p>
<h3>The 4Cs Master Solitaire Selection</h3>
<p>Every natural diamond exceeding 0.50 carats is accompanied by a dossier from the Gemological Institute of America (GIA) or IGI, featuring laser-inscribed girdle numbers for inviolable authenticity. Our master gemologists reject over 98% of mined diamonds to curate only stones with exceptional light performance, VVS+ clarity, and Triple Excellent cuts.</p>
<h3>750 & 916 Metallurgical Purity</h3>
<p>We work exclusively with certified 18K Solid Gold (750 hallmark), 22K Solid Gold (916 hallmark), and Platinum 950. Our proprietary gold casting ensures superior density, rich warm luster, and lifetime resilience against wear.</p>
<h3>Bespoke Salon Consultations</h3>
<p>Clients are invited to our private high jewelry salons in New Delhi, Mumbai, and Bengaluru for one-on-one design commissions, bespoke engagement suites, and rare gemstone acquisitions.</p>`,
            },
          },
        ],
        sectionsEnabled: { hero: true, body: true, customSections: true, valueProps: true },
        customSections: [],
        design: jewelryDesign,
        seo: {
          title: `About ${storeName} | Certified Solitaires & 18K Solid Gold`,
          description: `Discover ${storeName}'s heritage of GIA-certified diamonds, 18K solid gold, and Swiss chronometry.`,
        },
        createdAt: now,
        updatedAt: now,
        tenantSlug: cleanSlug,
      },
    ];
  }

  // Helper generator for other 8 categories
  const categoryConfigs = {
    // ── 2. ⚡ ELECTRONICS, GADGETS & AUDIO ──
    electronics: {
      accent: '#3B82F6',
      heroBg: '#0B0F19',
      pageBg: '#080B12',
      cardBg: '#0F1424',
      cardBorder: 'rgba(59, 130, 246, 0.25)',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      shippingImg: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop',
      returnsImg: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop',
      faqImg: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1600&auto=format&fit=crop',
      aboutImg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop',
      shippingSubtitle: 'Same-day express dispatch, electro-static shockproof packaging, and 24–48 hour air delivery.',
      shippingDetails: `<h3>Same-Day Dispatch Before 2 PM</h3><p>Orders received before 2:00 PM are packed in anti-static humidity-sealed boxes and dispatched same-day via express air courier.</p><h3>24–48 Hour Metropolitan Timelines</h3><p>Tier-1 metros receive express 24–48 hour delivery with real-time GPS courier tracking.</p><h3>Damage-Proof Packaging</h3><p>All sensitive audio transducers, lithium battery systems, and OLED displays are shock-mounted in high-density EVA foam.</p>`,
      returnsSubtitle: '10-day replacement policy for hardware anomalies and full 1-year comprehensive manufacturer warranty.',
      returnsDetails: `<h3>10-Day Hardware Replacement Guarantee</h3><p>If your device exhibits any manufacturing or acoustic defect within 10 days of delivery, we arrange free doorstep pickup and dispatch an immediate brand-new replacement unit.</p><h3>1-Year Official OEM Warranty</h3><p>Full 1-year coverage on internal DAC chips, hybrid ANC microphones, and battery longevity with authorized service centers across India.</p>`,
      faqSubtitle: 'Frequently asked questions regarding ANC tuning, Bluetooth 5.3 multipoint pairing, and warranty claims.',
      faqDetails: `<h3>Are all products brand new and factory sealed?</h3><p>Yes, 100% brand-new genuine OEM sealed packages with verifiable serial numbers.</p><h3>How does Bluetooth Multipoint work?</h3><p>Our studio audio headphones support simultaneous connection to two devices (e.g., laptop and phone) with automated audio switching.</p><h3>How do I claim a warranty repair?</h3><p>Register your product on our portal or reach out via live chat for complimentary courier pickup to our technical repair center.</p>`,
      aboutSubtitle: 'Engineering high-fidelity acoustic transducers, lossless wireless codecs, and ergonomic studio wearables.',
      aboutDetails: `<p>At ${storeName}, we are obsessively dedicated to acoustic fidelity. Every audio monitor and wearable device is tuned in our anechoic acoustic laboratory to reproduce master-grade studio recordings without compression artifacts.</p>`,
    },

    // ── 3. 🛋️ HOME, FURNITURE & MODERN LIVING ──
    home: {
      accent: '#D97706',
      heroBg: '#1C160E',
      pageBg: '#FAF8F5',
      cardBg: '#FFFFFF',
      cardBorder: '#E6DFD5',
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
      textColor: '#1A1510',
      mutedColor: '#786F66',
      shippingImg: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop',
      returnsImg: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop',
      faqImg: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&auto=format&fit=crop',
      aboutImg: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&auto=format&fit=crop',
      shippingSubtitle: 'White-glove specialized furniture transport, custom wooden crating, and complimentary in-home assembly.',
      shippingDetails: `<h3>White-Glove Heavy Freight Logistics</h3><p>Solid wood furniture and delicate ceramics are transported via dedicated zero-damage freight carriers with reinforced crating.</p><h3>5–7 Business Day Delivery</h3><p>Metropolitan deliveries are scheduled with your convenience in mind, including doorstep delivery and room-of-choice placement.</p><h3>Complimentary In-Home Assembly</h3><p>Certified carpentry technicians unbox, assemble, and inspect every furniture unit at your residence with zero extra charges.</p>`,
      returnsSubtitle: '7-day in-home trial and 10-year structural warranty on genuine solid teak and sheesham wood.',
      returnsDetails: `<h3>7-Day In-Home Trial</h3><p>Experience your new furniture piece in your living environment. If it doesn\'t complement your space, we organize return freight pickup.</p><h3>10-Year Structural Timber Warranty</h3><p>Guaranteed protection against wood warping, joinery failure, and termite infestation on kiln-dried solid woods.</p>`,
      faqSubtitle: 'Answers regarding FSC-certified sustainable timber, custom dimensions, and natural wood care.',
      faqDetails: `<h3>Is the wood ethically and sustainably harvested?</h3><p>100% FSC-certified timber sourced from legally managed forestry reserves.</p><h3>How should I maintain solid wood furniture?</h3><p>Wipe with a soft dry cloth and apply organic beeswax polish every six months to nourish the wood grain.</p><h3>Are custom fabric and finish options available?</h3><p>Yes, connect with our interior design desk to customize upholstery fabrics and timber stains.</p>`,
      aboutSubtitle: 'Centuries-old mortise-and-tenon carpentry heritage united with contemporary Scandinavian architectural form.',
      aboutDetails: `<p>At ${storeName}, we craft furniture built to last generations. Working with generational woodcrafters, our creations honor the warmth of natural materials and sustainable living.</p>`,
    },

    // ── 4. 💄 BEAUTY, COSMETICS & SKINCARE ──
    beauty: {
      accent: '#EC4899',
      heroBg: '#1A0E15',
      pageBg: '#FFFDFC',
      cardBg: '#FAF5F8',
      cardBorder: '#EEDCE6',
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
      textColor: '#1A1115',
      mutedColor: '#7A6B73',
      shippingImg: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&auto=format&fit=crop',
      returnsImg: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1600&auto=format&fit=crop',
      faqImg: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1600&auto=format&fit=crop',
      aboutImg: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&auto=format&fit=crop',
      shippingSubtitle: 'Climate-controlled courier dispatch preserving active botanical vitamins, peptides, and fine fragrance notes.',
      shippingDetails: `<h3>Temperature-Monitored Packaging</h3><p>All active serums, retinal formulations, and floral absolutes are packed in insulated amber glass containers to protect active ingredients from UV light and heat.</p><h3>24–48 Hour Express Delivery</h3><p>Fast delivery to ensure fresh, recently batch-manufactured skincare reaches your vanity swiftly.</p><h3>Induction-Sealed Leak Proofing</h3><p>Double induction seals prevent spillage or oxidation during express air transit.</p>`,
      returnsSubtitle: '14-day unopened return guarantee and certified dermatological sensitivity consultation.',
      returnsDetails: `<h3>14-Day Unopened Returns</h3><p>Unopened items with intact hygienic security seals can be returned within 14 days for a full refund.</p><h3>Dermatological Sensitivity Guarantee</h3><p>If you experience unexpected skin irritation, our licensed cosmetic esthetician will review your regimen and arrange a replacement or full refund.</p>`,
      faqSubtitle: 'Frequently asked questions regarding vegan certifications, serum layering, and cruelty-free ethics.',
      faqDetails: `<h3>Are all formulas 100% cruelty-free and vegan?</h3><p>Yes. PETA certified cruelty-free, 100% vegan, formulated without parabens, sulphates, or synthetic dyes.</p><h3>How should I store active vitamin C and retinol serums?</h3><p>Store in a cool, dry cabinet away from direct sunlight; refrigerating active vitamin C extends its peak potency.</p><h3>How long do your Eau de Parfum fragrances last?</h3><p>Formulated at a 20–25% pure essential oil concentration, our fragrances provide 10–12 hours of projection.</p>`,
      aboutSubtitle: 'Harnessing bioactive botanical alchemy, cold-pressed nutrients, and clinical dermatological science.',
      aboutDetails: `<p>At ${storeName}, clean beauty is an uncompromising standard. We reject filler ingredients in favor of pure, clinically proven botanical bio-actives that deliver radiant, barrier-strengthening results.</p>`,
    },

    // ── 5. 🏃 SPORTS, GYM & ACTIVEWEAR ──
    sports: {
      accent: '#10B981',
      heroBg: '#091510',
      pageBg: '#070C09',
      cardBg: '#0F1A13',
      cardBorder: 'rgba(16, 185, 129, 0.25)',
      fontHeading: 'Montserrat, sans-serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
      shippingImg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop',
      returnsImg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop',
      faqImg: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&auto=format&fit=crop',
      aboutImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&auto=format&fit=crop',
      shippingSubtitle: 'Rapid athletic dispatch within 12 hours, moisture-sealed recyclable polybags, and 1–3 day delivery.',
      shippingDetails: `<h3>Dispatched Within 12 Hours</h3><p>Athletic gear is prioritized for rapid packaging and dispatch from our automated sports logistics hub.</p><h3>1–3 Business Day Nationwide Transit</h3><p>Air express courier partnerships ensure your training gear arrives before your next personal record attempt.</p><h3>Moisture-Shield Packaging</h3><p>Waterproof recycled poly packaging ensures your compressive apparel arrives dry and ready for immediate sweat sessions.</p>`,
      returnsSubtitle: '14-day sweat-test size exchange and 6-month seam burst and zipper warranty.',
      returnsDetails: `<h3>14-Day Fit & Compression Exchange</h3><p>Test the fit and flexibility of your workout gear. If the compression or waistline isn\'t optimal, swap sizes effortlessly with doorstep exchange.</p><h3>6-Month Athletic Durability Warranty</h3><p>Guaranteed against flatlock seam bursting, zipper failure, and fabric pilling under regular athletic training.</p>`,
      faqSubtitle: 'Answers regarding compression sizing, 100% squat-proof opacity, and antimicrobial fabric care.',
      faqDetails: `<h3>Are your leggings 100% squat-proof?</h3><p>Yes. Engineered with high-density 280 GSM interlock knit, providing 100% opacity under full barbell squats and stretches.</p><h3>What compression level should I choose?</h3><p>Graduated 20–25 mmHg compression for long-distance runners and 4-way flexible stretch for cross-training and powerlifting.</p><h3>How should I wash antimicrobial activewear?</h3><p>Machine wash cold with mild detergent; avoid fabric softeners and high heat drying to preserve moisture-wicking capillary channels.</p>`,
      aboutSubtitle: 'Biomechanical performance apparel engineered with recycled ocean textiles and athlete-tested endurance.',
      aboutDetails: `<p>At ${storeName}, we engineer apparel that empowers athletes to surpass perceived limits. Every stitch and panel is anatomically mapped for maximum range of motion, thermal regulation, and sweat dispersion.</p>`,
    },

    // ── 6. 🌿 GOURMET GROCERY & ORGANICS ──
    grocery: {
      accent: '#16A34A',
      heroBg: '#0F1A12',
      pageBg: '#FAF8F2',
      cardBg: '#FFFFFF',
      cardBorder: '#E5DFD3',
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
      textColor: '#19201A',
      mutedColor: '#6B7A6D',
      shippingImg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop',
      returnsImg: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&auto=format&fit=crop',
      faqImg: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&auto=format&fit=crop',
      aboutImg: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1600&auto=format&fit=crop',
      shippingSubtitle: 'Freshly roasted whole-bean dispatch, insulated cold-pack pantry transit, and next-day metro delivery.',
      shippingDetails: `<h3>Roasted to Order Within 48 Hours</h3><p>Single-origin specialty coffee beans are roasted in small artisanal batches and dispatched within 48 hours of degas degassing.</p><h3>Insulated Cold-Chain Packaging</h3><p>Perishable gourmet superfoods, stone-ground nut butters, and oils are packed with reusable cold-gel packs.</p><h3>Next-Day Metro Air Transit</h3><p>Rapid dispatch ensures peak freshness, crisp aromatics, and maximum nutritional vitality.</p>`,
      returnsSubtitle: '100% farm-to-table freshness guarantee and immediate free replacement on any breached seal.',
      returnsDetails: `<h3>100% Freshness Guarantee</h3><p>If the taste profile, roast date, or vacuum seal does not satisfy your palate, we replace the item or refund your order within 24 hours.</p><h3>Transit Seal Protection</h3><p>Any container with transit seal damage is replaced immediately with free doorstep delivery.</p>`,
      faqSubtitle: 'Inquiries regarding roast date stamps, organic fair-trade farm origins, and brew grind sizing.',
      faqDetails: `<h3>How fresh is my coffee shipment?</h3><p>Every coffee bag is stamped with the exact roast date; we never dispatch coffee older than 48 hours from roast.</p><h3>Are all products certified organic?</h3><p>Yes, 100% certified organic ingredients sourced directly from shade-grown estates and smallholder farmers.</p><h3>Which grind size should I choose?</h3><p>Whole Bean for grinder owners, Coarse for French Press / Cold Brew, Medium for Drip / Pour-Over, and Fine for Espresso.</p>`,
      aboutSubtitle: 'Connecting ethical shade-grown coffee estates and organic superfood farms directly to your morning ritual.',
      aboutDetails: `<p>At ${storeName}, we believe food should heal the body and nourish the planet. Through transparent direct trade partnerships, we support regenerative agriculture and fair wages for farming communities.</p>`,
    },

    // ── 7. 👟 FOOTWEAR & STREETWEAR SNEAKERS ──
    footwear: {
      accent: '#F97316',
      heroBg: '#140E0A',
      pageBg: '#0A0C0F',
      cardBg: '#12151A',
      cardBorder: 'rgba(249, 115, 22, 0.25)',
      fontHeading: 'Montserrat, sans-serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
      shippingImg: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&auto=format&fit=crop',
      returnsImg: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1600&auto=format&fit=crop',
      faqImg: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600&auto=format&fit=crop',
      aboutImg: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop',
      shippingSubtitle: 'Double-boxed sneaker shipping, mint-condition shoebox protection, and 24-hour express air courier.',
      shippingDetails: `<h3>Double-Boxed Transit Guarantee</h3><p>Every pair is protected inside a reinforced outer corrugated shipping box with corner guards to keep the original shoebox in pristine mint condition.</p><h3>24-Hour Express Air Dispatch</h3><p>Priority logistics partners ensure high-heat releases and sneaker drops reach your doorstep in 1–3 business days.</p><h3>Tamper-Evident Sneaker Verification Tags</h3><p>All authenticated pairs are tagged with serialized security seals before boxed dispatch.</p>`,
      returnsSubtitle: '7-day deadstock return policy and priority doorstep size exchange program.',
      returnsDetails: `<h3>7-Day Deadstock Return Window</h3><p>Returns accepted within 7 days in brand-new, deadstock (unworn) condition with all factory tags, extra laces, and original packaging intact.</p><h3>Priority Size Exchanges</h3><p>If the sizing isn\'t exact, our courier conducts an on-the-spot size swap directly at your doorstep.</p>`,
      faqSubtitle: 'Answers regarding 100% authenticity legit checks, sneaker sizing charts, and suede shoe care.',
      faqDetails: `<h3>Are all sneakers and boots 100% authentic?</h3><p>Every pair undergoes multi-point physical verification by veteran authenticators before boxing.</p><h3>How do your sneaker models fit?</h3><p>True to size (TTS) for standard foot widths. We recommend wide footers go half a size up; refer to our CM/UK sizing chart.</p><h3>How should I care for premium suede and tumbled leather?</h3><p>Apply hydrophobic water-repellent spray prior to first wear; clean with soft horsehair brushes and specialized foam cleaner.</p>`,
      aboutSubtitle: 'Celebrating contemporary streetwear architecture, skate culture, and limited-edition sneaker engineering.',
      aboutDetails: `<p>At ${storeName}, sneakers are modern wearable art. We curate iconic silhouette drops, archival grails, and premium hand-assembled footwear crafted with Italian calfskins and vulcanized rubber outsoles.</p>`,
    },

    // ── 8. 🛍️ MULTI-PURPOSE UNIVERSAL MEGASTORE ──
    universal: {
      accent: '#6366F1',
      heroBg: '#0F121F',
      pageBg: '#FFFFFF',
      cardBg: '#F8FAFC',
      cardBorder: '#E2E8F0',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      textColor: '#0F172A',
      mutedColor: '#64748B',
      shippingImg: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop',
      returnsImg: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1600&auto=format&fit=crop',
      faqImg: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&auto=format&fit=crop',
      aboutImg: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&auto=format&fit=crop',
      shippingSubtitle: 'Regional fulfillment hub distribution for 2–4 day nationwide delivery and free shipping above ₹499.',
      shippingDetails: `<h3>Pan-India Fulfillment Hubs</h3><p>Orders are routed through the nearest regional fulfillment center to minimize delivery times and transport emissions.</p><h3>Free Shipping on Orders Above ₹499</h3><p>Enjoy complimentary doorstep delivery across millions of products nationwide.</p><h3>Real-Time Shipment Tracking</h3><p>Track your multi-item parcels in real-time with automated SMS and WhatsApp delivery updates.</p>`,
      returnsSubtitle: '7-day easy 1-click returns, instant refund processing, and official manufacturer warranty.',
      returnsDetails: `<h3>7-Day 1-Click Returns</h3><p>Initiate simple doorstep returns directly from your order dashboard within 7 days of delivery.</p><h3>Instant Refunds</h3><p>Refunds are initiated immediately upon courier pickup back to your original payment method or store wallet.</p><h3>Authorized Brand Warranty</h3><p>All branded electronics and appliances are backed by authorized national service network warranties.</p>`,
      faqSubtitle: 'Answers regarding multi-category cart checkouts, payment methods, and 24/7 customer care.',
      faqDetails: `<h3>Can I combine fashion, home, and tech items in one order?</h3><p>Yes. Add products across all categories to a single unified cart and enjoy unified checkout and consolidated deliveries.</p><h3>What payment options are accepted?</h3><p>UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, EMI, Cash on Delivery, and Store Credit.</p><h3>How can I reach customer support?</h3><p>Our concierge support team is available 24/7 via live chat, email, and toll-free telephone.</p>`,
      aboutSubtitle: 'A modern universal commerce destination offering 50,000+ curated products at fair, transparent pricing.',
      aboutDetails: `<p>At ${storeName}, we democratize access to exceptional products across lifestyle, technology, fashion, and home essentials with uncompromising fulfillment reliability.</p>`,
    },

    // ── 9. 👗 FASHION & LUXURY APPAREL (Default) ──
    fashion: {
      accent: '#BE123C',
      heroBg: '#1A0E12',
      pageBg: '#FFFDFC',
      cardBg: '#FAF6F2',
      cardBorder: '#E8DED8',
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
      textColor: '#111111',
      mutedColor: '#64748B',
      shippingImg: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&auto=format&fit=crop',
      returnsImg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop',
      faqImg: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&auto=format&fit=crop',
      aboutImg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop',
      shippingSubtitle: 'White-glove express doorstep delivery in 2–4 business days via BlueDart Air, with free shipping above ₹999.',
      shippingDetails: `<h3>Domestic Express Delivery in 2–4 Days</h3><p>All orders are fulfilled via premium air logistics with end-to-end tracking.</p><h3>Complimentary Shipping Above ₹999</h3><p>We provide zero shipping fees on domestic orders exceeding ₹999 across India.</p><h3>Bespoke Tailoring & Pre-Orders</h3><p>Custom blouses and tailored fits are handcrafted in 7–10 days prior to express dispatch.</p>`,
      returnsSubtitle: '7-day hassle-free doorstep reverse pickup, seamless size exchange, and instant store credits.',
      returnsDetails: `<h3>7-Day Doorstep Reverse Pickup</h3><p>Try your garments in the comfort of your home. If the size or fit isn\'t ideal, our courier collects the parcel from your doorstep.</p><h3>100% Quality Fabric Guarantee</h3><p>Authentic Silk Mark and handloom certified textiles backed by pure craftsmanship guarantees.</p>`,
      faqSubtitle: 'Answers regarding saree draping lengths, custom blouse tailoring, and handloom silk care.',
      faqDetails: `<h3>How do I select the right size?</h3><p>Refer to our size chart covering bust, waist, and hip measurements; custom blouse tailoring can be requested at checkout.</p><h3>Are sarees authenticated with Silk Mark?</h3><p>Yes, all pure silk weaves are authenticated with genuine Silk Mark certifications.</p><h3>What are the fabric care guidelines?</h3><p>Dry clean only for pure zari and handloom silks; store in the provided breathable cotton bags away from moisture.</p>`,
      aboutSubtitle: 'Crafting timeless silhouettes through pure mulberry silks, organic cottons, and master artisan handlooms.',
      aboutDetails: `<p>At ${storeName}, we believe luxury lies in patience, handspun textiles, and empowering artisan communities. Partnering directly with over 450+ master weaver families, we honor heritage craftsmanship for modern poise.</p>`,
    },
  };

  const cfg: any = categoryConfigs[category] || categoryConfigs.fashion;
  const design: WebsitePageDesign = {
    pageBg: cfg.pageBg,
    textColor: cfg.textColor || '#FFFFFF',
    mutedTextColor: cfg.mutedColor || '#94A3B8',
    headingFont: cfg.fontHeading,
    bodyFont: cfg.fontBody,
    accentColor: cfg.accent,
    heroBg: cfg.heroBg,
    heroTitleColor: '#FFFFFF',
    heroSubtitleColor: '#E2E8F0',
    cardBg: cfg.cardBg,
    cardBorder: cfg.cardBorder,
  };

  return [
    {
      id: `page_shipping_${cleanSlug}`,
      title: 'Shipping & Delivery Timelines',
      slug: 'shipping-policy',
      status: 'published',
      type: 'policy',
      blocks: [
        {
          type: 'hero',
          data: {
            badge: 'EXPRESS LOGISTICS PROTOCOL',
            title: 'Shipping & Delivery Timelines',
            subtitle: cfg.shippingSubtitle,
            image: cfg.shippingImg,
          },
        },
        {
          type: 'rich-text',
          data: {
            heading: `Fulfillment Standards & Timelines for ${storeName}`,
            content: cfg.shippingDetails,
          },
        },
      ],
      sectionsEnabled: { hero: true, body: true, customSections: true, valueProps: true },
      customSections: [],
      design,
      seo: {
        title: `Shipping & Delivery Timelines | ${storeName}`,
        description: `Everything you need to know about ${storeName} order fulfillment, dispatch speed, and delivery timelines.`,
      },
      createdAt: now,
      updatedAt: now,
      tenantSlug: cleanSlug,
    },
    {
      id: `page_returns_${cleanSlug}`,
      title: 'Hassle-Free Returns & Warranty',
      slug: 'return-policy',
      status: 'published',
      type: 'policy',
      blocks: [
        {
          type: 'hero',
          data: {
            badge: 'SATISFACTION GUARANTEED',
            title: 'Hassle-Free Returns & Warranty',
            subtitle: cfg.returnsSubtitle,
            image: cfg.returnsImg,
          },
        },
        {
          type: 'rich-text',
          data: {
            heading: 'Customer Guarantee, Exchange & Warranty Coverage',
            content: cfg.returnsDetails,
          },
        },
      ],
      sectionsEnabled: { hero: true, body: true, customSections: true, valueProps: true },
      customSections: [],
      design,
      seo: {
        title: `Hassle-Free Returns & Warranty | ${storeName}`,
        description: `Easy return procedures, replacement policies, and warranty coverage at ${storeName}.`,
      },
      createdAt: now,
      updatedAt: now,
      tenantSlug: cleanSlug,
    },
    {
      id: `page_faq_${cleanSlug}`,
      title: 'Frequently Asked Questions',
      slug: 'faq',
      status: 'published',
      type: 'page',
      blocks: [
        {
          type: 'hero',
          data: {
            badge: 'HELP CENTER & SUPPORT',
            title: 'Frequently Asked Questions',
            subtitle: cfg.faqSubtitle,
            image: cfg.faqImg,
          },
        },
        {
          type: 'rich-text',
          data: {
            heading: `Common Questions & Answers • ${storeName}`,
            content: cfg.faqDetails,
          },
        },
      ],
      sectionsEnabled: { hero: true, body: true, customSections: true, valueProps: true },
      customSections: [],
      design,
      seo: {
        title: `Frequently Asked Questions | ${storeName}`,
        description: `Find answers to common questions about products, ordering, shipping, and warranty at ${storeName}.`,
      },
      createdAt: now,
      updatedAt: now,
      tenantSlug: cleanSlug,
    },
    {
      id: `page_about_${cleanSlug}`,
      title: `About ${storeName}`,
      slug: 'about-us',
      status: 'published',
      type: 'website-page',
      blocks: [
        {
          type: 'hero',
          data: {
            badge: 'ATELIER HERITAGE & VISION',
            title: `The Story Behind ${storeName}`,
            subtitle: cfg.aboutSubtitle,
            image: cfg.aboutImg,
          },
        },
        {
          type: 'rich-text',
          data: {
            heading: 'Craftsmanship, Ethical Sourcing & Brand Philosophy',
            content: cfg.aboutDetails,
          },
        },
      ],
      sectionsEnabled: { hero: true, body: true, customSections: true, valueProps: true },
      customSections: [],
      design,
      seo: {
        title: `About ${storeName} | Heritage & Vision`,
        description: `Discover the story, craftsmanship standards, and dedication to excellence at ${storeName}.`,
      },
      createdAt: now,
      updatedAt: now,
      tenantSlug: cleanSlug,
    },
  ];
}
