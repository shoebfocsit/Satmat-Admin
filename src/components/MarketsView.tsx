import React, { useState } from 'react';
import { Market } from '../types';

interface MarketsViewProps {
  markets: Market[];
  onUpdateMarket: (updatedMarket: Market) => void;
  onOpenClose?: (id: string, action: 'open' | 'close') => Promise<void>;
  onDeclareResult?: (id: string, result: { open: string; jodi: string; close: string; date?: string }) => Promise<any>;
  onAddNewMarket?: () => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({
  markets,
  onUpdateMarket,
  onOpenClose,
  onDeclareResult
}) => {
  const [selectedDrawerMarket, setSelectedDrawerMarket] = useState<Market | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LIVE' | 'INTERMISSION' | 'CLOSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drawer form state
  const [editName, setEditName] = useState<string>('');
  const [editOpenTime, setEditOpenTime] = useState<string>('');
  const [editCloseTime, setEditCloseTime] = useState<string>('');
  const [editCutoffTime, setEditCutoffTime] = useState<string>('');
  const [editMaxExposure, setEditMaxExposure] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'LIVE' | 'CLOSED' | 'INTERMISSION'>('LIVE');
  const [editDays, setEditDays] = useState<string[]>([]);
  // Declare result modal
  const [declareMarket, setDeclareMarket] = useState<Market | null>(null);
  const [declareOpen, setDeclareOpen] = useState('');
  const [declareJodi, setDeclareJodi] = useState('');
  const [declareClose, setDeclareClose] = useState('');
  const [declareDate, setDeclareDate] = useState('');
  const [declareLoading, setDeclareLoading] = useState(false);
  const [declareError, setDeclareError] = useState('');

  const handleOpenDrawer = (market: Market) => {
    setSelectedDrawerMarket(market);
    setEditName(market.name);
    setEditOpenTime(market.openTime);
    setEditCloseTime(market.closeTime);
    setEditCutoffTime(market.cutoffTime || '15 mins');
    setEditMaxExposure(market.maxExposure || '25,00,000');
    setEditStatus(market.status);
    setEditDays(market.activeDays || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']);
  };

  const handleSaveDrawer = () => {
    if (!selectedDrawerMarket) return;
    const updated: Market = {
      ...selectedDrawerMarket,
      name: editName,
      openTime: editOpenTime,
      closeTime: editCloseTime,
      cutoffTime: editCutoffTime,
      maxExposure: editMaxExposure,
      status: editStatus,
      activeDays: editDays
    };
    onUpdateMarket(updated);
    setSelectedDrawerMarket(null);
  };

  const toggleDay = (day: string) => {
    if (editDays.includes(day)) {
      setEditDays(editDays.filter((d) => d !== day));
    } else {
      setEditDays([...editDays, day]);
    }
  };

  const allDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const filteredMarkets = markets.filter((m) => {
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.code.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const liveCount = markets.filter((m) => m.status === 'LIVE').length;
  const intermissionCount = markets.filter((m) => m.status === 'INTERMISSION').length;
  const closedCount = markets.filter((m) => m.status === 'CLOSED').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span>Total Active Markets</span>
            <span className="p-1 rounded-md bg-[#E7EEFE] text-[#006591]">
              <span className="material-symbols-outlined text-sm sm:text-base">candlestick_chart</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#151C27] tracking-tight">
            {markets.length} Boards
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881] flex items-center gap-1.5 flex-wrap">
            <span className="text-[#006C49] font-bold">{liveCount} Live</span> •
            <span className="text-[#8D6E00] font-bold">{intermissionCount} Intermission</span> •
            <span>{closedCount} Closed</span>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span>Live Coverage</span>
            <span className="p-1 rounded-md bg-[#6FFBBE]/30 text-[#006C49]">
              <span className="material-symbols-outlined text-sm sm:text-base">trending_up</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#006C49] tracking-tight">
            {markets.length} Markets
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881]">
            {liveCount} live • {closedCount} closed • {intermissionCount} intermission
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E2E8F8] shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#6E7881]">
            <span>Operational Schedule</span>
            <span className="p-1 rounded-md bg-[#F0F3FF] text-[#00B17B]">
              <span className="material-symbols-outlined text-sm sm:text-base">verified</span>
            </span>
          </div>
          <div className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#006591] tracking-tight">
            {markets.length > 0 ? `${liveCount}/${markets.length} Live` : '—'}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[#6E7881]">
            {markets.length > 0 ? 'Live status from server' : 'No market data yet'}
          </div>
        </div>
      </div>

      {/* Main Markets Table Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F8] shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3 sm:p-4 border-b border-[#E2E8F8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-1 bg-[#F0F3FF] p-1 rounded-xl overflow-x-auto text-[11px]">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-white text-[#151C27] shadow-xs'
                  : 'text-[#6E7881] hover:text-[#151C27]'
              }`}
            >
              All ({markets.length})
            </button>
            <button
              onClick={() => setFilterStatus('LIVE')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                filterStatus === 'LIVE'
                  ? 'bg-white text-[#006C49] shadow-xs'
                  : 'text-[#6E7881] hover:text-[#151C27]'
              }`}
            >
              Live ({liveCount})
            </button>
            <button
              onClick={() => setFilterStatus('INTERMISSION')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                filterStatus === 'INTERMISSION'
                  ? 'bg-white text-[#8D6E00] shadow-xs'
                  : 'text-[#6E7881] hover:text-[#151C27]'
              }`}
            >
              Intermission ({intermissionCount})
            </button>
            <button
              onClick={() => setFilterStatus('CLOSED')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                filterStatus === 'CLOSED'
                  ? 'bg-white text-[#565E74] shadow-xs'
                  : 'text-[#6E7881] hover:text-[#151C27]'
              }`}
            >
              Closed ({closedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#6E7881]">
                search
              </span>
              <input
                type="text"
                placeholder="Search market or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F0F3FF] text-[11px] text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[580px]">
            <thead className="bg-[#F0F3FF] text-[#6E7881] font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F8]">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Market / Code</th>
                <th className="py-2.5 px-3 sm:px-4">Open Time</th>
                <th className="py-2.5 px-3 sm:px-4">Close Time</th>
                <th className="py-2.5 px-3 sm:px-4">Current Matrix</th>
                <th className="py-2.5 px-3 sm:px-4">Active Days</th>
                <th className="py-2.5 px-3 sm:px-4">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F8] text-[#151C27]">
              {filteredMarkets.map((market) => {
                const isLive = market.status === 'LIVE';
                const isIntermission = market.status === 'INTERMISSION';

                return (
                  <tr
                    key={market.id}
                    className="hover:bg-[#F9F9FF] transition-colors"
                  >
                    <td className="py-2.5 px-3 sm:px-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#E7EEFE] text-[#006591] font-bold text-[11px] flex items-center justify-center font-display shrink-0">
                          {market.shortCode}
                        </span>
                        <div>
                          <div className="font-bold text-[#151C27] text-xs font-display">
                            {market.name}
                          </div>
                          <div className="text-[10px] text-[#6E7881] font-code-tabular">
                            {market.code} • {market.sessionType}
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
                      <div className="flex items-center gap-0.5">
                        {(market.activeDays || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']).map((day) => (
                          <span
                            key={day}
                            className="px-1 py-0.2 rounded text-[8px] font-bold bg-[#F0F3FF] text-[#6E7881]"
                          >
                            {day.charAt(0)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#6FFBBE]/40 text-[#006C49]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006C49] animate-ping"></span>
                          LIVE
                        </span>
                      ) : isIntermission ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFE082]/60 text-[#8D6E00]">
                          INTERMISSION
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E2E8F8] text-[#565E74]">
                          CLOSED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDrawer(market)}
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-[#F0F3FF] text-[#006591] hover:bg-[#E7EEFE] transition-colors inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">edit_calendar</span>
                          <span>Edit</span>
                        </button>
                        {onOpenClose && (
                          <>
                            <button
                              onClick={() => onOpenClose(market.id, 'open')}
                              className="px-1.5 py-1 rounded-lg text-[10px] font-bold bg-[#6FFBBE]/30 text-[#006C49] hover:bg-[#6FFBBE]/50 transition-colors"
                              title="Open market"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => onOpenClose(market.id, 'close')}
                              className="px-1.5 py-1 rounded-lg text-[10px] font-bold bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#ffb4ab] transition-colors"
                              title="Close market"
                            >
                              Close
                            </button>
                          </>
                        )}
                        {onDeclareResult && (
                          <button
                            onClick={() => { setDeclareMarket(market); setDeclareOpen(''); setDeclareJodi(''); setDeclareClose(''); setDeclareDate(new Date().toISOString().slice(0,10)); setDeclareError(''); }}
                            className="px-1.5 py-1 rounded-lg text-[10px] font-bold bg-[#0EA5E9] text-white hover:bg-[#0284c7] transition-colors"
                            title="Declare result & settle"
                          >
                            Result
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Declare Result Modal */}
      {declareMarket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-[#E2E8F8] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F8]">
              <div>
                <h3 className="font-display font-bold text-sm text-[#151C27]">Declare Result — {declareMarket.name}</h3>
                <p className="text-[10px] text-[#6E7881]">{declareMarket.code} • settlement is atomic</p>
              </div>
              <button onClick={() => setDeclareMarket(null)} className="p-1 rounded-lg text-[#6E7881] hover:bg-[#F0F3FF]"><span className="material-symbols-outlined text-lg">close</span></button>
            </div>
            {declareError && <div className="p-2 rounded-lg bg-[#FFDAD6] text-[#BA1A1A] text-[11px] font-semibold">{declareError}</div>}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#3E4850] mb-1">Open (3-digit)</label>
                <input value={declareOpen} onChange={(e) => setDeclareOpen(e.target.value.replace(/\D/g,'').slice(0,3))} placeholder="128" className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-xs font-code-tabular font-bold rounded-xl border border-transparent focus:border-[#0EA5E9] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#3E4850] mb-1">Jodi (2-digit)</label>
                <input value={declareJodi} onChange={(e) => setDeclareJodi(e.target.value.replace(/\D/g,'').slice(0,2))} placeholder="47" className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-xs font-code-tabular font-bold rounded-xl border border-transparent focus:border-[#0EA5E9] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#3E4850] mb-1">Close (3-digit)</label>
                <input value={declareClose} onChange={(e) => setDeclareClose(e.target.value.replace(/\D/g,'').slice(0,3))} placeholder="460" className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-xs font-code-tabular font-bold rounded-xl border border-transparent focus:border-[#0EA5E9] outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#3E4850] mb-1">Date (IST)</label>
              <input type="date" value={declareDate} onChange={(e) => setDeclareDate(e.target.value)} className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-xs rounded-xl border border-transparent focus:border-[#0EA5E9] outline-none" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setDeclareMarket(null)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#6E7881] hover:bg-[#F0F3FF]">Cancel</button>
              <button
                disabled={declareLoading || !/^\d{3}$/.test(declareOpen) || !/^\d{2}$/.test(declareJodi) || !/^\d{3}$/.test(declareClose)}
                onClick={async () => {
                  if (!declareMarket || !onDeclareResult) return;
                  if (!/^\d{3}$/.test(declareOpen) || !/^\d{2}$/.test(declareJodi) || !/^\d{3}$/.test(declareClose)) { setDeclareError('Open/Close must be 3 digits, Jodi 2 digits'); return; }
                  setDeclareLoading(true); setDeclareError('');
                  try { await onDeclareResult(declareMarket.id, { open: declareOpen, jodi: declareJodi, close: declareClose, date: declareDate || undefined }); setDeclareMarket(null); } catch (e: any) { setDeclareError(e.message || 'Failed to declare'); } finally { setDeclareLoading(false); }
                }}
                className="px-4 py-1.5 rounded-lg text-[11px] font-bold bg-[#006C49] text-white hover:bg-[#005237] disabled:opacity-50 flex items-center gap-1.5"
              >
                {declareLoading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                Declare & Settle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in Side Drawer: Edit Market Schedule */}
      {selectedDrawerMarket && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in"
            onClick={() => setSelectedDrawerMarket(null)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md bg-white z-50 shadow-2xl border-l border-[#E2E8F8] p-4 sm:p-5 overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F8]">
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-[#151C27]">
                  Edit Market Schedule
                </h3>
                <p className="text-[10px] text-[#6E7881]">
                  {selectedDrawerMarket.name} ({selectedDrawerMarket.code})
                </p>
              </div>
              <button
                onClick={() => setSelectedDrawerMarket(null)}
                className="p-1.5 rounded-lg text-[#6E7881] hover:bg-[#F0F3FF]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                Market Status
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['LIVE', 'INTERMISSION', 'CLOSED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                      editStatus === st
                        ? 'border-[#0EA5E9] bg-[#F0F3FF] text-[#006591]'
                        : 'border-[#E2E8F8] text-[#6E7881] hover:bg-[#F9F9FF]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                Market Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#F0F3FF] text-[11px] font-semibold text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
              />
            </div>

            {/* Timers Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                  Open Time
                </label>
                <input
                  type="text"
                  value={editOpenTime}
                  onChange={(e) => setEditOpenTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-[11px] font-code-tabular font-semibold text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                  Close Time
                </label>
                <input
                  type="text"
                  value={editCloseTime}
                  onChange={(e) => setEditCloseTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-[11px] font-code-tabular font-semibold text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Cutoff & Exposure */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                  Result Cutoff Buffer
                </label>
                <input
                  type="text"
                  value={editCutoffTime}
                  onChange={(e) => setEditCutoffTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-[11px] font-code-tabular font-semibold text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                  Max Risk Exposure
                </label>
                <input
                  type="text"
                  value={editMaxExposure}
                  onChange={(e) => setEditMaxExposure(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-[11px] font-semibold text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Active Days Toggle */}
            <div>
              <label className="block text-[11px] font-bold text-[#3E4850] mb-1.5">
                Active Operational Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allDays.map((day) => {
                  const isSelected = editDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isSelected
                          ? 'bg-[#006591] text-white shadow-xs'
                          : 'bg-[#F0F3FF] text-[#6E7881] hover:bg-[#E7EEFE]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-3 border-t border-[#E2E8F8] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedDrawerMarket(null)}
                className="px-3 py-1.5 text-[11px] font-bold text-[#6E7881] hover:bg-[#F0F3FF] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDrawer}
                className="px-4 py-1.5 text-[11px] font-bold bg-[#0EA5E9] text-white hover:bg-[#0284c7] rounded-lg shadow-xs"
              >
                Save Schedule Changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
