'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Heart,
  Eye,
  EyeOff,
  RotateCcw,
  Clock,
  Save,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Palette,
  Sliders,
  Type,
  Image as ImageIcon,
  Tag,
  Star,
  CheckCircle2,
  X,
  Loader2,
  ChevronRight,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { ProductCardConfig } from '@/types/product-card.types';
import { getDefaultProductCardConfig, PRODUCT_CARD_PRESETS } from '@/lib/product-card-presets';

type ActiveTab =
  | 'image'
  | 'badges'
  | 'typography'
  | 'price'
  | 'rating'
  | 'variants'
  | 'add_to_cart'
  | 'card_style'
  | 'responsive';

const SAMPLE_PRODUCTS = [
  {
    id: 'sample_1',
    name: 'Silk Organza Co-Ord Set',
    brand: 'Lumina Atelier',
    price: 280,
    compareAtPrice: 340,
    rating: 4.9,
    reviewCount: 128,
    badge: 'NEW',
    inStock: true,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    ],
    colors: [
      { name: 'Champagne Gold', hex: '#D4AF37' },
      { name: 'Rose Petal', hex: '#E8B8B5' },
      { name: 'Midnight Charcoal', hex: '#1C1917' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'sample_2',
    name: 'Artisanal Chanderi Blazer',
    brand: 'Lumina Couture',
    price: 420,
    compareAtPrice: 0,
    rating: 5.0,
    reviewCount: 64,
    badge: 'EXCLUSIVE',
    inStock: true,
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    ],
    colors: [
      { name: 'Onyx Black', hex: '#0A0A0B' },
      { name: 'Emerald Forest', hex: '#064E3B' },
    ],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'sample_3',
    name: 'Merino Wool Trench Coat',
    brand: 'Lumina Heritage',
    price: 590,
    compareAtPrice: 750,
    rating: 4.8,
    reviewCount: 92,
    badge: 'SALE',
    inStock: false,
    images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    ],
    colors: [
      { name: 'Camel Tan', hex: '#C29B7F' },
      { name: 'Espresso', hex: '#3E2723' },
    ],
    sizes: ['XS', 'S', 'M'],
  },
];

export default function ProductCardBuilderStudio() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<ActiveTab>('image');
  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);

  // Interactive Card Demo State
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [wishlistItems, setWishlistItems] = useState<Record<string, boolean>>({});

  // Core Configuration State
  const [config, setConfig] = useState<ProductCardConfig>(getDefaultProductCardConfig('lumina'));

  // Undo / Redo History Stack
  const [history, setHistory] = useState<ProductCardConfig[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const pushHistory = (newConfig: ProductCardConfig) => {
    const next = history.slice(0, historyIdx + 1);
    next.push(JSON.parse(JSON.stringify(newConfig)));
    setHistory(next);
    setHistoryIdx(next.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setConfig(JSON.parse(JSON.stringify(prev)));
      setHistoryIdx(historyIdx - 1);
      showToast('Undid last change', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setConfig(JSON.parse(JSON.stringify(next)));
      setHistoryIdx(historyIdx + 1);
      showToast('Redid change', 'info');
    }
  };

  // Load Configuration from API on Mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const tenant = PlatformService.getActiveTenant();
        setActiveTenant(tenant);
        const slug = (tenant?.slug || 'lumina').toLowerCase().trim();

        const res = await ApiClient.get<ProductCardConfig>(
          `/api/v1/content/product-card?tenant=${slug}&preview=draft&_t=${Date.now()}`
        );
        if (res.data) {
          setConfig(res.data);
          setHistory([JSON.parse(JSON.stringify(res.data))]);
          setHistoryIdx(0);
        } else {
          const fallback = getDefaultProductCardConfig(slug);
          setConfig(fallback);
          setHistory([JSON.parse(JSON.stringify(fallback))]);
          setHistoryIdx(0);
        }
      } catch (err) {
        console.warn('Failed to load product card config from API, using default preset:', err);
        const t = PlatformService.getActiveTenant();
        const fallback = getDefaultProductCardConfig(t?.slug || 'lumina');
        setConfig(fallback);
        setHistory([JSON.parse(JSON.stringify(fallback))]);
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
      const slug = activeTenant?.slug || config.tenantId || 'lumina';
      await ApiClient.put(`/api/v1/content/product-card?tenant=${slug}`, {
        ...config,
        tenantId: slug,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      });
      showToast('Draft product card configuration saved to MongoDB Atlas', 'success');
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
      const slug = activeTenant?.slug || config.tenantId || 'lumina';
      const nextVersion = (config.version || 1) + 1;
      const activePresetId = (config as any)?.presetId || (
        config.name?.toLowerCase().includes('luxury') || (config.image?.aspectRatio === '4/5' && config.addToCart?.variant === 'outline') ? 'luxury' :
        config.name?.toLowerCase().includes('minimal') || (config.image?.aspectRatio === '1/1' && config.card?.shadow === 'none') ? 'minimalist' :
        config.name?.toLowerCase().includes('vibrant') || config.badges?.style === 'pill' ? 'modern_vibrant' :
        config.name?.toLowerCase().includes('compact') || config.responsive?.desktopColumns === 5 ? 'compact' :
        config.name?.toLowerCase().includes('editorial') || config.layout?.contentAlignment === 'center' ? 'editorial' :
        'fashion'
      );
      const pubDoc: ProductCardConfig = {
        ...config,
        tenantId: slug,
        presetId: activePresetId,
        version: nextVersion,
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ApiClient.put(`/api/v1/content/product-card?tenant=${slug}`, pubDoc);
      setConfig(pubDoc);
      pushHistory(pubDoc);
      showToast(`Product Card Configuration Version ${nextVersion} published live!`, 'success');

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('jq_product_card_updated', Date.now().toString());
        const previewIframe = document.querySelector('iframe') as HTMLIFrameElement;
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage(
            { type: 'PRODUCT_CARD_UPDATED', productCardConfig: pubDoc },
            '*'
          );
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish live', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Apply Preset (Preview in Studio)
  const handleApplyPreset = (presetId: string) => {
    const preset = PRODUCT_CARD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const slug = activeTenant?.slug || 'lumina';
    const next = preset.getConfig(slug);
    next.status = 'draft';
    next.presetId = preset.id;
    setConfig(next);
    pushHistory(next);
    setIsPresetsModalOpen(false);
    showToast(`Loaded ${preset.name} into Studio Preview`, 'info');

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('jq_product_card_updated', Date.now().toString());
      const previewIframe = document.querySelector('iframe') as HTMLIFrameElement;
      if (previewIframe && previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage(
          { type: 'PRODUCT_CARD_UPDATED', productCardConfig: next },
          '*'
        );
      }
    }
  };

  // Apply & Publish Preset Directly
  const handleApplyAndPublishPreset = async (presetId: string) => {
    const preset = PRODUCT_CARD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const slug = activeTenant?.slug || config.tenantId || 'lumina';
    const next = preset.getConfig(slug);
    const nextVersion = (config.version || 1) + 1;
    const pubDoc: ProductCardConfig = {
      ...next,
      tenantId: slug,
      presetId: preset.id,
      version: nextVersion,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsPublishing(true);
    try {
      await ApiClient.put(`/api/v1/content/product-card?tenant=${slug}`, pubDoc);
      setConfig(pubDoc);
      pushHistory(pubDoc);
      setIsPresetsModalOpen(false);
      showToast(`Applied & Published ${preset.name} live!`, 'success');

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('jq_product_card_updated', Date.now().toString());
        const previewIframe = document.querySelector('iframe') as HTMLIFrameElement;
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage(
            { type: 'PRODUCT_CARD_UPDATED', productCardConfig: pubDoc },
            '*'
          );
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish preset', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Version History Handlers
  const handleOpenVersions = async () => {
    setIsVersionsModalOpen(true);
    try {
      const slug = activeTenant?.slug || config.tenantId || 'lumina';
      const res = await ApiClient.get<any[]>(`/api/v1/content/product-card/versions?tenant=${slug}`);
      if (res.data) {
        setVersionHistory(res.data);
      }
    } catch (err) {
      console.warn('Failed to load product card version history:', err);
    }
  };

  const handleRestoreVersion = async (vNum: number) => {
    try {
      const slug = activeTenant?.slug || config.tenantId || 'lumina';
      const res = await ApiClient.post<any>(`/api/v1/content/product-card/versions?tenant=${slug}`, { version: vNum });
      if (res.data) {
        setConfig({ ...res.data, status: 'draft' });
        pushHistory({ ...res.data, status: 'draft' });
        setIsVersionsModalOpen(false);
        showToast(`Restored Version ${vNum} to draft`, 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to restore version', 'error');
    }
  };

  const getAspectClass = (ratio: string) => {
    switch (ratio) {
      case '1/1':
        return 'aspect-square';
      case '4/5':
        return 'aspect-4/5';
      case '3/4':
        return 'aspect-3/4';
      case '4/3':
        return 'aspect-4/3';
      case '16/9':
        return 'aspect-video';
      default:
        return 'aspect-3/4';
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading {activeTenant?.name ? `${activeTenant.name} ` : ''}Product Card Studio...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none max-w-7xl mx-auto">
      {/* 1. TOP HEADER STUDIO BAR */}
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
            <ShoppingBag className="w-7 h-7 text-rose-500" />
            <span>Product Card &amp; Listing System Builder</span>
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Configure the universal product card design system across your entire storefront catalog — aspect ratios, hover transitions, color swatches, badges, and quick-add behaviors.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPresetsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Card Presets</span>
          </button>

          <button
            onClick={() => setIsLivePreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Live Grid Preview</span>
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
            onClick={handleOpenVersions}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all"
            title="Version History"
          >
            <Clock className="w-4 h-4 text-sky-400" />
          </button>

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

      {/* 2. NAVIGATION PILL TABS */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'image'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image &amp; Aspect Ratio</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Badges &amp; Highlights</span>
        </button>

        <button
          onClick={() => setActiveTab('typography')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'typography'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Title &amp; Brand</span>
        </button>

        <button
          onClick={() => setActiveTab('price')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'price'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Price &amp; Currency</span>
        </button>

        <button
          onClick={() => setActiveTab('rating')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'rating'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Ratings &amp; Reviews</span>
        </button>

        <button
          onClick={() => setActiveTab('variants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'variants'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Color Swatches</span>
        </button>

        <button
          onClick={() => setActiveTab('add_to_cart')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'add_to_cart'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart &amp; Actions</span>
        </button>

        <button
          onClick={() => setActiveTab('card_style')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'card_style'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Card Frame, Radius &amp; Shadow</span>
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
          <span>Grid Columns &amp; Mobile</span>
        </button>
      </div>

      {/* 3. MAIN WORKSPACE: 2-COLUMN SPLIT (Inspector Left, Live Real-time Card Demo Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INSPECTOR CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: IMAGE & ASPECT RATIO */}
          {activeTab === 'image' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-rose-400">
                  I
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Image Geometry &amp; Hover Dynamics</h3>
                  <p className="text-xs text-slate-400">Select product framing ratio and interactive secondary image transitions.</p>
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Product Image Aspect Ratio
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: '1/1', label: '1:1 Square' },
                    { id: '4/5', label: '4:5 Vertical' },
                    { id: '3/4', label: '3:4 Editorial' },
                    { id: '4/3', label: '4:3 Landscape' },
                    { id: '16/9', label: '16:9 Widescreen' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        const updated = {
                          ...config,
                          image: { ...config.image, aspectRatio: r.id as any },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        config.image.aspectRatio === r.id
                          ? 'border-rose-500 bg-rose-950/30 text-white ring-2 ring-rose-500/30'
                          : 'border-slate-800 bg-[#090D15] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hover Effect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Image Hover Transition
                  </label>
                  <select
                    value={config.image.hoverEffect}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        image: { ...config.image, hoverEffect: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="second_image">Second Image Swap</option>
                    <option value="zoom">Smooth Zoom In</option>
                    <option value="fade">Subtle Crossfade</option>
                    <option value="none">No Hover Transition</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Image Corner Radius
                  </label>
                  <input
                    type="text"
                    value={config.image.borderRadius}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        image: { ...config.image, borderRadius: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BADGES & HIGHLIGHTS */}
          {activeTab === 'badges' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-pink-400">
                  B
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Product Badges &amp; Overlays</h3>
                  <p className="text-xs text-slate-400">Configure sale tags, new arrival pills, and sold-out overlays.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'top-left', label: 'Top Left' },
                  { id: 'top-right', label: 'Top Right' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                  { id: 'bottom-right', label: 'Bottom Right' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => {
                      const updated = {
                        ...config,
                        badges: { ...config.badges, position: pos.id as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      config.badges.position === pos.id
                        ? 'border-rose-500 bg-rose-950/30 text-white'
                        : 'border-slate-800 bg-[#090D15] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block">{pos.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Badge Style Shape
                  </label>
                  <select
                    value={config.badges.style}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        badges: { ...config.badges, style: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="solid">Solid High Contrast</option>
                    <option value="pill">Rounded Pill</option>
                    <option value="outline">Outlined Border</option>
                    <option value="glass">Frosted Glass</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Discount Display Mode
                  </label>
                  <select
                    value={config.badges.discountFormat}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        badges: { ...config.badges, discountFormat: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="percent">Percentage (e.g. 20% OFF)</option>
                    <option value="amount">Amount (e.g. $60 OFF)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY & TITLES */}
          {activeTab === 'typography' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                  T
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Product Title &amp; Brand Line</h3>
                  <p className="text-xs text-slate-400">Control headline line limits, font weights, and hover accent colors.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Max Title Lines
                  </label>
                  <select
                    value={config.title.maxLines}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        title: { ...config.title, maxLines: Number(e.target.value) as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value={1}>1 Line (Strict Truncate)</option>
                    <option value={2}>2 Lines (Standard)</option>
                    <option value={3}>3 Lines</option>
                    <option value={0}>Unlimited</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Title Font Size
                  </label>
                  <input
                    type="text"
                    value={config.title.fontSize}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        title: { ...config.title, fontSize: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Show Brand Tag
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        brand: { ...config.brand, enabled: !config.brand.enabled },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.brand.enabled
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.brand.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRICE & CURRENCY */}
          {activeTab === 'price' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                  $
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Price &amp; Strike-through Compare</h3>
                  <p className="text-xs text-slate-400">Control pricing typography and discount visibility.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Price Font Size
                  </label>
                  <input
                    type="text"
                    value={config.price.fontSize}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        price: { ...config.price, fontSize: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Show Compare At Price
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        price: { ...config.price, showCompareAt: !config.price.showCompareAt },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.price.showCompareAt
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.price.showCompareAt ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RATINGS & REVIEWS */}
          {activeTab === 'rating' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                  ★
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Star Rating &amp; Review Count</h3>
                  <p className="text-xs text-slate-400">Configure customer review proof stars and review counters.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Display Star Rating
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        rating: { ...config.rating, enabled: !config.rating.enabled },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.rating.enabled
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.rating.enabled ? 'Rating Stars Visible' : 'Hidden'}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Show Review Count Number
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        rating: { ...config.rating, showCount: !config.rating.showCount },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.rating.showCount
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.rating.showCount ? 'Count Visible (128)' : 'Hidden'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COLOR SWATCHES & VARIANTS */}
          {activeTab === 'variants' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                  V
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Color Swatches &amp; Variant Pills</h3>
                  <p className="text-xs text-slate-400">Show interactive color dots that change product images on click.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Variant Display Mode
                  </label>
                  <select
                    value={config.variants.displayType}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        variants: { ...config.variants, displayType: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="color_swatches">Interactive Color Swatches</option>
                    <option value="size_chips">Size Chips (XS, S, M, L)</option>
                    <option value="count_badge">Count Badge (+3 Colors)</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Swatch Shape
                  </label>
                  <select
                    value={config.variants.swatchShape}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        variants: { ...config.variants, swatchShape: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="circle">Circular Dots</option>
                    <option value="square">Square Tiles</option>
                    <option value="rounded">Rounded Squares</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ADD TO CART & ACTIONS */}
          {activeTab === 'add_to_cart' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400">
                  CTA
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Add to Cart &amp; Quick Add Actions</h3>
                  <p className="text-xs text-slate-400">Configure button style, size drawer reveals, and quick-view actions.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Add to Cart Behavior
                  </label>
                  <select
                    value={config.addToCart.style}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        addToCart: { ...config.addToCart, style: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="quick_sizes">Quick Size Drawer</option>
                    <option value="button">Always Visible Button</option>
                    <option value="reveal_on_hover">Slide Up on Card Hover</option>
                    <option value="icon">Compact Icon Button</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Button Text Label
                  </label>
                  <input
                    type="text"
                    value={config.addToCart.text}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        addToCart: { ...config.addToCart, text: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CARD STYLE, RADIUS & SHADOW */}
          {activeTab === 'card_style' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-violet-400">
                  C
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Card Frame, Corner Radius &amp; Shadows</h3>
                  <p className="text-xs text-slate-400">Card surface backdrop, subtle borders, and elevation tokens.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Card Corner Radius
                  </label>
                  <input
                    type="text"
                    value={config.card.borderRadius}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        card: { ...config.card, borderRadius: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Hover Elevation Lift
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        card: { ...config.card, hoverLift: !config.card.hoverLift },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.card.hoverLift
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.card.hoverLift ? 'Lift (-3px) Enabled' : 'Flat'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: RESPONSIVE & MOBILE */}
          {activeTab === 'responsive' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Responsive Grid Columns &amp; Mobile Rules</h3>
                  <p className="text-xs text-slate-400">Catalog column densities across desktop, tablet, and smartphone screens.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 text-center p-3 rounded-xl bg-[#090D15] border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Desktop</span>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={config.responsive.desktopColumns}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        responsive: { ...config.responsive, desktopColumns: Number(e.target.value) },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full text-center font-bold text-base bg-slate-900 text-white rounded p-1"
                  />
                  <span className="text-[10px] text-slate-500">Cols</span>
                </div>

                <div className="space-y-1 text-center p-3 rounded-xl bg-[#090D15] border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Tablet</span>
                  <input
                    type="number"
                    min={2}
                    max={4}
                    value={config.responsive.tabletColumns}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        responsive: { ...config.responsive, tabletColumns: Number(e.target.value) },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full text-center font-bold text-base bg-slate-900 text-white rounded p-1"
                  />
                  <span className="text-[10px] text-slate-500">Cols</span>
                </div>

                <div className="space-y-1 text-center p-3 rounded-xl bg-[#090D15] border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Mobile</span>
                  <input
                    type="number"
                    min={1}
                    max={2}
                    value={config.responsive.mobileColumns}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        responsive: { ...config.responsive, mobileColumns: Number(e.target.value) },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full text-center font-bold text-base bg-slate-900 text-white rounded p-1"
                  />
                  <span className="text-[10px] text-slate-500">Cols</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME INTERACTIVE CARD DEMO (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Product Card Demo
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-mono font-bold border border-rose-800">
              {config.image.aspectRatio} Aspect &bull; {config.image.hoverEffect}
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-[#05070B] border border-slate-800/80 shadow-2xl flex flex-col items-center">
            {/* Live Interactive Product Card Component */}
            {SAMPLE_PRODUCTS.slice(0, 1).map((prod) => {
              const isHovered = hoveredProduct === prod.id;
              const isSaved = wishlistItems[prod.id];
              const activeImg = isHovered && config.image.hoverEffect === 'second_image' ? prod.images[1] : prod.images[0];

              return (
                <div
                  key={prod.id}
                  onMouseEnter={() => setHoveredProduct(prod.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className={`w-full max-w-sm transition-all duration-300 relative group select-none ${
                    config.card.hoverLift && isHovered ? '-translate-y-1' : ''
                  }`}
                  style={{
                    backgroundColor: config.card.background,
                    borderRadius: config.card.borderRadius,
                    borderColor: config.card.borderColor,
                    borderWidth: config.card.borderWidth,
                    borderStyle: config.card.border as any,
                    boxShadow: isHovered ? config.card.hoverShadow : config.card.shadow,
                    padding: config.layout.padding,
                  }}
                >
                  {/* Media Container */}
                  <div
                    className={`relative w-full ${getAspectClass(config.image.aspectRatio)} overflow-hidden bg-slate-100 mb-3`}
                    style={{ borderRadius: config.image.borderRadius }}
                  >
                    <img
                      src={activeImg}
                      alt={prod.name}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        isHovered && config.image.hoverEffect === 'zoom' ? 'scale-110' : ''
                      }`}
                    />

                    {/* Badge */}
                    {config.badges.enabled && prod.badge && (
                      <div
                        className={`absolute z-10 ${
                          config.badges.position === 'top-left'
                            ? 'top-2.5 left-2.5'
                            : config.badges.position === 'top-right'
                            ? 'top-2.5 right-2.5'
                            : 'bottom-2.5 left-2.5'
                        }`}
                      >
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            config.badges.style === 'pill' ? 'rounded-full' : 'rounded'
                          } ${
                            prod.badge === 'SALE'
                              ? 'bg-rose-600 text-white'
                              : prod.badge === 'EXCLUSIVE'
                              ? 'bg-amber-500 text-black'
                              : 'bg-slate-950 text-white'
                          }`}
                        >
                          {prod.badge}
                        </span>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    {config.wishlist.enabled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setWishlistItems((prev) => ({ ...prev, [prod.id]: !prev[prod.id] }));
                        }}
                        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-all shadow-sm ${
                          isSaved ? 'text-rose-600' : 'text-slate-700 hover:text-rose-600 hover:scale-110'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="space-y-1.5" style={{ textAlign: config.layout.contentAlignment }}>
                    {config.brand.enabled && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {prod.brand}
                      </span>
                    )}

                    {config.title.enabled && (
                      <h4
                        className="font-bold text-slate-900 transition-colors"
                        style={{
                          fontSize: config.title.fontSize,
                          lineHeight: '1.3',
                        }}
                      >
                        {prod.name}
                      </h4>
                    )}

                    {config.rating.enabled && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-500">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        {config.rating.showCount && (
                          <span className="text-[11px] text-slate-400 font-sans">({prod.reviewCount})</span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    {config.price.enabled && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <span
                          className="font-black text-slate-950"
                          style={{ fontSize: config.price.fontSize }}
                        >
                          ${prod.price.toFixed(2)}
                        </span>
                        {config.price.showCompareAt && prod.compareAtPrice > 0 && (
                          <span className="text-xs line-through text-slate-400">
                            ${prod.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Color Swatches */}
                    {config.variants.enabled && config.variants.displayType === 'color_swatches' && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {prod.colors.map((c, i) => (
                          <button
                            key={i}
                            className={`w-3.5 h-3.5 rounded-full border border-slate-300 transition-transform ${
                              selectedColors[prod.id] === c.name ? 'ring-2 ring-rose-500 scale-110' : ''
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                            onClick={() => setSelectedColors((prev) => ({ ...prev, [prod.id]: c.name }))}
                          />
                        ))}
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    {config.addToCart.enabled && (
                      <div className="pt-2">
                        <button
                          className="w-full py-2.5 rounded-lg bg-slate-950 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                          style={{ borderRadius: config.addToCart.borderRadius }}
                        >
                          {config.addToCart.text}
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

      {/* MODAL 1: PRESETS MODAL */}
      {isPresetsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Product Card Design Presets
                </h3>
              </div>
              <button onClick={() => setIsPresetsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[65vh] overflow-y-auto pr-1">
              {PRODUCT_CARD_PRESETS.map((p) => {
                const activePresetId = (config as any)?.presetId || (
                  config.name?.toLowerCase().includes('luxury') || (config.image?.aspectRatio === '4/5' && config.addToCart?.variant === 'outline') ? 'luxury' :
                  config.name?.toLowerCase().includes('minimal') || (config.image?.aspectRatio === '1/1' && config.card?.shadow === 'none') ? 'minimalist' :
                  config.name?.toLowerCase().includes('vibrant') || config.badges?.style === 'pill' ? 'modern_vibrant' :
                  config.name?.toLowerCase().includes('compact') || config.responsive?.desktopColumns === 5 ? 'compact' :
                  config.name?.toLowerCase().includes('editorial') || config.layout?.contentAlignment === 'center' ? 'editorial' :
                  'fashion'
                );
                const isActive = activePresetId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl transition-all space-y-3 flex flex-col justify-between ${
                      isActive
                        ? 'bg-gradient-to-b from-slate-900 to-[#141B2D] border-2 border-rose-500 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500/30'
                        : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                            Active Preset
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(p.id)}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all text-center"
                      >
                        Preview in Studio
                      </button>
                      <button
                        type="button"
                        disabled={isPublishing}
                        onClick={() => handleApplyAndPublishPreset(p.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 transition-all shadow-md shadow-rose-950/50 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Apply &amp; Publish</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VERSION HISTORY MODAL */}
      {isVersionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Product Card Version History
                </h3>
              </div>
              <button onClick={() => setIsVersionsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {versionHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No previous published versions recorded yet.
                </div>
              ) : (
                versionHistory.map((v) => (
                  <div
                    key={v._id || v.version}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{v.name || `Version ${v.version}`}</span>
                      <p className="text-[10px] text-slate-500">{new Date(v.publishedAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreVersion(v.version)}
                      className="px-3 py-1 rounded-lg bg-sky-600/20 text-sky-300 hover:bg-sky-600 hover:text-white font-bold text-[11px] transition-colors"
                    >
                      Restore Draft
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FULLSCREEN LIVE GRID PREVIEW */}
      {isLivePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-md flex flex-col">
          <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Storefront Catalog Grid Simulator
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                {device.toUpperCase()} MODE
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
              className={`transition-all duration-300 bg-[#FAFAF9] p-8 rounded-2xl shadow-2xl overflow-hidden border border-white/10 ${
                device === 'desktop'
                  ? 'w-full max-w-6xl'
                  : device === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[390px]'
              }`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold font-serif text-slate-900">Featured Atelier Collection</h3>
                <p className="text-xs text-slate-500">Rendered with active product card design tokens.</p>
              </div>

              <div
                className={`grid gap-6 ${
                  device === 'desktop'
                    ? `grid-cols-${config.responsive.desktopColumns || 4}`
                    : device === 'tablet'
                    ? `grid-cols-${config.responsive.tabletColumns || 3}`
                    : `grid-cols-${config.responsive.mobileColumns || 2}`
                }`}
                style={{
                  gridTemplateColumns:
                    device === 'desktop'
                      ? `repeat(${config.responsive.desktopColumns || 4}, minmax(0, 1fr))`
                      : device === 'tablet'
                      ? `repeat(${config.responsive.tabletColumns || 3}, minmax(0, 1fr))`
                      : `repeat(${config.responsive.mobileColumns || 2}, minmax(0, 1fr))`,
                }}
              >
                {SAMPLE_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-2"
                  >
                    <div className={`relative w-full ${getAspectClass(config.image.aspectRatio)} bg-slate-100 rounded-lg overflow-hidden`}>
                      <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                    <span className="text-xs font-bold text-slate-950">${prod.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
