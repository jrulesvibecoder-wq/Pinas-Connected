export type UserRole = 'admin' | 'staff' | 'technician';
export type AccountStatus = 'active' | 'trial_active' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  trialEndsAt: string;
  expiresAt: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type ClientStatus = 'active' | 'overdue' | 'suspended' | 'lead';

export interface Client {
  id: string;
  accountNumber: string; // e.g. "CLI-1001"
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  address: string;
  barangayCity: string;
  servicePlan: string; // e.g. "Residential 35 Mbps", "Business Fiber 100 Mbps"
  monthlyFee: number;
  billingDueDay: number; // 1-31
  status: ClientStatus;
  ipAddress?: string;
  pppoeUser?: string;
  installationDate: string;
  notes?: string;
  createdAt: string;
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'gcash' | 'dbp_bank' | 'maya' | 'cash' | 'other';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0042"
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  servicePlan?: string;
  billingPeriod: string; // e.g. "October 2026"
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined';

export interface QuotationItem {
  id: string;
  description: string;
  category: 'hardware' | 'materials' | 'labor' | 'plan';
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string; // e.g. "QT-2026-0089"
  clientId?: string;
  recipientName: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  projectTitle: string; // e.g. "New Fiber Drop & Gigabit Router Installation"
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  installationFee: number;
  monthlyRecurring: number;
  totalInitial: number;
  status: QuotationStatus;
  validDays: number;
  terms: string;
  notes?: string;
  createdAt: string;
  acceptedAt?: string;
}

export type TicketCategory = 
  | 'no_internet' 
  | 'slow_browsing' 
  | 'fiber_cut' 
  | 'router_config' 
  | 'installation' 
  | 'relocation' 
  | 'billing';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'dispatched' | 'pending_customer' | 'resolved' | 'closed';

export interface Employee {
  id: string;
  name: string;
  role: 'technician' | 'staff' | 'admin' | 'billing';
  phone: string;
  email?: string;
  assignedArea?: string;
  active: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. "TCK-1001"
  clientId?: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  employeeId?: string;
  assignedTechnician: string;
  resolutionNotes?: string;
  materialsUsed?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface BankAccount {
  id: string;
  bankName: string; // e.g. "Development Bank of the Philippines (DBP)", "Landbank", "BDO"
  accountName: string;
  accountNumber: string;
  qrCodeUrl?: string;
  instructions?: string;
  active: boolean;
}

export interface WalletAccount {
  id: string;
  walletName: string; // "GCash / QRPh", "Maya"
  accountName: string;
  accountNumber: string;
  qrCodeUrl?: string;
  instructions?: string;
  active: boolean;
}

export interface BankingPortalConfig {
  bankAccounts: BankAccount[];
  walletAccounts: WalletAccount[];
  companyName: string;
  companyAddress: string;
  companyContact: string;
  companyEmail: string;
  termsNote: string;
}

export interface AppSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  telegramToken: string;
  telegramChatId: string;
  currencySymbol: string;
  defaultBillingDueDay: number;
  telegramAlertsEnabled: boolean;
}

export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  overdueClients: number;
  monthlyRecurringRevenue: number;
  collectedThisMonth: number;
  unpaidReceivables: number;
  openTickets: number;
  criticalTickets: number;
  activeQuotations: number;
  acceptedQuotationsValue: number;
}
