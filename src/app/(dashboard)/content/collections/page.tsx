'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Eye,
  RotateCcw,
  Clock,
  Save,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Image as ImageIcon,
  Type,
  LayoutGrid,
  FileText,
  Gift,
  Globe,
  Loader2,
  X,
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2,
  Palette,
  Heart,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { CollectionPageConfig } from '@/types/collection-page.types';
import { getDefaultCollectionPageConfig, getCategorySampleProducts, getCategoryDefaultCategories, COLLECTION_PAGE_PRESETS } from '@/lib/collection-page-presets';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';

type ActiveTab =
  | 'hero'
  | 'styles'
  | 'header'
  | 'toolbar'
  | 'filters'
  | 'sorting'
  | 'grid'
  | 'pagination'
  | 'promo'
  | 'seo';

const SAMPLE_PRODUCTS = [
  {
    id: 'sample_1',
    name: 'Silk Organza Co-Ord Set',
    price: 280,
    compareAtPrice: 340,
    rating: 4.9,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'sample_2',
    name: 'Artisanal Chanderi Blazer',
    price: 420,
    compareAtPrice: 0,
    rating: 5.0,
    badge: 'EXCLUSIVE',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'sample_3',
    name: 'Merino Wool Trench Coat',
    price: 590,
    compareAtPrice: 750,
    rating: 4.8,
    badge: 'SALE',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'sample_4',
    name: 'Pleated Chiffon Midi Dress',
    price: 310,
    compareAtPrice: 0,
    rating: 4.7,
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
  },
];

export default function CollectionPageBuilderStudio() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<ActiveTab>('hero');
  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [liveCategories, setLiveCategories] = useState<any[]>([]);

  // Core Configuration State
  const [config, setConfig] = useState<CollectionPageConfig>(getDefaultCollectionPageConfig('lumina'));

  // Undo / Redo History Stack
  const [history, setHistory] = useState<CollectionPageConfig[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const pushHistory = (newConfig: CollectionPageConfig) => {
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

        const fallback = getDefaultCollectionPageConfig(slug);
        const res = await ApiClient.get<CollectionPageConfig>(
          `/api/v1/content/collection-page?tenant=${slug}&preview=draft&_t=${Date.now()}`
        );
        if (res.data) {
          const merged: CollectionPageConfig = {
            ...fallback,
            ...res.data,
            styles: {
              ...(fallback.styles || {}),
              ...(res.data.styles || {}),
            },
            hero: {
              ...(fallback.hero || {}),
              ...(res.data.hero || {}),
            },
            header: {
              ...(fallback.header || {}),
              ...(res.data.header || {}),
            },
            toolbar: {
              ...(fallback.toolbar || {}),
              ...(res.data.toolbar || {}),
            },
            filters: {
              ...(fallback.filters || {}),
              ...(res.data.filters || {}),
            },
            sorting: {
              ...(fallback.sorting || {}),
              ...(res.data.sorting || {}),
            },
            grid: {
              ...(fallback.grid || {}),
              ...(res.data.grid || {}),
            },
            pagination: {
              ...(fallback.pagination || {}),
              ...(res.data.pagination || {}),
            },
            promo: {
              ...(fallback.promo || {}),
              ...(res.data.promo || {}),
            },
            seo: {
              ...(fallback.seo || {}),
              ...(res.data.seo || {}),
            },
          };
          setConfig(merged);
          setHistory([JSON.parse(JSON.stringify(merged))]);
          setHistoryIdx(0);
        } else {
          setConfig(fallback);
          setHistory([JSON.parse(JSON.stringify(fallback))]);
          setHistoryIdx(0);
        }

        // Fetch live catalog products & categories for high-fidelity sandbox alignment
        try {
          const prodRes = await ApiClient.get<any>(`/api/v1/products?tenant=${slug}&limit=8`);
          const pList = prodRes?.data || prodRes;
          if (Array.isArray(pList) && pList.length > 0) {
            setLiveProducts(pList);
          }
        } catch (e) {
          console.warn('Could not fetch live products:', e);
        }

        try {
          const catRes = await ApiClient.get<any>(`/api/v1/categories?tenant=${slug}`);
          const cList = catRes?.data || catRes;
          if (Array.isArray(cList) && cList.length > 0) {
            setLiveCategories(cList);
          }
        } catch (e) {
          console.warn('Could not fetch live categories:', e);
        }
      } catch (err) {
        console.warn('Failed to load collection page config, using preset:', err);
        const t = PlatformService.getActiveTenant();
        const fallback = getDefaultCollectionPageConfig(t?.slug || 'lumina');
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
      await ApiClient.put(`/api/v1/content/collection-page?tenant=${slug}`, {
        ...config,
        tenantId: slug,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      });
      showToast('Draft collection template saved to MongoDB Atlas', 'success');
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
      const pubDoc: CollectionPageConfig = {
        ...config,
        tenantId: slug,
        templateId: config.templateId || 'default_fashion',
        version: nextVersion,
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ApiClient.put(`/api/v1/content/collection-page?tenant=${slug}`, pubDoc);
      setConfig(pubDoc);
      pushHistory(pubDoc);
      showToast(`Collection Template Version ${nextVersion} published live!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish live', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Apply Preset
  const handleApplyPreset = (presetId: string) => {
    const preset = COLLECTION_PAGE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const slug = activeTenant?.slug || 'lumina';
    const next = preset.getConfig(slug);
    next.templateId = preset.id;
    next.status = 'draft';
    setConfig(next);
    pushHistory(next);
    setIsPresetsModalOpen(false);
    showToast(`Applied ${preset.name} Preset. Click "Publish Live" to deploy to Storefront.`, 'info');
  };

  const handleApplyAndPublishPreset = async (presetId: string) => {
    const preset = COLLECTION_PAGE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const slug = activeTenant?.slug || 'lumina';
    const next = preset.getConfig(slug);
    const nextVersion = (config.version || 1) + 1;
    const pubDoc: CollectionPageConfig = {
      ...next,
      tenantId: slug,
      templateId: preset.id,
      version: nextVersion,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConfig(pubDoc);
    pushHistory(pubDoc);
    setIsPresetsModalOpen(false);
    setIsPublishing(true);

    try {
      await ApiClient.put(`/api/v1/content/collection-page?tenant=${slug}`, pubDoc);
      showToast(`🎉 ${preset.name} applied & published live to Storefront!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish live', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Version History Handlers
  const handleOpenVersions = async () => {
    setIsVersionsModalOpen(true);
    try {
      const slug = activeTenant?.slug || config.tenantId || 'lumina';
      const res = await ApiClient.get<any[]>(`/api/v1/content/collection-page/versions?tenant=${slug}`);
      if (res.data) {
        setVersionHistory(res.data);
      }
    } catch (err) {
      console.warn('Failed to load collection page versions:', err);
    }
  };

  const handleRestoreVersion = async (vNum: number) => {
    try {
      const slug = activeTenant?.slug || config.tenantId || 'lumina';
      const res = await ApiClient.post<any>(`/api/v1/content/collection-page/versions?tenant=${slug}`, { version: vNum });
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

  if (isLoading) {
    return (
      <div className="h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading {activeTenant?.name ? `${activeTenant.name} ` : ''}Collection Builder Studio...
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
              Visual PLP Builder Studio
            </span>
            <span className="text-xs font-mono text-slate-400">
              Store: <strong className="text-white">{activeTenant?.name || 'Lumina Atelier'}</strong>{' '}
              <span className="text-slate-600">({activeTenant?.slug || 'lumina'})</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-rose-500" />
            <span>Collection &amp; Category Page Builder</span>
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Build and publish the universal collection lookbook template — hero banners, dynamic breadcrumbs, sticky filter sidebars, multi-sort controls, and promotional grid inserts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPresetsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>PLP Presets</span>
          </button>

          <button
            onClick={() => setIsLivePreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Live Storefront Preview</span>
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
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hero &amp; Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('styles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'styles'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Style &amp; Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('header')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'header'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Breadcrumbs &amp; Header</span>
        </button>

        <button
          onClick={() => setActiveTab('toolbar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'toolbar'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Toolbar &amp; Views</span>
        </button>

        <button
          onClick={() => setActiveTab('filters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'filters'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters Engine &amp; Drawer</span>
        </button>

        <button
          onClick={() => setActiveTab('sorting')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'sorting'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Sorting Options</span>
        </button>

        <button
          onClick={() => setActiveTab('grid')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'grid'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Grid Columns &amp; Gap</span>
        </button>

        <button
          onClick={() => setActiveTab('pagination')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'pagination'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pagination &amp; Load More</span>
        </button>

        <button
          onClick={() => setActiveTab('promo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'promo'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Promotional Insert</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>SEO &amp; Social Graph</span>
        </button>
      </div>

      {/* 3. MAIN WORKSPACE: 2-COLUMN SPLIT (Inspector Left 7 Cols, Live Real-time PLP Preview Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INSPECTOR CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: HERO & BANNER */}
          {activeTab === 'hero' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-rose-400">
                  H
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Collection Hero Banner</h3>
                  <p className="text-xs text-slate-400">Configure visual banner background, height, and overlay opacity.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Hero Section
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        hero: { ...config.hero, enabled: !config.hero.enabled },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.hero.enabled
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.hero.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Banner Height
                  </label>
                  <select
                    value={config.hero.height}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        hero: { ...config.hero, height: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="small">Small (200px)</option>
                    <option value="medium">Medium (340px)</option>
                    <option value="large">Large (480px)</option>
                    <option value="auto">Auto / Compact</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Top Pill Badge Text (e.g. CERTIFIED ATELIER VAULT)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CERTIFIED ATELIER VAULT"
                  value={config.hero.badgeText || ''}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      hero: { ...config.hero, badgeText: e.target.value },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Hero Headline Title
                </label>
                <input
                  type="text"
                  value={config.hero.title}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      hero: { ...config.hero, title: e.target.value },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Hero CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EXPLORE ATELIER"
                    value={config.hero.ctaText || ''}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        hero: { ...config.hero, ctaText: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Hero CTA Button Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #products"
                    value={config.hero.ctaLink || ''}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        hero: { ...config.hero, ctaLink: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Hero Description
                </label>
                <textarea
                  rows={2}
                  value={config.hero.description}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      hero: { ...config.hero, description: e.target.value },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <ImageUploadInput
                label="Hero Background Banner Image"
                description="High-resolution wide banner for collection header"
                value={config.hero.bgImage}
                onChange={(url) => {
                  const updated = {
                    ...config,
                    hero: { ...config.hero, bgImage: url },
                  };
                  setConfig(updated);
                  pushHistory(updated);
                }}
                aspectRatio="banner"
                folder="Collections"
              />
            </div>
          )}

          {/* TAB 1.5: STYLE & COLORS */}
          {activeTab === 'styles' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Universal Page Styling &amp; Colors</h3>
                  <p className="text-xs text-slate-400">Manage page backgrounds, typography, cards, filter sidebars, and button colors.</p>
                </div>
              </div>

              {/* Quick Palettes */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  One-Click Theme Palettes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    {
                      label: 'Haute Joaillerie & Gold',
                      bg: '#FFFDFC',
                      card: '#FFFFFF',
                      btn: '#111111',
                      btnText: '#FFFFFF',
                      text: '#111827',
                      heading: '#111111',
                      filter: '#FAF6F2',
                      font: 'Playfair Display',
                    },
                    {
                      label: 'Dark Atelier Vault',
                      bg: '#0A0D14',
                      card: '#0F1420',
                      btn: '#D4AF37',
                      btnText: '#111111',
                      text: '#94A3B8',
                      heading: '#FFFFFF',
                      filter: '#0F1420',
                      font: 'Cormorant Garamond',
                    },
                    {
                      label: 'Organic Botanical',
                      bg: '#FAF9F5',
                      card: '#FFFFFF',
                      btn: '#166534',
                      btnText: '#FFFFFF',
                      text: '#374151',
                      heading: '#14532D',
                      filter: '#F0FDF4',
                      font: 'Plus Jakarta Sans',
                    },
                    {
                      label: 'Modern Tech Electric',
                      bg: '#0B0F19',
                      card: '#111827',
                      btn: '#2563EB',
                      btnText: '#FFFFFF',
                      text: '#9CA3AF',
                      heading: '#F9FAFB',
                      filter: '#111827',
                      font: 'Inter',
                    },
                    {
                      label: 'Clean Minimalist',
                      bg: '#FFFFFF',
                      card: '#FFFFFF',
                      btn: '#000000',
                      btnText: '#FFFFFF',
                      text: '#525252',
                      heading: '#000000',
                      filter: '#F5F5F5',
                      font: 'Outfit',
                    },
                  ].map((theme, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...config,
                          styles: {
                            ...(config.styles || {}),
                            backgroundColor: theme.bg,
                            cardBackgroundColor: theme.card,
                            filterBackgroundColor: theme.filter,
                            toolbarBackgroundColor: theme.filter,
                            buttonBackgroundColor: theme.btn,
                            buttonTextColor: theme.btnText,
                            textColor: theme.text,
                            headingColor: theme.heading,
                            headingFont: theme.font,
                          },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: theme.bg }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: theme.btn }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: theme.card }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 block truncate group-hover:text-amber-400">
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Page Background */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Page Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.backgroundColor || '#FFFDFC'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), backgroundColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={config.styles?.backgroundColor || '#FFFDFC'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), backgroundColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Card Background */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Product Card Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.cardBackgroundColor || '#FFFFFF'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), cardBackgroundColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={config.styles?.cardBackgroundColor || '#FFFFFF'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), cardBackgroundColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Filter & Toolbar Background */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Filter &amp; Toolbar Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.filterBackgroundColor || '#FAF6F2'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: {
                            ...(config.styles || {}),
                            filterBackgroundColor: e.target.value,
                            toolbarBackgroundColor: e.target.value,
                          },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={config.styles?.filterBackgroundColor || '#FAF6F2'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: {
                            ...(config.styles || {}),
                            filterBackgroundColor: e.target.value,
                            toolbarBackgroundColor: e.target.value,
                          },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Heading Color */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Headings &amp; Titles Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.headingColor || '#111111'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), headingColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={config.styles?.headingColor || '#111111'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), headingColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Body Text Color */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Body &amp; Secondary Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.textColor || '#4B5563'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), textColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={config.styles?.textColor || '#4B5563'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), textColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Button / Accent Color */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Button &amp; Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.buttonBackgroundColor || '#111111'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), buttonBackgroundColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={config.styles?.buttonBackgroundColor || '#111111'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), buttonBackgroundColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Button Text Color */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Button Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.buttonTextColor || '#FFFFFF'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), buttonTextColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={config.styles?.buttonTextColor || '#FFFFFF'}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          styles: { ...(config.styles || {}), buttonTextColor: e.target.value },
                        };
                        setConfig(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Card Border Radius */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Card Border Radius
                  </label>
                  <select
                    value={config.styles?.borderRadius || '16px'}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        styles: { ...(config.styles || {}), borderRadius: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="0px">0px (Sharp &amp; Architectural)</option>
                    <option value="8px">8px (Subtle Rounded)</option>
                    <option value="12px">12px (Modern Classic)</option>
                    <option value="16px">16px (Soft Luxury Rounded)</option>
                    <option value="24px">24px (Pill Soft Contemporary)</option>
                  </select>
                </div>
              </div>

              {/* Typography Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Headline Font Family
                  </label>
                  <select
                    value={config.styles?.headingFont || 'Playfair Display'}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        styles: { ...(config.styles || {}), headingFont: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="Playfair Display">Playfair Display (Haute Elegance)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (Fine Jewelry &amp; Luxury)</option>
                    <option value="Cinzel">Cinzel (Atelier Imperial)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Editorial)</option>
                    <option value="Inter">Inter (Clean High-Tech)</option>
                    <option value="Outfit">Outfit (Minimalist Geometric)</option>
                    <option value="Montserrat">Montserrat (Bold Fashion)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Body Font Family
                  </label>
                  <select
                    value={config.styles?.bodyFont || 'Plus Jakarta Sans'}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        styles: { ...(config.styles || {}), bodyFont: e.target.value },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Inter">Inter</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Roboto">Roboto</option>
                    <option value="DM Sans">DM Sans</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BREADCRUMBS & HEADER */}
          {activeTab === 'header' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                  B
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Breadcrumbs &amp; Header Intro</h3>
                  <p className="text-xs text-slate-400">Configure hierarchy trail and collection product counts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Breadcrumb Trail
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        breadcrumbs: { ...config.breadcrumbs, enabled: !config.breadcrumbs.enabled },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.breadcrumbs.enabled
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.breadcrumbs.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Show Total Product Count
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        header: { ...config.header, showCount: !config.header.showCount },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.header.showCount
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.header.showCount ? 'Count Visible (124)' : 'Hidden'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TOOLBAR & VIEWS */}
          {activeTab === 'toolbar' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                  T
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Product Listing Toolbar</h3>
                  <p className="text-xs text-slate-400">Control view mode toggles and sort dropdown placement.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Show Filter Button
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        toolbar: { ...config.toolbar, showFilterBtn: !config.toolbar.showFilterBtn },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.toolbar.showFilterBtn
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.toolbar.showFilterBtn ? 'Visible' : 'Hidden'}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Default View Mode
                  </label>
                  <select
                    value={config.toolbar.defaultView}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        toolbar: { ...config.toolbar, defaultView: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="grid">Grid Mode</option>
                    <option value="list">List Mode</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FILTERS ENGINE */}
          {activeTab === 'filters' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400">
                  F
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Filter Engine &amp; Sidebar</h3>
                  <p className="text-xs text-slate-400">Configure enabled filter attributes and desktop sidebar position.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Desktop Filter Position
                  </label>
                  <select
                    value={config.filters.position}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        filters: { ...config.filters, position: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="left">Left Sidebar (Standard)</option>
                    <option value="right">Right Sidebar</option>
                    <option value="none">No Sidebar (Drawer Only)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Sticky Sidebar on Scroll
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        filters: { ...config.filters, sticky: !config.filters.sticky },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.filters.sticky
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.filters.sticky ? 'Sticky Enabled' : 'Normal Scroll'}
                  </button>
                </div>
              </div>

              {/* Active Categories Alignment Inspector */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                    Active Catalog Categories (Synchronized)
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
                    Live Catalog Aligned
                  </span>
                </div>
                <div className="space-y-1.5">
                  {((liveCategories.length > 0
                    ? [{ slug: 'all', name: 'All Categories' }, ...liveCategories.map((c) => ({ slug: c.slug || c.id || 'cat', name: c.name || c.title || 'Category' }))]
                    : getCategoryDefaultCategories(activeTenant?.slug || config.tenantId || 'silvora'))
                  ).map((cat: any, idx: number) => (
                    <div
                      key={cat.slug || idx}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-slate-200">{cat.name}</span>
                        {idx === 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Default Selected</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">/{cat.slug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SORTING */}
          {activeTab === 'sorting' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400">
                  S
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Multi-Criteria Sorting</h3>
                  <p className="text-xs text-slate-400">Select default sort sequence and active customer criteria.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Default Storefront Sort
                </label>
                <select
                  value={config.sorting.defaultSort}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      sorting: { ...config.sorting, defaultSort: e.target.value },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="featured">Featured &amp; Best Selling</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 6: GRID & COLUMNS */}
          {activeTab === 'grid' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-violet-400">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Product Grid Density</h3>
                  <p className="text-xs text-slate-400">Configure column counts across desktop, tablet, and mobile screens.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 text-center p-3 rounded-xl bg-[#090D15] border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Desktop</span>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={config.grid.desktopColumns}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        grid: { ...config.grid, desktopColumns: Number(e.target.value) },
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
                    value={config.grid.tabletColumns}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        grid: { ...config.grid, tabletColumns: Number(e.target.value) },
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
                    value={config.grid.mobileColumns}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        grid: { ...config.grid, mobileColumns: Number(e.target.value) },
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

          {/* TAB 7: PAGINATION */}
          {activeTab === 'pagination' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-pink-400">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Pagination &amp; Catalog Batching</h3>
                  <p className="text-xs text-slate-400">Select page numbering, load-more button, or infinite scrolling.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Pagination Mode
                  </label>
                  <select
                    value={config.pagination.type}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        pagination: { ...config.pagination, type: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="pagination">Numbered Page Buttons</option>
                    <option value="load_more">Load More Button</option>
                    <option value="infinite_scroll">Infinite Scroll Stream</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Products Per Page
                  </label>
                  <select
                    value={config.pagination.productsPerPage}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        pagination: { ...config.pagination, productsPerPage: Number(e.target.value) },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value={12}>12 Products</option>
                    <option value={24}>24 Products</option>
                    <option value={36}>36 Products</option>
                    <option value={48}>48 Products</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PROMOTIONAL INSERT */}
          {activeTab === 'promo' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                  🎁
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Promotional Grid Insert</h3>
                  <p className="text-xs text-slate-400">Inject editorial banner tiles into the product grid stream.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Promotional Block
                  </label>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        promo: { ...config.promo, enabled: !config.promo.enabled },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.promo.enabled
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-800 bg-[#090D15] text-slate-400'
                    }`}
                  >
                    {config.promo.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Column Width Span
                  </label>
                  <select
                    value={config.promo.colSpan}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        promo: { ...config.promo, colSpan: e.target.value as any },
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="1">1 Column Tile</option>
                    <option value="2">2 Columns Wide</option>
                    <option value="full">Full Grid Row Span</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Promo Headline
                </label>
                <input
                  type="text"
                  value={config.promo.title}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      promo: { ...config.promo, title: e.target.value },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <ImageUploadInput
                label="Promotional Tile Image"
                description="Visual asset for inline product grid promotional block"
                value={config.promo.image}
                onChange={(url) => {
                  const updated = {
                    ...config,
                    promo: { ...config.promo, image: url },
                  };
                  setConfig(updated);
                  pushHistory(updated);
                }}
                aspectRatio="square"
                folder="Promotions"
              />
            </div>
          )}

          {/* TAB 9: SEO & SOCIAL GRAPH */}
          {activeTab === 'seo' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                  SEO
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">SEO Metadata &amp; Open Graph</h3>
                  <p className="text-xs text-slate-400">Search engine indexing parameters and social preview tags.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Meta Title Tag
                </label>
                <input
                  type="text"
                  value={config.seo.metaTitle}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      seo: { ...config.seo, metaTitle: e.target.value },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={config.seo.metaDescription}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      seo: { ...config.seo, metaDescription: e.target.value },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <ImageUploadInput
                label="Social Share &amp; Open Graph Image"
                description="1200x630px image displayed when sharing collection URL"
                value={config.seo.ogImage}
                onChange={(url) => {
                  const updated = {
                    ...config,
                    seo: { ...config.seo, ogImage: url },
                  };
                  setConfig(updated);
                  pushHistory(updated);
                }}
                aspectRatio="video"
                folder="SEO"
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME PLP CANVAS PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live PLP Sandbox Canvas
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-mono font-bold border border-rose-800">
              {config.filters.position === 'none' ? 'No Sidebar' : 'Sidebar Active'} &bull; {config.pagination.type}
            </span>
          </div>

          {(() => {
            const categoriesList: Array<{ slug: string; name: string }> =
              liveCategories.length > 0
                ? [
                    { slug: 'all', name: 'All Categories' },
                    ...liveCategories.map((c) => ({
                      slug: c.slug || c.id || 'cat',
                      name: c.name || c.title || 'Category',
                    })),
                  ]
                : getCategoryDefaultCategories(activeTenant?.slug || config.tenantId || 'silvora');

            const productsList: any[] =
              liveProducts.length > 0
                ? liveProducts.slice(0, 4)
                : getCategorySampleProducts(activeTenant?.slug || config.tenantId || 'silvora').slice(0, 4);

            return (
              <div
                className="p-4 sm:p-5 rounded-3xl border shadow-2xl space-y-4 transition-all"
                style={{
                  backgroundColor: config.styles?.backgroundColor || '#FFFDFC',
                  borderColor: '#E8DED8',
                  color: config.styles?.textColor || '#111827',
                  fontFamily: config.styles?.bodyFont || 'inherit',
                }}
              >
                {/* 1. Hero Banner */}
                {config.hero.enabled && (
                  <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-slate-900 flex flex-col justify-end p-5 shadow-lg">
                    <img
                      src={config.hero.bgImage}
                      alt={config.hero.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: 1 - (config.hero.overlayOpacity || 40) / 100 }}
                    />
                    <div className="relative z-10 space-y-1.5">
                      {config.hero.badgeText && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-black/50 backdrop-blur-md border border-white/20 text-white">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: config.styles?.buttonBackgroundColor || '#D4AF37' }}
                          />
                          {config.hero.badgeText}
                        </div>
                      )}
                      <h4
                        className="text-base font-bold drop-shadow-md"
                        style={{
                          color: config.styles?.headingColor || '#FFFFFF',
                          fontFamily: config.styles?.headingFont || 'inherit',
                        }}
                      >
                        {config.hero.title}
                      </h4>
                      <p className="text-[11px] text-slate-200 line-clamp-2 drop-shadow">
                        {config.hero.description}
                      </p>
                      {config.hero.ctaText && (
                        <div>
                          <span
                            className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm"
                            style={{
                              backgroundColor: config.styles?.buttonBackgroundColor || '#FFFFFF',
                              color: config.styles?.buttonTextColor || '#111111',
                            }}
                          >
                            {config.hero.ctaText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Breadcrumbs Intro */}
                {config.breadcrumbs.enabled && (
                  <div className="flex items-center gap-1.5 text-[10px] opacity-75 border-b pb-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                    <span>Home</span>
                    <span>/</span>
                    <span className="font-bold">Collections</span>
                  </div>
                )}

                {/* 3. Main Workspace Grid: Sidebar + Products */}
                <div className={config.filters.position === 'left' ? 'grid grid-cols-12 gap-3 items-start' : 'space-y-3'}>
                  {/* SIMULATED FILTER SIDEBAR (When left position is selected) */}
                  {config.filters.position === 'left' && (
                    <div
                      className="col-span-5 p-3 rounded-2xl border space-y-3 shadow-xs"
                      style={{
                        backgroundColor: config.styles?.filterBackgroundColor || '#FAF6F2',
                        borderColor: '#E8DED8',
                        color: config.styles?.textColor || '#111827',
                      }}
                    >
                      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: config.styles?.headingColor || '#111111' }}>
                          Filters
                        </span>
                        <span
                          className="text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                          style={{ color: config.styles?.accentColor || '#B77A68' }}
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Reset All
                        </span>
                      </div>

                      {/* Category Navigation */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">
                          Category
                        </span>
                        <div className="space-y-1">
                          {categoriesList.slice(0, 5).map((cat, idx) => (
                            <div
                              key={cat.slug || idx}
                              className={`px-2 py-1 rounded-lg text-[9px] font-semibold flex items-center justify-between transition-all ${
                                idx === 0
                                  ? 'border border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold'
                                  : 'hover:bg-black/5 opacity-80'
                              }`}
                            >
                              <span className="truncate">{cat.name}</span>
                              {idx === 0 && <Check className="w-2.5 h-2.5 text-amber-600" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Color Palette */}
                      <div className="space-y-1 pt-1.5 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                        <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">
                          Color Palette
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-black/10 text-[8px] font-bold">All</span>
                          <span className="w-3 h-3 rounded-full bg-[#E5C158] border border-black/10 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-[#E8927C] border border-black/10 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-[#8E5B4C] border border-black/10 inline-block" />
                        </div>
                      </div>

                      {/* Size */}
                      <div className="space-y-1 pt-1.5 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                        <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">
                          Size
                        </span>
                        <div className="flex items-center gap-1">
                          {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                            <span key={s} className="px-1 py-0.5 rounded text-[8px] border border-black/15 font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Max Price */}
                      <div className="space-y-1 pt-1.5 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                        <div className="flex items-center justify-between text-[8px] font-bold">
                          <span className="opacity-75">Max Price</span>
                          <span style={{ color: config.styles?.accentColor || '#B77A68' }}>₹1,11,250</span>
                        </div>
                        <div className="h-1 rounded-full bg-black/10 relative overflow-hidden">
                          <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: config.styles?.accentColor || '#B77A68' }} />
                        </div>
                      </div>

                      {/* In Stock Only */}
                      <div className="flex items-center gap-1.5 pt-1 border-t text-[8px] font-semibold" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                        <input type="checkbox" className="w-2.5 h-2.5 rounded" defaultChecked readOnly />
                        <span className="opacity-75">In Stock Only</span>
                      </div>
                    </div>
                  )}

                  {/* PRODUCTS COLUMN */}
                  <div className={config.filters.position === 'left' ? 'col-span-7 space-y-2.5' : 'space-y-3'}>
                    {/* Toolbar */}
                    <div
                      className="p-2 rounded-xl flex items-center justify-between text-[9px] border shadow-xs"
                      style={{
                        backgroundColor: config.styles?.toolbarBackgroundColor || config.styles?.filterBackgroundColor || '#FAF6F2',
                        borderColor: '#E8DED8',
                        color: config.styles?.textColor || '#111827',
                      }}
                    >
                      <span className="font-bold">Showing {productsList.length} of {productsList.length} Creations</span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 p-0.5 rounded bg-black/5">
                          <LayoutGrid className="w-3 h-3 text-slate-700 dark:text-slate-200" />
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-black/5 font-semibold text-[8px] truncate max-w-[110px]">
                          Featured &amp; Best Selling ▾
                        </span>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {productsList.map((p: any, idx: number) => {
                        const imgUrl = p.images?.[0]?.url || p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';
                        const displayPrice = typeof p.price === 'number' ? `₹${p.price.toLocaleString()}` : `₹${p.price}`;
                        const displayCompare = p.compareAtPrice && p.compareAtPrice > p.price ? `₹${p.compareAtPrice.toLocaleString()}` : null;

                        return (
                          <div
                            key={p.id || idx}
                            className="p-2 space-y-1.5 border shadow-xs transition-all flex flex-col justify-between"
                            style={{
                              backgroundColor: config.styles?.cardBackgroundColor || '#FFFFFF',
                              borderRadius: config.styles?.borderRadius || '16px',
                              borderColor: '#E8DED8',
                              color: config.styles?.textColor || '#111827',
                            }}
                          >
                            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative group">
                              <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[8px] font-bold shadow-xs">
                                {p.badge || '-25%'}
                              </span>
                              <div className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-slate-700">
                                <Heart className="w-2.5 h-2.5" />
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <h5
                                className="text-[10px] font-bold truncate"
                                style={{
                                  color: config.styles?.headingColor || '#111111',
                                  fontFamily: config.styles?.headingFont || 'inherit',
                                }}
                              >
                                {p.name || 'Product'}
                              </h5>

                              {/* Star rating */}
                              <div className="flex items-center gap-0.5 text-[8px] text-amber-500 font-bold">
                                <span>★★★★★</span>
                                <span className="text-slate-400 font-normal text-[7px]">(24)</span>
                              </div>

                              {/* Price */}
                              <div className="flex items-center gap-1">
                                <span
                                  className="text-[10px] font-black"
                                  style={{ color: config.styles?.headingColor || '#111111' }}
                                >
                                  {displayPrice}
                                </span>
                                {displayCompare && (
                                  <span className="text-[8px] line-through opacity-50">
                                    {displayCompare}
                                  </span>
                                )}
                              </div>

                              {/* Swatches */}
                              <div className="flex items-center gap-1 pt-0.5">
                                <span className="w-2 h-2 rounded-full border border-black/20 bg-[#C5A880]" />
                                <span className="w-2 h-2 rounded-full border border-black/20 bg-[#E8927C]" />
                                <span className="w-2 h-2 rounded-full border border-black/20 bg-[#8E5B4C]" />
                              </div>
                            </div>

                            {/* ADD TO BAG button */}
                            <button
                              type="button"
                              className="w-full py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-opacity shadow-xs mt-1"
                              style={{
                                backgroundColor: config.styles?.buttonBackgroundColor || '#111111',
                                color: config.styles?.buttonTextColor || '#FFFFFF',
                              }}
                            >
                              <ShoppingBag className="w-2.5 h-2.5" />
                              <span>Add to Bag</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Promo Tile Sandbox */}
                {config.promo.enabled && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-[#1A1625] text-white border border-slate-800 flex items-center justify-between gap-3 shadow-lg">
                    <div className="space-y-0.5 max-w-[200px]">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-amber-400 block">
                        Atelier Exclusives
                      </span>
                      <h6 className="text-[11px] font-serif font-bold text-white truncate">
                        {config.promo.title}
                      </h6>
                      <p className="text-[9px] text-slate-300 line-clamp-1">
                        {config.promo.subtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl font-bold text-[9px] uppercase tracking-wider shrink-0 shadow-md transition-all hover:opacity-95"
                      style={{
                        backgroundColor: config.styles?.buttonBackgroundColor || '#C5A880',
                        color: config.styles?.buttonTextColor || '#111111',
                      }}
                    >
                      {config.promo.ctaText}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
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
                  Collection Page Design Presets
                </h3>
              </div>
              <button onClick={() => setIsPresetsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[65vh] overflow-y-auto pr-1">
              {COLLECTION_PAGE_PRESETS.map((p) => {
                const isActive = (config.templateId === p.id) || (!config.templateId && p.id === 'default_fashion');
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
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shrink-0 shadow-xs">
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
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                          isActive
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        Preview in Studio
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyAndPublishPreset(p.id)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
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
                  Collection Template Version History
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

      {/* MODAL 3: FULLSCREEN LIVE PLP PREVIEW */}
      {isLivePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-md flex flex-col">
          <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Storefront Collection PLP Simulator
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
              className={`transition-all duration-300 bg-[#FFFDFC] text-slate-900 p-8 rounded-2xl shadow-2xl overflow-hidden border border-white/10 space-y-6 ${
                device === 'desktop'
                  ? 'w-full max-w-6xl'
                  : device === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[390px]'
              }`}
            >
              {config.hero.enabled && (
                <div className="relative rounded-2xl overflow-hidden aspect-21/9 bg-slate-900 flex flex-col justify-end p-8">
                  <img
                    src={config.hero.bgImage}
                    alt={config.hero.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 space-y-1 text-white">
                    <h2 className="text-2xl sm:text-3xl font-serif font-black">{config.hero.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-200">{config.hero.description}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {device === 'desktop' && config.filters.position !== 'none' && (
                  <div className="lg:col-span-3 p-4 rounded-xl bg-[#FAF6F2] border border-[#E8DED8] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Filters</h4>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Category: All</p>
                      <p>• Price: Up to $1000</p>
                      <p>• Color: All Swatches</p>
                    </div>
                  </div>
                )}

                <div className={device === 'desktop' && config.filters.position !== 'none' ? 'lg:col-span-9' : 'lg:col-span-12'}>
                  <div
                    className="grid gap-4"
                    style={{
                      gridTemplateColumns:
                        device === 'desktop'
                          ? `repeat(${config.grid.desktopColumns || 4}, minmax(0, 1fr))`
                          : device === 'tablet'
                          ? `repeat(${config.grid.tabletColumns || 3}, minmax(0, 1fr))`
                          : `repeat(${config.grid.mobileColumns || 2}, minmax(0, 1fr))`,
                    }}
                  >
                    {SAMPLE_PRODUCTS.map((prod) => (
                      <div key={prod.id} className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                        <div className="aspect-3/4 bg-slate-100 rounded-lg overflow-hidden">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                        <span className="text-xs font-black text-slate-950">${prod.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
