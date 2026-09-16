import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  CreditCard,
  ArrowDownToLine,
  Users,
  ShieldCheck,
  Megaphone,
  Headphones,
  Calculator,
  BarChart3,
  LogOut,
  X,
  BadgeCheck,
  Zap,
  UserCircle
} from 'lucide-react';
import { NavigationPath } from '../types';

interface SidebarProps {
  currentPath: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
  pendingWithdrawalsCount: number;
  pendingDepositsCount?: number;
  openDisputesCount: number;
  liveMarketsCount: number;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  pendingWithdrawalsCount,
  pendingDepositsCount = 0,
  openDisputesCount,
  liveMarketsCount,
  onLogout,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const navItems: {
    id: NavigationPath;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'markets', label: 'Live Markets & Schedule', icon: TrendingUp, badge: liveMarketsCount, badgeColor: 'bg-[#C9E6FF] text-[#001E2F]' },
    { id: 'bids', label: 'Live Bids Ledger', icon: Receipt, badge: 'LIVE', badgeColor: 'bg-[#006C49] text-white' },
    { id: 'deposits', label: 'User Deposits & Top-ups', icon: ArrowDownToLine, badge: pendingDepositsCount > 0 ? pendingDepositsCount : undefined, badgeColor: 'bg-[#FFE082]/80 text-[#8D6E00]' },
    { id: 'withdrawals', label: 'Disbursement Queue', icon: CreditCard, badge: pendingWithdrawalsCount, badgeColor: 'bg-[#FFDAD6] text-[#93000A]' },
    { id: 'users', label: 'Player User Directory', icon: Users },
    { id: 'admin-management', label: 'Employee / Admin Management', icon: ShieldCheck, badgeColor: 'bg-[#F3E8FF] text-[#7E22CE]' },
    { id: 'notices', label: 'Announcements & Push', icon: Megaphone },
    { id: 'support', label: 'Support & Disputes', icon: Headphones, badge: openDisputesCount, badgeColor: 'bg-[#FFDAD6] text-[#BA1A1A]' },
    { id: 'game-rates', label: 'Game Payout Rates', icon: Calculator },
    { id: 'charts-history', label: 'Panel & Jodi Charts', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-[#FFFFFF] border-r border-[#E2E8F8] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E2E8F8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0EA5E9] to-[#006591] flex items-center justify-center text-white shadow-xs">
              <Zap className="w-4 h-4 fill-current stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-display font-bold text-sm tracking-tight text-[#151C27]">
                  SATMAT
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-[#0EA5E9]/15 text-[#006591]">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-[#6E7881] font-medium tracking-wide uppercase">
                Risk & Settlement Desk
              </p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#6E7881] hover:bg-[#F0F3FF] transition-colors"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          <div className="px-2.5 pb-1 text-[9px] font-bold text-[#6E7881] uppercase tracking-wider">
            Main Controls
          </div>
          {navItems.map((item) => {
            const isActive = currentPath === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0EA5E9] text-white shadow-xs font-semibold'
                    : 'text-[#3E4850] hover:bg-[#F0F3FF] hover:text-[#151C27]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white stroke-[2.2]' : 'text-[#6E7881] stroke-[1.8]'
                    }`}
                  />
                  <span className="text-xs">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : item.badgeColor || 'bg-[#E7EEFE] text-[#006591]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Admin Operator Profile & Status Footer */}
        <div className="p-2.5 border-t border-[#E2E8F8] bg-[#F9F9FF]/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E2E8F8]">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#006591] flex items-center justify-center text-white">
                  <UserCircle className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#00B17B] border-2 border-white rounded-full"></span>
              </div>
              <div className="text-left">
                <div className="text-[11px] font-semibold text-[#151C27] flex items-center gap-1">
                  Administrator
                  <BadgeCheck className="w-3.5 h-3.5 text-[#006591] stroke-[2]" />
                </div>
                <div className="text-[9px] text-[#6E7881]">Admin Portal</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#6E7881] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/40 transition-colors"
            >
              <LogOut className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
          <div className="mt-1.5 text-center text-[9px] text-[#6E7881]">
            SATMAT Admin Portal
          </div>
        </div>
      </aside>
    </>
  );
};
