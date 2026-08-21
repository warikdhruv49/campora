import { useState } from 'react';
import { User, Palette, ShieldCheck, Database, Download, AlertTriangle, GraduationCap, MailWarning, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { authService } from '../services/index.js';
import { transactionService, accountService, categoryService } from '../services/index.js';
import { apiError } from '../services/apiClient.js';
import Button from '../components/ui/Button.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { CURRENCIES, STUDENT_TYPE_LABELS, MAIN_GOAL_LABELS } from '../config/constants.js';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  return (
    <div className="max-w-3xl space-y-4 lg:space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-lg font-bold text-txt-primary tracking-tight">Settings</h1>
        <p className="text-xs text-txt-secondary mt-0.5">Profile, preferences and data controls.</p>
      </div>

      {!user?.emailVerified && <VerificationBanner />}
      <ProfileCard user={user} onUpdate={updateUser} />
      <StudentCard user={user} onUpdate={updateUser} />
      <PreferencesCard user={user} onUpdate={updateUser} />
      <SecurityCard />
      <DataCard user={user} toast={toast} />
    </div>
  );
}

function VerificationBanner() {
  const toast = useToast();
  const [sending, setSending] = useState(false);

  const resend = async () => {
    setSending(true);
    try {
      const result = await authService.resendVerification();
      if (result.devVerifyUrl) {
        window.open(result.devVerifyUrl, '_blank');
        toast.success('Verification link opened in a new tab');
      } else {
        toast.success('Verification link sent');
      }
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="panel p-4 border-[#f5a623]/40 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <MailWarning size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-txt-primary">Your email is not verified yet</p>
          <p className="text-2xs text-txt-muted mt-0.5">Verify to keep your account recoverable.</p>
        </div>
      </div>
      <Button size="sm" variant="outline" loading={sending} onClick={resend}>
        Resend verification
      </Button>
    </section>
  );
}

function ProfileCard({ user, onUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      const updated = await authService.updateProfile({ name: name.trim() });
      onUpdate(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2 mb-4">
        <User size={15} className="text-txt-muted" /> Profile
      </h2>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <Input label="Email" value={user?.email || ''} disabled hint="Email cannot be changed" />
            {user?.emailVerified && (
              <p className="mt-1.5 flex items-center gap-1 text-2xs text-gain">
                <MailCheck size={11} /> Verified
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={saving}>
            Save Profile
          </Button>
        </div>
      </form>
    </section>
  );
}

function StudentCard({ user, onUpdate }) {
  const [form, setForm] = useState({
    studentType: user?.studentType || '',
    monthlyMoney: user?.monthlyMoney ?? '',
    mainGoal: user?.mainGoal || '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        studentType: form.studentType || null,
        monthlyMoney: form.monthlyMoney === '' ? null : Number(form.monthlyMoney),
        mainGoal: form.mainGoal || null,
      });
      onUpdate(updated);
      toast.success('Student profile saved');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2 mb-4">
        <GraduationCap size={15} className="text-txt-muted" /> Student Profile
      </h2>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="I am a…" value={form.studentType} onChange={set('studentType')}>
            <option value="">Prefer not to say</option>
            {Object.entries(STUDENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Monthly money (₹)"
            type="number"
            min="0"
            placeholder="e.g. 15000"
            value={form.monthlyMoney ?? ''}
            onChange={set('monthlyMoney')}
          />
          <Select label="Main goal" value={form.mainGoal} onChange={set('mainGoal')}>
            <option value="">Not set</option>
            {Object.entries(MAIN_GOAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-2xs text-txt-muted">Helps tailor insights and budget suggestions to student life.</p>
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={saving}>
            Save Student Profile
          </Button>
        </div>
      </form>
    </section>
  );
}

function PreferencesCard({ user, onUpdate }) {
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [density, setDensity] = useState(localStorage.getItem('campora_density') || 'comfortable');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('campora_density', density);
      const updated = await authService.updateProfile({ currency });
      onUpdate(updated);
      toast.success('Preferences saved');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2 mb-4">
        <Palette size={15} className="text-txt-muted" /> Preferences
      </h2>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Default currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} — {c.label}
              </option>
            ))}
          </Select>
          <Select label="Interface density" value={density} onChange={(e) => setDensity(e.target.value)}>
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </Select>
        </div>
        <p className="text-2xs text-txt-muted">Campora uses a dark terminal theme by design.</p>
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={saving}>
            Save Preferences
          </Button>
        </div>
      </form>
    </section>
  );
}

function SecurityCard() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirm) {
      setError('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 8 || !(/[a-zA-Z]/.test(form.newPassword) && /[0-9]/.test(form.newPassword))) {
      setError('New password needs 8+ characters with a letter and number');
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2 mb-4">
        <ShieldCheck size={15} className="text-txt-muted" /> Security
      </h2>
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-loss/40 bg-loss-dim px-3 py-2 text-xs text-loss" role="alert">
            {error}
          </p>
        )}
        <Input label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="New password" type="password" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" variant="outline" loading={saving}>
            Change Password
          </Button>
        </div>
      </form>
    </section>
  );
}

function DataCard({ user, toast }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const exportData = async () => {
    try {
      const [accounts, categories, firstPage] = await Promise.all([
        accountService.list(),
        categoryService.list(),
        transactionService.list({ limit: 100 }),
      ]);
      let allTransactions = [...firstPage.items];
      const { totalPages } = firstPage.meta;
      for (let page = 2; page <= totalPages; page += 1) {
        const next = await transactionService.list({ limit: 100, page });
        allTransactions = allTransactions.concat(next.items);
      }
      const payload = {
        exportedAt: new Date().toISOString(),
        user: { name: user?.name, email: user?.email, currency: user?.currency },
        accounts,
        categories,
        transactions: allTransactions,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campora-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported as JSON');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2 mb-4">
        <Database size={15} className="text-txt-muted" /> Data Management
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stroke bg-base-850 px-4 py-3.5">
        <div>
          <p className="text-xs font-medium text-txt-primary">Export your financial data</p>
          <p className="text-2xs text-txt-muted mt-0.5">Download accounts, categories and transactions as JSON.</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportData}>
          <Download size={14} /> Export
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-loss/30 bg-loss-dim/50 px-4 py-3.5">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-loss shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-txt-primary">Danger zone</p>
            <p className="text-2xs text-txt-muted mt-0.5">Deleting your account is permanent and removes all data.</p>
          </div>
        </div>
        <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
          Delete Account
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          toast.info('Account deletion requires confirmation via support for safety.');
        }}
        title="Delete account"
        message="For safety, account deletion requires email confirmation through support. Your data remains intact until then."
        confirmLabel="Understood"
      />
    </section>
  );
}
