import React, { useState, useMemo } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Copy,
  Check,
  Eye,
  Plus,
  AlertCircle,
  QrCode,
  CreditCard,
  Smartphone,
  Building2,
  Coins,
  ShieldCheck,
  X,
  UserCheck
} from 'lucide-react';
import { DepositRecord } from '../types';

interface DepositsViewProps {
  deposits: DepositRecord[];
  onApproveDeposit: (depositId: string) => void;
  onRejectDeposit: (depositId: string, reason: string) => void;
  onManualCredit: (depositData: Omit<DepositRecord, 'id' | 'uuid' | 'depositId' | 'timestamp' | 'status'>) => void;
}

export const DepositsView: React.FC<DepositsViewProps> = ({
  deposits,
  onApproveDeposit,
  onRejectDeposit,
  onManualCredit
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Modals
  const [viewingProof, setViewingProof] = useState<DepositRecord | null>(null);
  const [rejectingDeposit, setRejectingDeposit] = useState<DepositRecord | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Invalid UTR Number / Not received in bank account');
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Manual Credit Form State
  const [manualForm, setManualForm] = useState({
    userName: '',
    userPhone: '',
    amount: '',
    bonusAmount: '',
    method: 'UPI' as DepositRecord['method'],
    utrNumber: '',
    gatewayRef: 'MANUAL/ADMIN'
  });

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.userName || !manualForm.amount || !manualForm.utrNumber) return;

    onManualCredit({
      userId: `u-${Date.now()}`,
      userName: manualForm.userName,
      userPhone: manualForm.userPhone || '+91 98000 00000',
      amount: parseFloat(manualForm.amount),
      bonusAmount: manualForm.bonusAmount ? parseFloat(manualForm.bonusAmount) : 0,
      method: manualForm.method,
      utrNumber: manualForm.utrNumber,
      gatewayRef: manualForm.gatewayRef,
      creditedBy: 'Admin Manual'
    });

    setIsManualModalOpen(false);
    setManualForm({
      userName: '',
      userPhone: '',
      amount: '',
      bonusAmount: '',
      method: 'UPI',
      utrNumber: '',
      gatewayRef: 'MANUAL/ADMIN'
    });
  };

  // Filtered deposits
  const filteredDeposits = useMemo(() => {
    return deposits.filter((d) => {
      if (selectedStatus !== 'ALL' && d.status !== selectedStatus) return false;
      if (selectedMethod !== 'ALL' && d.method !== selectedMethod) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesUser = d.userName.toLowerCase().includes(query);
        const matchesPhone = d.userPhone.includes(query);
        const matchesUtr = d.utrNumber.toLowerCase().includes(query);
        const matchesUuid = (d.uuid || '').toLowerCase().includes(query);
        const matchesRef = d.depositId.toLowerCase().includes(query);
        if (!matchesUser && !matchesPhone && !matchesUtr && !matchesUuid && !matchesRef) return false;
      }
      return true;
    });
  }, [deposits, selectedStatus, selectedMethod, searchQuery]);

  // Aggregate metrics
  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;
  const pendingTotal = deposits
    .filter((d) => d.status === 'PENDING')
    .reduce((sum, d) => sum + d.amount, 0);

  const approvedTotal = deposits
    .filter((d) => d.status === 'APPROVED')
    .reduce((sum, d) => sum + d.amount, 0);

  const upiTotal = deposits
    .filter((d) => (d.method === 'UPI' || d.method === 'QR_CODE') && d.status === 'APPROVED')
    .reduce((sum, d) => sum + d.amount, 0);

  const getMethodIcon = (method: DepositRecord['method']) => {
    switch (method) {
      case 'UPI':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'QR_CODE':
        return <QrCode className="w-3.5 h-3.5" />;
      case 'IMPS':
      case 'NET_BANKING':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'USDT':
        return <Coins className="w-3.5 h-3.5" />;
      default:
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top 4 KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Approved Collections */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[#6E7881] text-[10px] sm:text-xs font-semibold">
            <span>Approved Deposits</span>
            <span className="p-1 rounded-md bg-[#6FFBBE]/30 text-[#006C49] shrink-0">
              <ArrowDownToLine className="w-4 h-4 stroke-[2]" />
            </span>
          </div>
          <div className="mt-1.5 font-display text-sm sm:text-xl font-bold text-[#151C27] tracking-tight">
            ₹{approvedTotal.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-[#006C49] font-semibold">
            <CheckCircle2 className="w-3 h-3 stroke-[2]" />
            <span>Successfully credited to user wallets</span>
          </div>
        </div>

        {/* Card 2: Pending Approval Queue */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[#6E7881] text-[10px] sm:text-xs font-semibold">
            <span>Pending Approvals</span>
            <span className="p-1 rounded-md bg-[#FFE082]/60 text-[#8D6E00] shrink-0">
              <Clock className="w-4 h-4 stroke-[2]" />
            </span>
          </div>
          <div className="mt-1.5 font-display text-sm sm:text-xl font-bold text-[#151C27] tracking-tight flex items-baseline gap-2">
            <span>{pendingCount}</span>
            <span className="text-xs font-normal text-[#6E7881]">
              (₹{pendingTotal.toLocaleString()})
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-[#BA1A1A] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A] animate-ping"></span>
            <span>Requires admin UTR verification</span>
          </div>
        </div>

        {/* Card 3: UPI / QR Intake */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[#6E7881] text-[10px] sm:text-xs font-semibold">
            <span>UPI / QR Share</span>
            <span className="p-1 rounded-md bg-[#E7EEFE] text-[#006591] shrink-0">
              <QrCode className="w-4 h-4 stroke-[2]" />
            </span>
          </div>
          <div className="mt-1.5 font-display text-sm sm:text-xl font-bold text-[#151C27] tracking-tight">
            ₹{upiTotal.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-[#6E7881]">
            <span className="font-semibold text-[#006591]">PhonePe, GPay, Paytm</span>
          </div>
        </div>

        {/* Card 4: Total Records */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[#6E7881] text-[10px] sm:text-xs font-semibold">
            <span>Total Records</span>
            <span className="p-1 rounded-md bg-[#F0F3FF] text-[#00B17B] shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </span>
          </div>
          <div className="mt-1.5 font-display text-sm sm:text-xl font-bold text-[#151C27] tracking-tight">
            {deposits.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-[#6E7881]">
            <span>{deposits.length > 0 ? `${deposits.filter((d)=>d.status==='APPROVED').length} approved` : 'No deposit data yet'}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F8] shadow-xs overflow-hidden">
        {/* Filter Controls Row */}
        <div className="p-3 sm:p-4 bg-[#F8FAFC] border-b border-[#E2E8F8] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  selectedStatus === status
                    ? 'bg-[#151C27] text-white shadow-xs'
                    : 'bg-white text-[#6E7881] hover:text-[#151C27] border border-[#E2E8F8]'
                }`}
              >
                {status === 'ALL' && 'All Deposits'}
                {status === 'PENDING' && `Pending (${pendingCount})`}
                {status === 'APPROVED' && 'Approved'}
                {status === 'REJECTED' && 'Rejected'}
              </button>
            ))}
          </div>

          {/* Search, Method Filter & Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6E7881]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, UUID, UTR, #DEP..."
                className="w-full pl-8 pr-3 py-1 bg-white border border-[#E2E8F8] rounded-xl text-[11px] text-[#151C27] placeholder-[#6E7881] outline-none focus:border-[#0EA5E9]"
              />
            </div>

            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-2.5 py-1 bg-white border border-[#E2E8F8] rounded-xl text-[11px] text-[#3E4850] font-semibold outline-none"
            >
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI (GPay/PhonePe)</option>
              <option value="QR_CODE">QR Code Scan</option>
              <option value="IMPS">IMPS Transfer</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="USDT">Crypto (USDT)</option>
            </select>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#006591] hover:bg-[#005175] text-white text-[11px] font-bold transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>Manual Credit</span>
            </button>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#F0F3FF] text-[#6E7881] font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F8]">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Player & Account</th>
                <th className="py-2.5 px-3 sm:px-4">Deposit ID & UUID</th>
                <th className="py-2.5 px-3 sm:px-4">Method & Gateway</th>
                <th className="py-2.5 px-3 sm:px-4">Amount & Bonus</th>
                <th className="py-2.5 px-3 sm:px-4">Proof & Timestamp</th>
                <th className="py-2.5 px-3 sm:px-4">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F8] text-[#151C27]">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6E7881]">
                    <AlertCircle className="w-6 h-6 mx-auto text-[#6E7881] mb-1.5 opacity-60" />
                    <p className="text-xs font-semibold">No deposit transactions match your filter.</p>
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((record) => {
                  const isPending = record.status === 'PENDING';
                  const isApproved = record.status === 'APPROVED';
                  const isRejected = record.status === 'REJECTED';

                  return (
                    <tr key={record.id} className="hover:bg-[#F9F9FF] transition-colors">
                      {/* Player */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#E7EEFE] text-[#006591] flex items-center justify-center font-bold text-xs font-display shrink-0">
                            {record.userName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#151C27] truncate">
                                {record.userName}
                              </span>
                              {record.isVip && (
                                <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-[#FFE082] text-[#8D6E00]">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#6E7881] font-code-tabular">
                              {record.userPhone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Deposit ID & UUID */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-semibold text-xs text-[#151C27] flex items-center gap-1.5">
                          <span>{record.depositId}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#006591] font-mono mt-0.5">
                          <span className="truncate max-w-[130px] sm:max-w-[170px]" title={record.uuid}>
                            UUID: {record.uuid}
                          </span>
                          <button
                            onClick={() => handleCopyUtr(record.uuid)}
                            className="text-[#006591] hover:text-[#004e70] shrink-0 p-0.5 rounded hover:bg-[#E7EEFE]"
                            title="Copy UUID"
                          >
                            {copiedUtr === record.uuid ? (
                              <Check className="w-3 h-3 text-[#00B17B]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Method & Gateway */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F0F3FF] border border-[#E2E8F8] text-[11px] font-semibold text-[#006591]">
                          {getMethodIcon(record.method)}
                          <span>{record.method.replace('_', ' ')}</span>
                        </div>
                        <div className="text-[10px] text-[#6E7881] mt-0.5 truncate max-w-[130px]">
                          {record.gatewayRef || 'Direct Transfer'}
                        </div>
                      </td>

                      {/* Amount & Bonus */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-code-tabular font-bold text-xs sm:text-sm text-[#151C27]">
                          ₹{record.amount.toLocaleString()}
                        </div>
                        {record.bonusAmount ? (
                          <div className="text-[10px] font-semibold text-[#006C49]">
                            +₹{record.bonusAmount.toLocaleString()} Bonus
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#6E7881]">Zero Bonus</div>
                        )}
                      </td>

                      {/* Proof & Time */}
                      <td className="py-3 px-3 sm:px-4">
                        {record.screenshotProof ? (
                          <button
                            onClick={() => setViewingProof(record)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006591] hover:underline"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#6E7881]">Auto Verified</span>
                        )}
                        <div className="text-[10px] text-[#6E7881] mt-0.5">
                          {record.timestamp}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 sm:px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFE082]/60 text-[#8D6E00]">
                            <Clock className="w-3 h-3" />
                            PENDING
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6FFBBE]/40 text-[#006C49]">
                            <CheckCircle2 className="w-3 h-3" />
                            APPROVED
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFDAD6] text-[#BA1A1A]" title={record.rejectionReason}>
                            <XCircle className="w-3 h-3" />
                            REJECTED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onApproveDeposit(record.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#006C49] hover:bg-[#005237] text-white text-[10px] font-bold transition-colors shadow-xs flex items-center gap-1"
                              title="Approve and credit wallet immediately"
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>Credit</span>
                            </button>
                            <button
                              onClick={() => setRejectingDeposit(record)}
                              className="px-2.5 py-1 rounded-lg border border-[#FFDAD6] bg-white hover:bg-[#FFDAD6]/40 text-[#BA1A1A] text-[10px] font-bold transition-colors flex items-center gap-1"
                              title="Reject invalid transaction"
                            >
                              <X className="w-3 h-3 stroke-[2.5]" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : isApproved ? (
                          <span className="text-[10px] text-[#6E7881] italic">
                            Credited {record.creditedBy ? `(${record.creditedBy})` : ''}
                          </span>
                        ) : (
                          <button
                            onClick={() => alert(`Rejection Reason:\n${record.rejectionReason || 'UTR not verified.'}`)}
                            className="text-[10px] text-[#BA1A1A] hover:underline font-semibold"
                          >
                            Reason
                          </button>
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

      {/* Screenshot Proof Modal */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E2E8F8]">
            <div className="p-3.5 border-b border-[#E2E8F8] flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
                  Payment Proof Screenshot
                </h3>
                <p className="text-[10px] text-[#6E7881]">
                  {viewingProof.depositId} • {viewingProof.userName} (₹{viewingProof.amount.toLocaleString()})
                </p>
              </div>
              <button
                onClick={() => setViewingProof(null)}
                className="p-1 rounded-lg text-[#6E7881] hover:bg-[#F0F3FF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="rounded-xl overflow-hidden border border-[#E2E8F8] bg-[#F8FAFC] flex items-center justify-center max-h-72">
                <img
                  src={viewingProof.screenshotProof}
                  alt="Receipt Preview"
                  className="w-full h-auto object-contain max-h-72"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#F0F3FF] text-[11px] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#6E7881]">Transaction UUID:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#006591]" title={viewingProof.uuid}>
                      {viewingProof.uuid}
                    </span>
                    <button
                      onClick={() => handleCopyUtr(viewingProof.uuid)}
                      className="text-[#006591] hover:text-[#004e70] p-0.5 rounded hover:bg-[#E2E8F8]"
                      title="Copy UUID"
                    >
                      {copiedUtr === viewingProof.uuid ? (
                        <Check className="w-3 h-3 text-[#00B17B]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E7881]">Submitted UTR:</span>
                  <span className="font-code-tabular font-bold text-[#151C27]">
                    {viewingProof.utrNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E7881]">Player Phone:</span>
                  <span className="font-code-tabular text-[#151C27]">
                    {viewingProof.userPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E7881]">Amount Claimed:</span>
                  <span className="font-code-tabular font-bold text-[#006C49]">
                    ₹{viewingProof.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {viewingProof.status === 'PENDING' && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onApproveDeposit(viewingProof.id);
                      setViewingProof(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#006C49] hover:bg-[#005237] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Credit ₹{viewingProof.amount.toLocaleString()}</span>
                  </button>
                  <button
                    onClick={() => {
                      setRejectingDeposit(viewingProof);
                      setViewingProof(null);
                    }}
                    className="px-3 py-2 rounded-xl border border-[#FFDAD6] text-[#BA1A1A] hover:bg-[#FFDAD6]/40 text-xs font-bold transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingDeposit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-[#E2E8F8] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F8]">
              <h3 className="font-display font-bold text-xs sm:text-sm text-[#BA1A1A] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Reject Deposit {rejectingDeposit.depositId}
              </h3>
              <button
                onClick={() => setRejectingDeposit(null)}
                className="p-1 rounded-lg text-[#6E7881] hover:bg-[#F0F3FF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[#6E7881]">
              Select or type the reason why this ₹{rejectingDeposit.amount.toLocaleString()} deposit is being rejected:
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#E2E8F8] text-[11px] text-[#151C27] outline-none"
            >
              <option value="Invalid UTR Number / Not received in bank account">
                Invalid UTR Number / Not received in bank account
              </option>
              <option value="Duplicate UTR submission (Already claimed)">
                Duplicate UTR submission (Already claimed)
              </option>
              <option value="Amount mismatch between receipt and claim">
                Amount mismatch between receipt and claim
              </option>
              <option value="Fake or edited screenshot proof attached">
                Fake or edited screenshot proof attached
              </option>
            </select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingDeposit(null)}
                className="px-3 py-1.5 rounded-xl border border-[#E2E8F8] text-[11px] font-semibold text-[#6E7881]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRejectDeposit(rejectingDeposit.id, rejectReason);
                  setRejectingDeposit(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#BA1A1A] hover:bg-[#93000a] text-white text-[11px] font-bold transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Credit Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-[#E2E8F8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F8]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E7EEFE] text-[#006591]">
                  <UserCheck className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
                    Manual Wallet Credit / Top-Up
                  </h3>
                  <p className="text-[10px] text-[#6E7881]">
                    Credit offline player payment directly to wallet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-[#6E7881] hover:bg-[#F0F3FF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#3E4850] mb-1">
                  Player Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.userName}
                  onChange={(e) => setManualForm({ ...manualForm, userName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E2E8F8] text-[11px] text-[#151C27] outline-none focus:border-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#3E4850] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={manualForm.userPhone}
                  onChange={(e) => setManualForm({ ...manualForm, userPhone: e.target.value })}
                  placeholder="+91 98..."
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E2E8F8] text-[11px] text-[#151C27] outline-none focus:border-[#0EA5E9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#3E4850] mb-1">
                    Deposit Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E2E8F8] text-[11px] text-[#151C27] outline-none focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3E4850] mb-1">
                    Bonus Credit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualForm.bonusAmount}
                    onChange={(e) => setManualForm({ ...manualForm, bonusAmount: e.target.value })}
                    placeholder="e.g. 250"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E2E8F8] text-[11px] text-[#151C27] outline-none focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#3E4850] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={manualForm.method}
                    onChange={(e) => setManualForm({ ...manualForm, method: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E2E8F8] text-[11px] text-[#151C27] outline-none"
                  >
                    <option value="UPI">UPI Transfer</option>
                    <option value="QR_CODE">QR Code</option>
                    <option value="IMPS">Bank IMPS</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="USDT">Crypto USDT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3E4850] mb-1">
                    UTR / Ref No *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.utrNumber}
                    onChange={(e) => setManualForm({ ...manualForm, utrNumber: e.target.value })}
                    placeholder="12-digit UTR"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E2E8F8] text-[11px] text-[#151C27] outline-none focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F8]">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#E2E8F8] text-[11px] font-semibold text-[#6E7881]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#006591] hover:bg-[#005175] text-white text-[11px] font-bold transition-colors shadow-xs"
                >
                  Credit Player Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
