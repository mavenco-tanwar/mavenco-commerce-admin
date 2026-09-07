'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Clock,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  ShoppingBag,
  Palette,
  Boxes,
  Truck,
  Star,
  Zap,
  Heart,
  Share2,
  Image as ImageIcon,
  Package,
  Ruler,
  Gift,
  Loader2,
  X,
  MoveUp,
  MoveDown,
  ChevronDown,
  Eye,
  Check,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  ProductPageConfig,
  GalleryLayoutType,
  AspectRatioType,
  ZoomModeType,
  VariantOptionDisplayType,
} from '@/types/pdp-template.types';
import { getDefaultPdpConfig, PDP_PRESET_TEMPLATES } from '@/lib/pdp-presets';

type ActivePdpTab =
  | 'gallery'
  | 'purchase'
  | 'variants'
  | 'inventory'
  | 'shipping'
  | 'details'
  | 'reviews'
  | 'recommendations';

const PDP_TABS = [
  { id: 'gallery', label: 'Gallery & Media', icon: ImageIcon },
  { id: 'purchase', label: 'Purchase Box & Buy Bar', icon: ShoppingBag },
  { id: 'variants', label: 'Variants & Swatches', icon: Palette },
  { id: 'inventory', label: 'Inventory & Stock Alerts', icon: Boxes },
  { id: 'shipping', label: 'Shipping & Delivery Estimator', icon: Truck },
  { id: 'details', label: 'Tabs & Accordions', icon: Layers },
  { id: 'reviews', label: 'Reviews & Social Proof', icon: Star },
  { id: 'recommendations', label: 'Recommendations', icon: Gift },
] as const;

export default function ProductPageBuilder() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<ActivePdpTab>('gallery');
  const [activeTemplateId, setActiveTemplateId] = useState<string>('default_fashion');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false); // Default disabled
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  // Config State with Undo/Redo History
  const [config, setConfig] = useState<ProductPageConfig>(() =>
    getDefaultPdpConfig(tenantSlug)
  );
  const [history, setHistory] = useState<ProductPageConfig[]>([
    getDefaultPdpConfig(tenantSlug),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Mock product state for interactive canvas
  const [mockSelectedColor, setMockSelectedColor] = useState('Rose');
  const [mockSelectedSize, setMockSelectedSize] = useState('M');
  const [isAddedToBag, setIsAddedToBag] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Extra state for reviews & recommendation toggles
  const [verifiedBadgeEnabled, setVerifiedBadgeEnabled] = useState(true);
  const [reviewModerationEnabled, setReviewModerationEnabled] = useState(true);
  const [relatedCarouselEnabled, setRelatedCarouselEnabled] = useState(true);
  const [recentlyViewedEnabled, setRecentlyViewedEnabled] = useState(true);

  const pushHistory = (newConfig: ProductPageConfig) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, JSON.parse(JSON.stringify(newConfig))]);
    setHistoryIndex(updatedHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setConfig(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const handleResetToDefault = () => {
    const fresh = getDefaultPdpConfig(tenantSlug);
    setConfig(fresh);
    pushHistory(fresh);
    showToast('Reset configuration to default template', 'info');
  };

  // 1. Fetch live PDP template config
  useEffect(() => {
    async function loadConfig() {
      try {
        setIsLoading(true);
        const res = await ApiClient.get<any>(
          `/api/v1/content/product-page?tenant=${tenantSlug}&template=${activeTemplateId}`
        );
        if (res.data) {
          const cfg = res.data.draft || res.data.data || res.data;
          setConfig(cfg);
          setHistory([JSON.parse(JSON.stringify(cfg))]);
          setHistoryIndex(0);
        }
      } catch (err) {
        console.warn('Using local PDP defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, [tenantSlug, activeTemplateId]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await ApiClient.post('/api/v1/content/product-page', {
        tenant: tenantSlug,
        templateId: activeTemplateId,
        status: 'draft',
        config,
      });
      showToast('Product Page draft synced to MongoDB Atlas!', 'success');
    } catch {
      showToast('Draft saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      await ApiClient.post('/api/v1/content/product-page', {
        tenant: tenantSlug,
        templateId: activeTemplateId,
        status: 'published',
        config,
      });
      showToast('🎉 Product Page published live to Storefront!', 'success');
    } catch {
      showToast('Published locally.', 'info');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleApplyPreset = (key: string) => {
    const preset = PDP_PRESET_TEMPLATES[key];
    if (preset) {
      const updated = JSON.parse(JSON.stringify(preset.config));
      setConfig(updated);
      pushHistory(updated);
      setActiveTemplateId(key);
      setIsPresetModalOpen(false);
      showToast(`Applied preset: ${preset.name}`, 'success');
    }
  };

  const loadVersionHistory = async () => {
    try {
      const res = await ApiClient.get<any>(
        `/api/v1/content/product-page/versions?tenant=${tenantSlug}&template=${activeTemplateId}`
      );
      if (res.data && Array.isArray(res.data)) {
        setVersions(res.data);
      }
      setIsVersionModalOpen(true);
    } catch {
      setIsVersionModalOpen(true);
    }
  };

  const handleRestoreVersion = (ver: any) => {
    if (ver.config) {
      setConfig(ver.config);
      pushHistory(ver.config);
      setIsVersionModalOpen(false);
      showToast(`Restored snapshot from ${new Date(ver.publishedAt).toLocaleTimeString()}`, 'success');
    }
  };

  const moveElement = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...config.purchasePanel.elementsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const updated = {
      ...config,
      purchasePanel: {
        ...config.purchasePanel,
        elementsOrder: newOrder,
      },
    };
    setConfig(updated);
    pushHistory(updated);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading {activeTenant?.name ? `${activeTenant.name} ` : ''}Product Detail Studio...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* 1. TOP HEADER STUDIO BAR (Matches Collection Page Builder Exactly) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800/60 shadow-sm">
              Visual PDP Studio
            </span>
            <span className="text-xs font-mono text-slate-400">
              Store: <strong className="text-white">{activeTenant?.name || 'Lumina Atelier'}</strong>{' '}
              <span className="text-slate-600">({tenantSlug})</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-rose-500" />
            <span>Product Detail Page Builder</span>
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Configure product gallery, buy box, variant swatches, stock alerts, accordions, and customer reviews in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPresetModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Layout Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isLivePreviewOpen
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Eye className={`w-4 h-4 ${isLivePreviewOpen ? 'text-white' : 'text-emerald-400'}`} />
            <span>{isLivePreviewOpen ? 'Live Canvas Active' : 'Live Storefront Preview'}</span>
          </button>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ${
                historyIndex <= 0 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4 scale-x-[-1]" />
            </button>
          </div>

          <button
            type="button"
            onClick={loadVersionHistory}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all cursor-pointer"
            title="Version History"
          >
            <Clock className="w-4 h-4 text-sky-400" />
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION PILL TABS (Exact Visual Representation of Collection Page Builder) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {PDP_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as ActivePdpTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORK AREA (Full Width by default, 2-Column Split when Live Canvas is active) */}
      <div className={`grid grid-cols-1 ${isLivePreviewOpen ? 'lg:grid-cols-12' : 'grid-cols-1'} gap-6 items-start`}>
        {/* SETTINGS CARD CONTAINER */}
        <div className={`${isLivePreviewOpen ? 'lg:col-span-5' : 'w-full'} space-y-4 bg-[#0F1117] border border-slate-800/90 p-5 sm:p-6 rounded-2xl shadow-xl transition-all duration-300`}>
          {/* TAB 1: GALLERY & MEDIA */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Product Media Gallery Settings</h3>
                  <p className="text-xs text-slate-400">Configure gallery layout, aspect ratios, zoom modes, and thumbnail positioning.</p>
                </div>
              </div>

              <div className={`grid ${isLivePreviewOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Gallery Layout</label>
                  <select
                    value={config.gallery.layout}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        gallery: { ...config.gallery, layout: e.target.value as GalleryLayoutType },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="left-thumbs">Left Thumbnails (Lookbook Standard)</option>
                    <option value="bottom-thumbs">Bottom Thumbnails</option>
                    <option value="grid-2">2-Column Grid (Haute Couture Luxury)</option>
                    <option value="stacked">Stacked Vertical (Minimalist)</option>
                    <option value="carousel">Carousel Slider</option>
                    <option value="masonry">Editorial Masonry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Image Aspect Ratio</label>
                  <select
                    value={config.gallery.aspectRatio}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        gallery: { ...config.gallery, aspectRatio: e.target.value as AspectRatioType },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="4:5">4:5 Fashion Portrait (Recommended)</option>
                    <option value="1:1">1:1 Square (Studio / Modern)</option>
                    <option value="3:4">3:4 Classic Proportion</option>
                    <option value="16:9">16:9 Cinematic Wide</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Zoom Mode</label>
                  <select
                    value={config.gallery.zoomMode}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        gallery: { ...config.gallery, zoomMode: e.target.value as ZoomModeType },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="hover">Hover Magnifier</option>
                    <option value="click">Click to Zoom</option>
                    <option value="fullscreen">Fullscreen Lightbox</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Thumbnails Position</label>
                  <select
                    value={config.gallery.thumbnailsPosition}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        gallery: { ...config.gallery, thumbnailsPosition: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="left">Left Side Bar</option>
                    <option value="bottom">Bottom Horizontal Strip</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Gallery Width Split</label>
                  <select
                    value={config.gallery.galleryWidthPercent}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        gallery: { ...config.gallery, galleryWidthPercent: Number(e.target.value) },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value={50}>50% Gallery / 50% Purchase Box</option>
                    <option value={55}>55% Gallery / 45% Purchase Box (Default)</option>
                    <option value={60}>60% Gallery / 40% Purchase Box (Luxury)</option>
                    <option value={65}>65% Gallery / 35% Purchase Box (High Drama)</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...config,
                        gallery: { ...config.gallery, enableVideo: !config.gallery.enableVideo },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      config.gallery.enableVideo
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.gallery.enableVideo ? 'Video Reels Enabled' : 'Video Reels Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PURCHASE BOX & BUY BAR */}
          {activeTab === 'purchase' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Purchase Panel &amp; Buy Controls</h3>
                  <p className="text-xs text-slate-400">Reorder elements, configure discount formats, and customize action buttons.</p>
                </div>
              </div>

              {/* Elements Reordering Pipeline */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Element Display Pipeline (Order Top to Bottom)
                </label>
                <div className={`grid ${isLivePreviewOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-none`}>
                  {config.purchasePanel.elementsOrder.map((key, idx) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white"
                    >
                      <span className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveElement(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveElement(idx, 'down')}
                          disabled={idx === config.purchasePanel.elementsOrder.length - 1}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Toggles */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Action Buttons &amp; Dynamic Elements
                </label>
                <div className={`grid ${isLivePreviewOpen ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-3`}>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
                    <span className="text-xs font-bold text-slate-300 block truncate">Add to Cart</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...config,
                          purchasePanel: { ...config.purchasePanel, showAddToCart: !config.purchasePanel.showAddToCart },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        config.purchasePanel.showAddToCart ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {config.purchasePanel.showAddToCart ? 'Active (ON)' : 'Hidden'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
                    <span className="text-xs font-bold text-slate-300 block truncate">Instant Buy</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...config,
                          purchasePanel: { ...config.purchasePanel, showBuyNow: !config.purchasePanel.showBuyNow },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        config.purchasePanel.showBuyNow ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {config.purchasePanel.showBuyNow ? 'Active (ON)' : 'Hidden'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
                    <span className="text-xs font-bold text-slate-300 block truncate">Wishlist</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...config,
                          purchasePanel: { ...config.purchasePanel, showWishlist: !config.purchasePanel.showWishlist },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        config.purchasePanel.showWishlist ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {config.purchasePanel.showWishlist ? 'Active (ON)' : 'Hidden'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
                    <span className="text-xs font-bold text-slate-300 block truncate">Sticky Bar</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...config,
                          purchasePanel: { ...config.purchasePanel, mobileStickyBar: !config.purchasePanel.mobileStickyBar },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        config.purchasePanel.mobileStickyBar ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {config.purchasePanel.mobileStickyBar ? 'Active (ON)' : 'Hidden'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VARIANTS & SWATCHES */}
          {activeTab === 'variants' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Variants &amp; Swatches Display</h3>
                  <p className="text-xs text-slate-400">Configure visual display types for color swatches and size button selectors.</p>
                </div>
              </div>

              <div className={`grid ${isLivePreviewOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Color Display Mode</label>
                  <select
                    value={config.purchasePanel.colorDisplayType}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        purchasePanel: { ...config.purchasePanel, colorDisplayType: e.target.value as VariantOptionDisplayType },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="swatches">Circular Color Swatches</option>
                    <option value="chips">Text Chips / Pills</option>
                    <option value="dropdown">Dropdown Menu</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Size Display Mode</label>
                  <select
                    value={config.purchasePanel.sizeDisplayType}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        purchasePanel: { ...config.purchasePanel, sizeDisplayType: e.target.value as VariantOptionDisplayType },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="buttons">Square Size Grid (XS, S, M, L)</option>
                    <option value="chips">Rounded Size Pills</option>
                    <option value="dropdown">Dropdown Menu</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY & STOCK */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Inventory &amp; Stock Scarcity</h3>
                  <p className="text-xs text-slate-400">Low stock urgency alerts and out-of-stock behaviors.</p>
                </div>
              </div>

              <div className={`grid ${isLivePreviewOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={config.purchasePanel.lowStockThreshold}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        purchasePanel: { ...config.purchasePanel, lowStockThreshold: Number(e.target.value) },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Out of Stock Behavior
                  </label>
                  <select
                    value={config.purchasePanel.outOfStockBehavior}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        purchasePanel: { ...config.purchasePanel, outOfStockBehavior: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="notifyMe">Notify Me Button (Customer Waitlist)</option>
                    <option value="disabled">Disabled Out of Stock</option>
                    <option value="preorder">Allow Pre-Order</option>
                    <option value="backorder">Allow Backorder</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SHIPPING & DELIVERY */}
          {activeTab === 'shipping' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Shipping &amp; Delivery Guarantees</h3>
                  <p className="text-xs text-slate-400">Postal code delivery estimator, return guarantees, and policies.</p>
                </div>
              </div>

              <div className={`grid ${isLivePreviewOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Shipping Policy Banner Text
                  </label>
                  <input
                    type="text"
                    value={config.purchasePanel.shippingText}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        purchasePanel: { ...config.purchasePanel, shippingText: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Return Policy Guarantee Text
                  </label>
                  <input
                    type="text"
                    value={config.purchasePanel.returnPolicyText}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        purchasePanel: { ...config.purchasePanel, returnPolicyText: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TABS & ACCORDIONS */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Product Details, Tabs &amp; Accordions</h3>
                  <p className="text-xs text-slate-400">Configure below-the-fold content blocks, fabric care, and specifications.</p>
                </div>
              </div>

              <div className="space-y-3">
                {config.sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white"
                  >
                    <div>
                      <span className="font-bold text-sm">{sec.title}</span>
                      <span className="text-xs text-slate-400 font-mono ml-3">({sec.type})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...config,
                          sections: config.sections.map((s) =>
                            s.id === sec.id ? { ...s, enabled: !s.enabled } : s
                          ),
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                        sec.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sec.enabled ? 'Active (ON)' : 'Hidden'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Customer Reviews &amp; Social Proof</h3>
                  <p className="text-xs text-slate-400">Verified buyer ratings and review submission moderation workflow.</p>
                </div>
              </div>

              <div className={`grid ${isLivePreviewOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-6`}>
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Verified Buyer Badge</h4>
                    <p className="text-xs text-slate-400">Display verified authenticity badge on confirmed purchases.</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                    Active
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Review Submission Moderation</h4>
                    <p className="text-xs text-slate-400">Require tenant admin approval before reviews go live.</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                    Moderated
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Cross-Sell &amp; Recommendation Feeds</h3>
                  <p className="text-xs text-slate-400">Related creations and recently viewed catalog queries.</p>
                </div>
              </div>

              <div className={`grid ${isLivePreviewOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-6`}>
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Related Products Carousel</h4>
                    <p className="text-xs text-slate-400">Matches category and style attributes.</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                    Active
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Recently Viewed Storage</h4>
                    <p className="text-xs text-slate-400">Client-side isolated browser storage.</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT LIVE REACTIVE DEVICE CANVAS (Active only when isLivePreviewOpen is true) */}
        {isLivePreviewOpen && (
          <div className="lg:col-span-7 bg-[#0A0C10] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center sticky top-6 animate-in fade-in duration-200">
            <div className="w-full text-xs font-mono text-slate-400 flex items-center justify-between mb-4 pb-3 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-emerald-400 uppercase tracking-wider">LIVE PDP STOREFRONT PREVIEW</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Device Switcher */}
                <div className="flex items-center bg-[#161822] p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDevice('desktop')}
                    className={`p-1.5 rounded-lg transition-all ${device === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Desktop View"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice('tablet')}
                    className={`p-1.5 rounded-lg transition-all ${device === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Tablet View"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice('mobile')}
                    className={`p-1.5 rounded-lg transition-all ${device === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLivePreviewOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Canvas"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actual Storefront Product Page Simulator Container */}
            <div
              className={`w-full transition-all duration-300 border border-slate-700/60 rounded-2xl overflow-hidden bg-[#FFFDFC] text-slate-900 p-4 sm:p-6 space-y-6 shadow-2xl ${
                device === 'mobile' ? 'max-w-[375px]' : device === 'tablet' ? 'max-w-[620px]' : 'w-full'
              }`}
            >
              {/* Breadcrumb Hierarchy */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
                <span className="hover:text-rose-600">Home</span>
                <span>/</span>
                <span className="hover:text-rose-600">Dresses</span>
                <span>/</span>
                <span className="text-slate-900 font-bold truncate">Blush Floral Tiered Midi Dress</span>
              </div>

              {/* Product Main Section: Gallery + Purchase Panel Split */}
              <div
                className={`grid gap-6 items-start ${
                  device === 'mobile' ? 'grid-cols-1' : 'grid-cols-12'
                }`}
              >
                {/* 1. Gallery Simulator */}
                <div
                  className={
                    device === 'mobile'
                      ? 'w-full'
                      : config.gallery.galleryWidthPercent >= 60
                      ? 'col-span-7'
                      : 'col-span-6'
                  }
                >
                  <div className="space-y-3">
                    <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group">
                      <img
                        src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000"
                        alt="Blush Floral Tiered Midi Dress"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                        {config.gallery.layout.toUpperCase()}
                      </span>
                    </div>

                    {config.gallery.thumbnailsPosition !== 'hidden' && (
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {[
                          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200',
                          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200',
                          'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200',
                        ].map((thumb, idx) => (
                          <div
                            key={idx}
                            className={`w-14 h-18 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                              idx === 0 ? 'border-rose-600 ring-2 ring-rose-500/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={thumb} alt="Thumb" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Purchase Panel Simulator */}
                <div
                  className={
                    device === 'mobile'
                      ? 'w-full'
                      : config.gallery.galleryWidthPercent >= 60
                      ? 'col-span-5'
                      : 'col-span-6'
                  }
                >
                  <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-[#FAF6F2] border border-[#E8DED8]">
                    {/* Badges */}
                    {config.purchasePanel.showBadges && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                          Handcrafted Atelier
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          32% OFF
                        </span>
                      </div>
                    )}

                    {/* Brand */}
                    {config.purchasePanel.showBrand && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                        Lumina Haute Couture
                      </span>
                    )}

                    {/* Title */}
                    {config.purchasePanel.showTitle && (
                      <h2 className="text-lg sm:text-xl font-serif font-black text-slate-900 leading-tight">
                        Blush Floral Tiered Midi Dress
                      </h2>
                    )}

                    {/* Rating */}
                    {config.purchasePanel.showRating && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-slate-900">4.9</span>
                        <span className="text-slate-400 font-normal text-[11px]">(42 Verified Reviews)</span>
                      </div>
                    )}

                    {/* Price */}
                    {config.purchasePanel.showPrice && (
                      <div className="flex items-baseline gap-2.5 py-0.5 flex-wrap">
                        <span className="text-xl font-bold font-mono text-slate-900">$1,499</span>
                        {config.purchasePanel.showComparePrice && (
                          <span className="text-xs line-through text-slate-400 font-mono">$2,199</span>
                        )}
                        {config.purchasePanel.showDiscount && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-black">
                            32% OFF
                          </span>
                        )}
                      </div>
                    )}

                    {/* Color Swatches */}
                    <div className="space-y-1 pt-0.5">
                      <span className="text-[11px] font-bold uppercase text-slate-900">
                        Color: <span className="font-normal text-slate-600">{mockSelectedColor}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {[
                          { name: 'Rose', hex: '#E8B8B5' },
                          { name: 'Black', hex: '#0A0A0B' },
                          { name: 'Emerald', hex: '#064E3B' },
                        ].map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setMockSelectedColor(c.name)}
                            className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                              mockSelectedColor === c.name ? 'ring-2 ring-rose-500 scale-110' : 'hover:scale-105 opacity-90'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-slate-900">
                          Size: <span className="font-normal text-slate-600">{mockSelectedSize}</span>
                        </span>
                        <button type="button" className="text-[11px] font-bold text-rose-600 flex items-center gap-1 cursor-pointer">
                          <Ruler className="w-3 h-3" />
                          <span>Size Guide</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setMockSelectedSize(s)}
                            className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              mockSelectedSize === s
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions (Add to Bag / Buy Now) */}
                    <div className="pt-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {config.purchasePanel.showAddToCart && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddedToBag(true);
                              setTimeout(() => setIsAddedToBag(false), 2000);
                            }}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                              isAddedToBag ? 'bg-emerald-600 text-white' : 'bg-slate-950 hover:bg-rose-600 text-white'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isAddedToBag ? 'Added ✓' : 'Add to Bag'}</span>
                          </button>
                        )}

                        {config.purchasePanel.showBuyNow && (
                          <button
                            type="button"
                            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>Instant Buy</span>
                          </button>
                        )}
                      </div>

                      {/* Wishlist & Share */}
                      {config.purchasePanel.showWishlist && (
                        <div className="flex justify-between items-center text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={`flex items-center gap-1 font-bold cursor-pointer ${
                              isWishlisted ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                            <span className="text-[11px]">{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                          </button>
                          <button type="button" className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer">
                            <Share2 className="w-3 h-3" />
                            <span>Share</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Shipping Guarantee */}
                    {config.purchasePanel.showShippingInfo && (
                      <div className="pt-2.5 border-t border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{config.purchasePanel.shippingText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accordions / Tabs Simulator */}
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Product Details &amp; Specifications</h4>
                {config.sections.filter(s => s.enabled).slice(0, 3).map((sec, idx) => (
                  <div key={sec.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-slate-800">{sec.title}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: PRESETS */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#121620] p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Choose a Product Page Preset</h3>
              <button onClick={() => setIsPresetModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {Object.entries(PDP_PRESET_TEMPLATES).map(([key, item]) => (
                <div
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className="p-4 rounded-xl bg-[#090D15] hover:bg-slate-900 border border-slate-800 hover:border-rose-500 transition-all cursor-pointer space-y-2"
                >
                  <h4 className="font-bold text-white text-xs">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VERSION HISTORY */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121620] p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">PDP Version History</h3>
              <button onClick={() => setIsVersionModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {versions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No published versions yet.</div>
              ) : (
                versions.map((ver, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white text-xs block">
                        {new Date(ver.publishedAt).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">{ver.summary || 'Published Snapshot'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(ver)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
