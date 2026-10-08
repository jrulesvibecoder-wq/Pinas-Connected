import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  CreditCard, 
  FileText, 
  LifeBuoy, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  Lock, 
  Mail, 
  Phone, 
  TrendingUp,
  Receipt
} from 'lucide-react';
import { User } from '../types';

interface LandingAuthViewProps {
  onLoginSuccess: (user: User) => void;
  onExploreDemo: () => void;
  showToast: (text: string, type?: 'success' | 'alert' | 'info') => void;
}

export const LandingAuthView: React.FC<LandingAuthViewProps> = ({
  onLoginSuccess,
  onExploreDemo,
  showToast,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your email.', 'alert');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        onLoginSuccess(data.user);
      } else {
        showToast(data.error || 'Account not found. Please register.', 'alert');
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Super Admin Login
  const handleQuickAdminLogin = async (targetEmail: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        showToast(`Logged in as Super Admin (${data.user.name})!`, 'success');
        onLoginSuccess(data.user);
      } else {
        showToast(data.error || 'Sign in error.', 'alert');
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and Email are required.', 'alert');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          companyName: companyName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        showToast(`Welcome ${data.user.companyName}! Workspace created.`, 'success');
        onLoginSuccess(data.user);
      } else {
        showToast(data.error || 'Registration failed.', 'alert');
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg text-white font-black text-sm">
            PC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-base tracking-tight">PINAS CONNECTED</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                CRM CLOUD
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              ISP Billing, Quotations & Trouble Ticketing
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuickAdminLogin('admin@ptppulse.local')}
            className="hidden sm:flex items-center space-x-1.5 text-xs text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 px-3 py-1.5 rounded-xl transition cursor-pointer font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Super Admin Sign In</span>
          </button>

          <button
            onClick={onExploreDemo}
            className="text-xs font-semibold text-cyan-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-1.5 rounded-xl transition cursor-pointer"
          >
            Live Demo →
          </button>
        </div>
      </header>

      {/* Hero Section & Auth Card */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side: Pitch */}
        <div className="flex-1 space-y-6 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailored for Philippine & Global ISPs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            The Complete CRM for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Internet Providers</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Stop losing track of monthly subscriber fees and messy quotes. Pinas Connected provides automated billing cycles, professional client quotations, trouble tickets tracking, and GCash & DBP remittance reconciliation in one unified dashboard.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Monthly Billing & SOAs</div>
                <div className="text-slate-400 mt-0.5">Automated batch invoice generation, overdue tracking, and printable Statement of Account.</div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Proposals & Quotations</div>
                <div className="text-slate-400 mt-0.5">Formal estimates for fiber drops, P2P antennas, and labor with 1-click client conversion.</div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Trouble Ticket Dispatch</div>
                <div className="text-slate-400 mt-0.5">Track LOS red lights, fiber cuts, technician dispatch, and Telegram alerts.</div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">DBP & GCash Channels</div>
                <div className="text-slate-400 mt-0.5">Built-in bank transfer instructions, QRPh scanning, and instant receipt verification.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="w-full max-w-md bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Tab Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                mode === 'login' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                mode === 'register' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register New ISP
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Account Email *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@ptppulse.local or your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2 text-xs"
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In to CRM Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick One-Click Admin Sign In */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickAdminLogin('admin@ptppulse.local')}
                  className="w-full py-2.5 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/60 rounded-xl text-purple-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>One-Click Super Admin (admin@ptppulse.local)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAdminLogin('jrulesvibecoder@gmail.com')}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <span>Sign In as Owner (jrulesvibecoder@gmail.com)</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-[11px] flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-200">ISP Administrator Account:</span> You will be granted full Admin privileges to add employee accounts, manage subscribers, generate DBP/GCash billing, and assign trouble tickets to technicians.
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ISP / Company Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Baybayin Wireless & Fiber Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Administrator Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junel Ruales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@isp.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="0917-xxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2 text-xs"
              >
                <span>{submitting ? 'Creating Workspace...' : 'Create ISP & Enter as Admin 👑'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <span>© 2026 <b>Pinas Connected</b> — High-Performance Telecom CRM for Philippine & Global WISPs.</span>
      </footer>
    </div>
  );
};
