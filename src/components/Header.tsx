import React, { useState, useEffect } from 'react';
import { Menu, Search, X, Clock, Bell, RefreshCw } from 'lucide-react';
import { NavigationPath } from '../types';

interface HeaderProps {
  currentPath: NavigationPath;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  notificationCount: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const titlesByPath: Record<NavigationPath, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Operations Dashboard',
    subtitle: 'Gaming Risk Management & Settlement Desk'
  },
  markets: {
    title: 'Live Markets & Schedule',
    subtitle: 'Real-time session clearing, open/close cutoff and automated schedule'
  },
  bids: {
    title: 'Live Bids Ledger',
    subtitle: 'Real-time wager intake, house exposure, and game ticket inspection'
  },
  deposits: {
    title: 'User Deposits & Wallet Credits',
    subtitle: 'Incoming player funds, UTR reconciliation, and manual approvals'
  },
  withdrawals: {
    title: 'Withdrawal Disbursements',
    subtitle: 'Player payout verification, UPI / Bank IMPS processing queue'
  },
  users: {
    title: 'Player User Directory',
    subtitle: 'KYC compliance, wallet ledgers, wagering histories, account locks'
  },
  notices: {
    title: 'Announcements & Push Desk',
    subtitle: 'Targeted in-app banners, critical maintenance alerts, payout banners'
  },
  broadcast: {
    title: 'Announcements & Push Desk',
    subtitle: 'Targeted in-app banners, critical maintenance alerts, payout banners'
  },
  support: {
    title: 'Support & Disputes Desk',
    subtitle: 'Player ticket arbitration, deposit reconciliation and live chat'
  },
  'game-rates': {
    title: 'Game Payout Rates',
    subtitle: 'Configured betting odds, single ank, jodi, patti multipliers'
  },
  'charts-history': {
    title: 'Panel & Jodi Charts History',
    subtitle: 'Historical market records, open-close panels and jodi distribution'
  },
  'admin-management': {
    title: 'Admin Management',
    subtitle: 'Employee permissions and panel access control'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  notificationCount,
  onRefresh,
  isRefreshing
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const headerInfo = titlesByPath[currentPath] || titlesByPath.dashboard;

  return (
    <header className="shrink-0 z-30 bg-[#FFFFFF] border-b border-[#E2E8F8] px-3 sm:px-4 lg:px-6 py-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Trigger */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#3E4850] hover:bg-[#F0F3FF] transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Center: Screen Title & Subtitle */}
        <div className="flex-1 flex flex-col items-center justify-center text-center min-w-0 px-1 sm:px-2">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 max-w-full">
            <h1 id="navbar-screen-title" className="font-display font-bold text-base sm:text-lg md:text-xl text-[#151C27] tracking-tight truncate text-center">
              {headerInfo.title}
            </h1>
            <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E7EEFE] text-[#006591] border border-[#C9E6FF] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B17B] animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p className="hidden md:block text-xs text-[#6E7881] font-medium truncate text-center">
            {headerInfo.subtitle}
          </p>
        </div>

        {/* Right: Search, Live Clock & Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Button toggle (<sm) */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="sm:hidden p-2 rounded-lg border border-[#E2E8F8] bg-white text-[#3E4850] hover:bg-[#F0F3FF]"
            title="Search records"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Desktop Search input (>=sm) */}
          <div className="relative hidden sm:block w-44 md:w-56 lg:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7881] stroke-[1.8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search records, #BIDs..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#F0F3FF] hover:bg-[#E7EEFE]/60 focus:bg-white text-[11px] text-[#151C27] placeholder-[#6E7881] rounded-xl border border-transparent focus:border-[#0EA5E9] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6E7881] hover:text-[#151C27]"
              >
                <X className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            )}
          </div>

          {/* Live IST clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F0F3FF] border border-[#E2E8F8]">
            <Clock className="w-3.5 h-3.5 text-[#00B17B] stroke-[2]" />
            <span className="font-code-tabular text-[11px] font-semibold text-[#151C27]">
              {currentTime || '14:15:00 IST'}
            </span>
          </div>

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-[#E2E8F8] bg-white hover:bg-[#F0F3FF] text-[#3E4850] disabled:opacity-50 transition-colors"
              title="Refresh data (bypass cache)"
            >
              <RefreshCw className={`w-4 h-4 stroke-[2] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl border border-[#E2E8F8] bg-white hover:bg-[#F0F3FF] text-[#3E4850] relative transition-colors"
              title="Alerts & Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 bg-[#BA1A1A] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-72 max-w-xs bg-white rounded-2xl shadow-xl border border-[#E2E8F8] p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F8]">
                  <span className="font-display font-bold text-xs text-[#151C27]">
                    Desk Alerts ({notificationCount})
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-[#006591] font-semibold hover:underline"
                  >
                    Close
                  </button>
                </div>
                <div className="py-1.5 space-y-1.5 max-h-64 overflow-y-auto">
                  {notificationCount > 0 ? (
                    <div className="p-2 rounded-xl bg-[#F0F3FF] text-[11px]">
                      <div className="font-semibold text-[#151C27] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A]"></span>
                        Pending Actions
                      </div>
                      <div className="text-[10px] text-[#6E7881] mt-0.5">
                        {notificationCount} items require admin attention
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-[11px] text-[#6E7881]">No pending alerts. All queues clear.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Mobile Search row */}
      {showMobileSearch && (
        <div className="sm:hidden relative w-full pt-1 pb-0.5 animate-in fade-in slide-in-from-top-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7881] stroke-[1.8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records, #BIDs, users..."
            autoFocus
            className="w-full pl-8 pr-7 py-1.5 bg-[#F0F3FF] text-[11px] text-[#151C27] placeholder-[#6E7881] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6E7881]"
            >
              <X className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          ) : (
            <button
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#006591]"
            >
              Done
            </button>
          )}
        </div>
      )}
    </header>
  );
};
