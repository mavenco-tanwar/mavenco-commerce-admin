'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Palette,
  Layers,
  Check,
  Globe,
  Sliders,
  Menu,
  ShoppingBag,
  Heart,
  Search,
  User,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  Calendar,
  X,
  Clock,
  ArrowRight,
  GripVertical,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  HeaderConfig,
  HeaderBlock,
  NavigationItem,
  getDefaultHeaderConfig,
  LUXURY_PRESET_TEMPLATES,
} from '@/lib/header-config';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';

export default function HeaderBuilderStudio() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'canvas' | 'navigation' | 'theme' | 'mobile' | 'sticky'>('canvas');
  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const isFetchingRef = useRef(false);
  const activeTenantRef = useRef<string>(PlatformService.getActiveTenant()?.slug || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Live Interactive Preview & Template Presets State
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Core Configuration State
  const [config, setConfig] = useState<HeaderConfig>(getDefaultHeaderConfig('lumina'));

  // Modals & Drawers State
  const [editingBlock, setEditingBlock] = useState<HeaderBlock | null>(null);
  const [editingNavIndex, setEditingNavIndex] = useState<number | null>(null);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Undo / Redo History
  const [history, setHistory] = useState<HeaderConfig[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const pushHistory = (newConfig: HeaderConfig) => {
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

  const fetchHeaderConfig = async (overrideSlug?: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setIsLoading(true);

      const tenant = PlatformService.getActiveTenant();
      const slug = (overrideSlug || tenant?.slug || 'lumina').toLowerCase().trim();
      activeTenantRef.current = slug;
      if (tenant) {
        setActiveTenant(tenant);
      }

      // Fetch header config from API
      const apiUrl = `/api/v1/content/header?tenant=${slug}&_t=${Date.now()}`;
      const res = await ApiClient.get<any>(apiUrl);

      const raw = res?.data?.config || res?.data?.data || res?.data || res;
      const base = getDefaultHeaderConfig(slug);

      if (raw && (raw.navigationMenu || raw.mainHeader || raw.announcementBar)) {
        const merged: HeaderConfig = {
          ...base,
          ...raw,
          tenantSlug: slug,
          announcementBar: {
            ...base.announcementBar,
            ...(raw?.announcementBar || {}),
            enabled:
              raw?.announcementBar?.enabled !== undefined
                ? raw.announcementBar.enabled
                : base.announcementBar.enabled,
            styles: {
              ...base.announcementBar.styles,
              ...(raw?.announcementBar?.styles || {}),
            },
            blocks: Array.isArray(raw?.announcementBar?.blocks)
              ? raw.announcementBar.blocks
              : base.announcementBar.blocks,
          },
          mainHeader: {
            ...base.mainHeader,
            ...(raw?.mainHeader || {}),
            enabled:
              raw?.mainHeader?.enabled !== undefined
                ? raw.mainHeader.enabled
                : base.mainHeader.enabled,
            styles: {
              ...base.mainHeader.styles,
              ...(raw?.mainHeader?.styles || {}),
            },
            blocks: Array.isArray(raw?.mainHeader?.blocks)
              ? raw.mainHeader.blocks
              : base.mainHeader.blocks,
          },
          sticky: {
            ...base.sticky,
            ...(raw?.sticky || {}),
          },
          mobile: {
            ...base.mobile,
            ...(raw?.mobile || {}),
          },
          navigationMenu: Array.isArray(raw?.navigationMenu)
            ? raw.navigationMenu
            : base.navigationMenu,
        };

        setConfig(merged);
        pushHistory(merged);
      } else {
        setConfig(base);
        pushHistory(base);
      }
    } catch (err: any) {
      console.error('[HeaderBuilder] Failed to fetch header configuration:', err?.message || err);
      const def = getDefaultHeaderConfig(activeTenantRef.current || 'lumina');
      setConfig(def);
      pushHistory(def);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  useEffect(() => {
    fetchHeaderConfig();

    const handleTenantUpdate = (e: any) => {
      const updatedTenant = e?.detail || PlatformService.getActiveTenant();
      const nextSlug = (updatedTenant?.slug || '').toLowerCase().trim();
      if (nextSlug && nextSlug !== activeTenantRef.current) {
        fetchHeaderConfig(nextSlug);
      }
    };

    window.addEventListener('tenant_updated', handleTenantUpdate);
    return () => {
      window.removeEventListener('tenant_updated', handleTenantUpdate);
    };
  }, []);

    const handlePublishLive = async () => {
    try {
      setIsPublishing(true);
      const slug = activeTenant.slug || config.tenantSlug || 'lumina';
      const payload: HeaderConfig = {
        ...config,
        tenantSlug: slug,
        status: 'published',
        updatedAt: new Date().toISOString(),
      };

      const res = await ApiClient.put(`/api/v1/content/header?tenant=${slug}`, payload);
      const raw = res?.data?.config || res?.data?.data || res?.data || res || payload;
      const base = getDefaultHeaderConfig(slug);
      const savedConfig: HeaderConfig = {
        ...base,
        ...raw,
        tenantSlug: slug,
        announcementBar: {
          ...base.announcementBar,
          ...(raw?.announcementBar || {}),
          enabled:
            raw?.announcementBar?.enabled !== undefined
              ? raw.announcementBar.enabled
              : payload.announcementBar.enabled,
          styles: {
            ...base.announcementBar.styles,
            ...(raw?.announcementBar?.styles || {}),
          },
          blocks: Array.isArray(raw?.announcementBar?.blocks)
            ? raw.announcementBar.blocks
            : payload.announcementBar.blocks,
        },
        mainHeader: {
          ...base.mainHeader,
          ...(raw?.mainHeader || {}),
          enabled:
            raw?.mainHeader?.enabled !== undefined
              ? raw.mainHeader.enabled
              : payload.mainHeader.enabled,
          styles: {
            ...base.mainHeader.styles,
            ...(raw?.mainHeader?.styles || {}),
          },
          blocks: Array.isArray(raw?.mainHeader?.blocks)
            ? raw.mainHeader.blocks
            : payload.mainHeader.blocks,
        },
        navigationMenu: Array.isArray(raw.navigationMenu)
          ? raw.navigationMenu
          : payload.navigationMenu,
      };

      setConfig(savedConfig);
      pushHistory(savedConfig);
      setHasUnpublishedChanges(false);
      showToast(`Header configuration for ${slug.toUpperCase()} published live to MongoDB Atlas!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish header', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const slug = activeTenant.slug || config.tenantSlug || 'lumina';
      const payload = {
        ...config,
        tenantSlug: slug,
        status: 'draft',
      };
      await ApiClient.put(`/api/v1/content/header?tenant=${slug}`, payload);
      showToast('Draft header configuration saved to database.', 'success');
    } catch {
      showToast('Failed to save draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Reset header to default platform template for this store?')) {
      const def = getDefaultHeaderConfig(activeTenant.slug || 'lumina');
      setConfig(def);
      pushHistory(def);
      showToast('Reset to default header template', 'info');
    }
  };

  // Block Helpers
  const updateBlock = (updated: HeaderBlock) => {
    const isTargetAnn = updated.zone.startsWith('announcement');

    // Remove from both lists
    const newAnnBlocks = config.announcementBar.blocks.filter((b) => b.id !== updated.id);
    const newMainBlocks = config.mainHeader.blocks.filter((b) => b.id !== updated.id);

    // Insert into target list
    if (isTargetAnn) {
      newAnnBlocks.push(updated);
    } else {
      newMainBlocks.push(updated);
    }

    const next = {
      ...config,
      announcementBar: { ...config.announcementBar, blocks: newAnnBlocks },
      mainHeader: { ...config.mainHeader, blocks: newMainBlocks },
    };
    setConfig(next);
    pushHistory(next);
    setEditingBlock(null);
    showToast(`Updated block ${updated.type}`, 'success');
  };

  const deleteBlock = (id: string, isAnnouncement: boolean) => {
    if (isAnnouncement) {
      const nextBlocks = config.announcementBar.blocks.filter((b) => b.id !== id);
      const next = { ...config, announcementBar: { ...config.announcementBar, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    } else {
      const nextBlocks = config.mainHeader.blocks.filter((b) => b.id !== id);
      const next = { ...config, mainHeader: { ...config.mainHeader, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    }
    showToast('Block removed', 'info');
  };

  const toggleBlockVisibility = (id: string, isAnnouncement: boolean) => {
    if (isAnnouncement) {
      const nextBlocks = config.announcementBar.blocks.map((b) =>
        b.id === id ? { ...b, enabled: b.enabled === false ? true : false } : b
      );
      const next = { ...config, announcementBar: { ...config.announcementBar, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    } else {
      const nextBlocks = config.mainHeader.blocks.map((b) =>
        b.id === id ? { ...b, enabled: b.enabled === false ? true : false } : b
      );
      const next = { ...config, mainHeader: { ...config.mainHeader, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    }
  };

  const toggleDeviceVisibility = (id: string, isAnnouncement: boolean, targetDevice: 'desktop' | 'tablet' | 'mobile') => {
    if (isAnnouncement) {
      const nextBlocks = config.announcementBar.blocks.map((b) => {
        if (b.id === id) {
          const currentVis = b.enabled !== false && b.responsive?.[targetDevice]?.visible !== false;
          const nextVis = !currentVis;
          const nextResp = {
            desktop: { visible: b.responsive?.desktop?.visible !== false },
            tablet: { visible: b.responsive?.tablet?.visible !== false },
            mobile: { visible: b.responsive?.mobile?.visible !== false },
            [targetDevice]: { visible: nextVis },
          };
          const allHidden = !nextResp.desktop.visible && !nextResp.tablet.visible && !nextResp.mobile.visible;
          return {
            ...b,
            enabled: !allHidden,
            responsive: nextResp,
          };
        }
        return b;
      });
      const next = { ...config, announcementBar: { ...config.announcementBar, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    } else {
      const nextBlocks = config.mainHeader.blocks.map((b) => {
        if (b.id === id) {
          const currentVis = b.enabled !== false && b.responsive?.[targetDevice]?.visible !== false;
          const nextVis = !currentVis;
          const nextResp = {
            desktop: { visible: b.responsive?.desktop?.visible !== false },
            tablet: { visible: b.responsive?.tablet?.visible !== false },
            mobile: { visible: b.responsive?.mobile?.visible !== false },
            [targetDevice]: { visible: nextVis },
          };
          const allHidden = !nextResp.desktop.visible && !nextResp.tablet.visible && !nextResp.mobile.visible;
          return {
            ...b,
            enabled: !allHidden,
            responsive: nextResp,
          };
        }
        return b;
      });
      const next = { ...config, mainHeader: { ...config.mainHeader, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    }
    showToast(`Updated ${targetDevice} visibility`, 'info');
  };

  const moveBlock = (id: string, isAnnouncement: boolean, direction: 'up' | 'down') => {
    const list = isAnnouncement
      ? [...config.announcementBar.blocks]
      : [...config.mainHeader.blocks];
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    }

    const reordered = list.map((b, i) => ({ ...b, order: i + 1 }));
    if (isAnnouncement) {
      const next = { ...config, announcementBar: { ...config.announcementBar, blocks: reordered } };
      setConfig(next);
      pushHistory(next);
    } else {
      const next = { ...config, mainHeader: { ...config.mainHeader, blocks: reordered } };
      setConfig(next);
      pushHistory(next);
    }
  };

  // Drag and Drop Zone State
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggingBlockId(id);
  };

  const handleDropToZone = (e: React.DragEvent, targetZone: HeaderBlock['zone']) => {
    e.preventDefault();
    setDragOverZone(null);
    const blockId = e.dataTransfer.getData('text/plain') || draggingBlockId;
    if (!blockId) return;

    // Check in announcement bar
    const isTargetAnn = targetZone.startsWith('announcement');
    let foundBlock: HeaderBlock | undefined = config.announcementBar.blocks.find((b) => b.id === blockId);

    if (!foundBlock) {
      foundBlock = config.mainHeader.blocks.find((b) => b.id === blockId);
    }

    if (!foundBlock) return;

    const updatedBlock: HeaderBlock = {
      ...foundBlock,
      zone: targetZone,
    };

    // Remove from existing zones
    const newAnnBlocks = config.announcementBar.blocks.filter((b) => b.id !== blockId);
    const newMainBlocks = config.mainHeader.blocks.filter((b) => b.id !== blockId);

    // Add to target zone
    if (isTargetAnn) {
      newAnnBlocks.push(updatedBlock);
    } else {
      newMainBlocks.push(updatedBlock);
    }

    const next = {
      ...config,
      announcementBar: { ...config.announcementBar, blocks: newAnnBlocks },
      mainHeader: { ...config.mainHeader, blocks: newMainBlocks },
    };

    setConfig(next);
    pushHistory(next);
    setDraggingBlockId(null);
    showToast(`Moved block to ${targetZone.replace('.', ' ').toUpperCase()}`, 'success');
  };

  const addBlockToZone = (zone: HeaderBlock['zone'], typeKey: string) => {
    const isAnn = zone.startsWith('announcement');
    const newId = `${typeKey.replace('nav_split_', 'nav_')}_${Date.now().toString().slice(-4)}`;

    let type: HeaderBlock['type'] = typeKey as any;
    let settings: Record<string, any> = { text: activeTenant.name };

    if (typeKey === 'nav_split_left') {
      type = 'navigation';
      settings = { splitSide: 'first-half', label: 'Navigation (Left Half)' };
    } else if (typeKey === 'nav_split_right') {
      type = 'navigation';
      settings = { splitSide: 'second-half', label: 'Navigation (Right Half)' };
    } else if (typeKey === 'navigation') {
      type = 'navigation';
      settings = { splitSide: 'all', label: 'Primary Navigation' };
    } else if (typeKey === 'logo') {
      settings = { logoText: activeTenant.name, badgeText: activeTenant.tagline };
    } else if (typeKey === 'search') {
      settings = { mode: 'icon-label', label: 'SEARCH', placeholder: 'Search...' };
    } else if (typeKey === 'announcement') {
      settings = { text: 'Special seasonal promotion live now • Limited quantities available •', ctaText: 'EXPLORE', ctaUrl: '/sale' };
    } else if (typeKey === 'whatsapp') {
      settings = { label: 'WhatsApp Concierge', phone: '18004125864' };
    } else if (typeKey === 'cta') {
      settings = { label: 'BOOK CONSULTATION', url: '/contact' };
    }

    const newBlock: HeaderBlock = {
      id: newId,
      type,
      zone,
      enabled: true,
      order: 99,
      settings,
      responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
    };

    if (isAnn) {
      const next = {
        ...config,
        announcementBar: {
          ...config.announcementBar,
          blocks: [...config.announcementBar.blocks, newBlock],
        },
      };
      setConfig(next);
      pushHistory(next);
    } else {
      const next = {
        ...config,
        mainHeader: {
          ...config.mainHeader,
          blocks: [...config.mainHeader.blocks, newBlock],
        },
      };
      setConfig(next);
      pushHistory(next);
    }
    showToast(`Added ${newBlock.type} to ${zone.replace('.', ' ')}`, 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-slate-100 p-8 space-y-6">
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-purple-500 animate-pulse z-50" />
        
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-rose-500 border-r-indigo-500 animate-spin" />
          <div className="absolute w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-950/50 text-xs font-bold text-white">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            Loading {activeTenant?.name || 'Store'} Header Studio
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Fetching {activeTenant?.name || 'store'} configuration &amp; live schema from MongoDB Atlas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Visual Theme Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({activeTenant.slug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-rose-400" />
            Header &amp; Navigation Builder
          </h1>
          <p className="text-xs text-slate-400">
            Design, arrange, customize colors, typography, and mega menus for your storefront header in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            title="Choose from curated luxury header templates"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Layout Templates</span>
          </button>

          <button
            onClick={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
            title="Toggle Live Storefront Preview"
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isLivePreviewOpen
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isLivePreviewOpen ? 'Hide Live Preview' : 'Live Preview'}</span>
          </button>

          <button
            onClick={handleUndo}
            disabled={historyIdx <= 0}
            title="Undo"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetToDefault}
            title="Reset to default template"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 rotate-180" />
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublishLive}
            disabled={isSaving || isPublishing}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'canvas'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Zone Layout &amp; Canvas</span>
        </button>

        <button
          onClick={() => setActiveTab('navigation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'navigation'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Navigation &amp; Mega Menus ({config.navigationMenu?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Theme &amp; Style Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('mobile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'mobile'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Drawer Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('sticky')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sticky'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Sticky, Device &amp; Campaigns</span>
        </button>
      </div>

      {/* Embedded Live Real-Time Interactive Header Preview */}
      {isLivePreviewOpen && (
        <div className="p-5 rounded-2xl bg-[#0F1117] border-2 border-emerald-500/50 shadow-2xl space-y-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Live Storefront Real-Time Preview
              </h3>
              <span className="text-[11px] text-slate-400">
                (Interactive WYSIWYG render of current canvas &amp; theme draft)
              </span>
            </div>
            <button
              onClick={() => setIsLivePreviewOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner">
            {/* Announcement Bar Live Preview */}
            {config.announcementBar?.enabled !== false && (
              <div
                className="w-full text-xs py-2 px-4 select-none relative overflow-hidden transition-colors"
                style={{
                  backgroundColor: config.announcementBar.styles?.backgroundColor || '#1E1B4B',
                  color: config.announcementBar.styles?.textColor || '#FFFFFF',
                  borderColor: config.announcementBar.styles?.borderColor || 'rgba(255,255,255,0.1)',
                  fontSize: config.announcementBar.styles?.fontSize || '11px',
                  fontFamily: config.announcementBar.styles?.fontFamily,
                  letterSpacing: config.announcementBar.styles?.letterSpacing || '0.05em',
                }}
              >
                {config.announcementBar.mode === 'marquee' ? (
                  <div className="flex w-max items-center animate-marquee">
                    <span className="px-6 font-semibold uppercase tracking-wider">
                      {config.announcementBar.blocks
                        .filter((b) => b.enabled !== false && b.responsive?.[device]?.visible !== false)
                        .map((b) => b.settings?.text)
                        .filter(Boolean)
                        .join('   ✦   ') ||
                        'COMPLIMENTARY WORLDWIDE EXPRESS DELIVERY • EXCLUSIVE ATELIER LUXURY PACKAGING'}
                    </span>
                    <span className="px-6 font-semibold uppercase tracking-wider">
                      {config.announcementBar.blocks
                        .filter((b) => b.enabled !== false && b.responsive?.[device]?.visible !== false)
                        .map((b) => b.settings?.text)
                        .filter(Boolean)
                        .join('   ✦   ') ||
                        'COMPLIMENTARY WORLDWIDE EXPRESS DELIVERY • EXCLUSIVE ATELIER LUXURY PACKAGING'}
                    </span>
                  </div>
                ) : config.announcementBar.mode === 'countdown' ? (
                  <div className="flex items-center justify-center gap-3 font-mono font-bold">
                    <span className="font-sans font-semibold tracking-wider text-xs uppercase">
                      {config.announcementBar.countdown?.label || 'FLASH SALE'}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] bg-black/20 px-2.5 py-0.5 rounded-full border border-white/10">
                      <span>03d</span>
                      <span>14h</span>
                      <span>:</span>
                      <span>22m</span>
                      <span>:</span>
                      <span className="text-amber-300">45s</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {config.announcementBar.blocks
                        .filter((b) => b.zone === 'announcement.left' && b.enabled !== false && b.responsive?.[device]?.visible !== false)
                        .map((b) => (
                          <span key={b.id} className="opacity-90">{b.settings?.text || b.settings?.label || b.type.toUpperCase()}</span>
                        ))}
                    </div>
                    <div className="flex-1 text-center font-medium">
                      {config.announcementBar.blocks
                        .filter((b) => b.zone === 'announcement.center' && b.enabled !== false && b.responsive?.[device]?.visible !== false)
                        .map((b) => (
                          <span key={b.id} className="font-bold">{b.settings?.text || 'Announcement Text'}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                      {config.announcementBar.blocks
                        .filter((b) => b.zone === 'announcement.right' && b.enabled !== false && b.responsive?.[device]?.visible !== false)
                        .map((b) => (
                          <span key={b.id} className="opacity-90">{b.settings?.text || b.settings?.label || b.type.toUpperCase()}</span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Header Live Preview */}
            <div
              className="w-full px-6 py-4 flex items-center justify-between transition-colors"
              style={{
                backgroundColor: config.mainHeader.styles?.backgroundColor || '#FFFDFC',
                color: config.mainHeader.styles?.textColor || '#111111',
                borderBottom: `${config.mainHeader.styles?.borderBottomWidth || '1px'} solid ${config.mainHeader.styles?.borderColor || '#E8DED8'}`,
                fontFamily: config.mainHeader.styles?.fontFamily,
              }}
            >
              {/* Left Zone */}
              <div className="flex items-center gap-4 flex-1">
                {config.mainHeader.blocks
                  .filter((b) => b.zone === 'main.left' && b.enabled !== false && b.responsive?.[device]?.visible !== false)
                  .map((b) => {
                    if (b.type === 'logo') {
                      return (
                        <div key={b.id} className="font-serif font-black text-lg tracking-wider">
                          {b.settings?.logoText || activeTenant.name.toUpperCase()}
                        </div>
                      );
                    }
                    if (b.type === 'navigation') {
                      const split = b.settings?.splitSide;
                      const list =
                        split === 'first-half'
                          ? config.navigationMenu.slice(0, Math.ceil(config.navigationMenu.length / 2))
                          : split === 'second-half'
                          ? config.navigationMenu.slice(Math.ceil(config.navigationMenu.length / 2))
                          : config.navigationMenu;
                      return (
                        <div key={b.id} className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                          {list.map((item) => (
                            <span key={item.id} className="hover:opacity-75 cursor-pointer">{item.label}</span>
                          ))}
                        </div>
                      );
                    }
                    return <span key={b.id} className="text-xs">{b.settings?.label || b.type.toUpperCase()}</span>;
                  })}
              </div>

              {/* Center Zone */}
              <div className="flex items-center justify-center gap-4 flex-1">
                {config.mainHeader.blocks
                  .filter((b) => b.zone === 'main.center' && b.enabled !== false && b.responsive?.[device]?.visible !== false)
                  .map((b) => {
                    if (b.type === 'logo') {
                      return (
                        <div key={b.id} className="text-center">
                          <div className="font-serif font-black text-xl tracking-wider">
                            {b.settings?.logoText || activeTenant.name.toUpperCase()}
                          </div>
                          {b.settings?.badgeText && (
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-rose-600 block">
                              {b.settings.badgeText}
                            </span>
                          )}
                        </div>
                      );
                    }
                    if (b.type === 'navigation') {
                      return (
                        <div key={b.id} className="flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
                          {config.navigationMenu.map((item) => (
                            <span key={item.id} className="hover:opacity-75 cursor-pointer">{item.label}</span>
                          ))}
                        </div>
                      );
                    }
                    return <span key={b.id} className="text-xs">{b.settings?.text || b.type.toUpperCase()}</span>;
                  })}
              </div>

              {/* Right Zone */}
              <div className="flex items-center justify-end gap-4 flex-1">
                {config.mainHeader.blocks
                  .filter((b) => b.zone === 'main.right' && b.enabled !== false && b.responsive?.[device]?.visible !== false)
                  .map((b) => {
                    if (b.type === 'navigation') {
                      const split = b.settings?.splitSide;
                      const list =
                        split === 'second-half'
                          ? config.navigationMenu.slice(Math.ceil(config.navigationMenu.length / 2))
                          : config.navigationMenu;
                      return (
                        <div key={b.id} className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                          {list.map((item) => (
                            <span key={item.id} className="hover:opacity-75 cursor-pointer">{item.label}</span>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <span key={b.id} className="text-xs font-semibold uppercase tracking-wider">
                        {b.settings?.label || b.type.toUpperCase()}
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Zone Layout & Canvas */}
      {activeTab === 'canvas' && (
        <div className="w-full space-y-6">
          {/* Zone 1: Announcement Bar */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Announcement &amp; Utility Bar</h3>
                  <p className="text-[11px] text-slate-400">Top row for promo alerts, phone/WhatsApp concierge, and currency switcher.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Per-device bar visibility badges */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  {/* Desktop Toggle */}
                  <button
                    onClick={() => {
                      const current = config.announcementBar.responsive?.desktop !== false;
                      const next = {
                        ...config,
                        announcementBar: {
                          ...config.announcementBar,
                          responsive: { ...config.announcementBar.responsive, desktop: !current },
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                      showToast(`Announcement Bar ${!current ? 'enabled' : 'hidden'} on Desktop`, 'info');
                    }}
                    title="Toggle Bar on Desktop"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      config.announcementBar.responsive?.desktop !== false
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-900/60 opacity-60'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>

                  {/* Tablet Toggle */}
                  <button
                    onClick={() => {
                      const current = !config.announcementBar.hideOnTablet && config.announcementBar.responsive?.tablet !== false;
                      const next = {
                        ...config,
                        announcementBar: {
                          ...config.announcementBar,
                          hideOnTablet: current,
                          responsive: { ...config.announcementBar.responsive, tablet: !current },
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                      showToast(`Announcement Bar ${!current ? 'enabled' : 'hidden'} on Tablet`, 'info');
                    }}
                    title="Toggle Bar on Tablet"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      !config.announcementBar.hideOnTablet && config.announcementBar.responsive?.tablet !== false
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-900/60 opacity-60'
                    }`}
                  >
                    <Tablet className="w-3 h-3" />
                    <span>Tablet</span>
                  </button>

                  {/* Mobile Toggle */}
                  <button
                    onClick={() => {
                      const current = !config.announcementBar.hideOnMobile && config.announcementBar.responsive?.mobile !== false;
                      const next = {
                        ...config,
                        announcementBar: {
                          ...config.announcementBar,
                          hideOnMobile: current,
                          responsive: { ...config.announcementBar.responsive, mobile: !current },
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                      showToast(`Announcement Bar ${!current ? 'enabled' : 'hidden'} on Mobile`, 'info');
                    }}
                    title="Toggle Bar on Mobile"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      !config.announcementBar.hideOnMobile && config.announcementBar.responsive?.mobile !== false
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-900/60 opacity-60'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <span>Enable Bar</span>
                  <input
                    type="checkbox"
                    checked={config.announcementBar.enabled}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        announcementBar: { ...config.announcementBar, enabled: e.target.checked },
                      };
                      setConfig(next);
                      pushHistory(next);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Zones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone('announcement.left');
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropToZone(e, 'announcement.left')}
                className={`p-4 rounded-xl transition-all space-y-3 ${
                  dragOverZone === 'announcement.left'
                    ? 'bg-indigo-950/40 border-2 border-dashed border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Left Zone</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('announcement.left', e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="icon">✦ Icon + Text</option>
                    <option value="whatsapp">WhatsApp Concierge</option>
                    <option value="phone">Phone Support</option>
                    <option value="text">Static Text</option>
                    <option value="currency">🌐 Currency Switcher</option>
                    <option value="cta">Custom CTA</option>
                    <option value="announcement">Promo Banner</option>
                    <option value="logo">Brand Logo</option>
                    <option value="navigation">Menu Links</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[100px]">
                  {config.announcementBar.blocks
                    .filter((b) => b.zone === 'announcement.left')
                    .map((block) => {
                      const isVis = block.enabled !== false && block.responsive?.[device]?.visible !== false;
                      return (
                        <div
                          key={block.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, block.id)}
                          onDragEnd={() => setDraggingBlockId(null)}
                          className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all cursor-grab active:cursor-grabbing hover:border-indigo-500/50 ${
                            isVis
                              ? 'bg-slate-800/80 border-slate-700 text-white'
                              : 'bg-slate-950/40 border-dashed border-rose-500/40 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-bold truncate">{block.settings?.text || block.settings?.label || block.type}</span>
                            {!isVis && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 shrink-0">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleDeviceVisibility(block.id, true, device)}
                              className="p-1 hover:text-white"
                              title={`Toggle ${device} visibility`}
                            >
                              {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                            </button>
                            <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400" title="Edit Block">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteBlock(block.id, true)} className="p-1 hover:text-rose-500" title="Delete Block">
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Center Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone('announcement.center');
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropToZone(e, 'announcement.center')}
                className={`p-4 rounded-xl transition-all space-y-3 ${
                  dragOverZone === 'announcement.center'
                    ? 'bg-indigo-950/40 border-2 border-dashed border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Center Zone</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('announcement.center', e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="announcement">Promo Banner + CTA</option>
                    <option value="text">Announcement Text</option>
                    <option value="whatsapp">WhatsApp Concierge</option>
                    <option value="phone">Phone Support</option>
                    <option value="currency">🌐 Currency Switcher</option>
                    <option value="logo">Brand Logo</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[100px]">
                  {config.announcementBar.blocks
                    .filter((b) => b.zone === 'announcement.center')
                    .map((block) => {
                      const isVis = block.enabled !== false && block.responsive?.[device]?.visible !== false;
                      return (
                        <div
                          key={block.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, block.id)}
                          onDragEnd={() => setDraggingBlockId(null)}
                          className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all cursor-grab active:cursor-grabbing hover:border-indigo-500/50 ${
                            isVis
                              ? 'bg-slate-800/80 border-slate-700 text-white'
                              : 'bg-slate-950/40 border-dashed border-rose-500/40 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="truncate flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-bold truncate">{block.settings?.text || 'Announcement'}</span>
                            {!isVis && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 shrink-0">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleDeviceVisibility(block.id, true, device)}
                              className="p-1 hover:text-white"
                              title={`Toggle ${device} visibility`}
                            >
                              {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                            </button>
                            <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400" title="Edit Block">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteBlock(block.id, true)} className="p-1 hover:text-rose-500" title="Delete Block">
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone('announcement.right');
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropToZone(e, 'announcement.right')}
                className={`p-4 rounded-xl transition-all space-y-3 ${
                  dragOverZone === 'announcement.right'
                    ? 'bg-indigo-950/40 border-2 border-dashed border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Right Zone</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('announcement.right', e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="currency">🌐 Currency Switcher</option>
                    <option value="text">Store Label</option>
                    <option value="cta">Custom CTA</option>
                    <option value="whatsapp">WhatsApp Concierge</option>
                    <option value="phone">Phone Support</option>
                    <option value="icon">✦ Icon + Text</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[100px]">
                  {config.announcementBar.blocks
                    .filter((b) => b.zone === 'announcement.right')
                    .map((block) => {
                      const isVis = block.enabled !== false && block.responsive?.[device]?.visible !== false;
                      return (
                        <div
                          key={block.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, block.id)}
                          onDragEnd={() => setDraggingBlockId(null)}
                          className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all cursor-grab active:cursor-grabbing hover:border-indigo-500/50 ${
                            isVis
                              ? 'bg-slate-800/80 border-slate-700 text-white'
                              : 'bg-slate-950/40 border-dashed border-rose-500/40 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="truncate flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-bold truncate">{block.settings?.text || block.type}</span>
                            {!isVis && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 shrink-0">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleDeviceVisibility(block.id, true, device)}
                              className="p-1 hover:text-white"
                              title={`Toggle ${device} visibility`}
                            >
                              {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                            </button>
                            <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400" title="Edit Block">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteBlock(block.id, true)} className="p-1 hover:text-rose-500" title="Delete Block">
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Announcement Mode Settings: Static vs Rotate vs Marquee vs Countdown */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Announcement Display Mode</h4>
                  <p className="text-[11px] text-slate-400">Choose between static display, auto-rotation, smooth marquee ticker, or live countdown timer.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        mode: 'static' as const,
                        rotationEnabled: false,
                      },
                    };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    (!config.announcementBar.mode || config.announcementBar.mode === 'static') && !config.announcementBar.rotationEnabled
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block">📌 Static Banner</span>
                  <span className="text-[10px] opacity-75 font-normal">Fixed central alert</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        mode: 'rotate' as const,
                        rotationEnabled: true,
                      },
                    };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    config.announcementBar.mode === 'rotate' || config.announcementBar.rotationEnabled
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block">🔄 Auto-Rotate</span>
                  <span className="text-[10px] opacity-75 font-normal">Cycles every 5s</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        mode: 'marquee' as const,
                        rotationEnabled: false,
                      },
                    };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    config.announcementBar.mode === 'marquee'
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block">⚡ Marquee Ticker</span>
                  <span className="text-[10px] opacity-75 font-normal">Smooth infinite scroll</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        mode: 'countdown' as const,
                        rotationEnabled: false,
                        countdown: config.announcementBar.countdown || {
                          targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                          label: 'FLASH SALE: 25% OFF APPAREL',
                        },
                      },
                    };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    config.announcementBar.mode === 'countdown'
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block">⏳ Countdown Clock</span>
                  <span className="text-[10px] opacity-75 font-normal">Live flash sale timer</span>
                </button>
              </div>

              {/* Countdown Configuration */}
              {config.announcementBar.mode === 'countdown' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 animate-in fade-in">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Campaign Label / Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. FLASH SALE: 25% OFF APPAREL"
                      value={config.announcementBar.countdown?.label || ''}
                      onChange={(e) => {
                        const next = {
                          ...config,
                          announcementBar: {
                            ...config.announcementBar,
                            countdown: {
                              ...(config.announcementBar.countdown || { targetDate: new Date().toISOString() }),
                              label: e.target.value,
                            },
                          },
                        };
                        setConfig(next);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Expiry Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      value={config.announcementBar.countdown?.targetDate ? new Date(config.announcementBar.countdown.targetDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const dateStr = e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString();
                        const next = {
                          ...config,
                          announcementBar: {
                            ...config.announcementBar,
                            countdown: {
                              ...(config.announcementBar.countdown || { label: 'FLASH SALE' }),
                              targetDate: dateStr,
                            },
                          },
                        };
                        setConfig(next);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zone 2: Main Header Row */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                  M
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Main Ecommerce Navigation Row</h3>
                  <p className="text-[11px] text-slate-400">Controls Brand Logo, Main Navigation links, Search, Wishlist, Cart, and Account.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Per-device Main Header visibility badges */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  {/* Desktop Toggle */}
                  <button
                    onClick={() => {
                      const current = config.mainHeader.responsive?.desktop !== false;
                      const next = {
                        ...config,
                        mainHeader: {
                          ...config.mainHeader,
                          responsive: { ...config.mainHeader.responsive, desktop: !current },
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                      showToast(`Main Header ${!current ? 'enabled' : 'hidden'} on Desktop`, 'info');
                    }}
                    title="Toggle Main Header on Desktop"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      config.mainHeader.responsive?.desktop !== false
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-900/60 opacity-60'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>

                  {/* Tablet Toggle */}
                  <button
                    onClick={() => {
                      const current = !config.mainHeader.hideOnTablet && config.mainHeader.responsive?.tablet !== false;
                      const next = {
                        ...config,
                        mainHeader: {
                          ...config.mainHeader,
                          hideOnTablet: current,
                          responsive: { ...config.mainHeader.responsive, tablet: !current },
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                      showToast(`Main Header ${!current ? 'enabled' : 'hidden'} on Tablet`, 'info');
                    }}
                    title="Toggle Main Header on Tablet"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      !config.mainHeader.hideOnTablet && config.mainHeader.responsive?.tablet !== false
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-900/60 opacity-60'
                    }`}
                  >
                    <Tablet className="w-3 h-3" />
                    <span>Tablet</span>
                  </button>

                  {/* Mobile Toggle */}
                  <button
                    onClick={() => {
                      const current = !config.mainHeader.hideOnMobile && config.mainHeader.responsive?.mobile !== false;
                      const next = {
                        ...config,
                        mainHeader: {
                          ...config.mainHeader,
                          hideOnMobile: current,
                          responsive: { ...config.mainHeader.responsive, mobile: !current },
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                      showToast(`Main Header ${!current ? 'enabled' : 'hidden'} on Mobile`, 'info');
                    }}
                    title="Toggle Main Header on Mobile"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      !config.mainHeader.hideOnMobile && config.mainHeader.responsive?.mobile !== false
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-900/60 opacity-60'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <span>Enable Row</span>
                  <input
                    type="checkbox"
                    checked={config.mainHeader.enabled !== false}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        mainHeader: { ...config.mainHeader, enabled: e.target.checked },
                      };
                      setConfig(next);
                      pushHistory(next);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Left Zone (Logo, Split Menu, etc.) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone('main.left');
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropToZone(e, 'main.left')}
                className={`p-4 rounded-xl transition-all space-y-3 ${
                  dragOverZone === 'main.left'
                    ? 'bg-indigo-950/40 border-2 border-dashed border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Main Left</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('main.left', e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="logo">Brand Logo</option>
                    <option value="brand">Brand Name</option>
                    <option value="tagline">Tagline</option>
                    <option value="nav_split_left">Split Menu (Left Half - 1st 50%)</option>
                    <option value="navigation">Primary Navigation (Full)</option>
                    <option value="search">Search Bar</option>
                    <option value="cta">Custom CTA</option>
                    <option value="whatsapp">WhatsApp Concierge</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {config.mainHeader.blocks
                    .filter((b) => b.zone === 'main.left')
                    .map((block) => {
                      const isVis = block.enabled !== false && block.responsive?.[device]?.visible !== false;
                      const displayName =
                        block.type === 'navigation'
                          ? block.settings?.splitSide === 'first-half'
                            ? 'Menu (Left Half)'
                            : block.settings?.splitSide === 'second-half'
                            ? 'Menu (Right Half)'
                            : `Primary Navigation (${config.navigationMenu?.length || 0} links)`
                          : block.settings?.logoText || block.settings?.text || block.settings?.label || block.type.toUpperCase();

                      return (
                        <div
                          key={block.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, block.id)}
                          onDragEnd={() => setDraggingBlockId(null)}
                          className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all cursor-grab active:cursor-grabbing hover:border-indigo-500/50 ${
                            isVis
                              ? 'bg-slate-800/80 border-slate-700 text-white'
                              : 'bg-slate-950/40 border-dashed border-rose-500/40 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="truncate flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-bold truncate">{displayName}</span>
                            {!isVis && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 shrink-0">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleDeviceVisibility(block.id, false, device)}
                              className="p-1 hover:text-white"
                              title={`Toggle ${device} visibility`}
                            >
                              {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                            </button>
                            <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400" title="Edit Block">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteBlock(block.id, false)} className="p-1 hover:text-rose-500" title="Delete Block">
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Main Center Zone (Centered Logo, Navigation, etc.) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone('main.center');
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropToZone(e, 'main.center')}
                className={`p-4 rounded-xl transition-all space-y-3 ${
                  dragOverZone === 'main.center'
                    ? 'bg-indigo-950/40 border-2 border-dashed border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Main Center</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('main.center', e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="logo">Centered Brand Logo</option>
                    <option value="navigation">Primary Navigation (Full Menu)</option>
                    <option value="search">Inline Search Bar</option>
                    <option value="brand">Brand Name</option>
                    <option value="tagline">Tagline</option>
                    <option value="cta">Centered CTA</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {config.mainHeader.blocks
                    .filter((b) => b.zone === 'main.center')
                    .map((block) => {
                      const isVis = block.enabled !== false && block.responsive?.[device]?.visible !== false;
                      const displayName =
                        block.type === 'navigation'
                          ? block.settings?.splitSide === 'first-half'
                            ? 'Menu (Left Half)'
                            : block.settings?.splitSide === 'second-half'
                            ? 'Menu (Right Half)'
                            : `Primary Navigation (${config.navigationMenu?.length || 0} links)`
                          : block.settings?.logoText || block.settings?.text || block.settings?.label || block.type.toUpperCase();

                      return (
                        <div
                          key={block.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, block.id)}
                          onDragEnd={() => setDraggingBlockId(null)}
                          className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all cursor-grab active:cursor-grabbing hover:border-indigo-500/50 ${
                            isVis
                              ? 'bg-slate-800/80 border-slate-700 text-white'
                              : 'bg-slate-950/40 border-dashed border-rose-500/40 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="truncate flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-bold truncate">{displayName}</span>
                            {!isVis && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 shrink-0">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleDeviceVisibility(block.id, false, device)}
                              className="p-1 hover:text-white"
                              title={`Toggle ${device} visibility`}
                            >
                              {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                            </button>
                            {block.type === 'navigation' && (
                              <button onClick={() => setActiveTab('navigation')} className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold">
                                Links
                              </button>
                            )}
                            <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400" title="Edit Block">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteBlock(block.id, false)} className="p-1 hover:text-rose-500" title="Delete Block">
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Main Right Zone (Utilities, Split Menu, etc.) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone('main.right');
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropToZone(e, 'main.right')}
                className={`p-4 rounded-xl transition-all space-y-3 ${
                  dragOverZone === 'main.right'
                    ? 'bg-indigo-950/40 border-2 border-dashed border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Main Right</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('main.right', e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="search">🔍 Search Button</option>
                    <option value="wishlist">♡ Wishlist Button</option>
                    <option value="cart">🛍 Bag / Cart Button</option>
                    <option value="account">👤 Sign In / Account</option>
                    <option value="nav_split_right">Split Menu (Right Half - 2nd 50%)</option>
                    <option value="navigation">Primary Navigation (Full)</option>
                    <option value="currency">🌐 Currency Picker</option>
                    <option value="cta">Custom CTA</option>
                    <option value="logo">Brand Logo</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {config.mainHeader.blocks
                    .filter((b) => b.zone === 'main.right')
                    .map((block) => {
                      const isVis = block.enabled !== false && block.responsive?.[device]?.visible !== false;
                      const displayName =
                        block.type === 'navigation'
                          ? block.settings?.splitSide === 'first-half'
                            ? 'Menu (Left Half)'
                            : block.settings?.splitSide === 'second-half'
                            ? 'Menu (Right Half)'
                            : `Menu (${config.navigationMenu?.length || 0} links)`
                          : block.settings?.label || block.settings?.logoText || block.settings?.text || block.type.toUpperCase();

                      return (
                        <div
                          key={block.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, block.id)}
                          onDragEnd={() => setDraggingBlockId(null)}
                          className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all cursor-grab active:cursor-grabbing hover:border-indigo-500/50 ${
                            isVis
                              ? 'bg-slate-800/80 border-slate-700 text-white'
                              : 'bg-slate-950/40 border-dashed border-rose-500/40 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-bold uppercase tracking-wider truncate">{displayName}</span>
                            {!isVis && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 shrink-0">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleDeviceVisibility(block.id, false, device)}
                              className="p-1 hover:text-white"
                              title={`Toggle ${device} visibility`}
                            >
                              {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                            </button>
                            <button onClick={() => moveBlock(block.id, false, 'up')} className="p-1 hover:text-white" title="Move Up">
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button onClick={() => moveBlock(block.id, false, 'down')} className="p-1 hover:text-white" title="Move Down">
                              <MoveDown className="w-3 h-3" />
                            </button>
                            <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400" title="Edit Block">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteBlock(block.id, false)} className="p-1 hover:text-rose-500" title="Delete Block">
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Navigation & Mega Menus */}
      {activeTab === 'navigation' && (
        <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Store Navigation Menu Items</h3>
              <p className="text-xs text-slate-400">Add, reorder, assign badges (FRESH, HOT, SALE), and configure multi-column Mega Menus.</p>
            </div>
            <button
              onClick={() => {
                const newItem: NavigationItem = {
                  id: `nav_${Date.now()}`,
                  label: 'NEW ITEM',
                  url: '/women',
                  order: (config.navigationMenu?.length || 0) + 1,
                  enabled: true,
                };
                const next = { ...config, navigationMenu: [...(config.navigationMenu || []), newItem] };
                setConfig(next);
                pushHistory(next);
                setEditingNavIndex(next.navigationMenu.length - 1);
                setIsNavModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.navigationMenu?.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400">#{idx + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.label}</span>
                      {item.badge && (
                        <span
                          className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase text-white"
                          style={{ backgroundColor: item.badge.bg || '#F59E0B' }}
                        >
                          {item.badge.text}
                        </span>
                      )}
                      {item.megaMenu?.enabled && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Mega Menu ({item.megaMenu.columns?.length || 0} cols)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{item.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (idx > 0) {
                        const list = [...config.navigationMenu];
                        const temp = list[idx];
                        list[idx] = list[idx - 1];
                        list[idx - 1] = temp;
                        const next = { ...config, navigationMenu: list };
                        setConfig(next);
                        pushHistory(next);
                      }
                    }}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (idx < config.navigationMenu.length - 1) {
                        const list = [...config.navigationMenu];
                        const temp = list[idx];
                        list[idx] = list[idx + 1];
                        list[idx + 1] = temp;
                        const next = { ...config, navigationMenu: list };
                        setConfig(next);
                        pushHistory(next);
                      }
                    }}
                    disabled={idx === config.navigationMenu.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingNavIndex(idx);
                      setIsNavModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-rose-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      const next = {
                        ...config,
                        navigationMenu: config.navigationMenu.filter((_, i) => i !== idx),
                      };
                      setConfig(next);
                      pushHistory(next);
                      showToast('Deleted menu item', 'info');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Theme & Style Colors */}
      {activeTab === 'theme' && (
        <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Header Theme &amp; Color Palette</h3>
            <p className="text-xs text-slate-400">Configure global background, text colors, accent highlights, and typography tokens.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Main Header Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.mainHeader.styles.backgroundColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, backgroundColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.mainHeader.styles.backgroundColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, backgroundColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Main Header Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.mainHeader.styles.textColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, textColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.mainHeader.styles.textColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, textColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Accent Highlight Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.mainHeader.styles.accentColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, accentColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.mainHeader.styles.accentColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, accentColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Announcement Bar Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.announcementBar.styles.backgroundColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        styles: { ...config.announcementBar.styles, backgroundColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.announcementBar.styles.backgroundColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        styles: { ...config.announcementBar.styles, backgroundColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Announcement Bar Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.announcementBar.styles.textColor || '#FFFFFF'}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        styles: { ...config.announcementBar.styles, textColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.announcementBar.styles.textColor || '#FFFFFF'}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        styles: { ...config.announcementBar.styles, textColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Typography Font Family</label>
              <select
                value={config.mainHeader.styles.fontFamily}
                onChange={(e) => {
                  const next = {
                    ...config,
                    mainHeader: {
                      ...config.mainHeader,
                      styles: { ...config.mainHeader.styles, fontFamily: e.target.value },
                    },
                  };
                  setConfig(next);
                  pushHistory(next);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
              >
                <option value="Playfair Display, serif">Playfair Display (Luxury Editorial)</option>
                <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Modern Clean)</option>
                <option value="Inter, sans-serif">Inter (Minimalist Neo-Grotesque)</option>
                <option value="Cinzel, serif">Cinzel (Classical Haute Roman)</option>
                <option value="Montserrat, sans-serif">Montserrat (Geometric Bold)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Sticky & Responsive Settings */}
      {activeTab === 'sticky' && (
        <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Sticky Header &amp; Mobile Drawer Settings</h3>
            <p className="text-xs text-slate-400">Configure scroll thresholds, shrink animations, and mobile drawer styling.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sticky Behavior</h4>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sticky.enabled}
                  onChange={(e) => {
                    const next = { ...config, sticky: { ...config.sticky, enabled: e.target.checked } };
                    setConfig(next);
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>Enable Sticky Header</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sticky.shrinkOnScroll}
                  onChange={(e) => {
                    const next = { ...config, sticky: { ...config.sticky, shrinkOnScroll: e.target.checked } };
                    setConfig(next);
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>Shrink Height on Scroll (80px &rarr; 68px)</span>
              </label>
            </div>

            {/* Responsive Device Display Rules Card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                Responsive Device Display Rules
              </h4>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <div>
                    <span className="font-bold text-white block">Show Announcement Bar on Mobile</span>
                    <span className="text-[11px] text-slate-400">Keep top promo alerts visible on mobile phones</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!config.announcementBar.hideOnMobile && config.announcementBar.responsive?.mobile !== false}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        announcementBar: {
                          ...config.announcementBar,
                          hideOnMobile: !e.target.checked,
                          responsive: { ...config.announcementBar.responsive, mobile: e.target.checked },
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <div>
                    <span className="font-bold text-white block">Show Announcement Bar on Tablets</span>
                    <span className="text-[11px] text-slate-400">Display promo alerts on tablets (768px–1024px)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!config.announcementBar.hideOnTablet && config.announcementBar.responsive?.tablet !== false}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        announcementBar: {
                          ...config.announcementBar,
                          hideOnTablet: !e.target.checked,
                          responsive: { ...config.announcementBar.responsive, tablet: e.target.checked },
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <div>
                    <span className="font-bold text-white block">Show Announcement Bar on Desktop</span>
                    <span className="text-[11px] text-slate-400">Display promo alerts on full desktop monitors</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.announcementBar.responsive?.desktop !== false}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        announcementBar: {
                          ...config.announcementBar,
                          responsive: { ...config.announcementBar.responsive, desktop: e.target.checked },
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mobile Drawer Settings</h4>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mobile.drawer.showCurrency}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mobile: {
                        ...config.mobile,
                        drawer: { ...config.mobile.drawer, showCurrency: e.target.checked },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>Show Currency Selector in Drawer</span>
              </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.mobile.drawer.showSocialIcons}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        mobile: {
                          ...config.mobile,
                          drawer: { ...config.mobile.drawer, showSocialIcons: e.target.checked },
                        },
                      };
                      setConfig(next);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span>Show Social Icons in Drawer</span>
                </label>
              </div>

              {/* Scheduled Seasonal Campaign Headers */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scheduled Campaign Header Window</h4>
                      <p className="text-[11px] text-slate-400">Schedule header themes to automatically activate and revert during seasonal drops or flash sales.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.campaign?.enabled || false}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        campaign: {
                          enabled: e.target.checked,
                          name: config.campaign?.name || 'Seasonal Haute Drop 2026',
                          startDate: config.campaign?.startDate || new Date().toISOString().slice(0, 16),
                          endDate: config.campaign?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>

                {config.campaign?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Campaign Name</label>
                      <input
                        type="text"
                        value={config.campaign?.name || ''}
                        placeholder="e.g. Black Friday Haute Drop"
                        onChange={(e) => {
                          const next = {
                            ...config,
                            campaign: { ...config.campaign!, name: e.target.value },
                          };
                          setConfig(next);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Start Date &amp; Time</label>
                      <input
                        type="datetime-local"
                        value={config.campaign?.startDate ? new Date(config.campaign.startDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                          const next = {
                            ...config,
                            campaign: { ...config.campaign!, startDate: e.target.value },
                          };
                          setConfig(next);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">End Date &amp; Time</label>
                      <input
                        type="datetime-local"
                        value={config.campaign?.endDate ? new Date(config.campaign.endDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                          const next = {
                            ...config,
                            campaign: { ...config.campaign!, endDate: e.target.value },
                          };
                          setConfig(next);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}

      {/* Tab 5: Mobile Drawer Studio */}
      {activeTab === 'mobile' && (
        <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-400" />
                Mobile Navigation Drawer Studio
              </h3>
              <p className="text-xs text-slate-400">Customize what customers see when opening the sliding mobile menu.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mobile Drawer Colors */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Drawer Theme &amp; Colors</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400">Background Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.mobile.drawer.background || '#FFFDFC'}
                      onChange={(e) => {
                        const next = {
                          ...config,
                          mobile: {
                            ...config.mobile,
                            drawer: { ...config.mobile.drawer, background: e.target.value },
                          },
                        };
                        setConfig(next);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={config.mobile.drawer.background || '#FFFDFC'}
                      onChange={(e) => {
                        const next = {
                          ...config,
                          mobile: {
                            ...config.mobile,
                            drawer: { ...config.mobile.drawer, background: e.target.value },
                          },
                        };
                        setConfig(next);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-white flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Text Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.mobile.drawer.textColor || '#111111'}
                      onChange={(e) => {
                        const next = {
                          ...config,
                          mobile: {
                            ...config.mobile,
                            drawer: { ...config.mobile.drawer, textColor: e.target.value },
                          },
                        };
                        setConfig(next);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={config.mobile.drawer.textColor || '#111111'}
                      onChange={(e) => {
                        const next = {
                          ...config,
                          mobile: {
                            ...config.mobile,
                            drawer: { ...config.mobile.drawer, textColor: e.target.value },
                          },
                        };
                        setConfig(next);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-white flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links in Drawer */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Social Media Links</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400">Instagram Handle / URL</label>
                  <input
                    type="text"
                    value={config.mobile.drawer.socialLinks?.instagram || ''}
                    placeholder="https://instagram.com/lumina.atelier"
                    onChange={(e) => {
                      const next = {
                        ...config,
                        mobile: {
                          ...config.mobile,
                          drawer: {
                            ...config.mobile.drawer,
                            socialLinks: { ...(config.mobile.drawer.socialLinks || {}), instagram: e.target.value },
                          },
                        },
                      };
                      setConfig(next);
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">TikTok Handle / URL</label>
                  <input
                    type="text"
                    value={config.mobile.drawer.socialLinks?.tiktok || ''}
                    placeholder="https://tiktok.com/@lumina"
                    onChange={(e) => {
                      const next = {
                        ...config,
                        mobile: {
                          ...config.mobile,
                          drawer: {
                            ...config.mobile.drawer,
                            socialLinks: { ...(config.mobile.drawer.socialLinks || {}), tiktok: e.target.value },
                          },
                        },
                      };
                      setConfig(next);
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    value={config.mobile.drawer.socialLinks?.whatsapp || ''}
                    placeholder="e.g. 18004125864"
                    onChange={(e) => {
                      const next = {
                        ...config,
                        mobile: {
                          ...config.mobile,
                          drawer: {
                            ...config.mobile.drawer,
                            socialLinks: { ...(config.mobile.drawer.socialLinks || {}), whatsapp: e.target.value },
                          },
                        },
                      };
                      setConfig(next);
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Featured Lookbook Promo Card in Drawer */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Featured Promo Card in Drawer</h4>
                  <p className="text-[11px] text-slate-400">Display a rich promotional lookbook card at the bottom of the mobile navigation.</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.mobile.drawer.promoCard?.enabled !== false && !!config.mobile.drawer.promoCard?.heading}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mobile: {
                        ...config.mobile,
                        drawer: {
                          ...config.mobile.drawer,
                          promoCard: {
                            enabled: e.target.checked,
                            image: config.mobile.drawer.promoCard?.image || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80',
                            heading: config.mobile.drawer.promoCard?.heading || 'Autumn / Winter Couture 2026',
                            description: config.mobile.drawer.promoCard?.description || 'Sculptural silhouettes in double-faced wool & artisanal silks.',
                            ctaText: config.mobile.drawer.promoCard?.ctaText || 'Shop Collection',
                            ctaUrl: config.mobile.drawer.promoCard?.ctaUrl || '/women',
                          },
                        },
                      },
                    };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400">Card Image URL</label>
                  <input
                    type="text"
                    value={config.mobile.drawer.promoCard?.image || ''}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => {
                      const next = {
                        ...config,
                        mobile: {
                          ...config.mobile,
                          drawer: {
                            ...config.mobile.drawer,
                            promoCard: { ...(config.mobile.drawer.promoCard || { enabled: true, heading: '', description: '', ctaText: '', ctaUrl: '' }), image: e.target.value },
                          },
                        },
                      };
                      setConfig(next);
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Card Headline</label>
                  <input
                    type="text"
                    value={config.mobile.drawer.promoCard?.heading || ''}
                    placeholder="e.g. Autumn / Winter Couture 2026"
                    onChange={(e) => {
                      const next = {
                        ...config,
                        mobile: {
                          ...config.mobile,
                          drawer: {
                            ...config.mobile.drawer,
                            promoCard: { ...(config.mobile.drawer.promoCard || { enabled: true, image: '', description: '', ctaText: '', ctaUrl: '' }), heading: e.target.value },
                          },
                        },
                      };
                      setConfig(next);
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Card Subtitle / Description</label>
                  <input
                    type="text"
                    value={config.mobile.drawer.promoCard?.description || ''}
                    placeholder="e.g. Sculptural silhouettes in double-faced wool & silks."
                    onChange={(e) => {
                      const next = {
                        ...config,
                        mobile: {
                          ...config.mobile,
                          drawer: {
                            ...config.mobile.drawer,
                            promoCard: { ...(config.mobile.drawer.promoCard || { enabled: true, image: '', heading: '', ctaText: '', ctaUrl: '' }), description: e.target.value },
                          },
                        },
                      };
                      setConfig(next);
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">CTA Button Text</label>
                    <input
                      type="text"
                      value={config.mobile.drawer.promoCard?.ctaText || ''}
                      placeholder="Shop Collection"
                      onChange={(e) => {
                        const next = {
                          ...config,
                          mobile: {
                            ...config.mobile,
                            drawer: {
                              ...config.mobile.drawer,
                              promoCard: { ...(config.mobile.drawer.promoCard || { enabled: true, image: '', heading: '', description: '', ctaUrl: '' }), ctaText: e.target.value },
                            },
                          },
                        };
                        setConfig(next);
                      }}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">CTA Target URL</label>
                    <input
                      type="text"
                      value={config.mobile.drawer.promoCard?.ctaUrl || ''}
                      placeholder="/women"
                      onChange={(e) => {
                        const next = {
                          ...config,
                          mobile: {
                            ...config.mobile,
                            drawer: {
                              ...config.mobile.drawer,
                              promoCard: { ...(config.mobile.drawer.promoCard || { enabled: true, image: '', heading: '', description: '', ctaText: '' }), ctaUrl: e.target.value },
                            },
                          },
                        };
                        setConfig(next);
                      }}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Inspector Modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-slate-700 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Edit {editingBlock.type} Block Settings
              </h3>
              <button onClick={() => setEditingBlock(null)} className="p-1 hover:text-white text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
              {/* Common Label / Text field */}
              {editingBlock.type !== 'divider' && editingBlock.type !== 'spacer' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Text / Label Content</label>
                  <input
                    type="text"
                    value={editingBlock.settings?.text || editingBlock.settings?.label || editingBlock.settings?.logoText || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingBlock({
                        ...editingBlock,
                        settings: {
                          ...editingBlock.settings,
                          text: val,
                          label: val,
                          logoText: val,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                  />
                </div>
              )}

              {/* Logo specific fields */}
              {editingBlock.type === 'logo' && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">Tagline / Subtitle Badge</label>
                    <input
                      type="text"
                      value={editingBlock.settings?.badgeText || ''}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          settings: { ...editingBlock.settings, badgeText: e.target.value },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <ImageUploadInput
                    label="Custom Logo Image"
                    description="Upload your high-res store logo asset"
                    value={editingBlock.settings?.logoUrl || ''}
                    onChange={(url) => {
                      setEditingBlock({
                        ...editingBlock,
                        settings: { ...editingBlock.settings, logoUrl: url },
                      });
                    }}
                    aspectRatio="auto"
                    folder="Header"
                  />
                </>
              )}

              {/* Announcement specific CTA fields */}
              {editingBlock.type === 'announcement' && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">CTA Button Text</label>
                    <input
                      type="text"
                      value={editingBlock.settings?.ctaText || ''}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          settings: { ...editingBlock.settings, ctaText: e.target.value },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">CTA Link Destination</label>
                    <input
                      type="text"
                      value={editingBlock.settings?.ctaUrl || ''}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          settings: { ...editingBlock.settings, ctaUrl: e.target.value },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </>
              )}

              {/* Zone Placement Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Header Zone Placement
                </label>
                <select
                  value={editingBlock.zone}
                  onChange={(e) => {
                    setEditingBlock({
                      ...editingBlock,
                      zone: e.target.value as any,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold cursor-pointer"
                >
                  <optgroup label="Main Header Row">
                    <option value="main.left">Main Left (Logo &amp; Brand / Left Split Menu)</option>
                    <option value="main.center">Main Center (Navigation / Centered Logo)</option>
                    <option value="main.right">Main Right (Utilities / Right Split Menu)</option>
                  </optgroup>
                  <optgroup label="Announcement Bar Row">
                    <option value="announcement.left">Announcement Left (Concierge / Info)</option>
                    <option value="announcement.center">Announcement Center (Promo Banner)</option>
                    <option value="announcement.right">Announcement Right (Currency / CTA)</option>
                  </optgroup>
                </select>
              </div>

              {/* Navigation Split Side Options */}
              {editingBlock.type === 'navigation' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <label className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Menu className="w-3.5 h-3.5 text-indigo-400" />
                    Navigation Portion (Split Menu Mode)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Use split portions when placing a centered logo between two navigation halves:
                  </p>
                  <select
                    value={editingBlock.settings?.splitSide || 'all'}
                    onChange={(e) => {
                      setEditingBlock({
                        ...editingBlock,
                        settings: {
                          ...editingBlock.settings,
                          splitSide: e.target.value,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-indigo-500/40 text-white font-semibold cursor-pointer"
                  >
                    <option value="all">Full Menu (All Navigation Links)</option>
                    <option value="first-half">Left Half (1st 50% of Menu Items)</option>
                    <option value="second-half">Right Half (2nd 50% of Menu Items)</option>
                  </select>
                </div>
              )}

              {/* Search Block Mode */}
              {editingBlock.type === 'search' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Search Display Mode</label>
                  <select
                    value={editingBlock.settings?.mode || 'icon-label'}
                    onChange={(e) => {
                      setEditingBlock({
                        ...editingBlock,
                        settings: { ...editingBlock.settings, mode: e.target.value },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="icon-label">Icon + Label (e.g. 🔍 SEARCH or 🔍 FIND)</option>
                    <option value="icon-only">Icon Only (🔍)</option>
                    <option value="inline">Embedded Input Field</option>
                  </select>
                </div>
              )}

              {/* Scheduling Window */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    Scheduled Campaign Window
                  </span>
                  <input
                    type="checkbox"
                    checked={editingBlock.visibility?.scheduleEnabled || false}
                    onChange={(e) => {
                      setEditingBlock({
                        ...editingBlock,
                        visibility: {
                          ...editingBlock.visibility,
                          scheduleEnabled: e.target.checked,
                        },
                      });
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>

                {editingBlock.visibility?.scheduleEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Start Date</label>
                      <input
                        type="date"
                        value={editingBlock.visibility?.startDate?.split('T')[0] || ''}
                        onChange={(e) => {
                          setEditingBlock({
                            ...editingBlock,
                            visibility: {
                              ...editingBlock.visibility,
                              startDate: e.target.value,
                            },
                          });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">End Date</label>
                      <input
                        type="date"
                        value={editingBlock.visibility?.endDate?.split('T')[0] || ''}
                        onChange={(e) => {
                          setEditingBlock({
                            ...editingBlock,
                            visibility: {
                              ...editingBlock.visibility,
                              endDate: e.target.value,
                            },
                          });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Responsive Visibility Matrix */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 mt-3">
                <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  Responsive Device Visibility
                </span>
                <p className="text-[11px] text-slate-400">
                  Select which viewports this block should be displayed on:
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={editingBlock.responsive?.desktop?.visible !== false}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          responsive: {
                            ...editingBlock.responsive,
                            desktop: { visible: e.target.checked },
                          },
                        });
                      }}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-semibold text-slate-200">Desktop</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={editingBlock.responsive?.tablet?.visible !== false}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          responsive: {
                            ...editingBlock.responsive,
                            tablet: { visible: e.target.checked },
                          },
                        });
                      }}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-semibold text-slate-200">Tablet</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={editingBlock.responsive?.mobile?.visible !== false}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          responsive: {
                            ...editingBlock.responsive,
                            mobile: { visible: e.target.checked },
                          },
                        });
                      }}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-semibold text-slate-200">Mobile</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => updateBlock(editingBlock)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/30"
              >
                Save Block Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Item & Mega Menu Editor Modal */}
      {isNavModalOpen && editingNavIndex !== null && config.navigationMenu?.[editingNavIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-[#12141D] border border-slate-700 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Edit Navigation Item: {config.navigationMenu[editingNavIndex].label}
              </h3>
              <button onClick={() => setIsNavModalOpen(false)} className="p-1 hover:text-white text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Menu Label</label>
                  <input
                    type="text"
                    value={config.navigationMenu[editingNavIndex].label}
                    onChange={(e) => {
                      const list = [...config.navigationMenu];
                      list[editingNavIndex].label = e.target.value;
                      setConfig({ ...config, navigationMenu: list });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">URL Destination</label>
                  <input
                    type="text"
                    value={config.navigationMenu[editingNavIndex].url}
                    onChange={(e) => {
                      const list = [...config.navigationMenu];
                      list[editingNavIndex].url = e.target.value;
                      setConfig({ ...config, navigationMenu: list });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Badge Configuration */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white">Callout Badge (e.g. FRESH, HOT, NEW, SALE)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400">Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. FRESH or HOT"
                      value={config.navigationMenu[editingNavIndex].badge?.text || ''}
                      onChange={(e) => {
                        const list = [...config.navigationMenu];
                        const text = e.target.value;
                        if (!text) {
                          delete list[editingNavIndex].badge;
                        } else {
                          list[editingNavIndex].badge = {
                            ...(list[editingNavIndex].badge || {}),
                            text,
                            type: 'fresh',
                          };
                        }
                        setConfig({ ...config, navigationMenu: list });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Badge Color</label>
                    <input
                      type="color"
                      value={config.navigationMenu[editingNavIndex].badge?.bg || '#F59E0B'}
                      onChange={(e) => {
                        const list = [...config.navigationMenu];
                        if (list[editingNavIndex].badge) {
                          list[editingNavIndex].badge!.bg = e.target.value;
                          setConfig({ ...config, navigationMenu: list });
                        }
                      }}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Dropdown & Mega Menu Type Selector */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Hover Dropdown &amp; Mega Menu Options</h4>
                    <p className="text-[11px] text-slate-400">Choose how this menu item expands when customers hover or tap on it.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...config.navigationMenu];
                      if (list[editingNavIndex].megaMenu) list[editingNavIndex].megaMenu!.enabled = false;
                      delete list[editingNavIndex].children;
                      setConfig({ ...config, navigationMenu: list });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      !config.navigationMenu[editingNavIndex].megaMenu?.enabled &&
                      (!config.navigationMenu[editingNavIndex].children || config.navigationMenu[editingNavIndex].children?.length === 0)
                        ? 'bg-rose-600/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-bold">No Dropdown</span>
                    <span className="text-[10px] opacity-75">Direct page link only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const list = [...config.navigationMenu];
                      if (list[editingNavIndex].megaMenu) list[editingNavIndex].megaMenu!.enabled = false;
                      if (!list[editingNavIndex].children || list[editingNavIndex].children?.length === 0) {
                        list[editingNavIndex].children = [
                          { id: `sub_${Date.now()}_1`, label: 'New Arrivals', url: config.navigationMenu[editingNavIndex].url || '/women', order: 1, enabled: true },
                          { id: `sub_${Date.now()}_2`, label: 'Best Sellers', url: config.navigationMenu[editingNavIndex].url || '/women', order: 2, enabled: true },
                          { id: `sub_${Date.now()}_3`, label: 'Featured Edit', url: config.navigationMenu[editingNavIndex].url || '/women', order: 3, enabled: true },
                        ];
                      }
                      setConfig({ ...config, navigationMenu: list });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      !config.navigationMenu[editingNavIndex].megaMenu?.enabled &&
                      config.navigationMenu[editingNavIndex].children &&
                      config.navigationMenu[editingNavIndex].children!.length > 0
                        ? 'bg-rose-600/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-bold">Simple Dropdown</span>
                    <span className="text-[10px] opacity-75">Standard vertical list</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const list = [...config.navigationMenu];
                      if (!list[editingNavIndex].megaMenu || !list[editingNavIndex].megaMenu?.columns || list[editingNavIndex].megaMenu?.columns.length === 0) {
                        list[editingNavIndex].megaMenu = {
                          enabled: true,
                          columns: [
                            {
                              id: `col_${Date.now()}_1`,
                              title: 'Categories',
                              links: [
                                { label: 'Architectural Silhouettes', url: '/women', badge: 'NEW' },
                                { label: 'Artisanal Linens & Silks', url: '/women' },
                                { label: 'Tailored Sculptural Tops', url: '/women' },
                                { label: 'Evening & Occasionwear', url: '/women' },
                              ],
                            },
                            {
                              id: `col_${Date.now()}_2`,
                              title: 'Collections',
                              links: [
                                { label: 'Monochrome Minimalist', url: '/women' },
                                { label: 'Autumn / Winter 2026', url: '/women', badge: 'HOT' },
                                { label: 'Capsule Wardrobe', url: '/women' },
                                { label: 'Exclusive Pre-Orders', url: '/women' },
                              ],
                            },
                            {
                              id: `col_${Date.now()}_promo`,
                              title: 'Spotlight Capsule',
                              links: [],
                              promoBanner: {
                                image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80',
                                heading: 'Master Capsule 2026',
                                description: 'Handcrafted luxury fabrics with sculptural draping.',
                                ctaText: 'Shop Lookbook',
                                ctaUrl: '/women',
                              },
                            },
                          ],
                        };
                      } else {
                        list[editingNavIndex].megaMenu!.enabled = true;
                      }
                      delete list[editingNavIndex].children;
                      setConfig({ ...config, navigationMenu: list });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      config.navigationMenu[editingNavIndex].megaMenu?.enabled
                        ? 'bg-rose-600/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-bold">✨ Mega Menu</span>
                    <span className="text-[10px] opacity-75">Multi-column &amp; banners</span>
                  </button>
                </div>

                {/* Simple Dropdown Sublinks Editor */}
                {!config.navigationMenu[editingNavIndex].megaMenu?.enabled &&
                  config.navigationMenu[editingNavIndex].children &&
                  config.navigationMenu[editingNavIndex].children!.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">Submenu Links ({config.navigationMenu[editingNavIndex].children?.length || 0})</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...config.navigationMenu];
                            const curr = list[editingNavIndex].children || [];
                            curr.push({
                              id: `sub_${Date.now()}`,
                              label: 'New Sublink',
                              url: config.navigationMenu[editingNavIndex].url || '/women',
                              order: curr.length + 1,
                              enabled: true,
                            });
                            list[editingNavIndex].children = curr;
                            setConfig({ ...config, navigationMenu: list });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Sublink</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {config.navigationMenu[editingNavIndex].children?.map((child, cIdx) => (
                          <div key={child.id || cIdx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Link Label"
                              value={child.label}
                              onChange={(e) => {
                                const list = [...config.navigationMenu];
                                list[editingNavIndex].children![cIdx].label = e.target.value;
                                setConfig({ ...config, navigationMenu: list });
                              }}
                              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs font-bold flex-1"
                            />
                            <input
                              type="text"
                              placeholder="URL (e.g. /women/tops)"
                              value={child.url}
                              onChange={(e) => {
                                const list = [...config.navigationMenu];
                                list[editingNavIndex].children![cIdx].url = e.target.value;
                                setConfig({ ...config, navigationMenu: list });
                              }}
                              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...config.navigationMenu];
                                list[editingNavIndex].children = list[editingNavIndex].children!.filter((_, i) => i !== cIdx);
                                setConfig({ ...config, navigationMenu: list });
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Mega Menu Multi-Column & Banner Builder */}
                {config.navigationMenu[editingNavIndex].megaMenu?.enabled && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-xs">Mega Menu Columns &amp; Content</span>
                        <p className="text-[10px] text-slate-400">Add grouped category columns and promotional lookbook cards.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...config.navigationMenu];
                            const cols = list[editingNavIndex].megaMenu!.columns || [];
                            cols.push({
                              id: `col_${Date.now()}`,
                              title: `Column ${cols.length + 1}`,
                              links: [
                                { label: 'Featured Product', url: '/women', badge: 'NEW' },
                                { label: 'Signature Pieces', url: '/women' },
                                { label: 'Seasonal Edit', url: '/women' },
                              ],
                            });
                            list[editingNavIndex].megaMenu!.columns = cols;
                            setConfig({ ...config, navigationMenu: list });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Category Column</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const list = [...config.navigationMenu];
                            const cols = list[editingNavIndex].megaMenu!.columns || [];
                            cols.push({
                              id: `col_${Date.now()}_promo`,
                              title: 'Spotlight Feature',
                              links: [],
                              promoBanner: {
                                image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
                                heading: 'Exclusive Drop',
                                description: 'Discover the latest seasonal collection online now.',
                                ctaText: 'Shop Drop',
                                ctaUrl: '/women',
                              },
                            });
                            list[editingNavIndex].megaMenu!.columns = cols;
                            setConfig({ ...config, navigationMenu: list });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Add Promo Banner</span>
                        </button>
                      </div>
                    </div>

                    {/* Columns List */}
                    <div className="space-y-4">
                      {config.navigationMenu[editingNavIndex].megaMenu?.columns.map((col, colIdx) => (
                        <div key={col.id || colIdx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                            <div className="flex items-center gap-2 flex-1 max-w-sm">
                              <span className="font-mono text-xs text-indigo-400 font-bold">Col {colIdx + 1}:</span>
                              <input
                                type="text"
                                value={col.title}
                                placeholder="Column Title (e.g. APPAREL, SHOES, FEATURED)"
                                onChange={(e) => {
                                  const list = [...config.navigationMenu];
                                  list[editingNavIndex].megaMenu!.columns[colIdx].title = e.target.value;
                                  setConfig({ ...config, navigationMenu: list });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold w-full uppercase"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const list = [...config.navigationMenu];
                                list[editingNavIndex].megaMenu!.columns = list[editingNavIndex].megaMenu!.columns.filter((_, i) => i !== colIdx);
                                setConfig({ ...config, navigationMenu: list });
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 cursor-pointer"
                              title="Delete Column"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Column Type: Links List */}
                          {!col.promoBanner && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-400 font-semibold">Sublinks ({col.links?.length || 0})</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...config.navigationMenu];
                                    const links = list[editingNavIndex].megaMenu!.columns[colIdx].links || [];
                                    links.push({ label: 'New Link', url: '/women' });
                                    list[editingNavIndex].megaMenu!.columns[colIdx].links = links;
                                    setConfig({ ...config, navigationMenu: list });
                                  }}
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Link</span>
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                {col.links?.map((link, lIdx) => (
                                  <div key={lIdx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Link Name"
                                      value={link.label}
                                      onChange={(e) => {
                                        const list = [...config.navigationMenu];
                                        list[editingNavIndex].megaMenu!.columns[colIdx].links[lIdx].label = e.target.value;
                                        setConfig({ ...config, navigationMenu: list });
                                      }}
                                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs flex-1"
                                    />
                                    <input
                                      type="text"
                                      placeholder="URL (/women/dresses)"
                                      value={link.url}
                                      onChange={(e) => {
                                        const list = [...config.navigationMenu];
                                        list[editingNavIndex].megaMenu!.columns[colIdx].links[lIdx].url = e.target.value;
                                        setConfig({ ...config, navigationMenu: list });
                                      }}
                                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono flex-1"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Badge (optional)"
                                      value={link.badge || ''}
                                      onChange={(e) => {
                                        const list = [...config.navigationMenu];
                                        list[editingNavIndex].megaMenu!.columns[colIdx].links[lIdx].badge = e.target.value || undefined;
                                        setConfig({ ...config, navigationMenu: list });
                                      }}
                                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 text-[10px] w-20 font-bold uppercase"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = [...config.navigationMenu];
                                        list[editingNavIndex].megaMenu!.columns[colIdx].links = list[editingNavIndex].megaMenu!.columns[colIdx].links.filter((_, i) => i !== lIdx);
                                        setConfig({ ...config, navigationMenu: list });
                                      }}
                                      className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Column Type: Promo Banner Card */}
                          {col.promoBanner && (
                            <div className="space-y-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Spotlight Lookbook Banner</span>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-slate-400">Banner Image URL</label>
                                  <input
                                    type="text"
                                    value={col.promoBanner.image}
                                    placeholder="https://images.unsplash.com/..."
                                    onChange={(e) => {
                                      const list = [...config.navigationMenu];
                                      list[editingNavIndex].megaMenu!.columns[colIdx].promoBanner!.image = e.target.value;
                                      setConfig({ ...config, navigationMenu: list });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400">Headline</label>
                                  <input
                                    type="text"
                                    value={col.promoBanner.heading}
                                    placeholder="e.g. Master Capsule 2026"
                                    onChange={(e) => {
                                      const list = [...config.navigationMenu];
                                      list[editingNavIndex].megaMenu!.columns[colIdx].promoBanner!.heading = e.target.value;
                                      setConfig({ ...config, navigationMenu: list });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400">Short Description</label>
                                <input
                                  type="text"
                                  value={col.promoBanner.description || ''}
                                  placeholder="e.g. Handcrafted luxury fabrics with sculptural draping."
                                  onChange={(e) => {
                                    const list = [...config.navigationMenu];
                                    list[editingNavIndex].megaMenu!.columns[colIdx].promoBanner!.description = e.target.value;
                                    setConfig({ ...config, navigationMenu: list });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-slate-400">CTA Button Label</label>
                                  <input
                                    type="text"
                                    value={col.promoBanner.ctaText || ''}
                                    placeholder="e.g. Shop Lookbook"
                                    onChange={(e) => {
                                      const list = [...config.navigationMenu];
                                      list[editingNavIndex].megaMenu!.columns[colIdx].promoBanner!.ctaText = e.target.value;
                                      setConfig({ ...config, navigationMenu: list });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400">CTA Target URL</label>
                                  <input
                                    type="text"
                                    value={col.promoBanner.ctaUrl || ''}
                                    placeholder="e.g. /women/lookbook"
                                    onChange={(e) => {
                                      const list = [...config.navigationMenu];
                                      list[editingNavIndex].megaMenu!.columns[colIdx].promoBanner!.ctaUrl = e.target.value;
                                      setConfig({ ...config, navigationMenu: list });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  pushHistory(config);
                  setIsNavModalOpen(false);
                  showToast('Saved navigation item & mega menu settings', 'success');
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-950/30 cursor-pointer"
              >
                Save Navigation Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Luxury Layout Templates Modal */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-[#12141D] border border-slate-700 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                  Luxury Header Archetypes &amp; Layout Presets
                </h3>
              </div>
              <button
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-1 hover:text-white text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select a pre-engineered luxury layout archetype to immediately configure your zones, blocks, color palettes, and typography:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {Object.entries(LUXURY_PRESET_TEMPLATES).map(([key, template]) => (
                <div
                  key={key}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{template.icon}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {template.name}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{template.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{template.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const partial = template.getConfig(activeTenant.slug, activeTenant.name);
                      const next = {
                        ...config,
                        ...partial,
                        announcementBar: {
                          ...config.announcementBar,
                          ...(partial.announcementBar || {}),
                          styles: {
                            ...config.announcementBar.styles,
                            ...(partial.announcementBar?.styles || {}),
                          },
                          blocks: partial.announcementBar?.blocks || config.announcementBar.blocks,
                        },
                        mainHeader: {
                          ...config.mainHeader,
                          ...(partial.mainHeader || {}),
                          styles: {
                            ...config.mainHeader.styles,
                            ...(partial.mainHeader?.styles || {}),
                          },
                          blocks: partial.mainHeader?.blocks || config.mainHeader.blocks,
                        },
                      };
                      setConfig(next);
                      pushHistory(next);
                      setIsTemplatesModalOpen(false);
                      showToast(`Applied ${template.name} preset archetype!`, 'success');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Apply {template.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
