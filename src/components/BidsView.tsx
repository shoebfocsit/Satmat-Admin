import React, { useState } from 'react';
import { BidRecord } from '../types';

interface BidsViewProps {
  bids: BidRecord[];
}

export const BidsView: React.FC<BidsViewProps> = ({ bids }) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WON' | 'PENDING' | 'LOST'>('ALL');
  const [gameTypeFilter, setGameTypeFilter] = useState<string>('ALL');
  const [marketFilter, setMarketFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected slip for modal
  const [selectedSlip, setSelectedSlip] = useState<BidRecord | null>(null);

  const filteredBids = bids.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (gameTypeFilter !== 'ALL' && b.gameType !== gameTypeFilter) return false;
    if (marketFilter !== 'ALL' && !b.market.toLowerCase().includes(marketFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesBid = b.bidId.toLowerCase().includes(q);
      const matchesName = b.playerName.toLowerCase().includes(q);
      const matchesNum = b.pickedNumber.toLowerCase().includes(q);
      if (!matchesBid && !matchesName && !matchesNum) return false;
    }
    return true;
  });

  const wonCount = bids.filter((b) => b.status === 'WON').length;
  const pendingCount = bids.filter((b) => b.status === 'PENDING').length;
  const lostCount = bids.filter((b) => b.status === 'LOST').length;

  const totalInFlight = bids
    .filter((b) => b.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalWonPayout = bids
    .filter((b) => b.status === 'WON' && b.potentialPayout)
    .reduce((acc, curr) => acc + (curr.potentialPayout || 0), 0);
  const totalVolume = bids.reduce((acc, curr) => acc + curr.amount, 0);

  const getGameTypeColor = (type: string) => {
    switch (type) {
      case 'JODI':
        return 'bg-[#E7EEFE] text-[#006591]';
      case 'TRIPLE PATTI':
        return 'bg-[#F3E8FF] text-[#7E22CE]';
      case 'HALF SANGAM':
      case 'FULL SANGAM':
        return 'bg-[#DCFCE7] text-[#15803D]';
      case 'ANK':
        return 'bg-[#FEF3C7] text-[#B45309]';
      case 'SINGLE PATTI':
      case 'DOUBLE PATTI':
        return 'bg-[#E0F2FE] text-[#0369A1]';
      default:
        return 'bg-[#F0F3FF] text-[#3E4850]';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">In Flight</span>
            <span className="p-1 rounded-md bg-[#E7EEFE] text-[#0EA5E9] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">receipt_long</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#006591] tracking-tight">
            ₹{totalInFlight.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            {pendingCount} active wagers
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Settled Payouts</span>
            <span className="p-1 rounded-md bg-[#6FFBBE]/30 text-[#006C49] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">verified</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#006C49] tracking-tight">
            {totalWonPayout > 0 ? `₹${totalWonPayout.toLocaleString()}` : '—'}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            {wonCount} won • {totalVolume > 0 ? `${Math.round((totalWonPayout / totalVolume) * 100)}% of volume` : 'no volume yet'}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Total Volume</span>
            <span className="p-1 rounded-md bg-[#F0F3FF] text-[#006591] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">account_balance</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#151C27] tracking-tight">
            {totalVolume > 0 ? `₹${totalVolume.toLocaleString()}` : '—'}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            {bids.length} total bids
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span className="truncate">Peak Pending</span>
            <span className="p-1 rounded-md bg-[#FFDAD6] text-[#BA1A1A] shrink-0">
              <span className="material-symbols-outlined text-sm sm:text-base">warning</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#BA1A1A] tracking-tight">
            {(() => { const pb = bids.filter(b=>b.status==='PENDING'); return pb.length ? `₹${Math.max(...pb.map(b=>b.amount)).toLocaleString()}` : '—'; })()}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] truncate">
            {pendingCount} pending • ₹{totalInFlight.toLocaleString()} exposure
          </div>
        </div>
      </div>

      {/* Main Table Card */}
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
                All ({bids.length})
              </button>
              <button
                onClick={() => setStatusFilter('WON')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'WON'
                    ? 'bg-white text-[#006C49] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                Won ({wonCount})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'PENDING'
                    ? 'bg-white text-[#006591] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('LOST')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'LOST'
                    ? 'bg-white text-[#565E74] shadow-xs'
                    : 'text-[#6E7881] hover:text-[#151C27]'
                }`}
              >
                Lost ({lostCount})
              </button>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <select
                value={gameTypeFilter}
                onChange={(e) => setGameTypeFilter(e.target.value)}
                className="px-2 py-1 bg-[#F0F3FF] text-[11px] font-semibold text-[#151C27] rounded-lg border-none outline-none"
              >
                <option value="ALL">All Games</option>
                <option value="JODI">JODI</option>
                <option value="ANK">ANK</option>
                <option value="SINGLE PATTI">SINGLE PATTI</option>
                <option value="DOUBLE PATTI">DOUBLE PATTI</option>
                <option value="TRIPLE PATTI">TRIPLE PATTI</option>
                <option value="HALF SANGAM">HALF SANGAM</option>
              </select>

              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="px-2 py-1 bg-[#F0F3FF] text-[11px] font-semibold text-[#151C27] rounded-lg border-none outline-none"
              >
                <option value="ALL">All Markets</option>
                <option value="Kalyan">Kalyan</option>
                <option value="Milan">Milan</option>
                <option value="Rajdhani">Rajdhani</option>
                <option value="Time Bazar">Time Bazar</option>
                <option value="Supreme">Supreme</option>
              </select>
            </div>
          </div>

          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#6E7881]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by BID ID, player name, or picked number..."
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
                <th className="py-2.5 px-3 sm:px-4">Bid ID</th>
                <th className="py-2.5 px-3 sm:px-4">Player Details</th>
                <th className="py-2.5 px-3 sm:px-4">Market</th>
                <th className="py-2.5 px-3 sm:px-4">Game</th>
                <th className="py-2.5 px-3 sm:px-4">Picked</th>
                <th className="py-2.5 px-3 sm:px-4">Wager</th>
                <th className="py-2.5 px-3 sm:px-4">Payout</th>
                <th className="py-2.5 px-3 sm:px-4">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F8] text-[#151C27]">
              {filteredBids.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#6E7881]">
                    No bids found. Live bids from API will appear here.
                  </td>
                </tr>
              ) : (
                filteredBids.map((bid) => {
                const isWon = bid.status === 'WON';
                const isPending = bid.status === 'PENDING';

                return (
                  <tr
                    key={bid.id}
                    className="hover:bg-[#F9F9FF] transition-colors"
                  >
                    <td className="py-2.5 px-3 sm:px-4 font-code-tabular font-bold text-[#006591] text-[11px]">
                      {bid.bidId}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-semibold">
                      <div className="font-bold text-[#151C27] text-xs">{bid.playerName}</div>
                      <div className="text-[10px] text-[#6E7881] font-code-tabular">
                        {bid.playerPhone}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-medium text-[#3E4850] text-[11px]">
                      {bid.market}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${getGameTypeColor(
                          bid.gameType
                        )}`}
                      >
                        {bid.gameType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-code-tabular font-bold text-xs text-[#0EA5E9]">
                      {bid.pickedNumber}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-display font-bold text-xs text-[#151C27]">
                      ₹{bid.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-display font-bold text-xs">
                      {isWon ? (
                        <span className="text-[#006C49]">
                          ₹{(bid.potentialPayout || 0).toLocaleString()}
                        </span>
                      ) : isPending ? (
                        <span className="text-[#006591]">
                          ₹{(bid.potentialPayout || 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[#6E7881] font-normal">--</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      {isWon ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#6FFBBE]/40 text-[#006C49]">
                          WON
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E7EEFE] text-[#006591]">
                          PENDING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E2E8F8] text-[#565E74]">
                          LOST
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <button
                        onClick={() => setSelectedSlip(bid)}
                        className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#F0F3FF] text-[#006591] hover:bg-[#E7EEFE] transition-colors inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">receipt</span>
                        Slip
                      </button>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Digital Bet Slip */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-[#E2E8F8] space-y-3 relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-3 right-3 text-[#6E7881] hover:text-[#151C27] p-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Slip Branding */}
            <div className="text-center pt-1">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#006591] text-white shadow-xs mb-1.5">
                <span className="material-symbols-outlined text-base">casino</span>
              </div>
              <h4 className="font-display font-bold text-sm text-[#151C27] tracking-tight">
                DIGITAL BET SLIP
              </h4>
              <p className="text-[9px] uppercase tracking-widest text-[#6E7881] font-semibold">
                SATMAT SECURE LEDGER NODE
              </p>
            </div>

            {/* Dashed separator */}
            <div className="border-b border-dashed border-[#BEC8D2] my-1.5"></div>

            {/* Ticket Information */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#6E7881]">Ticket ID:</span>
                <span className="font-code-tabular font-bold text-[#006591]">
                  {selectedSlip.bidId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7881]">Player:</span>
                <span className="font-bold text-[#151C27]">
                  {selectedSlip.playerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7881]">Market Session:</span>
                <span className="font-semibold text-[#151C27]">
                  {selectedSlip.market}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7881]">Game Mode:</span>
                <span className="font-bold text-[#006591]">
                  {selectedSlip.gameType}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 bg-[#F0F3FF] px-2 rounded-lg">
                <span className="font-bold text-[#6E7881]">Picked Number:</span>
                <span className="font-code-tabular font-bold text-sm text-[#0EA5E9]">
                  {selectedSlip.pickedNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7881]">Wager Stake:</span>
                <span className="font-bold text-[#151C27]">
                  ₹{selectedSlip.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7881]">Outcome Status:</span>
                <span className="font-bold text-[#006C49]">
                  {selectedSlip.status}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold border-t border-[#E2E8F8] pt-1.5">
                <span>Potential Payout:</span>
                <span className="text-[#006C49] font-display">
                  ₹{(selectedSlip.potentialPayout || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="pt-1 flex flex-col items-center">
              <div className="h-8 w-full flex items-center justify-center gap-1 overflow-hidden opacity-75">
                {[4, 2, 6, 2, 8, 3, 2, 5, 2, 4, 3, 7, 2, 4, 2, 5, 3, 2, 6, 4, 2, 3].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-[#151C27] h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <div className="text-[9px] font-code-tabular text-[#6E7881] mt-1 tracking-widest">
                SATMAT-SEC-{selectedSlip.bidId}-VERIFIED
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border border-[#E2E8F8] hover:bg-[#F0F3FF] text-[#3E4850] flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">print</span>
                Print
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-[#0EA5E9] hover:bg-[#0284c7] text-white"
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
