import React, { useState, useEffect } from 'react';
import { getGameRates, updateGameRate } from '../services/api';

export const GameRatesView: React.FC = () => {
  const [rates, setRates] = useState<Array<{ id: string; name: string; rate: string; payout: string; example: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calcStake, setCalcStake] = useState<number>(100);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadRates = async () => {
      try {
        const data = await getGameRates();
        setRates(data.map((r: any, idx: number) => ({
          id: r.id || r.gameType || `rate-${idx}-${Date.now()}`,
          name: r.name || r.gameType || 'Unknown',
          rate: String(r.rate || r.rateRange || '1:10'),
          payout: String(r.rate || r.rateRange || '10x'),
          example: `\u20B9100 -> \u20B9${(100 * (Number(String(r.rate).split(':')[1]) || Number(r.rate) || 10)).toLocaleString()}`
        })));
      } catch (err) {
        console.error('Failed to load game rates:', err);
        setRates([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadRates();
  }, []);

  const handleRateChange = (index: number, newRate: string) => {
    const updated = [...rates];
    updated[index].rate = newRate;
    setRates(updated);
  };

  const handleSave = async () => {
    setIsSaving(true); setSaveError('');
    try {
      const results = await Promise.allSettled(rates.map((r) => updateGameRate(r.id, r.rate)));
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length === 0) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        const any404 = failed.some((r: any) => String(r.reason?.message).includes('404'));
        if (any404) {
          setSaveError('Saved locally — backend update endpoint pending deployment (404).');
        } else {
          setSaveError(String((failed[0] as any).reason?.message || 'Failed to save'));
        }
      }
    } catch (err: any) {
      setSaveError(err.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Header card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F8] p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base text-[#151C27]">
                Game Payout Odds & Rate Multipliers
              </h2>
              <p className="text-[11px] sm:text-xs text-[#6E7881]">
                Global payout configurations across all active SATMAT boards
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {saveSuccess && (
                <span className="text-[11px] font-bold text-[#006C49] flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Rates Updated on server!
                </span>
              )}
              {saveError && (
                <span className="text-[11px] font-bold text-[#BA1A1A] max-w-[220px]">{saveError}</span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0EA5E9] hover:bg-[#0284c7] disabled:opacity-50 text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-xs flex items-center gap-1 transition-colors"
              >
                {isSaving ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-sm">save</span>}
                {isSaving ? 'Saving...' : 'Save Rate Rules'}
              </button>
            </div>
          </div>

          {/* Main Rates Table & Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left 2 Cols: Table */}
            <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F8] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[480px]">
                  <thead className="bg-[#F0F3FF] text-[#6E7881] font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F8]">
                    <tr>
                      <th className="py-2.5 px-3 sm:px-4">Game Type</th>
                      <th className="py-2.5 px-3 sm:px-4">Multiplier</th>
                      <th className="py-2.5 px-3 sm:px-4">Standard Ratio</th>
                      <th className="py-2.5 px-3 sm:px-4">Simulation (\u20B9100 Stake)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F8] text-[#151C27]">
                    {rates.map((item, idx) => {
                      return (
                        <tr key={idx} className="hover:bg-[#F9F9FF] transition-colors">
                          <td className="py-2.5 px-3 sm:px-4 font-bold text-xs text-[#151C27]">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 font-display font-bold text-xs text-[#006591]">
                            {item.payout}
                          </td>
                          <td className="py-2.5 px-3 sm:px-4">
                            <input
                              type="text"
                              value={item.rate}
                              onChange={(e) => handleRateChange(idx, e.target.value)}
                              className="w-24 px-2 py-0.5 bg-[#F0F3FF] font-code-tabular font-bold text-[11px] rounded-md border border-transparent focus:border-[#0EA5E9] outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 font-code-tabular font-semibold text-[11px] text-[#006C49]">
                            {item.example}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 1 Col: Payout Sandbox Calculator */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F8] shadow-xs p-3.5 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#E2E8F8]">
                <span className="p-1.5 rounded-lg bg-[#6FFBBE]/30 text-[#006C49]">
                  <span className="material-symbols-outlined text-base">calculate</span>
                </span>
                <div>
                  <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
                    PAYOUT SIMULATION SANDBOX
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#6E7881]">
                    Quick estimate based on wager stake
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                  Test Wager Amount (\u20B9)
                </label>
                <input
                  type="number"
                  value={calcStake}
                  onChange={(e) => setCalcStake(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 bg-[#F0F3FF] font-code-tabular font-bold text-xs text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] outline-none"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                {rates.length === 0 ? (
                  <div className="text-[11px] text-[#6E7881] text-center py-4">No rates loaded from server yet.</div>
                ) : (
                  rates.map((r) => {
                    const multStr = r.rate.includes(':') ? r.rate.split(':')[1] : r.rate;
                    const mult = Number(multStr) || 10;
                    return (
                      <div key={r.id} className="flex justify-between items-center p-2 rounded-lg bg-[#F0F3FF] text-[11px]">
                        <span className="font-medium text-[#3E4850]">{r.name} ({r.rate})</span>
                        <span className="font-bold text-[#006C49]">\u20B9{(calcStake * mult).toLocaleString()}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};