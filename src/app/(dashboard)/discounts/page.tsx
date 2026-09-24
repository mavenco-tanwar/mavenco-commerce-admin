import { useConfirm } from '@/lib/modal-context';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Percent,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Tag,
  Search,
  Sliders,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Play,
  RotateCcw,
  Check,
  X,
  Eye,
  Gift,
  DollarSign,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  Promotion,
  PromotionSimulationResult,
} from '@/types/promotions-commerce.types';

export default function PromotionsPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'promotions' | 'builder' | 'simulator' | 'ledger'>('promotions');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Builder Form State
  const [newPromo, setNewPromo] = useState({
    name: 'Summer Silk 15% Off',
    internalName: 'Q3 Silk Campaign',
    description: '15% off on fine silk garments above $1000',
    promotionType: 'percentage_discount' as any,
    triggerType: 'coupon_code' as any,
    code: 'SILK15',
    discountValue: 15,
    maxDiscountAmount: 3000,
    minOrderValue: 1000,
    customerEligibility: 'all' as any,
    usageLimit: 500,
  });

  // Simulator State
  const [simCode, setSimCode] = useState('FESTIVE20');
  const [simSubtotal, setSimSubtotal] = useState('2000');
  const [simCustomerType, setSimCustomerType] = useState<'all' | 'new_customers' | 'vip_only'>('all');
  const [simResult, setSimResult] = useState<PromotionSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.get<any>(`/api/v1/promotions?tenant=${tenantSlug}`);
      if (res.data && res.data.length > 0) {
        setPromotions(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [tenantSlug]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Copied coupon code ${code} to clipboard!`, 'info');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await ApiClient.patch(`/api/v1/promotions/${id}`, { status: nextStatus });
      showToast(`Promotion status changed to ${nextStatus.toUpperCase()}`, 'info');
      fetchPromotions();
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Archive Promotion',
      message: 'Are you sure you want to archive this promotion? It will no longer be applied at checkout.',
      confirmLabel: 'Archive Promotion',
      isDestructive: true,
      type: 'warning',
    });
    if (!ok) return;
    try {
      await ApiClient.delete(`/api/v1/promotions/${id}`);
      showToast('Promotion archived', 'info');
      fetchPromotions();
    } catch {
      showToast('Failed to archive promotion', 'error');
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/promotions', {
        tenantId: tenantSlug,
        name: newPromo.name,
        internalName: newPromo.internalName,
        description: newPromo.description,
        promotionType: newPromo.promotionType,
        triggerType: newPromo.triggerType,
        priority: 10,
        isStackable: true,
        isExclusive: false,
        startsAt: new Date().toISOString(),
        conditions: {
          minOrderValue: Number(newPromo.minOrderValue),
          customerEligibility: newPromo.customerEligibility,
        },
        actions: {
          discountType: newPromo.promotionType === 'percentage_discount' ? 'percentage' : 'fixed_amount',
          discountValue: Number(newPromo.discountValue),
          maxDiscountAmount: Number(newPromo.maxDiscountAmount),
        },
        coupon: {
          code: newPromo.code.toUpperCase(),
          usageLimit: Number(newPromo.usageLimit),
          usageCount: 0,
          perCustomerLimit: 1,
        },
      });

      showToast(`Promotion "${newPromo.name}" published successfully!`, 'success');
      setActiveTab('promotions');
      fetchPromotions();
    } catch {
      showToast('Failed to create promotion', 'error');
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const res = await ApiClient.post<any>('/api/v1/promotions/preview', {
        tenant: tenantSlug,
        code: simCode,
        subtotal: Number(simSubtotal),
        customerType: simCustomerType,
      });
      if (res.data) {
        setSimResult(res.data);
      }
    } catch {
      showToast('Simulation failed', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Metrics
  const totalPromos = promotions.length;
  const activeCount = promotions.filter((p) => p.status === 'active').length;
  const totalRedemptions = promotions.reduce((sum, p) => sum + (p.analytics?.totalRedemptions || p.coupon?.usageCount || 0), 0);
  const totalDiscountGiven = promotions.reduce((sum, p) => sum + (p.analytics?.totalDiscountGiven || 0), 0);
  const attributedRevenue = promotions.reduce((sum, p) => sum + (p.analytics?.attributedRevenue || 0), 0);

  const filteredPromotions = promotions.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.coupon?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Revenue &amp; Conversion Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Percent className="w-6 h-6 text-rose-400" />
            Coupons, Discounts &amp; Promotions
          </h1>
          <p className="text-xs text-slate-400">
            Design multi-tier campaigns, BOGO vouchers, volume cart discounts, and simulate real-time qualification traces.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Promotion Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Campaigns</span>
          <span className="text-xl font-mono font-black text-white">{totalPromos}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Promotions</span>
          <span className="text-xl font-mono font-black text-emerald-400">{activeCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Redemptions</span>
          <span className="text-xl font-mono font-black text-white">{totalRedemptions}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Savings Issued</span>
          <span className="text-xl font-mono font-black text-rose-400">${totalDiscountGiven.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Attributed Revenue</span>
          <span className="text-xl font-mono font-black text-emerald-400">${attributedRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'promotions'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Active Promotions ({promotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'builder'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Rule Builder Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Promotion Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Redemption Audit Log</span>
        </button>
      </div>

      {/* TAB 1: ALL ACTIVE PROMOTIONS MATRIX */}
      {activeTab === 'promotions' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Promotion Name or Coupon Code..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`promo-skel-${i}`}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-24 bg-slate-800 rounded-lg" />
                    <div className="h-4 w-16 bg-slate-800 rounded" />
                  </div>
                  <div className="h-5 w-40 bg-slate-800 rounded" />
                  <div className="h-3 w-52 bg-slate-800/60 rounded" />
                  <div className="pt-3 border-t border-slate-800 flex justify-between">
                    <div className="h-3 w-20 bg-slate-800/40 rounded" />
                    <div className="h-3 w-16 bg-slate-800/40 rounded" />
                  </div>
                </div>
              ))
            ) : filteredPromotions.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {p.coupon?.code ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {p.coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(p.coupon!.code)}
                          className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedCode === p.coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        ⚡ Automatic Discount
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        p.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Benefit:</span>
                      <strong className="text-emerald-400">
                        {p.actions?.discountType === 'percentage'
                          ? `${p.actions.discountValue}% OFF`
                          : `$${p.actions?.discountValue} FLAT OFF`}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Min Spend:</span>
                      <span>${p.conditions?.minOrderValue || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Redemptions:</span>
                      <span className="font-mono font-bold text-white">
                        {p.coupon?.usageCount || 0} / {p.coupon?.usageLimit || '∞'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(p.id, p.status)}
                    className="text-xs font-bold text-slate-300 hover:text-white"
                  >
                    {p.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                    title="Archive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROMOTION RULE BUILDER STUDIO */}
      {activeTab === 'builder' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6 max-w-4xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Promotion &amp; Coupon Rule Studio</h3>
              <p className="text-xs text-slate-400">Create smart targeted discount logic for your boutique storefront.</p>
            </div>
          </div>

          <form onSubmit={handleCreatePromotion} className="space-y-6 text-xs">
            {/* Step 1: Basic Info */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-400">1. Campaign Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Promotion Name</label>
                  <input
                    type="text"
                    value={newPromo.name}
                    onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Coupon Voucher Code</label>
                  <input
                    type="text"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Customer Description</label>
                <input
                  type="text"
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>
            </div>

            {/* Step 2: Discount Action */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-400">2. Discount Benefit</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Discount Type</label>
                  <select
                    value={newPromo.promotionType}
                    onChange={(e) => setNewPromo({ ...newPromo, promotionType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="percentage_discount">Percentage Discount (%)</option>
                    <option value="fixed_amount_discount">Fixed Amount Off ($)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    min={1}
                    value={newPromo.discountValue}
                    onChange={(e) => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Max Cap Amount ($)</label>
                  <input
                    type="number"
                    value={newPromo.maxDiscountAmount}
                    onChange={(e) => setNewPromo({ ...newPromo, maxDiscountAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Conditions */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-400">3. Qualification Rules</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Min Spend Threshold ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPromo.minOrderValue}
                    onChange={(e) => setNewPromo({ ...newPromo, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Customer Eligibility</label>
                  <select
                    value={newPromo.customerEligibility}
                    onChange={(e) => setNewPromo({ ...newPromo, customerEligibility: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="all">All Customers</option>
                    <option value="new_customers">New First-Time Customers Only</option>
                    <option value="vip_only">VIP Tier Members Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={newPromo.usageLimit}
                    onChange={(e) => setNewPromo({ ...newPromo, usageLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('promotions')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Publish Campaign
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: REAL-TIME PROMOTION SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <Play className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Test Scenario Input</h3>
            </div>

            <form onSubmit={handleRunSimulation} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Voucher Code</label>
                <input
                  type="text"
                  value={simCode}
                  onChange={(e) => setSimCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE20, WELCOME10"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Simulated Cart Subtotal ($)</label>
                <input
                  type="number"
                  min={1}
                  value={simSubtotal}
                  onChange={(e) => setSimSubtotal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Simulated Customer Segment</label>
                <select
                  value={simCustomerType}
                  onChange={(e) => setSimCustomerType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="all">Standard Member / Guest</option>
                  <option value="new_customers">First-Time Buyer</option>
                  <option value="vip_only">VIP Gold Member</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors disabled:opacity-50"
              >
                {isSimulating ? 'Evaluating Rules...' : 'Execute Simulator Trace'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Evaluation Audit Result</h3>
              </div>
              {simResult && (
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    simResult.isEligible
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {simResult.isEligible ? 'QUALIFIED' : 'DISQUALIFIED'}
                </span>
              )}
            </div>

            {simResult ? (
              <div className="space-y-4 text-xs">
                <div
                  className={`p-4 rounded-xl border ${
                    simResult.isEligible
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <strong className="block font-bold mb-0.5">{simResult.message}</strong>
                  {simResult.isEligible && (
                    <div className="mt-2 pt-2 border-t border-emerald-500/20 grid grid-cols-3 gap-2 font-mono text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Subtotal</span>
                        <strong>${simResult.originalSubtotal.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Discount</span>
                        <strong className="text-emerald-400">-${simResult.discountAmount.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Payable Total</span>
                        <strong className="text-white">${simResult.finalSubtotal.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rule Audit Breakdown:</h4>
                  <div className="space-y-2">
                    {simResult.auditTrace?.map((tr, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5"
                      >
                        {tr.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="block text-white text-xs">{tr.rule}</strong>
                          <span className="text-slate-400 text-[11px]">{tr.details}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Click &quot;Execute Simulator Trace&quot; to test conditions against your active database promotions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REDEMPTION AUDIT LOG */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Coupon Redemption Audit Ledger</h3>
              <p className="text-xs text-slate-400">Immutable record of every checkout coupon consumption.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Coupon</th>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5 text-center">Discount Applied</th>
                  <th className="p-3.5 text-right">Order GMV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">Sep 4, 2026, 05:30 PM</td>
                  <td className="p-3.5 font-mono font-bold text-rose-300">FESTIVE20</td>
                  <td className="p-3.5 font-mono text-slate-300">LUM-100234</td>
                  <td className="p-3.5 text-slate-300">Aanya Kapoor</td>
                  <td className="p-3.5 text-center font-mono font-bold text-emerald-400">-$300</td>
                  <td className="p-3.5 text-right font-mono font-bold text-white">$1,499</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">Sep 3, 2026, 05:30 PM</td>
                  <td className="p-3.5 font-mono font-bold text-rose-300">WELCOME10</td>
                  <td className="p-3.5 font-mono text-slate-300">LUM-100289</td>
                  <td className="p-3.5 text-slate-300">Rohan Mehra</td>
                  <td className="p-3.5 text-center font-mono font-bold text-emerald-400">-$100</td>
                  <td className="p-3.5 text-right font-mono font-bold text-white">$1,799</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
