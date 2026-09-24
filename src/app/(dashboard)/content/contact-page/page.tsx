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
  Check,
  Store,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { getDefaultContactPageConfig, ContactPageConfig } from '@/lib/cms-page-presets';

export default function ContactPageBuilder() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'stores' | 'form' | 'hours' | 'styling'>('stores');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTenant, setActiveTenant] = useState<any>(() => PlatformService.getActiveTenant());
  const tenantSlug = (activeTenant?.slug || 'silvora').toLowerCase().trim();
  const tenantName = activeTenant?.name || tenantSlug;

  const [config, setConfig] = useState<ContactPageConfig>(() =>
    getDefaultContactPageConfig(tenantSlug, activeTenant)
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

  // Fetch live Contact config from MongoDB Atlas whenever tenant changes
  useEffect(() => {
    async function fetchContactConfig() {
      try {
        setIsLoading(true);
        const res = await ApiClient.get<any>(`/api/v1/content/pages?type=contact-page&tenant=${tenantSlug}`);
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
          // Use tenant-aligned defaults
          setConfig(getDefaultContactPageConfig(tenantSlug, activeTenant));
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

  const accentColor = config.design?.accentColor || '#EAB308';
  const badgeText = config.badgeText || config.design?.badgeText || 'DIRECT ATELIER ACCESS';
  const buttonText = config.design?.buttonText || 'Send Direct Inquiry to Stylist Concierge';

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
              Contact &amp; Store Locator
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Store className="w-3 h-3 text-amber-400" />
              Store: <strong className="text-white">{tenantName}</strong> ({tenantSlug})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Contact &amp; Store Locator Builder</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full merchant control over boutique locations, direct routing mailboxes, inquiry subjects, and design styles.
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
              { id: 'stores', label: '1. Boutiques & Salons' },
              { id: 'form', label: '2. Page & Form' },
              { id: 'hours', label: '3. Routing Mailbox' },
              { id: 'styling', label: '4. Design & Colors' },
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
              <div className="flex items-center justify-between">
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
                <div key={idx} className="p-3 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-2 relative group">
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

          {/* Tab 2: Form & Content */}
          {activeTab === 'form' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="space-y-1">
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

          {/* Tab 4: Design & Styles */}
          {activeTab === 'styling' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  Primary Accent Color:
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

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Submit Button Text</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      design: { ...config.design, buttonText: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-bold"
                />
              </div>
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
            className={`w-full transition-all duration-300 border border-slate-700/60 rounded-2xl overflow-hidden bg-[#0D0F18] p-4 sm:p-6 space-y-6 ${
              device === 'mobile' ? 'max-w-xs' : device === 'tablet' ? 'max-w-md' : 'max-w-full'
            }`}
          >
            {/* Header Mock */}
            <div className="text-center space-y-1">
              <span
                className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: `${accentColor}1A`,
                  color: accentColor,
                  borderColor: `${accentColor}40`,
                }}
              >
                {badgeText}
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white font-serif">{config.pageTitle}</h3>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">{config.pageSubtitle}</p>
            </div>

            {/* Store Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.stores?.map((s, idx) => (
                <div key={idx} className="p-3.5 bg-[#141724] rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs" style={{ color: accentColor }}>
                    <Building className="w-3.5 h-3.5" />
                    <span>{s.city}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{s.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{s.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Mock */}
            <div className="p-4 bg-[#121522] rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Send a Direct Message to Our Concierge</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled
                  placeholder="Your Name"
                  className="p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-[10px] text-slate-400"
                />
                <input
                  type="email"
                  disabled
                  placeholder="Your Email Address"
                  className="p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-[10px] text-slate-400"
                />
              </div>

              <select
                disabled
                className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-[10px] text-slate-300"
              >
                {config.formSubjectOptions?.map((o, idx) => (
                  <option key={idx}>{o}</option>
                ))}
              </select>

              <textarea
                disabled
                rows={2}
                placeholder={`How may our ${tenantName} concierge team assist your order or atelier visit?`}
                className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-[10px] text-slate-400"
              />
              <button
                type="button"
                disabled
                className="w-full py-2 text-black font-bold text-xs rounded-xl shadow opacity-90 flex items-center justify-center gap-1.5"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, #B45309)`,
                  color: '#000000',
                  fontWeight: 800,
                }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{buttonText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
