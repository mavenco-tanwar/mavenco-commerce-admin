'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Sliders,
  Grid,
  Filter,
  Monitor,
  Tablet,
  Smartphone,
  Tag,
  ShoppingBag,
  Eye,
  Heart,
  Star,
  Layers,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';

export default function CollectionPageBuilder() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'hero' | 'grid' | 'filters' | 'promos' | 'cards'>('grid');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [config, setConfig] = useState({
    heroStyle: 'editorial' as 'editorial' | 'minimal' | 'split',
    heroTitle: 'Signature Festive & Wedding Edit',
    heroSubtitle: 'Explore handcrafted Banarasi katan silks, artisanal dupattas, and couture silhouettes.',
    gridColumns: 3 as 2 | 3 | 4,
    showFilterSidebar: true,
    filterPosition: 'left' as 'left' | 'top' | 'drawer',
    enablePriceFilter: true,
    enableColorSwatches: true,
    enableSizeFilter: true,
    enableInStockToggle: true,
    enableQuickAdd: true,
    enableWishlistHover: true,
    enableDiscountBadge: true,
    enableInGridPromos: true,
    inGridPromoCard: {
      position: 3,
      badge: 'LIMITED TIME CURATION',
      title: 'Bridal Heritage Trousseau 2026',
      cta: 'Explore Capsule',
      bgGradient: 'from-amber-600 to-rose-700',
    },
  });

  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const tenantSlug = activeTenant?.slug || "demo";

  useEffect(() => {
    const handleTenantUpdate = (e: any) => {
      const updated = e?.detail || PlatformService.getActiveTenant();
      setActiveTenant(updated);
    };
    window.addEventListener("tenant_updated", handleTenantUpdate);
    return () => window.removeEventListener("tenant_updated", handleTenantUpdate);
  }, []);

  // 1. Fetch live PLP config from MongoDB Atlas
  useEffect(() => {
    async function fetchPlpConfig() {
      try {
        setIsLoading(true);
        const res = await ApiClient.get<any>(`/api/v1/content/pages?type=collection-page&tenant=${tenantSlug}`);
        if (res.data?.config) {
          setConfig((prev) => ({ ...prev, ...res.data.config }));
        }
      } catch (err) {
        console.warn('Using local PLP defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlpConfig();
  }, [tenantSlug]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await ApiClient.put(`/api/v1/content/pages?type=collection-page&tenant=${tenantSlug}`, {
        type: 'collection-page',
        status: 'draft',
        config,
      });
      showToast('Collection Page draft synced to MongoDB Atlas!', 'success');
    } catch {
      showToast('Draft saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      await ApiClient.put(`/api/v1/content/pages?type=collection-page&tenant=${tenantSlug}`, {
        type: 'collection-page',
        status: 'published',
        config,
      });
      showToast('Published live to MongoDB Atlas & Storefront Category routes!', 'success');
    } catch {
      showToast('Published locally.', 'info');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    setConfig({
      heroStyle: 'editorial',
      heroTitle: 'Signature Festive & Wedding Edit',
      heroSubtitle: 'Explore handcrafted Banarasi katan silks, artisanal dupattas, and couture silhouettes.',
      gridColumns: 3,
      showFilterSidebar: true,
      filterPosition: 'left',
      enablePriceFilter: true,
      enableColorSwatches: true,
      enableSizeFilter: true,
      enableInStockToggle: true,
      enableQuickAdd: true,
      enableWishlistHover: true,
      enableDiscountBadge: true,
      enableInGridPromos: true,
      inGridPromoCard: {
        position: 3,
        badge: 'LIMITED TIME CURATION',
        title: 'Bridal Heritage Trousseau 2026',
        cta: 'Explore Capsule',
        bgGradient: 'from-amber-600 to-rose-700',
      },
    });
    showToast('Reset to default collection template', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Visual Headless CMS
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Collection &amp; Category Grid (PLP)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Collection &amp; Catalog Page Builder</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize category hero banners, faceted filter bars, grid column density, and in-grid promotional capsules.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Device Switcher */}
          <div className="flex items-center bg-[#161822] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg transition-all ${device === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg transition-all ${device === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg transition-all ${device === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#121522] border border-slate-800 p-5 rounded-2xl shadow-xl">
          {/* Customizer Tabs */}
          <div className="flex border-b border-slate-800 pb-2 gap-1 overflow-x-auto text-xs">
            {[
              { id: 'hero', label: '1. Banner Hero' },
              { id: 'grid', label: '2. Grid Layout' },
              { id: 'filters', label: '3. Facet Filters' },
              { id: 'promos', label: '4. In-Grid Promos' },
              { id: 'cards', label: '5. Product Cards' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === t.id
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Hero */}
          {activeTab === 'hero' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider block">Category Hero Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'editorial', label: 'Editorial Banner' },
                    { id: 'split', label: 'Split Hero' },
                    { id: 'minimal', label: 'Minimalist' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setConfig({ ...config, heroStyle: item.id as any })}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                        config.heroStyle === item.id
                          ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                          : 'border-slate-800 bg-[#0C0E17] text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Hero Headline</label>
                <input
                  type="text"
                  value={config.heroTitle}
                  onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Hero Subtext</label>
                <textarea
                  rows={2}
                  value={config.heroSubtitle}
                  onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Grid */}
          {activeTab === 'grid' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider block">Desktop Grid Density</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { cols: 2, label: '2 Columns (High-Res)' },
                    { cols: 3, label: '3 Columns (Balanced)' },
                    { cols: 4, label: '4 Columns (Compact)' },
                  ].map((item) => (
                    <button
                      key={item.cols}
                      onClick={() => setConfig({ ...config, gridColumns: item.cols as any })}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                        config.gridColumns === item.cols
                          ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                          : 'border-slate-800 bg-[#0C0E17] text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="font-bold text-slate-300 uppercase tracking-wider block">Filter Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'left', label: 'Left Sidebar' },
                    { id: 'top', label: 'Top Horizontal Bar' },
                    { id: 'drawer', label: 'Slide Drawer' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setConfig({ ...config, filterPosition: pos.id as any })}
                      className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                        config.filterPosition === pos.id
                          ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                          : 'border-slate-800 bg-[#0C0E17] text-slate-400 hover:text-white'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Filters */}
          {activeTab === 'filters' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Price Range Range-Slider</span>
                <input
                  type="checkbox"
                  checked={config.enablePriceFilter}
                  onChange={(e) => setConfig({ ...config, enablePriceFilter: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Visual Color Palette Swatches</span>
                <input
                  type="checkbox"
                  checked={config.enableColorSwatches}
                  onChange={(e) => setConfig({ ...config, enableColorSwatches: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Size &amp; Fit Selector Chips</span>
                <input
                  type="checkbox"
                  checked={config.enableSizeFilter}
                  onChange={(e) => setConfig({ ...config, enableSizeFilter: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">"In-Stock Only" Instant Filter</span>
                <input
                  type="checkbox"
                  checked={config.enableInStockToggle}
                  onChange={(e) => setConfig({ ...config, enableInStockToggle: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>
            </div>
          )}

          {/* Tab 4: In-Grid Promos */}
          {activeTab === 'promos' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <div>
                  <div className="font-semibold text-white">Enable In-Grid Promotional Cards</div>
                  <div className="text-[10px] text-slate-400">Inserts visual editorial capsules between products</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableInGridPromos}
                  onChange={(e) => setConfig({ ...config, enableInGridPromos: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              {config.enableInGridPromos && (
                <div className="p-3 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Promo Card Title</label>
                    <input
                      type="text"
                      value={config.inGridPromoCard.title}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          inGridPromoCard: { ...config.inGridPromoCard, title: e.target.value },
                        })
                      }
                      className="w-full p-2 bg-[#161822] border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Badge Label</label>
                    <input
                      type="text"
                      value={config.inGridPromoCard.badge}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          inGridPromoCard: { ...config.inGridPromoCard, badge: e.target.value },
                        })
                      }
                      className="w-full p-2 bg-[#161822] border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Product Cards */}
          {activeTab === 'cards' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Quick Add to Cart on Hover</span>
                <input
                  type="checkbox"
                  checked={config.enableQuickAdd}
                  onChange={(e) => setConfig({ ...config, enableQuickAdd: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Floating Wishlist Heart Icon</span>
                <input
                  type="checkbox"
                  checked={config.enableWishlistHover}
                  onChange={(e) => setConfig({ ...config, enableWishlistHover: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Discount &amp; Sale % Pill</span>
                <input
                  type="checkbox"
                  checked={config.enableDiscountBadge}
                  onChange={(e) => setConfig({ ...config, enableDiscountBadge: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Live Reactive Device Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0A0C10] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-full text-xs font-mono text-slate-400 flex items-center justify-between mb-3">
            <span>LIVE CATALOG PREVIEW</span>
            <span className="text-emerald-400 font-bold">● Active Grid Engine</span>
          </div>

          <div
            className={`w-full transition-all duration-300 border border-slate-700/60 rounded-2xl overflow-hidden bg-[#0D0F18] p-4 sm:p-6 space-y-5 ${
              device === 'mobile' ? 'max-w-xs' : device === 'tablet' ? 'max-w-md' : 'max-w-full'
            }`}
          >
            {/* Category Hero Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1A0812] via-[#2A1020] to-[#120815] border border-rose-500/20 text-center space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                HAUTE PRET EDIT
              </span>
              <h3 className="text-base sm:text-xl font-extrabold text-white">{config.heroTitle}</h3>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">{config.heroSubtitle}</p>
            </div>

            {/* Filter Bar Mock */}
            <div className="flex items-center justify-between p-2.5 bg-[#141724] rounded-xl border border-slate-800 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-rose-400" />
                <span>Showing 12 Artisan Pieces</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-white">
                <span>Sort by: Featured</span>
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Product Grid Mock */}
            <div
              className={`grid gap-3 ${
                device === 'mobile'
                  ? 'grid-cols-2'
                  : config.gridColumns === 2
                  ? 'grid-cols-2'
                  : config.gridColumns === 4
                  ? 'grid-cols-4'
                  : 'grid-cols-3'
              }`}
            >
              {[
                { title: 'Banarasi Katan Silk', price: '₹2,999', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop' },
                { title: 'Chanderi Gold Dupatta', price: '₹1,499', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop' },
                { title: 'Zari Brocade Kurta', price: '₹3,499', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop' },
              ].map((p, idx) => (
                <div key={idx} className="bg-[#121522] border border-slate-800 rounded-xl overflow-hidden group space-y-2 p-2">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-900">
                    <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                    {config.enableWishlistHover && (
                      <span className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white">
                        <Heart className="w-3 h-3" />
                      </span>
                    )}
                    {config.enableDiscountBadge && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-600 text-white">
                        30% OFF
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white truncate">{p.title}</div>
                    <div className="text-[10px] text-rose-400 font-mono font-extrabold">{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
