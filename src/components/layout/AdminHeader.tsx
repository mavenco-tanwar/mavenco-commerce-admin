'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ExternalLink,
  Plus,
  Package,
  Layers,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Store,
  ChevronDown,
  Shield,
  EyeOff,
  Globe,
  Database,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { GlobalSearchModal } from './GlobalSearchModal';
import { PlatformService, TenantStore } from '@/services/platform';
import { getTenantStorefrontUrl } from '@/services/api';

export function AdminHeader({
  onOpenMobileSidebar,
}: {
  onOpenMobileSidebar: () => void;
}) {
  const pathname = usePathname();
  const isSuperadminRoute = pathname === '/platform' || pathname.startsWith('/platform');

  const { user } = useAuth();
  const isSuperadminUser =
    (user as any)?.role === 'superadmin' ||
    user?.roleId === 'role_superadmin' ||
    (user?.email ? user.email.toLowerCase().includes('superadmin') || user.email.toLowerCase() === 'admin@mavenco.com' : false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);

  // Auto-purge stale lumina session if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeId = localStorage.getItem('jq_saas_active_tenant_id');
      if (activeId === 'store_lumina' || activeId === 'lumina') {
        localStorage.setItem('jq_saas_active_tenant_id', 'store_jq-trends');
        setActiveTenant(PlatformService.getActiveTenant());
      }
    }
  }, []);

  // Dropdown click-outside refs
  const quickCreateRef = useRef<HTMLDivElement>(null);
  const storeSwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickCreateRef.current && !quickCreateRef.current.contains(event.target as Node)) {
        setIsQuickCreateOpen(false);
      }
      if (storeSwitcherRef.current && !storeSwitcherRef.current.contains(event.target as Node)) {
        setIsStoreSwitcherOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsQuickCreateOpen(false);
        setIsStoreSwitcherOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Multi-Tenant Context
  const [tenants, setTenants] = useState<TenantStore[]>([]);
  const [activeTenant, setActiveTenant] = useState<TenantStore>(PlatformService.getDefaultTenant());
  const [impersonationState, setImpersonationState] = useState(PlatformService.getImpersonationState());

  useEffect(() => {
    PlatformService.listTenants().then((list) => {
      setTenants(list);
      const current = PlatformService.getActiveTenant();
      setActiveTenant(current);
      setImpersonationState(PlatformService.getImpersonationState());

      if (typeof document !== 'undefined') {
        if (isSuperadminRoute) {
          document.title = 'Superadmin Control Plane | Mavenco Commerce';
        } else {
          document.title = `${current.name} Admin | Mavenco Commerce`;
        }
      }
    });
  }, [pathname, isSuperadminRoute]);

  const handleSelectStore = (store: TenantStore) => {
    PlatformService.setActiveTenantId(store.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jq_saas_active_tenant_slug', store.slug);
      localStorage.setItem('jq_saas_active_tenant_id', store.id);
      document.cookie = `jq_saas_active_tenant_slug=${store.slug}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent('tenant_updated', { detail: store }));
    }
    setActiveTenant(store);
    setIsStoreSwitcherOpen(false);
    window.location.href = `/products?tenant=${store.slug}`;
  };

  const handleExitImpersonation = () => {
    PlatformService.stopImpersonation();
    setImpersonationState({ isImpersonating: false });
    window.location.href = '/platform';
  };

  const [broadcast, setBroadcast] = useState<{ id: string; message: string; type: 'info' | 'warning' } | null>(null);
  const [isBroadcastDismissed, setIsBroadcastDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncBroadcast = async () => {
      try {
        const activeBcast = await PlatformService.getPlatformBroadcast();
        if (isMounted && activeBcast && activeBcast.message) {
          const dismissedRaw = typeof window !== 'undefined' ? localStorage.getItem('jq_dismissed_broadcasts') : null;
          const dismissedList: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
          if (!dismissedList.includes(activeBcast.id)) {
            setBroadcast({
              id: activeBcast.id,
              message: activeBcast.message,
              type: activeBcast.type || 'info',
            });
            setIsBroadcastDismissed(false);
          } else {
            setIsBroadcastDismissed(true);
          }
        }
      } catch (err) {
        console.warn('Broadcast sync notice:', err);
      }
    };

    syncBroadcast();

    const handleBroadcastUpdated = (e: any) => {
      const newBcast = e.detail;
      if (newBcast && newBcast.message) {
        setBroadcast({
          id: newBcast.id,
          message: newBcast.message,
          type: newBcast.type || 'info',
        });
        setIsBroadcastDismissed(false);
      }
    };

    const handleBroadcastDismissed = (e: any) => {
      if (broadcast && broadcast.id === e.detail?.id) {
        setIsBroadcastDismissed(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('platform_broadcast_updated', handleBroadcastUpdated);
      window.addEventListener('platform_broadcast_dismissed', handleBroadcastDismissed);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('platform_broadcast_updated', handleBroadcastUpdated);
        window.removeEventListener('platform_broadcast_dismissed', handleBroadcastDismissed);
      }
    };
  }, []);

  const handleDismissBanner = () => {
    if (broadcast) {
      PlatformService.dismissPlatformBroadcast(broadcast.id);
      setIsBroadcastDismissed(true);
    }
  };

  return (
    <>
      {/* Global Superadmin Broadcast Banner */}
      {broadcast && !isBroadcastDismissed && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[#161822] to-amber-500/15 border-b border-amber-500/30 text-amber-200 px-3 sm:px-4 py-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-30 sticky top-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">{broadcast.message}</span>
          </div>

          <button
            onClick={handleDismissBanner}
            className="text-amber-400 hover:text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded hover:bg-amber-500/20 transition-all shrink-0"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* Superadmin Impersonation Banner */}
      {impersonationState.isImpersonating && !isSuperadminRoute && (
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-3 sm:px-4 py-2 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-md z-30 sticky top-0">
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs truncate">
              👑 Viewing <span className="underline">{activeTenant.name}</span> in Impersonation Mode <span className="hidden sm:inline">(Audit Active)</span>
            </span>
          </div>

          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 hover:bg-black/60 rounded-md text-[10px] sm:text-[11px] font-bold text-white transition-all shrink-0"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Exit Mode</span>
          </button>
        </div>
      )}

      <header className="sticky top-0 z-20 bg-[#12141D]/90 backdrop-blur-md border-b border-slate-800/90 h-16 flex items-center justify-between px-3 sm:px-6 select-none">
        {/* Left: Mobile Hamburger, Store Switcher (superadmin only) & Lengthy Search */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl mr-4">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {isSuperadminRoute ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#161822] border border-rose-500/30 rounded-xl text-xs shadow-sm shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-bold text-white text-[11px] sm:text-xs">
                <span className="hidden sm:inline">Global Platform </span>Control Plane
              </span>
              <span className="hidden md:inline text-slate-500">•</span>
              <span className="hidden md:inline text-rose-400 font-mono font-bold">{tenants.length} Partitions</span>
            </div>
          ) : isSuperadminUser ? (
            /* Store Switcher Dropdown (Superadmin only) */
            <div ref={storeSwitcherRef} className="relative shrink-0">
              <button
                onClick={() => setIsStoreSwitcherOpen(!isStoreSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#161822] hover:bg-[#1C1F2C] border border-slate-700/80 rounded-lg text-xs font-bold text-white transition-all shadow-sm"
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center text-[10px] text-white shrink-0 font-bold"
                  style={{ backgroundColor: activeTenant.theme?.primaryColor || '#111111' }}
                >
                  {activeTenant.code || activeTenant.name.substring(0, 1)}
                </div>
                <span className="max-w-[120px] sm:max-w-[160px] truncate">{activeTenant.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isStoreSwitcherOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[#161822] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40 text-xs animate-in fade-in">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Active Store
                  </div>

                  <div className="py-1 space-y-0.5 max-h-56 overflow-y-auto">
                    {tenants.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => handleSelectStore(store)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTenant.id === store.id
                            ? 'bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-white font-bold shrink-0"
                            style={{ backgroundColor: store.theme?.primaryColor || '#111111' }}
                          >
                            {store.code || store.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold">{store.name}</div>
                            <div className="text-[10px] text-slate-500">{store.planName}</div>
                          </div>
                        </div>

                        {activeTenant.id === store.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-slate-800">
                    <Link
                      href="/platform"
                      onClick={() => setIsStoreSwitcherOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Provision New Store</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {!isSuperadminRoute && (
            <>
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="sm:hidden p-2 bg-[#161822] hover:bg-[#1C1F2C] border border-slate-700/80 rounded-lg text-slate-400 hover:text-slate-200 shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 bg-[#161822] hover:bg-[#1C1F2C] border border-slate-700/80 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all w-full max-w-lg lg:max-w-xl shadow-inner"
              >
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Search catalog, orders, customers...</span>
                <kbd className="hidden lg:inline-block ml-auto text-[10px] font-mono bg-slate-800/90 px-2 py-0.5 rounded text-slate-400 border border-slate-700 shrink-0">
                  ⌘K
                </kbd>
              </button>
            </>
          )}
        </div>

        {/* Right: Actions, Storefront Preview & Shortcuts */}
        <div className="flex items-center gap-2.5">
          {isSuperadminRoute ? (
            <a
              href="https://mavenco-storefront.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Platform Showcase</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          ) : (
            <>
              {/* Storefront Link */}
              {(() => {
                const userSlug = ((user as any)?.tenantSlug || (user as any)?.storeSlug);
                const loggedInStoreSlug =
                  (!isSuperadminUser && userSlug && userSlug !== 'all' && userSlug !== 'lumina')
                    ? (userSlug as string).toLowerCase().trim()
                    : (activeTenant?.slug && activeTenant.slug !== 'lumina' ? activeTenant.slug : 'jq-trends');
                const viewStoreUrl = getTenantStorefrontUrl(loggedInStoreSlug);

                return (
                  <a
                    href={viewStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161822] hover:bg-[#1C1F2C] border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                    title={`Open Live Storefront (${loggedInStoreSlug})`}
                  >
                    <Store className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">View Store</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                );
              })()}

              {/* Quick Create Dropdown */}
              <div ref={quickCreateRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md shadow-rose-950/40 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Create</span>
                </button>

                {isQuickCreateOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#161822] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40 text-xs animate-in fade-in">
                    <Link
                      href="/products/new"
                      onClick={() => setIsQuickCreateOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <Package className="w-3.5 h-3.5 text-rose-400" />
                      <span>Add Product</span>
                    </Link>
                    <Link
                      href="/collections"
                      onClick={() => setIsQuickCreateOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      <span>Create Collection</span>
                    </Link>
                    <Link
                      href="/discounts"
                      onClick={() => setIsQuickCreateOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <Percent className="w-3.5 h-3.5 text-rose-400" />
                      <span>New Discount</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Global Cmd+K Search Modal */}
      {isSearchOpen && <GlobalSearchModal onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
