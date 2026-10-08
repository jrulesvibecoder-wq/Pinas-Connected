import React from 'react';
import { 
  Users, 
  CreditCard, 
  FileText, 
  LifeBuoy, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  Clock, 
  Plus, 
  DollarSign,
  Send,
  Building,
  Calendar,
  Sparkles,
  Wrench,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Client, Invoice, Quotation, Ticket, Employee, DashboardMetrics } from '../types';

interface CrmDashboardProps {
  metrics: DashboardMetrics;
  clients: Client[];
  invoices: Invoice[];
  quotations: Quotation[];
  tickets: Ticket[];
  employees?: Employee[];
  onNavigateTab: (tab: 'dashboard' | 'clients' | 'billing' | 'quotations' | 'tickets' | 'employees' | 'banking') => void;
  onOpenNewClient: () => void;
  onOpenNewInvoice: () => void;
  onOpenNewQuote: () => void;
  onOpenNewTicket: () => void;
  onOpenNewEmployee?: () => void;
}

export const CrmDashboard: React.FC<CrmDashboardProps> = ({
  metrics,
  clients,
  invoices,
  quotations,
  tickets,
  employees = [],
  onNavigateTab,
  onOpenNewClient,
  onOpenNewInvoice,
  onOpenNewQuote,
  onOpenNewTicket,
  onOpenNewEmployee,
}) => {
  // Recent Unpaid or Overdue Invoices
  const urgentInvoices = invoices.filter((i) => i.status === 'overdue' || i.status === 'unpaid').slice(0, 5);
  // Urgent Tickets
  const urgentTickets = tickets.filter((t) => t.status === 'open' || t.status === 'dispatched').slice(0, 5);
  // Recent Quotations
  const recentQuotes = quotations.slice(0, 4);

  const activeTechnicians = employees.filter((e) => e.role === 'technician' && e.active).length;
  const dispatchedTicketsCount = tickets.filter((t) => t.status === 'dispatched').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ISP Telecom CRM Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Billing, Quotations & Field Service Central
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Manage your subscribers, issue professional billing, dispatch linemen & field technicians, and collect GCash & DBP payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewClient}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Client</span>
          </button>
          <button
            onClick={onOpenNewInvoice}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
          <button
            onClick={onOpenNewQuote}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>New Quote</span>
          </button>
          <button
            onClick={onOpenNewTicket}
            className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Dispatch Ticket</span>
          </button>
          <button
            onClick={onOpenNewEmployee || (() => onNavigateTab('employees'))}
            className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Monthly Recurring Revenue */}
        <div 
          onClick={() => onNavigateTab('billing')}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Monthly MRR</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            ₱{metrics.monthlyRecurringRevenue.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            <span>Collected: <strong className="text-emerald-400 font-mono">₱{metrics.collectedThisMonth.toLocaleString()}</strong></span>
            <span className="text-slate-500 group-hover:text-emerald-400 flex items-center">View <ArrowUpRight className="w-3 h-3 ml-0.5" /></span>
          </div>
        </div>

        {/* Metric 2: Active Clients */}
        <div 
          onClick={() => onNavigateTab('clients')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 sm:p-5 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Subscribers</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {metrics.activeClients} <span className="text-xs font-normal text-slate-400">/ {metrics.totalClients}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            <span>Overdue: <strong className={metrics.overdueClients > 0 ? 'text-amber-400' : 'text-slate-400'}>{metrics.overdueClients}</strong></span>
            <span className="text-slate-500 group-hover:text-cyan-400 flex items-center">Directory <ArrowUpRight className="w-3 h-3 ml-0.5" /></span>
          </div>
        </div>

        {/* Metric 3: Open Trouble Tickets */}
        <div 
          onClick={() => onNavigateTab('tickets')}
          className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-4 sm:p-5 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Tickets</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {metrics.openTickets}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            <span>Critical: <strong className={metrics.criticalTickets > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{metrics.criticalTickets}</strong></span>
            <span className="text-slate-500 group-hover:text-rose-400 flex items-center">Queue <ArrowUpRight className="w-3 h-3 ml-0.5" /></span>
          </div>
        </div>

        {/* Metric 4: Quotations & Pipelines */}
        <div 
          onClick={() => onNavigateTab('quotations')}
          className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Quotes Pipeline</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {metrics.activeQuotations} <span className="text-xs font-normal text-slate-400">Pending</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            <span>Accepted: <strong className="text-indigo-400 font-mono">₱{metrics.acceptedQuotationsValue.toLocaleString()}</strong></span>
            <span className="text-slate-500 group-hover:text-indigo-400 flex items-center">Proposals <ArrowUpRight className="w-3 h-3 ml-0.5" /></span>
          </div>
        </div>

        {/* Metric 5: Team & Technicians Crew */}
        <div 
          onClick={() => onNavigateTab('employees')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 transition cursor-pointer group shadow-sm col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Team & Crew</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {employees.length} <span className="text-xs font-normal text-slate-400">Members</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            <span>Dispatched: <strong className={dispatchedTicketsCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{dispatchedTicketsCount}</strong></span>
            <span className="text-slate-500 group-hover:text-amber-400 flex items-center">Team <ArrowUpRight className="w-3 h-3 ml-0.5" /></span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Billing Collections & Support Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Outstanding Invoices & Due Payments */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Pending Collections & Due Invoices</h2>
            </div>
            <button
              onClick={() => onNavigateTab('billing')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
            >
              View All Invoices →
            </button>
          </div>

          {urgentInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
              All invoices for this cycle are settled! No overdue balances.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {urgentInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate flex items-center space-x-1.5">
                      <span>{inv.clientName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({inv.invoiceNumber})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {inv.servicePlan} · Due {inv.dueDate}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center space-x-3">
                    <div>
                      <div className="font-bold text-white font-mono">₱{inv.amount.toLocaleString()}</div>
                      <span className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        inv.status === 'overdue' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigateTab('billing')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer"
                    >
                      Receive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Live Support & Field Tickets */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LifeBuoy className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white">Active Trouble & Service Tickets</h2>
            </div>
            <button
              onClick={() => onNavigateTab('tickets')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
            >
              Ticket Queue →
            </button>
          </div>

          {urgentTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
              Zero open trouble tickets! All subscriber lines operational.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {urgentTickets.map((t) => (
                <div key={t.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        t.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' :
                        t.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {t.priority}
                      </span>
                      <span className="font-semibold text-white truncate">{t.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                      <span>👤 {t.clientName}</span>
                      <span>·</span>
                      <span>👷 {t.assignedTechnician}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab('tickets')}
                    className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quotations Pipeline Showcase */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Active Proposals & Installation Quotations</h2>
          </div>
          <button
            onClick={() => onNavigateTab('quotations')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
          >
            All Quotations →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentQuotes.map((q) => (
            <div key={q.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white flex items-center space-x-2">
                  <span>{q.recipientName}</span>
                  {q.companyName && <span className="text-[11px] text-slate-400">({q.companyName})</span>}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{q.projectTitle}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{q.quoteNumber} · Valid for {q.validDays} days</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-white font-mono text-sm">₱{q.totalInitial.toLocaleString()}</div>
                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded uppercase mt-0.5 ${
                  q.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  q.status === 'sent' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {q.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
