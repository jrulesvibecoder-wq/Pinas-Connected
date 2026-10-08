import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  CrmDashboard 
} from './components/CrmDashboard';
import { 
  ClientManager 
} from './components/ClientManager';
import { 
  BillingInvoiceManager 
} from './components/BillingInvoiceManager';
import { 
  QuotationManager 
} from './components/QuotationManager';
import { 
  TicketServiceManager 
} from './components/TicketServiceManager';
import { 
  BankingSettingsModal 
} from './components/BankingSettingsModal';
import { 
  LandingAuthView 
} from './components/LandingAuthView';
import { 
  EmployeeManager 
} from './components/EmployeeManager';
import { 
  User, 
  Client, 
  Invoice, 
  Quotation, 
  Ticket, 
  Employee,
  BankingPortalConfig, 
  AppSettings, 
  DashboardMetrics 
} from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'clients' | 'billing' | 'quotations' | 'tickets' | 'employees'>('dashboard');
  
  // Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ticketEmployeeFilter, setTicketEmployeeFilter] = useState<string>('all');
  const [bankingPortal, setBankingPortal] = useState<BankingPortalConfig>({
    companyName: 'Pinas Connected Telecom Solutions',
    companyAddress: 'Metro Manila / Provincial Operations Center, Philippines',
    companyContact: '+63 917 888 2026',
    companyEmail: 'billing@pinasconnected.ph',
    termsNote: 'Please include your Account Number (e.g., CLI-1001) or Invoice Number in your GCash / DBP payment reference.',
    bankAccounts: [],
    walletAccounts: [],
  });
  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'Pinas Connected Telecom Solutions',
    companyAddress: 'Metro Manila / Provincial Operations Center, Philippines',
    companyPhone: '+63 917 888 2026',
    companyEmail: 'support@pinasconnected.ph',
    telegramToken: '',
    telegramChatId: '',
    currencySymbol: '₱',
    defaultBillingDueDay: 15,
    telegramAlertsEnabled: true,
  });
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClients: 0,
    activeClients: 0,
    overdueClients: 0,
    monthlyRecurringRevenue: 0,
    collectedThisMonth: 0,
    unpaidReceivables: 0,
    openTickets: 0,
    criticalTickets: 0,
    activeQuotations: 0,
    acceptedQuotationsValue: 0,
  });

  // Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Show Toast Helper
  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all CRM data
  const fetchData = async () => {
    try {
      const [cliRes, invRes, quoRes, tckRes, empRes, bnkRes, setRes, metRes] = await Promise.all([
        fetch('/api/clients').then((r) => r.json()),
        fetch('/api/invoices').then((r) => r.json()),
        fetch('/api/quotations').then((r) => r.json()),
        fetch('/api/tickets').then((r) => r.json()),
        fetch('/api/employees').then((r) => r.json()),
        fetch('/api/banking').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/dashboard/metrics').then((r) => r.json()),
      ]);

      if (cliRes.clients) setClients(cliRes.clients);
      if (invRes.invoices) setInvoices(invRes.invoices);
      if (quoRes.quotations) setQuotations(quoRes.quotations);
      if (tckRes.tickets) setTickets(tckRes.tickets);
      if (empRes.employees) setEmployees(empRes.employees);
      if (bnkRes.bankingPortal) setBankingPortal(bnkRes.bankingPortal);
      if (setRes.settings) setSettings(setRes.settings);
      if (metRes.metrics) setMetrics(metRes.metrics);
    } catch (e: any) {
      console.error('Failed to fetch CRM data:', e);
    }
  };

  // Initial load & stored session check
  useEffect(() => {
    const savedUser = localStorage.getItem('pinas_crm_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('pinas_crm_user');
      }
    }
    fetchData();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('pinas_crm_user', JSON.stringify(user));
    fetchData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pinas_crm_user');
    showToast('Signed out of CRM.', 'info');
  };

  const handleUpdateBanking = async (updated: BankingPortalConfig) => {
    const res = await fetch('/api/banking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (data.success) {
      setBankingPortal(data.bankingPortal);
    }
  };

  const handleUpdateSettings = async (updated: Partial<AppSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (data.success) {
      setSettings(data.settings);
    }
  };

  // If not logged in, show CRM Landing and Sign In
  if (!currentUser) {
    return (
      <LandingAuthView
        onLoginSuccess={handleLoginSuccess}
        onExploreDemo={() => {
          handleLoginSuccess({
            id: 'user-demo',
            email: 'admin@ptppulse.local',
            name: 'Demo Admin',
            companyName: 'Pinas Connected Demo HQ',
            role: 'admin',
            status: 'active',
            trialEndsAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          });
        }}
        showToast={showToast}
      />
    );
  }

  const openTicketsCount = tickets.filter((t) => t.status === 'open' || t.status === 'dispatched').length;
  const overdueInvoicesCount = invoices.filter((i) => i.status === 'overdue').length;

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60' :
            toast.type === 'alert' ? 'bg-rose-950/90 text-rose-200 border-rose-700/60' :
            'bg-slate-900/90 text-cyan-200 border-slate-700'
          }`}>
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
        openTicketsCount={openTicketsCount}
        overdueInvoicesCount={overdueInvoicesCount}
        employeesCount={employees.length}
      />

      {/* Main Application Views */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: CRM Overview Dashboard */}
        {currentTab === 'dashboard' && (
          <CrmDashboard
            metrics={metrics}
            clients={clients}
            invoices={invoices}
            quotations={quotations}
            tickets={tickets}
            employees={employees}
            onNavigateTab={(tab) => {
              if (tab === 'banking') {
                setIsSettingsModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenNewClient={() => setCurrentTab('clients')}
            onOpenNewInvoice={() => setCurrentTab('billing')}
            onOpenNewQuote={() => setCurrentTab('quotations')}
            onOpenNewTicket={() => setCurrentTab('tickets')}
            onOpenNewEmployee={() => setCurrentTab('employees')}
          />
        )}

        {/* Tab 2: Subscriber & Client Directory */}
        {currentTab === 'clients' && (
          <ClientManager
            clients={clients}
            invoices={invoices}
            tickets={tickets}
            quotations={quotations}
            bankingPortal={bankingPortal}
            onRefreshData={fetchData}
            showToast={showToast}
            onOpenCreateInvoiceForClient={(client) => {
              setCurrentTab('billing');
            }}
            onOpenCreateTicketForClient={(client) => {
              setCurrentTab('tickets');
            }}
          />
        )}

        {/* Tab 3: Billing & Invoices */}
        {currentTab === 'billing' && (
          <BillingInvoiceManager
            invoices={invoices}
            clients={clients}
            bankingPortal={bankingPortal}
            onRefreshData={fetchData}
            showToast={showToast}
          />
        )}

        {/* Tab 4: Cost Quotations & Project Proposals */}
        {currentTab === 'quotations' && (
          <QuotationManager
            quotations={quotations}
            bankingPortal={bankingPortal}
            onRefreshData={fetchData}
            showToast={showToast}
            onNavigateToClients={() => setCurrentTab('clients')}
          />
        )}

        {/* Tab 5: Trouble Tickets & Field Dispatch */}
        {currentTab === 'tickets' && (
          <TicketServiceManager
            tickets={tickets}
            clients={clients}
            employees={employees}
            initialFilterTechnician={ticketEmployeeFilter}
            onRefreshData={fetchData}
            showToast={showToast}
            onNavigateToEmployees={() => setCurrentTab('employees')}
          />
        )}

        {/* Tab 6: Employees & Field Crew Team */}
        {currentTab === 'employees' && (
          <EmployeeManager
            employees={employees}
            tickets={tickets}
            onRefreshData={fetchData}
            showToast={showToast}
            onViewTicketsForEmployee={(empName) => {
              setTicketEmployeeFilter(empName);
              setCurrentTab('tickets');
            }}
          />
        )}
      </main>

      {/* Banking & Settings Modal */}
      <BankingSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        bankingPortal={bankingPortal}
        settings={settings}
        onUpdateBanking={handleUpdateBanking}
        onUpdateSettings={handleUpdateSettings}
        showToast={showToast}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <span>© 2026 <b>Pinas Connected</b> — ISP Billing, Quotations & Trouble Ticketing CRM.</span>
      </footer>
    </div>
  );
};

export default App;
