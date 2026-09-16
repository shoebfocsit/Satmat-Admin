import React, { useState } from 'react';
import { UserRecord } from '../types';

interface UsersViewProps {
  users: UserRecord[];
  onUpdateUser: (user: UserRecord) => void;
  onAdjustBalance: (userId: string, delta: number, note: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onUpdateUser,
  onAdjustBalance
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');
  const [kycFilter, setKycFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'VIP' | 'USER'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected player for profile drawer/modal
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustNote, setAdjustNote] = useState<string>('Bonus promotional credit');

  const filteredUsers = users.filter((u) => {
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (kycFilter !== 'ALL' && u.kycStatus !== kycFilter) return false;
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = u.name.toLowerCase().includes(q);
      const matchesId = u.userId.toLowerCase().includes(q);
      const matchesPhone = u.phone.toLowerCase().includes(q);
      if (!matchesName && !matchesId && !matchesPhone) return false;
    }
    return true;
  });

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const bannedCount = users.filter((u) => u.status === 'BANNED').length;
  const totalWallet = users.reduce((acc, curr) => acc + curr.walletBalance, 0);

  const handleCopyId = (userId: string) => {
    navigator.clipboard.writeText(userId);
  };

  const handleApplyBalance = () => {
    if (!selectedUser || !adjustAmount) return;
    const num = parseFloat(adjustAmount);
    if (isNaN(num) || num <= 0) return;
    const delta = adjustType === 'CREDIT' ? num : -num;
    onAdjustBalance(selectedUser.id, delta, adjustNote);
    
    // update local selected user
    setSelectedUser({
      ...selectedUser,
      walletBalance: Math.max(0, selectedUser.walletBalance + delta)
    });
    setAdjustAmount('');
  };

  const handleToggleBan = (user: UserRecord) => {
    const updated: UserRecord = {
      ...user,
      status: user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE'
    };
    onUpdateUser(updated);
    if (selectedUser?.id === user.id) {
      setSelectedUser(updated);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Total Players</span>
            <span className="p-1 rounded-md bg-[#E7EEFE] text-[#006591] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">group</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#151C27] tracking-tight">
            {users.length.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#006C49] font-semibold truncate">
            {activeCount} active • {bannedCount} banned
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Wallet Liquidity</span>
            <span className="p-1 rounded-md bg-[#6FFBBE]/30 text-[#006C49] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">account_balance_wallet</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#006C49] tracking-tight">
            ₹{totalWallet.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            Reserve wallet balance
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Verified KYC</span>
            <span className="p-1 rounded-md bg-[#F0F3FF] text-[#00B17B] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">verified_user</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#006591] tracking-tight">
            {users.length > 0 ? `${Math.round((users.filter((u) => u.kycStatus === 'VERIFIED').length / users.length) * 100)}%` : '—'}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            {users.filter((u) => u.kycStatus === 'VERIFIED').length} verified of {users.length}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">VIP Accounts</span>
            <span className="p-1 rounded-md bg-[#FFD700]/30 text-[#856404] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">star</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#151C27] tracking-tight">
            {users.filter((u) => u.role === 'VIP').length}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            VIP tier players
          </div>
        </div>
      </div>

      {/* Main Users Table Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F8] shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-[#E2E8F8] space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 bg-[#F0F3FF] p-1 rounded-xl overflow-x-auto text-[11px]">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-[#151C27] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-white text-[#006C49] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('BANNED')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'BANNED'
                    ? 'bg-white text-[#BA1A1A] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                Banned ({bannedCount})
              </button>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <select
                value={kycFilter}
                onChange={(e: any) => setKycFilter(e.target.value)}
                className="px-2 py-1 bg-[#F0F3FF] text-[11px] font-semibold text-[#151C27] rounded-lg border-none outline-none"
              >
                <option value="ALL">All KYC</option>
                <option value="VERIFIED">KYC Verified</option>
                <option value="PENDING">KYC Pending</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e: any) => setRoleFilter(e.target.value)}
                className="px-2 py-1 bg-[#F0F3FF] text-[11px] font-semibold text-[#151C27] rounded-lg border-none outline-none"
              >
                <option value="ALL">All Tiers</option>
                <option value="VIP">VIP Only</option>
                <option value="USER">Standard</option>
              </select>
            </div>
          </div>

          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#6E7881]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by player name, phone, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F0F3FF] text-[11px] text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-[#F0F3FF] text-[#6E7881] font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F8]">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Player Details / ID</th>
                <th className="py-2.5 px-3 sm:px-4">Phone</th>
                <th className="py-2.5 px-3 sm:px-4">Wallet Balance</th>
                <th className="py-2.5 px-3 sm:px-4">Total Winnings</th>
                <th className="py-2.5 px-3 sm:px-4">Tier</th>
                <th className="py-2.5 px-3 sm:px-4">KYC</th>
                <th className="py-2.5 px-3 sm:px-4">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F8] text-[#151C27]">
              {filteredUsers.map((user) => {
                const isActive = user.status === 'ACTIVE';
                const isVerified = user.kycStatus === 'VERIFIED';
                const isVip = user.role === 'VIP';

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-[#F9F9FF] transition-colors"
                  >
                    <td className="py-2.5 px-3 sm:px-4 font-semibold">
                      <div className="flex items-center gap-2">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-[#BEC8D2] shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#E7EEFE] text-[#006591] font-bold text-[11px] flex items-center justify-center font-display shrink-0">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#151C27] text-xs">
                            {user.name}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[#6E7881] font-code-tabular">
                            <span>{user.userId}</span>
                            <button
                              onClick={() => handleCopyId(user.userId)}
                              title="Copy ID"
                              className="text-[#0EA5E9] hover:underline"
                            >
                              <span className="material-symbols-outlined text-[10px]">content_copy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-code-tabular text-[#3E4850] text-[11px]">
                      {user.phone}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-display font-bold text-xs text-[#006C49]">
                      ₹{user.walletBalance.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-display font-bold text-xs text-[#151C27]">
                      ₹{user.totalWinnings.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      {isVip ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFD700]/30 text-[#856404] border border-[#FFD700]/50">
                          VIP
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-[#F0F3FF] text-[#565E74]">
                          STANDARD
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#6FFBBE]/40 text-[#006C49]">
                          <span className="material-symbols-outlined text-[10px]">verified</span>
                          VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFE082]/50 text-[#8D6E00]">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E7EEFE] text-[#006591]">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFDAD6] text-[#BA1A1A]">
                          BANNED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#0EA5E9]/15 text-[#006591] hover:bg-[#0EA5E9] hover:text-white transition-colors"
                        >
                          Profile & Wallet
                        </button>
                        <button
                          onClick={() => handleToggleBan(user)}
                          className={`p-1 rounded-md transition-colors ${
                            isActive
                              ? 'text-[#6E7881] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/30'
                              : 'text-[#006C49] hover:bg-[#6FFBBE]/30'
                          }`}
                          title={isActive ? 'Ban Player' : 'Activate Player'}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isActive ? 'block' : 'lock_open'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out / Modal: Player Profile & Wallet Ledger */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 shadow-2xl border border-[#E2E8F8] space-y-3 sm:space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F8]">
              <div className="flex items-center gap-2.5">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#0EA5E9]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#E7EEFE] text-[#006591] font-bold text-sm flex items-center justify-center font-display">
                    {selectedUser.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-display font-bold text-sm sm:text-base text-[#151C27]">
                      {selectedUser.name}
                    </h3>
                    {selectedUser.kycStatus === 'VERIFIED' && (
                      <span className="material-symbols-outlined text-xs text-[#00B17B]">verified</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#6E7881] font-code-tabular">
                    {selectedUser.userId} • {selectedUser.phone}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#6E7881] hover:text-[#151C27] p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F0F3FF]">
                <div className="text-[9px] uppercase font-bold text-[#6E7881]">Wallet</div>
                <div className="mt-0.5 font-display font-bold text-xs sm:text-sm text-[#006C49]">
                  ₹{selectedUser.walletBalance.toLocaleString()}
                </div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F0F3FF]">
                <div className="text-[9px] uppercase font-bold text-[#6E7881]">Winnings</div>
                <div className="mt-0.5 font-display font-bold text-xs sm:text-sm text-[#151C27]">
                  ₹{selectedUser.totalWinnings.toLocaleString()}
                </div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F0F3FF]">
                <div className="text-[9px] uppercase font-bold text-[#6E7881]">Status</div>
                <div className="mt-0.5 font-bold text-[11px] text-[#006591]">
                  {selectedUser.status}
                </div>
              </div>
            </div>

            {/* Wallet Balance Adjuster */}
            <div className="p-3 rounded-xl border border-[#E2E8F8] bg-[#F9F9FF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[#151C27]">
                  Manual Wallet Adjustment
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAdjustType('CREDIT')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      adjustType === 'CREDIT'
                        ? 'bg-[#006C49] text-white'
                        : 'bg-white text-[#6E7881]'
                    }`}
                  >
                    + Credit
                  </button>
                  <button
                    onClick={() => setAdjustType('DEBIT')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      adjustType === 'DEBIT'
                        ? 'bg-[#BA1A1A] text-white'
                        : 'bg-white text-[#6E7881]'
                    }`}
                  >
                    - Debit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6E7881] mb-0.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full px-2.5 py-1 bg-white text-[11px] font-bold rounded-lg border border-[#E2E8F8] focus:border-[#0EA5E9] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6E7881] mb-0.5">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white text-[11px] rounded-lg border border-[#E2E8F8] focus:border-[#0EA5E9] outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyBalance}
                disabled={!adjustAmount}
                className="w-full py-1.5 bg-[#0EA5E9] hover:bg-[#0284c7] disabled:opacity-50 text-white font-bold text-[11px] rounded-lg transition-colors"
              >
                Apply Adjustment
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleToggleBan(selectedUser)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#ffb4ab]'
                    : 'bg-[#6FFBBE]/40 text-[#006C49] hover:bg-[#6FFBBE]'
                }`}
              >
                {selectedUser.status === 'ACTIVE' ? 'Lock / Ban Account' : 'Reactivate'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#6E7881] hover:bg-[#F0F3FF]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
