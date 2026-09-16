import React, { useState } from 'react';
import { WithdrawalRequest } from '../types';

interface WithdrawalsViewProps {
  withdrawals: WithdrawalRequest[];
  onDisburse: (id: string, utr: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({
  withdrawals,
  onDisburse,
  onReject
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('PENDING');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'UPI' | 'BANK'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [activeModalRequest, setActiveModalRequest] = useState<WithdrawalRequest | null>(null);
  const [utrInput, setUtrInput] = useState<string>('');
  const [rejectModalRequest, setRejectModalRequest] = useState<WithdrawalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Mismatched Beneficiary KYC Name');

  // Filter items
  const filteredWithdrawals = withdrawals.filter((item) => {
    if (activeTab !== 'ALL' && item.status !== activeTab) return false;
    if (methodFilter !== 'ALL' && item.method !== methodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesRef = item.refId.toLowerCase().includes(q);
      const matchesName = item.playerName.toLowerCase().includes(q);
      const matchesPhone = item.playerPhone.toLowerCase().includes(q);
      const matchesAccount = item.accountDetails.toLowerCase().includes(q);
      if (!matchesRef && !matchesName && !matchesPhone && !matchesAccount) return false;
    }
    return true;
  });

  const pendingCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const paidCount = withdrawals.filter((w) => w.status === 'PAID').length;
  const rejectedCount = withdrawals.filter((w) => w.status === 'REJECTED').length;

  const totalPendingAmount = withdrawals
    .filter((w) => w.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidAmount = withdrawals
    .filter((w) => w.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredWithdrawals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredWithdrawals.map((w) => w.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDisburseModal = (item: WithdrawalRequest) => {
    setActiveModalRequest(item);
    // Pre-fill with timestamp-based ref; user should enter real UTR
    const generatedUtr = `CMS${String(Date.now()).padStart(12, '0').slice(-12)}`;
    setUtrInput(generatedUtr);
  };

  const handleConfirmDisbursement = () => {
    if (activeModalRequest) {
      onDisburse(activeModalRequest.id, utrInput);
      setActiveModalRequest(null);
    }
  };

  const handleConfirmReject = () => {
    if (rejectModalRequest) {
      onReject(rejectModalRequest.id, rejectReason);
      setRejectModalRequest(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 4 Exposure & Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Pending Exposure</span>
            <span className="p-1 rounded-md bg-[#FFDAD6] text-[#BA1A1A] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">hourglass_top</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#BA1A1A] tracking-tight">
            ₹{totalPendingAmount.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            {pendingCount} in queue
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Disbursed Total</span>
            <span className="p-1 rounded-md bg-[#6FFBBE]/30 text-[#006C49] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">check_circle</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#006C49] tracking-tight">
            {totalPaidAmount > 0 ? `₹${totalPaidAmount.toLocaleString()}` : '—'}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            {paidCount} successful transfers
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Gateway Status</span>
            <span className="p-1 rounded-md bg-[#E7EEFE] text-[#006591] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">speed</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#006591] tracking-tight">
            {withdrawals.length > 0 ? 'Live' : '—'}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            {withdrawals.length > 0 ? `${withdrawals.length} total requests` : 'No withdrawal data yet'}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Rejected</span>
            <span className="p-1 rounded-md bg-[#F0F3FF] text-[#0EA5E9] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">block</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#151C27] tracking-tight">
            {rejectedCount}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            {rejectedCount > 0 ? 'requires review' : 'no rejections'}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F8] shadow-xs overflow-hidden">
        {/* Filter Tabs & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-[#E2E8F8] space-y-2.5 sm:space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-[#F0F3FF] p-1 rounded-xl overflow-x-auto text-[11px]">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-[#BA1A1A] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('PAID')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === 'PAID'
                    ? 'bg-white text-[#006C49] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                Paid ({paidCount})
              </button>
              <button
                onClick={() => setActiveTab('REJECTED')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === 'REJECTED'
                    ? 'bg-white text-[#565E74] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white text-[#151C27] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                All ({withdrawals.length})
              </button>
            </div>

            {/* Batch actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#006591]">
                  {selectedIds.length} Selected
                </span>
                <button
                  onClick={() => {
                    selectedIds.forEach((id) => onDisburse(id, `BATCH-${Date.now()}`));
                    setSelectedIds([]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#006C49] text-white text-[11px] font-bold hover:bg-[#005237] transition-colors"
                >
                  Batch Disburse
                </button>
              </div>
            )}
          </div>

          {/* Search and Method Filter row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#6E7881]">
                search
              </span>
              <input
                type="text"
                placeholder="Filter by name, phone, Ref ID or VPA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F0F3FF] text-[11px] text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <span className="text-[11px] text-[#6E7881] font-medium">Method:</span>
              <select
                value={methodFilter}
                onChange={(e: any) => setMethodFilter(e.target.value)}
                className="px-2 py-1 bg-[#F0F3FF] text-[11px] font-semibold text-[#151C27] rounded-lg border border-transparent focus:border-[#0EA5E9] outline-none"
              >
                <option value="ALL">All Methods</option>
                <option value="UPI">UPI VPA</option>
                <option value="BANK">Bank Account / IMPS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-[#F0F3FF] text-[#6E7881] font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F8]">
              <tr>
                <th className="py-2.5 px-3 sm:px-4 w-9">
                  <input
                    type="checkbox"
                    checked={
                      filteredWithdrawals.length > 0 &&
                      selectedIds.length === filteredWithdrawals.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded text-[#0EA5E9] focus:ring-0"
                  />
                </th>
                <th className="py-2.5 px-3 sm:px-4">Ref ID</th>
                <th className="py-2.5 px-3 sm:px-4">Player Details</th>
                <th className="py-2.5 px-3 sm:px-4">Amount</th>
                <th className="py-2.5 px-3 sm:px-4">Method & Account</th>
                <th className="py-2.5 px-3 sm:px-4">Time</th>
                <th className="py-2.5 px-3 sm:px-4">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F8] text-[#151C27]">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[11px] text-[#6E7881]">
                    No withdrawal records matching current filters.
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((item) => {
                  const isPending = item.status === 'PENDING';
                  const isPaid = item.status === 'PAID';
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F9F9FF] transition-colors ${
                        isSelected ? 'bg-[#F0F3FF]/70' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 sm:px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded text-[#0EA5E9] focus:ring-0"
                        />
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 font-code-tabular font-bold text-[11px] text-[#006591]">
                        {item.refId}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#E7EEFE] text-[#006591] font-bold text-[10px] flex items-center justify-center font-display shrink-0">
                            {item.playerName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#151C27] text-xs flex items-center gap-1">
                              {item.playerName}
                              {item.isVip && (
                                <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-[#FFD700]/30 text-[#856404]">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#6E7881]">
                              {item.playerPhone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 font-display font-bold text-xs text-[#151C27]">
                        ₹{item.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              item.method === 'UPI'
                                ? 'bg-[#6FFBBE]/30 text-[#006C49]'
                                : 'bg-[#E7EEFE] text-[#006591]'
                            }`}
                          >
                            {item.method}
                          </span>
                          <span className="font-code-tabular text-[11px] text-[#3E4850] truncate max-w-[120px]">
                            {item.accountDetails}
                          </span>
                        </div>
                        {item.bankCode && (
                          <div className="text-[9px] text-[#6E7881] font-code-tabular mt-0.5">
                            IFSC: {item.bankCode}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-[#6E7881] text-[11px]">
                        {item.requestTime}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFDAD6] text-[#BA1A1A]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A] animate-pulse"></span>
                            PENDING
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#6FFBBE]/40 text-[#006C49]">
                            <span className="material-symbols-outlined text-[11px]">done</span>
                            PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E2E8F8] text-[#565E74]">
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDisburseModal(item)}
                              className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#006C49] text-white hover:bg-[#005237] shadow-xs transition-colors"
                            >
                              Disburse
                            </button>
                            <button
                              onClick={() => setRejectModalRequest(item)}
                              className="px-1.5 py-1 rounded-md text-[11px] font-semibold text-[#BA1A1A] hover:bg-[#FFDAD6] transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#6E7881] font-medium">
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Confirm Payout Disbursement */}
      {activeModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 shadow-2xl border border-[#E2E8F8] space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F8]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#6FFBBE]/30 text-[#006C49]">
                  <span className="material-symbols-outlined text-base sm:text-lg">payments</span>
                </span>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#151C27]">
                    Confirm Payout Disbursement
                  </h3>
                  <p className="text-[10px] text-[#6E7881]">
                    Authorize banking node transfer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalRequest(null)}
                className="text-[#6E7881] hover:text-[#151C27] p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-2 p-3 rounded-xl bg-[#F0F3FF] text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#6E7881]">Ref ID:</span>
                <span className="font-code-tabular font-bold text-[#006591]">
                  {activeModalRequest.refId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7881]">Beneficiary:</span>
                <span className="font-bold text-[#151C27]">
                  {activeModalRequest.playerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7881]">Method:</span>
                <span className="font-semibold text-[#151C27] truncate max-w-[180px]">
                  {activeModalRequest.method} ({activeModalRequest.accountDetails})
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E2E8F8] pt-1.5">
                <span className="font-bold text-[#151C27]">Total Payout:</span>
                <span className="font-display font-bold text-sm text-[#006C49]">
                  ₹{activeModalRequest.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                Banking UTR / Transaction Reference ID
              </label>
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-xs font-code-tabular font-bold text-[#151C27] rounded-xl border border-[#BEC8D2] focus:border-[#0EA5E9] outline-none"
              />
              <p className="text-[9px] text-[#6E7881] mt-0.5">
                Enter the real UTR from your banking gateway.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setActiveModalRequest(null)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#6E7881] hover:bg-[#F0F3FF]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisbursement}
                className="px-4 py-1.5 rounded-lg text-[11px] font-bold bg-[#006C49] text-white hover:bg-[#005237] shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                Authorize & Disburse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Request */}
      {rejectModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 shadow-2xl border border-[#E2E8F8] space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F8]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FFDAD6] text-[#BA1A1A]">
                  <span className="material-symbols-outlined text-base sm:text-lg">block</span>
                </span>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#BA1A1A]">
                    Reject Withdrawal
                  </h3>
                  <p className="text-[10px] text-[#6E7881]">
                    Ref ID: {rejectModalRequest.refId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalRequest(null)}
                className="text-[#6E7881] hover:text-[#151C27] p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                Reason for Rejection
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-xs font-semibold text-[#151C27] rounded-xl border border-[#BEC8D2] focus:border-[#BA1A1A] outline-none"
              >
                <option value="Mismatched Beneficiary KYC Name">
                  Mismatched Beneficiary KYC Name
                </option>
                <option value="Invalid UPI VPA Handle">
                  Invalid UPI VPA Handle
                </option>
                <option value="Suspected Syndicate Wagering Activity">
                  Suspected Syndicate Wagering Activity
                </option>
                <option value="Unsettled Round Margin Discrepancy">
                  Unsettled Round Margin Discrepancy
                </option>
                <option value="Duplicate Payout Submission">
                  Duplicate Payout Submission
                </option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setRejectModalRequest(null)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#6E7881] hover:bg-[#F0F3FF]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-lg text-[11px] font-bold bg-[#BA1A1A] text-white hover:bg-[#93000A]"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
