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

export function detectStoreCategory(
  tenantSlug: string,
  tenantDoc?: any
): 'jewelry' | 'electronics' | 'beauty' | 'fashion' {
  const cleanSlug = (tenantSlug || '').toLowerCase().trim();
  const categoryRaw = (
    tenantDoc?.category ||
    tenantDoc?.categoryLabel ||
    tenantDoc?.industry ||
    tenantDoc?.categoryName ||
    ''
  ).toLowerCase();

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

  if (
    cleanSlug.includes('tech') ||
    cleanSlug.includes('electr') ||
    cleanSlug.includes('gadget') ||
    categoryRaw.includes('tech') ||
    categoryRaw.includes('electr') ||
    categoryRaw.includes('gadget')
  ) {
    return 'electronics';
  }

  if (
    cleanSlug.includes('beauty') ||
    cleanSlug.includes('glow') ||
    cleanSlug.includes('cosmet') ||
    categoryRaw.includes('beauty') ||
    categoryRaw.includes('skin') ||
    categoryRaw.includes('cosmet')
  ) {
    return 'beauty';
  }

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

export function getDefaultWebsitePages(tenantSlug: string, tenantDoc?: any): WebsitePageConfig[] {
  const category = detectStoreCategory(tenantSlug, tenantDoc);
  const cleanSlug = (tenantSlug || 'demo').toLowerCase().trim();
  const rawName = tenantDoc?.name || (cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1));
  const isSilvora = cleanSlug.includes('silvora');
  const storeName = isSilvora ? 'Silvora High Jewelry' : rawName;
  const now = new Date().toISOString();

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
        id: `page_about_${cleanSlug}`,
        title: `About ${storeName} Atelier`,
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
        sectionsEnabled: {
          hero: true,
          body: true,
          customSections: true,
          valueProps: true,
        },
        customSections: [
          {
            id: 'solitaire-lookup',
            title: 'GIA & IGI Solitaire Report Verification Widget',
            enabled: true,
            containerWidth: 'standard',
            backgroundColor: '#0E111C',
            html: `<div style="padding: 28px; background: linear-gradient(135deg, #121524 0%, #1a1028 100%); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 16px; text-align: center;">
  <span style="display: inline-block; padding: 4px 12px; background: rgba(234, 179, 8, 0.15); color: #EAB308; border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 9999px; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">Solitaire Dossier Lookup</span>
  <h3 style="font-family: serif; font-size: 22px; color: #FFFFFF; margin-bottom: 8px; font-weight: bold;">Verify Your Laser-Inscribed GIA Diamond</h3>
  <p style="color: #94A3B8; font-size: 13px; max-width: 540px; margin: 0 auto 18px; line-height: 1.6;">Every solitaire in the ${storeName} atelier is registered in global gemological registries. Enter your report number to review cut grade, carat weight, color, and fluorescence analysis.</p>
  <div style="display: flex; justify-content: center; gap: 8px; max-width: 440px; margin: 0 auto;">
    <input type="text" placeholder="Enter 10-Digit GIA / IGI Report Number" style="flex: 1; padding: 10px 14px; background: #0B0D16; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #FFFFFF; font-size: 12px;" />
    <button type="button" style="padding: 10px 18px; background: #EAB308; color: #000000; font-weight: bold; font-size: 12px; border: none; border-radius: 8px; cursor: pointer;">Verify Solitaire</button>
  </div>
</div>`,
          },
        ],
        design: jewelryDesign,
        seo: {
          title: `About ${storeName} Atelier | Certified Solitaires & 18K Solid Gold`,
          description: `Discover ${storeName}'s heritage of GIA-certified diamonds, 18K solid gold, and Swiss chronometry.`,
        },
        createdAt: now,
        updatedAt: now,
        tenantSlug: cleanSlug,
      },
      {
        id: `page_shipping_${cleanSlug}`,
        title: 'Insured Armored Transit & Delivery Policy',
        slug: 'shipping-policy',
        status: 'published',
        type: 'policy',
        blocks: [
          {
            type: 'hero',
            data: {
              badge: 'HIGH-SECURITY LOGISTICS PROTOCOL',
              title: 'Insured Armored Transit & Secured Delivery Policy',
              subtitle: 'Every precious creation and timepiece is 100% underwritten by global insurers and transported in dedicated armored logistics.',
              image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&auto=format&fit=crop',
            },
          },
          {
            type: 'rich-text',
            data: {
              heading: 'Secured Direct Transit from Atelier Vault to Consignee',
              content: `<p>Transporting rare diamonds, 18K solid gold, and luxury horology demands uncompromised security. At ${storeName}, your peace of mind is paramount. Every consignment is handled under stringent vault-to-door protocols.</p>
<h3>100% Comprehensive All-Risk Transit Insurance</h3>
<p>From the moment your heirloom leaves our vault until it is safely received in your hands, the shipment is fully covered by comprehensive all-risk transit insurance at zero additional premium to you.</p>
<h3>Armored Couriers & Discretion</h3>
<p>Consignments are fulfilled via authorized high-value armored couriers including Brink's Global Services, Malca-Amit, and BlueDart Apex High-Value Vault network. To prevent theft during transit, all exterior packaging is completely unbranded, discrete, and tamper-resistant.</p>
<h3>Mandatory Two-Factor OTP & Consignee ID</h3>
<p>Armored deliveries will NEVER be left unattended or with third parties. Handover requires a one-time passcode (OTP) sent directly to your registered phone number, accompanied by physical government photo ID verification matching the order invoice.</p>
<h3>Tamper-Proof Triple Box Security</h3>
<p>Every jewelry box is sealed inside an airtight, serialized tamper-evident security pouch. If the seal shows any sign of tampering upon arrival, our couriers will immediately re-vault the package and dispatch a brand-new replacement.</p>`,
            },
          },
        ],
        sectionsEnabled: {
          hero: true,
          body: true,
          customSections: true,
          valueProps: true,
        },
        customSections: [
          {
            id: 'security-badges',
            title: 'Vault Delivery Standards',
            enabled: true,
            containerWidth: 'standard',
            backgroundColor: '#0E111C',
            html: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 10px 0;">
  <div style="padding: 16px; background: #121524; border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 12px; text-align: center;">
    <div style="font-size: 24px; margin-bottom: 6px;">🛡️</div>
    <div style="font-weight: bold; color: #FFFFFF; font-size: 13px;">100% Underwritten</div>
    <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">Zero liability transit coverage up to ₹50,00,000</div>
  </div>
  <div style="padding: 16px; background: #121524; border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 12px; text-align: center;">
    <div style="font-size: 24px; margin-bottom: 6px;">🔐</div>
    <div style="font-weight: bold; color: #FFFFFF; font-size: 13px;">OTP & Photo ID Handover</div>
    <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">Strictly delivered to verified named buyer</div>
  </div>
  <div style="padding: 16px; background: #121524; border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 12px; text-align: center;">
    <div style="font-size: 24px; margin-bottom: 6px;">📦</div>
    <div style="font-weight: bold; color: #FFFFFF; font-size: 13px;">Discrete Unmarked Vault Box</div>
    <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">Triple-layer serialized security seals</div>
  </div>
</div>`,
          },
        ],
        design: jewelryDesign,
        seo: {
          title: `Insured Armored Transit & Delivery Policy | ${storeName}`,
          description: `All ${storeName} jewelry shipments are 100% insured and fulfilled via specialized armored couriers with OTP and ID verification.`,
        },
        createdAt: now,
        updatedAt: now,
        tenantSlug: cleanSlug,
      },
      {
        id: `page_returns_${cleanSlug}`,
        title: 'Bespoke Jewelry Lifetime Care & Return Policy',
        slug: 'return-policy',
        status: 'published',
        type: 'policy',
        blocks: [
          {
            type: 'hero',
            data: {
              badge: 'UNCONDITIONAL CRAFTSMANSHIP GUARANTEE',
              title: 'Bespoke Jewelry Lifetime Care, Resizing & Returns',
              subtitle: 'We stand behind every solitaire diamond, natural emerald, and 18K solid gold link with unconditional lifetime craftsmanship assurance.',
              image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&auto=format&fit=crop',
            },
          },
          {
            type: 'rich-text',
            data: {
              heading: '15-Day Salon Inspection & Lifetime Heirloom Maintenance',
              content: `<p>Every bespoke piece and ready-to-wear jewel from ${storeName} represents an heirloom intended to endure across generations. Our care policies reflect our absolute confidence in our craft.</p>
<h3>15-Day Unconditional Inspection Window</h3>
<p>We invite you to inspect your jewelry piece with complete serenity. If for any reason it does not fulfill your expectations, return it within 15 days in pristine, unworn condition with its original GIA certificate and security tags intact for a 100% refund.</p>
<h3>Complimentary Ring Resizing (Within 30 Days)</h3>
<p>We provide one complimentary ring resizing within 30 days of delivery. Our master goldsmiths will adjust your solitaire or band to your exact millimetric measurement with no loss of structural integrity.</p>
<h3>Lifetime Solitaire Upgrade Program</h3>
<p>Your investment grows with you. At any time, exchange your certified ${storeName} solitaire diamond for a larger stone and receive 100% of the original stone's value credited directly toward your new acquisition.</p>
<h3>Lifetime Ultrasonic Cleaning & Prong Inspection</h3>
<p>Visit any ${storeName} salon worldwide at any time for complimentary ultrasonic steam cleaning, prong tightening, rhodium replating, and gemstone health audits.</p>`,
            },
          },
        ],
        sectionsEnabled: {
          hero: true,
          body: true,
          customSections: true,
          valueProps: true,
        },
        customSections: [],
        design: jewelryDesign,
        seo: {
          title: `Lifetime Care, Resizing & Return Policy | ${storeName}`,
          description: `Learn about ${storeName}'s 15-day inspection period, complimentary ring resizing, lifetime solitaire upgrade, and atelier cleaning.`,
        },
        createdAt: now,
        updatedAt: now,
        tenantSlug: cleanSlug,
      },
      {
        id: `page_authenticity_${cleanSlug}`,
        title: 'GIA Diamonds & BIS 916 Hallmarking Guarantee',
        slug: 'authenticity-guarantee',
        status: 'published',
        type: 'policy',
        blocks: [
          {
            type: 'hero',
            data: {
              badge: 'GEMOLOGICAL PROVENANCE & PURITY',
              title: 'GIA Diamond & BIS Hallmarking Authenticity Guarantee',
              subtitle: 'Verifiable Kimberly Process compliance, laser-inscribed dossier numbers, and government-regulated metallurgical assay.',
              image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1600&auto=format&fit=crop',
            },
          },
          {
            type: 'rich-text',
            data: {
              heading: 'Every Solitaire Is Laser-Inscribed with Its Unique GIA Dossier Number',
              content: `<p>At ${storeName}, authentic provenance is uncompromising. We believe transparency is the highest form of luxury.</p>
<h3>GIA & IGI International Certification</h3>
<p>Every solitaire diamond of 0.30 carat and above is individually examined and graded by the Gemological Institute of America (GIA) or International Gemological Institute (IGI). A micro-laser inscription is etched onto the diamond girdle, visible under 10x magnification, verifying its exact match to the laboratory certificate.</p>
<h3>BIS 750 & 916 Hallmarking with HUID</h3>
<p>All gold jewelry is hallmarked by Bureau of Indian Standards (BIS) authorized assaying centers. Each creation bears the BIS triangle logo, purity stamp (750 for 18K, 916 for 22K), and a unique 6-digit alphanumeric HUID (Hallmark Unique Identification) code for complete traceability.</p>
<h3>Conflict-Free Kimberley Process Compliance</h3>
<p>100% of our diamonds are sourced exclusively from nations participating in the Kimberley Process Certification Scheme (KPCS), ensuring all stones are ethically mined, conflict-free, and supportive of local artisanal mining communities.</p>`,
            },
          },
        ],
        sectionsEnabled: {
          hero: true,
          body: true,
          customSections: true,
          valueProps: true,
        },
        customSections: [],
        design: jewelryDesign,
        seo: {
          title: `GIA Solitaire & BIS Hallmarking Guarantee | ${storeName}`,
          description: `Certified authenticity: GIA report laser inscriptions, BIS 750/916 gold hallmarking, and Kimberly Process compliance.`,
        },
        createdAt: now,
        updatedAt: now,
        tenantSlug: cleanSlug,
      },
    ];
  }

  // Fashion / Apparel & Default
  const fashionAccent = tenantDoc?.theme?.accentColor || '#BE123C';
  const fashionDesign: WebsitePageDesign = {
    pageBg: '#FFFDFC',
    textColor: '#111111',
    mutedTextColor: '#64748B',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    accentColor: fashionAccent,
    heroBg: '#111111',
    heroTitleColor: '#FFFFFF',
    heroSubtitleColor: '#E2E8F0',
    cardBg: '#FAF6F2',
    cardBorder: '#E8DED8',
  };

  return [
    {
      id: `page_about_${cleanSlug}`,
      title: `About ${rawName}`,
      slug: 'about-us',
      status: 'published',
      type: 'website-page',
      blocks: [
        {
          type: 'hero',
          data: {
            badge: 'ATELIER HERITAGE',
            title: `The Story Behind ${rawName}`,
            subtitle: 'Crafting timeless silhouettes, ethical organic textiles, and contemporary luxury design.',
            image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop',
          },
        },
        {
          type: 'rich-text',
          data: {
            heading: 'Where Heritage Craftsmanship Meets Modern Silhouette',
            content: `<p>At ${rawName}, we believe luxury is defined by patient craftsmanship, ethical sourcing, and uncompromising attention to detail. Every collection is designed to transition seamlessly from day to evening.</p>
<h3>Ethically Sourced Natural Fibers</h3>
<p>We work exclusively with organic cottons, mulberry silks, and sustainable handloom blends directly sourced from master weaving cooperatives.</p>
<h3>Conscious Limited Drops</h3>
<p>Rather than mass manufacturing, we produce in limited boutique runs to minimize textile waste and ensure every garment meets our exacting standards.</p>`,
          },
        },
      ],
      sectionsEnabled: {
        hero: true,
        body: true,
        customSections: true,
        valueProps: true,
      },
      customSections: [],
      design: fashionDesign,
      seo: {
        title: `About ${rawName} | Luxury Fashion & Modern Atelier`,
        description: `Explore ${rawName}'s story, artisanal heritage, and ethical design philosophy.`,
      },
      createdAt: now,
      updatedAt: now,
      tenantSlug: cleanSlug,
    },
    {
      id: `page_shipping_${cleanSlug}`,
      title: 'Shipping & Delivery Policy',
      slug: 'shipping-policy',
      status: 'published',
      type: 'policy',
      blocks: [
        {
          type: 'hero',
          data: {
            badge: 'WHITE-GLOVE LOGISTICS',
            title: 'Express Doorstep Delivery Policy',
            subtitle: 'Fast, secure, and fully trackable deliveries across India and international destinations.',
            image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&auto=format&fit=crop',
          },
        },
        {
          type: 'rich-text',
          data: {
            heading: 'Domestic & Global Express Shipping Standards',
            content: `<p>All orders at ${rawName} are dispatched within 24–48 hours using leading premium courier partners.</p>
<h3>Complimentary Shipping</h3>
<p>We provide complimentary express shipping on all domestic orders above ₹999.</p>
<h3>Real-Time Tracking</h3>
<p>As soon as your parcel is dispatched, you will receive a tracking link via SMS, WhatsApp, and email.</p>`,
          },
        },
      ],
      sectionsEnabled: {
        hero: true,
        body: true,
        customSections: true,
        valueProps: true,
      },
      customSections: [],
      design: fashionDesign,
      seo: {
        title: `Shipping & Delivery Policy | ${rawName}`,
        description: `Everything you need to know about ${rawName} order processing, delivery timelines, and shipping rates.`,
      },
      createdAt: now,
      updatedAt: now,
      tenantSlug: cleanSlug,
    },
    {
      id: `page_returns_${cleanSlug}`,
      title: 'Returns & Exchange Policy',
      slug: 'return-policy',
      status: 'published',
      type: 'policy',
      blocks: [
        {
          type: 'hero',
          data: {
            badge: 'HASSLE-FREE PROMISE',
            title: '7-Day Easy Returns & Doorstep Exchange',
            subtitle: 'Not the perfect fit? We make returns and size exchanges effortless.',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop',
          },
        },
        {
          type: 'rich-text',
          data: {
            heading: 'Simple Doorstep Pickup & Instant Store Credits',
            content: `<p>We want you to love everything you wear from ${rawName}. If you are not completely satisfied, you can initiate a return within 7 days of delivery.</p>
<h3>Complimentary Doorstep Pickup</h3>
<p>Our courier partner will arrange pickup directly from your address at no additional cost.</p>
<h3>Fast Refund Processing</h3>
<p>Refunds are initiated within 48 hours of quality inspection back to your original payment method or instant store credit.</p>`,
          },
        },
      ],
      sectionsEnabled: {
        hero: true,
        body: true,
        customSections: true,
        valueProps: true,
      },
      customSections: [],
      design: fashionDesign,
      seo: {
        title: `Returns & Exchange Policy | ${rawName}`,
        description: `Learn about ${rawName}'s 7-day hassle-free return and exchange policy.`,
      },
      createdAt: now,
      updatedAt: now,
      tenantSlug: cleanSlug,
    },
  ];
}

