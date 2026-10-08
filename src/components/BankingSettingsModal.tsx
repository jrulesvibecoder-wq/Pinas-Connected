import React, { useState } from 'react';
import { 
  Building, 
  CreditCard, 
  Smartphone, 
  Send, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Settings,
  QrCode
} from 'lucide-react';
import { BankingPortalConfig, AppSettings, BankAccount, WalletAccount } from '../types';

interface BankingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankingPortal: BankingPortalConfig;
  settings: AppSettings;
  onUpdateBanking: (updated: BankingPortalConfig) => Promise<void>;
  onUpdateSettings: (updated: Partial<AppSettings>) => Promise<void>;
  showToast: (text: string, type?: 'success' | 'alert' | 'info') => void;
}

export const BankingSettingsModal: React.FC<BankingSettingsModalProps> = ({
  isOpen,
  onClose,
  bankingPortal,
  settings,
  onUpdateBanking,
  onUpdateSettings,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'banking' | 'wallets' | 'telegram' | 'company'>('banking');
  
  // Banking form state
  const [companyName, setCompanyName] = useState(bankingPortal.companyName || '');
  const [companyAddress, setCompanyAddress] = useState(bankingPortal.companyAddress || '');
  const [companyContact, setCompanyContact] = useState(bankingPortal.companyContact || '');
  const [companyEmail, setCompanyEmail] = useState(bankingPortal.companyEmail || '');
  const [termsNote, setTermsNote] = useState(bankingPortal.termsNote || '');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(bankingPortal.bankAccounts || []);
  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>(bankingPortal.walletAccounts || []);

  // Telegram settings
  const [telegramToken, setTelegramToken] = useState(settings.telegramToken || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || '');
  const [telegramAlertsEnabled, setTelegramAlertsEnabled] = useState(settings.telegramAlertsEnabled !== false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Add Bank Account
  const handleAddBank = () => {
    setBankAccounts([
      ...bankAccounts,
      {
        id: `bank-${Date.now()}`,
        bankName: 'Development Bank of the Philippines (DBP)',
        accountName: companyName || 'PINAS CONNECTED TELECOM',
        accountNumber: '',
        instructions: 'Pay via DBP Digital, PESONet, or InstaPay. State Account # as remark.',
        active: true,
      },
    ]);
  };

  // Add Wallet
  const handleAddWallet = () => {
    setWalletAccounts([
      ...walletAccounts,
      {
        id: `wallet-${Date.now()}`,
        walletName: 'GCash / QRPh',
        accountName: 'PINAS CONNECTED',
        accountNumber: '0917-xxx-xxxx',
        instructions: 'Scan QRPh or Send Money to mobile number.',
        active: true,
      },
    ]);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await onUpdateBanking({
        companyName,
        companyAddress,
        companyContact,
        companyEmail,
        termsNote,
        bankAccounts,
        walletAccounts,
      });

      await onUpdateSettings({
        companyName,
        companyAddress,
        companyPhone: companyContact,
        companyEmail,
        telegramToken,
        telegramChatId,
        telegramAlertsEnabled,
      });

      showToast('Banking channels and CRM settings saved!', 'success');
      onClose();
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setSaving(false);
    }
  };

  // Test Telegram connection
  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    try {
      // Save telegram settings first
      await onUpdateSettings({ telegramToken, telegramChatId, telegramAlertsEnabled });
      const res = await fetch('/api/telegram/test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Telegram test alert sent successfully! Check your phone.', 'success');
      } else {
        showToast(data.message || 'Telegram delivery failed.', 'alert');
      }
    } catch (e: any) {
      showToast(e.message, 'alert');
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Payment Gateway, Banking & Telegram Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('banking')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'banking' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>DBP & Bank Accounts</span>
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'wallets' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>GCash & QRPh</span>
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'telegram' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram Bot Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'company' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ISP Company Profile</span>
          </button>
        </div>

        {/* Tab 1: Bank Accounts (DBP, Landbank, etc.) */}
        {activeTab === 'banking' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Remittance Bank Accounts</h3>
                <p className="text-slate-400 text-[11px]">These accounts will appear on client Statements of Account and Invoices.</p>
              </div>
              <button
                type="button"
                onClick={handleAddBank}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bank</span>
              </button>
            </div>

            <div className="space-y-3">
              {bankAccounts.map((b, idx) => (
                <div key={b.id || idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 text-xs">Bank #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setBankAccounts(bankAccounts.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-400 text-[11px]">Bank Name</label>
                      <input
                        type="text"
                        value={b.bankName}
                        onChange={(e) => {
                          const updated = [...bankAccounts];
                          updated[idx].bankName = e.target.value;
                          setBankAccounts(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px]">Account Name</label>
                      <input
                        type="text"
                        value={b.accountName}
                        onChange={(e) => {
                          const updated = [...bankAccounts];
                          updated[idx].accountName = e.target.value;
                          setBankAccounts(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px]">Account Number</label>
                      <input
                        type="text"
                        value={b.accountNumber}
                        onChange={(e) => {
                          const updated = [...bankAccounts];
                          updated[idx].accountNumber = e.target.value;
                          setBankAccounts(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Remittance Instructions / Remark Note</label>
                    <input
                      type="text"
                      value={b.instructions || ''}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[idx].instructions = e.target.value;
                        setBankAccounts(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Wallets (GCash & QRPh) */}
        {activeTab === 'wallets' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Mobile Wallets & QRPh</h3>
                <p className="text-slate-400 text-[11px]">Configured GCash, Maya, and QRPh accounts for mobile subscribers.</p>
              </div>
              <button
                type="button"
                onClick={handleAddWallet}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Wallet</span>
              </button>
            </div>

            <div className="space-y-3">
              {walletAccounts.map((w, idx) => (
                <div key={w.id || idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 text-xs">Wallet #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setWalletAccounts(walletAccounts.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-400 text-[11px]">Wallet Name (e.g. GCash / QRPh)</label>
                      <input
                        type="text"
                        value={w.walletName}
                        onChange={(e) => {
                          const updated = [...walletAccounts];
                          updated[idx].walletName = e.target.value;
                          setWalletAccounts(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px]">Account Name</label>
                      <input
                        type="text"
                        value={w.accountName}
                        onChange={(e) => {
                          const updated = [...walletAccounts];
                          updated[idx].accountName = e.target.value;
                          setWalletAccounts(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px]">Mobile Number</label>
                      <input
                        type="text"
                        value={w.accountNumber}
                        onChange={(e) => {
                          const updated = [...walletAccounts];
                          updated[idx].accountNumber = e.target.value;
                          setWalletAccounts(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px]">Payment Note / QRPh Instruction</label>
                    <input
                      type="text"
                      value={w.instructions || ''}
                      onChange={(e) => {
                        const updated = [...walletAccounts];
                        updated[idx].instructions = e.target.value;
                        setWalletAccounts(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Telegram Bot */}
        {activeTab === 'telegram' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-white">Telegram Field Dispatch & Alert Bot</h3>
              <p className="text-slate-400 text-[11px]">
                Receive instant notifications when new trouble tickets are filed, payments are received, or quotations are accepted.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Telegram Bot Token</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
                <p className="text-[10px] text-slate-500">Create a bot on Telegram via @BotFather to get your token.</p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Telegram Chat ID / Group ID</label>
                <input
                  type="text"
                  placeholder="e.g. -100123456789 or 987654321"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
                <p className="text-[10px] text-slate-500">Your personal user ID or technician dispatch group ID.</p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="enableAlerts"
                  checked={telegramAlertsEnabled}
                  onChange={(e) => setTelegramAlertsEnabled(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="enableAlerts" className="text-slate-300 font-medium cursor-pointer">
                  Enable Real-Time Dispatch Notifications
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingTelegram ? 'Sending Test...' : 'Send Live Test Message to Telegram'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: ISP Company Profile */}
        {activeTab === 'company' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-white">ISP Company & Letterhead Information</h3>
              <p className="text-slate-400 text-[11px]">This information appears on the header of all official Quotations and Statements of Account.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Company / Provider Legal Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Billing Support Hotline</label>
                  <input
                    type="text"
                    value={companyContact}
                    onChange={(e) => setCompanyContact(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Office Address / Operations Center</label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Support & Billing Email</label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Invoice Terms / Payment Notice Footer</label>
                <textarea
                  rows={2}
                  value={termsNote}
                  onChange={(e) => setTermsNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer text-xs font-semibold shadow-md flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
