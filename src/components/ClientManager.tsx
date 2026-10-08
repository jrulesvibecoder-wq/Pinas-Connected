import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard, 
  FileText, 
  LifeBuoy, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink,
  DollarSign,
  Send,
  Building,
  UserCheck,
  Globe
} from 'lucide-react';
import { Client, Invoice, Ticket, Quotation, BankingPortalConfig } from '../types';

interface ClientManagerProps {
  clients: Client[];
  invoices: Invoice[];
  tickets: Ticket[];
  quotations: Quotation[];
  bankingPortal: BankingPortalConfig;
  onRefreshData: () => void;
  showToast: (text: string, type?: 'success' | 'alert' | 'info') => void;
  onOpenCreateInvoiceForClient: (client: Client) => void;
  onOpenCreateTicketForClient: (client: Client) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  clients,
  invoices,
  tickets,
  quotations,
  bankingPortal,
  onRefreshData,
  showToast,
  onOpenCreateInvoiceForClient,
  onOpenCreateTicketForClient,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formBusiness, setFormBusiness] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formBarangayCity, setFormBarangayCity] = useState('');
  const [formPlan, setFormPlan] = useState('Home Fiber Lite 35 Mbps');
  const [formMonthlyFee, setFormMonthlyFee] = useState('999');
  const [formDueDay, setFormDueDay] = useState('15');
  const [formStatus, setFormStatus] = useState<'active' | 'overdue' | 'suspended' | 'lead'>('active');
  const [formIp, setFormIp] = useState('');
  const [formPppoe, setFormPppoe] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      c.name.toLowerCase().includes(q) ||
      (c.businessName && c.businessName.toLowerCase().includes(q)) ||
      c.accountNumber.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.barangayCity.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormName('');
    setFormBusiness('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormBarangayCity('');
    setFormPlan('Fiber Standard 50 Mbps');
    setFormMonthlyFee('1499');
    setFormDueDay('15');
    setFormStatus('active');
    setFormIp('192.168.10.');
    setFormPppoe('');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setFormName(c.name);
    setFormBusiness(c.businessName || '');
    setFormPhone(c.phone);
    setFormEmail(c.email || '');
    setFormAddress(c.address);
    setFormBarangayCity(c.barangayCity);
    setFormPlan(c.servicePlan);
    setFormMonthlyFee(String(c.monthlyFee));
    setFormDueDay(String(c.billingDueDay));
    setFormStatus(c.status);
    setFormIp(c.ipAddress || '');
    setFormPppoe(c.pppoeUser || '');
    setFormNotes(c.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      showToast('Client Name and Phone are required.', 'alert');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        businessName: formBusiness.trim() || undefined,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        barangayCity: formBarangayCity.trim(),
        servicePlan: formPlan,
        monthlyFee: Number(formMonthlyFee) || 999,
        billingDueDay: Number(formDueDay) || 15,
        status: formStatus,
        ipAddress: formIp.trim() || undefined,
        pppoeUser: formPppoe.trim() || undefined,
        notes: formNotes.trim(),
      };

      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingClient ? 'Client updated successfully.' : 'New client added to directory!', 'success');
        setIsAddModalOpen(false);
        onRefreshData();
      } else {
        showToast(data.error || 'Failed to save client.', 'alert');
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`, 'alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove subscriber ${name} from CRM?`)) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Client removed from CRM.', 'info');
        if (selectedClient?.id === id) setSelectedClient(null);
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    }
  };

  // Copy billing reminder text for SMS / Messenger
  const copyBillingReminder = (c: Client) => {
    const defaultBank = bankingPortal.bankAccounts.find((b) => b.active) || bankingPortal.bankAccounts[0];
    const defaultWallet = bankingPortal.walletAccounts.find((w) => w.active) || bankingPortal.walletAccounts[0];

    const message = `Halo ${c.name}!\n\nIto po ang inyong billing advisory mula sa ${bankingPortal.companyName || 'Pinas Connected'}:\n\n` +
      `📌 Account #: ${c.accountNumber}\n` +
      `📦 Plan: ${c.servicePlan}\n` +
      `💵 Monthly Fee: ₱${c.monthlyFee.toLocaleString()}\n` +
      `🗓️ Due Date: Every ${c.billingDueDay}th of the month\n\n` +
      `Paraan ng Pagbayad:\n` +
      (defaultWallet ? `• GCash: ${defaultWallet.accountNumber} (${defaultWallet.accountName})\n` : '') +
      (defaultBank ? `• ${defaultBank.bankName}: ${defaultBank.accountNumber} (${defaultBank.accountName})\n` : '') +
      `\nPakisend po ang screenshot ng resibo kasama ang inyong Account Number (${c.accountNumber}). Salamat po!`;

    navigator.clipboard.writeText(message);
    setCopiedClientId(c.id);
    showToast('Billing SMS/Messenger template copied to clipboard!', 'success');
    setTimeout(() => setCopiedClientId(null), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Subscriber & Client Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your customer database, active bandwidth plans, monthly billing due cycles, and service records.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search and Status Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, account #, phone, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto overflow-x-auto text-xs">
          {[
            { id: 'all', label: `All (${clients.length})` },
            { id: 'active', label: `Active (${clients.filter(c => c.status === 'active').length})` },
            { id: 'overdue', label: `Overdue (${clients.filter(c => c.status === 'overdue').length})` },
            { id: 'suspended', label: `Suspended (${clients.filter(c => c.status === 'suspended').length})` },
            { id: 'lead', label: `Leads (${clients.filter(c => c.status === 'lead').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Account & Client</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Service Plan & Fee</th>
                <th className="py-3.5 px-4">Due Day</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No clients found matching your search.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr 
                    key={client.id}
                    className="hover:bg-slate-850/60 transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-start space-x-2.5">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="font-bold text-white hover:text-cyan-400 transition text-left cursor-pointer"
                        >
                          <div>{client.name}</div>
                          {client.businessName && (
                            <div className="text-[11px] text-cyan-400/80 font-normal">{client.businessName}</div>
                          )}
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{client.accountNumber} · 📞 {client.phone}</div>
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{client.address || '—'}</div>
                      <div className="text-[11px] text-slate-500">{client.barangayCity}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{client.servicePlan}</div>
                      <div className="text-emerald-400 font-mono font-bold">₱{client.monthlyFee.toLocaleString()}<span className="text-[10px] font-normal text-slate-400">/mo</span></div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">Every {client.billingDueDay}th</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        client.status === 'overdue' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        client.status === 'suspended' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {client.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Copy SMS Reminder */}
                        <button
                          onClick={() => copyBillingReminder(client)}
                          title="Copy SMS/Messenger Billing Reminder"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          {copiedClientId === client.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Create Invoice for this client */}
                        <button
                          onClick={() => onOpenCreateInvoiceForClient(client)}
                          title="Issue Invoice"
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/40 text-emerald-300 transition cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        {/* Create Ticket for this client */}
                        <button
                          onClick={() => onOpenCreateTicketForClient(client)}
                          title="Create Trouble Ticket"
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/40 text-rose-300 transition cursor-pointer"
                        >
                          <LifeBuoy className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Client */}
                        <button
                          onClick={() => handleOpenEdit(client)}
                          title="Edit Subscriber Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Client */}
                        <button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          title="Delete Client"
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

      {/* Client Profile / History Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">{selectedClient.accountNumber}</span>
                <h2 className="text-lg font-bold text-white">{selectedClient.name}</h2>
                {selectedClient.businessName && <div className="text-xs text-slate-400">{selectedClient.businessName}</div>}
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Client Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <div className="text-slate-500 text-[10px]">Contact Phone</div>
                <div className="text-white font-medium mt-0.5">{selectedClient.phone}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">Email</div>
                <div className="text-white font-medium mt-0.5">{selectedClient.email || 'None'}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">Status</div>
                <div className="text-emerald-400 font-bold capitalize mt-0.5">{selectedClient.status}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">Service Plan</div>
                <div className="text-cyan-400 font-semibold mt-0.5">{selectedClient.servicePlan}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">Monthly Fee</div>
                <div className="text-white font-mono font-bold mt-0.5">₱{selectedClient.monthlyFee.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">Billing Cycle</div>
                <div className="text-white font-medium mt-0.5">Every {selectedClient.billingDueDay}th</div>
              </div>
              <div className="col-span-2">
                <div className="text-slate-500 text-[10px]">Address</div>
                <div className="text-slate-300 mt-0.5">{selectedClient.address}, {selectedClient.barangayCity}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">IP / PPPoE</div>
                <div className="text-slate-400 font-mono mt-0.5">{selectedClient.pppoeUser || selectedClient.ipAddress || 'DHCP'}</div>
              </div>
            </div>

            {/* Past Invoices */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Invoice History</span>
              </h3>
              <div className="bg-slate-950 rounded-xl border border-slate-800/80 divide-y divide-slate-800 text-xs">
                {invoices.filter((i) => i.clientId === selectedClient.id).length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">No invoices generated yet for this client.</div>
                ) : (
                  invoices.filter((i) => i.clientId === selectedClient.id).map((inv) => (
                    <div key={inv.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{inv.invoiceNumber} · {inv.billingPeriod}</div>
                        <div className="text-[10px] text-slate-400">Due: {inv.dueDate} {inv.paidAt && `· Paid on ${new Date(inv.paidAt).toLocaleDateString()}`}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white font-mono">₱{inv.amount.toLocaleString()}</div>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Open / Past Tickets */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
                <span>Support & Trouble Tickets</span>
              </h3>
              <div className="bg-slate-950 rounded-xl border border-slate-800/80 divide-y divide-slate-800 text-xs">
                {tickets.filter((t) => t.clientId === selectedClient.id).length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">No support tickets reported.</div>
                ) : (
                  tickets.filter((t) => t.clientId === selectedClient.id).map((t) => (
                    <div key={t.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{t.title}</div>
                        <div className="text-[10px] text-slate-400">#{t.ticketNumber} · Tech: {t.assignedTechnician}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        t.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const c = selectedClient;
                  setSelectedClient(null);
                  onOpenCreateInvoiceForClient(c);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
              >
                + Issue Invoice
              </button>
              <button
                onClick={() => {
                  const c = selectedClient;
                  setSelectedClient(null);
                  onOpenCreateTicketForClient(c);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
              >
                + Dispatch Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{editingClient ? 'Edit Subscriber Information' : 'Onboard New Subscriber'}</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Subscriber Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Business / Establishment (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Santos Piso Wi-Fi Hub"
                    value={formBusiness}
                    onChange={(e) => setFormBusiness(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Contact Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0917-123-4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. client@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Street / House / Zone Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Block 4 Lot 12, San Isidro"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Barangay & City / Municipality</label>
                  <input
                    type="text"
                    placeholder="e.g. Rodriguez, Rizal"
                    value={formBarangayCity}
                    onChange={(e) => setFormBarangayCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Bandwidth Service Plan</label>
                  <input
                    type="text"
                    placeholder="e.g. Home Fiber 50 Mbps"
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Monthly Fee (₱)</label>
                  <input
                    type="number"
                    min="1"
                    value={formMonthlyFee}
                    onChange={(e) => setFormMonthlyFee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Monthly Due Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="15"
                    value={formDueDay}
                    onChange={(e) => setFormDueDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="active">Active Subscriber</option>
                    <option value="overdue">Overdue Balance</option>
                    <option value="suspended">Suspended / Cut</option>
                    <option value="lead">Prospect / Lead</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">IP Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="192.168.10.x"
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">PPPoE Username (Optional)</label>
                  <input
                    type="text"
                    placeholder="client_user"
                    value={formPppoe}
                    onChange={(e) => setFormPppoe(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Technical / Account Notes</label>
                <textarea
                  rows={2}
                  placeholder="Installation notes, fiber drop length, ONU serial number..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition cursor-pointer shadow-md"
                >
                  {submitting ? 'Saving...' : editingClient ? 'Update Subscriber' : 'Save New Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
