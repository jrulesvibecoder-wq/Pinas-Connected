import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Building, 
  Phone, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Quotation, QuotationItem, BankingPortalConfig } from '../types';

interface QuotationManagerProps {
  quotations: Quotation[];
  bankingPortal: BankingPortalConfig;
  onRefreshData: () => void;
  showToast: (text: string, type?: 'success' | 'alert' | 'info') => void;
  onNavigateToClients: () => void;
}

export const QuotationManager: React.FC<QuotationManagerProps> = ({
  quotations,
  bankingPortal,
  onRefreshData,
  showToast,
  onNavigateToClients,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<Quotation | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [projectTitle, setProjectTitle] = useState('High-Speed Fiber Internet & Wi-Fi Deployment');
  const [validDays, setValidDays] = useState('30');
  const [discount, setDiscount] = useState('0');
  const [terms, setTerms] = useState('50% downpayment upon quote acceptance, 50% upon speed verification. Standard 12-month lock-in contract.');
  const [notes, setNotes] = useState('');

  // Line items state
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: 'it-1',
      description: 'Gigabit Dual-Band Wi-Fi 6 ONU Router',
      category: 'hardware',
      qty: 1,
      unitPrice: 2400,
      total: 2400,
    },
    {
      id: 'it-2',
      description: 'Outdoor Fiber Drop Cable 2-Core (100 meters)',
      category: 'materials',
      qty: 1,
      unitPrice: 1200,
      total: 1200,
    },
    {
      id: 'it-3',
      description: 'Fiber Splicing, Clamping, Alignment & Labor',
      category: 'labor',
      qty: 1,
      unitPrice: 1500,
      total: 1500,
    },
    {
      id: 'it-4',
      description: 'High-Speed Fiber Plan 50 Mbps (First Month Subscription)',
      category: 'plan',
      qty: 1,
      unitPrice: 1499,
      total: 1499,
    },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `it-${Date.now()}`,
        description: 'New Equipment / Service Line',
        category: 'hardware',
        qty: 1,
        unitPrice: 1000,
        total: 1000,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'qty' || field === 'unitPrice') {
      item.total = Number(item.qty || 0) * Number(item.unitPrice || 0);
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast('A quotation must have at least one line item.', 'alert');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalAmount = Math.max(0, subtotal - (Number(discount) || 0));

  // Submit New Quotation
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !phone.trim()) {
      showToast('Recipient Name and Phone are required.', 'alert');
      return;
    }

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          companyName: companyName.trim() || undefined,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          projectTitle: projectTitle.trim(),
          items,
          discount: Number(discount) || 0,
          validDays: Number(validDays) || 30,
          terms: terms.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Quotation ${data.quotation.quoteNumber} created!`, 'success');
        setIsCreateOpen(false);
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    }
  };

  // Convert Quote into Active Client & Initial Invoice
  const handleAcceptAndConvert = async (quote: Quotation) => {
    if (!window.confirm(`Accept quotation ${quote.quoteNumber} and automatically convert ${quote.recipientName} into an Active Subscriber with an initial invoice?`)) {
      return;
    }

    setAcceptingQuoteId(quote.id);
    try {
      const res = await fetch(`/api/quotations/${quote.id}/accept`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 Quotation converted! Created Client #${data.client.accountNumber} and Invoice #${data.invoice.invoiceNumber}.`, 'success');
        setViewingQuote(null);
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  // Delete Quotation
  const handleDeleteQuotation = async (id: string, num: string) => {
    if (!window.confirm(`Delete quotation ${num}?`)) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Quotation removed.', 'info');
        if (viewingQuote?.id === id) setViewingQuote(null);
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    }
  };

  // Copy Quotation Text to Clipboard
  const copyQuoteSummary = (q: Quotation) => {
    const summary = `📄 PROJECT QUOTATION / ESTIMATE\n\n` +
      `From: ${bankingPortal.companyName || 'Pinas Connected'}\n` +
      `Proposal #: ${q.quoteNumber}\n` +
      `Client: ${q.recipientName} ${q.companyName ? `(${q.companyName})` : ''}\n` +
      `Project: ${q.projectTitle}\n\n` +
      `Items Breakdown:\n` +
      q.items.map((it, idx) => `${idx + 1}. ${it.description} (Qty: ${it.qty}) - ₱${it.total.toLocaleString()}`).join('\n') +
      `\n\n` +
      `Subtotal: ₱${q.subtotal.toLocaleString()}\n` +
      (q.discount > 0 ? `Discount: -₱${q.discount.toLocaleString()}\n` : '') +
      `TOTAL INITIAL INVESTMENT: ₱${q.totalInitial.toLocaleString()}\n` +
      (q.monthlyRecurring > 0 ? `Monthly Recurring Plan: ₱${q.monthlyRecurring.toLocaleString()}/mo\n` : '') +
      `Validity: ${q.validDays} days from date of issue.\n\n` +
      `Terms: ${q.terms}\n\n` +
      `For inquiries or approval, please call ${bankingPortal.companyContact || '+63 917 888 2026'}.`;

    navigator.clipboard.writeText(summary);
    setCopiedQuoteId(q.id);
    showToast('Proposal text copied to clipboard!', 'success');
    setTimeout(() => setCopiedQuoteId(null), 3000);
  };

  // Filter
  const filteredQuotes = quotations.filter((q) => {
    const s = search.toLowerCase();
    const matchesSearch = 
      q.quoteNumber.toLowerCase().includes(s) ||
      q.recipientName.toLowerCase().includes(s) ||
      (q.companyName && q.companyName.toLowerCase().includes(s)) ||
      q.projectTitle.toLowerCase().includes(s);

    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Cost Quotations & Project Proposals</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate formal itemized estimates for fiber drops, P2P antennas, routers, and installation labor. Convert accepted quotes to active clients with 1 click.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search proposals, client names, project titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto overflow-x-auto text-xs">
          {[
            { id: 'all', label: `All (${quotations.length})` },
            { id: 'draft', label: `Draft (${quotations.filter(q => q.status === 'draft').length})` },
            { id: 'sent', label: `Sent (${quotations.filter(q => q.status === 'sent').length})` },
            { id: 'accepted', label: `Accepted (${quotations.filter(q => q.status === 'accepted').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Grid Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Quote # & Recipient</th>
                <th className="py-3.5 px-4">Project Title</th>
                <th className="py-3.5 px-4">Initial Investment</th>
                <th className="py-3.5 px-4">Recurring Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No quotations found. Click "+ New Quotation" to create an estimate.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-850/60 transition group">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setViewingQuote(q)}
                        className="font-bold text-white hover:text-indigo-400 transition text-left cursor-pointer"
                      >
                        <div>{q.recipientName}</div>
                        {q.companyName && <div className="text-[11px] text-slate-400">{q.companyName}</div>}
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{q.quoteNumber} · 📞 {q.phone}</div>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-medium text-white">{q.projectTitle}</div>
                      <div className="text-[11px] text-slate-500">{q.items.length} itemized lines</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono text-sm">₱{q.totalInitial.toLocaleString()}</div>
                      {q.discount > 0 && (
                        <div className="text-[10px] text-emerald-400 font-mono">Disc: -₱{q.discount.toLocaleString()}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-cyan-400 font-mono font-semibold">
                        {q.monthlyRecurring > 0 ? `₱${q.monthlyRecurring.toLocaleString()}/mo` : 'One-Time Project'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        q.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        q.status === 'sent' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {q.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* View & Print Modal */}
                        <button
                          onClick={() => setViewingQuote(q)}
                          title="View Official Proposal Document"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Copy Summary */}
                        <button
                          onClick={() => copyQuoteSummary(q)}
                          title="Copy Quote Text to Clipboard"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          {copiedQuoteId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Convert to Client Button if not yet accepted */}
                        {q.status !== 'accepted' && (
                          <button
                            onClick={() => handleAcceptAndConvert(q)}
                            disabled={acceptingQuoteId === q.id}
                            title="Accept & Convert to Client + Invoice"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition cursor-pointer flex items-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Convert</span>
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteQuotation(q.id, q.quoteNumber)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Quotation Document View Modal */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Formal Project Proposal & Quotation</span>
              </div>
              <div className="flex items-center space-x-2">
                {viewingQuote.status !== 'accepted' && (
                  <button
                    onClick={() => handleAcceptAndConvert(viewingQuote)}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Accept & Convert to Client</span>
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Quote</span>
                </button>
                <button
                  onClick={() => setViewingQuote(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 text-xs">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                    {bankingPortal.companyName || 'PINAS CONNECTED TELECOM SERVICES'}
                  </h2>
                  <p className="text-slate-400 mt-0.5">{bankingPortal.companyAddress}</p>
                  <p className="text-slate-400">Contact: {bankingPortal.companyContact} · {bankingPortal.companyEmail}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-mono">FORMAL ESTIMATE</div>
                  <div className="text-sm font-bold text-indigo-400 font-mono">{viewingQuote.quoteNumber}</div>
                  <div className="text-slate-400 mt-1">Date: {new Date(viewingQuote.createdAt).toLocaleDateString()}</div>
                  <div className="text-slate-400">Valid: {viewingQuote.validDays} days</div>
                </div>
              </div>

              {/* Proposal Client Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500 uppercase text-[10px] font-bold">Client / Proponent:</div>
                  <div className="font-bold text-white text-sm mt-0.5">{viewingQuote.recipientName}</div>
                  {viewingQuote.companyName && <div className="text-indigo-400">{viewingQuote.companyName}</div>}
                  <div className="text-slate-400 mt-0.5">{viewingQuote.address || 'Philippines'}</div>
                  <div className="text-slate-400">Phone: {viewingQuote.phone}</div>
                </div>

                <div className="text-right">
                  <div className="text-slate-500 uppercase text-[10px] font-bold">Project Scope:</div>
                  <div className="text-white font-bold text-sm mt-0.5">{viewingQuote.projectTitle}</div>
                  <div className="text-slate-400 mt-1">
                    Status: <span className="font-bold uppercase text-indigo-400">{viewingQuote.status}</span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Description & Scope</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {viewingQuote.items.map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-medium text-white">{it.description}</td>
                        <td className="p-3 capitalize text-slate-400">{it.category}</td>
                        <td className="p-3 text-right font-mono text-slate-300">{it.qty}</td>
                        <td className="p-3 text-right font-mono text-slate-300">₱{it.unitPrice.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-white">₱{it.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900/60 border-t border-slate-800 font-bold">
                    <tr>
                      <td colSpan={5} className="p-3 text-right text-slate-400">Subtotal:</td>
                      <td className="p-3 text-right font-mono text-white">₱{viewingQuote.subtotal.toLocaleString()}</td>
                    </tr>
                    {viewingQuote.discount > 0 && (
                      <tr>
                        <td colSpan={5} className="p-3 text-right text-emerald-400">Special Discount:</td>
                        <td className="p-3 text-right font-mono text-emerald-400">-₱{viewingQuote.discount.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="border-t border-slate-800">
                      <td colSpan={5} className="p-3 text-right text-white text-sm">TOTAL INITIAL INVESTMENT:</td>
                      <td className="p-3 text-right font-mono text-indigo-400 text-base">₱{viewingQuote.totalInitial.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Terms and Signature Acceptance Block */}
              <div className="space-y-4 pt-2">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-bold text-slate-300 text-[11px] mb-1">Terms & Conditions:</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{viewingQuote.terms}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800 text-xs">
                  <div>
                    <div className="text-slate-400 font-semibold">Prepared By:</div>
                    <div className="mt-8 border-b border-slate-700 w-48"></div>
                    <div className="text-[11px] text-slate-500 mt-1">Authorized Sales & Engineering Rep</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold">Conforme & Client Signature:</div>
                    <div className="mt-8 border-b border-slate-700 w-48"></div>
                    <div className="text-[11px] text-slate-500 mt-1">{viewingQuote.recipientName} (Date)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Quotation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Create Client Cost Quotation & Proposal</span>
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              {/* Recipient details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Client / Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Fernando Alcantara"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Company / Business / Agency (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Alcantara Diagnostic Clinic"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="0917-xxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Installation Location</label>
                  <input
                    type="text"
                    placeholder="Barangay, City, Province"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Project / Quotation Subject Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dedicated Fiber Internet & Wi-Fi 6 Router Setup"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Line Items Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold text-xs">Itemized Breakdown & Scope of Work</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((it, idx) => (
                    <div key={it.id || idx} className="grid grid-cols-12 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Item Description"
                          value={it.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={it.category}
                          onChange={(e: any) => handleUpdateItem(idx, 'category', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px]"
                        >
                          <option value="hardware">Hardware</option>
                          <option value="materials">Materials</option>
                          <option value="labor">Labor</option>
                          <option value="plan">Plan</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={it.qty}
                          onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={it.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono font-bold"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400">Subtotal: </span>
                    <strong className="text-white font-mono">₱{subtotal.toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Discount (₱):</span>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-400 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400">Total: </span>
                    <strong className="text-indigo-400 font-mono text-sm">₱{totalAmount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Terms and Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Terms & Payment Schedule</label>
                  <textarea
                    rows={2}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Proposal Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer shadow-md"
                >
                  Save & Issue Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
