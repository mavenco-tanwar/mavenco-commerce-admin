'use client';

import React, { useState, useEffect } from 'react';
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
  PanelBottom,
  Share2,
  CreditCard,
  Copyright as CopyrightIcon,
  Type,
  Mail,
  Minus,
  Maximize2,
  Code,
  MapPin,
  CheckCircle2,
  Loader2,
  Copy,
  Settings2,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';
import { POPULAR_FONTS } from '@/components/builder/tokens/themeTokens';

interface FooterBlock {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  columnSpan?: number;
  content: Record<string, any>;
  styles?: Record<string, any>;
  responsive?: {
    desktop?: { visible?: boolean };
    tablet?: { visible?: boolean };
    mobile?: { visible?: boolean };
  };
}

interface FooterSection {
  id: string;
  name: string;
  subtitle?: string;
  badge?: string;
  enabled: boolean;
  order: number;
  columns: {
    id: string;
    label: string;
    blocks: FooterBlock[];
  }[];
  responsive?: {
    desktop?: { visible?: boolean };
    tablet?: { visible?: boolean };
    mobile?: { visible?: boolean; accordion?: boolean };
  };
}

interface FooterTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  headingColor: string;
  mutedTextColor: string;
  borderColor: string;
  fontFamily: string;
  headingFontFamily: string;
  fontSize: string;
  letterSpacing: string;
}

interface FooterConfig {
  id: string;
  tenantSlug: string;
  name: string;
  type: 'footer';
  status: 'draft' | 'published';
  version: number;
  theme: FooterTheme;
  sections: FooterSection[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

function getDefaultFooterConfig(tenantSlug: string = 'lumina', storeName: string = 'Lumina Atelier'): FooterConfig {
  const dynamicName = storeName || tenantSlug.toUpperCase();

  return {
    id: `footer_${tenantSlug}`,
    tenantSlug,
    name: 'Main Storefront Footer',
    type: 'footer',
    status: 'published',
    version: 1,
    theme: {
      primaryColor: '#07090E',
      secondaryColor: '#1E293B',
      accentColor: '#E11D48',
      backgroundColor: '#07090E',
      surfaceColor: '#0F131D',
      textColor: '#F8FAFC',
      headingColor: '#FFFFFF',
      mutedTextColor: '#94A3B8',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      headingFontFamily: 'Playfair Display, serif',
      fontSize: '13px',
      letterSpacing: '0.02em',
    },
    sections: [
      {
        id: 'sec_footer_main',
        name: 'Navigation & Newsletter Row',
        subtitle: 'Main 4-column multi-link navigation, brand overview, and VIP newsletter capture.',
        badge: '1',
        enabled: true,
        order: 1,
        columns: [
          {
            id: 'col_1_brand',
            label: 'COLUMN 1 (BRAND BIO)',
            blocks: [
              {
                id: 'blk_logo',
                type: 'logo',
                name: 'Storefront Brand Mark',
                enabled: true,
                content: {
                  logoType: 'text',
                  text: dynamicName,
                  linkUrl: '/',
                  width: 180,
                },
                styles: {
                  fontSize: '18px',
                  fontWeight: '800',
                  letterSpacing: '0.12em',
                  textColor: '#FFFFFF',
                },
              },
              {
                id: 'blk_bio',
                type: 'text',
                name: 'Brand Story / Bio',
                enabled: true,
                content: {
                  text: 'Bespoke artisanal essentials, engineered for modern luxury and fast worldwide dispatch.',
                },
                styles: {
                  fontSize: '12px',
                  textColor: '#94A3B8',
                },
              },
            ],
          },
          {
            id: 'col_2_shop',
            label: 'COLUMN 2 (SHOP LINKS)',
            blocks: [
              {
                id: 'blk_menu_shop',
                type: 'menu',
                name: 'Shop Collections Menu (5 links)',
                enabled: true,
                content: {
                  heading: 'SHOP',
                  items: [
                    { label: 'New Arrivals', href: '/new-arrivals' },
                    { label: 'Women', href: '/women' },
                    { label: 'Men', href: '/men' },
                    { label: 'Collections', href: '/collections' },
                    { label: 'Private Sale', href: '/sale' },
                  ],
                },
              },
            ],
          },
          {
            id: 'col_3_care',
            label: 'COLUMN 3 (CUSTOMER CARE)',
            blocks: [
              {
                id: 'blk_menu_care',
                type: 'menu',
                name: 'Customer Concierge Menu (5 links)',
                enabled: true,
                content: {
                  heading: 'CUSTOMER CARE',
                  items: [
                    { label: 'Client Concierge', href: '/contact' },
                    { label: 'Shipping & Delivery', href: '/shipping' },
                    { label: 'Returns & Exchanges', href: '/returns' },
                    { label: 'Atelier FAQ', href: '/faq' },
                    { label: 'Privacy & Terms', href: '/privacy' },
                  ],
                },
              },
            ],
          },
          {
            id: 'col_4_newsletter',
            label: 'COLUMN 4 (NEWSLETTER)',
            blocks: [
              {
                id: 'blk_newsletter',
                type: 'newsletter',
                name: 'VIP Newsletter Capture',
                enabled: true,
                content: {
                  heading: 'NEWSLETTER',
                  description: 'Subscribe for private drops, seasonal previews, and exclusive offers.',
                  placeholder: 'Enter your email address...',
                  buttonText: 'SUBSCRIBE',
                  privacyText: 'Instant unsubscription available at any time.',
                  successMessage: 'Welcome to our private circle.',
                },
                styles: {
                  buttonBgColor: '#E11D48',
                  buttonTextColor: '#FFFFFF',
                },
              },
            ],
          },
        ],
        responsive: {
          desktop: { visible: true },
          tablet: { visible: true },
          mobile: { visible: true, accordion: true },
        },
      },
      {
        id: 'sec_footer_social',
        name: 'Social Channels & Payment Methods Row',
        subtitle: 'Connect channels (Instagram, WhatsApp, Facebook) and verified checkout badges.',
        badge: '2',
        enabled: true,
        order: 2,
        columns: [
          {
            id: 'col_social_left',
            label: 'LEFT ZONE (SOCIAL CHANNELS)',
            blocks: [
              {
                id: 'blk_social',
                type: 'social_icons',
                name: 'Social Media Channels',
                enabled: true,
                content: {
                  heading: 'CONNECT WITH US',
                  platforms: [
                    { name: 'Instagram', url: 'https://instagram.com', enabled: true },
                    { name: 'Facebook', url: 'https://facebook.com', enabled: true },
                    { name: 'WhatsApp', url: 'https://whatsapp.com', enabled: true },
                    { name: 'Pinterest', url: 'https://pinterest.com', enabled: true },
                  ],
                },
              },
            ],
          },
          {
            id: 'col_social_right',
            label: 'RIGHT ZONE (PAYMENT METHODS)',
            blocks: [
              {
                id: 'blk_payments',
                type: 'payment_icons',
                name: 'Verified Payment Badges',
                enabled: true,
                content: {
                  methods: [
                    { name: 'Visa', enabled: true },
                    { name: 'Mastercard', enabled: true },
                    { name: 'Amex', enabled: true },
                    { name: 'Apple Pay', enabled: true },
                    { name: 'Google Pay', enabled: true },
                    { name: 'UPI', enabled: true },
                  ],
                },
              },
            ],
          },
        ],
        responsive: {
          desktop: { visible: true },
          tablet: { visible: true },
          mobile: { visible: true },
        },
      },
      {
        id: 'sec_footer_bottom',
        name: 'Copyright & Legal Notice Row',
        subtitle: 'Dynamic copyright statement with automatic year and store name.',
        badge: '3',
        enabled: true,
        order: 3,
        columns: [
          {
            id: 'col_copyright_full',
            label: 'FULL WIDTH ZONE (COPYRIGHT)',
            blocks: [
              {
                id: 'blk_copyright',
                type: 'copyright',
                name: 'Dynamic Copyright Line',
                enabled: true,
                content: {
                  template: '© {{year}} {{store.name}}. All rights reserved. Powered by Mavenco Commerce.',
                  storeName: dynamicName,
                },
                styles: {
                  textColor: '#64748B',
                  fontSize: '11px',
                  textAlign: 'center',
                },
              },
            ],
          },
        ],
        responsive: {
          desktop: { visible: true },
          tablet: { visible: true },
          mobile: { visible: true },
        },
      },
    ],
  };
}

export default function FooterBuilderStudio() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'canvas' | 'navigation' | 'theme' | 'mobile' | 'newsletter'>('canvas');
  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals & Drawers
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<FooterBlock | null>(null);
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [editingColumn, setEditingColumn] = useState<{ secId: string; colId: string; label: string } | null>(null);

  // Drag and Drop State
  const [draggedBlockInfo, setDraggedBlockInfo] = useState<{ secId: string; colId: string; blockId: string } | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);

  // Configuration State
  const [config, setConfig] = useState<FooterConfig>(getDefaultFooterConfig('lumina', 'Lumina Atelier'));

  // Undo / Redo History
  const [history, setHistory] = useState<FooterConfig[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const pushHistory = (newConfig: FooterConfig) => {
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

  // Load Data on Mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const tenant = PlatformService.getActiveTenant();
        setActiveTenant(tenant);

        const slug = (tenant?.slug || 'lumina').toLowerCase().trim();
        const res = await ApiClient.get<any>(`/api/v1/content/footer?tenant=${slug}&preview=draft&_t=${Date.now()}`);

        if (res.data?.sections && res.data.sections.length > 0) {
          const normalizedSections: FooterSection[] = res.data.sections.map((sec: any, sIdx: number) => {
            if (sec.columns) return sec;
            const cols = sec.layout?.columns?.desktop || 4;
            const columnsList: any[] = [];
            for (let i = 0; i < cols; i++) {
              columnsList.push({
                id: `col_${sec.id}_${i + 1}`,
                label: `COLUMN ${i + 1}`,
                blocks: (sec.blocks || []).filter((_: any, bIdx: number) => bIdx % cols === i),
              });
            }
            return {
              id: sec.id || `sec_${sIdx + 1}`,
              name: sec.name || `Section ${sIdx + 1}`,
              subtitle: sec.subtitle || 'Custom content row',
              badge: String(sIdx + 1),
              enabled: sec.enabled !== false,
              order: sec.order || sIdx + 1,
              columns: columnsList,
              responsive: sec.responsive || { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
            };
          });

          const initial = { ...res.data, sections: normalizedSections };
          setConfig(initial);
          setHistory([JSON.parse(JSON.stringify(initial))]);
          setHistoryIdx(0);
        } else {
          const initial = getDefaultFooterConfig(slug, tenant?.name || 'Lumina Atelier');
          setConfig(initial);
          setHistory([JSON.parse(JSON.stringify(initial))]);
          setHistoryIdx(0);
        }
      } catch (err) {
        console.warn('Failed to load footer config from API, using default seed:', err);
        const t = PlatformService.getActiveTenant();
        const initial = getDefaultFooterConfig(t?.slug || 'lumina', t?.name || 'Lumina Atelier');
        setConfig(initial);
        setHistory([JSON.parse(JSON.stringify(initial))]);
        setHistoryIdx(0);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    window.addEventListener("tenant_updated", loadData);
    return () => window.removeEventListener("tenant_updated", loadData);
  }, []);

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const slug = activeTenant?.slug || config.tenantSlug || 'lumina';
      const apiSections = config.sections.map((sec) => ({
        id: sec.id,
        name: sec.name,
        enabled: sec.enabled,
        order: sec.order,
        layout: {
          containerWidth: 'contained',
          columns: { desktop: sec.columns.length || 4, tablet: 2, mobile: 1 },
        },
        styles: { backgroundColor: 'transparent' },
        responsive: sec.responsive,
        blocks: sec.columns.flatMap((col) => col.blocks),
      }));

      await ApiClient.put(`/api/v1/content/footer?tenant=${slug}`, {
        ...config,
        sections: apiSections,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      });
      showToast('Draft configuration saved to MongoDB Atlas', 'success');
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
      const slug = activeTenant?.slug || config.tenantSlug || 'lumina';
      const apiSections = config.sections.map((sec) => ({
        id: sec.id,
        name: sec.name,
        enabled: sec.enabled,
        order: sec.order,
        layout: {
          containerWidth: 'contained',
          columns: { desktop: sec.columns.length || 4, tablet: 2, mobile: 1 },
        },
        styles: { backgroundColor: 'transparent' },
        responsive: sec.responsive,
        blocks: sec.columns.flatMap((col) => col.blocks),
      }));

      const nextVersion = config.version + 1;
      const pubDoc = {
        ...config,
        sections: apiSections,
        status: 'published' as const,
        version: nextVersion,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ApiClient.put(`/api/v1/content/footer?tenant=${slug}`, pubDoc);
      setConfig({ ...config, version: nextVersion, status: 'published' });
      pushHistory({ ...config, version: nextVersion, status: 'published' });
      showToast(`Version ${nextVersion} published live to storefront!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish live', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // 1. ADD NEW ROW / SECTION
  const handleAddNewSection = () => {
    const newIdx = config.sections.length + 1;
    const newSec: FooterSection = {
      id: `sec_footer_custom_${Date.now()}`,
      name: `Custom Row ${newIdx}`,
      subtitle: 'Configurable multi-zone content row',
      badge: String(newIdx),
      enabled: true,
      order: newIdx,
      columns: [
        { id: `col_${Date.now()}_1`, label: 'COLUMN 1', blocks: [] },
        { id: `col_${Date.now()}_2`, label: 'COLUMN 2', blocks: [] },
        { id: `col_${Date.now()}_3`, label: 'COLUMN 3', blocks: [] },
      ],
      responsive: {
        desktop: { visible: true },
        tablet: { visible: true },
        mobile: { visible: true },
      },
    };

    const next = { ...config, sections: [...config.sections, newSec] };
    setConfig(next);
    pushHistory(next);
    showToast(`Added Row ${newIdx} (3 Columns)`, 'info');
  };

  // 2. DELETE ROW / SECTION
  const handleDeleteSection = (secId: string) => {
    if (config.sections.length <= 1) {
      showToast('You must have at least one footer row.', 'info');
      return;
    }
    const nextSections = config.sections
      .filter((s) => s.id !== secId)
      .map((s, idx) => ({ ...s, order: idx + 1, badge: String(idx + 1) }));
    const next = { ...config, sections: nextSections };
    setConfig(next);
    pushHistory(next);
    showToast('Row removed', 'info');
  };

  // 3. DUPLICATE ROW / SECTION
  const handleDuplicateSection = (secId: string) => {
    const target = config.sections.find((s) => s.id === secId);
    if (!target) return;
    const cloned: FooterSection = JSON.parse(JSON.stringify(target));
    cloned.id = `sec_footer_copy_${Date.now()}`;
    cloned.name = `${cloned.name} (Copy)`;
    cloned.order = config.sections.length + 1;
    cloned.badge = String(config.sections.length + 1);

    const next = { ...config, sections: [...config.sections, cloned] };
    setConfig(next);
    pushHistory(next);
    showToast('Row duplicated', 'info');
  };

  // 4. MOVE ROW UP / DOWN
  const handleMoveSection = (secId: string, direction: 'up' | 'down') => {
    const list = [...config.sections];
    const idx = list.findIndex((s) => s.id === secId);
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
    const next = {
      ...config,
      sections: list.map((s, i) => ({ ...s, order: i + 1, badge: String(i + 1) })),
    };
    setConfig(next);
    pushHistory(next);
  };

  // 5. CHANGE COLUMN COUNT IN A ROW (1, 2, 3, 4, 6 columns)
  const handleSetColumnCount = (secId: string, count: number) => {
    const nextSections = config.sections.map((sec) => {
      if (sec.id === secId) {
        const currentCols = sec.columns;
        let newCols = [...currentCols];

        if (count > currentCols.length) {
          // Add columns
          for (let i = currentCols.length; i < count; i++) {
            newCols.push({
              id: `col_${sec.id}_${Date.now()}_${i + 1}`,
              label: `COLUMN ${i + 1}`,
              blocks: [],
            });
          }
        } else if (count < currentCols.length) {
          // Reduce columns, preserve blocks by moving into the last remaining column
          const keptCols = newCols.slice(0, count);
          const removedBlocks = newCols.slice(count).flatMap((c) => c.blocks);
          if (keptCols.length > 0 && removedBlocks.length > 0) {
            keptCols[keptCols.length - 1].blocks = [
              ...keptCols[keptCols.length - 1].blocks,
              ...removedBlocks,
            ];
          }
          newCols = keptCols;
        }

        return { ...sec, columns: newCols };
      }
      return sec;
    });

    const next = { ...config, sections: nextSections };
    setConfig(next);
    pushHistory(next);
    showToast(`Updated row to ${count} columns`, 'info');
  };

  // 6. BLOCK ACTIONS
  const handleToggleBlock = (secId: string, colId: string, blockId: string) => {
    const nextSections = config.sections.map((sec) => {
      if (sec.id === secId) {
        const nextCols = sec.columns.map((col) => {
          if (col.id === colId) {
            const nextBlocks = col.blocks.map((b) => (b.id === blockId ? { ...b, enabled: !b.enabled } : b));
            return { ...col, blocks: nextBlocks };
          }
          return col;
        });
        return { ...sec, columns: nextCols };
      }
      return sec;
    });

    const next = { ...config, sections: nextSections };
    setConfig(next);
    pushHistory(next);
  };

  const handleDeleteBlock = (secId: string, colId: string, blockId: string) => {
    const nextSections = config.sections.map((sec) => {
      if (sec.id === secId) {
        const nextCols = sec.columns.map((col) => {
          if (col.id === colId) {
            return { ...col, blocks: col.blocks.filter((b) => b.id !== blockId) };
          }
          return col;
        });
        return { ...sec, columns: nextCols };
      }
      return sec;
    });

    const next = { ...config, sections: nextSections };
    setConfig(next);
    pushHistory(next);
    showToast('Block removed', 'info');
  };

  const handleAddBlock = (secId: string, colId: string, type: string) => {
    const newBlock: FooterBlock = {
      id: `blk_${type}_${Date.now()}`,
      type,
      name:
        type === 'logo'
          ? 'Brand Logo'
          : type === 'text'
          ? 'Paragraph Text'
          : type === 'menu'
          ? 'Navigation Menu'
          : type === 'newsletter'
          ? 'VIP Newsletter'
          : type === 'social_icons'
          ? 'Social Profiles'
          : type === 'payment_icons'
          ? 'Payment Methods'
          : type === 'copyright'
          ? 'Copyright Statement'
          : 'Custom Block',
      enabled: true,
      content:
        type === 'logo'
          ? { logoType: 'text', text: activeTenant?.name || 'STOREFRONT', width: 180 }
          : type === 'menu'
          ? { heading: 'LINKS', items: [{ label: 'Shop All', href: '/collections' }] }
          : type === 'newsletter'
          ? { heading: 'NEWSLETTER', description: 'Stay connected.', buttonText: 'SUBSCRIBE' }
          : {},
    };

    const nextSections = config.sections.map((sec) => {
      if (sec.id === secId) {
        const nextCols = sec.columns.map((col) => {
          if (col.id === colId) {
            return { ...col, blocks: [...col.blocks, newBlock] };
          }
          return col;
        });
        return { ...sec, columns: nextCols };
      }
      return sec;
    });

    const next = { ...config, sections: nextSections };
    setConfig(next);
    pushHistory(next);
    showToast(`Added ${newBlock.name}`, 'info');
  };

  const handleUpdateEditingBlock = (updated: Partial<FooterBlock>) => {
    if (!editingBlock) return;
    const modified = { ...editingBlock, ...updated };
    setEditingBlock(modified);

    const nextSections = config.sections.map((sec) => ({
      ...sec,
      columns: sec.columns.map((col) => ({
        ...col,
        blocks: col.blocks.map((b) => (b.id === editingBlock.id ? modified : b)),
      })),
    }));

    const next = { ...config, sections: nextSections };
    setConfig(next);
    pushHistory(next);
  };

  const handleUpdateEditingSection = (updated: Partial<FooterSection>) => {
    if (!editingSection) return;
    const modified = { ...editingSection, ...updated };
    setEditingSection(modified);

    const nextSections = config.sections.map((s) => (s.id === editingSection.id ? modified : s));
    const next = { ...config, sections: nextSections };
    setConfig(next);
    pushHistory(next);
  };

  // 7. DRAG AND DROP HANDLERS
  const handleBlockDragStart = (e: React.DragEvent, secId: string, colId: string, blockId: string) => {
    e.stopPropagation();
    const info = { secId, colId, blockId };
    setDraggedBlockInfo(info);
    e.dataTransfer.setData('text/plain', JSON.stringify(info));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBlockDragOver = (e: React.DragEvent, colId: string, blockId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) setDragOverColId(colId);
    if (blockId && dragOverBlockId !== blockId) setDragOverBlockId(blockId);
  };

  const handleBlockDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBlockDrop = (e: React.DragEvent, targetSecId: string, targetColId: string, targetBlockId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColId(null);
    setDragOverBlockId(null);

    let sourceInfo = draggedBlockInfo;
    const raw = e.dataTransfer.getData('text/plain');
    if (raw) {
      try {
        sourceInfo = JSON.parse(raw);
      } catch {}
    }
    if (!sourceInfo) return;

    const { secId: srcSecId, colId: srcColId, blockId: srcBlockId } = sourceInfo;
    if (srcSecId === targetSecId && srcColId === targetColId && srcBlockId === targetBlockId) {
      setDraggedBlockInfo(null);
      return;
    }

    // Extract moving block from source column
    let movingBlock: FooterBlock | null = null;
    const nextSections = config.sections.map((sec) => {
      if (sec.id === srcSecId) {
        const nextCols = sec.columns.map((col) => {
          if (col.id === srcColId) {
            const found = col.blocks.find((b) => b.id === srcBlockId);
            if (found) movingBlock = found;
            return { ...col, blocks: col.blocks.filter((b) => b.id !== srcBlockId) };
          }
          return col;
        });
        return { ...sec, columns: nextCols };
      }
      return sec;
    });

    if (!movingBlock) {
      setDraggedBlockInfo(null);
      return;
    }

    // Place into target column
    const finalSections = nextSections.map((sec) => {
      if (sec.id === targetSecId) {
        const nextCols = sec.columns.map((col) => {
          if (col.id === targetColId) {
            const list = [...col.blocks];
            if (targetBlockId) {
              const targetIdx = list.findIndex((b) => b.id === targetBlockId);
              if (targetIdx !== -1) {
                list.splice(targetIdx, 0, movingBlock!);
              } else {
                list.push(movingBlock!);
              }
            } else {
              list.push(movingBlock!);
            }
            return { ...col, blocks: list };
          }
          return col;
        });
        return { ...sec, columns: nextCols };
      }
      return sec;
    });

    setConfig({ ...config, sections: finalSections });
    pushHistory({ ...config, sections: finalSections });
    setDraggedBlockInfo(null);
    showToast(`Moved ${(movingBlock as FooterBlock).name}`, 'info');
  };

  const handleMoveBlockOrder = (secId: string, colId: string, blockId: string, direction: 'up' | 'down') => {
    const nextSections = config.sections.map((sec) => {
      if (sec.id === secId) {
        const nextCols = sec.columns.map((col) => {
          if (col.id === colId) {
            const list = [...col.blocks];
            const idx = list.findIndex((b) => b.id === blockId);
            if (idx === -1) return col;
            if (direction === 'up' && idx > 0) {
              const temp = list[idx];
              list[idx] = list[idx - 1];
              list[idx - 1] = temp;
            } else if (direction === 'down' && idx < list.length - 1) {
              const temp = list[idx];
              list[idx] = list[idx + 1];
              list[idx + 1] = temp;
            }
            return { ...col, blocks: list };
          }
          return col;
        });
        return { ...sec, columns: nextCols };
      }
      return sec;
    });

    const next = { ...config, sections: nextSections };
    setConfig(next);
    pushHistory(next);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading {activeTenant?.name ? `${activeTenant.name} ` : ''}Footer Builder Studio...
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
              Visual Theme Studio
            </span>
            <span className="text-xs font-mono text-slate-400">
              Store: <strong className="text-white">{activeTenant?.name || 'Lumina Atelier'}</strong>{' '}
              <span className="text-slate-600">({activeTenant?.slug || 'lumina'})</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <PanelBottom className="w-7 h-7 text-rose-500" />
            <span>Footer &amp; Multi-Column Navigation Builder</span>
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Design, arrange, and style 1, 2, 3, or more multi-column footer rows with dynamic newsletter capture, social channels, and payment badges in real-time.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Layout Templates</span>
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

      {/* 2. NAVIGATION TABS BAR (Pills matching Header Builder) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'canvas'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Section &amp; Row Layout ({config.sections.length} Rows)</span>
        </button>

        <button
          onClick={() => setActiveTab('navigation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'navigation'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Multi-Column Menus</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Theme &amp; Style Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('mobile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'mobile'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile Drawer &amp; Accordions</span>
        </button>

        <button
          onClick={() => setActiveTab('newsletter')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'newsletter'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Newsletter &amp; Badges</span>
        </button>
      </div>

      {/* 3. TAB 1: SECTION & ROW LAYOUT (Fully Editable Rows Architecture) */}
      {activeTab === 'canvas' && (
        <div className="space-y-6">
          {config.sections.map((section, sIdx) => (
            <div
              key={section.id}
              className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5"
            >
              {/* Section Card Header (Fully Editable) */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                    {section.badge || sIdx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-wide truncate">{section.name}</h3>
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Edit Row Title & Subtitle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{section.subtitle || 'Custom content row'}</p>
                  </div>
                </div>

                {/* Right Controls: Column Count Switcher + Row Movement + Duplicate/Delete */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Column Count Selector */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5">Cols:</span>
                    {[1, 2, 3, 4, 6].map((count) => (
                      <button
                        key={count}
                        onClick={() => handleSetColumnCount(section.id, count)}
                        className={`px-2 py-0.5 rounded font-bold text-xs transition-colors ${
                          section.columns.length === count
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title={`Set to ${count} Columns`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>

                  {/* Row Reorder Up / Down */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                    <button
                      onClick={() => handleMoveSection(section.id, 'up')}
                      disabled={sIdx === 0}
                      className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
                        sIdx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      title="Move Row Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(section.id, 'down')}
                      disabled={sIdx === config.sections.length - 1}
                      className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
                        sIdx === config.sections.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      title="Move Row Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Duplicate & Delete Row */}
                  <button
                    onClick={() => handleDuplicateSection(section.id)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Duplicate Row"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Enable Row Checkbox */}
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span>Enable Row</span>
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) => {
                        const nextSections = config.sections.map((s) =>
                          s.id === section.id ? { ...s, enabled: e.target.checked } : s
                        );
                        const next = { ...config, sections: nextSections };
                        setConfig(next);
                        pushHistory(next);
                      }}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Column Zones Grid */}
              <div
                className={`grid gap-4 ${
                  section.columns.length === 1
                    ? 'grid-cols-1'
                    : section.columns.length === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : section.columns.length === 3
                    ? 'grid-cols-1 md:grid-cols-3'
                    : section.columns.length === 4
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                }`}
              >
                {section.columns.map((col, cIdx) => (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleBlockDragOver(e, col.id)}
                    onDragLeave={handleBlockDragLeave}
                    onDrop={(e) => handleBlockDrop(e, section.id, col.id)}
                    className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                      dragOverColId === col.id
                        ? 'bg-rose-950/30 border-rose-500/80 ring-2 ring-rose-500/30'
                        : 'bg-[#090D15] border-slate-800/80'
                    }`}
                  >
                    {/* Column Zone Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/50 pb-2.5 mb-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                          {col.label}
                        </span>
                        <button
                          onClick={() => setEditingColumn({ secId: section.id, colId: col.id, label: col.label })}
                          className="p-0.5 text-slate-500 hover:text-white"
                          title="Rename Column"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Add Block Dropdown */}
                      <div className="relative group">
                        <button className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors">
                          <Plus className="w-3 h-3 text-rose-400" />
                          <span>Add Block</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        <div className="absolute right-0 top-full mt-1 w-44 bg-[#0F131D] border border-slate-700/80 rounded-xl p-1 shadow-2xl z-20 hidden group-hover:block animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => handleAddBlock(section.id, col.id, 'logo')}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-rose-600/20 flex items-center gap-2"
                          >
                            <PanelBottom className="w-3.5 h-3.5 text-rose-400" />
                            <span>Brand Logo</span>
                          </button>
                          <button
                            onClick={() => handleAddBlock(section.id, col.id, 'text')}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-rose-600/20 flex items-center gap-2"
                          >
                            <Type className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Text / Bio</span>
                          </button>
                          <button
                            onClick={() => handleAddBlock(section.id, col.id, 'menu')}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-rose-600/20 flex items-center gap-2"
                          >
                            <Menu className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Navigation Menu</span>
                          </button>
                          <button
                            onClick={() => handleAddBlock(section.id, col.id, 'newsletter')}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-rose-600/20 flex items-center gap-2"
                          >
                            <Mail className="w-3.5 h-3.5 text-pink-400" />
                            <span>VIP Newsletter</span>
                          </button>
                          <button
                            onClick={() => handleAddBlock(section.id, col.id, 'social_icons')}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-rose-600/20 flex items-center gap-2"
                          >
                            <Share2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Social Profiles</span>
                          </button>
                          <button
                            onClick={() => handleAddBlock(section.id, col.id, 'payment_icons')}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-rose-600/20 flex items-center gap-2"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                            <span>Payment Badges</span>
                          </button>
                          <button
                            onClick={() => handleAddBlock(section.id, col.id, 'copyright')}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-rose-600/20 flex items-center gap-2"
                          >
                            <CopyrightIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copyright Line</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Zone Blocks List with Full Drag and Drop */}
                    <div className="space-y-2 flex-1">
                      {col.blocks.length === 0 ? (
                        <div className="p-4 rounded-lg border border-dashed border-slate-800 text-center text-slate-600 text-xs">
                          Drop block here or click + Add Block
                        </div>
                      ) : (
                        col.blocks.map((block, bIdx) => (
                          <div
                            key={block.id}
                            draggable={true}
                            onDragStart={(e) => handleBlockDragStart(e, section.id, col.id, block.id)}
                            onDragOver={(e) => handleBlockDragOver(e, col.id, block.id)}
                            onDrop={(e) => handleBlockDrop(e, section.id, col.id, block.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                              draggedBlockInfo?.blockId === block.id
                                ? 'opacity-40 scale-95 border-rose-500 bg-rose-950/20'
                                : dragOverBlockId === block.id
                                ? 'border-t-2 border-t-rose-500 bg-slate-800'
                                : block.enabled
                                ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-white shadow-sm'
                                : 'bg-slate-950/40 border-dashed border-slate-800/60 text-slate-500 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0 cursor-grab" />
                              <span className="text-xs font-bold truncate">{block.name}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveBlockOrder(section.id, col.id, block.id, 'up');
                                }}
                                disabled={bIdx === 0}
                                className={`p-1 rounded text-slate-500 hover:text-white ${
                                  bIdx === 0 ? 'opacity-20 cursor-not-allowed' : ''
                                }`}
                                title="Move Block Up"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveBlockOrder(section.id, col.id, block.id, 'down');
                                }}
                                disabled={bIdx === col.blocks.length - 1}
                                className={`p-1 rounded text-slate-500 hover:text-white ${
                                  bIdx === col.blocks.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
                                }`}
                                title="Move Block Down"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleBlock(section.id, col.id, block.id);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white"
                                title={block.enabled ? 'Hide Block' : 'Show Block'}
                              >
                                {block.enabled ? (
                                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingBlock(block);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white"
                                title="Edit Block Properties"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBlock(section.id, col.id, block.id);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-400"
                                title="Delete Block"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ADD NEW ROW BUTTON */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleAddNewSection}
              className="px-6 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-2 border-dashed border-slate-800 hover:border-rose-500/50 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg group"
            >
              <Plus className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Add Another Footer Row / Section</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. TAB 2: MULTI-COLUMN MENUS TAB */}
      {activeTab === 'navigation' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Multi-Column Footer Navigation Menus</h3>
            <p className="text-xs text-slate-400">
              Manage custom link lists (Shop Collections, Customer Care, Legal &amp; Policies) for your storefront footer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.sections
              .flatMap((sec) => sec.columns.flatMap((col) => col.blocks))
              .filter((blk) => blk.type === 'menu')
              .map((menuBlock) => (
                <div key={menuBlock.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {menuBlock.content?.heading || 'Navigation Column'}
                      </h4>
                      <span className="text-[10px] text-slate-500">{menuBlock.content?.items?.length || 0} links</span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingBlock(menuBlock);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-bold transition-colors"
                    >
                      Edit Menu
                    </button>
                  </div>

                  <ul className="space-y-1.5">
                    {(menuBlock.content?.items || []).map((it: any, i: number) => (
                      <li
                        key={i}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800/60 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-200">{it.label}</span>
                        <span className="text-[11px] font-mono text-slate-500">{it.href}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: THEME & STYLE COLORS */}
      {activeTab === 'theme' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Footer Theme &amp; Style Colors</h3>
            <p className="text-xs text-slate-400">
              Customize background colors, typography marks, heading fonts, and link hover accents across all footer sections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.theme?.backgroundColor || '#07090E'}
                  onChange={(e) => {
                    const next = { ...config, theme: { ...config.theme, backgroundColor: e.target.value } };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={config.theme?.backgroundColor || '#07090E'}
                  onChange={(e) => {
                    const next = { ...config, theme: { ...config.theme, backgroundColor: e.target.value } };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Accent / Button Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.theme?.accentColor || '#E11D48'}
                  onChange={(e) => {
                    const next = { ...config, theme: { ...config.theme, accentColor: e.target.value } };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={config.theme?.accentColor || '#E11D48'}
                  onChange={(e) => {
                    const next = { ...config, theme: { ...config.theme, accentColor: e.target.value } };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Text &amp; Link Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.theme?.textColor || '#F8FAFC'}
                  onChange={(e) => {
                    const next = { ...config, theme: { ...config.theme, textColor: e.target.value } };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={config.theme?.textColor || '#F8FAFC'}
                  onChange={(e) => {
                    const next = { ...config, theme: { ...config.theme, textColor: e.target.value } };
                    setConfig(next);
                    pushHistory(next);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Font Family
              </label>
              <select
                value={config.theme?.fontFamily || 'Plus Jakarta Sans, sans-serif'}
                onChange={(e) => {
                  const next = { ...config, theme: { ...config.theme, fontFamily: e.target.value } };
                  setConfig(next);
                  pushHistory(next);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                {POPULAR_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Heading Font Family
              </label>
              <select
                value={config.theme?.headingFontFamily || 'Playfair Display, serif'}
                onChange={(e) => {
                  const next = { ...config, theme: { ...config.theme, headingFontFamily: e.target.value } };
                  setConfig(next);
                  pushHistory(next);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                {POPULAR_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: MOBILE ACCORDIONS */}
      {activeTab === 'mobile' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Mobile Drawer &amp; Accordion Collapsing</h3>
            <p className="text-xs text-slate-400">
              Configure how navigation columns collapse into interactive mobile touch accordions on phone screens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-white cursor-pointer">
              <span>Enable Mobile Accordion Collapsing</span>
              <input
                type="checkbox"
                checked={config.sections[0]?.responsive?.mobile?.accordion !== false}
                onChange={(e) => {
                  const nextSections = config.sections.map((s, idx) =>
                    idx === 0
                      ? { ...s, responsive: { ...s.responsive, mobile: { ...s.responsive?.mobile, accordion: e.target.checked } } }
                      : s
                  );
                  const next = { ...config, sections: nextSections };
                  setConfig(next);
                  pushHistory(next);
                }}
                className="w-4 h-4 text-rose-600 rounded"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              When enabled, each multi-column menu automatically becomes a clean, expandable accordion on screens narrower than 768px.
            </p>
          </div>
        </div>
      )}

      {/* 7. TAB 5: NEWSLETTER & BADGES */}
      {activeTab === 'newsletter' && (
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">VIP Newsletter Capture &amp; Security Badges</h3>
            <p className="text-xs text-slate-400">
              Customize conversion-focused newsletter subscription messaging and trust badges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Newsletter Heading
                </label>
                <input
                  type="text"
                  defaultValue="NEWSLETTER"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  defaultValue="SUBSCRIBE"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT ROW / SECTION TITLE & SUBTITLE */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Edit Row Details
              </h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Row Title / Label
                </label>
                <input
                  type="text"
                  value={editingSection.name}
                  onChange={(e) => handleUpdateEditingSection({ name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Row Subtitle / Description
                </label>
                <input
                  type="text"
                  value={editingSection.subtitle || ''}
                  onChange={(e) => handleUpdateEditingSection({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT COLUMN LABEL */}
      {editingColumn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Rename Column Zone
              </h3>
              <button onClick={() => setEditingColumn(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Column Label
              </label>
              <input
                type="text"
                value={editingColumn.label}
                onChange={(e) => setEditingColumn({ ...editingColumn, label: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  const nextSections = config.sections.map((sec) => {
                    if (sec.id === editingColumn.secId) {
                      const nextCols = sec.columns.map((c) =>
                        c.id === editingColumn.colId ? { ...c, label: editingColumn.label } : c
                      );
                      return { ...sec, columns: nextCols };
                    }
                    return sec;
                  });
                  const next = { ...config, sections: nextSections };
                  setConfig(next);
                  pushHistory(next);
                  setEditingColumn(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDITING BLOCK PROPERTIES */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Edit {editingBlock.name}
              </h3>
              <button onClick={() => setEditingBlock(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editingBlock.name}
                  onChange={(e) => handleUpdateEditingBlock({ name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Logo block fields */}
              {editingBlock.type === 'logo' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Logo Text (Fallback)
                    </label>
                    <input
                      type="text"
                      value={editingBlock.content?.text || ''}
                      onChange={(e) =>
                        handleUpdateEditingBlock({
                          content: { ...editingBlock.content, text: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <ImageUploadInput
                    label="Footer Logo Image"
                    description="Upload custom brand logo asset for footer"
                    value={editingBlock.content?.imageUrl || editingBlock.content?.logoUrl || ''}
                    onChange={(url) =>
                      handleUpdateEditingBlock({
                        content: {
                          ...editingBlock.content,
                          imageUrl: url,
                          logoUrl: url,
                        },
                      })
                    }
                    aspectRatio="auto"
                    folder="Footer"
                  />
                </div>
              )}

              {/* Image block fields */}
              {editingBlock.type === 'image' && (
                <ImageUploadInput
                  label="Block Image"
                  description="Upload custom graphic or icon for footer"
                  value={editingBlock.content?.imageUrl || editingBlock.content?.url || ''}
                  onChange={(url) =>
                    handleUpdateEditingBlock({
                      content: {
                        ...editingBlock.content,
                        imageUrl: url,
                        url: url,
                      },
                    })
                  }
                  aspectRatio="auto"
                  folder="Footer"
                />
              )}

              {/* Text block fields */}
              {editingBlock.type === 'text' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Text Content
                  </label>
                  <textarea
                    rows={3}
                    value={editingBlock.content?.text || ''}
                    onChange={(e) =>
                      handleUpdateEditingBlock({
                        content: { ...editingBlock.content, text: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              )}

              {/* Menu block fields */}
              {editingBlock.type === 'menu' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Column Heading
                    </label>
                    <input
                      type="text"
                      value={editingBlock.content?.heading || ''}
                      onChange={(e) =>
                        handleUpdateEditingBlock({
                          content: { ...editingBlock.content, heading: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Menu Items
                    </label>
                    <div className="space-y-2">
                      {(editingBlock.content?.items || []).map((it: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={it.label}
                            onChange={(e) => {
                              const nextItems = [...(editingBlock.content?.items || [])];
                              nextItems[i] = { ...nextItems[i], label: e.target.value };
                              handleUpdateEditingBlock({
                                content: { ...editingBlock.content, items: nextItems },
                              });
                            }}
                            className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={it.href}
                            onChange={(e) => {
                              const nextItems = [...(editingBlock.content?.items || [])];
                              nextItems[i] = { ...nextItems[i], href: e.target.value };
                              handleUpdateEditingBlock({
                                content: { ...editingBlock.content, items: nextItems },
                              });
                            }}
                            className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                          />
                          <button
                            onClick={() => {
                              const nextItems = (editingBlock.content?.items || []).filter(
                                (_: any, idx: number) => idx !== i
                              );
                              handleUpdateEditingBlock({
                                content: { ...editingBlock.content, items: nextItems },
                              });
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const nextItems = [
                          ...(editingBlock.content?.items || []),
                          { label: 'New Link', href: '/' },
                        ];
                        handleUpdateEditingBlock({
                          content: { ...editingBlock.content, items: nextItems },
                        });
                      }}
                      className="mt-2 text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Link
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: LAYOUT TEMPLATES */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Layout Templates &amp; Presets
                </h3>
              </div>
              <button onClick={() => setIsTemplatesModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Choose a starting archetype to replace or scaffold your footer design.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                onClick={() => {
                  const initial = getDefaultFooterConfig(
                    activeTenant?.slug || 'lumina',
                    activeTenant?.name || 'Lumina Atelier'
                  );
                  setConfig(initial);
                  pushHistory(initial);
                  setIsTemplatesModalOpen(false);
                  showToast('Applied Classic Ecommerce Preset (3 Rows)');
                }}
                className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500 transition-all cursor-pointer group"
              >
                <h4 className="text-sm font-bold text-white group-hover:text-rose-400 mb-1">
                  Classic Ecommerce (3 Rows)
                </h4>
                <p className="text-xs text-slate-400">
                  3 distinct rows: 4-column link navigation, social &amp; payment badges row, and legal copyright bar.
                </p>
              </div>

              <div
                onClick={() => {
                  const initial = getDefaultFooterConfig(
                    activeTenant?.slug || 'lumina',
                    activeTenant?.name || 'Lumina Atelier'
                  );
                  // Keep only 1 sleek row
                  initial.sections = [initial.sections[0]];
                  initial.theme.backgroundColor = '#000000';
                  initial.theme.accentColor = '#FFFFFF';
                  setConfig(initial);
                  pushHistory(initial);
                  setIsTemplatesModalOpen(false);
                  showToast('Applied Minimalist Studio Preset (1 Row)');
                }}
                className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500 transition-all cursor-pointer group"
              >
                <h4 className="text-sm font-bold text-white group-hover:text-rose-400 mb-1">
                  Minimalist Studio (1 Row)
                </h4>
                <p className="text-xs text-slate-400">
                  Ultra-clean single-row layout for design studios and boutique fashion houses.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: FULLSCREEN LIVE PREVIEW */}
      {isLivePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-md flex flex-col">
          <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Storefront Live Preview
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
            <div
              style={{
                backgroundColor: config.theme?.backgroundColor || '#07090E',
                color: config.theme?.textColor || '#F8FAFC',
                fontFamily: config.theme?.fontFamily,
              }}
              className={`transition-all duration-300 border border-white/10 rounded-2xl p-8 ${
                device === 'desktop'
                  ? 'w-full max-w-7xl'
                  : device === 'tablet'
                  ? 'w-[768px] shadow-2xl rounded-3xl'
                  : 'w-[390px] shadow-2xl rounded-[36px]'
              }`}
            >
              {config.sections
                .filter((s) => s.enabled)
                .map((sec) => (
                  <div
                    key={sec.id}
                    className={`py-6 grid gap-8 border-b border-white/5 last:border-0 ${
                      sec.columns.length === 1
                        ? 'grid-cols-1'
                        : sec.columns.length === 2
                        ? 'grid-cols-1 md:grid-cols-2'
                        : sec.columns.length === 3
                        ? 'grid-cols-1 md:grid-cols-3'
                        : sec.columns.length === 4
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                    }`}
                  >
                    {sec.columns.map((col) => (
                      <div key={col.id} className="space-y-4 min-w-0">
                        {col.blocks
                          .filter((b) => b.enabled)
                          .map((b) => {
                            if (b.type === 'logo') {
                              return (
                                <div
                                  key={b.id}
                                  className="font-serif font-black uppercase tracking-widest text-lg text-white break-words"
                                >
                                  {b.content?.text || activeTenant?.name || 'STOREFRONT'}
                                </div>
                              );
                            }
                            if (b.type === 'text') {
                              return (
                                <p key={b.id} className="text-xs text-slate-400 font-sans break-words">
                                  {b.content?.text}
                                </p>
                              );
                            }
                            if (b.type === 'menu') {
                              return (
                                <div key={b.id} className="space-y-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                                    {b.content?.heading}
                                  </h4>
                                  <ul className="space-y-1 text-xs text-slate-400">
                                    {(b.content?.items || []).map((it: any, i: number) => (
                                      <li key={i}>{it.label}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            }
                            if (b.type === 'newsletter') {
                              return (
                                <div key={b.id} className="space-y-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                                    {b.content?.heading}
                                  </h4>
                                  <p className="text-xs text-slate-400">{b.content?.description}</p>
                                  <div className="flex flex-col gap-2">
                                    <input
                                      type="email"
                                      placeholder={b.content?.placeholder || 'Enter email...'}
                                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                                      disabled
                                    />
                                    <button
                                      style={{ backgroundColor: config.theme?.accentColor || '#E11D48' }}
                                      className="px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wider"
                                    >
                                      {b.content?.buttonText || 'Subscribe'}
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            if (b.type === 'social_icons') {
                              return (
                                <div key={b.id} className="space-y-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                                    {b.content?.heading}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    {(b.content?.platforms || [])
                                      .filter((p: any) => p.enabled)
                                      .map((p: any, i: number) => (
                                        <span
                                          key={i}
                                          className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300"
                                        >
                                          {p.name.charAt(0)}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              );
                            }
                            if (b.type === 'payment_icons') {
                              return (
                                <div key={b.id} className="flex items-center gap-2 flex-wrap">
                                  {(b.content?.methods || [])
                                    .filter((m: any) => m.enabled)
                                    .map((m: any, i: number) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase"
                                      >
                                        {m.name}
                                      </span>
                                    ))}
                                </div>
                              );
                            }
                            if (b.type === 'copyright') {
                              const y = new Date().getFullYear();
                              const txt = (b.content?.template || '© {{year}} {{store.name}}')
                                .replace('{{year}}', String(y))
                                .replace('{{store.name}}', activeTenant?.name || 'STOREFRONT');
                              return (
                                <div key={b.id} className="text-center text-xs text-slate-500 w-full">
                                  {txt}
                                </div>
                              );
                            }
                            return null;
                          })}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
