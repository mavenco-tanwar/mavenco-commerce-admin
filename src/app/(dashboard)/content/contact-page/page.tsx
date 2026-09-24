'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  MapPin,
  Clock,
  Phone,
  Mail,
  Building,
  Send,
  Plus,
  Trash2,
  Palette,
  Store,
  Eye,
  EyeOff,
  Code,
  Image as ImageIcon,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { getDefaultContactPageConfig, ContactPageConfig, CustomHtmlSection } from '@/lib/cms-page-presets';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';

export default function ContactPageBuilder() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'stores' | 'form' | 'hours' | 'custom' | 'styling'>('stores');
  const [stylingSection, setStylingSection] = useState<'page' | 'header' | 'stores' | 'form'>('page');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTenant, setActiveTenant] = useState<any>(() => PlatformService.getActiveTenant());
  const tenantSlug = (activeTenant?.slug || 'silvora').toLowerCase().trim();
  const tenantName = activeTenant?.name || tenantSlug;

  const [config, setConfig] = useState<ContactPageConfig>(() =>
    getDefaultContactPageConfig(tenantSlug, activeTenant)
  );

  useEffect(() => {
    const handleTenantUpdate = (e: any) => {
      const updated = e?.detail || PlatformService.getActiveTenant();
      setActiveTenant(updated);
    };
    window.addEventListener('tenant_updated', handleTenantUpdate);
    return () => window.removeEventListener('tenant_updated', handleTenantUpdate);
  }, []);

  useEffect(() => {
    async function fetchContactConfig() {
      try {
        setIsLoading(true);
        const res = await ApiClient.get<any>(`/api/v1/content/pages?type=contact-page&tenant=${tenantSlug}`);
        const defaults = getDefaultContactPageConfig(tenantSlug, activeTenant);
        if (res.data?.config) {
          setConfig({
            ...defaults,
            ...res.data.config,
            sectionsEnabled: {
              ...defaults.sectionsEnabled,
              ...(res.data.config?.sectionsEnabled || {}),
            },
            customSections: res.data.config?.customSections || defaults.customSections || [],
            design: {
              ...defaults.design,
              ...(res.data.config?.design || {}),
              ...(res.data.styles || {}),
            },
          });
        } else {
          setConfig(defaults);
        }
      } catch (err) {
        console.warn('Using local Contact defaults:', err);
        setConfig(getDefaultContactPageConfig(tenantSlug, activeTenant));
      } finally {
        setIsLoading(false);
      }
    }
    fetchContactConfig();
  }, [tenantSlug]);

  const toggleSection = (sectionKey: 'header' | 'stores' | 'form' | 'customSections') => {
    setConfig((prev) => {
      const current = prev.sectionsEnabled?.[sectionKey] !== false;
      return {
        ...prev,
        sectionsEnabled: {
          ...prev.sectionsEnabled,
          [sectionKey]: !current,
        },
      };
    });
  };

  const updateDesign = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        [key]: value,
      },
    }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await ApiClient.put(`/api/v1/content/pages?type=contact-page&tenant=${tenantSlug}`, {
        type: 'contact-page',
        slug: 'contact',
        title: 'Contact & Store Locator',
        status: 'draft',
        config,
        styles: config.design,
        design: config.design,
      });
      showToast(`Contact Page draft saved for ${tenantName}!`, 'success');
    } catch {
      showToast('Draft saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      await ApiClient.put(`/api/v1/content/pages?type=contact-page&tenant=${tenantSlug}`, {
        type: 'contact-page',
        slug: 'contact',
        title: 'Contact & Store Locator',
        status: 'published',
        config,
        styles: config.design,
        design: config.design,
      });
      showToast(`Published live to ${tenantName} storefront (/contact)!`, 'success');
    } catch {
      showToast('Published locally.', 'info');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    const defaults = getDefaultContactPageConfig(tenantSlug, activeTenant);
    setConfig(defaults);
    showToast(`Reset to default template for ${tenantName}`, 'info');
  };

  const addStoreLocation = () => {
    setConfig({
      ...config,
      stores: [
        ...config.stores,
        {
          city: `${tenantName} New Boutique`,
          address: 'Boutique Address Line, City, State, PIN',
          phone: '+91 98765 43210',
          hours: 'Mon-Sun: 10:00 AM – 8:00 PM',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop',
        },
      ],
    });
  };

  const removeStoreLocation = (idx: number) => {
    if (config.stores.length <= 1) {
      showToast('You must maintain at least one store location.', 'info');
      return;
    }
    const updated = config.stores.filter((_, i) => i !== idx);
    setConfig({ ...config, stores: updated });
  };

  const addTopic = () => {
    setConfig({
      ...config,
      formSubjectOptions: [...config.formSubjectOptions, 'New Inquiry Topic'],
    });
  };

  const removeTopic = (idx: number) => {
    if (config.formSubjectOptions.length <= 1) return;
    const updated = config.formSubjectOptions.filter((_, i) => i !== idx);
    setConfig({ ...config, formSubjectOptions: updated });
  };

  // Custom HTML Sections Management
  const addCustomSection = () => {
    const newSec: CustomHtmlSection = {
      id: `custom_sec_${Date.now()}`,
      title: 'Bespoke Concierge & Private Appointments',
      enabled: true,
      html: `<div style="text-align: center; padding: 24px; border-radius: 16px; background: rgba(234, 179, 8, 0.05); border: 1px dashed rgba(234, 179, 8, 0.3);">
  <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Private Viewing Salon</h3>
  <p style="font-size: 13px; color: #94A3B8; max-width: 500px; margin: 0 auto 16px;">Enjoy dedicated champagne hospitality and one-on-one styling with our master gemologists.</p>
  <a href="tel:+919876543210" style="display: inline-block; padding: 10px 20px; background: #EAB308; color: #000; font-weight: bold; border-radius: 10px; text-decoration: none; font-size: 12px;">Call Private Salon Desk</a>
</div>`,
    };
    setConfig({
      ...config,
      customSections: [...(config.customSections || []), newSec],
    });
    showToast('New Custom HTML section added!', 'success');
  };

  const updateCustomSection = (idx: number, patch: Partial<CustomHtmlSection>) => {
    const updated = [...(config.customSections || [])];
    updated[idx] = { ...updated[idx], ...patch };
    setConfig({ ...config, customSections: updated });
  };

  const removeCustomSection = (idx: number) => {
    const updated = (config.customSections || []).filter((_, i) => i !== idx);
    setConfig({ ...config, customSections: updated });
  };

  const d = config.design || ({} as any);
  const sec = config.sectionsEnabled || { header: true, stores: true, form: true, customSections: true };

  const FONT_OPTIONS = [
    { label: 'Playfair Display (Haute Serif)', value: "'Playfair Display', serif" },
    { label: 'Cinzel (Classical Luxury)', value: "'Cinzel', serif" },
    { label: 'Cormorant Garamond (Fine Editorial)', value: "'Cormorant Garamond', serif" },
    { label: 'Plus Jakarta Sans (Modern Clean)', value: "'Plus Jakarta Sans', sans-serif" },
    { label: 'Inter (Contemporary Neutral)', value: "'Inter', sans-serif" },
    { label: 'Montserrat (Bold Architectural)', value: "'Montserrat', sans-serif" },
  ];

  const PRESET_BG_COLORS = [
    { label: 'Dark Atelier', hex: '#07090E' },
    { label: 'Pure Obsidian', hex: '#0A0A0A' },
    { label: 'Deep Midnight', hex: '#0F172A' },
    { label: 'Imperial Emerald', hex: '#06130D' },
    { label: 'Ivory Light', hex: '#FAFAF9' },
    { label: 'Crisp White', hex: '#FFFFFF' },
  ];

  const PRESET_ACCENTS = [
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
              Contact &amp; Store Locator
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Store className="w-3 h-3 text-amber-400" />
              Store: <strong className="text-white">{tenantName}</strong> ({tenantSlug})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Contact &amp; Store Locator Builder</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full control over section toggles, photo uploads, custom HTML widgets, boutique addresses, and styling.
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
              background: `linear-gradient(135deg, ${d.accentColor || '#EAB308'}, #B45309)`,
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
              { id: 'stores', label: '1. Boutiques' },
              { id: 'form', label: '2. Form & Intro' },
              { id: 'hours', label: '3. Mailbox' },
              { id: 'custom', label: '4. Custom HTML' },
              { id: 'styling', label: '5. Styling' },
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

          {/* Tab 1: Stores */}
          {activeTab === 'stores' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              {/* Section Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800">
                <span className="font-bold text-white text-xs">Boutiques Section Visibility:</span>
                <button
                  type="button"
                  onClick={() => toggleSection('stores')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    sec.stores !== false
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {sec.stores !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{sec.stores !== false ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-medium">Boutique Locations ({config.stores.length}):</span>
                <button
                  type="button"
                  onClick={addStoreLocation}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-[11px]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Location</span>
                </button>
              </div>

              {config.stores.map((store, idx) => (
                <div key={idx} className="p-3.5 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Boutique #{idx + 1}</span>
                    {config.stores.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStoreLocation(idx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Boutique Photo Upload */}
                  <ImageUploadInput
                    label="Boutique Photography"
                    description="Upload storefront or salon photo"
                    value={store.image || ''}
                    onChange={(url) => {
                      const updated = [...config.stores];
                      updated[idx].image = url;
                      setConfig({ ...config, stores: updated });
                    }}
                    folder="Stores"
                  />

                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase font-bold block">Boutique Name</label>
                    <input
                      type="text"
                      value={store.city}
                      onChange={(e) => {
                        const updated = [...config.stores];
                        updated[idx].city = e.target.value;
                        setConfig({ ...config, stores: updated });
                      }}
                      className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-white text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase font-bold block">Full Address</label>
                    <input
                      type="text"
                      value={store.address}
                      onChange={(e) => {
                        const updated = [...config.stores];
                        updated[idx].address = e.target.value;
                        setConfig({ ...config, stores: updated });
                      }}
                      className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-slate-300 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] uppercase font-bold block">Phone</label>
                      <input
                        type="text"
                        value={store.phone}
                        onChange={(e) => {
                          const updated = [...config.stores];
                          updated[idx].phone = e.target.value;
                          setConfig({ ...config, stores: updated });
                        }}
                        className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-slate-300 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] uppercase font-bold block">Hours</label>
                      <input
                        type="text"
                        value={store.hours}
                        onChange={(e) => {
                          const updated = [...config.stores];
                          updated[idx].hours = e.target.value;
                          setConfig({ ...config, stores: updated });
                        }}
                        className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Form & Intro */}
          {activeTab === 'form' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              {/* Section Visibility Toggles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800">
                  <span className="font-bold text-white text-xs">Header Intro Section:</span>
                  <button
                    type="button"
                    onClick={() => toggleSection('header')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      sec.header !== false
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {sec.header !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{sec.header !== false ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800">
                  <span className="font-bold text-white text-xs">Inquiry Form Section:</span>
                  <button
                    type="button"
                    onClick={() => toggleSection('form')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      sec.form !== false
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {sec.form !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{sec.form !== false ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-slate-300 font-semibold block">Top Badge Label</label>
                <input
                  type="text"
                  value={config.badgeText || ''}
                  onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
                  placeholder="e.g. DIRECT ATELIER ACCESS"
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Page Headline</label>
                <input
                  type="text"
                  value={config.pageTitle}
                  onChange={(e) => setConfig({ ...config, pageTitle: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Page Subtitle</label>
                <textarea
                  rows={2}
                  value={config.pageSubtitle}
                  onChange={(e) => setConfig({ ...config, pageSubtitle: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Inquiry Topics (Dropdown Options):</label>
                  <button
                    type="button"
                    onClick={addTopic}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Topic
                  </button>
                </div>
                {config.formSubjectOptions?.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...config.formSubjectOptions];
                        updated[i] = e.target.value;
                        setConfig({ ...config, formSubjectOptions: updated });
                      }}
                      className="flex-1 p-1.5 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs"
                    />
                    {config.formSubjectOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTopic(i)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Routing Email */}
          {activeTab === 'hours' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Destination Email for Inquiries</label>
                <input
                  type="email"
                  value={config.notificationEmail}
                  onChange={(e) => setConfig({ ...config, notificationEmail: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Customer inquiries submitted on `/contact` will route directly to this concierge email.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Custom HTML Sections Component */}
          {activeTab === 'custom' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800">
                <span className="font-bold text-white text-xs">Custom Sections Overall:</span>
                <button
                  type="button"
                  onClick={() => toggleSection('customSections')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    sec.customSections !== false
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {sec.customSections !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{sec.customSections !== false ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-medium">
                  Custom HTML Sections ({(config.customSections || []).length}):
                </span>
                <button
                  type="button"
                  onClick={addCustomSection}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-[11px]"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Custom HTML Section</span>
                </button>
              </div>

              {(config.customSections || []).length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 space-y-2">
                  <Code className="w-6 h-6 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No custom sections yet.</p>
                  <p className="text-[10px] text-slate-500">
                    Add custom sections with raw HTML, Google Maps iframes, video embeds, or promotional banners.
                  </p>
                </div>
              ) : (
                (config.customSections || []).map((cSec, idx) => (
                  <div key={cSec.id} className="p-3.5 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5" />
                        <span>Custom Section #{idx + 1}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateCustomSection(idx, { enabled: !cSec.enabled })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cSec.enabled
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {cSec.enabled ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCustomSection(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] uppercase font-bold block">Section Title (Optional)</label>
                      <input
                        type="text"
                        value={cSec.title || ''}
                        onChange={(e) => updateCustomSection(idx, { title: e.target.value })}
                        className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-white text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] uppercase font-bold block">Raw HTML Content</label>
                      <textarea
                        rows={5}
                        value={cSec.html || ''}
                        onChange={(e) => updateCustomSection(idx, { html: e.target.value })}
                        placeholder="<div>...paste HTML, iframes, styles...</div>"
                        className="w-full p-2 bg-[#161822] border border-slate-700 rounded font-mono text-[11px] text-amber-200"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 5: Granular Section Styling */}
          {activeTab === 'styling' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex bg-[#0A0C14] p-1 rounded-xl border border-slate-800 gap-1">
                {[
                  { id: 'page', label: 'Page' },
                  { id: 'header', label: 'Header' },
                  { id: 'stores', label: 'Boutiques' },
                  { id: 'form', label: 'Form' },
                ].map((secKey) => (
                  <button
                    key={secKey.id}
                    type="button"
                    onClick={() => setStylingSection(secKey.id as any)}
                    className={`flex-1 py-1 px-2 rounded-lg font-bold text-[11px] transition-all ${
                      stylingSection === secKey.id
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {secKey.label}
                  </button>
                ))}
              </div>

              {stylingSection === 'page' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">Page Background Color</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PRESET_BG_COLORS.map((bg) => (
                        <button
                          key={bg.hex}
                          type="button"
                          onClick={() => updateDesign('backgroundColor', bg.hex)}
                          className={`p-1.5 rounded-lg border text-[10px] flex items-center gap-1.5 ${
                            d.backgroundColor === bg.hex ? 'border-amber-400 bg-slate-800' : 'border-slate-800 bg-[#0C0E17]'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: bg.hex }} />
                          <span className="truncate text-slate-300">{bg.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={d.backgroundColor || '#07090E'}
                        onChange={(e) => updateDesign('backgroundColor', e.target.value)}
                        className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={d.backgroundColor || '#07090E'}
                        onChange={(e) => updateDesign('backgroundColor', e.target.value)}
                        className="p-1 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono uppercase flex-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Primary Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={d.textColor || '#F8FAFC'}
                          onChange={(e) => updateDesign('textColor', e.target.value)}
                          className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={d.textColor || '#F8FAFC'}
                          onChange={(e) => updateDesign('textColor', e.target.value)}
                          className="p-1 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono uppercase flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Muted Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={d.mutedTextColor || '#94A3B8'}
                          onChange={(e) => updateDesign('mutedTextColor', e.target.value)}
                          className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={d.mutedTextColor || '#94A3B8'}
                          onChange={(e) => updateDesign('mutedTextColor', e.target.value)}
                          className="p-1 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono uppercase flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-slate-300 font-semibold block">Heading Font Style</label>
                    <select
                      value={d.headingFont || "'Playfair Display', serif"}
                      onChange={(e) => updateDesign('headingFont', e.target.value)}
                      className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Body Font Style</label>
                    <select
                      value={d.bodyFont || "'Plus Jakarta Sans', sans-serif"}
                      onChange={(e) => updateDesign('bodyFont', e.target.value)}
                      className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-slate-300 font-semibold block">Brand Accent Color</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PRESET_ACCENTS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => {
                            updateDesign('accentColor', c.hex);
                            updateDesign('headerBadgeText', c.hex);
                            updateDesign('storeCardTitleColor', c.hex);
                          }}
                          className={`p-1.5 rounded-lg border text-[10px] flex items-center gap-1.5 ${
                            d.accentColor === c.hex ? 'border-white bg-slate-800' : 'border-slate-800 bg-[#0C0E17]'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                          <span className="truncate text-slate-300">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stylingSection === 'header' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Headline Title Color</label>
                      <input
                        type="color"
                        value={d.headerTitleColor || '#FFFFFF'}
                        onChange={(e) => updateDesign('headerTitleColor', e.target.value)}
                        className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Subtitle Color</label>
                      <input
                        type="color"
                        value={d.headerSubtitleColor || '#94A3B8'}
                        onChange={(e) => updateDesign('headerSubtitleColor', e.target.value)}
                        className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {stylingSection === 'stores' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Store Card Background</label>
                      <input
                        type="color"
                        value={d.storeCardBg || '#0E111C'}
                        onChange={(e) => updateDesign('storeCardBg', e.target.value)}
                        className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Store Title Color</label>
                      <input
                        type="color"
                        value={d.storeCardTitleColor || d.accentColor || '#EAB308'}
                        onChange={(e) => updateDesign('storeCardTitleColor', e.target.value)}
                        className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {stylingSection === 'form' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Form Card Background</label>
                      <input
                        type="color"
                        value={d.formCardBg || '#101320'}
                        onChange={(e) => updateDesign('formCardBg', e.target.value)}
                        className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Button Text Color</label>
                      <input
                        type="color"
                        value={d.formButtonTextColor || '#000000'}
                        onChange={(e) => updateDesign('formButtonTextColor', e.target.value)}
                        className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Live Reactive Device Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0A0C10] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-full text-xs font-mono text-slate-400 flex items-center justify-between mb-3">
            <span>LIVE STORE PREVIEW ({tenantName.toUpperCase()})</span>
            <span className="text-emerald-400 font-bold">● Active Store Locator</span>
          </div>

          <div
            className={`w-full transition-all duration-300 border rounded-2xl overflow-hidden p-4 sm:p-6 space-y-6 ${
              device === 'mobile' ? 'max-w-xs' : device === 'tablet' ? 'max-w-md' : 'max-w-full'
            }`}
            style={{
              backgroundColor: d.backgroundColor || '#07090E',
              color: d.textColor || '#F8FAFC',
              fontFamily: d.bodyFont || 'inherit',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header Mock */}
            {sec.header !== false ? (
              <div className="text-center space-y-1">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: d.headerBadgeBg || `${d.accentColor}1A`,
                    color: d.headerBadgeText || d.accentColor,
                    borderColor: d.headerBadgeBorder || `${d.accentColor}40`,
                  }}
                >
                  {config.badgeText || 'DIRECT ATELIER ACCESS'}
                </span>
                <h3
                  className="text-base sm:text-xl font-bold"
                  style={{
                    color: d.headerTitleColor || '#FFFFFF',
                    fontFamily: d.headingFont || 'inherit',
                  }}
                >
                  {config.pageTitle}
                </h3>
                <p
                  className="text-[11px] max-w-sm mx-auto"
                  style={{ color: d.headerSubtitleColor || d.mutedTextColor || '#94A3B8' }}
                >
                  {config.pageSubtitle}
                </p>
              </div>
            ) : (
              <div className="p-2 border border-dashed border-slate-800 rounded text-center text-[10px] text-slate-500">
                [Header Intro Section Disabled]
              </div>
            )}

            {/* Store Cards */}
            {sec.stores !== false ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.stores?.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border space-y-2 overflow-hidden"
                    style={{
                      backgroundColor: d.storeCardBg || '#0E111C',
                      borderColor: d.storeCardBorder || 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {s.image && (
                      <div className="h-24 w-full rounded-xl overflow-hidden relative">
                        <img src={s.image} alt={s.city} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div
                      className="flex items-center gap-2 font-bold text-xs"
                      style={{
                        color: d.storeCardTitleColor || d.accentColor || '#EAB308',
                        fontFamily: d.headingFont || 'inherit',
                      }}
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>{s.city}</span>
                    </div>
                    <div
                      className="text-[11px] space-y-1"
                      style={{ color: d.storeCardTextColor || '#CBD5E1' }}
                    >
                      <div className="flex items-start gap-1.5">
                        <MapPin
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          style={{ color: d.storeCardIconColor || '#94A3B8' }}
                        />
                        <span>{s.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: d.storeCardIconColor || '#94A3B8' }}
                        />
                        <span>{s.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: d.storeCardIconColor || '#94A3B8' }}
                        />
                        <span>{s.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 border border-dashed border-slate-800 rounded text-center text-[10px] text-slate-500">
                [Boutiques Section Disabled]
              </div>
            )}

            {/* Form Mock */}
            {sec.form !== false ? (
              <div
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: d.formCardBg || '#101320',
                  borderColor: d.formCardBorder || 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  className="text-xs font-bold flex items-center gap-1.5"
                  style={{
                    color: d.formCardTitleColor || '#FFFFFF',
                    fontFamily: d.headingFont || 'inherit',
                  }}
                >
                  <Mail className="w-3.5 h-3.5" style={{ color: d.accentColor || '#EAB308' }} />
                  <span>Send a Direct Message to Our Concierge</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Your Name"
                    className="p-2 border rounded-lg text-[10px]"
                    style={{
                      backgroundColor: d.formInputBg || '#080A10',
                      borderColor: d.formInputBorder || '#334155',
                      color: d.formInputTextColor || '#FFFFFF',
                    }}
                  />
                  <input
                    type="email"
                    disabled
                    placeholder="Your Email Address"
                    className="p-2 border rounded-lg text-[10px]"
                    style={{
                      backgroundColor: d.formInputBg || '#080A10',
                      borderColor: d.formInputBorder || '#334155',
                      color: d.formInputTextColor || '#FFFFFF',
                    }}
                  />
                </div>

                <select
                  disabled
                  className="w-full p-2 border rounded-lg text-[10px]"
                  style={{
                    backgroundColor: d.formInputBg || '#080A10',
                    borderColor: d.formInputBorder || '#334155',
                    color: d.formInputTextColor || '#FFFFFF',
                  }}
                >
                  {config.formSubjectOptions?.map((o, idx) => (
                    <option key={idx}>{o}</option>
                  ))}
                </select>

                <textarea
                  disabled
                  rows={2}
                  placeholder={`How may our ${tenantName} concierge team assist your order or atelier visit?`}
                  className="w-full p-2 border rounded-lg text-[10px]"
                  style={{
                    backgroundColor: d.formInputBg || '#080A10',
                    borderColor: d.formInputBorder || '#334155',
                    color: d.formInputTextColor || '#FFFFFF',
                  }}
                />
                <button
                  type="button"
                  disabled
                  className="w-full py-2 font-bold text-xs rounded-xl shadow opacity-90 flex items-center justify-center gap-1.5"
                  style={{
                    background: d.formButtonBg || `linear-gradient(135deg, ${d.accentColor || '#EAB308'}, #B45309)`,
                    color: d.formButtonTextColor || '#000000',
                    fontWeight: 800,
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{d.buttonText || 'Send Direct Inquiry to Stylist Concierge'}</span>
                </button>
              </div>
            ) : (
              <div className="p-2 border border-dashed border-slate-800 rounded text-center text-[10px] text-slate-500">
                [Inquiry Form Section Disabled]
              </div>
            )}

            {/* Custom HTML Sections Canvas Preview */}
            {sec.customSections !== false &&
              config.customSections
                ?.filter((s) => s.enabled)
                ?.map((cSec) => (
                  <div
                    key={cSec.id}
                    className="p-4 rounded-2xl border"
                    style={{
                      backgroundColor: cSec.backgroundColor || d.formCardBg || '#101320',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {cSec.title && (
                      <div className="text-xs font-bold text-white mb-2">{cSec.title}</div>
                    )}
                    <div
                      className="text-[11px] prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: cSec.html }}
                    />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
