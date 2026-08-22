import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import GoogleButton from '../../components/ui/GoogleButton.jsx';
import AuthPageLayout, { AuthCard, AuthAlert, AuthSteps, AuthPoints } from '../../components/auth/AuthPageLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiError } from '../../services/apiClient.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';

export default function RegisterPage() {
  usePageMeta({
    title: 'Create account · CAMPORA — Student Personal Finance Tracker',
    description:
      'Create a free CAMPORA account to manage student finances: track expenses, organize accounts and build better saving habits.',
    canonicalPath: '/register',
  });

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const clientErrors = useMemo(() => {
    const errs = {};
    if (form.name && form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.password && form.password.length < 8) errs.password = 'At least 8 characters';
    else if (form.password && !(/[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password)))
      errs.password = 'Include at least one letter and one number';
    if (form.confirm && form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    return errs;
  }, [form]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      headline={
        <>
          Create your <span className="text-gain">CAMPORA</span> account
        </>
      }
      supporting="Create a fresh account and start tracking your student finances in one place."
      aside={
        <>
          <AuthSteps
            title="What happens after signup?"
            steps={[
              'Create your account',
              'Add your first bank, wallet or cash account',
              'Add income and expenses',
              'View your financial dashboard',
            ]}
          />
          <AuthPoints
            title="Why students choose CAMPORA"
            points={[
              'One dashboard for your money',
              'Student-friendly expense tracking',
              'Monthly cash-flow overview',
              'Private personal finance data',
            ]}
          />
        </>
      }
    >
      <AuthCard>
        <h2 className="text-2xl font-semibold tracking-tight text-txt-primary">Get started</h2>
        <p className="mt-1.5 text-sm text-txt-secondary">
          Your private space to manage income, expenses, accounts and savings.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
          <AuthAlert>{serverError}</AuthAlert>

          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            placeholder="Arjun Mehta"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            className="h-11"
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            className="h-11"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Min 8 chars, letter + number"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            hint="Used to keep your financial data secure."
            className="h-11"
            required
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirm"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            className="h-11"
            required
          />

          <Button type="submit" loading={loading} size="lg" className="h-12 w-full text-sm tracking-wide active:scale-[0.99]">
            Create Account
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-stroke" />
          <span className="text-2xs uppercase tracking-widest text-txt-muted">or</span>
          <span className="h-px flex-1 bg-stroke" />
        </div>

        <GoogleButton onSuccess={() => navigate('/', { replace: true })} onError={setServerError} />

        <p className="mt-7 border-t border-stroke pt-5 text-center text-xs text-txt-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gain transition-colors hover:text-[#00e6a2] hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthPageLayout>
  );
}
