'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, Store, Mail, Phone, MapPin, IndianRupee, Lock, Key, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { SettingsService } from '@/services/settings';
import { useToast } from '@/lib/toast-context';
import type { StoreSettings } from '@/types';

export default function GeneralSettingsPage() {
  const { showToast } = useToast();
  const [storeName, setStoreName] = useState('JQ Trends');
  const [tagline, setTagline] = useState('Affordable Luxury Fashion for Women and Kids');
  const [contactEmail, setContactEmail] = useState('contact@jqtrends.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038, India');
  const [currency, setCurrency] = useState('INR');

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      SettingsService.getStoreSettings().then((s) => {
        setStoreName(s.storeName);
        setTagline(s.tagline);
        setContactEmail(s.contactEmail);
        setPhone(s.phone);
        setAddress(s.address);
        setCurrency(s.currency);
      });
    };

    loadSettings();

    window.addEventListener("tenant_updated", loadSettings);
    return () => window.removeEventListener("tenant_updated", loadSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await SettingsService.updateStoreSettings({
      storeName,
      tagline,
      contactEmail,
      phone,
      address,
      currency,
    });
    showToast('Store settings saved', 'success');
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      let userEmail = contactEmail;
      let currentSlug = '';

      if (typeof window !== 'undefined') {
        try {
          const rawUser = localStorage.getItem('jq_admin_user');
          if (rawUser) {
            const parsed = JSON.parse(rawUser);
            if (parsed.email) userEmail = parsed.email;
            if (parsed.tenantSlug) currentSlug = parsed.tenantSlug;
          }
          const rawActiveTenant = localStorage.getItem('jq_saas_active_tenant_id');
          if (rawActiveTenant && !currentSlug) {
            currentSlug = rawActiveTenant.replace('store_', '');
          }
        } catch {}
      }

      const res = await fetch('/api/v1/platform/merchant-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          slug: currentSlug,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Password updated in database! Signing out...', 'success');
        setNewPassword('');
        setConfirmPassword('');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jq_admin_token');
          localStorage.removeItem('jq_admin_user');
          localStorage.removeItem('jq_saas_impersonation_state');
          setTimeout(() => {
            window.location.href = `/login?email=${encodeURIComponent(userEmail)}&updated=true`;
          }, 800);
        }
      } else {
        showToast(data.error || 'Failed to update password', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Store Profile
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">General Store Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your boutique identity, contact details, and base currency.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-rose-400" />
            <span>Storefront Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Store Contact Email *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Customer Support Hotline</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>HQ Physical Dispatch Studio</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Studio Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Security & Password Reset Section */}
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Merchant Security &amp; Password</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Change your temporary password to a permanent one
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">New Permanent Password *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 pr-9 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 pr-9 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={isUpdatingPassword || !newPassword}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-rose-400" />
              <span>{isUpdatingPassword ? 'Updating Password...' : 'Update & Save Permanent Password'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
