import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  UserCheck, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock,
  Sparkles,
  LifeBuoy
} from 'lucide-react';
import { Employee, Ticket } from '../types';

interface EmployeeManagerProps {
  employees: Employee[];
  tickets: Ticket[];
  onRefreshData: () => void;
  showToast: (text: string, type?: 'success' | 'alert' | 'info') => void;
  onViewTicketsForEmployee: (employeeName: string) => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  tickets,
  onRefreshData,
  showToast,
  onViewTicketsForEmployee,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<'technician' | 'staff' | 'admin' | 'billing'>('technician');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [assignedArea, setAssignedArea] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setName('');
    setRole('technician');
    setPhone('');
    setEmail('');
    setAssignedArea('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setRole(emp.role);
    setPhone(emp.phone);
    setEmail(emp.email || '');
    setAssignedArea(emp.assignedArea || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Employee Name and Phone are required.', 'alert');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        role,
        phone: phone.trim(),
        email: email.trim() || undefined,
        assignedArea: assignedArea.trim() || undefined,
      };

      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingEmployee ? 'Employee details updated.' : 'New team member added!', 'success');
        setIsAddModalOpen(false);
        onRefreshData();
      } else {
        showToast(data.error || 'Failed to save employee.', 'alert');
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, empName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${empName} from your team?`)) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Employee removed.', 'info');
        onRefreshData();
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Employees & Field Technicians Team</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your company's installers, linemen, billing staff, and assign trouble tickets directly to them.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee / Tech</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.length === 0 ? (
          <div className="col-span-full bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No employees or technicians added yet. Click <strong>"+ Add Employee / Tech"</strong> above to register your crew so you can assign trouble tickets to them!
          </div>
        ) : (
          employees.map((emp) => {
            const activeAssignedCount = tickets.filter(
              (t) => (t.status === 'open' || t.status === 'dispatched') && (t.assignedTechnician === emp.name || t.employeeId === emp.id)
            ).length;

            return (
              <div 
                key={emp.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs uppercase">
                      {emp.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{emp.name}</h3>
                      <span className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                        emp.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        emp.role === 'technician' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        emp.role === 'billing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {emp.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      title="Edit Employee"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id, emp.name)}
                      title="Delete Employee"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{emp.phone}</span>
                  </div>
                  {emp.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  )}
                  {emp.assignedArea && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{emp.assignedArea}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Tickets Badge */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-slate-400 text-[11px]">Active Tickets:</span>
                    <strong className={activeAssignedCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {activeAssignedCount}
                    </strong>
                  </div>

                  {activeAssignedCount > 0 && (
                    <button
                      onClick={() => onViewTicketsForEmployee(emp.name)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
                    >
                      View Assigned →
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{editingEmployee ? 'Edit Team Member' : 'Add Employee / Technician'}</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kuya Mark (Lineman/Tech)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Company Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="technician">Field Technician / Lineman</option>
                    <option value="staff">Operations / Staff</option>
                    <option value="billing">Billing Officer</option>
                    <option value="admin">Admin / Supervisor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="0917-xxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="tech@pinasconnected.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Assigned Sector / Barangay (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. San Isidro / Sector North"
                  value={assignedArea}
                  onChange={(e) => setAssignedArea(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition cursor-pointer shadow-md"
                >
                  {submitting ? 'Saving...' : editingEmployee ? 'Update Member' : 'Add Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
