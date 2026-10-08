import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Wrench, 
  User, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  Send,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { Ticket, Client, Employee, TicketCategory, TicketPriority, TicketStatus } from '../types';

interface TicketServiceManagerProps {
  tickets: Ticket[];
  clients: Client[];
  employees?: Employee[];
  onRefreshData: () => void;
  showToast: (text: string, type?: 'success' | 'alert' | 'info') => void;
  initialFilterTechnician?: string;
  onNavigateToEmployees?: () => void;
}

export const TicketServiceManager: React.FC<TicketServiceManagerProps> = ({
  tickets,
  clients,
  employees = [],
  onRefreshData,
  showToast,
  initialFilterTechnician = 'all',
  onNavigateToEmployees,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTechnician, setFilterTechnician] = useState<string>(initialFilterTechnician);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState<Ticket | null>(null);
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('no_internet');
  const [priority, setPriority] = useState<TicketPriority>('high');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('Unassigned (Queue)');

  // Resolve State
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  // Quick Client Selection
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === 'custom') {
      setClientName('');
      setClientPhone('');
      setClientAddress('');
      return;
    }
    const c = clients.find((cl) => cl.id === clientId);
    if (c) {
      setClientName(c.name);
      setClientPhone(c.phone);
      setClientAddress(`${c.address}, ${c.barangayCity}`.trim());
    }
  };

  // Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Ticket Title and Description are required.', 'alert');
      return;
    }

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId && selectedClientId !== 'custom' ? selectedClientId : undefined,
          clientName: clientName.trim() || 'Walk-In / Guest',
          clientPhone: clientPhone.trim(),
          clientAddress: clientAddress.trim(),
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          employeeId: selectedEmployeeId || undefined,
          assignedTechnician: assignedTechnician.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Ticket #${data.ticket.ticketNumber} dispatched to field crew!`, 'success');
        setIsNewTicketOpen(false);
        setTitle('');
        setDescription('');
        setSelectedEmployeeId('');
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    }
  };

  // Re-assign ticket
  const handleReassign = async (ticketId: string, empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    const techName = emp ? emp.name : 'Unassigned (Queue)';
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId || null, assignedTechnician: techName }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Ticket reassigned to ${techName}`, 'info');
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    }
  };

  // Submit Ticket Resolution
  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    setSubmittingResolve(true);
    try {
      const res = await fetch(`/api/tickets/${resolvingTicket.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionNotes: resolutionNotes.trim() || 'Service restored and verified.',
          materialsUsed: materialsUsed.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Ticket #${resolvingTicket.ticketNumber} marked as RESOLVED!`, 'success');
        setResolvingTicket(null);
        setResolutionNotes('');
        setMaterialsUsed('');
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setSubmittingResolve(false);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async (id: string, num: string) => {
    if (!window.confirm(`Delete ticket #${num}?`)) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Ticket deleted.', 'info');
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    }
  };

  // Copy Ticket Dispatch info for WhatsApp/Telegram/Viber
  const copyJobOrder = (t: Ticket) => {
    const text = `🚨 FIELD SERVICE / JOB ORDER: #${t.ticketNumber}\n\n` +
      `Priority: ${t.priority.toUpperCase()}\n` +
      `Category: ${t.category.toUpperCase()}\n` +
      `Subscriber: ${t.clientName}\n` +
      `Phone: ${t.clientPhone}\n` +
      `Address: ${t.clientAddress}\n\n` +
      `Issue: ${t.title}\n` +
      `Details: ${t.description}\n` +
      `Assigned Tech: ${t.assignedTechnician}\n` +
      `Dispatched: ${new Date(t.createdAt).toLocaleString()}\n\n` +
      `Please report back once restored.`;

    navigator.clipboard.writeText(text);
    setCopiedTicketId(t.id);
    showToast('Job order text copied for technician dispatch!', 'success');
    setTimeout(() => setCopiedTicketId(null), 3000);
  };

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(q) ||
      t.clientName.toLowerCase().includes(q) ||
      t.clientPhone.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.assignedTechnician.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesTech = 
      filterTechnician === 'all' || 
      t.employeeId === filterTechnician || 
      t.assignedTechnician.toLowerCase().includes(filterTechnician.toLowerCase());

    return matchesSearch && matchesStatus && matchesPriority && matchesTech;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5 text-rose-400" />
            <span>Support Tickets & Field Service Dispatch</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log subscriber outage reports, assign technicians, track fiber cuts, and dispatch service job orders.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {onNavigateToEmployees && (
            <button
              onClick={onNavigateToEmployees}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Manage Team ({employees.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              if (clients.length > 0) handleSelectClient(clients[0].id);
              setIsNewTicketOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch New Ticket</span>
          </button>
        </div>
      </div>

      {/* Ticket Priority Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs font-medium uppercase">Open & Active Tickets</div>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {tickets.filter(t => t.status === 'open' || t.status === 'dispatched').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting resolution</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs font-medium uppercase">Critical Outages</div>
          <div className="text-xl font-bold text-rose-400 font-mono mt-1">
            {tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved').length}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Fiber cuts / Core downtime</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs font-medium uppercase">Dispatched to Crew</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">
            {tickets.filter(t => t.status === 'dispatched').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Field technician on-site</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-xs font-medium uppercase">Resolved / Closed</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Service restored</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tickets, client, issue, technician..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Technician Filter Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900 text-white">All Technicians</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name} className="bg-slate-900 text-white">
                  👷 {emp.name} ({emp.role})
                </option>
              ))}
            </select>
            {filterTechnician !== 'all' && (
              <button
                onClick={() => setFilterTechnician('all')}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold ml-1"
                title="Clear tech filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto text-xs">
            {[
              { id: 'all', label: `All (${tickets.length})` },
              { id: 'open', label: `Open (${tickets.filter(t => t.status === 'open').length})` },
              { id: 'dispatched', label: `Dispatched (${tickets.filter(t => t.status === 'dispatched').length})` },
              { id: 'resolved', label: `Resolved (${tickets.filter(t => t.status === 'resolved').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            No trouble tickets found matching the selected filter.
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div 
              key={t.id} 
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-400">{t.ticketNumber}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    t.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' :
                    t.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {t.priority}
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    🏷️ {t.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Logged {new Date(t.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase ${
                    t.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    t.status === 'dispatched' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-white">{t.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{t.description}</p>
              </div>

              {/* Resolution Notes if Resolved */}
              {t.status === 'resolved' && t.resolutionNotes && (
                <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resolution Report:</span>
                  </div>
                  <p>{t.resolutionNotes}</p>
                  {t.materialsUsed && (
                    <div className="text-[11px] text-emerald-400/80">Materials Used: {t.materialsUsed}</div>
                  )}
                </div>
              )}

              {/* Client & Tech Footer Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/70 text-xs">
                <div className="flex items-center space-x-4 text-slate-400 flex-wrap">
                  <div className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-medium text-white">{t.clientName}</span>
                    <span className="text-[11px] text-slate-500">({t.clientPhone})</span>
                  </div>
                  {t.clientAddress && (
                    <div className="flex items-center space-x-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-xs">{t.clientAddress}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5 text-cyan-400">
                    <Wrench className="w-3.5 h-3.5" />
                    {employees.length > 0 && t.status !== 'resolved' ? (
                      <select
                        value={t.employeeId || ''}
                        onChange={(e) => handleReassign(t.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-0.5 text-[11px] text-cyan-300 focus:outline-none cursor-pointer"
                        title="Click to reassign technician"
                      >
                        <option value="">{t.assignedTechnician || 'Unassigned'}</option>
                        {employees.map((em) => (
                          <option key={em.id} value={em.id}>
                            Reassign: {em.name} ({em.role})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{t.assignedTechnician}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyJobOrder(t)}
                    title="Copy Job Order for Telegram/Messenger"
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-[11px] transition cursor-pointer"
                  >
                    {copiedTicketId === t.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Dispatch Text</span>
                  </button>

                  {t.status !== 'resolved' && (
                    <button
                      onClick={() => setResolvingTicket(t)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] transition cursor-pointer flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve Ticket</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteTicket(t.id, t.ticketNumber)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolve Ticket Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mark Ticket #{resolvingTicket.ticketNumber} Resolved</span>
              </h2>
              <button
                onClick={() => setResolvingTicket(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="font-bold text-white">{resolvingTicket.title}</div>
              <div className="text-slate-400 mt-0.5">Client: {resolvingTicket.clientName} · Tech: {resolvingTicket.assignedTechnician}</div>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Resolution Notes / Action Taken *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Spliced cut fiber strand near pole 14. Cleaned fiber connectors and verified optical power at -18 dBm."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Materials & Hardware Used (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 10m drop cable, 1 mechanical splice, 2 zip ties"
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolve}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shadow-md"
                >
                  {submittingResolve ? 'Closing...' : 'Close & Restore Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <LifeBuoy className="w-4 h-4 text-rose-400" />
                <span>Dispatch Support & Trouble Ticket</span>
              </h2>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Select Subscriber</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="custom">-- Walk-In / Non-Directory Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.accountNumber}) — 📞 {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Subscriber Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="0917-xxx-xxxx"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Service Location / Address</label>
                <input
                  type="text"
                  placeholder="Street, Barangay, Municipality"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Issue Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="no_internet">Loss of Internet (No Signal)</option>
                    <option value="fiber_cut">Fiber Cable Cut / LOS Red Light</option>
                    <option value="slow_browsing">Slow Browsing / High Latency</option>
                    <option value="router_config">Wi-Fi Password / Router Config</option>
                    <option value="installation">New Subscriber Installation</option>
                    <option value="relocation">Modem / Cable Relocation</option>
                    <option value="billing">Billing & Payment Issue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                  >
                    <option value="critical">🚨 Critical Outage</option>
                    <option value="high">⚠️ High Priority</option>
                    <option value="medium">📌 Medium Priority</option>
                    <option value="low">☕ Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red LOS Light blinking on fiber ONU"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Detailed Description of Problem *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe symptoms, customer reported time, and troubleshooting done..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Assign to Employee / Technician</label>
                {employees.length > 0 ? (
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => {
                      setSelectedEmployeeId(e.target.value);
                      const emp = employees.find((em) => em.id === e.target.value);
                      if (emp) setAssignedTechnician(`${emp.name} (${emp.role})`);
                      else setAssignedTechnician('Unassigned (Queue)');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="">-- Unassigned (Dispatch Queue) --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        👷 {emp.name} — {emp.role.toUpperCase()} {emp.assignedArea ? `(${emp.assignedArea})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. Field Team A (Kuya Mark)"
                      value={assignedTechnician}
                      onChange={(e) => setAssignedTechnician(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-slate-500">No registered team members yet.</span>
                      {onNavigateToEmployees && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewTicketOpen(false);
                            onNavigateToEmployees();
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline"
                        >
                          + Add Employee / Tech in Team Tab
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition cursor-pointer shadow-md"
                >
                  Dispatch Trouble Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
