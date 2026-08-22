import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowDownUp, Wallet, LineChart, PiggyBank } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import GoogleButton from '../../components/ui/GoogleButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiError } from '../../services/apiClient.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';

const FEATURES = [
  { icon: ArrowDownUp, title: 'Track income & expenses', text: 'Log earnings and spending as they happen.' },
  { icon: Wallet, title: 'Manage every account', text: 'Checking, savings and wallets in one view.' },
  { icon: LineChart, title: 'Understand monthly cash flow', text: 'See exactly where your money goes.' },
  { icon: PiggyBank, title: 'Build better saving habits', text: 'Budgets and goals that fit student life.' },
];

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
    <div className="min-h-screen relative overflow-hidden bg-base-900">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,160,176,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(148,160,176,0.035) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 100%)',
          }}
        />
        <div className="absolute -top-40 left-[8%] w-[520px] h-[340px] bg-brand/[0.05] blur-[130px] rounded-full" />
        <div className="absolute -bottom-32 right-[6%] w-[460px] h-[300px] bg-gain/[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-5 py-10 sm:px-8">
        <div className="grid flex-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-x-16 xl:grid-cols-[minmax(0,1fr)_480px] xl:gap-x-24">
        <div className="order-1 flex flex-col items-start animate-fadeIn lg:col-start-1 lg:row-start-1">
          <Logo size="large" />

          <h1 className="mt-9 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-txt-primary sm:text-5xl xl:text-[54px]">
            Take control of your{' '}
            <span className="text-gain">student money</span>.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-txt-secondary sm:text-base">
            Track spending, manage accounts, understand your cash flow and build
            better saving habits — from one personal finance dashboard.
          </p>
        </div>

        <div className="order-2 mt-10 w-full max-w-[460px] justify-self-center lg:col-start-2 lg:row-span-2 lg:mt-0 lg:justify-self-end animate-slideUp">
          <div className="panel rounded-2xl p-7 shadow-panel sm:p-9">
            <h2 className="text-2xl font-semibold tracking-tight text-txt-primary">Welcome back</h2>
            <p className="mt-1.5 text-sm text-txt-secondary">
              Sign in to access your CAMPORA finance terminal.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-loss/25 bg-loss-dim/50 px-3 py-2.5"
                >
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

            <GoogleButton
              onSuccess={() => navigate('/', { replace: true })}
              onError={setError}
            />

            <p className="mt-7 border-t border-stroke pt-5 text-center text-xs text-txt-secondary">
              New to CAMPORA?{' '}
              <Link to="/register" className="font-semibold text-gain transition-colors hover:text-[#00e6a2] hover:underline underline-offset-2">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <div className="order-3 mt-12 max-w-lg lg:col-start-1 lg:row-start-2 lg:mt-14 animate-fadeIn">
          <ul className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand/10 border border-stroke flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-gain" />
                </span>
                <span>
                  <span className="block text-xs font-semibold text-txt-primary">{title}</span>
                  <span className="block mt-0.5 text-2xs leading-relaxed text-txt-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 hidden max-w-md panel px-5 py-4 sm:block">
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
        </div>
        </div>

        <p className="mt-10 pb-1 text-center text-2xs text-txt-muted">
          Charts powered by{' '}
          <a
            href="https://www.tradingview.com/lightweight-charts/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-stroke underline-offset-2 transition-colors hover:text-txt-secondary"
          >
            TradingView Lightweight Charts
          </a>
        </p>
      </div>
    </div>
  );
}
