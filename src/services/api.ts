const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (import.meta as any).env?.VITE_API_URL ||
  'https://api.satmat.cloud/api/v1';

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export function getAccessToken(): string | null {
  if (_accessToken) return _accessToken;
  _accessToken = localStorage.getItem('admin_access_token');
  return _accessToken;
}

export function getRefreshToken(): string | null {
  if (_refreshToken) return _refreshToken;
  _refreshToken = localStorage.getItem('admin_refresh_token');
  return _refreshToken;
}

export function setTokens(access: string, refresh: string) {
  _accessToken = access;
  _refreshToken = refresh;
  localStorage.setItem('admin_access_token', access);
  localStorage.setItem('admin_refresh_token', refresh);
}

export function clearTokens() {
  _accessToken = null;
  _refreshToken = null;
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

async function tryRefreshToken(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// --- FAST CACHE + DEDUP + TIMEOUT layer ---
const _cache = new Map<string, { data: any; exp: number }>();
const _inflight = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 30_000;
const FETCH_TIMEOUT_MS = 10_000;

function _cacheKey(path: string, method: string) {
  return `${method}:${path}`;
}
export function clearApiCache(prefix?: string) {
  if (!prefix) _cache.clear();
  else for (const k of Array.from(_cache.keys())) if (k.includes(prefix)) _cache.delete(k);
}
export function warmupBackend() {
  // fire-and-forget to wake Render cold start, no auth
  fetch(`${API_BASE}/markets`, { method: 'GET', keepalive: true }).catch(() => {});
  fetch(`${API_BASE}/notices`, { method: 'GET', keepalive: true }).catch(() => {});
}
function _getCached<T>(key: string): T | null {
  const hit = _cache.get(key);
  if (hit && Date.now() < hit.exp) return hit.data as T;
  if (hit) _cache.delete(key);
  return null;
}
function _setCached(key: string, data: any, ttl = CACHE_TTL_MS) {
  _cache.set(key, { data, exp: Date.now() + ttl });
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { _skipCache?: boolean; _ttl?: number } = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const isCacheable = isGet && !path.includes('/auth/') && !options._skipCache;
  const key = _cacheKey(path, method);

  if (isCacheable) {
    const cached = _getCached<T>(key);
    if (cached !== null) return cached;
    const inflight = _inflight.get(key);
    if (inflight) return inflight as Promise<T>;
  }

  const exec = async (): Promise<T> => {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const { _skipCache, _ttl, ...fetchOpts } = options as any;

    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, { ...fetchOpts, headers, signal: controller.signal } as RequestInit);
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e?.name === 'AbortError') throw new Error(`Request timeout (${FETCH_TIMEOUT_MS / 1000}s) — backend cold start? Retrying...`);
      throw e;
    }
    clearTimeout(timeoutId);

    if (res.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const newToken = getAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        const c2 = new AbortController();
        const t2 = setTimeout(() => c2.abort(), FETCH_TIMEOUT_MS);
        try {
          res = await fetch(`${API_BASE}${path}`, { ...fetchOpts, headers, signal: c2.signal } as RequestInit);
        } finally { clearTimeout(t2); }
      } else {
        clearTokens();
      }
    }

    if (!res.ok) {
      let errorMsg = `API Error ${res.status}`;
      try {
        const errBody = await res.json();
        const rawMsg = errBody.message || errBody.error || errorMsg;
        if (Array.isArray(rawMsg)) {
          errorMsg = rawMsg.join(', ');
        } else if (typeof rawMsg === 'object' && rawMsg !== null) {
          errorMsg = JSON.stringify(rawMsg);
        } else {
          errorMsg = String(rawMsg);
        }
      } catch {}
      throw new Error(errorMsg);
    }

    if (res.status === 204) return undefined as T;
    const data = await res.json();
    if (isCacheable) _setCached(key, data, _ttl ?? CACHE_TTL_MS);
    return data as T;
  };

  if (isCacheable) {
    const p = exec().finally(() => _inflight.delete(key));
    _inflight.set(key, p);
    return p as Promise<T>;
  }
  return exec();
}

export async function apiGet<T = any>(path: string, opts?: { skipCache?: boolean; ttl?: number }): Promise<T> {
  return apiFetch<T>(path, { method: 'GET', _skipCache: opts?.skipCache, _ttl: opts?.ttl } as any);
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T = any>(path: string, body?: any): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE' });
}

// Auth APIs
export async function loginAdmin(phone: string, password: string) {
  const data = await apiPost<{ accessToken: string; refreshToken: string; user: any }>(
    '/auth/login',
    { phone, password }
  );
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logoutAdmin() {
  try {
    const rt = getRefreshToken();
    if (rt) {
      await apiPost('/auth/logout', { refreshToken: rt });
    } else {
      await apiPost('/auth/logout');
    }
  } catch {}
  clearTokens();
}

// Admin Dashboard
export async function getAdminDashboard() {
  return apiGet<{
    totalUsers: number;
    totalDeposits: number;
    totalWithdrawals: number;
    margin: number;
    pendingBidVolume: number;
  }>('/admin/dashboard');
}

// Admin Users
export async function getAdminUsers(params?: { search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiGet<{ items: any[]; total: number }>(`/admin/users?${qs.toString()}`);
}

// Admin Withdrawals
export async function getAdminWithdrawals(params?: { search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiGet<{ items: any[]; total: number }>(`/admin/withdrawals?${qs.toString()}`);
}

export async function settleWithdrawal(id: string, action: 'complete' | 'fail') {
  return apiPost<{ ok: boolean; id: string; status: string }>(`/admin/withdrawals/${id}/settle`, { action });
}

// Admin Bids — backend route is GET /admin/bets (see admin.controller.ts:221)
export async function getAdminBids(params?: { search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiGet<{ items: any[]; total: number }>(`/admin/bets?${qs.toString()}`);
}

// Markets (public)
export async function getMarkets() {
  return apiGet<any[]>('/markets');
}

export async function getMarketStatus(id: string) {
  return apiGet<any>(`/markets/${id}/status`);
}

// Admin Market operations
export async function updateMarketSchedule(id: string, data: { openTime?: string; closeTime?: string; timezone?: string; isActive?: boolean }) {
  return apiPatch<{ ok: boolean; market: any }>(`/admin/markets/${id}/schedule`, data);
}

export async function openCloseMarket(id: string, action: 'open' | 'close') {
  return apiPost<{ ok: boolean; isLive: boolean; isClosed: boolean }>(`/admin/markets/${id}/open-close`, { action });
}

export async function declareResult(id: string, data: { open: string; jodi: string; close: string; date?: string }) {
  return apiPost<{ ok: boolean; chart: any }>(`/admin/markets/${id}/result`, data);
}

// Notices (public)
export async function getNotices() {
  return apiGet<any[]>('/notices');
}

// Admin Notices
export async function createNotice(title: string, content: string, isImportant?: boolean) {
  return apiPost<any>('/admin/notices', { title, content, isImportant });
}

export async function deleteNotice(id: string) {
  return apiDelete<{ ok: boolean }>(`/admin/notices/${id}`);
}

// Wallet Adjust — amount is in RUPEES from UI, converted to paise for backend
export async function adjustWallet(data: { userId?: string; phone?: string; amount: number; direction: 'credit' | 'debit'; title?: string }) {
  const paise = Math.round(data.amount * 100);
  return apiPost<{ ok: boolean; userId: string; delta: number; balance: number }>('/admin/wallet/adjust', { ...data, amount: paise });
}

// Game Rates (public)
export async function getGameRates() {
  return apiGet<any[]>('/game-rates');
}

export async function updateGameRate(id: string, rateRange: string) {
  return apiPatch<any>(`/admin/game-rates/${id}`, { rateRange });
}

// Game Types (public)
export async function getGameTypes(market?: string) {
  const qs = market ? `?market=${encodeURIComponent(market)}` : '';
  return apiGet<any[]>(`/game-types${qs}`);
}

// Charts (public)
export async function getCharts(params: { market: string; startDate: string; endDate: string }) {
  const qs = new URLSearchParams(params).toString();
  return apiGet<any>(`/charts?${qs}`);
}

// Support Tickets
export async function createSupportTicket(subject: string, message: string) {
  return apiPost<{ ticketId: string }>('/support/tickets', { subject, message });
}

export async function getSupportTicketMessages(ticketId: string) {
  return apiGet<{ messages: any[] }>(`/support/tickets/${ticketId}/messages`);
}

export async function sendSupportMessage(ticketId: string, text: string) {
  return apiPost<any>(`/support/chat/messages?ticketId=${ticketId}`, { text });
}

export async function getAdminSupportTickets(params?: { search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString();
  return apiGet<{ items: any[]; total: number }>(`/admin/support/tickets${q ? `?${q}` : ''}`);
}

export async function replySupportAsAdmin(ticketId: string, text: string) {
  return apiPost<any>(`/admin/support/tickets/${ticketId}/reply`, { text });
}

export async function resolveSupportTicket(ticketId: string) {
  return apiPatch<any>(`/admin/support/tickets/${ticketId}/resolve`);
}

// Admin Deposits (wallet transactions)
export async function getAdminDeposits(params?: { search?: string; page?: number; limit?: number; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  const q = qs.toString();
  return apiGet<{ items: any[]; total: number }>(`/admin/deposits${q ? `?${q}` : ''}`);
}

export async function settleDeposit(id: string, action: 'approve' | 'reject', reason?: string) {
  return apiPost<any>(`/admin/deposits/${id}/settle`, { action, reason });
}

// Admin Users ban
export async function setUserStatus(id: string, isActive: boolean) {
  return apiPatch<any>(`/admin/users/${id}/status`, { isActive });
}

// Orders (user-scoped, but useful)
export async function getOrders(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return apiGet<{ items: any[]; total: number }>(`/orders?${qs.toString()}`);
}

// Auth me
export async function getMe() {
  return apiGet<any>('/auth/me');
}
