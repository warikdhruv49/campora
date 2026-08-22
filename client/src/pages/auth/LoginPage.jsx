import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowDownUp, Wallet, LineChart } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import GoogleButton from '../../components/ui/GoogleButton.jsx';
import AuthPageLayout, { AuthCard, AuthPoints } from '../../components/auth/AuthPageLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiError } from '../../services/apiClient.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';

export default function LoginPage() {
  usePageMeta({
    title: 'Sign in · CAMPORA — Student Personal Finance Tracker',
    description:
      'Sign in to CAMPORA to track income, expenses, accounts and savings in your personal student finance dashboard.',
    canonicalPath: '/login',
  });

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      headline={
        <>
          Take control of your <span className="text-gain">student money</span>.
        </>
      }
      supporting="CAMPORA is a student-focused personal finance dashboard — track spending, manage accounts, understand cash flow and build better saving habits."
      aside={
        <>
          <AuthPoints
            title="Why CAMPORA?"
            points={[
              'Track income and expenses',
              'Manage all your accounts in one place',
              'Understand where your money goes',
            ]}
            icons={[ArrowDownUp, Wallet, LineChart]}
          />

          <div className="max-w-md panel px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="label-xs">Monthly overview</p>
              <svg width="72" height="22" viewBox="0 0 72 22" fill="none" aria-hidden="true" className="opacity-70">
                <path d="M1 18 L11 15 L21 16 L31 11 L41 12 L51 7 L61 8 L71 3" stroke="#00d492" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <dl className="mt-3 grid grid-cols-4 gap-3">
              <div>
                <dt className="text-2xs uppercase tracking-wider text-txt-muted">Income</dt>
                <dd className="num mt-1 text-sm font-semibold text-gain">+&#8377;18,500</dd>
              </div>
              <div>
                <dt className="text-2xs uppercase tracking-wider text-txt-muted">Spent</dt>
                <dd className="num mt-1 text-sm font-semibold text-loss">&#8722;&#8377;11,240</dd>
              </div>
              <div>
                <dt className="text-2xs uppercase tracking-wider text-txt-muted">Saved</dt>
                <dd className="num mt-1 text-sm font-semibold text-txt-primary">&#8377;7,260</dd>
              </div>
              <div>
                <dt className="text-2xs uppercase tracking-wider text-txt-muted">Savings rate</dt>
                <dd className="num mt-1 text-sm font-semibold text-gain">39.2%</dd>
              </div>
            </dl>
          </div>

          <p className="text-xs leading-relaxed text-txt-muted">
            Your data stays private with secure, encrypted accounts — and CAMPORA
            is completely free for students.
          </p>
        </>
      }
    >
      <AuthCard>
        <h2 className="text-2xl font-semibold tracking-tight text-txt-primary">Welcome back</h2>
        <p className="mt-1.5 text-sm text-txt-secondary">Sign in to continue managing your money with CAMPORA.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-loss/25 bg-loss-dim/50 px-3 py-2.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0 text-loss" />
              <p className="text-xs leading-relaxed text-loss">{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="h-11"
            required
          />

          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-[34px] text-txt-muted hover:text-txt-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              <Link to="/forgot-password" className="text-xs text-txt-muted transition-colors hover:text-gain">
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button type="submit" loading={loading} size="lg" className="h-12 w-full text-sm tracking-wide active:scale-[0.99]">
            Sign In
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-stroke" />
          <span className="text-2xs uppercase tracking-widest text-txt-muted">or</span>
          <span className="h-px flex-1 bg-stroke" />
        </div>

        <GoogleButton onSuccess={() => navigate('/', { replace: true })} onError={setError} />

        <p className="mt-7 border-t border-stroke pt-5 text-center text-xs text-txt-secondary">
          New to CAMPORA?{' '}
          <Link to="/register" className="font-semibold text-gain transition-colors hover:text-[#00e6a2] hover:underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </AuthCard>
    </AuthPageLayout>
  );
}
