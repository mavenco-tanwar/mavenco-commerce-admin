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
