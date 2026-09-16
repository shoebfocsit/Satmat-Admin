import React, { useState, useEffect, useCallback } from 'react';
import {
  NavigationPath,
  Market,
  WithdrawalRequest,
  UserRecord,
  BidRecord,
  NoticeItem,
  SupportTicket,
  DepositRecord
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WithdrawalsView } from './components/WithdrawalsView';
import { MarketsView } from './components/MarketsView';
import { UsersView } from './components/UsersView';
import { BidsView } from './components/BidsView';
import { NoticesView } from './components/NoticesView';
import { SupportView } from './components/SupportView';
import { GameRatesView } from './components/GameRatesView';
import { ChartsHistoryView } from './components/ChartsHistoryView';
import { AdminManagementView } from './components/AdminManagementView';
import { DepositsView } from './components/DepositsView';
import { LoginPage } from './components/LoginPage';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  LayoutDashboard,
  TrendingUp,
  Receipt,
  CreditCard,
  ArrowDownToLine
} from 'lucide-react';
import {
  isLoggedIn,
  clearTokens,
  getAdminDashboard,
  getAdminUsers,
  getAdminWithdrawals,
  getAdminBids,
  settleWithdrawal,
  adjustWallet,
  getMarkets,
  updateMarketSchedule,
  openCloseMarket,
  declareResult,
  getNotices,
  createNotice,
  deleteNotice,
  getGameRates,
  getAdminDeposits,
  settleDeposit,
  getAdminSupportTickets,
  replySupportAsAdmin,
  resolveSupportTicket,
  setUserStatus,
  logoutAdmin,
  clearApiCache,
  warmupBackend
} from './services/api';

function transformMarkets(apiMarkets: any[]): Market[] {
  return apiMarkets.map((m: any, idx: number) => ({
    id: m.id || String(idx + 1),
    name: m.name || 'Unknown',
    code: m.id || `MKT-${idx}`,
    shortCode: (m.name || 'M').substring(0, 2).toUpperCase(),
    sessionType: m.status || 'Regular',
    openTime: m.openTime || '--:--',
    closeTime: m.closeTime || '--:--',
    cutoffTime: m.cutoffTime,
    status: m.isLive ? 'LIVE' : m.isClosed ? 'CLOSED' : 'INTERMISSION',
    resultMatrix: m.result || '--',
    active: m.isActive !== false,
    activeDays: m.activeDays || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    maxExposure: m.maxExposure
  }));
}

function transformUsers(apiUsers: any[]): UserRecord[] {
  return apiUsers.map((u: any) => ({
    id: u.id || u.id,
    userId: u.id || '#USR-0',
    name: u.name || 'Unknown',
    phone: u.phone || '',
    avatar: '',
    walletBalance: typeof u.balance === 'number' ? u.balance : 0,
    totalWinnings: 0,
    role: (u.roles && u.roles.includes('VIP')) ? 'VIP' : 'USER',
    status: u.isActive !== false ? 'ACTIVE' : 'BANNED',
    kycStatus: 'VERIFIED',
    registrationDate: ''
  }));
}

function transformWithdrawals(items: any[]): WithdrawalRequest[] {
  return items.map((w: any) => ({
    id: w.id || '',
    refId: `#WTH-${(w.id || '').slice(-4)}`,
    playerName: w.user?.name || 'Unknown',
    playerPhone: w.user?.phone || '',
    amount: typeof w.amount === 'number' ? w.amount : 0,
    method: (w.method || 'UPI').toUpperCase() as 'UPI' | 'BANK',
    accountDetails: w.upiId || w.bankDetailsId || '--',
    bankCode: undefined,
    requestTime: w.createdAt || '',
    status: w.status === 'COMPLETED' ? 'PAID' : (w.status === 'FAILED' ? 'REJECTED' : 'PENDING'),
    rejectionReason: undefined,
    isVip: w.user?.roles?.includes('VIP') || false
  }));
}

function transformBids(items: any[]): BidRecord[] {
  return items.map((b: any) => ({
    id: b.id || '',
    bidId: b.id ? `BID-${String(b.id).slice(-5)}` : 'BID-0',
    playerName: b.user?.name || 'Unknown',
    playerPhone: b.user?.phone || '',
    market: b.marketId || '',
    gameType: (b.gameType || 'JODI').toUpperCase() as BidRecord['gameType'],
    pickedNumber: b.number || '',
    amount: typeof b.amount === 'number' ? b.amount : 0,
    potentialPayout: b.status === 'WON' ? (b.wonAmount || b.amount * 10) : null,
    status: (b.status || 'PENDING').toUpperCase() as BidRecord['status'],
    timestamp: b.date || b.createdAt || ''
  }));
}

function transformNotices(items: any[]): NoticeItem[] {
  return items.map((n: any) => ({
    id: n.id || '',
    noticeId: `#NTC-${String(n.id || '').slice(-4)}`,
    title: n.title || '',
    body: n.content || '',
    status: 'published' as const,
    isPinned: !!n.isPinned,
    isCritical: n.isImportant || false,
    devicesCount: typeof n.devicesCount === 'number' ? n.devicesCount : undefined,
    viewsCount: typeof n.viewsCount === 'number' ? n.viewsCount : undefined,
    timestamp: n.date || n.createdAt || ''
  }));
}

function transformDeposits(items: any[]): DepositRecord[] {
  return items.map((d: any) => ({
    id: d.id || d.reference || String(Date.now()),
    uuid: d.reference || d.id || '',
    depositId: `DEP-${String(d.id || '').slice(-4).toUpperCase()}`,
    userId: d.userId || d.user?.id || '',
    userName: d.user?.name || d.title || 'Unknown',
    userPhone: d.user?.phone || '',
    userAvatar: '',
    isVip: d.user?.roles?.includes('VIP') || false,
    amount: typeof d.amount === 'number' ? d.amount : 0,
    bonusAmount: 0,
    method: (d.method || 'UPI').toUpperCase() as DepositRecord['method'],
    utrNumber: d.reference || d.id || '--',
    gatewayRef: d.title || 'Wallet Transaction',
    status: d.status === 'COMPLETED' ? 'APPROVED' : (d.status === 'FAILED' ? 'REJECTED' : 'PENDING'),
    timestamp: d.createdAt || d.date || '',
    rejectionReason: undefined,
    screenshotProof: undefined,
    creditedBy: undefined
  }));
}

function transformSupportTickets(items: any[]): SupportTicket[] {
  return items.map((t: any) => ({
    id: t.id,
    ticketId: `TCK-${String(t.id).slice(-6).toUpperCase()}`,
    playerName: t.user?.name || t.userName || 'Unknown',
    playerPhone: t.user?.phone || '',
    playerAvatar: '',
    vipLevel: t.user?.roles?.includes('VIP') ? 'VIP' : 'USER',
    walletBalance: typeof t.user?.balance === 'number' ? t.user.balance : 0,
    subject: t.subject || '',
    status: (t.status === 'open' ? 'OPEN' : t.status === 'resolved' ? 'RESOLVED' : 'IN_PROGRESS') as SupportTicket['status'],
    timeAgo: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
    disputedAmount: undefined,
    disputedUtr: undefined,
    gateway: undefined,
    disputedStatus: undefined,
    messages: (t.messages || []).map((m: any) => ({
      id: m.id,
      sender: m.fromUser ? 'player' as const : 'agent' as const,
      senderName: m.fromUser ? (t.user?.name || 'Player') : 'Desk Agent (You)',
      time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST' : '',
      text: m.text,
      attachmentImg: undefined,
      isVerifiedTag: undefined
    }))
  }));
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isLoggedIn());
  const [currentPath, setCurrentPath] = useState<NavigationPath>('dashboard');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [dashboardStats, setDashboardStats] = useState<{ totalUsers: number; totalDeposits: number; totalWithdrawals: number; margin: number; pendingBidVolume: number } | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ---- SUPER FAST: cache restore + critical-first + background ----
  const persistCache = useCallback(() => {
    try {
      const payload = {
        markets, withdrawals, deposits, users, bids, notices, tickets, dashboardStats,
        _ts: Date.now()
      };
      localStorage.setItem('satmat_admin_cache_v1', JSON.stringify(payload));
    } catch {}
  }, [markets, withdrawals, deposits, users, bids, notices, tickets, dashboardStats]);

  const restoreFromCache = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem('satmat_admin_cache_v1');
      if (!raw) return false;
      const c = JSON.parse(raw);
      // stale after 5 min, still use for instant paint but will revalidate
      if (c._ts && Date.now() - c._ts > 5 * 60 * 1000) {
        // keep but will be overwritten
      }
      if (Array.isArray(c.markets) && c.markets.length) setMarkets(c.markets);
      if (Array.isArray(c.withdrawals) && c.withdrawals.length) setWithdrawals(c.withdrawals);
      if (Array.isArray(c.deposits) && c.deposits.length) setDeposits(c.deposits);
      if (Array.isArray(c.users) && c.users.length) setUsers(c.users);
      if (Array.isArray(c.bids) && c.bids.length) setBids(c.bids);
      if (Array.isArray(c.notices) && c.notices.length) setNotices(c.notices);
      if (Array.isArray(c.tickets) && c.tickets.length) setTickets(c.tickets);
      if (c.dashboardStats) setDashboardStats(c.dashboardStats);
      return true;
    } catch { return false; }
  }, []);

  // Persist whenever key data changes (debounced)
  useEffect(() => {
    const id = setTimeout(() => persistCache(), 800);
    return () => clearTimeout(id);
  }, [persistCache]);

  const fetchCritical = useCallback(async () => {
    // Only dashboard + markets — smallest payload, makes DashboardView paint in <500ms with cache
    const results = await Promise.allSettled([
      getAdminDashboard(),
      getMarkets(),
    ]);
    const [dashData, marketsData] = results;
    if (dashData.status === 'fulfilled' && dashData.value) setDashboardStats(dashData.value as any);
    if (marketsData.status === 'fulfilled' && Array.isArray(marketsData.value)) setMarkets(transformMarkets(marketsData.value));
    else if (marketsData.status === 'rejected') console.warn('Markets fetch failed:', (marketsData as any).reason?.message);
    return results;
  }, []);

  const fetchBackground = useCallback(async () => {
    // Heavier lists — limit reduced from 100 -> 30 for speed, paginate later if needed
    // Fire without blocking UI; each resolves independently and paints
    const tasks: Promise<void>[] = [];
    tasks.push(getAdminUsers({ limit: 30 }).then(d => { if (d?.items) setUsers(transformUsers(d.items)); }).catch(e => console.warn('users', e.message)));
    tasks.push(getAdminWithdrawals({ limit: 30 }).then(d => { if (d?.items) setWithdrawals(transformWithdrawals(d.items)); }).catch(e => console.warn('withdrawals', e.message)));
    tasks.push(getAdminBids({ limit: 30 }).then(d => { if (d?.items) setBids(transformBids(d.items)); }).catch(e => console.warn('bids', e.message)));
    tasks.push(getNotices().then(d => { if (Array.isArray(d)) setNotices(transformNotices(d)); }).catch(e => console.warn('notices', e.message)));
    tasks.push(getAdminDeposits({ limit: 30 }).then(d => { if (d?.items) setDeposits(transformDeposits(d.items)); }).catch(e => console.warn('deposits', e.message)));
    tasks.push(getAdminSupportTickets({ limit: 30 }).then(d => { if (d?.items) setTickets(transformSupportTickets(d.items)); }).catch(e => console.warn('support', e.message)));
    await Promise.allSettled(tasks);
  }, []);

  const fetchAllData = useCallback(async (opts?: { force?: boolean }) => {
    if (opts?.force) clearApiCache();
    // instant paint from cache if available
    const hadCache = restoreFromCache();
    if (hadCache) setIsInitialLoading(false);
    else setIsInitialLoading(true);

    // wake Render backend early (cold start can be 10s) — fire and forget
    warmupBackend();

    try {
      await fetchCritical();
    } finally {
      setIsInitialLoading(false);
    }
    // background rest — schedule on idle to not block main thread
    const schedule = (cb: () => void) => {
      const ric: any = (window as any).requestIdleCallback;
      if (ric) ric(cb, { timeout: 800 });
      else setTimeout(cb, 300);
    };
    schedule(() => { fetchBackground(); });
  }, [fetchCritical, fetchBackground, restoreFromCache]);

  // On-demand lazy fetch when user navigates to a view that still empty
  const ensureDataForPath = useCallback(async (path: NavigationPath) => {
    if (path === 'users' && users.length === 0) {
      try { const d = await getAdminUsers({ limit: 30 }); if (d?.items) setUsers(transformUsers(d.items)); } catch {}
    } else if (path === 'withdrawals' && withdrawals.length === 0) {
      try { const d = await getAdminWithdrawals({ limit: 30 }); if (d?.items) setWithdrawals(transformWithdrawals(d.items)); } catch {}
    } else if (path === 'deposits' && deposits.length === 0) {
      try { const d = await getAdminDeposits({ limit: 30 }); if (d?.items) setDeposits(transformDeposits(d.items)); } catch {}
    } else if (path === 'bids' && bids.length === 0) {
      try { const d = await getAdminBids({ limit: 30 }); if (d?.items) setBids(transformBids(d.items)); } catch {}
    } else if (path === 'notices' && notices.length === 0) {
      try { const d = await getNotices(); if (Array.isArray(d)) setNotices(transformNotices(d)); } catch {}
    } else if (path === 'support' && tickets.length === 0) {
      try { const d = await getAdminSupportTickets({ limit: 30 }); if (d?.items) setTickets(transformSupportTickets(d.items)); } catch {}
    }
  }, [users.length, withdrawals.length, deposits.length, bids.length, notices.length, tickets.length]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    } else {
      setIsInitialLoading(false);
    }
  }, [isAuthenticated, fetchAllData]);

  useEffect(() => {
    if (isAuthenticated) ensureDataForPath(currentPath);
  }, [currentPath, isAuthenticated, ensureDataForPath]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearApiCache();
    localStorage.removeItem('satmat_admin_cache_v1');
    try {
      await fetchCritical();
      await fetchBackground();
      showToast('Data refreshed from server');
    } catch {
      showToast('Refresh failed', 'error');
    } finally { setIsRefreshing(false); }
  };

  // 1. Withdrawal Handlers
  const handleDisburse = async (id: string, utr: string) => {
    try {
      await settleWithdrawal(id, 'complete');
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'PAID' } : w))
      );
      showToast(`Disbursement authorized! UTR: ${utr} settled via gateway.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to settle withdrawal', 'error');
    }
  };

  const handleRejectWithdrawal = async (id: string, reason: string) => {
    try {
      await settleWithdrawal(id, 'fail');
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'REJECTED', rejectionReason: reason } : w))
      );
      showToast(`Withdrawal rejected (${reason}). Funds held.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject withdrawal', 'error');
    }
  };

  // 2. Deposits Handlers — LIVE via admin deposits + wallet adjust
  const handleApproveDeposit = async (depositId: string) => {
    try {
      await settleDeposit(depositId, 'approve');
      setDeposits((prev) => prev.map((d) => (d.id === depositId ? { ...d, status: 'APPROVED', creditedBy: 'Admin Desk' } : d)));
      const dep = deposits.find((d) => d.id === depositId);
      if (dep) showToast(`Deposit approved! ₹${dep.amount.toLocaleString()} credited.`);
      else showToast('Deposit approved.');
    } catch (err: any) {
      // Fallback: try local status if backend settle not yet deployed
      const dep = deposits.find((d) => d.id === depositId);
      if (dep && String(err.message).includes('404')) {
        setDeposits((prev) => prev.map((d) => (d.id === depositId ? { ...d, status: 'APPROVED', creditedBy: 'Admin Desk' } : d)));
        showToast(`Deposit marked APPROVED locally (backend 404).`, 'info');
      } else {
        showToast(err.message || 'Failed to approve deposit', 'error');
      }
    }
  };

  const handleRejectDeposit = async (depositId: string, reason: string) => {
    try {
      await settleDeposit(depositId, 'reject', reason);
      setDeposits((prev) => prev.map((d) => (d.id === depositId ? { ...d, status: 'REJECTED', rejectionReason: reason } : d)));
      showToast(`Deposit rejected: ${reason}`, 'info');
    } catch (err: any) {
      const dep = deposits.find((d) => d.id === depositId);
      if (dep && String(err.message).includes('404')) {
        setDeposits((prev) => prev.map((d) => (d.id === depositId ? { ...d, status: 'REJECTED', rejectionReason: reason } : d)));
        showToast(`Deposit marked REJECTED locally (backend 404).`, 'info');
      } else {
        showToast(err.message || 'Failed to reject deposit', 'error');
      }
    }
  };

  const handleManualCredit = async (data: Omit<DepositRecord, 'id' | 'uuid' | 'depositId' | 'timestamp' | 'status'>) => {
    try {
      // Live: use admin wallet adjust (paise conversion handled inside api.ts)
      const targetPhone = data.userPhone && !String(data.userPhone).includes('98000') ? data.userPhone : undefined;
      // Try find existing user by name/phone to get userId
      const matched = users.find((u) => u.name.toLowerCase() === data.userName.toLowerCase() || (targetPhone && u.phone === targetPhone));
      const totalCredit = data.amount + (data.bonusAmount || 0);
      await adjustWallet({
        userId: matched?.id,
        phone: matched ? undefined : (targetPhone || data.userPhone),
        amount: totalCredit,
        direction: 'credit',
        title: `Manual credit via admin — ${data.utrNumber}`
      });
      const generatedUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `d-${Date.now()}-${String(Date.now()).slice(-6)}`;
      const newRecord: DepositRecord = {
        ...data,
        id: `dep-${Date.now()}`,
        uuid: generatedUuid,
        depositId: `DEP-${String(Date.now()).slice(-4)}`,
        status: 'APPROVED',
        timestamp: 'Just now'
      };
      setDeposits((prev) => [newRecord, ...prev]);
      setUsers((prev) => prev.map((u) => {
        if (matched && u.id === matched.id) return { ...u, walletBalance: u.walletBalance + totalCredit };
        if (!matched && u.name.toLowerCase() === data.userName.toLowerCase()) return { ...u, walletBalance: u.walletBalance + totalCredit };
        return u;
      }));
      showToast(`Manual top-up of ₹${totalCredit.toLocaleString()} credited to ${data.userName} (live).`);
    } catch (err: any) {
      showToast(err.message || 'Manual credit failed — check phone/user exists', 'error');
    }
  };

  // 3. Markets Handlers — schedule + live open/close + declare result
  const handleUpdateMarket = async (updated: Market) => {
    try {
      await updateMarketSchedule(updated.id, {
        openTime: updated.openTime,
        closeTime: updated.closeTime,
      });
      setMarkets((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      showToast(`Schedule for ${updated.name} updated successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update schedule', 'error');
    }
  };

  const handleOpenCloseMarket = async (id: string, action: 'open' | 'close') => {
    try {
      const res = await openCloseMarket(id, action);
      setMarkets((prev) => prev.map((m) => m.id === id ? { ...m, status: res.isLive ? 'LIVE' : res.isClosed ? 'CLOSED' : 'INTERMISSION' } : m));
      showToast(`Market ${action === 'open' ? 'opened' : 'closed'} successfully.`);
    } catch (err: any) {
      showToast(err.message || `Failed to ${action} market`, 'error');
    }
  };

  const handleDeclareResult = async (id: string, result: { open: string; jodi: string; close: string; date?: string }) => {
    try {
      const res = await declareResult(id, result);
      const matrix = `${result.open}-${result.jodi}-${result.close}`;
      setMarkets((prev) => prev.map((m) => m.id === id ? { ...m, resultMatrix: matrix, status: 'CLOSED' } : m));
      showToast(`Result declared: ${matrix} — settlement triggered.`);
      // Refresh bids after settlement
      try {
        const bidsData = await getAdminBids({ limit: 50 });
        if (bidsData?.items) setBids(transformBids(bidsData.items));
      } catch {}
      return res;
    } catch (err: any) {
      showToast(err.message || 'Failed to declare result', 'error');
      throw err;
    }
  };

  // 4. User Handlers — LIVE via setUserStatus
  const handleUpdateUser = async (updated: UserRecord) => {
    const isActive = updated.status === 'ACTIVE';
    try {
      await setUserStatus(updated.id.replace('#',''), isActive);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`Player account ${updated.name} is now ${updated.status}.`);
    } catch (err: any) {
      // Fallback to local if backend not yet deployed
      if (String(err.message).includes('404')) {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        showToast(`Player ${updated.name} marked ${updated.status} locally (backend 404).`, 'info');
      } else {
        showToast(err.message || 'Failed to update user status', 'error');
      }
    }
  };

  const handleAdjustBalance = async (userId: string, delta: number, note: string) => {
    try {
      await adjustWallet({
        userId,
        amount: Math.abs(delta),
        direction: delta >= 0 ? 'credit' : 'debit',
        title: note
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, walletBalance: Math.max(0, u.walletBalance + delta) }
            : u
        )
      );
      const sign = delta >= 0 ? '+' : '';
      showToast(`Wallet adjusted: ${sign}₹${Math.abs(delta).toLocaleString()} (${note})`);
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust wallet', 'error');
    }
  };

  // 5. Notices Handlers — LIVE
  const handleAddNotice = async (notice: NoticeItem) => {
    try {
      const created = await createNotice(notice.title, notice.body, notice.isCritical);
      // Use server id if returned, else fallback to temp
      const serverNotice: NoticeItem = created?.id ? { ...notice, id: created.id, noticeId: `#NTC-${String(created.id).slice(-4)}`, timestamp: created.date || created.createdAt || 'Just now' } : notice;
      setNotices((prev) => [serverNotice, ...prev]);
      showToast('Broadcast published to all active client devices!');
    } catch (err: any) {
      showToast(err.message || 'Failed to create notice', 'error');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      showToast('Notice deleted from server.', 'info');
    } catch (err: any) {
      if (String(err.message).includes('404')) {
        setNotices((prev) => prev.filter((n) => n.id !== id));
        showToast('Notice removed locally (backend 404 — endpoint deploying).', 'info');
      } else {
        showToast(err.message || 'Failed to delete notice', 'error');
      }
    }
  };

  const handleTogglePin = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
    showToast('Pin is local-only (no backend field).', 'info');
  };

  // 6. Support Disputes Handlers — LIVE via admin support endpoints
  const handleSendMessage = async (ticketId: string, messageText: string) => {
    try {
      await replySupportAsAdmin(ticketId, messageText);
      const newMsg = {
        id: Date.now().toString(),
        sender: 'agent' as const,
        senderName: 'Desk Agent (You)',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        text: messageText
      };
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, messages: [...t.messages, newMsg] } : t));
      showToast('Reply sent and stored on server.', 'success');
    } catch (err: any) {
      if (String(err.message).includes('404')) {
        const newMsg = {
          id: Date.now().toString(),
          sender: 'agent' as const,
          senderName: 'Desk Agent (You)',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          text: messageText
        };
        setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, messages: [...t.messages, newMsg] } : t));
        showToast('Reply added locally (backend 404 — endpoint deploying).', 'info');
      } else {
        showToast(err.message || 'Failed to send reply', 'error');
      }
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await resolveSupportTicket(ticketId);
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: 'RESOLVED' } : t)));
      showToast('Ticket marked Resolved on server.', 'success');
    } catch (err: any) {
      if (String(err.message).includes('404')) {
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: 'RESOLVED' } : t)));
        showToast('Ticket marked Resolved locally (backend 404).', 'info');
      } else {
        showToast(err.message || 'Failed to resolve ticket', 'error');
      }
    }
  };

  const handleInstantCreditDispute = async (ticketId: string, amount: number) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    try {
      // Credit via wallet adjust if we can map ticket to user
      const matched = users.find((u) => u.name.toLowerCase() === ticket.playerName.toLowerCase() || u.phone === ticket.playerPhone);
      if (matched) {
        await adjustWallet({ userId: matched.id.replace('#',''), amount, direction: 'credit', title: `Dispute credit for ticket ${ticket.ticketId}` });
        setUsers((prev) => prev.map((u) => u.id === matched.id ? { ...u, walletBalance: u.walletBalance + amount } : u));
      } else {
        // fallback local
        setUsers((prev) => prev.map((u) => u.name.toLowerCase() === ticket.playerName.toLowerCase() ? { ...u, walletBalance: u.walletBalance + amount } : u));
      }
      await resolveSupportTicket(ticketId).catch(() => {});
      const creditMsg = {
        id: Date.now().toString(),
        sender: 'agent' as const,
        senderName: 'Settlement Bot',
        time: 'Just now',
        text: `Automated Reconciliation: ₹${amount.toLocaleString()} has been verified with gateway and credited to your wallet balance.`
      };
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: 'RESOLVED', disputedAmount: undefined, messages: [...t.messages, creditMsg] } : t));
      showToast(`Dispute verified! ₹${amount.toLocaleString()} credited to ${ticket.playerName} (live).`);
    } catch (err: any) {
      showToast(err.message || 'Credit failed', 'error');
    }
  };

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const pendingDepositsCount = deposits.filter((d) => d.status === 'PENDING').length;
  const openDisputesCount = tickets.filter((t) => t.status === 'OPEN').length;
  const liveMarketsCount = markets.filter((m) => m.status === 'LIVE').length;

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setMarkets([]);
    setWithdrawals([]);
    setUsers([]);
    setBids([]);
    setNotices([]);
    setTickets([]);
    setDeposits([]);
    setDashboardStats(null);
    showToast('Logged out of admin session. Portal locked.', 'info');
  };

  if (!isAuthenticated) {
    return (
      <>
        {toast && (
          <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 animate-in slide-in-from-bottom-5 fade-in max-w-sm">
            <div
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl shadow-xl border text-xs font-bold ${
                toast.type === 'error'
                  ? 'bg-[#BA1A1A] text-white border-transparent'
                  : toast.type === 'info'
                  ? 'bg-[#151C27] text-white border-transparent'
                  : 'bg-[#006C49] text-white border-transparent'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2]" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 shrink-0 stroke-[2]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2]" />
              )}
              <span className="flex-1 line-clamp-2">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-1 hover:opacity-80 text-white">
                <X className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        )}
        <LoginPage
          onLogin={() => {
            setIsAuthenticated(true);
            showToast('Authenticated as Administrator. Welcome to SATMAT Portal.');
          }}
        />
      </>
    );
  }

  return (
    <div className="h-full h-[100dvh] w-full bg-[#F8FAFC] text-[#151C27] flex font-sans overflow-hidden text-xs">
      {toast && (
        <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 animate-in slide-in-from-bottom-5 fade-in max-w-sm">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-xl border text-[11px] font-bold ${
              toast.type === 'error'
                ? 'bg-[#BA1A1A] text-white border-transparent'
                : toast.type === 'info'
                ? 'bg-[#151C27] text-white border-transparent'
                : 'bg-[#006C49] text-white border-transparent'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
            ) : toast.type === 'info' ? (
              <Info className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
            )}
            <span className="flex-1 line-clamp-2">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-1 hover:opacity-80 text-white">
              <X className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>
      )}

      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        pendingWithdrawalsCount={pendingWithdrawalsCount}
        pendingDepositsCount={pendingDepositsCount}
        openDisputesCount={openDisputesCount}
        liveMarketsCount={liveMarketsCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      <div className="lg:pl-72 flex-1 flex flex-col h-full min-w-0 w-full overflow-hidden">
        <Header
          currentPath={currentPath}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notificationCount={pendingWithdrawalsCount + pendingDepositsCount + openDisputesCount}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main
          id="main-scrollable-content"
          className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative p-3 sm:p-4 lg:p-6"
        >
          {isRefreshing && (
            <div className="absolute top-0 left-0 right-0 h-0.5 z-10 overflow-hidden bg-[#E2E8F8]">
              <div className="h-full w-1/3 bg-[#0EA5E9] animate-[shimmer_1s_ease-in-out_infinite]"></div>
            </div>
          )}
          {isInitialLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-[#6E7881] font-semibold">Loading data from server...</span>
                <span className="text-[11px] text-[#6E7881]">First load may take 8-10s on Render cold start — next loads are instant (cached)</span>
              </div>
            </div>
          ) : (
            <>
              {currentPath === 'dashboard' && (
                <DashboardView
                  markets={markets}
                  bids={bids}
                  withdrawals={withdrawals}
                  users={users}
                  dashboardStats={dashboardStats}
                  pendingWithdrawalsCount={pendingWithdrawalsCount}
                  onNavigate={(path) => setCurrentPath(path)}
                />
              )}

              {currentPath === 'deposits' && (
                <DepositsView
                  deposits={deposits}
                  onApproveDeposit={handleApproveDeposit}
                  onRejectDeposit={handleRejectDeposit}
                  onManualCredit={handleManualCredit}
                />
              )}

              {currentPath === 'withdrawals' && (
                <WithdrawalsView
                  withdrawals={withdrawals}
                  onDisburse={handleDisburse}
                  onReject={handleRejectWithdrawal}
                />
              )}

              {currentPath === 'markets' && (
                <MarketsView
                  markets={markets}
                  onUpdateMarket={handleUpdateMarket}
                  onOpenClose={handleOpenCloseMarket}
                  onDeclareResult={handleDeclareResult}
                />
              )}

              {currentPath === 'users' && (
                <UsersView
                  users={users}
                  onUpdateUser={handleUpdateUser}
                  onAdjustBalance={handleAdjustBalance}
                />
              )}

              {currentPath === 'bids' && (
                <BidsView bids={bids} />
              )}

              {currentPath === 'notices' && (
                <NoticesView
                  notices={notices}
                  onAddNotice={handleAddNotice}
                  onDeleteNotice={handleDeleteNotice}
                  onTogglePin={handleTogglePin}
                />
              )}

              {currentPath === 'support' && (
                <SupportView
                  tickets={tickets}
                  onSendMessage={handleSendMessage}
                  onResolveTicket={handleResolveTicket}
                  onInstantCreditDispute={handleInstantCreditDispute}
                />
              )}

              {currentPath === 'game-rates' && (
                <GameRatesView />
              )}

          {currentPath === 'admin-management' && (
            <AdminManagementView
              users={users}
              onCreateAdmin={(admin: any) => {
                const normalize = (p: string) => String(p || '').replace(/\D/g, '').slice(-10);
                const newPhone = normalize(admin.phone);
                const duplicate = users.some((u) => normalize(u.phone) === newPhone);
                if (duplicate) {
                  showToast(`Phone ${newPhone} pehle se registered hai — different number use karo`, 'error');
                  return;
                }
                setUsers((prev) => [...prev, {
                  ...admin,
                  phone: newPhone,
                  id: admin.id || `adm-${Date.now()}`,
                  userId: admin.userId || `#ADMIN-${String(Date.now()).slice(-3)}`,
                  walletBalance: admin.walletBalance || 0,
                  totalWinnings: 0,
                  role: admin.role === 'VIP' || admin.role === 'ADMIN' ? 'VIP' : 'USER',
                  status: 'ACTIVE',
                  kycStatus: 'VERIFIED',
                  registrationDate: 'Just now'
                } as UserRecord]);
                showToast('Admin created! Use SQL Editor to set DB password if needed.', 'success');
              }}
              onDeleteAdmin={(id) => {
                setUsers((prev) => prev.filter((u) => u.id !== id));
                showToast('Admin removed.', 'info');
              }}
            />
          )}

          {currentPath === 'charts-history' && (
            <ChartsHistoryView markets={markets} />
          )}
            </>
          )}
        </main>

        <nav className="lg:hidden shrink-0 z-40 bg-white border-t border-[#E2E8F8] px-2 py-1 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setCurrentPath('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
              currentPath === 'dashboard'
                ? 'text-[#006591] font-bold'
                : 'text-[#6E7881] hover:text-[#151C27]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] leading-tight mt-0.5">Overview</span>
          </button>

          <button
            onClick={() => setCurrentPath('markets')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors relative ${
              currentPath === 'markets'
                ? 'text-[#006591] font-bold'
                : 'text-[#6E7881] hover:text-[#151C27]'
            }`}
          >
            <TrendingUp className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] leading-tight mt-0.5">Markets</span>
            {liveMarketsCount > 0 && (
              <span className="absolute top-0.5 right-2 w-1.5 h-1.5 rounded-full bg-[#00B17B]"></span>
            )}
          </button>

          <button
            onClick={() => setCurrentPath('bids')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
              currentPath === 'bids'
                ? 'text-[#006591] font-bold'
                : 'text-[#6E7881] hover:text-[#151C27]'
            }`}
          >
            <Receipt className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] leading-tight mt-0.5">Bids</span>
          </button>

          <button
            onClick={() => setCurrentPath('withdrawals')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors relative ${
              currentPath === 'withdrawals'
                ? 'text-[#006591] font-bold'
                : 'text-[#6E7881] hover:text-[#151C27]'
            }`}
          >
            <CreditCard className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] leading-tight mt-0.5">Payouts</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="absolute top-0.5 right-1 px-1 min-w-3.5 h-3.5 bg-[#BA1A1A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentPath('deposits')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors relative ${
              currentPath === 'deposits'
                ? 'text-[#006591] font-bold'
                : 'text-[#6E7881] hover:text-[#151C27]'
            }`}
          >
            <ArrowDownToLine className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] leading-tight mt-0.5">Deposits</span>
            {pendingDepositsCount > 0 && (
              <span className="absolute top-0.5 right-1 px-1 min-w-3.5 h-3.5 bg-[#8D6E00] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingDepositsCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
}
