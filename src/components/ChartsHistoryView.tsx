import React, { useState, useEffect } from 'react';
import { Market } from '../types';
import { getCharts } from '../services/api';

interface ChartsHistoryViewProps {
  markets: Market[];
}

export const ChartsHistoryView: React.FC<ChartsHistoryViewProps> = ({ markets }) => {
  const [selectedMarketId, setSelectedMarketId] = useState<string>(markets[0]?.id || '');
  const [chartType, setChartType] = useState<'PANEL' | 'JODI'>('PANEL');
  const [historyRows, setHistoryRows] = useState<Array<{ date: string; openPana: string; jodi: string; closePana: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];

  useEffect(() => {
    if (markets.length && !selectedMarketId) {
      setSelectedMarketId(markets[0].id);
    }
  }, [markets, selectedMarketId]);

  useEffect(() => {
    if (!currentMarket) {
      setHistoryRows([]);
      return;
    }
    const fetchCharts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const today = new Date();
        const endDate = today.toISOString().slice(0, 10);
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        const startDate = start.toISOString().slice(0, 10);
        const data = await getCharts({ market: currentMarket.id, startDate, endDate });
        // API may return { items: [...] } or [...] or { charts: [...] }
        let rows: any[] = [];
        if (Array.isArray(data)) rows = data;
        else if (Array.isArray((data as any)?.items)) rows = (data as any).items;
        else if (Array.isArray((data as any)?.charts)) rows = (data as any).charts;
        else if (Array.isArray((data as any)?.data)) rows = (data as any).data;

        const mapped = rows.map((r: any) => ({
          date: r.date || r.day || r.createdAt || '--',
          openPana: r.openPana || r.open || r.openResult || '--',
          jodi: r.jodi || r.pair || r.result?.jodi || '--',
          closePana: r.closePana || r.close || r.closeResult || '--',
        }));
        setHistoryRows(mapped);
      } catch (err: any) {
        setError(err.message || 'Failed to load chart history');
        setHistoryRows([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharts();
  }, [currentMarket]);

  if (markets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F8] p-8 text-center text-xs text-[#6E7881]">
        No markets configured. Charts will appear once markets are available from API.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F8] p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-sm sm:text-base text-[#151C27]">
            Historical Panel & Jodi Records
          </h2>
          <p className="text-[11px] sm:text-xs text-[#6E7881]">
            Archived result matrices for chart pattern analysis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedMarketId}
            onChange={(e) => setSelectedMarketId(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F0F3FF] text-[11px] font-bold text-[#151C27] rounded-xl border-none outline-none"
          >
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <div className="flex bg-[#F0F3FF] p-0.5 rounded-lg text-[11px]">
            <button
              onClick={() => setChartType('PANEL')}
              className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                chartType === 'PANEL'
                  ? 'bg-white text-[#006591] shadow-xs'
                  : 'text-[#6E7881]'
              }`}
            >
              Panel Chart
            </button>
            <button
              onClick={() => setChartType('JODI')}
              className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                chartType === 'JODI'
                  ? 'bg-white text-[#006591] shadow-xs'
                  : 'text-[#6E7881]'
              }`}
            >
              Jodi Chart
            </button>
          </div>
        </div>
      </div>

      {/* Chart Presentation Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F8] shadow-xs overflow-hidden">
        <div className="p-3 sm:p-4 bg-[#F0F3FF] border-b border-[#E2E8F8] flex justify-between items-center text-xs">
          <span className="font-display font-bold text-xs sm:text-sm text-[#006591]">
            {currentMarket?.name} - Weekly Panel Records
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#6E7881] font-code-tabular">
            Session: {currentMarket?.sessionType || '--'}
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-10 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-xs text-[#6E7881]">Loading chart history from server...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-[#BA1A1A]">{error}</div>
          ) : historyRows.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#6E7881]">
              No chart history available for {currentMarket?.name}. Results will appear here once declared via API.
            </div>
          ) : (
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-white text-[#6E7881] font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F8]">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Date / Day</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Open Pana</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Jodi (Pair)</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Close Pana</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Complete Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F8] text-[#151C27]">
              {historyRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F9F9FF] transition-colors">
                  <td className="py-2.5 px-3 sm:px-4 font-semibold text-xs text-[#3E4850]">
                    {row.date}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-code-tabular font-bold text-xs text-[#0EA5E9]">
                    {row.openPana}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-code-tabular font-bold text-sm text-[#006591]">
                    {row.jodi}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-code-tabular font-bold text-xs text-[#0EA5E9]">
                    {row.closePana}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center">
                    <span className="font-code-tabular font-bold text-xs px-2.5 py-0.5 rounded-md bg-[#F0F3FF] text-[#151C27]">
                      {row.openPana}-{row.jodi}-{row.closePana}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};
