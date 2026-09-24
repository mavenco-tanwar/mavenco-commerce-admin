import { useConfirm } from '@/lib/modal-context';
'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Mail, Shield } from 'lucide-react';
import { UserService } from '@/services/users';
import { PlatformService, TenantPlan } from '@/services/platform';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import type { AdminUser, Role } from '@/types';

export default function UsersPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activePlan, setActivePlan] = useState<TenantPlan | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite Form
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleId, setRoleId] = useState('role_manager');

  const fetchData = async () => {
    const [u, r, plans] = await Promise.all([
      UserService.getUsers(),
      UserService.getRoles(),
      Promise.resolve(PlatformService.listPlans()),
    ]);
    const currentTenant = PlatformService.getActiveTenant();
    const plan = plans.find((p) => p.id === currentTenant.planId) || plans[0];
    setUsers(u);
    setRoles(r);
    setActivePlan(plan);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activePlan && users.length >= activePlan.maxStaff) {
      showToast(`Staff limit reached (${users.length}/${activePlan.maxStaff} users). Upgrade plan to invite more staff members.`, 'error');
      return;
    }
    await UserService.inviteUser(email, firstName, lastName, roleId);
    showToast(`Invitation sent to ${email}`, 'success');
    setIsInviteOpen(false);
    setEmail('');
    setFirstName('');
    setLastName('');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Revoke Admin Access',
      message: 'Are you sure you want to revoke access for this admin user? They will immediately lose access to this dashboard.',
      confirmLabel: 'Revoke Access',
      isDestructive: true,
      type: 'danger',
    });
    if (!ok) return;
    await UserService.deleteUser(id);
    showToast('Admin user removed', 'info');
    fetchData();
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Access Control
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Staff &amp; Admin Users</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage administrative members, permissions, and security roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activePlan && (
            <div className="px-3.5 py-1.5 bg-[#10121A] border border-slate-800 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-slate-400">Staff Quota:</span>
              <span className="font-bold text-white font-mono">
                {users.length} / {activePlan.maxStaff}
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/20">
                {activePlan.name}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              if (activePlan && users.length >= activePlan.maxStaff) {
                showToast(`Staff account limit reached (${users.length}/${activePlan.maxStaff}). Please upgrade plan.`, 'error');
                return;
              }
              setIsInviteOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Invite Staff Member</span>
          </button>
        </div>
      </div>

      <div className="bg-[#161822] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800/60 text-xs">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-600/20 text-rose-300 font-bold flex items-center justify-center text-xs">
                  {u.firstName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {u.firstName} {u.lastName}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-rose-500/20 text-rose-300">
                      {u.roleName}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{u.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    u.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {u.status}
                </span>
                {u.roleId !== 'role_owner' && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INVITE MODAL */}
      {isInviteOpen && (
        <Modal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          title="Invite New Staff Member"
          maxWidth="md"
        >
          <form onSubmit={handleInvite} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="colleague@jqtrends.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Security Role</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              >
                {roles
                  .filter((r) => r.id !== 'role_owner')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md"
              >
                Send Invite
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
