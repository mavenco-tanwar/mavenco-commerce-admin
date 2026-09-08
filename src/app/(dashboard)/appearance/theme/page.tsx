'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette,
  Type,
  Square,
  Sliders,
  LayoutTemplate,
  Tag,
  ExternalLink,
  Sparkles,
  Boxes,
  Smartphone,
  Minus,
  CheckCircle2,
  Layers,
  Code,
  Share2,
  RotateCcw,
  Save,
  Check,
  Eye,
  Monitor,
  Tablet,
  Clock,
  Download,
  Upload,
  RefreshCw,
  X,
  ChevronRight,
  Heart,
  ShoppingBag,
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
  Info,
  Wand2,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { ThemeDocument } from '@/types/theme.types';
import { getDefaultTheme, THEME_PRESETS } from '@/lib/theme-presets';
import { generateThemeCssVariables } from '@/lib/theme-engine';
import { POPULAR_FONTS } from '@/components/builder/tokens/themeTokens';

type ActiveTab =
  | 'colors'
  | 'typography'
  | 'buttons'
  | 'forms'
  | 'cards'
  | 'badges_links'
  | 'layout_spacing'
  | 'effects'
  | 'advanced';

export default function ThemeBuilderStudio() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<ActiveTab>('colors');
  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [jsonExportString, setJsonExportString] = useState('');
  const [jsonImportString, setJsonImportString] = useState('');

  // Core Theme State
  const [theme, setTheme] = useState<ThemeDocument>(getDefaultTheme('lumina', 'Lumina Atelier'));

  // Undo / Redo History
  const [history, setHistory] = useState<ThemeDocument[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const pushHistory = (newTheme: ThemeDocument) => {
    const next = history.slice(0, historyIdx + 1);
    next.push(JSON.parse(JSON.stringify(newTheme)));
    setHistory(next);
    setHistoryIdx(next.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setTheme(JSON.parse(JSON.stringify(prev)));
      setHistoryIdx(historyIdx - 1);
      showToast('Undid last change', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setTheme(JSON.parse(JSON.stringify(next)));
      setHistoryIdx(historyIdx + 1);
      showToast('Redid change', 'info');
    }
  };

  // Load Initial Theme
  useEffect(() => {
    async function loadTheme() {
      setIsLoading(true);
      try {
        const tenant = PlatformService.getActiveTenant();
        setActiveTenant(tenant);
        const slug = (tenant?.slug || 'lumina').toLowerCase().trim();

        const res = await ApiClient.get<ThemeDocument>(`/api/v1/theme?tenant=${slug}&preview=draft&_t=${Date.now()}`);
        if (res.data) {
          setTheme(res.data);
          setHistory([JSON.parse(JSON.stringify(res.data))]);
          setHistoryIdx(0);
        } else {
          const fallback = getDefaultTheme(slug, tenant?.name || 'Lumina Atelier');
          setTheme(fallback);
          setHistory([JSON.parse(JSON.stringify(fallback))]);
          setHistoryIdx(0);
        }
      } catch (err) {
        console.warn('Failed to load theme from API, using default preset:', err);
        const t = PlatformService.getActiveTenant();
        const fallback = getDefaultTheme(t?.slug || 'lumina', t?.name || 'Lumina Atelier');
        setTheme(fallback);
        setHistory([JSON.parse(JSON.stringify(fallback))]);
        setHistoryIdx(0);
      } finally {
        setIsLoading(false);
      }
    }

    loadTheme();
  }, []);

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const slug = activeTenant?.slug || theme.tenantId || 'lumina';
      await ApiClient.put(`/api/v1/theme?tenant=${slug}`, {
        ...theme,
        tenantId: slug,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      });
      showToast('Draft theme saved to MongoDB Atlas', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save draft theme', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Live
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const slug = activeTenant?.slug || theme.tenantId || 'lumina';
      const nextVersion = (theme.version || 1) + 1;
      const pubDoc: ThemeDocument = {
        ...theme,
        tenantId: slug,
        version: nextVersion,
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (pubDoc as any).presetId = (theme as any).presetId || 'fashion';

      await ApiClient.put(`/api/v1/theme?tenant=${slug}`, pubDoc);
      setTheme(pubDoc);
      pushHistory(pubDoc);
      showToast(`Theme Version ${nextVersion} published live!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish theme', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Load Version History
  const handleOpenVersions = async () => {
    setIsVersionsModalOpen(true);
    try {
      const slug = activeTenant?.slug || theme.tenantId || 'lumina';
      const res = await ApiClient.get<any[]>(`/api/v1/theme/versions?tenant=${slug}`);
      if (res.data) {
        setVersionHistory(res.data);
      }
    } catch (err) {
      console.warn('Failed to load version history:', err);
    }
  };

  // Restore Version
  const handleRestoreVersion = async (vNum: number) => {
    try {
      const slug = activeTenant?.slug || theme.tenantId || 'lumina';
      const res = await ApiClient.post<any>(`/api/v1/theme/versions?tenant=${slug}`, { version: vNum });
      if (res.data) {
        setTheme({ ...res.data, status: 'draft' });
        pushHistory({ ...res.data, status: 'draft' });
        setIsVersionsModalOpen(false);
        showToast(`Restored Version ${vNum} to draft`, 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to restore version', 'error');
    }
  };

  // Apply Preset
  const handleApplyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const slug = activeTenant?.slug || 'lumina';
    const name = activeTenant?.name || 'Lumina Atelier';
    const newTheme = preset.getTheme(slug, name);
    (newTheme as any).presetId = preset.id;
    newTheme.status = 'draft';
    setTheme(newTheme);
    pushHistory(newTheme);
    setIsPresetsModalOpen(false);

    // Broadcast to live preview canvas iframe
    if (typeof window !== 'undefined') {
      window.postMessage({ type: 'MAVENCO_THEME_PREVIEW', theme: newTheme }, '*');
    }

    showToast(`Applied ${preset.name} Preset. Click "Publish Live" to deploy to Storefront.`, 'info');
  };

  const handleApplyAndPublishPreset = async (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const slug = activeTenant?.slug || 'lumina';
    const name = activeTenant?.name || 'Lumina Atelier';
    const newTheme = preset.getTheme(slug, name);
    (newTheme as any).presetId = preset.id;
    const nextVersion = (theme.version || 1) + 1;
    const pubDoc: ThemeDocument = {
      ...newTheme,
      tenantId: slug,
      version: nextVersion,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (pubDoc as any).presetId = preset.id;

    setTheme(pubDoc);
    pushHistory(pubDoc);
    setIsPresetsModalOpen(false);
    setIsPublishing(true);

    try {
      await ApiClient.put(`/api/v1/theme?tenant=${slug}`, pubDoc);

      if (typeof window !== 'undefined') {
        window.postMessage({ type: 'THEME_UPDATED', theme: pubDoc }, '*');
        localStorage.setItem('jq_theme_updated', Date.now().toString());
      }

      showToast(`🎉 ${preset.name} applied & published live to Storefront!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish theme live', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Dynamic CSS Variables
  const previewCss = useMemo(() => {
    return generateThemeCssVariables(theme);
  }, [theme]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading {activeTenant?.name ? `${activeTenant.name} ` : ''}Theme Builder Studio...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none max-w-7xl mx-auto">
      {/* 1. TOP HEADER STUDIO BAR (Matches Header & Navigation Builder) */}
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
            <Palette className="w-7 h-7 text-rose-500" />
            <span>Global Theme &amp; Design System Builder</span>
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Control the complete visual design system across your entire storefront — colors, typography, buttons, cards, forms, borders, and shadows in real-time.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPresetsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Theme Presets</span>
          </button>

          <button
            onClick={() => setIsLivePreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Live Preview</span>
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

      {/* 2. NAVIGATION TABS BAR (Pill Tabs matching Header & Footer Builder) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'colors'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Colors &amp; Gradients</span>
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
          <span>Typography &amp; Scale</span>
        </button>

        <button
          onClick={() => setActiveTab('buttons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'buttons'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Square className="w-4 h-4" />
          <span>Buttons &amp; CTAs</span>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'forms'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Forms &amp; Inputs</span>
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'cards'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Cards &amp; Product Tiles</span>
        </button>

        <button
          onClick={() => setActiveTab('badges_links')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'badges_links'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Badges, Links &amp; Icons</span>
        </button>

        <button
          onClick={() => setActiveTab('layout_spacing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'layout_spacing'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Spacing &amp; Containers</span>
        </button>

        <button
          onClick={() => setActiveTab('effects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'effects'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Effects, Radius &amp; Shadows</span>
        </button>

        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'advanced'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Custom CSS &amp; JSON</span>
        </button>
      </div>

      {/* 3. TAB 1: COLORS & GRADIENTS */}
      {activeTab === 'colors' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section 1: Core Canvas & Surface Palette */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-rose-400">
                S
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Core Canvas &amp; Surface Palette</h3>
                <p className="text-xs text-slate-400">Backdrop canvas, card surface tones, and structural dividing borders.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'background', label: 'Page Background', val: theme.colors.background || '#FFFDFC', desc: 'Overall storefront canvas backdrop (dark or light)' },
                { key: 'surface', label: 'Card Surface', val: theme.colors.surface || '#FFFFFF', desc: 'Product tiles, dropdowns, modal boxes' },
                { key: 'surfaceSecondary', label: 'Secondary Surface', val: theme.colors.surfaceSecondary || '#F8F1EA', desc: 'Subtle banners, table stripes, secondary rows' },
                { key: 'border', label: 'Border & Divider', val: theme.colors.border || '#E8DED8', desc: 'Separators, container outlines, card borders' },
                { key: 'borderLight', label: 'Subtle Border Light', val: theme.colors.borderLight || '#F5F5F4', desc: 'Inactive tabs, subtle table rows, faint strokes' },
                { key: 'overlay', label: 'Modal & Drawer Overlay', val: theme.colors.overlay || 'rgba(0, 0, 0, 0.65)', desc: 'Backdrop tint when cart drawer or modal opens' },
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-xl bg-[#090D15] border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 truncate">
                      {item.label}
                    </span>
                    <div
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-inner"
                      style={{ backgroundColor: item.val }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.val.startsWith('#') ? item.val : '#000000'}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Global Typography & Contrast Palette */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-sky-400">
                T
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Global Typography &amp; Text Contrast</h3>
                <p className="text-xs text-slate-400">Fine-grained control over title, body, and subtitle contrast across any background.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'heading', label: 'Headings & Titles (H1–H6)', val: theme.colors.heading || '#111111', desc: 'Primary titles, category names, headlines (set to white #FFF for dark themes)' },
                { key: 'text', label: 'Body Paragraphs Text', val: theme.colors.text || '#111111', desc: 'Main product descriptions, article body, standard text' },
                { key: 'textSecondary', label: 'Secondary / Subtitle Text', val: theme.colors.textSecondary || '#57534E', desc: 'Category subtitles, secondary labels, metadata captions' },
                { key: 'textMuted', label: 'Muted / Helper Text', val: theme.colors.textMuted || '#A8A29E', desc: 'Breadcrumbs, SKU codes, inactive elements' },
                { key: 'primary', label: 'Primary Brand Tone', val: theme.colors.primary || '#111111', desc: 'Key focal points, prominent badges, brand accents' },
                { key: 'accent', label: 'Accent & Interactive Links', val: theme.colors.accent || '#B77A68', desc: 'Hyperlinks, active indicators, sale highlight tags' },
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-xl bg-[#090D15] border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 truncate">
                      {item.label}
                    </span>
                    <div
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-inner"
                      style={{ backgroundColor: item.val }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.val.startsWith('#') ? item.val : '#000000'}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Hero & Lookbook Section Styling */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-amber-400">
                H
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Hero &amp; Lookbook Section Styling</h3>
                <p className="text-xs text-slate-400">Customize title and subtitle contrast specifically inside hero and category banners.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'heroTitle', label: 'Hero Title Color', val: theme.colors.heroTitle || '#FFFFFF', desc: 'Main headline in hero lookbook (set to light white for dark hero banners)' },
                { key: 'heroSubtitle', label: 'Hero Subtitle Text', val: theme.colors.heroSubtitle || '#CBD5E1', desc: 'Supporting tagline and description inside hero banner' },
                { key: 'heroBackground', label: 'Hero Backdrop Background', val: theme.colors.heroBackground || '#0A0D15', desc: 'Container background when banner image is loading or fallback' },
                { key: 'accentHover', label: 'Hero Badge Accent', val: theme.colors.accentHover || '#9A6050', desc: 'Signature Lookbook floating pill badge & pulsing dot' },
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-xl bg-[#090D15] border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 truncate">
                      {item.label}
                    </span>
                    <div
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-inner"
                      style={{ backgroundColor: item.val }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.val.startsWith('#') ? item.val : '#000000'}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Header, Navigation & Announcement Bar */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-violet-400">
                N
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Header, Navigation &amp; Announcement Bar</h3>
                <p className="text-xs text-slate-400">Control navigation bar background, link colors, and top announcement ticker.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'headerBackground', label: 'Header Background', val: theme.colors.headerBackground || '#FFFFFF', desc: 'Main navigation bar background color' },
                { key: 'headerText', label: 'Navigation Links & Icons', val: theme.colors.headerText || '#111111', desc: 'Menu links, search icon, cart counter' },
                { key: 'announcementBackground', label: 'Announcement Bar Bg', val: theme.colors.announcementBackground || '#111827', desc: 'Top notification ticker background' },
                { key: 'announcementText', label: 'Announcement Text', val: theme.colors.announcementText || '#FFFFFF', desc: 'Promotional message and ticker text' },
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-xl bg-[#090D15] border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 truncate">
                      {item.label}
                    </span>
                    <div
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-inner"
                      style={{ backgroundColor: item.val }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.val.startsWith('#') ? item.val : '#000000'}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Product Cards & Catalog Pricing */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-rose-400">
                P
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Product Cards &amp; Catalog Pricing</h3>
                <p className="text-xs text-slate-400">Customize card surface, product titles, regular prices, and sale discounts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  key: 'cardBackground',
                  label: 'Product Card Background',
                  val: theme.cards?.productCardDefaults?.cardBackground || theme.colors.surface || '#FFFFFF',
                  desc: 'Card background fill color for catalog product grid',
                  customSetter: (newVal: string) => {
                    const updated = {
                      ...theme,
                      cards: {
                        ...theme.cards,
                        productCardDefaults: {
                          ...(theme.cards?.productCardDefaults || {} as any),
                          cardBackground: newVal,
                        },
                      },
                    };
                    setTheme(updated);
                    pushHistory(updated);
                  },
                },
                {
                  key: 'titleColor',
                  label: 'Product Title Color',
                  val: theme.cards?.productCardDefaults?.titleColor || theme.colors.heading || '#111111',
                  desc: 'Product name headline color on card tiles',
                  customSetter: (newVal: string) => {
                    const updated = {
                      ...theme,
                      cards: {
                        ...theme.cards,
                        productCardDefaults: {
                          ...(theme.cards?.productCardDefaults || {} as any),
                          titleColor: newVal,
                        },
                      },
                    };
                    setTheme(updated);
                    pushHistory(updated);
                  },
                },
                {
                  key: 'cardPrice',
                  label: 'Regular Price Color',
                  val: theme.colors.cardPrice || theme.cards?.productCardDefaults?.priceColor || theme.colors.primary || '#111827',
                  desc: 'Regular retail price display color',
                  customSetter: (newVal: string) => {
                    const updated = {
                      ...theme,
                      colors: { ...theme.colors, cardPrice: newVal },
                      cards: {
                        ...theme.cards,
                        productCardDefaults: {
                          ...(theme.cards?.productCardDefaults || {} as any),
                          priceColor: newVal,
                        },
                      },
                    };
                    setTheme(updated);
                    pushHistory(updated);
                  },
                },
                {
                  key: 'cardSalePrice',
                  label: 'Sale / Discount Price Color',
                  val: theme.colors.cardSalePrice || theme.cards?.productCardDefaults?.comparePriceColor || '#E11D48',
                  desc: 'Promotional discounted price and sale badge color',
                  customSetter: (newVal: string) => {
                    const updated = {
                      ...theme,
                      colors: { ...theme.colors, cardSalePrice: newVal },
                      cards: {
                        ...theme.cards,
                        productCardDefaults: {
                          ...(theme.cards?.productCardDefaults || {} as any),
                          comparePriceColor: newVal,
                        },
                      },
                    };
                    setTheme(updated);
                    pushHistory(updated);
                  },
                },
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-xl bg-[#090D15] border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 truncate">
                      {item.label}
                    </span>
                    <div
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-inner"
                      style={{ backgroundColor: item.val }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.val.startsWith('#') ? item.val : '#000000'}
                      onChange={(e) => {
                        item.customSetter(e.target.value);
                      }}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => {
                        item.customSetter(e.target.value);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Footer Section Styling */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-emerald-400">
                F
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Footer Section Styling</h3>
                <p className="text-xs text-slate-400">Background, column headers, and link styling for the footer.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'footerBackground', label: 'Footer Background', val: theme.colors.footerBackground || '#F8F1EA', desc: 'Footer section container backdrop' },
                { key: 'footerHeading', label: 'Footer Column Headings', val: theme.colors.footerHeading || '#111111', desc: 'Column title headers, newsletter header' },
                { key: 'footerText', label: 'Footer Links & Body', val: theme.colors.footerText || '#57534E', desc: 'Footer navigation links, copyright, policy text' },
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-xl bg-[#090D15] border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 truncate">
                      {item.label}
                    </span>
                    <div
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-inner"
                      style={{ backgroundColor: item.val }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.val.startsWith('#') ? item.val : '#000000'}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Semantic System & Status Colors */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-emerald-400">
                S
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">System &amp; Feedback Colors</h3>
                <p className="text-xs text-slate-400">Status banners, inventory badges, and system notifications.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'success', label: 'Success / In-Stock', val: theme.colors.success || '#10B981', desc: 'In-stock indicators, positive alerts' },
                { key: 'warning', label: 'Warning / Low Stock', val: theme.colors.warning || '#F59E0B', desc: 'Low inventory alert, urgent notices' },
                { key: 'error', label: 'Error / Sold Out', val: theme.colors.error || '#EF4444', desc: 'Sold out indicators, form validation errors' },
                { key: 'info', label: 'Information Alert', val: theme.colors.info || '#3B82F6', desc: 'Order notices, informational banners' },
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-xl bg-[#090D15] border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                      {item.label}
                    </span>
                    <div
                      className="w-5 h-5 rounded-lg border border-white/20"
                      style={{ backgroundColor: item.val }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.val.startsWith('#') ? item.val : '#000000'}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => {
                        const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: TYPOGRAPHY & SCALE */}
      {activeTab === 'typography' && (
        <div className="space-y-6">
          {/* Font Families Card */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-indigo-400">
                T
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Font Families</h3>
                <p className="text-xs text-slate-400">Curated web fonts applied automatically across headlines, body paragraphs, and navigation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Heading Font Family
                </label>
                <select
                  value={theme.typography.headingFont}
                  onChange={(e) => {
                    const updated = { ...theme, typography: { ...theme.typography, headingFont: e.target.value } };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-sans"
                >
                  {POPULAR_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <div
                  className="p-3 rounded-lg bg-[#090D15] border border-slate-800 text-base font-bold text-white truncate"
                  style={{ fontFamily: theme.typography.headingFont }}
                >
                  Artisanal Luxury &amp; Haute Couture
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Body Font Family
                </label>
                <select
                  value={theme.typography.bodyFont}
                  onChange={(e) => {
                    const updated = { ...theme, typography: { ...theme.typography, bodyFont: e.target.value } };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-sans"
                >
                  {POPULAR_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <div
                  className="p-3 rounded-lg bg-[#090D15] border border-slate-800 text-xs text-slate-300 truncate"
                  style={{ fontFamily: theme.typography.bodyFont }}
                >
                  Engineered with responsive design tokens for speed and clarity.
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Button &amp; Nav Font Family
                </label>
                <select
                  value={theme.typography.buttonFont}
                  onChange={(e) => {
                    const updated = { ...theme, typography: { ...theme.typography, buttonFont: e.target.value } };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-sans"
                >
                  {POPULAR_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <div
                  className="p-3 rounded-lg bg-[#090D15] border border-slate-800 text-xs font-extrabold uppercase tracking-widest text-slate-300 truncate"
                  style={{ fontFamily: theme.typography.buttonFont }}
                >
                  SHOP NOW &bull; ADD TO CART
                </div>
              </div>
            </div>
          </div>

          {/* Heading Scale Sliders */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white tracking-wide">Headline Scales (H1 - H3)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-[#090D15] border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">H1 Headline Size</span>
                  <span className="font-mono text-rose-400">{theme.typography.h1.fontSize}</span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="72"
                  value={parseInt(theme.typography.h1.fontSize) || 48}
                  onChange={(e) => {
                    const updated = {
                      ...theme,
                      typography: {
                        ...theme.typography,
                        h1: { ...theme.typography.h1, fontSize: `${e.target.value}px` },
                      },
                    };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#090D15] border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">H2 Section Title Size</span>
                  <span className="font-mono text-rose-400">{theme.typography.h2.fontSize}</span>
                </div>
                <input
                  type="range"
                  min="22"
                  max="52"
                  value={parseInt(theme.typography.h2.fontSize) || 36}
                  onChange={(e) => {
                    const updated = {
                      ...theme,
                      typography: {
                        ...theme.typography,
                        h2: { ...theme.typography.h2, fontSize: `${e.target.value}px` },
                      },
                    };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#090D15] border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">H3 Card Title Size</span>
                  <span className="font-mono text-rose-400">{theme.typography.h3.fontSize}</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="38"
                  value={parseInt(theme.typography.h3.fontSize) || 28}
                  onChange={(e) => {
                    const updated = {
                      ...theme,
                      typography: {
                        ...theme.typography,
                        h3: { ...theme.typography.h3, fontSize: `${e.target.value}px` },
                      },
                    };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: BUTTONS & CTAS */}
      {activeTab === 'buttons' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-amber-400">
                B
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Global Button Shapes &amp; Radii</h3>
                <p className="text-xs text-slate-400">Select corner shape geometry for all primary, secondary, and ghost CTA buttons.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'square', label: 'Square (0px)', r: '0px' },
                { id: 'slight', label: 'Slight Radius (4px)', r: '4px' },
                { id: 'rounded', label: 'Rounded (10px)', r: '10px' },
                { id: 'pill', label: 'Full Pill (9999px)', r: '9999px' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    const updated = {
                      ...theme,
                      buttons: { ...theme.buttons, shape: s.id as any, borderRadius: s.r },
                    };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className={`p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                    theme.buttons.borderRadius === s.r
                      ? 'border-rose-500 bg-rose-950/30 text-white ring-2 ring-rose-500/30 shadow-lg'
                      : 'border-slate-800 bg-[#090D15] text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div
                    className="h-9 w-full mb-3 flex items-center justify-center text-xs font-bold uppercase transition-all"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: '#FFFFFF',
                      borderRadius: s.r,
                    }}
                  >
                    Sample CTA
                  </div>
                  <span className="text-xs font-bold block">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: FORMS & INPUTS */}
      {activeTab === 'forms' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-emerald-400">
              F
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Forms &amp; Input Fields</h3>
              <p className="text-xs text-slate-400">Default styling for text fields, select boxes, search inputs, and newsletter boxes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Input Height
              </label>
              <input
                type="text"
                value={theme.forms.height}
                onChange={(e) => {
                  const updated = { ...theme, forms: { ...theme.forms, height: e.target.value } };
                  setTheme(updated);
                  pushHistory(updated);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Input Corner Radius
              </label>
              <input
                type="text"
                value={theme.forms.borderRadius}
                onChange={(e) => {
                  const updated = { ...theme, forms: { ...theme.forms, borderRadius: e.target.value } };
                  setTheme(updated);
                  pushHistory(updated);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Input Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.forms.background}
                  onChange={(e) => {
                    const updated = { ...theme, forms: { ...theme.forms, background: e.target.value } };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.forms.background}
                  onChange={(e) => {
                    const updated = { ...theme, forms: { ...theme.forms, background: e.target.value } };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 5: CARDS & PRODUCT TILES */}
      {activeTab === 'cards' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-sky-400">
              P
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Catalog Product Cards &amp; Content Tiles</h3>
              <p className="text-xs text-slate-400">Global defaults for product grid cards, image radii, and hover behaviors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Card Corner Radius
              </label>
              <input
                type="text"
                value={theme.cards.borderRadius}
                onChange={(e) => {
                  const updated = { ...theme, cards: { ...theme.cards, borderRadius: e.target.value } };
                  setTheme(updated);
                  pushHistory(updated);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Product Image Radius
              </label>
              <input
                type="text"
                value={theme.cards.productCardDefaults.imageRadius}
                onChange={(e) => {
                  const updated = {
                    ...theme,
                    cards: {
                      ...theme.cards,
                      productCardDefaults: {
                        ...theme.cards.productCardDefaults,
                        imageRadius: e.target.value,
                      },
                    },
                  };
                  setTheme(updated);
                  pushHistory(updated);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Hover Animation Effect
              </label>
              <select
                value={theme.cards.productCardDefaults.hoverEffect}
                onChange={(e) => {
                  const updated = {
                    ...theme,
                    cards: {
                      ...theme.cards,
                      productCardDefaults: {
                        ...theme.cards.productCardDefaults,
                        hoverEffect: e.target.value as any,
                      },
                    },
                  };
                  setTheme(updated);
                  pushHistory(updated);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="zoom">Zoom on Hover</option>
                <option value="fade">Subtle Fade</option>
                <option value="slide">Slide Action Overlay</option>
                <option value="none">No Animation</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 6: BADGES, LINKS & ICONS */}
      {activeTab === 'badges_links' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-pink-400">
              L
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Badges, Links &amp; Micro-Elements</h3>
              <p className="text-xs text-slate-400">Sale badges, new arrival tags, and global hyperlink underline behaviors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Link Underline Behavior
              </label>
              <select
                value={theme.links.underlineMode}
                onChange={(e) => {
                  const updated = { ...theme, links: { ...theme.links, underlineMode: e.target.value as any } };
                  setTheme(updated);
                  pushHistory(updated);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="hover">Underline on Hover</option>
                <option value="always">Always Underline</option>
                <option value="never">Never Underline</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB 7: SPACING & LAYOUT */}
      {activeTab === 'layout_spacing' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-teal-400">
              M
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Layout Containers &amp; Page Spacing</h3>
              <p className="text-xs text-slate-400">Max page container widths and section padding across responsive viewports.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Large Container Width
              </label>
              <input
                type="text"
                value={theme.layout.container.large}
                onChange={(e) => {
                  const updated = {
                    ...theme,
                    layout: {
                      ...theme.layout,
                      container: { ...theme.layout.container, large: e.target.value },
                    },
                  };
                  setTheme(updated);
                  pushHistory(updated);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 10. TAB 8: EFFECTS, RADIUS & SHADOWS */}
      {activeTab === 'effects' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-violet-400">
              E
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Elevation &amp; Corner Radii Scale</h3>
              <p className="text-xs text-slate-400">System tokens for shadows, cards, and modal elevations.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Radius SM', val: theme.radius.sm },
              { label: 'Radius MD', val: theme.radius.md },
              { label: 'Radius LG', val: theme.radius.lg },
              { label: 'Radius XL', val: theme.radius.xl },
            ].map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#090D15] border border-slate-800 space-y-2 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">{r.label}</span>
                <span className="font-mono text-sm font-bold text-white">{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. TAB 9: ADVANCED & CUSTOM CSS */}
      {activeTab === 'advanced' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-amber-400">
              #
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Tenant-Scoped Custom CSS</h3>
              <p className="text-xs text-slate-400">Write custom CSS rules automatically injected into your storefront.</p>
            </div>
          </div>

          <textarea
            rows={10}
            value={theme.customCss || ''}
            onChange={(e) => {
              const updated = { ...theme, customCss: e.target.value };
              setTheme(updated);
              pushHistory(updated);
            }}
            placeholder="/* Custom CSS overrides for your storefront */"
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-rose-500"
          />
        </div>
      )}

      {/* MODAL 1: PRESETS MODAL */}
      {isPresetsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Curated Design System Presets
                </h3>
              </div>
              <button onClick={() => setIsPresetsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[65vh] overflow-y-auto pr-1">
              {THEME_PRESETS.map((p) => {
                const activePresetId = (theme as any)?.presetId || (
                  theme.name?.toLowerCase().includes('luxury') ? 'luxury' :
                  theme.name?.toLowerCase().includes('minimal') ? 'minimal' :
                  theme.name?.toLowerCase().includes('vibrant') ? 'modern_vibrant' :
                  theme.name?.toLowerCase().includes('editorial') ? 'editorial' :
                  theme.name?.toLowerCase().includes('classic') ? 'classic_ecommerce' :
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
                  Published Theme Version History
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

      {/* MODAL 3: FULLSCREEN LIVE PREVIEW */}
      {isLivePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-md flex flex-col">
          <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Storefront Live Theme Simulator
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

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-start bg-black/40">
            {/* Dynamic CSS Variables injected inside preview sandbox */}
            <div
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                fontFamily: theme.typography.bodyFont,
              }}
              className={`transition-all duration-300 border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${
                device === 'desktop'
                  ? 'w-full max-w-6xl'
                  : device === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[390px]'
              }`}
            >
              {/* Header Sample */}
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <span
                  className="font-black tracking-widest uppercase text-base"
                  style={{
                    fontFamily: theme.typography.headingFont,
                    color: theme.colors.heading,
                  }}
                >
                  {activeTenant?.name || 'STOREFRONT'}
                </span>

                <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
                  <span style={{ color: theme.colors.text }}>New Arrivals</span>
                  <span style={{ color: theme.colors.text }}>Women</span>
                  <span style={{ color: theme.colors.text }}>Men</span>
                  <span style={{ color: theme.colors.accent }}>Sale</span>
                </div>

                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4" style={{ color: theme.colors.text }} />
                  <ShoppingBag className="w-4 h-4" style={{ color: theme.colors.text }} />
                </div>
              </div>

              {/* Hero Banner Sample */}
              <div className="p-8 sm:p-14 text-center space-y-4">
                <span
                  className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider inline-block rounded"
                  style={{
                    backgroundColor: theme.colors.accent,
                    color: '#FFFFFF',
                    borderRadius: theme.radius.sm,
                  }}
                >
                  Spring Drop 2026
                </span>

                <h2
                  className="font-black tracking-tight"
                  style={{
                    fontFamily: theme.typography.headingFont,
                    fontSize: theme.typography.h1.fontSize,
                    lineHeight: theme.typography.h1.lineHeight,
                    color: theme.colors.heading,
                  }}
                >
                  Elegance Designed For You.
                </h2>

                <p
                  className="max-w-lg mx-auto text-xs sm:text-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Discover precision tailoring, handcrafted essentials, and seamless shopping engineered by Mavenco Commerce.
                </p>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-transform hover:scale-105"
                    style={{
                      backgroundColor: theme.buttons.variants.primary.background,
                      color: theme.buttons.variants.primary.textColor,
                      borderRadius: theme.buttons.borderRadius,
                    }}
                  >
                    Shop The Collection
                  </button>
                  <button
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider border transition-colors"
                    style={{
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      borderRadius: theme.buttons.borderRadius,
                    }}
                  >
                    Explore Lookbook
                  </button>
                </div>
              </div>

              {/* Product Card Grid Sample */}
              <div className="p-6 sm:p-8 border-t" style={{ borderColor: theme.colors.border }}>
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="font-bold text-lg"
                    style={{
                      fontFamily: theme.typography.headingFont,
                      color: theme.colors.heading,
                    }}
                  >
                    Featured Essentials
                  </h3>
                  <span className="text-xs font-bold cursor-pointer" style={{ color: theme.colors.accent }}>
                    View All &rarr;
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: '1', title: 'Silk Organza Co-Ord Set', price: '$280.00', compare: '$340.00', badge: 'NEW' },
                    { id: '2', title: 'Artisanal Chanderi Blazer', price: '$420.00', compare: '', badge: 'FEATURED' },
                    { id: '3', title: 'Merino Wool Trench Coat', price: '$590.00', compare: '$750.00', badge: 'SALE' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="border p-4 transition-all"
                      style={{
                        backgroundColor: theme.cards.background,
                        borderColor: theme.cards.border,
                        borderRadius: theme.cards.borderRadius,
                        boxShadow: theme.cards.shadow,
                      }}
                    >
                      <div
                        className="h-44 w-full bg-slate-200 dark:bg-slate-800 relative mb-4 flex items-center justify-center font-bold text-xs uppercase text-slate-400"
                        style={{ borderRadius: theme.cards.productCardDefaults.imageRadius }}
                      >
                        Product Preview Image
                        {item.badge && (
                          <span
                            className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase"
                            style={{
                              backgroundColor: item.badge === 'SALE' ? theme.colors.accent : theme.colors.primary,
                              color: '#FFFFFF',
                              borderRadius: theme.radius.xs,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <h4
                        className="text-xs font-bold truncate mb-1"
                        style={{ color: theme.colors.text }}
                      >
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-black" style={{ color: theme.colors.heading }}>
                          {item.price}
                        </span>
                        {item.compare && (
                          <span className="text-[11px] line-through" style={{ color: theme.colors.textMuted }}>
                            {item.compare}
                          </span>
                        )}
                      </div>

                      <button
                        className="w-full py-2 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: theme.colors.primary,
                          color: '#FFFFFF',
                          borderRadius: theme.radius.sm,
                        }}
                      >
                        Add To Bag
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIP Newsletter Box */}
              <div
                className="p-8 border-t text-center space-y-3"
                style={{
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.border,
                }}
              >
                <h4
                  className="font-bold text-sm"
                  style={{
                    fontFamily: theme.typography.headingFont,
                    color: theme.colors.heading,
                  }}
                >
                  Subscribe to Atelier VIP Updates
                </h4>
                <div className="max-w-md mx-auto flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email address..."
                    className="flex-1 px-4 text-xs border"
                    style={{
                      backgroundColor: theme.forms.background,
                      color: theme.forms.text,
                      borderColor: theme.forms.border,
                      borderRadius: theme.forms.borderRadius,
                      height: theme.forms.height,
                    }}
                    disabled
                  />
                  <button
                    className="px-5 text-xs font-bold uppercase tracking-wider text-white"
                    style={{
                      backgroundColor: theme.colors.accent,
                      borderRadius: theme.forms.borderRadius,
                    }}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
