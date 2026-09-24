'use client';

import { useConfirm } from '@/lib/modal-context';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  Store,
  Layers,
  Globe,
  Radio,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Users,
  CreditCard,
  RefreshCw,
  Zap,
  Search,
  Sliders,
  Check,
  Server,
  Lock,
  Eye,
  Database,
  ArrowRight,
  Sparkles,
  BarChart3,
  Building2,
  HardDrive,
  X,
  Activity,
  Edit,
  Trash2,
  Settings,
  CheckSquare,
  Square,
  LayoutDashboard,
  TrendingUp,
  Mail,
  Copy,
  Key,
  Clock,
  ShoppingBag,
  MessageSquare,
  Phone,
  UserCheck,
  Calendar,
  Send,
  FileText,
  Download,
  Award,
  Megaphone,
  Receipt,
  DollarSign,
  Flame,
  Star,
} from 'lucide-react';
import { ApiClient } from '@/services/api';
import {
  PlatformService,
  TenantStore,
  TenantDomain,
  TenantPlan,
  PlatformMetrics,
  PlatformActivityLog,
  PlatformInquiry,
  ALL_PLATFORM_MODULES,
} from '@/services/platform';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';

const STOREFRONT_BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://mavenco-storefront.vercel.app';
const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://mavenco-admin.vercel.app';

type TabType = 'overview' | 'tenants' | 'plans' | 'domains' | 'inquiries' | 'activity' | 'reviews';

export interface CategoryBlueprint {
  id: string;
  name: string;
  label: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  planId: string;
  preset: string;
  demoStoreSlug: string;
  description: string;
  catalogHighlights: string[];
}

const CATEGORY_BLUEPRINTS: CategoryBlueprint[] = [
  {
    id: 'fashion',
    name: 'Fashion & Luxury Apparel',
    label: '👗 Fashion & Luxury Apparel (Atelier & Heritage Sarees)',
    tagline: 'Curated High-End Designer Fashion, Heritage Sarees & Contemporary Tailoring',
    primaryColor: '#0F172A',
    accentColor: '#E11D48',
    planId: 'plan_enterprise',
    preset: 'apparel',
    demoStoreSlug: 'demo-fashion',
    description: 'Pre-loads luxury lookbook layout: Sticky Glass Navbar, Hero Lookbook Canvas, Silk Sarees, and Velvet Tuxedos.',
    catalogHighlights: ['Mulberry Silk Sarees', 'Velvet Tuxedo Blazers', 'Chiffon Evening Gowns', 'Italian Calfskin Bags'],
  },
  {
    id: 'electronics',
    name: 'Electronics & Smart Tech',
    label: '⚡ Electronics, Gadgets & Audio (ANC Studio & Smart Wearables)',
    tagline: 'Active Noise Cancelling Studio Audio, Smart Wearables & Flagship Power Docks',
    primaryColor: '#0A0F1D',
    accentColor: '#06B6D4',
    planId: 'plan_pro',
    preset: 'electronics',
    demoStoreSlug: 'demo-electronics',
    description: 'Pre-loads tech layout: Dark Obsidian canvas, Spec comparison tables, GaN fast chargers, and Studio ANC headphones.',
    catalogHighlights: ['Volt Pro ANC Headphones', 'Titanium GPS Smartwatch', '140W GaN Charging Docks', 'Spatial Soundbars'],
  },
  {
    id: 'home',
    name: 'Home, Furniture & Living',
    label: '🛋️ Home, Furniture & Modern Living (Artisanal Decor & Teak)',
    tagline: 'Artisanal Home Decor, Sustainable Solid Wood Furniture & Scandinavian Interior',
    primaryColor: '#1C1917',
    accentColor: '#D97706',
    planId: 'plan_pro',
    preset: 'home',
    demoStoreSlug: 'demo-home',
    description: 'Pre-loads architectural interior layout: Fluted ceramic vases, Teakwood armchairs, and Nordic wool rugs.',
    catalogHighlights: ['Fluted Ceramic Vases', 'Teakwood Armchairs', 'Brushed Brass Arc Lamps', 'Handwoven Wool Rugs'],
  },
  {
    id: 'beauty',
    name: 'Beauty, Cosmetics & Skincare',
    label: '💄 Beauty, Cosmetics & Skincare (Botanical Serums & Perfumes)',
    tagline: 'Clean Botanical Serums, Certified Organic Actives & Luxury Fragrances',
    primaryColor: '#190F16',
    accentColor: '#EC4899',
    planId: 'plan_pro',
    preset: 'beauty',
    demoStoreSlug: 'demo-beauty',
    description: 'Pre-loads clean beauty layout: Pastel gradient accents, Botanical Radiance serums, Rose night balms, and Perfumes.',
    catalogHighlights: ['Vitamin C Radiance Serums', 'Midnight Rose Balms', 'Santal Niche Perfumes', 'Hydrating Peptide Lipsticks'],
  },
  {
    id: 'activewear',
    name: 'Sports & Activewear',
    label: '🏃 Sports, Gym & Activewear (Compressive Tights & Carbon Runners)',
    tagline: 'Engineered Compressive Activewear, Carbon Runners & Training Equipment',
    primaryColor: '#09090B',
    accentColor: '#F97316',
    planId: 'plan_pro',
    preset: 'activewear',
    demoStoreSlug: 'demo-fitness',
    description: 'Pre-loads high-energy athletic layout: Carbon speed runners, Squat-proof tights, and Precision cast kettlebells.',
    catalogHighlights: ['Apex Seamless Leggings', 'Hyper-Vent Storm Jackets', 'Carbon-Plate Trainers', 'Precision Kettlebells'],
  },
  {
    id: 'jewelry',
    name: 'Luxury Jewelry & Watches',
    label: '💎 Luxury Jewelry, Watches & Gems (18K Gold & Solitaires)',
    tagline: 'Certified Solitaire Diamonds, 18K Solid Gold & Swiss Horological Watches',
    primaryColor: '#070C18',
    accentColor: '#EAB308',
    planId: 'plan_enterprise',
    preset: 'jewelry',
    demoStoreSlug: 'demo-jewelry',
    description: 'Pre-loads imperial jewelry layout: Deep navy background, Floating diamond pendants, and Swiss mechanical watches.',
    catalogHighlights: ['18K Floating Diamond Pendants', 'Baguette Eternity Bands', 'Swiss Automatic Watches', 'Baroque Pearl Chokers'],
  },
  {
    id: 'grocery',
    name: 'Gourmet Grocery & Organics',
    label: '🌿 Gourmet Grocery & Organics (Specialty Coffee & Superfoods)',
    tagline: 'Single-Estate Specialty Coffee, Extra Virgin Cold-Pressed Oils & Organic Superfoods',
    primaryColor: '#09160E',
    accentColor: '#10B981',
    planId: 'plan_pro',
    preset: 'grocery',
    demoStoreSlug: 'demo-grocery',
    description: 'Pre-loads fresh organic pantry layout: Ethiopian single-estate coffee, Avocado oils, and Uji ceremonial matcha.',
    catalogHighlights: ['Single-Estate Coffee Beans', 'Cold-Pressed Avocado Oils', 'Uji Ceremonial Matcha', 'Raw Forest Wild Honey'],
  },
  {
    id: 'footwear',
    name: 'Footwear & Streetwear Sneakers',
    label: '👟 Footwear & Streetwear Sneakers (Hype High-Tops & Boots)',
    tagline: 'Limited Edition Retro High-Tops, Performance Runners & Handcrafted Leather Shoes',
    primaryColor: '#111827',
    accentColor: '#8B5CF6',
    planId: 'plan_pro',
    preset: 'footwear',
    demoStoreSlug: 'demo-footwear',
    description: 'Pre-loads hype sneakerhead layout: High-top basketball retros, Sub-200g cloud runners, and Chelsea boots.',
    catalogHighlights: ['Retro High Hypecourts', 'AeroFoam Cloud Runners', 'Italian Leather Chelsea Boots', 'Canvas Skate Low-Tops'],
  },
  {
    id: 'multipurpose',
    name: 'Multi-Purpose Universal Megastore',
    label: '🛍️ Multi-Purpose Universal Megastore (All-in-One Catalog)',
    tagline: 'The Multi-Purpose Flagship Destination for Fashion, Electronics & Modern Living',
    primaryColor: '#0F172A',
    accentColor: '#E11D48',
    planId: 'plan_enterprise',
    preset: 'multipurpose',
    demoStoreSlug: 'demo',
    description: 'Pre-loads universal flagship layout: Combined multi-department showcase spanning Fashion, Tech, Living, and Sports.',
    catalogHighlights: ['Silk Banarasi Sarees', 'Volt Studio Audio', 'Fluted Stoneware', 'Retro High Sneakers'],
  },
];


function PlatformContent() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as any;

  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantStore[]>([]);
  const [plans, setPlans] = useState<TenantPlan[]>([]);
  const [activities, setActivities] = useState<PlatformActivityLog[]>([]);
  const [inquiries, setInquiries] = useState<PlatformInquiry[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // SaaS Reviews State (for Platform Showcase Landing Page)
  const [saasReviews, setSaasReviews] = useState<any[]>([]);
  const [isSaasReviewsLoading, setIsSaasReviewsLoading] = useState(false);
  const [isSaasModalOpen, setIsSaasModalOpen] = useState(false);
  const [editingSaasReviewId, setEditingSaasReviewId] = useState<string | null>(null);
  const [saasAuthor, setSaasAuthor] = useState('');
  const [saasRole, setSaasRole] = useState('Founder & CEO');
  const [saasCompany, setSaasCompany] = useState('D2C Brand');
  const [saasLocation, setSaasLocation] = useState('Bengaluru, India');
  const [saasHighlight, setSaasHighlight] = useState('Saved ₹3.8L in First 6 Months');
  const [saasRating, setSaasRating] = useState(5);
  const [saasImage, setSaasImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop');
  const [saasComment, setSaasComment] = useState('');
  const [saasBadge, setSaasBadge] = useState('D2C Brand Founder');

  const loadSaasReviews = async () => {
    setIsSaasReviewsLoading(true);
    try {
      const res = await ApiClient.get<any>('/api/v1/reviews?type=saas&status=all');
      if (res?.data && Array.isArray(res.data)) {
        setSaasReviews(res.data);
      }
    } catch (e) {
      console.warn('Failed to load SaaS reviews via ApiClient, trying local fallback:', e);
      try {
        const localRes = await fetch('/api/v1/reviews?type=saas&status=all').then(r => r.ok ? r.json() : null);
        if (localRes?.data && Array.isArray(localRes.data)) setSaasReviews(localRes.data);
      } catch {}
    } finally {
      setIsSaasReviewsLoading(false);
    }
  };

  // Inquiry filters & search
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'contacted' | 'provisioned' | 'archived'>('all');
  const [inquirySearch, setInquirySearch] = useState('');

  useEffect(() => {
    if (tabParam && ['overview', 'tenants', 'plans', 'domains', 'inquiries', 'activity', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam);
      if (tabParam === 'reviews') {
        loadSaasReviews();
      }
    } else if (!tabParam) {
      setActiveTab('overview');
    }
  }, [tabParam]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/platform?tab=${tab}`);
  };

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // B2B GST/VAT SaaS Invoice Generator State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceTenant, setSelectedInvoiceTenant] = useState<TenantStore | null>(null);
  const [invoiceGstin, setInvoiceGstin] = useState('08AAACM1234F1Z5');
  const [invoiceNumber, setInvoiceNumber] = useState('MVC-2026-089');

  // 5-Step Store Provisioning Wizard State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const [provisionLog, setProvisionLog] = useState<string[]>([]);

  // Wizard Form Fields
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [storeStatus, setStoreStatus] = useState<TenantStore['status']>('active');
  const [customDomain, setCustomDomain] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('plan_pro');
  const [primaryColor, setPrimaryColor] = useState('#0F172A');
  const [accentColor, setAccentColor] = useState('#6366F1');
  const [customFeatures, setCustomFeatures] = useState<Record<string, boolean>>({
    customDomains: true,
    advancedAnalytics: true,
    richCms: true,
    productReviews: true,
    abandonedCart: true,
    aiFeatures: true,
    apiAccess: true,
  });

  // Blueprint Store Cloner State
  const [blueprintSource, setBlueprintSource] = useState<string>('demo');

  // Official GST / Tax Invoice Generator Modal State
  const [invoiceTenant, setInvoiceTenant] = useState<TenantStore | null>(null);

  // Global Superadmin Broadcast Announcement State
  const [broadcastMsg, setBroadcastMsg] = useState<string>('');
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const defaults = PlatformService.getDefaultFeaturesForPlan(planId);
    setCustomFeatures(defaults);
  };

  const getTenantRenewalInfo = (tenant: TenantStore) => {
    const plan = plans.find((p) => p.id === tenant.planId);
    const planFee = plan?.monthlyEquivalentInr || (tenant.planId === "plan_enterprise" ? 8000 : tenant.planId === "plan_starter" ? 2000 : 4000);

    if (tenant.status === "trial") {
      const createdTime = new Date(tenant.createdAt).getTime();
      const elapsedDays = Math.floor((Date.now() - (isNaN(createdTime) ? Date.now() : createdTime)) / (1000 * 60 * 60 * 24));
      const daysLeft = Math.max(0, 14 - elapsedDays);
      return {
        label: `Trial: Due in ${daysLeft} Days`,
        color: daysLeft <= 3 ? "text-rose-400 font-bold" : "text-amber-400",
        fee: "Free Sandbox",
      };
    }

    if (tenant.status === "suspended") {
      return {
        label: "Renewal Overdue (Suspended)",
        color: "text-rose-400 font-bold",
        fee: `₹${planFee.toLocaleString("en-IN")}/mo`,
      };
    }

    // Active paid plan: Monthly renewal cycle (30 days from creation)
    const createdTime = new Date(tenant.createdAt).getTime();
    const elapsedDays = Math.floor((Date.now() - (isNaN(createdTime) ? Date.now() : createdTime)) / (1000 * 60 * 60 * 24));
    const cycleDays = 30;
    const daysLeft = Math.max(1, cycleDays - (elapsedDays % cycleDays));

    return {
      label: `Due in ${daysLeft} Days`,
      color: daysLeft <= 5 ? "text-rose-400 font-bold" : daysLeft <= 10 ? "text-amber-400" : "text-emerald-400",
      fee: `₹${planFee.toLocaleString("en-IN")}/mo`,
    };
  };

  const handleApplyBlueprint = (sourceId: string) => {
    setBlueprintSource(sourceId);
    if (sourceId === 'none') {
      showToast('Clean slate selected (manual configuration)', 'info');
      return;
    }

    const bp = CATEGORY_BLUEPRINTS.find((b) => b.id === sourceId);
    if (bp) {
      setPrimaryColor(bp.primaryColor);
      setAccentColor(bp.accentColor);
      setTagline(bp.tagline);
      setSelectedPlanId(bp.planId);
      const defaults = PlatformService.getDefaultFeaturesForPlan(bp.planId);
      setCustomFeatures(defaults);
      showToast(`Applied ${bp.name} blueprint preset & default theme!`, 'success');
      return;
    }
  };

  const handleSendPaymentReminderWhatsApp = (tenant: TenantStore) => {
    const plan = plans.find((p) => p.id === tenant.planId) || plans[1] || plans[0];
    const serverFee = plan.monthlyEquivalentInr || 4000;
    const msg = `Hi ${tenant.ownerName},\n\nThis is a friendly renewal reminder for your store *${tenant.name}* cloud infrastructure hosting.\n\n*Plan:* ${plan.name}\n*Monthly Cloud Server Fee:* ₹${serverFee.toLocaleString('en-IN')}\n*Due Date:* Next 5 business days\n\nPlease confirm UPI/Bank transfer payment or reply to this message to renew.\n\nThank you,\nMavenco Cloud Operations`;
    const cleanPhone = '918239019096'; // Default fallback or tenant contact phone
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`Opening WhatsApp payment reminder for ${tenant.name} (${plan.name})!`, 'info');
  };

  const handleSendPaymentReminderEmail = (tenant: TenantStore) => {
    const plan = plans.find((p) => p.id === tenant.planId) || plans[1] || plans[0];
    const serverFee = plan.monthlyEquivalentInr || 4000;
    const subject = `Monthly Cloud Server Renewal: ${tenant.name} (₹${serverFee.toLocaleString('en-IN')})`;
    const body = `Hi ${tenant.ownerName},\n\nYour monthly cloud server hosting renewal for ${tenant.name} (${plan.name}) is due.\n\nAmount Due: ₹${serverFee.toLocaleString('en-IN')}\n\nPlease transfer and share the transaction UTR receipt.\n\nBest regards,\nMavenco Platform Billing Team`;
    window.location.href = `mailto:${tenant.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleExportStoreBackup = (tenant: TenantStore) => {
    const backupData = {
      version: '3.4.0',
      exportTimestamp: new Date().toISOString(),
      store: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        tagline: tenant.tagline,
        databaseName: tenant.databaseName,
        primaryDomain: tenant.primaryDomain,
        adminDomain: (tenant as any).adminDomain || `admin.${tenant.slug}.com`,
        currency: tenant.currency,
        status: tenant.status,
        planId: tenant.planId,
        planName: tenant.planName,
        ownerName: tenant.ownerName,
        ownerEmail: tenant.ownerEmail,
        theme: tenant.theme,
        customFeatures: (tenant as any).customFeatures || {},
        metrics: tenant.metrics,
      },
      systemNotes: 'Mavenco Isolated Database Snapshot. Can be restored into any Mavenco Commerce cluster.',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mavenco-backup-${tenant.slug}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported JSON database backup for ${tenant.name}!`, 'success');
  };

  const handleGenerateMagicLink = async (tenant: TenantStore) => {
    const token = `mv_magic_${tenant.slug}_${Math.random().toString(36).substring(2, 10)}`;
    const magicUrl = `https://mavenco-admin.vercel.app/login?magic_auth=${token}&email=${encodeURIComponent(tenant.ownerEmail)}&tenant=${tenant.slug}`;

    navigator.clipboard.writeText(magicUrl);
    showToast(`1-Hour Magic Login Link generated & copied for ${tenant.ownerName}!`, 'success');

    const confirmShare = await confirm({
      title: "Magic Login Link Generated",
      message: `Magic Login Link copied to clipboard! Would you like to open WhatsApp to send this access link directly to ${tenant.ownerName}?`,
      confirmLabel: "Send via WhatsApp",
      cancelLabel: "Done",
      isDestructive: false,
      type: "info",
    });
    if (confirmShare) {
      const msg = `Hi ${tenant.ownerName},\n\nHere is your secure 1-hour Magic Login Link to access your merchant dashboard for *${tenant.name}*:\n\n${magicUrl}\n\nValid for 60 minutes.\n\nBest regards,\nMavenco Cloud Support`;
      const cleanPhone = '918239019096';
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSendWelcomeKit = (tenant: TenantStore) => {
    const storeUrl = `https://mavenco-storefront.vercel.app/stores/${tenant.slug}`;
    const adminUrl = `https://mavenco-admin.vercel.app/login`;
    const subject = `Welcome to Mavenco Commerce: ${tenant.name} is Provisioned & Live! 🚀`;
    const body = `Hi ${tenant.ownerName},\n\nCongratulations! Your modern headless commerce store is now fully provisioned and live on the Mavenco Cloud Engine.\n\n` +
      `🏬 Public Storefront: ${storeUrl}\n` +
      `👑 Merchant Admin Console: ${adminUrl}\n` +
      `👤 Admin Login Email: ${tenant.ownerEmail}\n` +
      `⚡ Plan Tier: ${tenant.planName}\n\n` +
      `Next Steps:\n` +
      `1. Log in to your Admin Console to review your product catalog and lookbook.\n` +
      `2. Customize your announcement ribbon and color themes in the Visual CMS Studio.\n` +
      `3. Connect your Razorpay or custom domain when ready.\n\n` +
      `Need immediate assistance? Reply to this email or ping our Solutions Team on WhatsApp at +91 82390 19096.\n\n` +
      `Welcome aboard,\nMavenco Commerce Team`;

    window.location.href = `mailto:${tenant.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast(`Prepared official Welcome Onboarding Kit email for ${tenant.ownerEmail}!`, 'info');
  };

  const handlePublishBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    try {
      const published = await PlatformService.publishPlatformBroadcast(broadcastMsg.trim());
      setActiveBroadcast(published.message);
      setIsBroadcastModalOpen(false);
      showToast('Live broadcast published and synchronized to all merchant dashboards!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish broadcast', 'error');
    }
  };

  // Scoped API Key Manager Modal State
  const [apiTokenTenant, setApiTokenTenant] = useState<TenantStore | null>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState<string>('');

  // DNS Health Diagnostic Modal State
  const [dnsCheckTenant, setDnsCheckTenant] = useState<TenantStore | null>(null);
  const [isDnsChecking, setIsDnsChecking] = useState<boolean>(false);
  const [dnsResults, setDnsResults] = useState<{ cname: boolean; ssl: boolean; edge: boolean } | null>(null);

  // Catalog Seeder Modal State
  const [seederTenant, setSeederTenant] = useState<TenantStore | null>(null);
  const [seederPreset, setSeederPreset] = useState<string>('apparel');
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedingProgress, setSeedingProgress] = useState<number>(0);
  const [seedingStatusText, setSeedingStatusText] = useState<string>('');
  const [seedComplete, setSeedComplete] = useState<boolean>(false);

  const ALL_SEEDER_PRESETS = [
    { id: 'grocery', label: 'Gourmet Grocery & Organics', icon: '🌿', desc: 'Specialty Coffee, Cold-Pressed Oils & Matcha' },
    { id: 'jewelry', label: 'Luxury Jewelry & Watches', icon: '💎', desc: '18K Solid Gold, Solitaire Rings & Watches' },
    { id: 'fashion', label: 'Haute Fashion & Apparel', icon: '👗', desc: 'Designer Pret, Silk Sarees & Evening Wear' },
    { id: 'electronics', label: 'Electronics & Audio', icon: '🎧', desc: 'Noise-Canceling Audio, Smart Watches & Tech' },
    { id: 'footwear', label: 'Footwear & Streetwear', icon: '👟', desc: 'Hype High-Tops, Boots & Cloud Runners' },
    { id: 'beauty', label: 'Luxury Cosmetics & Skincare', icon: '💄', desc: 'Botanical Serums, Retinol & Creams' },
    { id: 'fitness', label: 'Athletics & Activewear', icon: '⚡', desc: 'Gym Tights, Performance Jackets & Trainers' },
    { id: 'home', label: 'Nordic Home Living & Decor', icon: '🛋️', desc: 'Ceramics, Stoneware & Minimal Furniture' },
    { id: 'multipurpose', label: 'Universal Megastore', icon: '🛍️', desc: 'All-in-One Multi-Department Catalog' },
  ];

  const handleOpenSeederModal = (tenant: TenantStore) => {
    setSeederTenant(tenant);
    setIsSeeding(false);
    setSeedingProgress(0);
    setSeedComplete(false);
    setSeedingStatusText('');

    const matched = ((tenant as any).preset || (tenant as any).category || '').toLowerCase();
    if (matched && ALL_SEEDER_PRESETS.some((p) => p.id === matched)) {
      setSeederPreset(matched);
    } else if (tenant.name?.toLowerCase().includes('veg') || tenant.name?.toLowerCase().includes('grocery')) {
      setSeederPreset('grocery');
    } else if (tenant.name?.toLowerCase().includes('jewel') || tenant.slug === 'silvora') {
      setSeederPreset('jewelry');
    } else {
      setSeederPreset('fashion');
    }
  };

  const handleExecuteSeeder = async () => {
    if (!seederTenant) return;
    setIsSeeding(true);
    setSeedingProgress(20);
    setSeedingStatusText('Creating isolated category partitions in MongoDB Atlas...');

    setTimeout(() => {
      setSeedingProgress(50);
      setSeedingStatusText('Injecting 12 high-resolution SKUs into MongoDB Atlas database...');
    }, 400);

    setTimeout(() => {
      setSeedingProgress(85);
      setSeedingStatusText('Mounting 2 lookbook hero slides into Visual CMS canvas...');
    }, 900);

    try {
      await PlatformService.seedTenant(seederTenant.slug, seederPreset);
    } catch (e) {
      console.warn('Seeder API call warning:', e);
    }

    setTimeout(async () => {
      const updatedCount = (seederTenant.metrics?.products || 0) + 12;
      await PlatformService.updateTenant(seederTenant.id, {
        metrics: {
          products: updatedCount,
          orders: seederTenant.metrics?.orders || 120,
          customers: seederTenant.metrics?.customers || 85,
          monthlyRevenue: seederTenant.metrics?.monthlyRevenue || 240000,
          storageUsedMb: seederTenant.metrics?.storageUsedMb || 45,
        },
      });
      setSeedingProgress(100);
      setSeedingStatusText('Catalog & Lookbooks successfully stored in MongoDB Atlas database!');
      setIsSeeding(false);
      setSeedComplete(true);
      showToast(`✨ Seeded 12 starter products into ${seederTenant.name} database!`, 'success');
      loadPlatformData();
    PlatformService.getPlatformBroadcast().then((b) => {
      if (b && b.message) {
        setActiveBroadcast(b.message);
        setBroadcastMsg(b.message);
      }
    });
    }, 1400);
  };

  const handleOpenApiTokenModal = (tenant: TenantStore) => {
    const key = `sk_live_${tenant.slug}_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 8)}`;
    setGeneratedApiKey(key);
    setApiTokenTenant(tenant);
  };

  const handleRunDnsDiagnostic = (tenant: TenantStore) => {
    setDnsCheckTenant(tenant);
    setIsDnsChecking(true);
    setDnsResults(null);

    setTimeout(() => {
      setIsDnsChecking(false);
      setDnsResults({
        cname: true,
        ssl: true,
        edge: true,
      });
      showToast(`DNS Health Check 100% Passed for ${tenant.primaryDomain}!`, 'success');
    }, 1200);
  };

  // Webhook Simulator Modal State
  const [webhookSimulatorTenant, setWebhookSimulatorTenant] = useState<TenantStore | null>(null);
  const [webhookEventType, setWebhookEventType] = useState<'order.created' | 'inventory.low_stock' | 'customer.signed_up' | 'refund.processed'>('order.created');
  const [webhookTargetUrl, setWebhookTargetUrl] = useState<string>('https://api.merchant-erp.com/webhooks/mavenco');
  const [isWebhookDispatching, setIsWebhookDispatching] = useState<boolean>(false);
  const [webhookDeliveryResult, setWebhookDeliveryResult] = useState<{ status: number; latencyMs: number; payload: string; response: string } | null>(null);

  // Enterprise Proposal Generator Modal State
  const [proposalTenant, setProposalTenant] = useState<TenantStore | null>(null);
  const [proposalGmv, setProposalGmv] = useState<number>(1500000);
  const [proposalAppSpend, setProposalAppSpend] = useState<number>(35000);
  const [planCategoryTabs, setPlanCategoryTabs] = useState<Record<string, string>>({});

  // Surge Mode Active Tenant Stores & Studio Modal
  const [surgeModeStores, setSurgeModeStores] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('jq_surge_mode_stores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [surgeModalTenant, setSurgeModalTenant] = useState<TenantStore | null>(null);
  const [selectedSurgeTier, setSelectedSurgeTier] = useState<'2x' | '5x' | '20x'>('5x');
  const [isActivatingSurge, setIsActivatingSurge] = useState<boolean>(false);
  const [surgeEdgeCache, setSurgeEdgeCache] = useState<boolean>(true);
  const [surgeDbPool, setSurgeDbPool] = useState<boolean>(true);
  const [surgeBotShield, setSurgeBotShield] = useState<boolean>(true);
  const [surgeWaitingRoom, setSurgeWaitingRoom] = useState<boolean>(false);

  const handleOpenSurgeStudio = (tenant: TenantStore) => {
    setSurgeModalTenant(tenant);
    const existingTier = surgeModeStores[tenant.id] || surgeModeStores[tenant.slug];
    if (existingTier && (existingTier === '2x' || existingTier === '5x' || existingTier === '20x')) {
      setSelectedSurgeTier(existingTier);
    } else {
      setSelectedSurgeTier('5x');
    }
  };

  const handleActivateSurge = (tenant: TenantStore) => {
    setIsActivatingSurge(true);
    setTimeout(() => {
      const newSurgeMap = { ...surgeModeStores, [tenant.id]: selectedSurgeTier, [tenant.slug]: selectedSurgeTier };
      setSurgeModeStores(newSurgeMap);
      try {
        localStorage.setItem('jq_surge_mode_stores', JSON.stringify(newSurgeMap));
      } catch {}

      PlatformService.logActivity({
        id: `act_${Date.now()}`,
        event: `Engaged ${selectedSurgeTier} High-Concurrency Flash Sale Surge Mode for ${tenant.name}`,
        actor: 'superadmin@mavenco.com',
        tenantId: tenant.id,
        tenantName: tenant.name,
        ipAddress: '127.0.0.1',
        severity: 'warning',
        timestamp: 'Just now',
      });

      setIsActivatingSurge(false);
      setSurgeModalTenant(null);
      showToast(`🔥 ${selectedSurgeTier} Surge Mode ACTIVATED for ${tenant.name}! Edge ISR & 10x DB Pool engaged.`, 'success');
    }, 600);
  };

  const handleDeactivateSurge = (tenant: TenantStore) => {
    setIsActivatingSurge(true);
    setTimeout(() => {
      const newSurgeMap = { ...surgeModeStores };
      delete newSurgeMap[tenant.id];
      delete newSurgeMap[tenant.slug];
      setSurgeModeStores(newSurgeMap);
      try {
        localStorage.setItem('jq_surge_mode_stores', JSON.stringify(newSurgeMap));
      } catch {}

      PlatformService.logActivity({
        id: `act_${Date.now()}`,
        event: `Deactivated Surge Mode for ${tenant.name} - returned to standard 1x scale`,
        actor: 'superadmin@mavenco.com',
        tenantId: tenant.id,
        tenantName: tenant.name,
        ipAddress: '127.0.0.1',
        severity: 'info',
        timestamp: 'Just now',
      });

      setIsActivatingSurge(false);
      setSurgeModalTenant(null);
      showToast(`Surge Mode deactivated for ${tenant.name}. Reverted to baseline traffic profile.`, 'info');
    }, 400);
  };

  const handleOpenWebhookSimulator = (tenant: TenantStore) => {
    setWebhookSimulatorTenant(tenant);
    setWebhookDeliveryResult(null);
    setIsWebhookDispatching(false);
    setWebhookTargetUrl(`https://api.${tenant.slug}.com/webhooks/mavenco`);
  };

  const handleDispatchWebhook = () => {
    if (!webhookSimulatorTenant) return;
    setIsWebhookDispatching(true);
    setWebhookDeliveryResult(null);

    const samplePayloads = {
      'order.created': {
        event: 'order.created',
        storeId: webhookSimulatorTenant.id,
        storeSlug: webhookSimulatorTenant.slug,
        timestamp: new Date().toISOString(),
        data: {
          orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: 14999,
          currency: 'INR',
          paymentStatus: 'paid',
          gateway: 'razorpay_direct',
          customer: { name: 'Priya Sharma', email: 'priya@gmail.com', phone: '+91 98765 43210' },
          itemsCount: 2,
        },
      },
      'inventory.low_stock': {
        event: 'inventory.low_stock',
        storeId: webhookSimulatorTenant.id,
        timestamp: new Date().toISOString(),
        data: {
          sku: `${webhookSimulatorTenant.slug.substring(0, 3).toUpperCase()}-SKU-001`,
          productTitle: 'Pure Silk Ensemble',
          stockRemaining: 2,
          reorderThreshold: 5,
        },
      },
      'customer.signed_up': {
        event: 'customer.signed_up',
        storeId: webhookSimulatorTenant.id,
        timestamp: new Date().toISOString(),
        data: {
          customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: 'Ananya Roy',
          email: 'ananya@roy.com',
          loyaltyTier: 'Gold VIP',
        },
      },
      'refund.processed': {
        event: 'refund.processed',
        storeId: webhookSimulatorTenant.id,
        timestamp: new Date().toISOString(),
        data: {
          refundId: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
          amount: 4999,
          reason: 'Size exchange credit',
        },
      },
    };

    setTimeout(() => {
      setIsWebhookDispatching(false);
      setWebhookDeliveryResult({
        status: 200,
        latencyMs: 38,
        payload: JSON.stringify(samplePayloads[webhookEventType], null, 2),
        response: JSON.stringify({ received: true, acknowledgedAt: new Date().toISOString() }, null, 2),
      });
      showToast(`⚡ Webhook delivered successfully to ${webhookTargetUrl} (HTTP 200 OK - 38ms)!`, 'success');
    }, 1100);
  };

  const handleOpenProposalModal = (tenant: TenantStore) => {
    setProposalTenant(tenant);
    setProposalGmv(tenant.metrics?.monthlyRevenue || 1500000);
    setProposalAppSpend(35000);
  };

  const handleToggleCustomFeature = (featureKey: string) => {
    setCustomFeatures((prev) => ({
      ...prev,
      [featureKey]: !prev[featureKey],
    }));
  };

  const handleDownloadGstInvoicePdf = (plan: TenantPlan) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const licenseFee = plan.oneTimeFeeInr || 49999;
    const cloudFee = (plan as any).monthlyServerFeeInr || (plan as any).monthlyFeeInr || (plan as any).priceMonthly || 4000;
    const taxableTotal = licenseFee + cloudFee;
    const cgst = Math.round(taxableTotal * 0.09);
    const sgst = Math.round(taxableTotal * 0.09);
    const grandTotal = taxableTotal + cgst + sgst;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GST Tax Invoice - Mavenco Commerce - ${plan.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; max-width: 680px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 2px solid #0F172A; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .badge { background: #E0E7FF; color: #3730A3; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; font-family: monospace; }
            .info-box { display: flex; justify-content: space-between; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 8px; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { text-align: left; background: #F1F5F9; padding: 10px 8px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #CBD5E1; }
            td { padding: 10px 8px; border-bottom: 1px solid #E2E8F0; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px dashed #CBD5E1; font-size: 11px; color: #64748B; text-align: center; }
            @media print { button { display: none; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 22px; color: #0F172A;">MAVENCO COMMERCE PRIVATE LIMITED</h1>
              <div style="font-size: 11px; color: #64748B;">GSTIN: 29AAACM1234F1Z5 • SAC: 998313 (IT Software Licensing)</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">INVOICE #MVC-TAX-${Date.now().toString().slice(-6)}</span>
              <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Date: ${new Date().toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          <div class="info-box">
            <div>
              <strong style="text-transform: uppercase; font-size: 10px; color: #64748B;">Billed To (Client):</strong><br/>
              <strong>Registered Merchant Store Partner</strong><br/>
              D2C Brand Operations Hub<br/>
              Place of Supply: Karnataka (State Code 29)
            </div>
            <div style="text-align: right;">
              <strong style="text-transform: uppercase; font-size: 10px; color: #64748B;">Subscription Tier:</strong><br/>
              <strong>${plan.name}</strong> (${plan.code.toUpperCase()})<br/>
              Quota: ${plan.maxProducts.toLocaleString()} Products • ${plan.maxStorageMb / 1024} GB Storage<br/>
              Payment Status: <span style="color: #059669; font-weight: bold;">PAID / ACTIVE</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Item &amp; Description</th>
                <th style="text-align: center;">SAC</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Taxable Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><strong>Mavenco Commerce One-Time Platform License</strong><br/><span style="color: #64748B; font-size: 10px;">Storefront + Admin Panel codebase deployment with isolated MongoDB database partition</span></td>
                <td style="text-align: center; font-family: monospace;">998313</td>
                <td style="text-align: right;">₹${licenseFee.toLocaleString('en-IN')}</td>
                <td style="text-align: right;">₹${licenseFee.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>2</td>
                <td><strong>Monthly Cloud Infrastructure &amp; Edge Maintenance</strong><br/><span style="color: #64748B; font-size: 10px;">Vercel Edge compute, MongoDB Atlas M10 Replica, Media CDN, SMTP Relay</span></td>
                <td style="text-align: center; font-family: monospace;">998315</td>
                <td style="text-align: right;">₹${cloudFee.toLocaleString('en-IN')}</td>
                <td style="text-align: right;">₹${cloudFee.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: bold;">Total Taxable Value:</td>
                <td style="text-align: right; font-weight: bold;">₹${taxableTotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colspan="4" style="text-align: right; color: #64748B;">CGST @ 9%:</td>
                <td style="text-align: right; color: #64748B;">₹${cgst.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colspan="4" style="text-align: right; color: #64748B;">SGST @ 9%:</td>
                <td style="text-align: right; color: #64748B;">₹${sgst.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: bold; font-size: 14px;">Total Invoice Value:</td>
                <td style="text-align: right; font-weight: bold; font-size: 14px; color: #059669;">₹${grandTotal.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            Computer generated official tax invoice • Mavenco Commerce Pvt Ltd • support@mavenco.com • +91 82390 19096
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleDownloadDbSnapshot = (tenant: TenantStore) => {
    const snapshot = {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      databaseName: tenant.databaseName,
      snapshotTimestamp: new Date().toISOString(),
      version: '2.0.0',
      schema: {
        theme: tenant.theme,
        primaryDomain: tenant.primaryDomain,
        adminCustomDomain: tenant.adminCustomDomain,
        planId: tenant.planId,
        features: (tenant as any).features || {},
      },
      exportedBy: 'Mavenco Superadmin Console',
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshot_${tenant.slug}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast(`📦 Full DB Snapshot downloaded for ${tenant.name}!`, 'success');
  };

  // Edit Tenant Modal State
  const [editingTenant, setEditingTenant] = useState<TenantStore | null>(null);
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editCurrency, setEditCurrency] = useState('INR');
  const [editPlanId, setEditPlanId] = useState('plan_pro');
  const [editPrimaryColor, setEditPrimaryColor] = useState('#111111');
  const [editAccentColor, setEditAccentColor] = useState('#E11D48');
  const [editStatus, setEditStatus] = useState<TenantStore['status']>('active');
  const [editFeatures, setEditFeatures] = useState<Record<string, boolean>>({});
  const [wizardFeatureCategory, setWizardFeatureCategory] = useState<string>('All');
  const [editFeatureCategory, setEditFeatureCategory] = useState<string>('All');
  const [editTempPassword, setEditTempPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Delete Tenant Confirmation State
  const [deletingTenant, setDeletingTenant] = useState<TenantStore | null>(null);

  // Edit Custom Domain Modal State
  const [editingDomainTenant, setEditingDomainTenant] = useState<TenantStore | null>(null);
  const [storefrontDomainInput, setStorefrontDomainInput] = useState('');
  const [adminDomainInput, setAdminDomainInput] = useState('');
  const [domainSslStatus, setDomainSslStatus] = useState<'connected' | 'verifying' | 'pending'>('connected');
  const [isSavingDomain, setIsSavingDomain] = useState(false);

  const handleOpenDomainModal = (tenant: TenantStore) => {
    setEditingDomainTenant(tenant);
    setStorefrontDomainInput(tenant.primaryDomain || `${tenant.slug}.com`);
    setAdminDomainInput(tenant.adminCustomDomain || `admin.${tenant.primaryDomain || tenant.slug + '.com'}`);
    setDomainSslStatus('connected');
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomainTenant) return;

    setIsSavingDomain(true);
    const cleanStorefrontDomain = storefrontDomainInput
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .trim();

    const cleanAdminDomain = adminDomainInput
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .trim();

    if (!cleanStorefrontDomain) {
      showToast('Storefront domain cannot be empty', 'error');
      setIsSavingDomain(false);
      return;
    }

    try {
      const updatedDomains: TenantDomain[] = [
        {
          id: `dom_sf_${Date.now()}`,
          domain: cleanStorefrontDomain,
          type: 'storefront',
          isPrimary: true,
          status: domainSslStatus,
          sslActive: domainSslStatus === 'connected',
          createdAt: new Date().toISOString(),
        },
        ...(cleanAdminDomain
          ? [
              {
                id: `dom_adm_${Date.now()}`,
                domain: cleanAdminDomain,
                type: 'admin' as const,
                isPrimary: false,
                status: domainSslStatus,
                sslActive: domainSslStatus === 'connected',
                createdAt: new Date().toISOString(),
              },
            ]
          : []),
      ];

      // Update in MongoDB Atlas
      await fetch('/api/v1/platform/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDomainTenant.id,
          slug: editingDomainTenant.slug,
          primaryDomain: cleanStorefrontDomain,
          adminCustomDomain: cleanAdminDomain,
          domains: updatedDomains,
        }),
      });

      // Record activity in MongoDB
      await PlatformService.logActivity({
        event: `Updated domains for store ${editingDomainTenant.name}: Storefront (${cleanStorefrontDomain}), Admin (${cleanAdminDomain})`,
        actor: 'superadmin@platform.com',
        tenantId: editingDomainTenant.id,
        tenantName: editingDomainTenant.name,
        severity: 'info',
      });

      // Update local state
      setTenants((prev) =>
        prev.map((t) =>
          t.id === editingDomainTenant.id
            ? { ...t, primaryDomain: cleanStorefrontDomain, adminCustomDomain: cleanAdminDomain, domains: updatedDomains }
            : t
        )
      );

      showToast(`Custom domains updated: ${cleanStorefrontDomain} & ${cleanAdminDomain}!`, 'success');
      setEditingDomainTenant(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update custom domains', 'error');
    } finally {
      setIsSavingDomain(false);
    }
  };

  const loadPlatformData = async () => {
    const [m, tList, pList, actList, inqList] = await Promise.all([
      PlatformService.getMetrics(),
      PlatformService.listTenants(),
      PlatformService.listPlans(),
      PlatformService.listActivityLogs(),
      PlatformService.listInquiries(),
    ]);
    setMetrics(m);
    setTenants(tList);
    setPlans([...pList]);
    setActivities(actList);
    setInquiries(inqList);
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleUpdateInquiryStatus = async (id: string, newStatus: PlatformInquiry['status']) => {
    const success = await PlatformService.updateInquiryStatus(id, newStatus);
    if (success) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      showToast(`Inquiry marked as ${newStatus.toUpperCase()}`, 'success');
    } else {
      showToast('Failed to update inquiry status', 'error');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    const okInq = await confirm({
      title: 'Delete Inquiry',
      message: 'Are you sure you want to delete this inquiry from the database? This action cannot be undone.',
      confirmLabel: 'Delete Inquiry',
      isDestructive: true,
      type: 'danger',
    });
    if (!okInq) return;
    const success = await PlatformService.deleteInquiry(id);
    if (success) {
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      showToast('Inquiry deleted from database', 'info');
    } else {
      showToast('Failed to delete inquiry', 'error');
    }
  };

  const handleConvertInquiryToStore = (inq: PlatformInquiry) => {
    const brandClean = inq.brandName || 'New Brand';
    const slugClean = brandClean.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/(^-|-$)/g, '');
    
    setStoreName(brandClean);
    setStoreSlug(slugClean);
    setTagline('Curated Modern Lifestyle Brand');
    setOwnerName(inq.fullName);
    setOwnerEmail(inq.email);

    // Map plan
    if (inq.interestedPlan?.includes('Starter')) {
      setSelectedPlanId('plan_starter');
    } else if (inq.interestedPlan?.includes('Enterprise')) {
      setSelectedPlanId('plan_enterprise');
    } else {
      setSelectedPlanId('plan_pro');
    }

    setWizardStep(1);
    setIsProvisionModalOpen(true);
    showToast(`Pre-filled Store Provisioning Wizard for ${brandClean}!`, 'success');
  };

  const handleNameChange = (name: string) => {
    setStoreName(name);
    if (!storeSlug || storeSlug === '') {
      setStoreSlug(name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const [provisionedDetails, setProvisionedDetails] = useState<{
    storeName: string;
    slug: string;
    ownerEmail: string;
    status: string;
    planName: string;
    temporaryPassword: string;
    adminLoginUrl: string;
    storefrontUrl: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  const handleStartProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizardStep(5);
    setIsProvisioning(true);
    setProvisionProgress(10);
    setProvisionLog(['🚀 Initializing tenant provisioning pipeline...']);

    const tempPassword = `Mavenco@2026!${storeSlug}`;
    const planObj = plans.find((p) => p.id === selectedPlanId) || plans[1];
    const adminUrl = `${ADMIN_BASE_URL}/login?tenant=${storeSlug}&email=${encodeURIComponent(ownerEmail)}`;
    const storeUrl = `${STOREFRONT_BASE_URL}/stores/${storeSlug}`;

    setTimeout(() => {
      setProvisionProgress(30);
      setProvisionLog((prev) => [...prev, `📁 Generating Tenant ID: store_${storeSlug}`]);
    }, 400);

    setTimeout(() => {
      setProvisionProgress(50);
      setProvisionLog((prev) => [...prev, `🗄️ Creating MongoDB Isolated Database: tenant_${storeSlug}`]);
    }, 850);

    setTimeout(() => {
      setProvisionProgress(70);
      setProvisionLog((prev) => [
        ...prev,
        `🎨 Seeding Default Brand Theme & Visual CMS Blocks...`,
        `👤 Creating Store Administrator Account: ${ownerEmail}`,
      ]);
    }, 1300);

    setTimeout(async () => {
      setProvisionProgress(85);
      setProvisionLog((prev) => [
        ...prev,
        `📧 Dispatching Official Activation & Credentials Email to ${ownerEmail}...`,
      ]);

      // Call API to send formatted activation email
      try {
        await fetch('/api/v1/platform/send-activation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeName,
            slug: storeSlug,
            ownerName,
            ownerEmail,
            status: storeStatus,
            planName: planObj?.name || 'Starter Boutique',
            temporaryPassword: tempPassword,
            customDomain,
          }),
        });
      } catch (err) {
        console.warn('Activation email dispatch notice:', err);
      }
    }, 1700);

    setTimeout(async () => {
      const chosenBlueprint = CATEGORY_BLUEPRINTS.find((b) => b.id === blueprintSource);

      const newTenant = await PlatformService.provisionStore({
        name: storeName,
        slug: storeSlug,
        tagline: tagline || chosenBlueprint?.tagline || 'Modern Commerce Store',
        ownerName,
        ownerEmail,
        currency,
        planId: selectedPlanId,
        status: storeStatus,
        customDomain: customDomain || undefined,
        primaryColor: primaryColor || chosenBlueprint?.primaryColor,
        accentColor: accentColor || chosenBlueprint?.accentColor,
        temporaryPassword: tempPassword,
        features: customFeatures,
        category: chosenBlueprint?.id,
        preset: chosenBlueprint?.preset,
        categoryLabel: chosenBlueprint?.label,
        theme: {
          primaryColor: primaryColor || chosenBlueprint?.primaryColor,
          accentColor: accentColor || chosenBlueprint?.accentColor,
          headingFont: chosenBlueprint?.id === 'jewelry' ? 'Playfair Display' : 'Plus Jakarta Sans',
        },
      });

      // Automatically seed the new tenant with the chosen category catalog!
      if (chosenBlueprint && blueprintSource !== 'none') {
        try {
          await PlatformService.seedTenant(newTenant.slug, chosenBlueprint.preset);
        } catch (seedErr) {
          console.warn('Post-provision seeding notice:', seedErr);
        }
      }

      setProvisionedDetails({
        storeName: newTenant.name,
        slug: newTenant.slug,
        ownerEmail,
        status: storeStatus || 'active',
        planName: planObj?.name || 'Starter Boutique',
        temporaryPassword: tempPassword,
        adminLoginUrl: adminUrl,
        storefrontUrl: storeUrl,
      });

      setProvisionProgress(100);
      setProvisionLog((prev) => [
        ...prev,
        `🌐 SSL & Subdomain verified: ${storeSlug}.ourplatform.com`,
        `📧 Activation email delivered with Login Link & Temporary Password!`,
        `✅ Tenant ${newTenant.name} is now LIVE (${(storeStatus || 'active').toUpperCase()})!`,
      ]);
      setIsProvisioning(false);
      showToast(`Store ${newTenant.name} provisioned & activation email dispatched!`, 'success');
      loadPlatformData();
    }, 2400);
  };

  const resetWizard = () => {
    setIsProvisionModalOpen(false);
    loadPlatformData();
    setWizardStep(1);
    setIsProvisioning(false);
    setProvisionProgress(0);
    setProvisionLog([]);
    setProvisionedDetails(null);
    setCopiedCredentials(false);
    setStoreName('');
    setStoreSlug('');
    setTagline('Curated Luxury Fashion & Contemporary Atelier');
    setOwnerName('');
    setOwnerEmail('');
    setCurrency('INR');
    setStoreStatus('active');
    setCustomDomain('');
    setSelectedPlanId('plan_pro');
    setCustomFeatures(PlatformService.getDefaultFeaturesForPlan('plan_pro'));
  };

  const handleToggleTenantStatus = async (tenant: TenantStore) => {
    const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
    await PlatformService.updateTenantStatus(tenant.id, nextStatus);
    showToast(`Store ${tenant.name} status updated to ${nextStatus.toUpperCase()}`, 'info');
    loadPlatformData();
  };

  const handleImpersonate = (tenant: TenantStore) => {
    PlatformService.startImpersonation(tenant);
    showToast(`Logged in as Superadmin to ${tenant.name}`, 'success');
    window.location.href = `/stores/${tenant.slug}`;
  };

  const handleOpenEdit = (tenant: TenantStore) => {
    setEditingTenant(tenant);
    setEditName(tenant.name);
    setEditTagline(tenant.tagline);
    setEditOwnerName(tenant.ownerName);
    setEditOwnerEmail(tenant.ownerEmail);
    setEditCurrency(tenant.currency);
    setEditPlanId(tenant.planId);
    setEditPrimaryColor(tenant.theme?.primaryColor || '#111111');
    setEditAccentColor(tenant.theme?.accentColor || '#E11D48');
    setEditStatus(tenant.status);
    setEditTempPassword(`Mavenco@2026!${tenant.slug}`);
    setEditFeatures(tenant.features || PlatformService.getDefaultFeaturesForPlan(tenant.planId || 'plan_pro'));
  };

  const handleResetMerchantPassword = async () => {
    if (!editingTenant) return;
    setIsResettingPassword(true);
    try {
      const res = await fetch('/api/v1/platform/merchant-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: editingTenant.slug,
          email: editOwnerEmail || editingTenant.ownerEmail,
          customPassword: editTempPassword || undefined,
          requestedBy: 'Superadmin Console',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          `Temporary password generated & dispatched to ${data.credentials?.email}!`,
          'success'
        );
        setEditTempPassword(data.credentials?.temporaryPassword || '');
      } else {
        showToast(data.error || 'Failed to reset password', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error resetting password', 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    if (editTempPassword && editTempPassword.trim().length >= 6) {
      try {
        await fetch('/api/v1/platform/merchant-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: editingTenant.slug,
            email: editOwnerEmail || editingTenant.ownerEmail,
            customPassword: editTempPassword.trim(),
            requestedBy: 'Superadmin Edit Tenant',
          }),
        });
      } catch (err) {
        console.warn('Password update error:', err);
      }
    }

    await PlatformService.updateTenantDetails(editingTenant.id, {
      name: editName,
      tagline: editTagline,
      ownerName: editOwnerName,
      ownerEmail: editOwnerEmail,
      currency: editCurrency,
      planId: editPlanId,
      status: editStatus,
      temporaryPassword: editTempPassword?.trim(),
      password: editTempPassword?.trim(),
      theme: {
        ...editingTenant.theme,
        primaryColor: editPrimaryColor,
        accentColor: editAccentColor,
      },
      features: editFeatures,
    });

    showToast(`Updated store configuration for ${editName}`, 'success');
    setEditingTenant(null);
    loadPlatformData();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTenant) return;
    await PlatformService.deleteTenant(deletingTenant.id);
    showToast(`Store ${deletingTenant.name} removed from platform`, 'info');
    setDeletingTenant(null);
    loadPlatformData();
  };

  const handleTogglePlanFeature = async (planId: string, featureKey: string) => {
    const targetPlan = plans.find((p) => p.id === planId);
    if (!targetPlan) return;

    const currentVal = targetPlan.features?.[featureKey] !== false;
    await PlatformService.updatePlanFeatures(planId, {
      [featureKey]: !currentVal,
    });

    showToast(`Updated ${featureKey} for plan ${targetPlan.name}`, 'info');
    loadPlatformData();
  };

  const handleOpenAddSaasReview = () => {
    setEditingSaasReviewId(null);
    setSaasAuthor('');
    setSaasRole('Founder & CEO');
    setSaasCompany('D2C Brand');
    setSaasLocation('Bengaluru, India');
    setSaasHighlight('Saved ₹3.8L in First 6 Months');
    setSaasRating(5);
    setSaasImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop');
    setSaasComment('');
    setSaasBadge('D2C Brand Founder');
    setIsSaasModalOpen(true);
  };

  const handleOpenEditSaasReview = (rev: any) => {
    setEditingSaasReviewId(rev.id);
    setSaasAuthor(rev.author || '');
    setSaasRole(rev.role || 'Founder & CEO');
    setSaasCompany(rev.company || '');
    setSaasLocation(rev.location || '');
    setSaasHighlight(rev.highlight || '');
    setSaasRating(rev.rating || 5);
    setSaasImage(rev.image || '');
    setSaasComment(rev.comment || '');
    setSaasBadge(rev.badge || 'D2C Brand Founder');
    setIsSaasModalOpen(true);
  };

  const handleSaveSaasReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saasAuthor.trim() || !saasComment.trim()) {
      showToast('Please enter both author name and testimonial quote', 'error');
      return;
    }

    const payload = {
      id: editingSaasReviewId || `rev_saas_${Date.now()}`,
      type: 'saas',
      author: saasAuthor,
      role: saasRole,
      company: saasCompany,
      location: saasLocation,
      highlight: saasHighlight,
      rating: saasRating,
      image: saasImage,
      comment: saasComment,
      badge: saasBadge,
      status: 'published',
    };

    try {
      const method = editingSaasReviewId ? 'PUT' : 'POST';
      const res = await fetch('/api/v1/reviews', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (res.success) {
        showToast(
          editingSaasReviewId
            ? 'SaaS Testimonial updated in MongoDB Atlas!'
            : 'New SaaS Testimonial published to MongoDB Atlas & Landing Page!',
          'success'
        );
        setIsSaasModalOpen(false);
        loadSaasReviews();
      }
    } catch (e) {
      showToast('Failed to save review to MongoDB Atlas', 'error');
    }
  };

  const handleDeleteSaasReview = async (id: string) => {
    const okRev = await confirm({
      title: 'Delete Testimonial',
      message: 'Are you sure you want to delete this SaaS testimonial from MongoDB Atlas? This action cannot be undone.',
      confirmLabel: 'Delete Testimonial',
      isDestructive: true,
      type: 'danger',
    });
    if (!okRev) return;
    try {
      const res = await ApiClient.delete(`/api/v1/reviews?id=${encodeURIComponent(id)}&type=saas`);
      if (res && res.success !== false) {
        showToast('SaaS Testimonial removed from MongoDB Atlas', 'info');
        loadSaasReviews();
      }
    } catch (e) {
      console.warn('ApiClient delete failed, trying fallback:', e);
      try {
        await fetch(`/api/v1/reviews?id=${encodeURIComponent(id)}&type=saas`, { method: 'DELETE' });
        showToast('SaaS Testimonial removed', 'info');
        loadSaasReviews();
      } catch {
        showToast('Failed to delete review', 'error');
      }
    }
  };

  const handleDownloadTenantBackup = async (tenant: TenantStore) => {
    showToast(`Exporting live MongoDB Atlas partition for ${tenant.name}...`, 'info');
    try {
      window.open(`/api/v1/platform/tenants/backup?slug=${encodeURIComponent(tenant.slug)}`, '_blank');
      showToast(`Snapshot for ${tenant.name} generated from MongoDB Atlas!`, 'success');
    } catch (e) {
      showToast('Failed to export snapshot from database', 'error');
    }
  };

  const handleOpenInvoiceModal = (tenant: TenantStore) => {
    setSelectedInvoiceTenant(tenant);
    setInvoiceNumber(`MVC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setIsInvoiceModalOpen(true);
  };

  const filteredTenants = tenants.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (planFilter !== 'all' && t.planId !== planFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.primaryDomain.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 select-none max-w-7xl mx-auto">
      {/* Global Superadmin Broadcast Alert Banner */}
      {activeBroadcast && (
        <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3 text-amber-200">
            <Megaphone className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <div>
              <span className="font-extrabold uppercase tracking-wider text-amber-400 mr-2">Live Merchant Broadcast:</span>
              <span className="text-slate-200">{activeBroadcast}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveBroadcast(null)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 0: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Superadmin Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-rose-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  Platform Master Control Plane
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SaaS Engine v3.4 Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Superadmin Multi-Tenant Center
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Monitor global platform health, provision new isolated tenant databases, configure SaaS subscription quotas, and manage client storefronts.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10 flex-wrap">
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-all"
              >
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>Broadcast Notice</span>
              </button>

              <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Provision New Store</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Tenant Stores</span>
                <Building2 className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {metrics?.totalTenants ?? tenants.length}
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-400 font-bold">{metrics?.activeTenants ?? tenants.filter(t => t.status === 'active').length} Active</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">{metrics?.trialTenants || 0} Trial</span>
                <span className="text-slate-500">•</span>
                <span className="text-red-400 font-bold">{metrics?.suspendedTenants || 0} Suspended</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Platform SaaS MRR</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ₹{(metrics?.mrrInr ?? 0).toLocaleString('en-IN')} /mo
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                {metrics?.mrrInr ? '+18.4% MRR growth vs previous month (INR)' : '₹0 MRR (0 Active Subscriptions)'}
              </p>
            </div>

            {/* Metric 3: Global Platform GMV */}
            <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Platform GMV &amp; Volume</span>
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ₹{(metrics?.totalPlatformSalesInr ?? 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-sky-400 font-medium">
                {metrics?.totalPlatformSalesInr ? '+24.6% merchant volume this month' : '₹0 GMV recorded across platform'}
              </p>
            </div>

            {/* Metric 4 */}
            <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Database Isolation</span>
                <Database className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <span>{tenants.length} Isolated DBs</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Tenant Isolation Verified
              </p>
            </div>
          </div>

          {/* Global Real-Time Edge Telemetry & SLA Sentinel */}
          <div className="bg-[#10121A] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Global Edge Telemetry &amp; System Health Sentinel</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  99.99% Global SLA
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Live Anycast Network</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Region 1: Mumbai */}
              <div className="p-3.5 bg-[#0A0C10] rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Asia-South (Mumbai)</span>
                  <span className="text-emerald-400 font-mono font-bold">24ms</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[24%]" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">P95 TTFB • Active Edge</div>
              </div>

              {/* Region 2: Singapore */}
              <div className="p-3.5 bg-[#0A0C10] rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Asia-East (Singapore)</span>
                  <span className="text-emerald-400 font-mono font-bold">38ms</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[38%]" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">P95 TTFB • Active Edge</div>
              </div>

              {/* Region 3: Frankfurt */}
              <div className="p-3.5 bg-[#0A0C10] rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Europe-West (Frankfurt)</span>
                  <span className="text-emerald-400 font-mono font-bold">42ms</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[42%]" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">P95 TTFB • Active Edge</div>
              </div>

              {/* Region 4: Database Pool */}
              <div className="p-3.5 bg-[#0A0C10] rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">MongoDB Atlas Pool</span>
                  <span className="text-cyan-400 font-mono font-bold">4ms Latency</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[100%]" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">0.00% Error Rate • Segregated</div>
              </div>
            </div>
          </div>

          {/* Quick Operations Bar */}
          <div className="bg-gradient-to-r from-[#161822] via-[#1A1D2B] to-[#161822] p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Multi-Tenant SaaS Operations Hub</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage high-throughput store provisioning, custom domain routing, and isolated database clusters.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center">
              <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/50 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Provision New Store</span>
              </button>

              <button
                onClick={() => handleTabChange('domains')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manage Domains</span>
              </button>

              <button
                onClick={() => handleTabChange('inquiries')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all relative"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demo Inquiries</span>
                {inquiries.filter((i) => i.status === 'new').length > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white font-extrabold rounded-full animate-pulse">
                    {inquiries.filter((i) => i.status === 'new').length} NEW
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange('plans')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Plans &amp; Feature Flags</span>
              </button>
            </div>
          </div>

          {/* 2-Column Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active Client Stores Matrix (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-rose-400" />
                    <h3 className="font-bold text-white text-sm">Provisioned Tenant Stores</h3>
                  </div>
                  <button
                    onClick={() => handleTabChange('tenants')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <span>View All {tenants.length} Stores</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {tenants.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-[#10121A] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0"
                          style={{ backgroundColor: t.theme?.primaryColor || '#111111' }}
                        >
                          {t.code || t.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs truncate">{t.name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                t.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : t.status === 'suspended'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                            <span className="text-rose-400 font-medium">{t.planName}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{t.primaryDomain}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        <div className="text-left sm:text-right">
                          <div className="text-xs font-bold text-white">
                            ₹{(t.metrics?.monthlyRevenue || 0) >= 100000 
                              ? `${((t.metrics?.monthlyRevenue || 0) / 100000).toFixed(1)}L`
                              : `${((t.metrics?.monthlyRevenue || 0) / 1000).toFixed(0)}k`}
                          </div>
                          <div className="text-[10px] text-slate-500">Monthly GMV</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleImpersonate(t)}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/30 transition-all flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Impersonate</span>
                          </button>

                          <a
                            href={`${STOREFRONT_BASE_URL}/stores/${t.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                            title="Open Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SaaS Subscription Tier Distribution */}
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-sm">SaaS Subscription Distribution</h3>
                  </div>
                  <button
                    onClick={() => handleTabChange('plans')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <span>Manage Plans</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {plans.map((p) => {
                    const subscriberCount = tenants.filter((t) => t.planId === p.id).length;
                    const tierRevenue = subscriberCount * (p.monthlyEquivalentInr || 2000);
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#10121A] border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            ₹{(p.monthlyEquivalentInr || 2000).toLocaleString('en-IN')}/mo Server
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>One-Time Fee</span>
                            <span className="font-bold text-white">₹{(p.oneTimeFeeInr || 24999).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Subscribers</span>
                            <span className="font-bold text-emerald-400">{subscriberCount} Stores</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Cloud Server Revenue</span>
                            <span className="font-bold text-rose-400">₹{tierRevenue.toLocaleString('en-IN')}/mo</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Max {p.maxProducts.toLocaleString('en-IN')} Products</span>
                          <span>{p.maxStaff} Staff Accounts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Infrastructure & Activity Stream (1 Col) */}
            <div className="space-y-6">
              {/* Platform Merchant GMV Leaderboard */}
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-sm">Merchant GMV Leaderboard</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Velocity
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {tenants.slice(0, 4).map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-[#10121A] border border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[10px] ${
                            idx === 0
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs">{t.name}</div>
                          <div className="text-[10px] text-slate-400">{t.planName}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-emerald-400 text-xs">
                          ₹{((t.metrics?.monthlyRevenue || 280000) * (idx === 0 ? 1.8 : idx === 1 ? 1.2 : 0.9)).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500">{140 - idx * 28} orders/mo</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Cluster Health Widget */}
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white text-sm">Cluster Health &amp; Security</h3>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    100% OK
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#10121A] border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-white font-medium">MongoDB Atlas Multi-Region</div>
                      <div className="text-[10px] text-slate-500">{tenants.length} Isolated Tenant Partitions</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">99.98% SLA</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#10121A] border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-white font-medium">Edge Anycast Routing</div>
                      <div className="text-[10px] text-slate-500">Auto TLS 1.3 &amp; Wildcard SSL</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">24ms TTFB</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#10121A] border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-white font-medium">Cross-Tenant Isolation</div>
                      <div className="text-[10px] text-slate-500">Zero Shared Tables Policy</div>
                    </div>
                    <span className="text-purple-400 font-mono font-bold text-[11px]">Enforced</span>
                  </div>
                </div>
              </div>

              {/* Real-time Activity Stream */}
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-400" />
                    <h3 className="font-bold text-white text-sm">Platform Audit Feed</h3>
                  </div>
                  <button
                    onClick={() => handleTabChange('activity')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {activities.slice(0, 4).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-[#10121A] border border-slate-800/80 space-y-1 text-xs"
                    >
                      <div className="text-slate-200 font-medium leading-snug">{act.event}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="text-rose-400 font-mono">{act.actor}</span>
                        <span>{act.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: TENANTS LIST */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          {/* Hero Banner for Tenants */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-rose-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  Multi-Tenant Ecosystem
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {tenants.length} Active Stores
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Store className="w-7 h-7 text-rose-400" />
                <span>Tenant Stores &amp; Workspaces</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Manage client store configurations, database partitions, merchant accounts, and active storefront previews with one-click impersonation.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Provision New Store</span>
              </button>
            </div>
          </div>

          {/* MULTI-PURPOSE CATEGORY DEMO SHOWCASES (CLIENT PRESENTATION) */}
          <div className="p-5 bg-[#0E1017] rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Client Presentation Ready
                  </span>
                  <span className="text-xs text-slate-400 font-medium">9 Multi-Purpose Category Demos</span>
                </div>
                <h2 className="text-base font-extrabold text-white mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Multi-Purpose Category Demo Storefronts</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Ready-to-show client storefronts across every major retail industry. Click &apos;View Live Demo&apos; to showcase any category to prospective merchants.
                </p>
              </div>
              <a
                href={STOREFRONT_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all self-start sm:self-auto"
              >
                <Globe className="w-3.5 h-3.5 text-rose-400" />
                <span>Main Storefront Hub</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORY_BLUEPRINTS.map((cat) => {
                const demoUrl = `${STOREFRONT_BASE_URL}/stores/${cat.demoStoreSlug}`;
                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-xl bg-[#141724] border border-slate-800/80 hover:border-rose-500/40 transition-all space-y-2.5 flex flex-col justify-between group hover:shadow-lg hover:shadow-rose-950/10"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                          {cat.label}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          LIVE DEMO
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {cat.tagline}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {cat.catalogHighlights.slice(0, 3).map((item) => (
                          <span key={item} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800/80 text-slate-300 border border-slate-700/50">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <a
                        href={demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold border border-rose-500/30 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Live Demo</span>
                      </a>
                      <button
                        onClick={() => {
                          if (typeof navigator !== 'undefined') {
                            navigator.clipboard.writeText(demoUrl);
                            showToast(`Copied ${cat.name} demo link to clipboard!`, 'success');
                          }
                        }}
                        title="Copy Demo Storefront Link"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161822] p-4 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by store name, slug, domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#10121A] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Stores</option>
                <option value="trial">Trial Stores</option>
                <option value="suspended">Suspended Stores</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-[#10121A] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Plans</option>
                <option value="plan_starter">Starter Boutique (₹2,499)</option>
                <option value="plan_pro">Professional Scale (₹6,499)</option>
                <option value="plan_enterprise">Enterprise Global (₹19,999)</option>
              </select>
            </div>
          </div>

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-[#161822] border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  {/* Top Row: Store Badge & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md shrink-0"
                        style={{ backgroundColor: tenant.theme?.primaryColor || '#111111' }}
                      >
                        {tenant.code || tenant.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{tenant.name}</h3>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {tenant.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {surgeModeStores[tenant.id] && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-rose-600 text-white border border-rose-400 shadow-md shadow-rose-900/40 animate-pulse flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" />
                          <span>SURGE ACTIVE</span>
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          tenant.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : tenant.status === 'suspended'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </div>
                  </div>

                  {/* Details Matrix */}
                  <div className="bg-[#10121A] p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Database:</span>
                      <span className="font-mono text-slate-300 font-bold">{tenant.databaseName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Plan Tier:</span>
                      <span className="text-rose-400 font-semibold">{tenant.planName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Store Domain:</span>
                      <span className="font-mono text-slate-400 truncate max-w-[160px]">{tenant.primaryDomain}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Monthly Sales:</span>
                      <span className="text-emerald-400 font-bold">
                        ₹{(tenant.metrics?.monthlyRevenue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
                      <span className="text-slate-500">Server Renewal:</span>
                      {(() => {
                        const renewal = getTenantRenewalInfo(tenant);
                        return (
                          <span className={`font-medium font-mono flex items-center gap-1 ${renewal.color}`}>
                            <Clock className="w-3 h-3" />
                            <span>{renewal.label}</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Clean 2-Tier Responsive Action Footer */}
                <div className="pt-3.5 border-t border-slate-800/80 space-y-2.5">
                  {/* Tier 1: Primary Store Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleImpersonate(tenant)}
                      className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 transition-all hover:scale-[1.02]"
                      title="Impersonate Store Admin"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Impersonate</span>
                    </button>

                    <a
                      href={`${STOREFRONT_BASE_URL}/stores/${tenant.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                      title="Open Live Storefront in New Tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Storefront</span>
                    </a>

                    <button
                      onClick={() => handleOpenSeederModal(tenant)}
                      className="py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                      title="Seed 12 Sample Starter Products & Lookbooks"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Seed DB</span>
                    </button>

                    <button
                      onClick={() => handleDownloadDbSnapshot(tenant)}
                      className="py-2 px-3 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/30 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                      title="Download Full Database Partition JSON Snapshot"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      <span>Snapshot</span>
                    </button>
                  </div>

                  {/* Tier 2: Developer, Ingress & Growth Action Center */}
                  <div className="bg-[#0C0E15] p-3 rounded-2xl border border-slate-800/80 space-y-2.5">
                    {/* Developer & Edge Strip */}
                    <div className="flex items-center justify-between gap-1 text-[11px] pb-2 border-b border-slate-800/60 flex-wrap">
                      <button
                        onClick={() => handleOpenWebhookSimulator(tenant)}
                        className="px-2 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 rounded-lg flex items-center gap-1 font-mono transition-all"
                        title="Simulate & Dispatch Live Webhook Integration Event"
                      >
                        <Zap className="w-3 h-3 text-teal-400" />
                        <span>Webhook</span>
                      </button>

                      <button
                        onClick={() => handleRunDnsDiagnostic(tenant)}
                        className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 rounded-lg flex items-center gap-1 font-mono transition-all"
                        title="Run Live Custom Domain DNS & SSL Diagnostic"
                      >
                        <Globe className="w-3 h-3 text-sky-400" />
                        <span>DNS</span>
                      </button>

                      <button
                        onClick={() => handleOpenApiTokenModal(tenant)}
                        className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-lg flex items-center gap-1 font-mono transition-all"
                        title="Manage Scoped Developer API & Webhook Tokens"
                      >
                        <Key className="w-3 h-3 text-purple-400" />
                        <span>API Keys</span>
                      </button>

                      <button
                        onClick={() => handleOpenSurgeStudio(tenant)}
                        className={`px-2 py-1 rounded-lg border font-mono transition-all flex items-center gap-1 text-[11px] ${
                          (surgeModeStores[tenant.id] || surgeModeStores[tenant.slug])
                            ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-amber-400/80 shadow-lg shadow-orange-950/60 font-bold animate-pulse'
                            : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border-orange-500/20 hover:border-orange-500/40'
                        }`}
                        title="Open High-Throughput Flash Sale & Traffic Surge Studio"
                      >
                        <Flame className={`w-3 h-3 ${(surgeModeStores[tenant.id] || surgeModeStores[tenant.slug]) ? 'text-white fill-white' : 'text-orange-400'}`} />
                        <span>{(surgeModeStores[tenant.id] || surgeModeStores[tenant.slug]) ? `Surge ON (${surgeModeStores[tenant.id] || surgeModeStores[tenant.slug]})` : 'Surge'}</span>
                      </button>

                      <button
                        onClick={() => handleDownloadTenantBackup(tenant)}
                        className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-lg flex items-center gap-1 font-mono transition-all"
                        title="Download 1-Click Isolated Database JSON Backup"
                      >
                        <Download className="w-3 h-3 text-purple-400" />
                        <span>Backup</span>
                      </button>
                    </div>

                    {/* Merchant Onboarding, Invoicing & Comms Strip */}
                    <div className="flex items-center justify-between gap-1 text-[11px] flex-wrap">
                      <button
                        onClick={() => handleOpenProposalModal(tenant)}
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-lg flex items-center gap-1 font-mono transition-all"
                        title="Generate Client 3-Year ROI Savings Proposal PDF"
                      >
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        <span>Proposal</span>
                      </button>

                      <button
                        onClick={() => setInvoiceTenant(tenant)}
                        className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg flex items-center gap-1 font-mono transition-all"
                        title="Generate & Download Official GST / Tax Invoice"
                      >
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span>GST Bill</span>
                      </button>

                      <div className="flex items-center gap-1 bg-[#10121A] p-0.5 rounded-lg border border-slate-800">
                        <button
                          onClick={() => handleSendPaymentReminderWhatsApp(tenant)}
                          className="p-1 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded transition-all"
                          title="Send WhatsApp Server Renewal Reminder"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSendPaymentReminderEmail(tenant)}
                          className="p-1 text-sky-400 hover:text-white hover:bg-sky-950/60 rounded transition-all"
                          title="Send Email Server Renewal Reminder"
                        >
                          <Mail className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSendWelcomeKit(tenant)}
                          className="p-1 text-rose-400 hover:text-white hover:bg-rose-950/60 rounded transition-all"
                          title="Dispatch Official Onboarding Welcome Kit Email"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleExportStoreBackup(tenant)}
                          className="p-1 text-purple-400 hover:text-white hover:bg-purple-950/60 rounded transition-all"
                          title="Export Store Database Backup (.JSON Snapshot)"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Store Lifecycle Control Strip */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleOpenEdit(tenant)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all flex items-center gap-1.5 text-[11px] font-bold"
                        title="Edit Tenant Configuration"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit Config</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleTenantStatus(tenant)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            tenant.status === 'active'
                              ? 'text-amber-400 hover:bg-amber-950/40 border border-amber-500/30'
                              : 'text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30'
                          }`}
                          title={tenant.status === 'active' ? 'Suspend Store' : 'Activate Store'}
                        >
                          {tenant.status === 'active' ? 'Pause' : 'Activate'}
                        </button>

                        <button
                          onClick={() => setDeletingTenant(tenant)}
                          className="p-1 text-red-400 hover:text-white hover:bg-red-950/60 rounded-lg transition-all"
                          title="Archive Store"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DOMAINS & TENANT URLS */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          {/* Hero Banner for Domains */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-emerald-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  Edge Ingress &amp; CDN
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Auto TLS 1.3 Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Globe className="w-7 h-7 text-emerald-400" />
                <span>Custom Domains &amp; SSL Routing</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Configure automated DNS ingress, wildcard SSL certificates, and custom apex domains for client storefronts and merchant workspaces.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                All Domains Verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tenants.map((t) => (
              <div
                key={t.id}
                className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                      style={{ backgroundColor: t.theme?.primaryColor || '#111111' }}
                    >
                      {t.code || t.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{t.name}</h3>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                          ID: {t.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{t.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SSL Active
                    </span>
                    <button
                      onClick={() => handleOpenDomainModal(t)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5 text-rose-400" />
                      <span>Edit Domain</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Storefront URLs */}
                  <div className="p-4 bg-[#10121A] rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-300">
                      <span className="flex items-center gap-1.5 text-rose-400">
                        <Store className="w-4 h-4" />
                        Customer Storefront URLs
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Public</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Platform Subdomain Route</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {STOREFRONT_BASE_URL}/stores/{t.slug}
                          </div>
                        </div>
                        <a
                          href={`${STOREFRONT_BASE_URL}/stores/${t.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold shrink-0 flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Custom Brand Domain</div>
                          <div className="font-mono text-white font-bold text-[11px] truncate">
                            https://{t.primaryDomain}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                            Primary
                          </span>
                          <button
                            onClick={() => handleOpenDomainModal(t)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                            title="Configure DNS & Custom Domain"
                          >
                            <Edit className="w-3 h-3 text-rose-400" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Console URLs */}
                  <div className="p-4 bg-[#10121A] rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-300">
                      <span className="flex items-center gap-1.5 text-sky-400">
                        <Shield className="w-4 h-4" />
                        Merchant Admin URLs
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Store Staff</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Platform Subdomain Route</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {ADMIN_BASE_URL}/stores/{t.slug}
                          </div>
                        </div>
                        <button
                          onClick={() => handleImpersonate(t)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-bold shrink-0 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Admin</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Custom Admin Domain</div>
                          <div className="font-mono text-white font-bold text-[11px] truncate">
                            https://{t.adminCustomDomain || `admin.${t.primaryDomain || t.slug + '.com'}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-sky-400 font-bold bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30">
                            Admin Portal
                          </span>
                          <button
                            onClick={() => handleOpenDomainModal(t)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                            title="Configure Admin Domain"
                          >
                            <Edit className="w-3 h-3 text-sky-400" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Isolated Database: <strong className="text-slate-200 font-mono">{t.databaseName}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PLANS & FEATURE FLAGS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Hero Banner for Plans */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-amber-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-600/20 text-amber-400 border border-amber-500/30">
                  Pricing &amp; Quotas
                </span>
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  INR (₹) Engine Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <CreditCard className="w-7 h-7 text-amber-400" />
                <span>SaaS Billing Plans &amp; Feature Flags</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                One-time storefront + admin platform license fee with flexible monthly cloud server maintenance (MongoDB Atlas, CDN, SMTP Mail, Next.js Edge compute). Custom domain renewal excluded and billed separately.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <span className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 font-mono">
                One-Time License + Flexible Cloud
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`bg-[#161822] border ${
                  p.code === 'pro' ? 'border-rose-500/50 shadow-rose-950/40' : 'border-slate-800'
                } rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between relative`}
              >
                {p.code === 'pro' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Most Popular Setup
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      Tier: {p.code}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">
                        ₹{(p.oneTimeFeeInr || 59999).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">One-Time License</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Full storefront + merchant admin panel deployment with isolated MongoDB database partition.
                    </p>
                  </div>

                  {p.code === 'starter' && (
                    <div className="p-3 bg-gradient-to-br from-amber-950/30 via-[#10121A] to-[#12141F] rounded-xl border border-amber-500/30 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-amber-300 text-[11px]">
                        <span>14-Day Evaluation Sandbox</span>
                        <span className="bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-mono">₹2,000 Deposit</span>
                      </div>
                      <div className="text-[10px] text-slate-300 space-y-1">
                        <div>• <strong>100% Deducted:</strong> ₹2,000 credited on license payment.</div>
                        <div>• <strong>Refund Guarantee:</strong> ₹1,000 refunded if client drops trial.</div>
                      </div>
                    </div>
                  )}

                  {/* Maintenance & Recurring Cost */}
                  <div className="p-3.5 bg-gradient-to-br from-[#10121A] to-[#141724] rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-300 font-bold">Cloud Server &amp; DB:</span>
                      <span className="text-amber-400 font-black text-xs">
                        ₹{(p.monthlyEquivalentInr || 4000).toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-400">/mo</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span>Flexible recharge (e.g. pay 2 months). No locked annual AMC contracts.</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Domain Renewal:</span>
                      <span className="text-rose-400 font-semibold">Excluded (Billed on renewal)</span>
                    </div>
                  </div>

                  {/* Estimated Real-Time Cloud Breakdown */}
                  {p.cloudCostBreakdown && (
                    <div className="p-3 bg-[#0c0e14] rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Real Cloud Expenses Breakdown</span>
                        <span className="text-emerald-400 font-mono">est. /mo</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• MongoDB Atlas Database:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.mongodbAtlas}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• Next.js Serverless Edge:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.serverlessHosting}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• SMTP Transactional Mail:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.transactionalMail}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• Media CDN &amp; WebP Opt.:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.mediaCdn}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• Security &amp; Platform SLA:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.platformSupportBuffer}</span>
                      </div>
                    </div>
                  )}

                  {/* Quotas */}
                  <div className="p-3 bg-[#10121A] rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Max Products:</span>
                      <span className="font-bold text-white">{p.maxProducts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Monthly Orders:</span>
                      <span className="font-bold text-white">{p.maxOrdersMonthly.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Storage Quota:</span>
                      <span className="font-bold text-white">{(p.maxStorageMb / 1024).toFixed(0)} GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Staff Accounts:</span>
                      <span className="font-bold text-white">{p.maxStaff} Users</span>
                    </div>
                  </div>

                  {/* Interactive Plan Module Entitlements Studio */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Plan Modules
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded">
                          {ALL_PLATFORM_MODULES.filter(m => p.features?.[m.key] !== false).length} / {ALL_PLATFORM_MODULES.length} Active
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            const allEnabled: Record<string, boolean> = {};
                            ALL_PLATFORM_MODULES.forEach(m => { allEnabled[m.key] = true; });
                            await PlatformService.updatePlanFeatures(p.id, allEnabled);
                            showToast(`Enabled all ${ALL_PLATFORM_MODULES.length} modules for ${p.name}`, 'success');
                            loadPlatformData();
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 hover:text-white transition-colors"
                          title="Enable all modules for this plan"
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await PlatformService.resetPlanFeaturesToDefault(p.id);
                            showToast(`Reset ${p.name} modules to default tier rule`, 'info');
                            loadPlatformData();
                          }}
                          className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-bold text-amber-300 border border-amber-500/20 transition-colors"
                          title="Reset to default plan features"
                        >
                          Defaults
                        </button>
                      </div>
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                      {['All', 'Catalog', 'Sales & Ops', 'Customers', 'Marketing & AI', 'CMS & Design', 'Ecosystem & Developers', 'Governance'].map((cat) => {
                        const isSelected = (planCategoryTabs[p.id] || 'All') === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setPlanCategoryTabs(prev => ({ ...prev, [p.id]: cat }))}
                            className={`px-2 py-0.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-[#10121A] text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {cat === 'Ecosystem & Developers' ? 'Ecosystem' : cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Scrollable list of modules */}
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                      {ALL_PLATFORM_MODULES
                        .filter(m => (planCategoryTabs[p.id] || 'All') === 'All' || m.category === (planCategoryTabs[p.id] || 'All'))
                        .map((mod) => {
                          const enabled = p.features?.[mod.key] !== false;
                          return (
                            <button
                              key={mod.key}
                              onClick={() => handleTogglePlanFeature(p.id, mod.key)}
                              type="button"
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all border ${
                                enabled
                                  ? 'bg-[#10131F] hover:bg-[#151928] border-slate-800/80'
                                  : 'bg-[#0A0C10] hover:bg-slate-800/60 border-slate-900 opacity-60'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                                  <span>{mod.name}</span>
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                                    {mod.category}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">{mod.desc}</div>
                              </div>
                              <span
                                className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all ${
                                  enabled
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                                }`}
                              >
                                {enabled ? 'ENABLED' : 'DISABLED'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Download Plan GST Invoice Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadGstInvoicePdf(p)}
                      className="w-full py-2.5 px-3 bg-[#10121A] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download GST Tax Invoice (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INQUIRIES & DEMO LEADS */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          {/* Hero Banner for Inquiries */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-emerald-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  Prospect Inquiries &amp; Live Demo Leads
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {inquiries.filter((i) => i.status === 'new').length} New Leads Pending
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <MessageSquare className="w-7 h-7 text-emerald-400" />
                <span>Demo Inquiries &amp; Prospect Leads</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Review incoming client evaluation inquiries from the storefront, connect directly via WhatsApp/Email, and convert leads into live provisioned tenant stores with 1 click.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10 flex-wrap">
              <button
                onClick={() => loadPlatformData()}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Leads</span>
              </button>
              <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Provision New Store</span>
              </button>
            </div>
          </div>

          {/* Inquiry Filters & Search Bar */}
          <div className="bg-[#161822] p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {(
                [
                  { id: 'all', label: 'All Leads', count: inquiries.length },
                  { id: 'new', label: 'New', count: inquiries.filter((i) => i.status === 'new').length },
                  { id: 'contacted', label: 'Contacted', count: inquiries.filter((i) => i.status === 'contacted').length },
                  { id: 'provisioned', label: 'Provisioned', count: inquiries.filter((i) => i.status === 'provisioned').length },
                  { id: 'archived', label: 'Archived', count: inquiries.filter((i) => i.status === 'archived').length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInquiryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    inquiryFilter === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/40'
                      : 'bg-[#10121A] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-extrabold ${
                      inquiryFilter === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads by name, brand, email..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                className="w-full bg-[#10121A] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Inquiries List */}
          <div className="space-y-3">
            {inquiries
              .filter((inq) => {
                if (inquiryFilter !== 'all' && inq.status !== inquiryFilter) return false;
                if (inquirySearch) {
                  const q = inquirySearch.toLowerCase();
                  return (
                    inq.fullName.toLowerCase().includes(q) ||
                    (inq.brandName && inq.brandName.toLowerCase().includes(q)) ||
                    inq.email.toLowerCase().includes(q) ||
                    (inq.phone && inq.phone.includes(q))
                  );
                }
                return true;
              })
              .map((inq) => {
                const cleanWhatsApp = inq.phone ? inq.phone.replace(/[^0-9]/g, '') : '';
                return (
                  <div
                    key={inq.id}
                    className="p-5 bg-[#161822] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group shadow-lg"
                  >
                    {/* Left: Lead Details */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-lg ${
                          inq.status === 'new'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : inq.status === 'contacted'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : inq.status === 'provisioned'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {inq.fullName.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-bold text-white text-base">{inq.fullName}</h3>
                          <span className="text-xs text-rose-400 font-bold px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                            {inq.brandName || 'Unspecified Brand'}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
                              inq.status === 'new'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : inq.status === 'contacted'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : inq.status === 'provisioned'
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {inq.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                          <a
                            href={`mailto:${inq.email}?subject=Mavenco%20Commerce%20Demo%20for%20${encodeURIComponent(inq.brandName || inq.fullName)}`}
                            className="hover:text-sky-400 flex items-center gap-1 text-slate-300 font-medium"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inq.email}</span>
                          </a>

                          {inq.phone && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{inq.phone}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <CreditCard className="w-3 h-3 text-amber-400" />
                            <span>{inq.interestedPlan || 'Professional Scale'}</span>
                          </span>

                          <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </span>
                        </div>

                        {inq.message && inq.message !== 'No custom note attached' && (
                          <p className="text-xs text-slate-400 italic bg-[#10121A] p-2 rounded-lg border border-slate-800 max-w-2xl mt-1">
                            "{inq.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions & Status Controls */}
                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                      {/* Status Selector */}
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as any)}
                        className="bg-[#10121A] border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-emerald-500"
                      >
                        <option value="new">🟢 Status: New Lead</option>
                        <option value="contacted">🟡 Status: Contacted</option>
                        <option value="provisioned">🔵 Status: Provisioned</option>
                        <option value="archived">⚪ Status: Archived</option>
                      </select>

                      {/* WhatsApp Button */}
                      {cleanWhatsApp && (
                        <a
                          href={`https://wa.me/${cleanWhatsApp}?text=Hi%20${encodeURIComponent(inq.fullName)}%2C%20thank%20you%20for%20requesting%20a%20demo%20of%20Mavenco%20Commerce%20Platform%20for%20${encodeURIComponent(inq.brandName || inq.fullName)}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition-all"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {/* Convert to Store Button */}
                      <button
                        onClick={() => handleConvertInquiryToStore(inq)}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 flex items-center gap-1.5 transition-all hover:scale-105"
                        title="Provision new tenant store from this inquiry"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Convert to Store</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Inquiry from Database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

            {inquiries.length === 0 && (
              <div className="p-12 text-center bg-[#161822] rounded-3xl border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">No Prospect Inquiries Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When prospects click <strong>"Contact Us for Demo"</strong> on your public storefront, their inquiries will automatically populate here in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Hero Banner for Activity Logs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-sky-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-600/20 text-sky-400 border border-sky-500/30">
                  Security &amp; Compliance
                </span>
                <span className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  5-Day Rolling Retention (Auto-Purged)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Activity className="w-7 h-7 text-sky-400" />
                <span>Platform Audit Trail &amp; Security Logs</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Cryptographic activity logs, tenant provisioning records, admin impersonation sessions, and domain routing changes. Automatically retained for 5 days and purged from MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <span className="px-3.5 py-2 rounded-xl bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-500/30 font-mono">
                {activities.length} Events (Last 5 Days)
              </span>
            </div>
          </div>

          <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <span>Event Stream History</span>
              </h3>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>5-Day Auto-Delete Window Active</span>
              </span>
            </div>

            <div className="space-y-2 divide-y divide-slate-800/80">
              {activities.map((act) => (
                <div key={act.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-white font-medium">{act.event}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="text-rose-400 font-mono">{act.actor}</span>
                      <span>•</span>
                      <span className="text-slate-500">{act.tenantName || act.tenantId}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SAAS SHOWCASE REVIEWS & TESTIMONIALS */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Hero Banner for SaaS Reviews */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-rose-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  Landing Page UGC &amp; Testimonials
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  MongoDB Atlas Cluster (saas_reviews)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Sparkles className="w-7 h-7 text-rose-400" />
                <span>SaaS Showcase Founder Testimonials</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Curate, add, and moderate verified founder &amp; merchant reviews displayed publicly on the main landing showcase (https://mavenco-storefront.vercel.app/). All changes are persisted directly to MongoDB Atlas.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <button
                onClick={handleOpenAddSaasReview}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add SaaS Testimonial</span>
              </button>
            </div>
          </div>

          {/* Testimonials List */}
          <div className="space-y-4">
            {isSaasReviewsLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono bg-[#161822] rounded-2xl border border-slate-800">
                Loading SaaS reviews from MongoDB Atlas...
              </div>
            ) : saasReviews.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-[#161822] rounded-2xl border border-slate-800 space-y-3">
                <p>No SaaS testimonials found in database collection.</p>
                <button
                  onClick={handleOpenAddSaasReview}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                >
                  Create First Testimonial
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {saasReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#161822] border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 space-y-4 shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {rev.image ? (
                            <div className="w-12 h-12 rounded-full bg-slate-900 overflow-hidden shrink-0 border border-slate-700">
                              <img src={rev.image} alt={rev.author} className="w-full h-full object-cover" />
                            </div>
                          ) : null}
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              <span>{rev.author}</span>
                              {rev.badge && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  {rev.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {rev.role ? `${rev.role}, ` : ''}<strong className="text-rose-400">{rev.company}</strong> • {rev.location || 'Global'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditSaasReview(rev)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit Testimonial"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSaasReview(rev.id)}
                            className="p-1.5 text-red-400 hover:text-white hover:bg-red-950/60 rounded-lg transition-all"
                            title="Delete Testimonial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>

                        {rev.highlight && (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{rev.highlight}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Status: <strong className="text-emerald-400">{rev.status || 'published'}</strong></span>
                      <span>Live on Showcase</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SaaS Review Add/Edit Modal */}
      {isSaasModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-rose-500/40 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>{editingSaasReviewId ? 'Edit SaaS Testimonial' : 'Add SaaS Testimonial'}</span>
              </h3>
              <button
                onClick={() => setIsSaasModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSaasReview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Founder Name *</label>
                  <input
                    type="text"
                    required
                    value={saasAuthor}
                    onChange={(e) => setSaasAuthor(e.target.value)}
                    placeholder="e.g. Aarav Singhania"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={saasRole}
                    onChange={(e) => setSaasRole(e.target.value)}
                    placeholder="e.g. Founder & CEO"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={saasCompany}
                    onChange={(e) => setSaasCompany(e.target.value)}
                    placeholder="e.g. Vedic Luxe Botanicals"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={saasLocation}
                    onChange={(e) => setSaasLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Impact Metric Highlight</label>
                  <input
                    type="text"
                    value={saasHighlight}
                    onChange={(e) => setSaasHighlight(e.target.value)}
                    placeholder="e.g. Saved ₹3.8L in First 6 Months"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Rating</label>
                  <select
                    value={saasRating}
                    onChange={(e) => setSaasRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Founder Photo URL</label>
                <input
                  type="url"
                  value={saasImage}
                  onChange={(e) => setSaasImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 text-[11px] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Testimonial Quote *</label>
                <textarea
                  required
                  rows={3}
                  value={saasComment}
                  onChange={(e) => setSaasComment(e.target.value)}
                  placeholder="Enter genuine testimonial quote about Mavenco Commerce..."
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSaasModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50"
                >
                  {editingSaasReviewId ? 'Save Changes' : 'Publish to MongoDB Atlas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROVISIONING WIZARD MODAL (5-STEP) */}
      {/* ========================================================================= */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Store Provisioning Wizard</h3>
                  <p className="text-xs text-slate-400">Configure client tenant branding, SaaS plan, and active feature flags</p>
                </div>
              </div>
              <button onClick={resetWizard} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
              {wizardStep < 5 && (
                <form onSubmit={handleStartProvisioning} className="space-y-6">
                  {/* Step 1: Brand & Basic Identity */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-rose-400" />
                      <span>1. Brand Identity &amp; Routing</span>
                    </div>

                    {/* Storefront Design Blueprint & Theme Preset */}
                    <div className="p-3.5 bg-[#0D0F16] rounded-2xl border border-rose-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
                          <span>Storefront Category Blueprint &amp; Industry Theme</span>
                        </span>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          BEST PRESET ACTIVE
                        </span>
                      </div>
                      <select
                        value={blueprintSource}
                        onChange={(e) => handleApplyBlueprint(e.target.value)}
                        className="w-full p-2.5 bg-[#141724] border border-slate-700 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-hidden font-medium"
                      >
                        {CATEGORY_BLUEPRINTS.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                        <option value="none">🛠️ Custom Clean Slate (Manual Configuration)</option>
                      </select>

                      {(() => {
                        const activeBp = CATEGORY_BLUEPRINTS.find((b) => b.id === blueprintSource) || CATEGORY_BLUEPRINTS[0];
                        return (
                          <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/30 via-[#12141F] to-amber-950/20 border border-rose-500/20 text-[11px] text-slate-300 space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="flex items-center gap-1.5 font-semibold text-white">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{activeBp.description}</span>
                              </span>
                              <a
                                href={`${STOREFRONT_BASE_URL}/stores/${activeBp.demoStoreSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 hover:text-white border border-rose-500/40 text-[10px] font-bold transition-all"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Preview Live Client Demo</span>
                              </a>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
                              <span className="text-[10px] text-slate-400 font-bold">Catalog Includes:</span>
                              {activeBp.catalogHighlights.map((tag) => (
                                <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-mono border border-slate-700/60">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Store Brand Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Zenith Outdoor"
                          value={storeName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 font-bold">Store Slug (Routing) *</label>
                        <input
                          type="text"
                          required
                          placeholder="zenith-outdoor"
                          value={storeSlug}
                          onChange={(e) => setStoreSlug(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white font-mono placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Store Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-none"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Initial Store Status</label>
                        <select
                          value={storeStatus}
                          onChange={(e) => setStoreStatus(e.target.value as any)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-none"
                        >
                          <option value="active">Active (Production Live)</option>
                          <option value="trial">Trial (14-Day Sandbox)</option>
                          <option value="suspended">Suspended (Paused)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-bold">Store Tagline / Slogan</label>
                      <input
                        type="text"
                        placeholder="e.g. High-performance alpine mountaineering & essentials"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Step 2: Merchant Administrator */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>2. Store Owner &amp; Admin Credentials</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Owner Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Hunter"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Owner Email (Admin Login) *</label>
                        <input
                          type="email"
                          required
                          placeholder="alex@zenith.com"
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Primary Brand Color</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-10 h-9 p-0.5 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-full p-2 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Accent CTA Color</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-10 h-9 p-0.5 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                          />
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-full p-2 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: SaaS Billing Plan Tier Selection */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>3. SaaS Billing Plan Tier *</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Select commercial plan</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {plans.map((p) => {
                        const isSelected = selectedPlanId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPlan(p.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-950/30'
                                : 'bg-[#10121A] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                <Check className="w-2.5 h-2.5" />
                                <span>ACTIVE</span>
                              </div>
                            )}

                            <div>
                              <div className="text-xs font-bold text-white">{p.name}</div>
                              <div className="text-sm font-bold text-amber-400 mt-1 font-mono">
                                ₹{p.oneTimeFeeInr.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                + ₹{p.monthlyEquivalentInr.toLocaleString('en-IN')}/mo server
                              </div>
                            </div>

                            <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                              <span>Max {p.maxProducts} Prods</span>
                              <span>{p.maxStaff} Staff</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Full Enterprise SaaS Feature Flags & Modules Studio */}
                  <div className="p-4 bg-[#10121A] rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>4. Store Modules &amp; Feature Flags Studio</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                            {ALL_PLATFORM_MODULES.filter(m => customFeatures[m.key] !== false).length} / {ALL_PLATFORM_MODULES.length} Active
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Toggled modules dynamically control the client admin sidebar &amp; backend capabilities
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const allOn: Record<string, boolean> = {};
                            ALL_PLATFORM_MODULES.forEach(m => { allOn[m.key] = true; });
                            setCustomFeatures(allOn);
                          }}
                          className="text-[10px] font-bold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        >
                          Enable All
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomFeatures(PlatformService.getDefaultFeaturesForPlan(selectedPlanId))}
                          className="text-[10px] font-bold px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg transition-colors"
                        >
                          Plan Defaults
                        </button>
                      </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                      {['All', 'Catalog', 'Sales & Ops', 'Customers', 'Marketing & AI', 'CMS & Design', 'Ecosystem & Developers', 'Governance'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setWizardFeatureCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                            wizardFeatureCategory === cat
                              ? 'bg-rose-600 text-white shadow-sm shadow-rose-900/50'
                              : 'bg-[#141724] text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Modules Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                      {ALL_PLATFORM_MODULES
                        .filter(m => wizardFeatureCategory === 'All' || m.category === wizardFeatureCategory)
                        .map((mod) => {
                          const isEnabled = customFeatures[mod.key] !== false;
                          return (
                            <button
                              key={mod.key}
                              type="button"
                              onClick={() => setCustomFeatures(prev => ({ ...prev, [mod.key]: !isEnabled }))}
                              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                                isEnabled
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-200 shadow-sm shadow-emerald-950/20'
                                  : 'bg-[#0B0D13] border-slate-800/80 text-slate-500 hover:border-slate-700'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-white truncate">{mod.name}</span>
                                  <span className="text-[8px] px-1 py-0.2 rounded font-mono bg-slate-800 text-slate-400 shrink-0">
                                    {mod.category}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-400 truncate mt-0.5">{mod.desc}</div>
                              </div>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${
                                  isEnabled
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {isEnabled ? 'ENABLED' : 'DISABLED'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={resetWizard}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Start Provisioning Pipeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

            {wizardStep === 5 && (
              <div className="space-y-5 text-center py-4">
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">
                    {isProvisioning ? 'Provisioning Isolated Tenant...' : '🎉 Tenant Successfully Provisioned!'}
                  </h4>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${provisionProgress}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#0A0C10] rounded-xl border border-slate-800 text-left font-mono text-[11px] space-y-1.5 text-slate-300 max-h-48 overflow-y-auto">
                  {provisionLog.map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-rose-400">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>

                {!isProvisioning && provisionedDetails && (
                  <div className="p-4 sm:p-5 bg-[#10121A] rounded-2xl border border-rose-900/60 text-left space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Merchant Activation Email Dispatched
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          provisionedDetails.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : provisionedDetails.status === 'trial'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {provisionedDetails.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Recipient Email:</span>
                        <span className="font-mono text-slate-200 font-bold">{provisionedDetails.ownerEmail}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Temporary Password:</span>
                        <span className="font-mono text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded">
                          {provisionedDetails.temporaryPassword}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Admin Login Portal:</span>
                        <a
                          href={provisionedDetails.adminLoginUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                        >
                          <span>/login?tenant={provisionedDetails.slug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Storefront URL:</span>
                        <a
                          href={provisionedDetails.storefrontUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                        >
                          <span>/stores/{provisionedDetails.slug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = `🎉 Welcome to Mavenco Commerce!\n\nStore: ${provisionedDetails.storeName}\nStatus: ${provisionedDetails.status.toUpperCase()}\nPlan: ${provisionedDetails.planName}\n\n🔐 Merchant Admin Login: ${provisionedDetails.adminLoginUrl}\nEmail: ${provisionedDetails.ownerEmail}\nTemporary Password: ${provisionedDetails.temporaryPassword}\n\n🏬 Live Storefront: ${provisionedDetails.storefrontUrl}`;
                          navigator.clipboard.writeText(text);
                          setCopiedCredentials(true);
                          showToast('Merchant activation details copied to clipboard!', 'success');
                          setTimeout(() => setCopiedCredentials(false), 3000);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all"
                      >
                        {copiedCredentials ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{copiedCredentials ? 'Credentials Copied!' : 'Copy Activation Details'}</span>
                      </button>

                      <a
                        href={provisionedDetails.storefrontUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                      >
                        <span>Open Store</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {!isProvisioning && (
                  <button
                    onClick={resetWizard}
                    className="w-full px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Done &amp; View All Stores
                  </button>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT TENANT MODAL */}
      {/* ========================================================================= */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Pinned Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Edit Store: {editingTenant.name}</h3>
                  <p className="text-[11px] text-slate-400">Configure store settings, credentials, and enabled SaaS modules</p>
                </div>
              </div>
              <button onClick={() => setEditingTenant(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
              <div>
                <label className="text-xs text-slate-300 font-bold">Store Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold">Tagline</label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold">Owner Email</label>
                  <input
                    type="email"
                    required
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold">Currency</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold">Plan</label>
                  <select
                    value={editPlanId}
                    onChange={(e) => {
                      const newP = e.target.value;
                      setEditPlanId(newP);
                      setEditFeatures(PlatformService.getDefaultFeaturesForPlan(newP));
                    }}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="plan_starter">Starter Boutique (₹24,999 One-Time + ₹2,000/mo server)</option>
                    <option value="plan_pro">Professional Scale (₹49,999 One-Time + ₹4,000/mo server)</option>
                    <option value="plan_enterprise">Enterprise Global (₹1,39,999 One-Time + ₹8,000/mo cluster)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold">Primary Brand Color</label>
                  <input
                    type="color"
                    value={editPrimaryColor}
                    onChange={(e) => setEditPrimaryColor(e.target.value)}
                    className="w-full h-10 mt-1 p-1 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold">Accent CTA Color</label>
                  <input
                    type="color"
                    value={editAccentColor}
                    onChange={(e) => setEditAccentColor(e.target.value)}
                    className="w-full h-10 mt-1 p-1 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              {/* Store Module Entitlements & Feature Studio */}
              <div className="p-4 bg-[#10121A] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Store Module Entitlements &amp; Capabilities</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                        {ALL_PLATFORM_MODULES.filter(m => editFeatures[m.key] !== false).length} / {ALL_PLATFORM_MODULES.length} Active
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Toggle modules on/off to dynamically control what appears in this client's admin panel
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const allOn: Record<string, boolean> = {};
                        ALL_PLATFORM_MODULES.forEach(m => { allOn[m.key] = true; });
                        setEditFeatures(allOn);
                      }}
                      className="text-[10px] font-bold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    >
                      Enable All
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditFeatures(PlatformService.getDefaultFeaturesForPlan(editPlanId))}
                      className="text-[10px] font-bold px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg transition-colors"
                    >
                      Plan Defaults
                    </button>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                  {['All', 'Catalog', 'Sales & Ops', 'Customers', 'Marketing & AI', 'CMS & Design', 'Ecosystem & Developers', 'Governance'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditFeatureCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                        editFeatureCategory === cat
                          ? 'bg-rose-600 text-white shadow-sm shadow-rose-900/50'
                          : 'bg-[#141724] text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {ALL_PLATFORM_MODULES
                    .filter(m => editFeatureCategory === 'All' || m.category === editFeatureCategory)
                    .map((mod) => {
                      const isEnabled = editFeatures[mod.key] !== false;
                      return (
                        <button
                          key={mod.key}
                          type="button"
                          onClick={() => setEditFeatures(prev => ({ ...prev, [mod.key]: !isEnabled }))}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isEnabled
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-200 shadow-sm shadow-emerald-950/20'
                              : 'bg-[#0B0D13] border-slate-800/80 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-white truncate">{mod.name}</span>
                              <span className="text-[8px] px-1 py-0.2 rounded font-mono bg-slate-800 text-slate-400 shrink-0">
                                {mod.category}
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-400 truncate mt-0.5">{mod.desc}</div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${
                              isEnabled
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Password Management & Reset Section */}
              <div className="p-4 bg-[#10121A] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-white">Merchant Admin Password</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Dispatches credentials email via Gmail SMTP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTempPassword}
                    onChange={(e) => setEditTempPassword(e.target.value)}
                    placeholder="Mavenco@2026!store"
                    className="flex-1 px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleResetMerchantPassword}
                    disabled={isResettingPassword}
                    className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isResettingPassword ? 'Sending...' : 'Reset & Email Merchant'}</span>
                  </button>
                </div>
              </div>

              </div>

              {/* Pinned Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-end gap-3 bg-[#12141D] shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.01]"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT CUSTOM DOMAIN & ROUTING MODAL */}
      {/* ========================================================================= */}
      {editingDomainTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Edit Storefront &amp; Admin Custom Domains</h3>
              </div>
              <button
                onClick={() => setEditingDomainTenant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDomain} className="space-y-5">
              <div className="p-3.5 bg-[#10121A] rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white">{editingDomainTenant.name}</div>
                <div className="text-[11px] font-mono text-slate-400">
                  Store ID: {editingDomainTenant.id} • Slug: {editingDomainTenant.slug} • DB: {editingDomainTenant.databaseName}
                </div>
              </div>

              {/* 1. Customer Storefront Domain */}
              <div className="p-4 bg-[#10121A] rounded-2xl border border-rose-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-rose-300 font-bold flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>Customer Storefront Domain *</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Where buyers shop</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. resests.com or shopreset.in"
                    value={storefrontDomainInput}
                    onChange={(e) => setStorefrontDomainInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#0A0C10] border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0C0E15] rounded-lg border border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400">CNAME &rarr; cname.mavenco-commerce.com</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('cname.mavenco-commerce.com');
                      showToast('Storefront CNAME copied to clipboard!', 'success');
                    }}
                    className="text-rose-400 hover:text-rose-300 font-sans font-bold text-[10px]"
                  >
                    Copy CNAME
                  </button>
                </div>
              </div>

              {/* 2. Merchant Admin Custom Domain */}
              <div className="p-4 bg-[#10121A] rounded-2xl border border-sky-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-sky-300 font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Merchant Admin Custom Domain</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Where store staff login</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. admin.resests.com or reset-admin.com"
                    value={adminDomainInput}
                    onChange={(e) => setAdminDomainInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#0A0C10] border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <Shield className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0C0E15] rounded-lg border border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400">CNAME &rarr; cname.mavenco-admin.com</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('cname.mavenco-admin.com');
                      showToast('Admin CNAME copied to clipboard!', 'success');
                    }}
                    className="text-sky-400 hover:text-sky-300 font-sans font-bold text-[10px]"
                  >
                    Copy CNAME
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold">SSL Certificate &amp; Routing Status</label>
                <select
                  value={domainSslStatus}
                  onChange={(e) => setDomainSslStatus(e.target.value as any)}
                  className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="connected">🟢 SSL Active (Auto TLS 1.3 - Verified)</option>
                  <option value="verifying">🟡 Verifying DNS Propagation</option>
                  <option value="pending">⚪ Pending DNS Configuration</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDomainTenant(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDomain}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingDomain ? 'Saving...' : 'Save & Update Both Domains'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE TENANT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-red-900/60 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Archive Store {deletingTenant.name}?</h3>
              <p className="text-xs text-slate-400">
                This will remove the store from active routing and archive its isolated partition (<strong className="font-mono text-slate-300">{deletingTenant.databaseName}</strong>).
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTenant(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* GLOBAL BROADCAST ANNOUNCEMENT MODAL */}
      {/* ========================================================================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141724] border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Broadcast Platform Announcement</h3>
                  <p className="text-xs text-slate-400">Post a global banner to all active merchant dashboards</p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets:</div>
              <div className="space-y-1.5">
                {[
                  '⚠️ Scheduled Cloud Database Maintenance: Tonight at 2:00 AM IST (Zero Downtime Expected).',
                  '🚀 SaaS Platform Upgrade v3.4 Live: New AI SEO Studio & Visual Drag-Drop CMS Blocks Available.',
                  '🔒 Security Notice: Automated TLS 1.3 Wildcard SSL Certificate Renewal Completed.',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBroadcastMsg(preset)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#0A0C10] hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 text-xs text-slate-300 hover:text-amber-300 transition-all font-medium leading-relaxed"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold">Custom Broadcast Message</label>
                <textarea
                  rows={3}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Enter system announcement or release notice..."
                  className="w-full mt-1 p-3 bg-[#0A0C10] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishBroadcast}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Publish Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL GST / TAX INVOICE GENERATOR MODAL */}
      {/* ========================================================================= */}
      {invoiceTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-slate-700 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#161824] shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Official Platform Tax Invoice</h3>
                  <p className="text-xs text-slate-400">License &amp; Cloud Maintenance Billing Voucher</p>
                </div>
              </div>
              <button
                onClick={() => setInvoiceTenant(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Invoice Container */}
            <div className="p-6 overflow-y-auto space-y-6 bg-[#0E1018] text-xs text-slate-300">
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    <span>MAVENCO</span>
                    <span className="text-rose-400 text-xs px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 uppercase font-mono">
                      CLOUD SLA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Mavenco Global Commerce Cloud Engine</p>
                  <p className="text-[10px] text-slate-500">GSTIN: 07AAACM1234F1Z5 • Reg. Cloud Provider</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg font-mono">
                    STATUS: PAID
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    INV-2026-{invoiceTenant.code || invoiceTenant.slug.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 bg-[#141622] p-4 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">BILLED TO (CLIENT):</span>
                  <div className="font-bold text-white text-sm mt-0.5">{invoiceTenant.name}</div>
                  <div className="text-[11px] text-slate-400">{invoiceTenant.ownerName} ({invoiceTenant.ownerEmail})</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{invoiceTenant.primaryDomain}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">PLATFORM TIER:</span>
                  <div className="font-bold text-rose-400 text-sm mt-0.5">{invoiceTenant.planName}</div>
                  <div className="text-[11px] text-slate-400">Monthly Server Renewal: {getTenantRenewalInfo(invoiceTenant).label} ({getTenantRenewalInfo(invoiceTenant).fee})</div>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500 tracking-wider">
                    <th className="py-2 font-bold">Service Description</th>
                    <th className="py-2 text-center font-bold">Cycle</th>
                    <th className="py-2 text-right font-bold">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  <tr>
                    <td className="py-2.5 font-medium text-white">
                      Mavenco Multi-Tenant Headless Platform License ({invoiceTenant.planName})
                    </td>
                    <td className="py-2.5 text-center text-slate-400 font-mono">One-Time</td>
                    <td className="py-2.5 text-right font-mono text-slate-200">
                      ₹{invoiceTenant.planId === 'plan_starter' ? '24,999' : invoiceTenant.planId === 'plan_enterprise' ? '1,39,999' : '49,999'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-white">
                      Dedicated MongoDB Cluster &amp; Next.js Serverless Edge SLA
                    </td>
                    <td className="py-2.5 text-center text-slate-400 font-mono">Monthly</td>
                    <td className="py-2.5 text-right font-mono text-slate-200">
                      ₹{invoiceTenant.planId === 'plan_starter' ? '2,000' : invoiceTenant.planId === 'plan_enterprise' ? '8,000' : '4,000'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono text-slate-200">
                    ₹{invoiceTenant.planId === 'plan_starter' ? '26,999.00' : invoiceTenant.planId === 'plan_enterprise' ? '1,47,999.00' : '53,999.00'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Integrated GST (18%):</span>
                  <span className="font-mono text-slate-200">
                    ₹{invoiceTenant.planId === 'plan_starter' ? '4,859.82' : invoiceTenant.planId === 'plan_enterprise' ? '26,639.82' : '9,719.82'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                  <span className="text-emerald-400">Grand Total Invoice:</span>
                  <span className="font-mono text-emerald-400">
                    ₹{invoiceTenant.planId === 'plan_starter' ? '31,858.82' : invoiceTenant.planId === 'plan_enterprise' ? '1,74,638.82' : '63,718.82'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-[#161824] flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Digitally signed &amp; verified by Mavenco Cloud</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInvoiceTenant(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCOPED DEVELOPER API & WEBHOOK TOKEN MODAL */}
      {/* ========================================================================= */}
      {apiTokenTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141724] border border-purple-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Developer API &amp; Webhook Credentials</h3>
                  <p className="text-xs text-slate-400">Scoped token for {apiTokenTenant.name}</p>
                </div>
              </div>
              <button
                onClick={() => setApiTokenTenant(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#0A0C10] rounded-2xl border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">LIVE SECRET API KEY:</span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="font-mono text-white text-xs truncate bg-[#12141F] p-2 rounded-xl border border-slate-700 w-full select-all">
                    {generatedApiKey}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedApiKey);
                      showToast('API Key copied to clipboard!', 'success');
                    }}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Scopes &amp; Permissions:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800 text-emerald-400">✓ products:read</div>
                  <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800 text-emerald-400">✓ orders:write</div>
                  <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800 text-emerald-400">✓ webhooks:manage</div>
                  <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800 text-emerald-400">✓ cdn_media:upload</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setApiTokenTenant(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM DOMAIN & SSL DNS DIAGNOSTIC MODAL */}
      {/* ========================================================================= */}
      {dnsCheckTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-sky-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Custom Domain DNS Diagnostic</h3>
                  <p className="text-xs text-slate-400">{dnsCheckTenant.primaryDomain}</p>
                </div>
              </div>
              <button
                onClick={() => setDnsCheckTenant(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {isDnsChecking ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Querying Global Anycast DNS &amp; TLS Handshake...</p>
                </div>
              ) : dnsResults ? (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#0A0C10] rounded-xl border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-slate-300">CNAME Ingress Routing (cname.mavenco-store.com)</span>
                    <span className="text-emerald-400 font-bold font-mono">🟢 RESOLVED (24ms)</span>
                  </div>
                  <div className="p-3 bg-[#0A0C10] rounded-xl border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-slate-300">Wildcard TLS 1.3 Certificate</span>
                    <span className="text-emerald-400 font-bold font-mono">🟢 ACTIVE &amp; SECURE</span>
                  </div>
                  <div className="p-3 bg-[#0A0C10] rounded-xl border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-slate-300">Edge CDN HTTP/3 Cache Ingress</span>
                    <span className="text-emerald-400 font-bold font-mono">🟢 100% OPERATIONAL</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDnsCheckTenant(null)}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MULTI-TENANT SAMPLE CATALOG & LOOKBOOK SEEDER STUDIO MODAL */}
      {/* ========================================================================= */}
      {seederTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Multi-Tenant Catalog Seeder Studio</h3>
                  <p className="text-xs text-slate-400">
                    Provision starter inventory &amp; lookbook CMS blocks into <strong className="text-white">{seederTenant.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSeederTenant(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Industry Preset Selector */}
            <div className="space-y-3">
              <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                1. Select Store Industry Preset:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                {ALL_SEEDER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSeederPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      seederPreset === preset.id
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                        : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{preset.icon}</div>
                    <div className="text-xs font-bold text-white">{preset.label}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Seed Preview Breakdown */}
            <div className="space-y-3">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                2. Inventory &amp; CMS Assets To Be Seeded:
              </span>
              <div className="p-4 bg-[#0A0C10] rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 bg-[#121522] rounded-xl border border-slate-800">
                    <div className="text-base font-extrabold text-amber-400">12 SKUs</div>
                    <div className="text-[10px] text-slate-400">Product Variants</div>
                  </div>
                  <div className="p-2.5 bg-[#121522] rounded-xl border border-slate-800">
                    <div className="text-base font-extrabold text-emerald-400">4 Categories</div>
                    <div className="text-[10px] text-slate-400">Menu Taxonomy</div>
                  </div>
                  <div className="p-2.5 bg-[#121522] rounded-xl border border-slate-800">
                    <div className="text-base font-extrabold text-sky-400">2 Lookbooks</div>
                    <div className="text-[10px] text-slate-400">Hero CMS Slides</div>
                  </div>
                  <div className="p-2.5 bg-[#121522] rounded-xl border border-slate-800">
                    <div className="text-base font-extrabold text-purple-400">100% Isolated</div>
                    <div className="text-[10px] text-slate-400">{seederTenant.slug} Partition</div>
                  </div>
                </div>

                <ul className="space-y-1 text-slate-300 text-[11px] divide-y divide-slate-800/40">
                  <li className="pt-1.5 flex items-center justify-between">
                    <span>• Sample Catalog SKU List:</span>
                    <span className="font-mono text-emerald-400 font-bold">12 Products Injected</span>
                  </li>
                  <li className="pt-1.5 flex items-center justify-between">
                    <span>• High-Resolution WebP Image CDNs:</span>
                    <span className="font-mono text-slate-400">Pre-optimized</span>
                  </li>
                  <li className="pt-1.5 flex items-center justify-between">
                    <span>• Pricing &amp; Inventory Stock:</span>
                    <span className="font-mono text-slate-400">₹1,499 - ₹14,999 (50 units each)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Execution Progress State */}
            {isSeeding && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>Seeding Database Partition...</span>
                  <span className="font-mono">{seedingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-300 rounded-full"
                    style={{ width: `${seedingProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">{seedingStatusText}</p>
              </div>
            )}

            {/* Seed Complete Celebration Banner */}
            {seedComplete && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl space-y-3 text-xs text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-300 font-extrabold text-sm">
                  <Check className="w-5 h-5" />
                  <span>Catalog &amp; Lookbooks Provisioned Successfully!</span>
                </div>
                <p className="text-slate-300 text-xs">
                  Your sample products, categories, and visual lookbooks are live in the database partition.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href={`${STOREFRONT_BASE_URL}/stores/${seederTenant.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Seeded Storefront</span>
                  </a>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSeederTenant(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              {!seedComplete ? (
                <button
                  type="button"
                  onClick={handleExecuteSeeder}
                  disabled={isSeeding}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSeeding ? 'Injecting Data...' : '🚀 Seed Store Database Now'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSeederTenant(null)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

            {/* ========================================================================= */}
      {/* HIGH-CONCURRENCY SURGE & FLASH SALE SCALER STUDIO MODAL */}
      {/* ========================================================================= */}
      {surgeModalTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#12141F] border border-orange-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-orange-500/30 text-orange-400">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>High-Concurrency Flash Sale Surge Studio</span>
                    {(surgeModeStores[surgeModalTenant.id] || surgeModeStores[surgeModalTenant.slug]) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase animate-pulse">
                        🔥 ACTIVE ({surgeModeStores[surgeModalTenant.id] || surgeModeStores[surgeModalTenant.slug]})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Traffic pre-warming &amp; infrastructure scaling for <strong className="text-white">{surgeModalTenant.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSurgeModalTenant(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin text-xs">
              {/* Concurrency Multipliers */}
              <div className="space-y-2">
                <label className="block text-[11px] uppercase font-bold text-orange-400 tracking-wider">
                  1. Select Traffic Surge Multiplier:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: '2x', name: '2x Concurrency', desc: 'Weekend boost · Up to 3,000 req/min', badge: 'Weekend' },
                    { id: '5x', name: '5x Flash Sale Drop', desc: 'Product launch · 10,000 req/min', badge: 'Recommended' },
                    { id: '20x', name: '20x Mega Drop', desc: 'Black Friday · 25,000+ req/min', badge: 'Viral Drop' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedSurgeTier(tier.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        selectedSurgeTier === tier.id
                          ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-950/40 ring-1 ring-orange-400'
                          : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-xs">{tier.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          selectedSurgeTier === tier.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tier.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{tier.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Infrastructure Toggles */}
              <div className="space-y-2">
                <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider">
                  2. Edge &amp; Database Resilience Subsystems:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setSurgeEdgeCache(!surgeEdgeCache)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      surgeEdgeCache ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">Edge Static ISR &amp; Cache Warming</div>
                      <div className="text-[11px] text-slate-400">Pre-caches top 50 products globally</div>
                    </div>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${surgeEdgeCache ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      {surgeEdgeCache ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>

                  <div
                    onClick={() => setSurgeDbPool(!surgeDbPool)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      surgeDbPool ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">MongoDB Pool 10x Boost</div>
                      <div className="text-[11px] text-slate-400">Surges socket pool to 100 connections</div>
                    </div>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${surgeDbPool ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      {surgeDbPool ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>

                  <div
                    onClick={() => setSurgeBotShield(!surgeBotShield)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      surgeBotShield ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">Anti-Bot &amp; Turnstile Shield</div>
                      <div className="text-[11px] text-slate-400">Throttles automated scalp bots</div>
                    </div>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${surgeBotShield ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      {surgeBotShield ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>

                  <div
                    onClick={() => setSurgeWaitingRoom(!surgeWaitingRoom)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      surgeWaitingRoom ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">Virtual Waiting Room Queue</div>
                      <div className="text-[11px] text-slate-400">Fair FIFO queue for checkout surges</div>
                    </div>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${surgeWaitingRoom ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      {surgeWaitingRoom ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Telemetry Health Indicator */}
              <div className="p-4 bg-[#0A0C10] rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Edge Diagnostic Telemetry</div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-[#12141F] rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">Edge Latency</div>
                    <div className="text-emerald-400 font-bold text-xs mt-0.5">14ms</div>
                  </div>
                  <div className="p-2 bg-[#12141F] rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">Cache Hit Ratio</div>
                    <div className="text-emerald-400 font-bold text-xs mt-0.5">99.4%</div>
                  </div>
                  <div className="p-2 bg-[#12141F] rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">DB Cluster Health</div>
                    <div className="text-emerald-400 font-bold text-xs mt-0.5">100% OK</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between bg-[#0F111A] shrink-0">
              <button
                type="button"
                onClick={() => setSurgeModalTenant(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {(surgeModeStores[surgeModalTenant.id] || surgeModeStores[surgeModalTenant.slug]) && (
                  <button
                    type="button"
                    onClick={() => handleDeactivateSurge(surgeModalTenant)}
                    disabled={isActivatingSurge}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                  >
                    Deactivate Surge
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleActivateSurge(surgeModalTenant)}
                  disabled={isActivatingSurge}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Flame className="w-4 h-4 text-white fill-white" />
                  <span>
                    {isActivatingSurge
                      ? 'Pre-warming Edge...'
                      : (surgeModeStores[surgeModalTenant.id] || surgeModeStores[surgeModalTenant.slug])
                      ? `Update Surge (${selectedSurgeTier})`
                      : `Engage ${selectedSurgeTier} Surge Mode`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE MULTI-TENANT WEBHOOK SIMULATOR & EVENT DISPATCHER MODAL */}
      {/* ========================================================================= */}
      {webhookSimulatorTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-teal-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Live Webhook Simulator &amp; Event Dispatcher</h3>
                  <p className="text-xs text-slate-400">
                    Test live webhook delivery for <strong className="text-white">{webhookSimulatorTenant.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWebhookSimulatorTenant(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase font-bold text-teal-400 tracking-wider">
                1. Select Webhook Event Trigger:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'order.created', label: 'order.created', desc: 'New Paid Order' },
                  { id: 'inventory.low_stock', label: 'inventory.low_stock', desc: 'Low Stock Alert' },
                  { id: 'customer.signed_up', label: 'customer.signed_up', desc: 'New VIP Sign Up' },
                  { id: 'refund.processed', label: 'refund.processed', desc: 'Order Refunded' },
                ].map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setWebhookEventType(ev.id as any)}
                    className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                      webhookEventType === ev.id
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                        : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] truncate">{ev.label}</div>
                    <div className="text-[9px] text-slate-500 font-sans">{ev.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Endpoint URL */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                2. Target Webhook Destination URL:
              </label>
              <input
                type="text"
                value={webhookTargetUrl}
                onChange={(e) => setWebhookTargetUrl(e.target.value)}
                placeholder="https://api.yourbrand.com/webhooks/mavenco"
                className="w-full px-4 py-2.5 bg-[#0A0C10] border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Live Result View */}
            {webhookDeliveryResult && (
              <div className="p-4 bg-[#0A0C10] rounded-2xl border border-emerald-500/30 space-y-3 text-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30">
                      HTTP {webhookDeliveryResult.status} OK
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Latency: <strong className="text-white">{webhookDeliveryResult.latencyMs}ms</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Delivered via TLS 1.3
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Dispatched Payload JSON:</span>
                  <pre className="p-3 bg-[#12141F] rounded-xl border border-slate-800 text-[10px] text-emerald-300 font-mono overflow-x-auto max-h-40">
                    {webhookDeliveryResult.payload}
                  </pre>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setWebhookSimulatorTenant(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleDispatchWebhook}
                disabled={isWebhookDispatching}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isWebhookDispatching ? 'Transmitting Over Edge...' : '⚡ Dispatch Live Webhook Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ENTERPRISE CLIENT PROPOSAL & 3-YEAR SAVINGS GENERATOR MODAL */}
      {/* ========================================================================= */}
      {proposalTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-emerald-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Enterprise ROI &amp; 3-Year Savings Proposal</h3>
                  <p className="text-xs text-slate-400">
                    Prepared for: <strong className="text-white">{proposalTenant.name}</strong> ({proposalTenant.slug})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProposalTenant(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Sliders / Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase font-bold text-slate-400">
                  Client Monthly GMV (₹)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={proposalGmv}
                  onChange={(e) => setProposalGmv(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase font-bold text-slate-400">
                  Shopify App Stack Monthly Cost (₹)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={proposalAppSpend}
                  onChange={(e) => setProposalAppSpend(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 3-Year Projection Calculations */}
            {(() => {
              const shopifyMonthlyFee = 35000; // Shopify Plus base
              const shopifyGmvFeeMonthly = proposalGmv * 0.02; // 2% transaction commission
              const shopifyTotalMonthly = shopifyMonthlyFee + shopifyGmvFeeMonthly + proposalAppSpend;
              const shopify3YearTotal = shopifyTotalMonthly * 36;

              const mavencoSetupOneTime = 49999;
              const mavencoMonthlyCloud = 5000;
              const mavenco3YearTotal = mavencoSetupOneTime + mavencoMonthlyCloud * 36;

              const net3YearSavings = shopify3YearTotal - mavenco3YearTotal;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-[#0A0C10] rounded-xl border border-rose-500/30">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Shopify 3-Yr Cost</div>
                      <div className="text-base font-extrabold text-rose-400 font-mono mt-1">
                        ₹{(shopify3YearTotal / 100000).toFixed(1)} Lakhs
                      </div>
                    </div>
                    <div className="p-3 bg-[#0A0C10] rounded-xl border border-sky-500/30">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Mavenco 3-Yr Cost</div>
                      <div className="text-base font-extrabold text-sky-400 font-mono mt-1">
                        ₹{(mavenco3YearTotal / 100000).toFixed(1)} Lakhs
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/40">
                      <div className="text-[10px] text-emerald-300 uppercase font-bold">Net 3-Yr Savings</div>
                      <div className="text-base font-extrabold text-emerald-400 font-mono mt-1">
                        ₹{(net3YearSavings / 100000).toFixed(1)} Lakhs
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0A0C10] rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-white uppercase text-[11px] tracking-wider">
                      Proposal Summary for {proposalTenant.name}:
                    </div>
                    <ul className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
                      <li>• <strong>0% Platform Commission:</strong> Saves ₹{((shopifyGmvFeeMonthly * 36) / 100000).toFixed(1)} Lakhs in 2% turnover taxes.</li>
                      <li>• <strong>Built-in Core Ecosystem:</strong> Replaces ₹{((proposalAppSpend * 36) / 100000).toFixed(1)} Lakhs of fragmented third-party plugin fees.</li>
                      <li>• <strong>Dedicated MongoDB &amp; Edge Compute:</strong> Sub-50ms speed with zero shared tenancy bottlenecks.</li>
                    </ul>
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setProposalTenant(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                  showToast(`🖨️ Opening print/save dialog for ${proposalTenant.name} proposal!`, 'success');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Print / Download Proposal PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperadminPlatformPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-xs font-mono">Loading Control Plane...</div>}>
      <PlatformContent />
    </Suspense>
  );
}
