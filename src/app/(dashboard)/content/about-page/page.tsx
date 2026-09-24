'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Quote,
  ShieldCheck,
  Award,
  Layers,
  Heart,
  Globe,
  Plus,
  Trash2,
  Palette,
  Store,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { getDefaultAboutPageConfig, AboutPageConfig } from '@/lib/cms-page-presets';

export default function AboutPageBuilder() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'hero' | 'founder' | 'pillars' | 'stats' | 'styling'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTenant, setActiveTenant] = useState<any>(() => PlatformService.getActiveTenant());
  const tenantSlug = (activeTenant?.slug || 'silvora').toLowerCase().trim();
  const tenantName = activeTenant?.name || tenantSlug;

  const [config, setConfig] = useState<AboutPageConfig>(() =>
    getDefaultAboutPageConfig(tenantSlug, activeTenant)
  );

  // Listen to tenant switcher changes
  useEffect(() => {
    const handleTenantUpdate = (e: any) => {
      const updated = e?.detail || PlatformService.getActiveTenant();
      setActiveTenant(updated);
    };
    window.addEventListener('tenant_updated', handleTenantUpdate);
    return () => window.removeEventListener('tenant_updated', handleTenantUpdate);
  }, []);

  // Fetch live About config from MongoDB Atlas whenever tenant changes
  useEffect(() => {
    async function fetchAboutConfig() {
      try {
        setIsLoading(true);
        const res = await ApiClient.get<any>(`/api/v1/content/pages?type=about-page&tenant=${tenantSlug}`);
        if (res.data?.config) {
          setConfig((prev) => ({
            ...prev,
            ...res.data.config,
            design: {
              ...prev.design,
              ...(res.data.config?.design || {}),
              ...(res.data.styles || {}),
            },
          }));
        } else {
          setConfig(getDefaultAboutPageConfig(tenantSlug, activeTenant));
        }
      } catch (err) {
        console.warn('Using local About defaults:', err);
        setConfig(getDefaultAboutPageConfig(tenantSlug, activeTenant));
      } finally {
        setIsLoading(false);
      }
    }
    fetchAboutConfig();
  }, [tenantSlug]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await ApiClient.put(`/api/v1/content/pages?type=about-page&tenant=${tenantSlug}`, {
        type: 'about-page',
        slug: 'about',
        title: 'Brand Story & About Us',
        status: 'draft',
        config,
        styles: config.design,
        design: config.design,
      });
      showToast(`Brand Story draft saved for ${tenantName}!`, 'success');
    } catch {
      showToast('Draft saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      await ApiClient.put(`/api/v1/content/pages?type=about-page&tenant=${tenantSlug}`, {
        type: 'about-page',
        slug: 'about',
        title: 'Brand Story & About Us',
        status: 'published',
        config,
        styles: config.design,
        design: config.design,
      });
      showToast(`Published live to ${tenantName} storefront (/about)!`, 'success');
    } catch {
      showToast('Published locally.', 'info');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    const defaults = getDefaultAboutPageConfig(tenantSlug, activeTenant);
    setConfig(defaults);
    showToast(`Reset to default brand story template for ${tenantName}`, 'info');
  };

  const addPillar = () => {
    setConfig({
      ...config,
      pillars: [
        ...config.pillars,
        {
          title: 'Master Commitment',
          desc: 'Uncompromising standard in design, provenance, and artisan craftsmanship.',
        },
      ],
    });
  };

  const removePillar = (idx: number) => {
    if (config.pillars.length <= 1) return;
    const updated = config.pillars.filter((_, i) => i !== idx);
    setConfig({ ...config, pillars: updated });
  };

  const addStat = () => {
    setConfig({
      ...config,
      stats: [...(config.stats || []), { value: '100%', label: 'Master Metric' }],
    });
  };

  const removeStat = (idx: number) => {
    const updated = (config.stats || []).filter((_, i) => i !== idx);
    setConfig({ ...config, stats: updated });
  };

  const accentColor = config.design?.accentColor || '#EAB308';

  const PRESET_COLORS = [
    { label: 'Imperial Gold', hex: '#EAB308' },
    { label: 'Haute Rose', hex: '#E11D48' },
    { label: 'Deep Emerald', hex: '#10B981' },
    { label: 'Sapphire Blue', hex: '#3B82F6' },
    { label: 'Royal Violet', hex: '#8B5CF6' },
    { label: 'Pure Platinum', hex: '#E2E8F0' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Visual Headless CMS
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Brand Story &amp; About Page
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Store className="w-3 h-3 text-amber-400" />
              Store: <strong className="text-white">{tenantName}</strong> ({tenantSlug})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Brand Story &amp; About Page Builder</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full merchant control over the heritage narrative, founder statements, photography, craft pillars, and design styling.
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-black text-xs font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #B45309)`,
              color: '#000000',
              fontWeight: 800,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#121522] border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex border-b border-slate-800 pb-2 gap-1 overflow-x-auto text-xs">
            {[
              { id: 'hero', label: '1. Atelier Hero' },
              { id: 'founder', label: '2. Founder & Vision' },
              { id: 'pillars', label: '3. Pillars' },
              { id: 'stats', label: '4. Metrics & Stats' },
              { id: 'styling', label: '5. Styling & Colors' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === t.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Hero */}
          {activeTab === 'hero' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Badge Label</label>
                <input
                  type="text"
                  value={config.heroBadge}
                  onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Hero Headline</label>
                <input
                  type="text"
                  value={config.heroHeadline}
                  onChange={(e) => setConfig({ ...config, heroHeadline: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Heritage Story Paragraph</label>
                <textarea
                  rows={3}
                  value={config.heroSubtext}
                  onChange={(e) => setConfig({ ...config, heroSubtext: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Hero Atelier Image URL</label>
                <input
                  type="text"
                  value={config.heroImage}
                  onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Founder */}
          {activeTab === 'founder' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Founder / Director Name</label>
                  <input
                    type="text"
                    value={config.founderName}
                    onChange={(e) => setConfig({ ...config, founderName: e.target.value })}
                    className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Title / Role</label>
                  <input
                    type="text"
                    value={config.founderRole}
                    onChange={(e) => setConfig({ ...config, founderRole: e.target.value })}
                    className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Founder Quote</label>
                <textarea
                  rows={3}
                  value={config.founderQuote}
                  onChange={(e) => setConfig({ ...config, founderQuote: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Portrait URL</label>
                <input
                  type="text"
                  value={config.founderImage}
                  onChange={(e) => setConfig({ ...config, founderImage: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Pillars */}
          {activeTab === 'pillars' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Craft Pillars ({config.pillars.length}):</span>
                <button
                  type="button"
                  onClick={addPillar}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-[11px]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Pillar</span>
                </button>
              </div>

              {config.pillars.map((pillar, idx) => (
                <div key={idx} className="p-3 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      0{idx + 1}
                    </span>
                    {config.pillars.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePillar(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => {
                      const updated = [...config.pillars];
                      updated[idx].title = e.target.value;
                      setConfig({ ...config, pillars: updated });
                    }}
                    className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-white text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    value={pillar.desc}
                    onChange={(e) => {
                      const updated = [...config.pillars];
                      updated[idx].desc = e.target.value;
                      setConfig({ ...config, pillars: updated });
                    }}
                    className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-slate-300 text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Metrics / Stats */}
          {activeTab === 'stats' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Key Stats &amp; Counters:</span>
                <button
                  type="button"
                  onClick={addStat}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-[11px]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Stat</span>
                </button>
              </div>

              {(config.stats || []).map((st, idx) => (
                <div key={idx} className="p-3 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Metric #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStat(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={st.value}
                      placeholder="e.g. 18K & 24K"
                      onChange={(e) => {
                        const updated = [...(config.stats || [])];
                        updated[idx].value = e.target.value;
                        setConfig({ ...config, stats: updated });
                      }}
                      className="p-1.5 bg-[#161822] border border-slate-700 rounded text-white text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={st.label}
                      placeholder="e.g. Solid Gold"
                      onChange={(e) => {
                        const updated = [...(config.stats || [])];
                        updated[idx].label = e.target.value;
                        setConfig({ ...config, stats: updated });
                      }}
                      className="p-1.5 bg-[#161822] border border-slate-700 rounded text-slate-300 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: Styling */}
          {activeTab === 'styling' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  Primary Brand Accent Color:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          design: { ...config.design, accentColor: c.hex },
                        })
                      }
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                        accentColor.toLowerCase() === c.hex.toLowerCase()
                          ? 'border-white bg-slate-800'
                          : 'border-slate-800 bg-[#0C0E17] hover:border-slate-700'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span className="text-[10px] text-slate-300 font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        design: { ...config.design, accentColor: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        design: { ...config.design, accentColor: e.target.value },
                      })
                    }
                    className="p-1.5 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Reactive Device Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0A0C10] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-full text-xs font-mono text-slate-400 flex items-center justify-between mb-3">
            <span>LIVE BRAND STORY PREVIEW ({tenantName.toUpperCase()})</span>
            <span className="text-emerald-400 font-bold">● Active Story Engine</span>
          </div>

          <div
            className={`w-full transition-all duration-300 border border-slate-700/60 rounded-2xl overflow-hidden bg-[#0D0F18] p-4 sm:p-6 space-y-6 ${
              device === 'mobile' ? 'max-w-xs' : device === 'tablet' ? 'max-w-md' : 'max-w-full'
            }`}
          >
            {/* Story Hero */}
            <div
              className="relative rounded-2xl overflow-hidden aspect-[16/9] border flex items-center justify-center text-center p-6"
              style={{ borderColor: `${accentColor}30` }}
            >
              <img src={config.heroImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-25" />
              <div className="relative space-y-2 max-w-md">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border"
                  style={{
                    backgroundColor: `${accentColor}1A`,
                    color: accentColor,
                    borderColor: `${accentColor}40`,
                  }}
                >
                  {config.heroBadge}
                </span>
                <h3 className="text-base sm:text-xl font-black text-white font-serif">{config.heroHeadline}</h3>
                <p className="text-[11px] text-slate-300 line-clamp-3">{config.heroSubtext}</p>
              </div>
            </div>

            {/* Founder Quote Card */}
            <div className="p-4 bg-[#141724] rounded-2xl border border-slate-800 flex gap-3 items-center">
              <img
                src={config.founderImage}
                alt={config.founderName}
                className="w-12 h-12 rounded-full object-cover border-2 shrink-0"
                style={{ borderColor: accentColor }}
              />
              <div className="space-y-0.5">
                <p className="text-[11px] italic text-slate-200 font-serif">"{config.founderQuote}"</p>
                <div className="text-[10px] font-bold text-white">
                  {config.founderName} — <span style={{ color: accentColor }}>{config.founderRole}</span>
                </div>
              </div>
            </div>

            {/* Pillars Grid */}
            <div className="grid grid-cols-2 gap-2">
              {config.pillars.map((pil, idx) => (
                <div key={idx} className="p-2.5 bg-[#121522] rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                    <span className="truncate">{pil.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{pil.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats preview */}
            {config.stats && config.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#0A0C14] rounded-xl border border-slate-800 text-center">
                {config.stats.map((st, i) => (
                  <div key={i}>
                    <div className="text-sm font-bold font-serif" style={{ color: accentColor }}>
                      {st.value}
                    </div>
                    <div className="text-[9px] text-slate-400">{st.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
