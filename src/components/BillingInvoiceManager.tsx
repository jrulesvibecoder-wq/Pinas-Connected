import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  DollarSign, 
  TrendingUp, 
  Smartphone, 
  Building, 
  Send,
  Layers,
  Sparkles
} from 'lucide-react';
import { Invoice, Client, BankingPortalConfig } from '../types';

interface BillingInvoiceManagerProps {
  invoices: Invoice[];
  clients: Client[];
  bankingPortal: BankingPortalConfig;
  onRefreshData: () => void;
  showToast: (text: string, type?: 'success' | 'alert' | 'info') => void;
}

export const BillingInvoiceManager: React.FC<BillingInvoiceManagerProps> = ({
  invoices,
  clients,
  bankingPortal,
  onRefreshData,
  showToast,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [viewingSoa, setViewingSoa] = useState<Invoice | null>(null);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // New Invoice Form
  const [selectedClientId, setSelectedClientId] = useState('');
  const [formPeriod, setFormPeriod] = useState('October 2026');
  const [formAmount, setFormAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'dbp_bank' | 'maya' | 'cash'>('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [batchGenerating, setBatchGenerating] = useState(false);

  // Filter invoices
  const filteredInvoices = invoices.filter((i) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.clientName.toLowerCase().includes(q) ||
      i.clientPhone.toLowerCase().includes(q) ||
      (i.servicePlan && i.servicePlan.toLowerCase().includes(q));

    const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Financial aggregates
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalUnpaid = invoices.filter((i) => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  // Batch Invoices Generation for Active Clients
  const handleBatchGenerate = async () => {
    const period = window.prompt('Enter billing cycle period name:', 'November 2026');
    if (!period) return;

    setBatchGenerating(true);
    try {
      const res = await fetch('/api/invoices/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingPeriod: period }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 Generated ${data.count} monthly invoices for ${period}!`, 'success');
        onRefreshData();
      } else {
        showToast(data.error || 'Failed to generate batch invoices.', 'alert');
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setBatchGenerating(false);
    }
  };

  // Create Single Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      showToast('Please select a subscriber.', 'alert');
      return;
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          billingPeriod: formPeriod,
          amount: Number(formAmount),
          dueDate: formDueDate,
          notes: formNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Invoice ${data.invoice.invoiceNumber} created!`, 'success');
        setIsNewInvoiceOpen(false);
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    }
  };

  // Submit Payment Record
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setSubmittingPayment(true);
    try {
      const res = await fetch(`/api/invoices/${payingInvoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          referenceNumber: referenceNumber.trim() || `REF-${Date.now().toString().slice(-6)}`,
          notes: paymentNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Payment of ₱${payingInvoice.amount.toLocaleString()} verified and recorded!`, 'success');
        setPayingInvoice(null);
        setReferenceNumber('');
        setPaymentNotes('');
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Copy SOA Reminder Text
  const copySoaText = (inv: Invoice) => {
    const defaultBank = bankingPortal.bankAccounts.find((b) => b.active) || bankingPortal.bankAccounts[0];
    const defaultWallet = bankingPortal.walletAccounts.find((w) => w.active) || bankingPortal.walletAccounts[0];

    const message = `📋 STATEMENT OF ACCOUNT / BILLING REMINDER\n\n` +
      `SaaS / ISP Provider: ${bankingPortal.companyName || 'Pinas Connected'}\n` +
      `Invoice #: ${inv.invoiceNumber}\n` +
      `Subscriber: ${inv.clientName}\n` +
      `Billing Period: ${inv.billingPeriod}\n` +
      `Plan: ${inv.servicePlan || 'Internet Subscription'}\n` +
      `Total Due: ₱${inv.amount.toLocaleString()}\n` +
      `Due Date: ${inv.dueDate}\n\n` +
      `💳 PAYMENT CHANNELS:\n` +
      (defaultWallet ? `• GCash / QRPh: ${defaultWallet.accountNumber} (${defaultWallet.accountName})\n` : '') +
      (defaultBank ? `• ${defaultBank.bankName}: ${defaultBank.accountNumber} (${defaultBank.accountName})\n` : '') +
      `\nPlease reply with your payment reference number or screenshot. Thank you!`;

    navigator.clipboard.writeText(message);
    setCopiedInvoiceId(inv.id);
    showToast('Statement summary copied to clipboard!', 'success');
    setTimeout(() => setCopiedInvoiceId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Batch Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Billing, Invoicing & Receivables</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated monthly subscriber billing, Statement of Account (SOA) generation, and GCash / DBP payment tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleBatchGenerate}
            disabled={batchGenerating}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{batchGenerating ? 'Generating...' : 'Batch Generate Monthly Cycle'}</span>
          </button>
          <button
            onClick={() => {
              if (clients.length > 0) {
                setSelectedClientId(clients[0].id);
                setFormAmount(String(clients[0].monthlyFee));
              }
              setFormDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
              setIsNewInvoiceOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs font-medium uppercase">Total Paid / Collected</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">₱{totalPaid.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">{invoices.filter(i => i.status === 'paid').length} Settled invoices</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs font-medium uppercase">Unpaid Receivables</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">₱{totalUnpaid.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">{invoices.filter(i => i.status === 'unpaid').length} Pending payments</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs font-medium uppercase">Overdue Balances</div>
          <div className="text-xl font-bold text-rose-400 font-mono mt-1">₱{totalOverdue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">{invoices.filter(i => i.status === 'overdue').length} Delinquent accounts</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs font-medium uppercase">Total Billing Ledger</div>
          <div className="text-xl font-bold text-white font-mono mt-1">₱{totalInvoiced.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">{invoices.length} Total records</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by invoice #, client name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto overflow-x-auto text-xs">
          {[
            { id: 'all', label: `All (${invoices.length})` },
            { id: 'unpaid', label: `Unpaid (${invoices.filter(i => i.status === 'unpaid').length})` },
            { id: 'paid', label: `Paid (${invoices.filter(i => i.status === 'paid').length})` },
            { id: 'overdue', label: `Overdue (${invoices.filter(i => i.status === 'overdue').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Invoice # & Client</th>
                <th className="py-3.5 px-4">Billing Period</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status & Payment</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-850/60 transition group">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{inv.clientName}</div>
                      <div className="text-[11px] text-slate-400">{inv.servicePlan}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{inv.invoiceNumber} · 📞 {inv.clientPhone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {inv.billingPeriod}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono text-sm">₱{inv.amount.toLocaleString()}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">{inv.dueDate}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          inv.status === 'overdue' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {inv.status}
                        </span>
                        {inv.paidAt && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Via {inv.paymentMethod?.toUpperCase()} · {inv.referenceNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Statement of Account Modal */}
                        <button
                          onClick={() => setViewingSoa(inv)}
                          title="View Official SOA & Printable Receipt"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Copy SMS / Messenger Reminder */}
                        <button
                          onClick={() => copySoaText(inv)}
                          title="Copy Statement to Clipboard"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          {copiedInvoiceId === inv.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Record Payment Button */}
                        {inv.status !== 'paid' ? (
                          <button
                            onClick={() => {
                              setPayingInvoice(inv);
                              setReferenceNumber(`GCASH-${Math.floor(100000000 + Math.random() * 900000000)}`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition cursor-pointer flex items-center space-x-1"
                          >
                            <span>Receive Pay</span>
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-[11px] font-semibold px-2 py-1 bg-emerald-950/40 rounded-lg border border-emerald-800/40">
                            ✓ Settled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Record Subscriber Payment</span>
              </h2>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div className="text-slate-400">Subscriber: <strong className="text-white">{payingInvoice.clientName}</strong></div>
              <div className="text-slate-400">Invoice: <span className="font-mono text-cyan-400">{payingInvoice.invoiceNumber}</span> ({payingInvoice.billingPeriod})</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-1">₱{payingInvoice.amount.toLocaleString()}</div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Payment Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gcash', label: 'GCash / QRPh', icon: Smartphone },
                    { id: 'dbp_bank', label: 'DBP Bank Transfer', icon: Building },
                    { id: 'maya', label: 'Maya Wallet', icon: CreditCard },
                    { id: 'cash', label: 'Cash / Collector', icon: DollarSign },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 transition cursor-pointer text-left ${
                          paymentMethod === m.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Bank / GCash Reference Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCASH-192837482"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Remarks / Payment Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via DBP InstaPay to DBP account"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shadow-md"
                >
                  {submittingPayment ? 'Verifying...' : 'Confirm & Mark Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Statement of Account (SOA) & Official Receipt Modal */}
      {viewingSoa && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:bg-white print:text-black">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Official Statement of Account / Billing Invoice</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print SOA</span>
                </button>
                <button
                  onClick={() => setViewingSoa(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* SOA Document Body */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                    {bankingPortal.companyName || 'PINAS CONNECTED TELECOM SERVICES'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{bankingPortal.companyAddress}</p>
                  <p className="text-xs text-slate-400">Contact: {bankingPortal.companyContact} · {bankingPortal.companyEmail}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-mono">STATEMENT OF ACCOUNT</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">{viewingSoa.invoiceNumber}</div>
                  <div className="text-xs text-slate-400 mt-1">Date: {new Date(viewingSoa.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 uppercase text-[10px] font-bold">Billed To (Subscriber):</div>
                  <div className="font-bold text-white text-sm mt-0.5">{viewingSoa.clientName}</div>
                  <div className="text-slate-400 mt-0.5">{viewingSoa.clientAddress || 'Metro Manila / Provincial'}</div>
                  <div className="text-slate-400">Phone: {viewingSoa.clientPhone}</div>
                </div>

                <div className="text-right">
                  <div className="text-slate-500 uppercase text-[10px] font-bold">Billing Particulars:</div>
                  <div className="text-slate-300 mt-0.5">Period: <strong className="text-white">{viewingSoa.billingPeriod}</strong></div>
                  <div className="text-slate-300">Due Date: <strong className="text-amber-400">{viewingSoa.dueDate}</strong></div>
                  <div className="mt-1">
                    Status: <span className={`font-bold uppercase ${viewingSoa.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {viewingSoa.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-3">
                        <div className="font-semibold text-white">{viewingSoa.servicePlan || 'Broadband Internet Subscription'}</div>
                        <div className="text-[11px] text-slate-400">Monthly recurring bandwidth fee for {viewingSoa.billingPeriod}</div>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">1</td>
                      <td className="p-3 text-right font-mono font-bold text-white">₱{viewingSoa.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-900/60 border-t border-slate-800 font-bold">
                    <tr>
                      <td colSpan={2} className="p-3 text-right text-slate-300">Total Amount Due:</td>
                      <td className="p-3 text-right font-mono text-emerald-400 text-base">₱{viewingSoa.amount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Remittance & Payment Details */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>Authorized Payment Remittance Accounts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {bankingPortal.bankAccounts.filter(b => b.active).map(b => (
                    <div key={b.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="font-semibold text-white text-[11px]">{b.bankName}</div>
                      <div className="text-slate-300 font-mono font-bold mt-0.5">{b.accountNumber}</div>
                      <div className="text-[10px] text-slate-400">{b.accountName}</div>
                    </div>
                  ))}
                  {bankingPortal.walletAccounts.filter(w => w.active).map(w => (
                    <div key={w.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="font-semibold text-emerald-400 text-[11px]">{w.walletName}</div>
                      <div className="text-slate-300 font-mono font-bold mt-0.5">{w.accountNumber}</div>
                      <div className="text-[10px] text-slate-400">{w.accountName}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 pt-1 italic">
                  {bankingPortal.termsNote}
                </p>
              </div>

              {/* Official Paid Stamp if paid */}
              {viewingSoa.status === 'paid' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400">
                  ✓ <b>OFFICIALLY PAID & SETTLED</b> via {viewingSoa.paymentMethod?.toUpperCase()} (Ref: {viewingSoa.referenceNumber}) on {new Date(viewingSoa.paidAt || '').toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Single Invoice Modal */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Issue Individual Invoice</span>
              </h2>
              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Select Subscriber *</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    const c = clients.find(cl => cl.id === e.target.value);
                    if (c) setFormAmount(String(c.monthlyFee));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.accountNumber}) — {c.servicePlan} (₱{c.monthlyFee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Billing Period *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2026"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Amount (₱) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Due Date *</label>
                <input
                  type="date"
                  required
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Billing Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Monthly internet subscription fee"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shadow-md"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
