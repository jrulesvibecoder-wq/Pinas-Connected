import React from 'react';
import { 
  Building, 
  Users, 
  CreditCard, 
  FileText, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Send,
  UserCheck,
  Wrench,
  Crown
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentTab: 'dashboard' | 'clients' | 'billing' | 'quotations' | 'tickets' | 'employees';
  setCurrentTab: (tab: 'dashboard' | 'clients' | 'billing' | 'quotations' | 'tickets' | 'employees') => void;
  currentUser: User | null;
  onOpenSettings: () => void;
  onLogout: () => void;
  openTicketsCount: number;
  overdueInvoicesCount: number;
  employeesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenSettings,
  onLogout,
  openTicketsCount,
  overdueInvoicesCount,
  employeesCount = 0,
}) => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-sm tracking-wider">
            PC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-base tracking-tight">PINAS CONNECTED</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                CRM
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>ADMIN PANEL</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs font-medium">
              {currentUser?.companyName || 'Telecom Billing & Quotations CRM'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setCurrentTab('clients')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer ${
              currentTab === 'clients'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Subscribers</span>
          </button>

          <button
            onClick={() => setCurrentTab('billing')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer relative ${
              currentTab === 'billing'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Billing & Invoices</span>
            {overdueInvoicesCount > 0 && (
              <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {overdueInvoicesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('quotations')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer ${
              currentTab === 'quotations'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Quotations</span>
          </button>

          <button
            onClick={() => setCurrentTab('tickets')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer relative ${
              currentTab === 'tickets'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Trouble Tickets</span>
            {openTicketsCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                {openTicketsCount}
              </span>
            )}
          </button>

          {/* Dedicated Employee & Team Management Tab */}
          <button
            onClick={() => setCurrentTab('employees')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer relative ${
              currentTab === 'employees'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Team & Staff</span>
            {employeesCount > 0 && (
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {employeesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Settings & Banking Modal Trigger */}
          <button
            onClick={onOpenSettings}
            title="Configure DBP, GCash & Settings"
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-700/60"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">DBP & Banking</span>
          </button>

          {/* User profile / Logout */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="text-right">
              <div className="flex items-center space-x-1.5 justify-end">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {currentUser?.name || 'Administrator'}
                </span>
                <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-extrabold tracking-wide uppercase">
                  <span>👑 ADMIN</span>
                </span>
              </div>
              <div className="text-[10px] text-cyan-400 font-mono truncate max-w-[140px]">
                {currentUser?.companyName || 'ISP Owner'}
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center justify-around bg-slate-950/95 border-t border-slate-800 py-2 px-1 text-[11px] font-semibold overflow-x-auto">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`px-2 py-1 rounded-lg shrink-0 ${currentTab === 'dashboard' ? 'text-cyan-400 font-bold bg-slate-800' : 'text-slate-400'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setCurrentTab('clients')}
          className={`px-2 py-1 rounded-lg shrink-0 ${currentTab === 'clients' ? 'text-cyan-400 font-bold bg-slate-800' : 'text-slate-400'}`}
        >
          Clients
        </button>
        <button
          onClick={() => setCurrentTab('billing')}
          className={`px-2 py-1 rounded-lg shrink-0 ${currentTab === 'billing' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'}`}
        >
          Billing {overdueInvoicesCount > 0 && `(${overdueInvoicesCount})`}
        </button>
        <button
          onClick={() => setCurrentTab('quotations')}
          className={`px-2 py-1 rounded-lg shrink-0 ${currentTab === 'quotations' ? 'text-indigo-400 font-bold bg-slate-800' : 'text-slate-400'}`}
        >
          Quotes
        </button>
        <button
          onClick={() => setCurrentTab('tickets')}
          className={`px-2 py-1 rounded-lg shrink-0 ${currentTab === 'tickets' ? 'text-rose-400 font-bold bg-slate-800' : 'text-slate-400'}`}
        >
          Tickets {openTicketsCount > 0 && `(${openTicketsCount})`}
        </button>
        <button
          onClick={() => setCurrentTab('employees')}
          className={`px-2 py-1 rounded-lg shrink-0 flex items-center space-x-1 ${currentTab === 'employees' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400'}`}
        >
          <span>👷 Team</span>
          {employeesCount > 0 && <span className="text-[10px]">({employeesCount})</span>}
        </button>
      </div>
    </header>
  );
};
