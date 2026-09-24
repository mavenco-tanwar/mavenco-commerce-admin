export interface ContactStoreLocation {
  city: string;
  address: string;
  phone: string;
  hours: string;
}

export interface ContactPageConfig {
  pageTitle: string;
  pageSubtitle: string;
  badgeText: string;
  notificationEmail: string;
  stores: ContactStoreLocation[];
  formSubjectOptions: string[];
  design: {
    accentColor: string;
    badgeText: string;
    buttonText: string;
    themeMode: 'dark' | 'light' | 'luxury';
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
  design: {
    accentColor: string;
    themeMode: 'dark' | 'light' | 'luxury';
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
  const address = contact.address || (isJewelry 
    ? `${storeName} High Jewelry Salon, Connaught Place, New Delhi, India`
    : `${storeName} Flagship Store, Indiranagar, Bengaluru, Karnataka 560038`);
  const accentColor = tenantDoc?.theme?.accentColor || (isJewelry ? '#EAB308' : '#F43F5E');

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
        },
        {
          city: `${storeName} Mumbai High Jewelry Atelier`,
          address: 'Kala Ghoda Heritage Arts Precinct, Fort, Mumbai, Maharashtra 400001',
          phone: '+91 98765 43211',
          hours: 'Mon-Sat: 11:00 AM – 8:00 PM',
        },
      ],
      formSubjectOptions: [
        'Bespoke Bridal Suite Appointment',
        'GIA Solitaire Diamond Consultation',
        '18K Solid Gold & Custom Horology Commission',
        'Heirloom Restyling & Gem Valuation',
        'Insured Armored Courier & Order Status',
      ],
      design: {
        accentColor: accentColor,
        badgeText: 'DIRECT ATELIER ACCESS',
        buttonText: 'Send Direct Inquiry to Stylist Concierge',
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
      },
      {
        city: `${storeName} Design Studio`,
        address: 'Kala Ghoda Arts Precinct, Fort, Mumbai, Maharashtra 400001',
        phone: '+91 82390 19096',
        hours: 'Mon-Sat: 10:30 AM – 8:00 PM',
      },
    ],
    formSubjectOptions: [
      'Bespoke Styling Appointment',
      'B2B Wholesale Inquiry',
      'Order Delivery & Exchange Assistance',
      'Press & Media Collaborations',
    ],
    design: {
      accentColor: accentColor,
      badgeText: 'DIRECT ATELIER ACCESS',
      buttonText: 'Send Direct Inquiry to Stylist Concierge',
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
      design: {
        accentColor: accentColor,
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
    design: {
      accentColor: accentColor,
      themeMode: 'dark',
    },
  };
}
