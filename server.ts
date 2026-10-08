import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'crm_db.json');

app.use(express.json({ limit: '10mb' }));

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Could not create DATA_DIR:', e);
  }
}

// CRM Data Structures
interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  phone?: string;
  role: 'admin' | 'staff' | 'technician';
  status: 'active' | 'trial_active' | 'suspended';
  trialEndsAt: string;
  expiresAt: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface Client {
  id: string;
  accountNumber: string;
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  address: string;
  barangayCity: string;
  servicePlan: string;
  monthlyFee: number;
  billingDueDay: number;
  status: 'active' | 'overdue' | 'suspended' | 'lead';
  ipAddress?: string;
  pppoeUser?: string;
  installationDate: string;
  notes?: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  servicePlan?: string;
  billingPeriod: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  paymentMethod?: 'gcash' | 'dbp_bank' | 'maya' | 'cash' | 'other';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

interface QuotationItem {
  id: string;
  description: string;
  category: 'hardware' | 'materials' | 'labor' | 'plan';
  qty: number;
  unitPrice: number;
  total: number;
}

interface Quotation {
  id: string;
  quoteNumber: string;
  clientId?: string;
  recipientName: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  projectTitle: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  installationFee: number;
  monthlyRecurring: number;
  totalInitial: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  validDays: number;
  terms: string;
  notes?: string;
  createdAt: string;
  acceptedAt?: string;
}

interface Employee {
  id: string;
  name: string;
  role: 'technician' | 'staff' | 'admin' | 'billing';
  phone: string;
  email?: string;
  assignedArea?: string;
  active: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  title: string;
  description: string;
  category: 'no_internet' | 'slow_browsing' | 'fiber_cut' | 'router_config' | 'installation' | 'relocation' | 'billing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'dispatched' | 'pending_customer' | 'resolved' | 'closed';
  employeeId?: string;
  assignedTechnician: string;
  resolutionNotes?: string;
  materialsUsed?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeUrl?: string;
  instructions?: string;
  active: boolean;
}

interface WalletAccount {
  id: string;
  walletName: string;
  accountName: string;
  accountNumber: string;
  qrCodeUrl?: string;
  instructions?: string;
  active: boolean;
}

interface BankingPortalConfig {
  bankAccounts: BankAccount[];
  walletAccounts: WalletAccount[];
  companyName: string;
  companyAddress: string;
  companyContact: string;
  companyEmail: string;
  termsNote: string;
}

interface AppSettings {
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

// In-Memory Database
let users: User[] = [];
let clients: Client[] = [];
let invoices: Invoice[] = [];
let quotations: Quotation[] = [];
let tickets: Ticket[] = [];
let employees: Employee[] = [];
let bankingPortal: BankingPortalConfig = {
  companyName: 'Pinas Connected Telecom & ISP Services',
  companyAddress: 'Metro Manila / Provincial Operations Center, Philippines',
  companyContact: '+63 917 888 2026',
  companyEmail: 'billing@pinasconnected.ph',
  termsNote: 'Please include your Account Number (e.g., CLI-1001) or Invoice Number in your GCash / DBP payment reference. Send a screenshot to our billing group for instant receipt generation.',
  bankAccounts: [
    {
      id: 'bank-1',
      bankName: 'Development Bank of the Philippines (DBP)',
      accountName: 'PINAS CONNECTED TELECOM SOLUTIONS',
      accountNumber: '0405-123456-030',
      instructions: 'Pay via DBP Digital App, PESONet, or InstaPay from any Philippine bank. Use your Account Number as the remark.',
      active: true,
      qrCodeUrl: '',
    },
    {
      id: 'bank-2',
      bankName: 'Land Bank of the Philippines',
      accountName: 'PINAS CONNECTED ENTERPRISE',
      accountNumber: '1902-8877-44',
      instructions: 'Over the counter or Mobile Banking transfer accepted.',
      active: true,
      qrCodeUrl: '',
    }
  ],
  walletAccounts: [
    {
      id: 'wallet-1',
      walletName: 'GCash / QRPh Verified Merchant',
      accountName: 'PINAS CONNECTED / REYNALDO J.',
      accountNumber: '0917-888-2026',
      instructions: 'Scan QRPh with GCash, Maya, ShopeePay, or any bank app. Enter Account Number in notes.',
      active: true,
      qrCodeUrl: '',
    },
    {
      id: 'wallet-2',
      walletName: 'Maya Business',
      accountName: 'PINAS CONNECTED ISP',
      accountNumber: '0918-999-2026',
      instructions: 'Send via Maya to Maya or QRPh.',
      active: true,
      qrCodeUrl: '',
    }
  ],
};

let settings: AppSettings = {
  companyName: 'Pinas Connected Telecom Solutions',
  companyAddress: 'Poblacion Commercial Center, Philippines',
  companyPhone: '+63 917 888 2026',
  companyEmail: 'support@pinasconnected.ph',
  telegramToken: '',
  telegramChatId: '',
  currencySymbol: '₱',
  defaultBillingDueDay: 15,
  telegramAlertsEnabled: true,
};

// Seed Realistic Starter Data
function seedInitialData() {
  const now = new Date();
  const dateStr = now.toISOString();

  // Admin and Owner users
  users = [
    {
      id: 'user-admin',
      email: 'admin@ptppulse.local',
      name: 'Super Admin',
      companyName: 'Pinas Connected Telecom',
      phone: '+63 917 888 2026',
      role: 'admin',
      status: 'active',
      trialEndsAt: new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: dateStr,
      lastLoginAt: dateStr,
    },
    {
      id: 'user-owner',
      email: 'jrulesvibecoder@gmail.com',
      name: 'Junel Ruales (Owner)',
      companyName: 'JUNELRULES IT SOLUTIONS',
      phone: '+63 917 555 0192',
      role: 'admin',
      status: 'active',
      trialEndsAt: new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: dateStr,
      lastLoginAt: dateStr,
    }
  ];

  // Clean empty state - No dummy data
  clients = [];
  invoices = [];
  quotations = [];
  tickets = [];
}

// Load data from disk or seed
function loadData() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      // Company creators / users are always ADMIN
      if (data.users && data.users.length) {
        users = data.users.map((u: any) => ({ ...u, role: 'admin' }));
      }
      if (data.employees && data.employees.length) employees = data.employees;
      
      // Auto-purge any old dummy data so database is pristine
      if (data.clients && data.clients.length) {
        clients = data.clients.filter((c: any) => !c.id.startsWith('cli-10'));
      }
      if (data.invoices && data.invoices.length) {
        invoices = data.invoices.filter((i: any) => !i.id.startsWith('inv-10'));
      }
      if (data.quotations && data.quotations.length) {
        quotations = data.quotations.filter((q: any) => !q.id.startsWith('qt-20'));
      }
      if (data.tickets && data.tickets.length) {
        tickets = data.tickets.filter((t: any) => !t.id.startsWith('tck-10'));
      }
      if (data.bankingPortal) bankingPortal = data.bankingPortal;
      if (data.settings) settings = data.settings;
      console.log(`[CRM] Loaded clean database: ${clients.length} clients, ${invoices.length} invoices, ${employees.length} employees.`);
      saveData();
      return;
    } catch (e) {
      console.error('[CRM] Error reading DB file, reseeding:', e);
    }
  }
  seedInitialData();
  saveData();
}

function saveData() {
  try {
    const payload = {
      users,
      clients,
      invoices,
      quotations,
      tickets,
      employees,
      bankingPortal,
      settings,
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (e) {
    console.error('[CRM] Could not save database:', e);
  }
}

// Telegram Notification Dispatcher
async function sendTelegramAlert(text: string): Promise<boolean> {
  const token = settings.telegramToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram Alert Skipped - No Token or Chat ID]:', text);
    return false;
  }

  return new Promise((resolve) => {
    const data = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (d) => { responseBody += d; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          console.error('[Telegram Error]:', res.statusCode, responseBody);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Telegram Network Error]:', err.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

// --- API ENDPOINTS ---

// Auth Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const cleanEmail = email.trim().toLowerCase();
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user && (cleanEmail === 'jrulesvibecoder@gmail.com' || cleanEmail.startsWith('admin@'))) {
    const now = new Date();
    user = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail === 'jrulesvibecoder@gmail.com' ? 'Reynaldo (Owner)' : 'Super Admin',
      companyName: 'Pinas Connected HQ',
      role: 'admin',
      status: 'active',
      trialEndsAt: new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now.toISOString(),
      lastLoginAt: now.toISOString(),
    };
    users.push(user);
    saveData();
  }

  if (!user) {
    return res.status(404).json({ error: 'User account not found. Please register or enter admin@ptppulse.local' });
  }

  user.role = 'admin'; // Every ISP company account is ADMIN
  user.lastLoginAt = new Date().toISOString();
  saveData();
  res.json({ success: true, user });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, companyName, phone } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Email and Name are required' });

  const cleanEmail = email.trim().toLowerCase();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) return res.status(400).json({ error: 'Email already registered' });

  const now = new Date();
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: cleanEmail,
    name: name.trim(),
    companyName: companyName ? companyName.trim() : `${name}'s ISP Services`,
    phone: phone || '',
    role: 'admin', // Company creator is ALWAYS Admin!
    status: 'active',
    trialEndsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now.toISOString(),
    lastLoginAt: now.toISOString(),
  };

  users.push(newUser);

  // Automatically sync company name, email and phone to system settings & banking portal
  if (newUser.companyName) {
    settings.companyName = newUser.companyName;
    bankingPortal.companyName = newUser.companyName;
  }
  if (newUser.email) {
    settings.companyEmail = newUser.email;
    bankingPortal.companyEmail = newUser.email;
  }
  if (newUser.phone) {
    settings.companyPhone = newUser.phone;
    bankingPortal.companyContact = newUser.phone;
  }

  saveData();
  res.json({ success: true, user: newUser });
});

// Dashboard Metrics
app.get('/api/dashboard/metrics', (req, res) => {
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const overdueClients = clients.filter((c) => c.status === 'overdue').length;
  
  const mrr = clients
    .filter((c) => c.status === 'active' || c.status === 'overdue')
    .reduce((sum, c) => sum + (c.monthlyFee || 0), 0);

  const collectedThisMonth = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const unpaidReceivables = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'dispatched').length;
  const criticalTickets = tickets.filter((t) => (t.status === 'open' || t.status === 'dispatched') && t.priority === 'critical').length;
  
  const activeQuotations = quotations.filter((q) => q.status === 'draft' || q.status === 'sent').length;
  const acceptedQuotationsValue = quotations
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + (q.totalInitial || 0), 0);

  res.json({
    metrics: {
      totalClients: clients.length,
      activeClients,
      overdueClients,
      monthlyRecurringRevenue: mrr,
      collectedThisMonth,
      unpaidReceivables,
      openTickets,
      criticalTickets,
      activeQuotations,
      acceptedQuotationsValue,
    }
  });
});

// --- CLIENTS CRM ---
app.get('/api/clients', (req, res) => {
  res.json({ clients });
});

app.post('/api/clients', async (req, res) => {
  const { name, businessName, email, phone, address, barangayCity, servicePlan, monthlyFee, billingDueDay, status, ipAddress, pppoeUser, notes } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Client Name and Phone are required' });

  const nextNum = 1000 + clients.length + 1;
  const newClient: Client = {
    id: `cli-${Date.now()}`,
    accountNumber: `CLI-${nextNum}`,
    name: name.trim(),
    businessName: businessName ? businessName.trim() : undefined,
    email: email ? email.trim() : '',
    phone: phone.trim(),
    address: address ? address.trim() : '',
    barangayCity: barangayCity ? barangayCity.trim() : '',
    servicePlan: servicePlan || 'Fiber Standard 35 Mbps',
    monthlyFee: Number(monthlyFee) || 999,
    billingDueDay: Number(billingDueDay) || settings.defaultBillingDueDay || 15,
    status: status || 'active',
    ipAddress: ipAddress ? ipAddress.trim() : undefined,
    pppoeUser: pppoeUser ? pppoeUser.trim() : undefined,
    installationDate: new Date().toISOString().split('T')[0],
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  clients.unshift(newClient);
  saveData();

  // Send Telegram notification if enabled
  if (settings.telegramAlertsEnabled) {
    const alertMsg = `👤 <b>NEW CLIENT ONBOARDED</b>\n\n📌 <b>Account:</b> ${newClient.accountNumber}\n👤 <b>Name:</b> ${newClient.name} ${newClient.businessName ? `(${newClient.businessName})` : ''}\n📞 <b>Phone:</b> ${newClient.phone}\n📍 <b>Location:</b> ${newClient.address}, ${newClient.barangayCity}\n📦 <b>Plan:</b> ${newClient.servicePlan} (₱${newClient.monthlyFee.toLocaleString()}/mo)\n📅 <b>Due Day:</b> Every ${newClient.billingDueDay}th of month`;
    sendTelegramAlert(alertMsg);
  }

  res.json({ success: true, client: newClient });
});

app.put('/api/clients/:id', (req, res) => {
  const client = clients.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  Object.assign(client, req.body);
  saveData();
  res.json({ success: true, client });
});

app.delete('/api/clients/:id', (req, res) => {
  clients = clients.filter((c) => c.id !== req.params.id);
  saveData();
  res.json({ success: true });
});

// --- INVOICES & BILLING ---
app.get('/api/invoices', (req, res) => {
  res.json({ invoices });
});

app.post('/api/invoices', (req, res) => {
  const { clientId, billingPeriod, amount, dueDate, notes } = req.body;
  const client = clients.find((c) => c.id === clientId);
  if (!client) return res.status(400).json({ error: 'Valid client is required' });

  const nextNum = 1000 + invoices.length + 1;
  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV-2026-${nextNum}`,
    clientId: client.id,
    clientName: client.name,
    clientPhone: client.phone,
    clientAddress: `${client.address}, ${client.barangayCity}`.trim(),
    servicePlan: client.servicePlan,
    billingPeriod: billingPeriod || 'Current Month',
    amount: Number(amount) || client.monthlyFee,
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'unpaid',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  invoices.unshift(newInvoice);
  saveData();
  res.json({ success: true, invoice: newInvoice });
});

// Batch Generate Invoices for All Active Clients
app.post('/api/invoices/generate-batch', (req, res) => {
  const { billingPeriod, dueMonth } = req.body;
  const period = billingPeriod || 'Current Billing Cycle';
  
  const created: Invoice[] = [];
  const currentMonthYear = new Date().toISOString().slice(0, 7);

  clients.forEach((client) => {
    if (client.status === 'active' || client.status === 'overdue') {
      const exists = invoices.find(
        (i) => i.clientId === client.id && i.billingPeriod === period
      );

      if (!exists) {
        const nextNum = 1000 + invoices.length + created.length + 1;
        const dueDayPadded = String(client.billingDueDay || 15).padStart(2, '0');
        const dueDate = `${dueMonth || currentMonthYear}-${dueDayPadded}`;

        const inv: Invoice = {
          id: `inv-${Date.now()}-${nextNum}`,
          invoiceNumber: `INV-2026-${nextNum}`,
          clientId: client.id,
          clientName: client.name,
          clientPhone: client.phone,
          clientAddress: `${client.address}, ${client.barangayCity}`.trim(),
          servicePlan: client.servicePlan,
          billingPeriod: period,
          amount: client.monthlyFee,
          dueDate,
          status: 'unpaid',
          notes: `Monthly recurring subscription for ${client.servicePlan}. Pay via GCash or DBP.`,
          createdAt: new Date().toISOString(),
        };
        created.push(inv);
      }
    }
  });

  if (created.length > 0) {
    invoices.unshift(...created);
    saveData();
  }

  res.json({ success: true, count: created.length, created });
});

// Record Payment
app.post('/api/invoices/:id/pay', async (req, res) => {
  const invoice = invoices.find((i) => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const { paymentMethod, referenceNumber, notes } = req.body;
  invoice.status = 'paid';
  invoice.paidAt = new Date().toISOString();
  invoice.paymentMethod = paymentMethod || 'gcash';
  invoice.referenceNumber = referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`;
  if (notes) invoice.notes = (invoice.notes ? invoice.notes + '\n' : '') + notes;

  // If client had overdue status, check if all invoices are now paid and restore active
  const client = clients.find((c) => c.id === invoice.clientId);
  if (client && client.status === 'overdue') {
    const hasOtherOverdue = invoices.some((i) => i.clientId === client.id && i.id !== invoice.id && (i.status === 'overdue' || i.status === 'unpaid'));
    if (!hasOtherOverdue) {
      client.status = 'active';
    }
  }

  saveData();

  // Telegram alert for verified collection
  if (settings.telegramAlertsEnabled) {
    const payMsg = `💰 <b>PAYMENT COLLECTED & VERIFIED</b>\n\n🧾 <b>Invoice:</b> ${invoice.invoiceNumber}\n👤 <b>Client:</b> ${invoice.clientName}\n💵 <b>Amount:</b> ₱${invoice.amount.toLocaleString()}\n💳 <b>Method:</b> ${(invoice.paymentMethod || 'cash').toUpperCase()}\n🔢 <b>Ref #:</b> ${invoice.referenceNumber}\n🗓️ <b>Period:</b> ${invoice.billingPeriod}`;
    sendTelegramAlert(payMsg);
  }

  res.json({ success: true, invoice });
});

app.put('/api/invoices/:id', (req, res) => {
  const invoice = invoices.find((i) => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  Object.assign(invoice, req.body);
  saveData();
  res.json({ success: true, invoice });
});

app.delete('/api/invoices/:id', (req, res) => {
  invoices = invoices.filter((i) => i.id !== req.params.id);
  saveData();
  res.json({ success: true });
});

// --- QUOTATIONS CRM ---
app.get('/api/quotations', (req, res) => {
  res.json({ quotations });
});

app.post('/api/quotations', async (req, res) => {
  const {
    recipientName,
    companyName,
    email,
    phone,
    address,
    projectTitle,
    items,
    discount,
    validDays,
    terms,
    notes,
  } = req.body;

  if (!recipientName || !phone || !items || !items.length) {
    return res.status(400).json({ error: 'Recipient Name, Phone, and at least one line item are required' });
  }

  const subtotal = items.reduce((acc: number, item: QuotationItem) => acc + (Number(item.total) || (Number(item.qty) * Number(item.unitPrice))), 0);
  const discountVal = Number(discount) || 0;
  
  // Calculate installation fee & monthly recurring from line items
  const laborTotal = items
    .filter((it: QuotationItem) => it.category === 'labor' || it.category === 'materials' || it.category === 'hardware')
    .reduce((acc: number, it: QuotationItem) => acc + (it.total || it.qty * it.unitPrice), 0);
  
  const planItem = items.find((it: QuotationItem) => it.category === 'plan');
  const monthlyRecurring = planItem ? (planItem.unitPrice || planItem.total) : 0;
  const totalInitial = Math.max(0, subtotal - discountVal);

  const nextNum = 100 + quotations.length + 1;
  const newQuotation: Quotation = {
    id: `qt-${Date.now()}`,
    quoteNumber: `QT-2026-${nextNum}`,
    recipientName: recipientName.trim(),
    companyName: companyName ? companyName.trim() : undefined,
    email: email ? email.trim() : '',
    phone: phone.trim(),
    address: address ? address.trim() : '',
    projectTitle: projectTitle || 'Internet Installation & Network Deployment Proposal',
    items,
    subtotal,
    discount: discountVal,
    installationFee: laborTotal,
    monthlyRecurring,
    totalInitial,
    status: 'draft',
    validDays: Number(validDays) || 30,
    terms: terms || '50% downpayment upon acceptance, balance upon successful speed commissioning. 1-year service warranty.',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  quotations.unshift(newQuotation);
  saveData();

  if (settings.telegramAlertsEnabled) {
    const quoteAlert = `📄 <b>NEW QUOTATION CREATED</b>\n\n📌 <b>Quote:</b> ${newQuotation.quoteNumber}\n👤 <b>Client:</b> ${newQuotation.recipientName} ${newQuotation.companyName ? `(${newQuotation.companyName})` : ''}\n📞 <b>Phone:</b> ${newQuotation.phone}\n💼 <b>Project:</b> ${newQuotation.projectTitle}\n💵 <b>Total Amount:</b> ₱${newQuotation.totalInitial.toLocaleString()}`;
    sendTelegramAlert(quoteAlert);
  }

  res.json({ success: true, quotation: newQuotation });
});

// Accept Quotation and Convert into an Active Client & First Invoice!
app.post('/api/quotations/:id/accept', async (req, res) => {
  const quote = quotations.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quotation not found' });

  quote.status = 'accepted';
  quote.acceptedAt = new Date().toISOString();

  // Create new Client
  const nextCliNum = 1000 + clients.length + 1;
  const newClient: Client = {
    id: `cli-${Date.now()}`,
    accountNumber: `CLI-${nextCliNum}`,
    name: quote.recipientName,
    businessName: quote.companyName,
    email: quote.email,
    phone: quote.phone,
    address: quote.address,
    barangayCity: '',
    servicePlan: quote.projectTitle,
    monthlyFee: quote.monthlyRecurring || 1500,
    billingDueDay: 15,
    status: 'active',
    installationDate: new Date().toISOString().split('T')[0],
    notes: `Converted from Quotation ${quote.quoteNumber}`,
    createdAt: new Date().toISOString(),
  };
  clients.unshift(newClient);
  quote.clientId = newClient.id;

  // Create Initial Invoice
  const nextInvNum = 1000 + invoices.length + 1;
  const initialInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV-2026-${nextInvNum}`,
    clientId: newClient.id,
    clientName: newClient.name,
    clientPhone: newClient.phone,
    clientAddress: newClient.address,
    servicePlan: newClient.servicePlan,
    billingPeriod: 'Installation & Month 1 Advance',
    amount: quote.totalInitial,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'unpaid',
    notes: `Initial Setup & Deployment for ${quote.quoteNumber}. Pay via DBP or GCash.`,
    createdAt: new Date().toISOString(),
  };
  invoices.unshift(initialInvoice);

  saveData();

  if (settings.telegramAlertsEnabled) {
    const alertMsg = `🎉 <b>QUOTATION ACCEPTED & CONVERTED!</b>\n\n📌 <b>Quote:</b> ${quote.quoteNumber}\n👤 <b>Client:</b> ${newClient.name}\n🧾 <b>Generated Invoice:</b> ${initialInvoice.invoiceNumber} (₱${initialInvoice.amount.toLocaleString()})\n🆔 <b>New Account #:</b> ${newClient.accountNumber}`;
    sendTelegramAlert(alertMsg);
  }

  res.json({ success: true, quotation: quote, client: newClient, invoice: initialInvoice });
});

app.put('/api/quotations/:id', (req, res) => {
  const quote = quotations.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quotation not found' });

  Object.assign(quote, req.body);
  saveData();
  res.json({ success: true, quotation: quote });
});

app.delete('/api/quotations/:id', (req, res) => {
  quotations = quotations.filter((q) => q.id !== req.params.id);
  saveData();
  res.json({ success: true });
});

// --- TICKETS CRM ---
app.get('/api/tickets', (req, res) => {
  res.json({ tickets });
});

app.post('/api/tickets', async (req, res) => {
  const {
    clientId,
    clientName,
    clientPhone,
    clientAddress,
    title,
    description,
    category,
    priority,
    assignedTechnician,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Ticket Title and Description are required' });
  }

  let finalClientName = clientName;
  let finalClientPhone = clientPhone;
  let finalClientAddress = clientAddress;

  if (clientId) {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      finalClientName = client.name;
      finalClientPhone = client.phone;
      finalClientAddress = `${client.address}, ${client.barangayCity}`.trim();
    }
  }

  let techName = assignedTechnician || 'Unassigned (Queue)';
  const { employeeId } = req.body;
  if (employeeId) {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) techName = emp.name;
  }

  const nextNum = 1000 + tickets.length + 1;
  const newTicket: Ticket = {
    id: `tck-${Date.now()}`,
    ticketNumber: `TCK-${nextNum}`,
    clientId: clientId || undefined,
    clientName: finalClientName || 'Guest / Walk-In',
    clientPhone: finalClientPhone || '',
    clientAddress: finalClientAddress || '',
    title: title.trim(),
    description: description.trim(),
    category: category || 'no_internet',
    priority: priority || 'medium',
    status: 'open',
    employeeId: employeeId || undefined,
    assignedTechnician: techName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tickets.unshift(newTicket);
  saveData();

  if (settings.telegramAlertsEnabled) {
    const priorityIcon = newTicket.priority === 'critical' ? '🚨🚨 CRITICAL' : newTicket.priority === 'high' ? '⚠️ HIGH' : '📌';
    const alertMsg = `${priorityIcon} <b>SUPPORT TICKET #${newTicket.ticketNumber}</b>\n\n👤 <b>Client:</b> ${newTicket.clientName}\n📞 <b>Phone:</b> ${newTicket.clientPhone}\n📍 <b>Address:</b> ${newTicket.clientAddress}\n🏷️ <b>Category:</b> ${newTicket.category.toUpperCase()}\n📋 <b>Issue:</b> ${newTicket.title}\n📝 <b>Details:</b> ${newTicket.description}\n👷 <b>Tech:</b> ${newTicket.assignedTechnician}`;
    sendTelegramAlert(alertMsg);
  }

  res.json({ success: true, ticket: newTicket });
});

app.post('/api/tickets/:id/resolve', async (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { resolutionNotes, materialsUsed } = req.body;
  ticket.status = 'resolved';
  ticket.resolutionNotes = resolutionNotes || 'Resolved by technician';
  ticket.materialsUsed = materialsUsed || '';
  ticket.resolvedAt = new Date().toISOString();
  ticket.updatedAt = new Date().toISOString();

  saveData();

  if (settings.telegramAlertsEnabled) {
    const resMsg = `✅ <b>TICKET RESOLVED: #${ticket.ticketNumber}</b>\n\n👤 <b>Client:</b> ${ticket.clientName}\n📝 <b>Resolution:</b> ${ticket.resolutionNotes}\n🔧 <b>Materials:</b> ${ticket.materialsUsed || 'None'}\n👷 <b>Tech:</b> ${ticket.assignedTechnician}`;
    sendTelegramAlert(resMsg);
  }

  res.json({ success: true, ticket });
});

app.put('/api/tickets/:id', (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  Object.assign(ticket, req.body);
  ticket.updatedAt = new Date().toISOString();
  saveData();
  res.json({ success: true, ticket });
});

app.delete('/api/tickets/:id', (req, res) => {
  tickets = tickets.filter((t) => t.id !== req.params.id);
  saveData();
  res.json({ success: true });
});

// --- EMPLOYEES & STAFF TEAM ENDPOINTS ---
app.get('/api/employees', (req, res) => {
  res.json({ employees });
});

app.post('/api/employees', (req, res) => {
  const { name, role, phone, email, assignedArea } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Employee Name and Phone are required.' });

  const newEmp: Employee = {
    id: `emp-${Date.now()}`,
    name: name.trim(),
    role: role || 'technician',
    phone: phone.trim(),
    email: email ? email.trim() : undefined,
    assignedArea: assignedArea ? assignedArea.trim() : undefined,
    active: true,
    createdAt: new Date().toISOString(),
  };

  employees.push(newEmp);
  saveData();
  res.json({ success: true, employee: newEmp });
});

app.put('/api/employees/:id', (req, res) => {
  const emp = employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  Object.assign(emp, req.body);
  saveData();
  res.json({ success: true, employee: emp });
});

app.delete('/api/employees/:id', (req, res) => {
  employees = employees.filter((e) => e.id !== req.params.id);
  saveData();
  res.json({ success: true });
});

// Admin endpoint to wipe all dummy data
app.post('/api/admin/wipe-data', (req, res) => {
  clients = [];
  invoices = [];
  quotations = [];
  tickets = [];
  saveData();
  res.json({ success: true, message: 'All test and dummy data has been completely wiped.' });
});

// --- BANKING & SETTINGS ---
app.get('/api/banking', (req, res) => {
  res.json({ bankingPortal });
});

app.post('/api/banking', (req, res) => {
  bankingPortal = req.body;
  saveData();
  res.json({ success: true, bankingPortal });
});

app.get('/api/settings', (req, res) => {
  res.json({ settings });
});

app.post('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  saveData();
  res.json({ success: true, settings });
});

// Telegram Test
app.post('/api/telegram/test', async (req, res) => {
  const testMsg = `🔔 <b>PINAS CONNECTED CRM TEST</b>\n\n✅ Your Telegram Bot notification channel is functioning properly! You will receive instant alerts for:\n• New Support Tickets & Outages\n• Verified GCash & DBP Payments\n• Quotation Acceptances`;
  const sent = await sendTelegramAlert(testMsg);
  res.json({ success: sent, message: sent ? 'Telegram message sent successfully!' : 'Failed to send message. Please verify Bot Token and Chat ID.' });
});

// Load DB
loadData();

// Vite Middleware for Fullstack
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CRM] Pinas Connected CRM Server running on port ${PORT}`);
  });
}

startServer();
