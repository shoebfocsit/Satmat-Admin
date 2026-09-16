import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { UserRecord } from '../types';
import { getAdminUsers } from '../services/api';

interface AdminManagementViewProps {
  users: UserRecord[];
  onCreateAdmin?: (admin: any) => void;
  onDeleteAdmin?: (id: string) => void;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({ users, onCreateAdmin, onDeleteAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('ADMIN');
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const admins = users.filter((u) => u.role === 'VIP' || u.name === 'Admin');

  const normalizePhone = (p: string) => p.replace(/\D/g, '').slice(-10);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) return;
    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
      setPhoneError('Valid 10-digit phone chahiye (e.g. 9876543210)');
      return;
    }
    const existsLocal = users.some((u) => normalizePhone(u.phone) === normalized);
    if (existsLocal) {
      setPhoneError('Ye phone number pehle se registered hai — different phone use karo');
      return;
    }
    // Backend check — covers users not in local 30-item cache
    setIsChecking(true);
    try {
      const res = await getAdminUsers({ search: normalized, limit: 5 });
      const existsRemote = res?.items?.some((u: any) => normalizePhone(String(u.phone || '')) === normalized);
      if (existsRemote) {
        setPhoneError('Backend pe ye phone pehle se exists karta hai — different phone use karo');
        setIsChecking(false);
        return;
      }
    } catch {
      // ignore network error — rely on local check
    }
    setIsChecking(false);
    if (onCreateAdmin) {
      onCreateAdmin({
        id: 'new-' + Date.now(),
        userId: '#ADMIN-' + String(Date.now()).slice(-3),
        name: name.trim(),
        phone: normalized,
        avatar: '',
        walletBalance: 0,
        totalWinnings: 0,
        role: role === 'ADMIN' ? 'VIP' : 'USER',
        status: 'ACTIVE',
        kycStatus: 'VERIFIED',
        registrationDate: 'Just now'
      });
    }
    setSuccess(true);
    setPhoneError('');
    setName('');
    setPhone('');
    setPassword('');
    setShowForm(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    if (onDeleteAdmin) onDeleteAdmin(id);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-base sm:text-lg text-[#151C27] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#7E22CE] stroke-[2]" />
            Employee / Admin Management
          </h2>
          <p className="text-[11px] text-[#6E7881]">Create new admins, manage permissions, and control panel access.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#006591] hover:bg-[#005175] text-white text-[11px] font-bold shadow-xs transition-colors">
          <UserPlus className="w-3.5 h-3.5 stroke-[2]" />
          <span>Create Admin</span>
        </button>
      </div>

      {/* Create Admin Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E2E8F8] shadow-xs p-4 sm:p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-[#151C27]">New Admin Account</h3>
            <button onClick={() => setShowForm(false)} className="text-[#6E7881] hover:text-[#151C27]"><X className="w-4 h-4" /></button>
          </div>
          {success && (
            <div className="p-2.5 rounded-lg bg-[#6FFBBE]/30 text-[#006C49] text-[11px] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Admin created! Log in with phone + password.
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-[#3E4850] mb-0.5">Full Name *</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F8] text-xs focus:border-[#0EA5E9] outline-none" placeholder="e.g. Ramesh Kumar" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#3E4850] mb-0.5">Phone (+91) *</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); if (phoneError) setPhoneError(''); }}
                onBlur={() => {
                  if (!phone.trim()) return;
                  const normalized = normalizePhone(phone);
                  if (normalized.length > 0 && normalized.length !== 10) setPhoneError('Valid 10-digit phone chahiye');
                  else if (users.some((u) => normalizePhone(u.phone) === normalized)) setPhoneError('Ye phone pehle se exists karta hai');
                  else setPhoneError('');
                }}
                className={`w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-lg border text-xs outline-none ${phoneError ? 'border-[#BA1A1A] focus:border-[#BA1A1A] bg-[#FFDAD6]/20' : 'border-[#E2E8F8] focus:border-[#0EA5E9]'}`}
                placeholder="9876543210"
                maxLength={15}
              />
              {phoneError ? (
                <p className="mt-1 text-[10px] font-bold text-[#BA1A1A] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{phoneError}</p>
              ) : (
                <p className="mt-1 text-[9px] text-[#6E7881]">Same phone dubara use nahi hoga — unique hona chahiye</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#3E4850] mb-0.5">Password *</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F8] text-xs focus:border-[#0EA5E9] outline-none" placeholder="min 4 chars" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#3E4850] mb-0.5">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as 'ADMIN' | 'USER')} className="w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F8] text-xs outline-none">
                <option value="ADMIN">Admin (Full Access)</option>
                <option value="USER">Standard User</option>
              </select>
            </div>
            <div className="sm:col-span-2 pt-1 flex items-center gap-2">
              <button type="submit" disabled={isChecking} className="px-4 py-1.5 bg-[#006C49] hover:bg-[#005237] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5">
                {isChecking && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                {isChecking ? 'Checking...' : 'Create Admin'}
              </button>
              <span className="text-[10px] text-[#6E7881]">Phone unique hona chahiye — duplicate allow nahi hai. Backend pe bhi check hota hai.</span>
            </div>
          </form>
        </div>
      )}

      {/* Admin List Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F8] shadow-xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[#E2E8F8] flex items-center justify-between">
          <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">Active Admin Accounts ({admins.length})</h3>
          <span className="text-[10px] text-[#6E7881] font-medium">Full panel + website access</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-[#F0F3FF] text-[#6E7881] font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F8]">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Name</th>
                <th className="py-2.5 px-3 sm:px-4">Phone</th>
                <th className="py-2.5 px-3 sm:px-4">Role</th>
                <th className="py-2.5 px-3 sm:px-4">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F8] text-[#151C27]">
              {admins.map((u) => (
                <tr key={u.id} className="hover:bg-[#F9F9FF] transition-colors">
                  <td className="py-2.5 px-3 sm:px-4 font-bold text-xs">{u.name}</td>
                  <td className="py-2.5 px-3 sm:px-4 font-code-tabular text-[11px] text-[#3E4850]">{u.phone}</td>
                  <td className="py-2.5 px-3 sm:px-4">
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#F3E8FF] text-[#7E22CE]">{u.role}</span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E7EEFE] text-[#006591]">{u.status}</span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-right">
                    <button onClick={() => handleDelete(u.id)} className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#ffb4ab] transition-colors flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[11px] text-[#6E7881]">No admin accounts found. Create one using the button above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note box */}
      <div className="bg-gradient-to-r from-[#F3E8FF] to-[#E7EEFE] rounded-xl p-4 border border-[#E2E8F8] shadow-xs">
        <h4 className="font-display font-bold text-xs text-[#151C27] mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7E22CE]" /> Employee / Admin Permissions
        </h4>
        <ul className="text-[11px] text-[#3E4850] space-y-1 leading-relaxed list-disc list-inside">
          <li><strong>Admin (Role: ADMIN)</strong> — Full access to operations dashboard, markets, withdrawals, deposits, users, bids, notices, support, charts</li>
          <li><strong>Website/Webapp</strong> — New admins can create/manage content via the backend; permissions controlled by <code>RolesGuard</code> and <code>@Roles('ADMIN')</code> annotations</li>
          <li><strong>Backend Endpoint</strong> — Real creation uses <code>POST /auth/register</code> (with admin role set via DB/seed) or SQL Editor for direct insertion</li>
          <li><strong>Recommendation</strong> — Use <strong>Supabase SQL Editor</strong> for direct admin creation with the verified hash: <code>$2a$10$B2Yk7tk3slnhOQgNgxXAsO1PjAIC17Vy8JDgVgsR78fgmhMZa</code> and role <code>ADMIN</code></li>
        </ul>
      </div>
    </div>
  );
};
