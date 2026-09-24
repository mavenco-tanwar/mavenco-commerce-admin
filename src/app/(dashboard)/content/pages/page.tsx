import { useConfirm } from '@/lib/modal-context';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Palette,
  Code,
  MapPin,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  ShieldCheck,
  Truck,
  RefreshCw,
  HeartHandshake,
  Upload,
} from 'lucide-react';
import { ContentService } from '@/services/content';
import { PlatformService } from '@/services/platform';
import { getTenantStorefrontUrl } from '@/services/api';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';
import { getDefaultWebsitePages, detectStoreCategory, CustomHtmlSection } from '@/lib/cms-page-presets';
import type { Page } from '@/types';

const FONT_OPTIONS = [
  { label: 'Playfair Display (Luxury Editorial Serif)', value: 'Playfair Display, serif' },
  { label: 'Cormorant Garamond (Haute Joaillerie Serif)', value: 'Cormorant Garamond, serif' },
  { label: 'Cinzel (Roman Classical Atelier)', value: 'Cinzel, serif' },
  { label: 'Plus Jakarta Sans (Modern Clean Luxury)', value: 'Plus Jakarta Sans, sans-serif' },
  { label: 'Inter (Contemporary Precision)', value: 'Inter, sans-serif' },
  { label: 'Montserrat (Geometric Architectural)', value: 'Montserrat, sans-serif' },
];

const BODY_FONT_OPTIONS = [
  { label: 'Plus Jakarta Sans (Crisp & Readable)', value: 'Plus Jakarta Sans, sans-serif' },
  { label: 'Inter (Neutral Precision)', value: 'Inter, sans-serif' },
  { label: 'Montserrat (Geometric Modern)', value: 'Montserrat, sans-serif' },
  { label: 'Lato (Humanist Warmth)', value: 'Lato, sans-serif' },
  { label: 'Roboto (Modern Clean)', value: 'Roboto, sans-serif' },
];

const PRESET_BG_COLORS = [
  { label: 'Obsidian Atelier', hex: '#07090E' },
  { label: 'Midnight Black', hex: '#0B0D16' },
  { label: 'Deep Charcoal', hex: '#111422' },
  { label: 'Alabaster Ivory', hex: '#FFFDFC' },
  { label: 'Warm Cream Silk', hex: '#FAF6F2' },
  { label: 'Slate Minimal', hex: '#0F172A' },
];

export default function PagesManagerPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [activeTenant, setActiveTenant] = useState<any>(() => PlatformService.getActiveTenant());
  const [pages, setPages] = useState<Page[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [modalTab, setModalTab] = useState<'content' | 'styling' | 'seo' | 'preview'>('content');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // General Form
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Section Toggles
  const [sectionsEnabled, setSectionsEnabled] = useState({
    hero: true,
    body: true,
    customSections: true,
    valueProps: true,
  });

  // Hero Block State
  const [heroBadge, setHeroBadge] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');

  // Rich Text Body State
  const [bodyHeading, setBodyHeading] = useState('');
  const [bodyContent, setBodyContent] = useState('');

  // Custom HTML Sections
  const [customSections, setCustomSections] = useState<CustomHtmlSection[]>([]);

  // Design & Style Control State
  const [design, setDesign] = useState({
    pageBg: '#07090E',
    textColor: '#F8FAFC',
    mutedTextColor: '#94A3B8',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    accentColor: '#EAB308',
    heroBg: '#111422',
    heroTitleColor: '#FFFFFF',
    heroSubtitleColor: '#E2E8F0',
    cardBg: '#0E111C',
    cardBorder: 'rgba(234, 179, 8, 0.2)',
  });

  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const fetchPages = async (tenantSlug?: string) => {
    const targetSlug = tenantSlug || activeTenant?.slug || PlatformService.getActiveTenant().slug;
    const list = await ContentService.getPages(targetSlug);
    setPages(list);
  };

  useEffect(() => {
    fetchPages();

    const handleTenantChange = (e: any) => {
      const updated = e?.detail || PlatformService.getActiveTenant();
      setActiveTenant(updated);
      fetchPages(updated?.slug);
    };

    const handleStorage = (ev: StorageEvent) => {
      if (ev.key === 'jq_active_tenant_id' || ev.key === 'jq_active_tenant_slug') {
        const updated = PlatformService.getActiveTenant();
        setActiveTenant(updated);
        fetchPages(updated?.slug);
      }
    };

    window.addEventListener('tenant-switched', handleTenantChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('tenant-switched', handleTenantChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const resetToCategoryDefaults = async () => {
    const ok = await confirm({
      title: 'Reset Website Pages to Category Defaults?',
      message: `Reset all website pages to default specifications for ${activeTenant?.name || 'this store'} (${activeTenant?.category || 'selected category'})? This will synchronize all policy pages and brand narratives with your store category.`,
      confirmLabel: 'Reset to Defaults',
      isDestructive: true,
      type: 'warning',
    });
    if (!ok) return;

    const defaultPresets = getDefaultWebsitePages(activeTenant?.slug, activeTenant);
    for (const preset of defaultPresets) {
      await ContentService.createPage(preset as any);
    }
    await fetchPages();
    showToast(`Website pages successfully synchronized with ${activeTenant?.name || 'store'} category`, 'success');
  };

  const openCreateModal = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setStatus('published');
    setModalTab('content');

    const isJewelry = detectStoreCategory(activeTenant?.slug, activeTenant) === 'jewelry';
    const accent = isJewelry ? '#EAB308' : '#BE123C';

    setSectionsEnabled({
      hero: true,
      body: true,
      customSections: true,
      valueProps: true,
    });

    setHeroBadge(isJewelry ? 'EST. 2026 • HAUTE ATELIER' : 'OUR HERITAGE & VISION');
    setHeroTitle('');
    setHeroSubtitle('');
    setHeroImage(
      isJewelry
        ? 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop'
    );

    setBodyHeading('');
    setBodyContent('');
    setCustomSections([]);

    setDesign({
      pageBg: isJewelry ? '#07090E' : '#FFFDFC',
      textColor: isJewelry ? '#F8FAFC' : '#111111',
      mutedTextColor: isJewelry ? '#94A3B8' : '#64748B',
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
      accentColor: accent,
      heroBg: isJewelry ? '#111422' : '#111111',
      heroTitleColor: '#FFFFFF',
      heroSubtitleColor: '#E2E8F0',
      cardBg: isJewelry ? '#0E111C' : '#FAF6F2',
      cardBorder: isJewelry ? 'rgba(234, 179, 8, 0.2)' : '#E8DED8',
    });

    setSeoTitle('');
    setSeoDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (page: Page) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setStatus(page.status);
    setModalTab('content');

    const heroBlock = page.blocks?.find((b: any) => b.type === 'hero');
    const richTextBlock = page.blocks?.find((b: any) => b.type === 'rich-text');

    setHeroBadge(heroBlock?.data?.badge || '');
    setHeroTitle(heroBlock?.data?.title || page.title);
    setHeroSubtitle(heroBlock?.data?.subtitle || '');
    setHeroImage(heroBlock?.data?.image || '');

    setBodyHeading(richTextBlock?.data?.heading || '');
    setBodyContent(richTextBlock?.data?.content || '');

    setSectionsEnabled({
      hero: page.sectionsEnabled?.hero !== false,
      body: page.sectionsEnabled?.body !== false,
      customSections: page.sectionsEnabled?.customSections !== false,
      valueProps: page.sectionsEnabled?.valueProps !== false,
    });

    setCustomSections((page.customSections as any) || []);

    const isJewelry = detectStoreCategory(activeTenant?.slug, activeTenant) === 'jewelry';
    const accent = isJewelry ? '#EAB308' : '#BE123C';

    const d = page.design || page.styles || {};
    setDesign({
      pageBg: d.pageBg || (isJewelry ? '#07090E' : '#FFFDFC'),
      textColor: d.textColor || (isJewelry ? '#F8FAFC' : '#111111'),
      mutedTextColor: d.mutedTextColor || (isJewelry ? '#94A3B8' : '#64748B'),
      headingFont: d.headingFont || 'Playfair Display, serif',
      bodyFont: d.bodyFont || 'Plus Jakarta Sans, sans-serif',
      accentColor: d.accentColor || accent,
      heroBg: d.heroBg || (isJewelry ? '#111422' : '#111111'),
      heroTitleColor: d.heroTitleColor || '#FFFFFF',
      heroSubtitleColor: d.heroSubtitleColor || '#E2E8F0',
      cardBg: d.cardBg || (isJewelry ? '#0E111C' : '#FAF6F2'),
      cardBorder: d.cardBorder || (isJewelry ? 'rgba(234, 179, 8, 0.2)' : '#E8DED8'),
    });

    setSeoTitle(page.seo?.title || page.title);
    setSeoDescription(page.seo?.description || '');

    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedBlocks = [
      {
        type: 'hero',
        data: {
          title: heroTitle || title,
          subtitle: heroSubtitle,
          badge: heroBadge,
          image: heroImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop',
        },
      },
      {
        type: 'rich-text',
        data: {
          heading: bodyHeading || title,
          content: bodyContent,
        },
      },
    ];

    const storeBrand = activeTenant?.name || 'Luxury Boutique';
    const seoPayload = {
      title: seoTitle || `${title} | ${storeBrand}`,
      description: seoDescription || `Explore ${title} at ${storeBrand}.`,
    };

    const payload: Partial<Page> = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status,
      type: 'website-page',
      blocks: formattedBlocks as any,
      sectionsEnabled,
      customSections: customSections as any,
      design,
      styles: design,
      seo: seoPayload,
      tenantSlug: activeTenant?.slug,
    };

    try {
      if (editingPage) {
        await ContentService.updatePage(editingPage.id, payload, activeTenant?.slug);
        showToast('Page content and styling updated live in database', 'success');
      } else {
        await ContentService.createPage(payload, activeTenant?.slug);
        showToast('New website page published live in database', 'success');
      }
      setIsModalOpen(false);
      await fetchPages(activeTenant?.slug);
    } catch (err: any) {
      showToast(err.message || 'Failed to save page', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Website Page',
      message: 'Are you sure you want to delete this page? This will permanently remove it from your store and database.',
      confirmLabel: 'Delete Page',
      cancelLabel: 'Keep Page',
      isDestructive: true,
      type: 'danger',
    });
    if (!ok) return;
    try {
      await ContentService.deletePage(id, activeTenant?.slug);
      showToast('Page deleted successfully from store database', 'info');
      await fetchPages(activeTenant?.slug);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete page', 'error');
    }
  };

  // Custom HTML section helpers
  const addCustomHtmlSection = () => {
    const newSection: CustomHtmlSection = {
      id: `custom_sec_${Date.now()}`,
      title: `Custom Section #${customSections.length + 1}`,
      enabled: true,
      containerWidth: 'standard',
      backgroundColor: design.cardBg || '#0E111C',
      html: `<div style="padding: 24px; text-align: center; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.15);">
  <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Interactive Atelier Section</h3>
  <p style="font-size: 13px; color: #94A3B8; line-height: 1.6;">Paste custom HTML, interactive calculators, video players, or widgets here.</p>
</div>`,
    };
    setCustomSections([...customSections, newSection]);
  };

  const updateCustomSection = (idx: number, updates: Partial<CustomHtmlSection>) => {
    const updated = [...customSections];
    updated[idx] = { ...updated[idx], ...updates };
    setCustomSections(updated);
  };

  const removeCustomSection = (idx: number) => {
    setCustomSections(customSections.filter((_, i) => i !== idx));
  };

  const insertTemplateHtml = (idx: number, type: 'video' | 'map' | 'badges' | 'quote') => {
    let template = '';
    if (type === 'video') {
      template = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
  <iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" title="Brand Video Tour" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>`;
    } else if (type === 'map') {
      template = `<div style="border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); height: 360px;">
  <iframe src="https://maps.google.com/maps?q=Connaught+Place,+New+Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" frameborder="0" style="border:0;" allowfullscreen="" aria-hidden="false" tabindex="0"></iframe>
</div>`;
    } else if (type === 'badges') {
      template = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 12px 0;">
  <div style="padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; text-align: center;">
    <div style="font-size: 22px; margin-bottom: 6px;">💎</div>
    <div style="font-weight: bold; color: #FFFFFF; font-size: 13px;">GIA Certified Solitaires</div>
    <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">Laser inscribed verified dossiers</div>
  </div>
  <div style="padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; text-align: center;">
    <div style="font-size: 22px; margin-bottom: 6px;">🛡️</div>
    <div style="font-weight: bold; color: #FFFFFF; font-size: 13px;">BIS 916 & 750 Hallmarked</div>
    <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">Government certified metallurgy</div>
  </div>
  <div style="padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; text-align: center;">
    <div style="font-size: 22px; margin-bottom: 6px;">🚚</div>
    <div style="font-weight: bold; color: #FFFFFF; font-size: 13px;">Armored Transit</div>
    <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">100% insured vault logistics</div>
  </div>
</div>`;
    } else if (type === 'quote') {
      template = `<div style="padding: 32px 24px; text-align: center; border-left: 3px solid #EAB308; background: rgba(234, 179, 8, 0.05); border-radius: 8px;">
  <p style="font-family: serif; font-size: 18px; font-style: italic; color: #FFFFFF; margin-bottom: 12px; line-height: 1.6;">"True luxury is not about excess, but the pursuit of irreplaceable craftsmanship and genuine human mastery."</p>
  <span style="font-size: 12px; font-weight: bold; letter-spacing: 0.1em; color: #EAB308; text-transform: uppercase;">— Master Goldsmith Atelier</span>
</div>`;
    }

    updateCustomSection(idx, { html: template });
    showToast('Template code inserted', 'info');
  };

  const isJewelry = detectStoreCategory(activeTenant?.slug, activeTenant) === 'jewelry';

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Top Header with Tenant Store & Category Identification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Content Management
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span>STORE:</span>
              <strong className="text-white uppercase">{activeTenant?.name || 'Silvora'}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Website Pages</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage static storefront content, policies, and bespoke pages tailored to{' '}
            <span className="text-amber-300 font-semibold">{activeTenant?.category || '💎 Luxury Jewelry & Watches'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToCategoryDefaults}
            title="Reset pages to align with active store category"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Align with Category</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Page</span>
          </button>
        </div>
      </div>

      {/* Visual Builders Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#181b29] to-[#121522] border border-amber-500/20 shadow-lg flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <MapPin className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Visual Page Builder</span>
            </div>
            <h3 className="text-base font-bold text-white">Contact &amp; Store Locator</h3>
            <p className="text-xs text-slate-400">
              Control physical retail boutique addresses, concierge email routing, operating hours, section styles, and inquiry forms.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/content/contact-page"
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Contact Builder</span>
            </Link>
            <a
              href={getTenantStorefrontUrl(activeTenant?.slug, 'contact')}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Preview</span>
            </a>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-[#1b1728] to-[#141220] border border-rose-500/20 shadow-lg flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Visual Page Builder</span>
            </div>
            <h3 className="text-base font-bold text-white">Brand Story &amp; About Us</h3>
            <p className="text-xs text-slate-400">
              Control atelier heritage story, founder statement, portrait, craft pillars, section visibility, and styling tokens.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/content/about-page"
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open About Builder</span>
            </Link>
            <a
              href={getTenantStorefrontUrl(activeTenant?.slug, 'about')}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Preview</span>
            </a>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-[#161822] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Storefront Editorial &amp; Policy Pages</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {pages.length} Pages Configured
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {pages.map((p) => (
            <div
              key={p.id}
              className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{p.title}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      p.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status}
                  </span>
                  {(p.customSections as any)?.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Code className="w-3 h-3" />
                      <span>{(p.customSections as any).length} Custom HTML</span>
                    </span>
                  )}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">/{p.slug}</div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getTenantStorefrontUrl(activeTenant?.slug, p.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>View</span>
                </a>
                <button
                  onClick={() => openEditModal(p)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold shadow-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Custom Page Studio Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPage ? `Edit Page: ${editingPage.title}` : 'Create Website Page'}
          subtitle={`Custom Content, Styling & HTML Sections for ${activeTenant?.name || 'Storefront'}`}
          maxWidth="4xl"
        >
          {/* Modal Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-1 bg-[#0A0C14] p-1 rounded-xl border border-slate-800">
              {[
                { id: 'content', label: 'Editorial Content', icon: Layers },
                { id: 'styling', label: 'Design & Styling', icon: Palette },
                { id: 'seo', label: 'SEO & Meta', icon: CheckCircle2 },
                { id: 'preview', label: 'Storefront Preview', icon: Eye },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setModalTab(t.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      modalTab === t.id
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {modalTab === 'preview' && (
              <div className="flex items-center bg-[#0A0C14] p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {/* TAB 1: EDITORIAL CONTENT & SECTIONS */}
            {modalTab === 'content' && (
              <div className="space-y-4">
                {/* Identification & URL */}
                <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>Page Identification &amp; URL</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-semibold mb-1">Page Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                        }}
                        placeholder={isJewelry ? 'e.g. Solitaire Authenticity & BIS Guarantee' : 'e.g. About Our Brand'}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="authenticity-guarantee"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Publication Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="published">● Published (Live on Storefront)</option>
                      <option value="draft">○ Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Section 1: Hero Banner */}
                <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>Section 1: Hero Banner</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSectionsEnabled({ ...sectionsEnabled, hero: !sectionsEnabled.hero })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                        sectionsEnabled.hero
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sectionsEnabled.hero ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{sectionsEnabled.hero ? 'Section Enabled' : 'Section Disabled'}</span>
                    </button>
                  </div>

                  {sectionsEnabled.hero && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Badge Tagline</label>
                          <input
                            type="text"
                            value={heroBadge}
                            onChange={(e) => setHeroBadge(e.target.value)}
                            placeholder="e.g. HIGH-SECURITY LOGISTICS"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Hero Main Heading</label>
                          <input
                            type="text"
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            placeholder={title || 'Page Headline'}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-serif text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Hero Subtitle / Description</label>
                        <textarea
                          rows={2}
                          value={heroSubtitle}
                          onChange={(e) => setHeroSubtitle(e.target.value)}
                          placeholder="A brief intro sentence displayed below the title..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>

                      {/* Photo Upload Button for Hero Background */}
                      <div>
                        <ImageUploadInput
                          label="Hero Background Photo (Upload File or Enter URL)"
                          description="High-resolution photography with dark overlay support for luxury presentation"
                          value={heroImage}
                          onChange={setHeroImage}
                          aspectRatio="banner"
                          placeholder="Upload banner image or paste URL..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Main Body Editorial Content */}
                <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      <span>Section 2: Main Body Editorial Story</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSectionsEnabled({ ...sectionsEnabled, body: !sectionsEnabled.body })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                        sectionsEnabled.body
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sectionsEnabled.body ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{sectionsEnabled.body ? 'Section Enabled' : 'Section Disabled'}</span>
                    </button>
                  </div>

                  {sectionsEnabled.body && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Content Section Heading</label>
                        <input
                          type="text"
                          value={bodyHeading}
                          onChange={(e) => setBodyHeading(e.target.value)}
                          placeholder="e.g. Where Unrivaled Gemological Rarity Meets Timeless Goldsmithing"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          Editorial Body Story &amp; Formatted Content *
                        </label>
                        <RichTextEditor
                          value={bodyContent}
                          onChange={setBodyContent}
                          placeholder="Write your policy terms, diamond grading specifications, or brand narrative..."
                          minHeight="220px"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Component for Custom HTML Sections */}
                <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-amber-400" />
                        <span>Section 3: Custom HTML Sections ({customSections.length})</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Add custom interactive widgets, Google Maps embeds, video players, trust badges, or raw markup.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSectionsEnabled({
                            ...sectionsEnabled,
                            customSections: !sectionsEnabled.customSections,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                          sectionsEnabled.customSections
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {sectionsEnabled.customSections ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{sectionsEnabled.customSections ? 'Enabled' : 'Disabled'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={addCustomHtmlSection}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-[11px]"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Custom HTML Section</span>
                      </button>
                    </div>
                  </div>

                  {sectionsEnabled.customSections && (
                    <div className="space-y-3 pt-2">
                      {customSections.length === 0 ? (
                        <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 space-y-2">
                          <Code className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400">No custom HTML sections added yet.</p>
                          <button
                            type="button"
                            onClick={addCustomHtmlSection}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold"
                          >
                            + Add First Custom Section
                          </button>
                        </div>
                      ) : (
                        customSections.map((sec, idx) => (
                          <div
                            key={sec.id}
                            className="p-3.5 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-3 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5" />
                                <span>Custom Section #{idx + 1}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateCustomSection(idx, { enabled: !sec.enabled })}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    sec.enabled
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-rose-500/20 text-rose-300'
                                  }`}
                                >
                                  {sec.enabled ? 'Active' : 'Hidden'}
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                                  Section Title
                                </label>
                                <input
                                  type="text"
                                  value={sec.title || ''}
                                  onChange={(e) => updateCustomSection(idx, { title: e.target.value })}
                                  className="w-full p-2 bg-[#161822] border border-slate-700 rounded-lg text-white text-xs font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                                  Container Width
                                </label>
                                <select
                                  value={sec.containerWidth || 'standard'}
                                  onChange={(e) => updateCustomSection(idx, { containerWidth: e.target.value as any })}
                                  className="w-full p-2 bg-[#161822] border border-slate-700 rounded-lg text-white text-xs"
                                >
                                  <option value="standard">Standard Container (max-w-6xl)</option>
                                  <option value="narrow">Editorial Narrow (max-w-4xl)</option>
                                  <option value="full">Full Bleed Edge-to-Edge</option>
                                </select>
                              </div>
                            </div>

                            {/* Quick Insert Templates */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Insert Template:</span>
                              <button
                                type="button"
                                onClick={() => insertTemplateHtml(idx, 'badges')}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-semibold"
                              >
                                Trust Badges Grid
                              </button>
                              <button
                                type="button"
                                onClick={() => insertTemplateHtml(idx, 'video')}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                              >
                                Video Embed
                              </button>
                              <button
                                type="button"
                                onClick={() => insertTemplateHtml(idx, 'map')}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                              >
                                Google Maps Embed
                              </button>
                              <button
                                type="button"
                                onClick={() => insertTemplateHtml(idx, 'quote')}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                              >
                                Quote Highlight
                              </button>
                            </div>

                            <div className="space-y-1">
                              <label className="text-slate-400 text-[10px] uppercase font-bold block">
                                Raw HTML / Embed Code
                              </label>
                              <textarea
                                rows={6}
                                value={sec.html || ''}
                                onChange={(e) => updateCustomSection(idx, { html: e.target.value })}
                                placeholder="<div>Paste HTML, iframe, video player or responsive markup...</div>"
                                className="w-full p-2.5 bg-[#161822] border border-slate-700 rounded-lg font-mono text-[11px] text-amber-200"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Section 4: Value Props & Guarantees */}
                <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Section 4: Guarantee &amp; Value Props Cards</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Display bottom trust cards (Insured Transit, Lifetime Care, GIA Certification, Concierge Desk).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSectionsEnabled({ ...sectionsEnabled, valueProps: !sectionsEnabled.valueProps })
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      sectionsEnabled.valueProps
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {sectionsEnabled.valueProps ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{sectionsEnabled.valueProps ? 'Section Enabled' : 'Section Disabled'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: DESIGN & STYLING */}
            {modalTab === 'styling' && (
              <div className="space-y-4">
                <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-rose-400" />
                    <span>Page Background &amp; Core Palette</span>
                  </h4>

                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold block">Preset Background Palettes</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_BG_COLORS.map((bg) => (
                        <button
                          key={bg.hex}
                          type="button"
                          onClick={() => setDesign({ ...design, pageBg: bg.hex })}
                          className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                            design.pageBg === bg.hex ? 'border-amber-400 bg-slate-800' : 'border-slate-800 bg-[#0C0E17]'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-600"
                            style={{ backgroundColor: bg.hex }}
                          />
                          <span className="truncate text-slate-200">{bg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Page Background (Hex)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={design.pageBg}
                          onChange={(e) => setDesign({ ...design, pageBg: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={design.pageBg}
                          onChange={(e) => setDesign({ ...design, pageBg: e.target.value })}
                          className="p-1.5 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono uppercase flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Primary Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={design.textColor}
                          onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={design.textColor}
                          onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                          className="p-1.5 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono uppercase flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Accent / Highlight Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={design.accentColor}
                          onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={design.accentColor}
                          onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                          className="p-1.5 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono uppercase flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>Typography &amp; Fonts</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Headings &amp; Title Font</label>
                      <select
                        value={design.headingFont}
                        onChange={(e) => setDesign({ ...design, headingFont: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Body Text Font</label>
                      <select
                        value={design.bodyFont}
                        onChange={(e) => setDesign({ ...design, bodyFont: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        {BODY_FONT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-rose-400" />
                    <span>Section Specific Styling</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Hero Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={design.heroBg || '#111422'}
                          onChange={(e) => setDesign({ ...design, heroBg: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={design.heroBg || '#111422'}
                          onChange={(e) => setDesign({ ...design, heroBg: e.target.value })}
                          className="p-1.5 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono uppercase flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Card Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={design.cardBg || '#0E111C'}
                          onChange={(e) => setDesign({ ...design, cardBg: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={design.cardBg || '#0E111C'}
                          onChange={(e) => setDesign({ ...design, cardBg: e.target.value })}
                          className="p-1.5 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono uppercase flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Card Border Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={design.cardBorder?.startsWith('#') ? design.cardBorder : '#EAB308'}
                          onChange={(e) => setDesign({ ...design, cardBorder: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={design.cardBorder}
                          onChange={(e) => setDesign({ ...design, cardBorder: e.target.value })}
                          className="p-1.5 bg-[#0C0E17] border border-slate-700 rounded text-slate-200 text-xs font-mono flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SEO & SEARCH METADATA */}
            {modalTab === 'seo' && (
              <div className="space-y-4">
                <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Search Engine Preview &amp; Metadata</span>
                  </h4>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">SEO Title Tag</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder={`${title || 'Page Title'} | ${activeTenant?.name || 'Luxury Boutique'}`}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">SEO Meta Description</label>
                    <textarea
                      rows={3}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Concise overview summarizing this page for Google search results..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  {/* Google Search Snippet Simulation */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      https://storefront.com/{activeTenant?.slug}/{slug || 'page'}
                    </span>
                    <div className="text-blue-400 font-semibold text-sm">
                      {seoTitle || `${title || 'Page Title'} | ${activeTenant?.name || 'Luxury Boutique'}`}
                    </div>
                    <div className="text-slate-400 text-xs line-clamp-2">
                      {seoDescription || `Discover the collection, story, and specifications for ${title || 'this page'}.`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LIVE PREVIEW */}
            {modalTab === 'preview' && (
              <div
                className={`mx-auto rounded-xl border border-slate-800 overflow-hidden shadow-2xl transition-all ${
                  previewDevice === 'mobile'
                    ? 'max-w-sm'
                    : previewDevice === 'tablet'
                    ? 'max-w-xl'
                    : 'max-w-full'
                }`}
                style={{
                  backgroundColor: design.pageBg,
                  color: design.textColor,
                  fontFamily: design.bodyFont,
                }}
              >
                {/* Hero Preview */}
                {sectionsEnabled.hero && (
                  <div
                    className="p-8 relative text-center overflow-hidden border-b"
                    style={{ backgroundColor: design.heroBg, borderColor: design.cardBorder }}
                  >
                    {heroBadge && (
                      <span
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                        style={{
                          backgroundColor: `${design.accentColor}20`,
                          color: design.accentColor,
                          border: `1px solid ${design.accentColor}40`,
                        }}
                      >
                        {heroBadge}
                      </span>
                    )}
                    <h2
                      className="text-2xl sm:text-3xl font-bold mb-2"
                      style={{ fontFamily: design.headingFont, color: design.heroTitleColor }}
                    >
                      {heroTitle || title || 'Page Title'}
                    </h2>
                    {heroSubtitle && (
                      <p className="text-xs max-w-lg mx-auto" style={{ color: design.heroSubtitleColor }}>
                        {heroSubtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* Editorial Body Preview */}
                {sectionsEnabled.body && (
                  <div className="p-6 space-y-4 max-w-3xl mx-auto">
                    {bodyHeading && (
                      <h3
                        className="text-xl font-bold border-b pb-2"
                        style={{ fontFamily: design.headingFont, borderColor: design.cardBorder }}
                      >
                        {bodyHeading}
                      </h3>
                    )}
                    <div
                      className="text-xs leading-relaxed prose prose-invert max-w-none opacity-90"
                      dangerouslySetInnerHTML={{
                        __html: bodyContent || '<p>Editorial narrative will render here...</p>',
                      }}
                    />
                  </div>
                )}

                {/* Custom Sections Preview */}
                {sectionsEnabled.customSections &&
                  customSections
                    .filter((c) => c.enabled !== false)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-6 border-t"
                        style={{ backgroundColor: c.backgroundColor || 'transparent', borderColor: design.cardBorder }}
                      >
                        <div
                          className={`mx-auto ${
                            c.containerWidth === 'narrow'
                              ? 'max-w-2xl'
                              : c.containerWidth === 'full'
                              ? 'w-full'
                              : 'max-w-4xl'
                          }`}
                          dangerouslySetInnerHTML={{ __html: c.html }}
                        />
                      </div>
                    ))}

                {/* Value Props Preview */}
                {sectionsEnabled.valueProps && (
                  <div
                    className="p-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs"
                    style={{ backgroundColor: design.cardBg, borderColor: design.cardBorder }}
                  >
                    <div>
                      <div className="font-bold mb-1" style={{ color: design.accentColor }}>
                        🛡️ Insured Armored Transit
                      </div>
                      <div className="text-[10px] opacity-75">Brink&apos;s vault delivery</div>
                    </div>
                    <div>
                      <div className="font-bold mb-1" style={{ color: design.accentColor }}>
                        💎 GIA Certified
                      </div>
                      <div className="text-[10px] opacity-75">Laser inscribed dossiers</div>
                    </div>
                    <div>
                      <div className="font-bold mb-1" style={{ color: design.accentColor }}>
                        ✨ Lifetime Care
                      </div>
                      <div className="text-[10px] opacity-75">Ultrasonic steam cleaning</div>
                    </div>
                    <div>
                      <div className="font-bold mb-1" style={{ color: design.accentColor }}>
                        🏛️ Haute Salons
                      </div>
                      <div className="text-[10px] opacity-75">Private viewing suites</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">
                {editingPage ? 'Changes will be immediately reflected on storefront' : 'New page will be published live'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingPage ? 'Save & Update Page' : 'Publish Page Live'}</span>
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
