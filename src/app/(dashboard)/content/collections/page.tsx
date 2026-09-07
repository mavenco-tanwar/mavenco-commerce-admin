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
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { CollectionPageConfig } from '@/types/collection-page.types';
import { getDefaultCollectionPageConfig, COLLECTION_PAGE_PRESETS } from '@/lib/collection-page-presets';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';

type ActiveTab =
  | 'hero'
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

        const res = await ApiClient.get<CollectionPageConfig>(
          `/api/v1/content/collection-page?tenant=${slug}&template=default_fashion&preview=draft&_t=${Date.now()}`
        );
        if (res.data) {
          setConfig(res.data);
          setHistory([JSON.parse(JSON.stringify(res.data))]);
          setHistoryIdx(0);
        } else {
          const fallback = getDefaultCollectionPageConfig(slug);
          setConfig(fallback);
          setHistory([JSON.parse(JSON.stringify(fallback))]);
          setHistoryIdx(0);
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
              {config.grid.desktopColumns} Cols &bull; {config.pagination.type}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-[#05070B] border border-slate-800/80 shadow-2xl space-y-4">
            {/* 1. Hero Preview */}
            {config.hero.enabled && (
              <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-slate-900 flex flex-col justify-end p-5">
                <img
                  src={config.hero.bgImage}
                  alt={config.hero.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="relative z-10 space-y-1">
                  <h4 className="text-base font-serif font-bold text-white drop-shadow-md">
                    {config.hero.title}
                  </h4>
                  <p className="text-[11px] text-slate-200 line-clamp-2 drop-shadow">
                    {config.hero.description}
                  </p>
                </div>
              </div>
            )}

            {/* 2. Breadcrumbs & Toolbar */}
            <div className="space-y-2 border-b border-slate-800 pb-3">
              {config.breadcrumbs.enabled && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>Home</span>
                  <span>/</span>
                  <span className="text-white font-bold">Collections</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">124 Creations</span>
                <span className="text-[10px] text-slate-400 font-mono">Sort: {config.sorting.defaultSort}</span>
              </div>
            </div>

            {/* 3. Product Grid Sandbox */}
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_PRODUCTS.map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-[#090D15] border border-slate-800 space-y-1.5">
                  <div className="aspect-3/4 rounded-lg overflow-hidden bg-slate-800 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold">
                      {p.badge}
                    </span>
                  </div>
                  <h5 className="text-[11px] font-bold text-white truncate">{p.name}</h5>
                  <span className="text-xs font-black text-rose-400">${p.price}</span>
                </div>
              ))}
            </div>

            {/* 4. Promo Tile Sandbox */}
            {config.promo.enabled && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-800/50 flex items-center justify-between gap-2">
                <div>
                  <h6 className="text-xs font-bold text-white">{config.promo.title}</h6>
                  <p className="text-[10px] text-slate-400">{config.promo.subtitle}</p>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold shrink-0">
                  {config.promo.ctaText}
                </button>
              </div>
            )}
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
