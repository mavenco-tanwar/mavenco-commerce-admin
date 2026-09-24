'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Store,
  Layers,
} from 'lucide-react';
import { NavigationService, getCategoryFallbackMenus } from '@/services/navigation';
import { PlatformService } from '@/services/platform';
import { getTenantStorefrontUrl } from '@/services/api';
import { useToast } from '@/lib/toast-context';
import type { NavigationMenu, NavigationItem } from '@/types';

export default function NavigationPage() {
  const { showToast } = useToast();
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [activeMenuId, setActiveMenuId] = useState('header-menu');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [activeTenant, setActiveTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealigning, setIsRealigning] = useState(false);

  const fetchMenus = useCallback(async (tenantSlug?: string) => {
    setIsLoading(true);
    try {
      const currentTenant = PlatformService.getActiveTenant();
      setActiveTenant(currentTenant);
      const effectiveSlug = tenantSlug || currentTenant?.slug || 'silvora';
      const list = await NavigationService.getAll(effectiveSlug);
      setMenus(list);
      if (list.length > 0 && !list.some((m) => m.id === activeMenuId || m.slug === activeMenuId)) {
        setActiveMenuId(list[0].slug || list[0].id);
      }
    } catch (err) {
      console.warn('Navigation menu load warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeMenuId]);

  useEffect(() => {
    fetchMenus();

    const handleTenantChange = () => {
      const updatedTenant = PlatformService.getActiveTenant();
      setActiveTenant(updatedTenant);
      fetchMenus(updatedTenant.slug);
    };

    window.addEventListener('tenant_updated', handleTenantChange);
    return () => {
      window.removeEventListener('tenant_updated', handleTenantChange);
    };
  }, [fetchMenus]);

  const activeMenu = menus.find((m) => m.id === activeMenuId || m.slug === activeMenuId) || menus[0];

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMenu || !newItemLabel.trim() || !newItemUrl.trim()) return;

    const currentTenant = activeTenant || PlatformService.getActiveTenant();
    const newItem: NavigationItem = {
      id: `nav_${Date.now()}`,
      label: newItemLabel.trim(),
      type: 'custom',
      url: newItemUrl.trim(),
      isVisible: true,
    };

    const updatedItems = [...(activeMenu.items || []), newItem];
    const targetCode = activeMenu.slug || activeMenu.id;
    await NavigationService.updateMenu(targetCode, updatedItems, currentTenant?.slug);
    setNewItemLabel('');
    setNewItemUrl('');
    showToast(`Added "${newItem.label}" to ${activeMenu.title}`, 'success');
    fetchMenus(currentTenant?.slug);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!activeMenu) return;
    const currentTenant = activeTenant || PlatformService.getActiveTenant();
    const updatedItems = (activeMenu.items || []).filter((i) => i.id !== itemId);
    const targetCode = activeMenu.slug || activeMenu.id;
    await NavigationService.updateMenu(targetCode, updatedItems, currentTenant?.slug);
    showToast('Menu item removed', 'info');
    fetchMenus(currentTenant?.slug);
  };

  const handleToggleItem = async (itemId: string) => {
    if (!activeMenu) return;
    const currentTenant = activeTenant || PlatformService.getActiveTenant();
    const updatedItems = (activeMenu.items || []).map((i) =>
      i.id === itemId ? { ...i, isVisible: !i.isVisible } : i
    );
    const targetCode = activeMenu.slug || activeMenu.id;
    await NavigationService.updateMenu(targetCode, updatedItems, currentTenant?.slug);
    showToast('Menu item visibility updated', 'info');
    fetchMenus(currentTenant?.slug);
  };

  const handleRealignWithCategory = async () => {
    const currentTenant = activeTenant || PlatformService.getActiveTenant();
    setIsRealigning(true);
    try {
      const categoryMenus = getCategoryFallbackMenus(
        currentTenant?.category || currentTenant?.preset,
        currentTenant?.name,
        currentTenant?.slug
      );

      for (const m of categoryMenus) {
        await NavigationService.updateMenu(m.slug, m.items, currentTenant?.slug);
      }

      showToast(`Navigation menus aligned with ${currentTenant?.name || 'store'} category!`, 'success');
      await fetchMenus(currentTenant?.slug);
    } catch (err: any) {
      showToast(err.message || 'Failed to realign menus', 'error');
    } finally {
      setIsRealigning(false);
    }
  };

  // Determine dynamic placeholders based on tenant category
  const getCategoryPlaceholders = () => {
    const cat = (activeTenant?.category || activeTenant?.preset || '').toLowerCase();
    if (cat.includes('jewel') || cat.includes('silvora') || cat.includes('gold') || cat.includes('diamond') || cat.includes('watch') || cat.includes('gem')) {
      return {
        label: 'e.g. 18K Solid Gold Pendants or Solitaire Rings',
        url: 'e.g. /collections/gold or /collections/diamonds',
        badge: '💎 Luxury Jewelry, Watches & Gems (18K Gold & Solitaires)',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      };
    }
    if (cat.includes('groc') || cat.includes('veg') || cat.includes('food') || cat.includes('organic') || cat.includes('coffee')) {
      return {
        label: 'e.g. Single-Estate Coffee Beans or Cold-Pressed Oils',
        url: 'e.g. /collections/coffee or /collections/oils',
        badge: '🌿 Gourmet Grocery & Organics (Specialty Coffee & Superfoods)',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      };
    }
    if (cat.includes('elect') || cat.includes('tech') || cat.includes('audio') || cat.includes('gadget') || cat.includes('volt')) {
      return {
        label: 'e.g. Studio Noise-Cancelling Headphones or Hi-Fi DACs',
        url: 'e.g. /collections/audio or /collections/dacs',
        badge: '⚡ Electronics, Audio & Smart Gadgets',
        badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      };
    }
    if (cat.includes('beauty') || cat.includes('skin') || cat.includes('cosmetic') || cat.includes('glow')) {
      return {
        label: 'e.g. Botanical Radiance Serums or Restorative Balms',
        url: 'e.g. /collections/serums or /collections/balms',
        badge: '💄 Clean Beauty, Cosmetics & Luxury Skincare',
        badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      };
    }
    if (cat.includes('sport') || cat.includes('active') || cat.includes('gym') || cat.includes('fit') || cat.includes('apex')) {
      return {
        label: 'e.g. Carbon-Plate Runners or Seamless Leggings',
        url: 'e.g. /collections/footwear or /collections/leggings',
        badge: '🏃 Sports, Gym & Activewear (Compressive Tights & Carbon Runners)',
        badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      };
    }
    if (cat.includes('home') || cat.includes('furn') || cat.includes('decor') || cat.includes('living') || cat.includes('aura')) {
      return {
        label: 'e.g. Modular Linen Sectionals or Fluted Ceramic Lamps',
        url: 'e.g. /collections/sofas or /collections/lighting',
        badge: '🛋️ Modern Furniture, Decor & Living',
        badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      };
    }
    if (cat.includes('shoe') || cat.includes('sneaker') || cat.includes('footwear') || cat.includes('kick')) {
      return {
        label: 'e.g. Retro High-Tops or Italian Chelsea Boots',
        url: 'e.g. /collections/high-tops or /collections/boots',
        badge: '👟 Footwear & Streetwear Sneakers (Hype High-Tops & Boots)',
        badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      };
    }
    if (cat.includes('fashion') || cat.includes('cloth') || cat.includes('apparel')) {
      return {
        label: 'e.g. Silk Banarasi Sarees or Hand-Embroidered Kurtis',
        url: 'e.g. /collections/sarees or /collections/kurtis',
        badge: '👗 Fashion & Luxury Apparel (Couture & Festive Edit)',
        badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      };
    }
    return {
      label: 'e.g. Featured Collection or Best Sellers',
      url: 'e.g. /collections or /collections/featured',
      badge: activeTenant?.categoryLabel || '🛍️ Universal Commerce Megastore',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    };
  };

  const placeholders = getCategoryPlaceholders();
  const currentTenant = activeTenant || PlatformService.getActiveTenant();

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Storefront Taxonomy
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${placeholders.badgeColor}`}>
              {placeholders.badge}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
            <span>Navigation Menus</span>
            <span className="text-sm font-normal text-slate-400">({currentTenant?.name || 'Active Store'})</span>
          </h1>

          <p className="text-xs text-slate-400 mt-0.5">
            Configure header mega-menus, category shortcuts, and footer sitemap links strictly aligned with this tenant's industry catalog.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRealignWithCategory}
            disabled={isRealigning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
            title="Synchronize all menu links with the tenant's industry category"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRealigning ? 'animate-spin' : ''}`} />
            <span>{isRealigning ? 'Re-aligning...' : 'Re-align Category'}</span>
          </button>

          <a
            href={getTenantStorefrontUrl(currentTenant?.slug)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10121A] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            <span>View Live Storefront</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Menu Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          {menus.map((m) => {
            const isSelected = (m.slug || m.id) === (activeMenu?.slug || activeMenu?.id);
            return (
              <button
                key={m.id || m.slug}
                onClick={() => setActiveMenuId(m.slug || m.id)}
                className={`w-full p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-rose-950/20 border-rose-500/60 shadow-md'
                    : 'bg-[#161822] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white text-sm">{m.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {m.items?.length || 0} links configured
                </div>
                <div className="text-[10px] text-rose-400 font-mono mt-1">
                  code: {m.slug || m.id}
                </div>
              </button>
            );
          })}
        </div>

        {/* Menu Editor (8 cols) */}
        <div className="lg:col-span-8 bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">{activeMenu?.title}</h3>
              <p className="text-[11px] text-slate-400">
                Manage links and URLs displayed in this menu. Changes reflect live on the storefront.
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
              slug: {activeMenu?.slug || activeMenu?.id}
            </span>
          </div>

          {/* Current Items List */}
          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                <span>Loading category taxonomy...</span>
              </div>
            ) : activeMenu?.items && activeMenu.items.length > 0 ? (
              activeMenu.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#10121A] flex items-center justify-between gap-3 hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-slate-500 w-4 shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate flex items-center gap-2">
                        <span>{item.label}</span>
                        {!item.isVisible && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{item.url}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className={`p-1.5 rounded transition-colors ${
                        item.isVisible
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-slate-500 hover:bg-slate-800'
                      }`}
                      title={item.isVisible ? 'Visible on storefront' : 'Hidden from storefront'}
                    >
                      {item.isVisible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Remove link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">
                No items in this menu. Add your first link below.
              </div>
            )}
          </div>

          {/* Add New Link Box */}
          <form
            onSubmit={handleAddItem}
            className="p-4 bg-[#10121A] rounded-xl border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>Add Link to {activeMenu?.title}</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Industry: {placeholders.badge.split('(')[0]}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Display Label *</label>
                <input
                  type="text"
                  required
                  placeholder={placeholders.label}
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target URL *</label>
                <input
                  type="text"
                  required
                  placeholder={placeholders.url}
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px] placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Link</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
