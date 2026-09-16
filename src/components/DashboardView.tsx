import React from 'react';
import {
  Wallet,
  Receipt,
  CreditCard,
  Landmark,
  Users,
  ArrowRight,
  SlidersHorizontal,
  Activity
} from 'lucide-react';
import { Market, BidRecord, WithdrawalRequest, UserRecord } from '../types';

interface DashboardViewProps {
  markets: Market[];
  bids: BidRecord[];
  withdrawals?: WithdrawalRequest[];
  users?: UserRecord[];
  dashboardStats?: { totalUsers: number; totalDeposits: number; totalWithdrawals: number; margin: number; pendingBidVolume: number } | null;
  pendingWithdrawalsCount: number;
  onNavigate: (path: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  markets,
  bids,
  withdrawals = [],
  users = [],
  dashboardStats,
  pendingWithdrawalsCount,
  onNavigate
}) => {
  const totalBidsVolume = bids.reduce((acc, b) => acc + (b.amount || 0), 0);
  const pendingBids = bids.filter((b) => b.status === 'PENDING');
  const totalPendingExposure = pendingBids.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalPendingWithdrawalAmount = withdrawals.filter((w) => w.status === 'PENDING').reduce((acc, w) => acc + (w.amount || 0), 0);
  const clearedBids = bids.filter((b) => b.status !== 'PENDING');
  const clearedVolume = clearedBids.reduce((acc, b) => acc + (b.amount || 0), 0);
  const clearedPct = totalBidsVolume > 0 ? Math.round((clearedVolume / totalBidsVolume) * 100) : 0;

  const activeUsersCount = dashboardStats?.totalUsers ?? users.length;
  const activeUsersOnline = users.filter((u) => u.status === 'ACTIVE').length;
  const maxJodiExposure = pendingBids.length ? Math.max(...pendingBids.map((b) => b.amount || 0)) : 0;
  const escrowBuffer = dashboardStats?.totalDeposits ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 5 KPI Cards Row: 2-col on mobile, 5-col on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* Card 1 */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-[#E2E8F8] shadow-xs hover:border-[#0EA5E9] transition-all">
          <div className="flex items-center justify-between text-[#6E7881] text-[10px] sm:text-xs font-semibold">
            <span className="truncate">Total Bids Volume</span>
            <span className="p-1 rounded-md bg-[#F0F3FF] text-[#006591] shrink-0">
              <Wallet className="w-4 h-4 stroke-[1.8]" />
            </span>
          </div>
          <div className="mt-1.5 font-display text-sm sm:text-lg font-bold text-[#151C27] tracking-tight">
            {totalBidsVolume > 0 ? `₹${totalBidsVolume.toLocaleString()}` : '—'}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-[#6E7881]">
            <span>{bids.length} total bids</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-[#E2E8F8] shadow-xs hover:border-[#0EA5E9] transition-all">
          <div className="flex items-center justify-between text-[#6E7881] text-[10px] sm:text-xs font-semibold">
            <span className="truncate">Live Active Bets</span>
            <span className="p-1 rounded-md bg-[#E7EEFE] text-[#0EA5E9] shrink-0">
              <Receipt className="w-4 h-4 stroke-[1.8]" />
            </span>
          </div>
          <div className="mt-1.5 font-display text-sm sm:text-lg font-bold text-[#151C27] tracking-tight">
            {pendingBids.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-[#6E7881]">
            <span className="text-[#0EA5E9] font-bold">{totalPendingExposure > 0 ? `₹${totalPendingExposure.toLocaleString()}` : '—'}</span>
            <span className="truncate">exposure</span>
          </div>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => onNavigate('withdrawals')}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-[#E2E8F8] shadow-xs hover:border-[#BA1A1A] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#6E7881] text-[10px] sm:text-xs font-semibold">
            <span className="truncate">Pending Payouts</span>
            <span className="p-1 rounded-md bg-[#FFDAD6] text-[#BA1A1A] shrink-0">
              <CreditCard className="w-4 h-4 stroke-[1.8]" />
            </span>
          </div>
          <div className="mt-1.5 font-display text-sm sm:text-lg font-bold text-[#BA1A1A] tracking-tight">
            {pendingWithdrawalsCount} Requests
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-[#6E7881]">
            <span className="text-[#BA1A1A] font-bold">{totalPendingWithdrawalAmount > 0 ? `₹${totalPendingWithdrawalAmount.toLocaleString()}` : '—'}</span>
            <span className="truncate">in queue</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-[#E2E8F8] shadow-xs hover:border-[#006C49] transition-all">
          <div className="flex items-center justify-between text-[#6E7881] text-[10px] sm:text-xs font-semibold">
            <span className="truncate">House Margin</span>
            <span className="p-1 rounded-md bg-[#6FFBBE]/30 text-[#006C49] shrink-0">
              <Landmark className="w-4 h-4 stroke-[1.8]" />
            </span>
          </div>
          <div className="mt-1.5 font-display text-sm sm:text-lg font-bold text-[#006C49] tracking-tight">
            {dashboardStats?.margin != null ? `${dashboardStats.margin}%` : '—'}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-[#6E7881]">
            <span className="truncate">{dashboardStats ? 'from dashboard' : 'no data yet'}</span>
          </div>
        </div>

        {/* Card 5 */}
        <div
          onClick={() => onNavigate('users')}
          className="col-span-2 sm:col-span-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-[#E2E8F8] shadow-xs hover:border-[#0EA5E9] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#6E7881] text-[10px] sm:text-xs font-semibold">
            <span className="truncate">Active Players</span>
            <span className="p-1 rounded-md bg-[#F0F3FF] text-[#006591] shrink-0">
              <Users className="w-4 h-4 stroke-[1.8]" />
            </span>
          </div>
          <div className="mt-1.5 font-display text-sm sm:text-lg font-bold text-[#151C27] tracking-tight">
            {activeUsersCount > 0 ? activeUsersCount.toLocaleString() : '—'}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B17B]"></span>
            <span className="text-[#006C49] font-bold">{activeUsersOnline}</span>
            <span className="text-[#6E7881]">active</span>
          </div>
        </div>
      </div>

      {/* Main Live Market Board Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F8] shadow-xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-[#E2E8F8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00B17B] animate-pulse"></div>
            <div>
              <h2 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
                LIVE MARKET BOARD
              </h2>
              <p className="text-[10px] text-[#6E7881]">
                Real-time open & close panel states and live session matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('markets')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg text-[#006591] bg-[#E7EEFE]/60 hover:bg-[#E7EEFE] transition-colors"
            >
              <span>Manage All ({markets.length})</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          {markets.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#6E7881]">
              No markets available. Data will appear once markets are configured via API.
            </div>
          ) : (
          <table className="w-full text-left text-xs min-w-[560px] sm:min-w-0">
            <thead className="bg-[#F0F3FF] text-[#6E7881] font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F8]">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Market / Session</th>
                <th className="py-2.5 px-3 sm:px-4">Open Time</th>
                <th className="py-2.5 px-3 sm:px-4">Close Time</th>
                <th className="py-2.5 px-3 sm:px-4">Result Matrix</th>
                <th className="py-2.5 px-3 sm:px-4">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F8] text-[#151C27]">
              {markets.slice(0, 6).map((market) => {
                const isLive = market.status === 'LIVE';
                const isIntermission = market.status === 'INTERMISSION';
                return (
                  <tr
                    key={market.id}
                    className="hover:bg-[#F9F9FF] transition-colors"
                  >
                    <td className="py-2.5 px-3 sm:px-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#E7EEFE] text-[#006591] font-bold text-[11px] flex items-center justify-center font-display shrink-0">
                          {market.shortCode}
                        </span>
                        <div>
                          <div className="font-bold text-[#151C27] text-xs font-display">
                            {market.name}
                          </div>
                          <div className="text-[10px] text-[#6E7881]">
                            {market.sessionType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-code-tabular font-medium text-[11px] text-[#3E4850]">
                      {market.openTime}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-code-tabular font-medium text-[11px] text-[#3E4850]">
                      {market.closeTime}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      <span className="font-code-tabular font-bold text-xs tracking-wider px-2 py-0.5 rounded bg-[#F0F3FF] border border-[#E2E8F8] text-[#006591]">
                        {market.resultMatrix}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#6FFBBE]/40 text-[#006C49]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006C49] animate-ping"></span>
                          LIVE
                        </span>
                      ) : isIntermission ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FFE082]/60 text-[#8D6E00]">
                          INTERMISSION
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E2E8F8] text-[#565E74]">
                          CLOSED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <button
                        onClick={() => onNavigate('markets')}
                        className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#F0F3FF] text-[#3E4850] hover:bg-[#E7EEFE] hover:text-[#006591] transition-colors inline-flex items-center gap-1"
                        title="Configure Schedule"
                      >
                        <SlidersHorizontal className="w-3 h-3 stroke-[1.8]" />
                        <span>Schedule</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Two Columns: Live Bids Stream & Daily Settlement Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Live Bids Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F8] shadow-xs p-3.5 sm:p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F8]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0EA5E9] stroke-[2]" />
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
                  LIVE BIDS STREAM (REAL-TIME)
                </h3>
                <p className="text-[10px] text-[#6E7881]">
                  Incoming wager intake across active markets
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('bids')}
              className="text-[11px] font-bold text-[#006591] hover:underline flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3 h-3 stroke-[2]" />
            </button>
          </div>

          <div className="mt-2.5 divide-y divide-[#E2E8F8]">
            {bids.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6E7881]">No bids yet. Live bids will appear here from API.</div>
            ) : (
              bids.slice(0, 5).map((bid) => (
              <div
                key={bid.id}
                className="py-2.5 flex items-center justify-between gap-2 sm:gap-3 hover:bg-[#F9F9FF] px-1 sm:px-2 rounded-xl transition-colors text-xs"
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#E7EEFE] text-[#006591] flex items-center justify-center font-bold text-[11px] font-display shrink-0">
                    {bid.playerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-[11px] text-[#151C27] truncate">
                        {bid.playerName}
                      </span>
                      <span className="text-[9px] text-[#6E7881] font-code-tabular shrink-0">
                        {bid.bidId}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#6E7881] truncate">
                      {bid.market} • <span className="font-semibold text-[#006591]">{bid.gameType}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-code-tabular font-bold text-[11px] text-[#151C27]">
                    Picked: <span className="px-1 py-0.2 rounded bg-[#F0F3FF] text-[#006591]">{bid.pickedNumber}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-[#3E4850] mt-0.5">
                    ₹{bid.amount.toLocaleString()}
                  </div>
                </div>

                <div className="shrink-0">
                  {bid.status === 'WON' ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#6FFBBE]/40 text-[#006C49]">
                      WON ₹{(bid.potentialPayout || 0).toLocaleString()}
                    </span>
                  ) : bid.status === 'PENDING' ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#C9E6FF] text-[#001E2F]">
                      PENDING
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E2E8F8] text-[#565E74]">
                      LOST
                    </span>
                  )}
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Settlement Progress & Risk */}
        <div className="space-y-4">
          {/* Settlement Progress */}
          <div className="bg-white rounded-2xl border border-[#E2E8F8] shadow-xs p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
                DAILY SETTLEMENT
              </h3>
              <span className="text-[10px] font-bold text-[#006C49] bg-[#6FFBBE]/30 px-1.5 py-0.2 rounded-full">
                {clearedPct}% Cleared
              </span>
            </div>
            <div className="w-full bg-[#E2E8F8] h-2 rounded-full overflow-hidden">
              <div className="bg-[#00B17B] h-full rounded-full transition-all duration-500" style={{ width: `${clearedPct}%` }}></div>
            </div>
            <div className="mt-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#6E7881]">
                <span>Cleared Volume:</span>
                <span className="font-semibold text-[#151C27]">{clearedVolume > 0 ? `₹${clearedVolume.toLocaleString()}` : '—'}</span>
              </div>
              <div className="flex justify-between text-[#6E7881]">
                <span>Pending Clearing:</span>
                <span className="font-semibold text-[#BA1A1A]">{totalPendingExposure > 0 ? `₹${totalPendingExposure.toLocaleString()}` : '—'}</span>
              </div>
              <div className="flex justify-between text-[#6E7881]">
                <span>Total Bids:</span>
                <span className="font-semibold text-[#151C27]">{bids.length} records</span>
              </div>
            </div>
          </div>

          {/* House Risk & Exposure Buffer */}
          <div className="bg-white rounded-2xl border border-[#E2E8F8] shadow-xs p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
                HOUSE EXPOSURE MONITOR
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#00B17B] animate-pulse"></span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#F0F3FF]">
                <span className="text-[#6E7881]">Max Pending Wager</span>
                <span className="font-code-tabular font-bold text-[#151C27]">{maxJodiExposure > 0 ? `₹${maxJodiExposure.toLocaleString()}` : '—'}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#F0F3FF]">
                <span className="text-[#6E7881]">Total Deposits</span>
                <span className="font-code-tabular font-bold text-[#006C49]">{escrowBuffer > 0 ? `₹${escrowBuffer.toLocaleString()}` : '—'}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#F0F3FF]">
                <span className="text-[#6E7881]">Live Markets</span>
                <span className="font-code-tabular font-bold text-[#006591]">{markets.filter((m) => m.status === 'LIVE').length} live</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('bids')}
              className="mt-3 w-full py-1.5 text-center text-[11px] font-bold text-[#006591] bg-[#E7EEFE] hover:bg-[#c9e6ff] rounded-lg transition-colors"
            >
              Inspect Active Wagers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
