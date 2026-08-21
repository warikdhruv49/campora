import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/layout/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import GoogleButton from '../../components/ui/GoogleButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiError } from '../../services/apiClient.js';

export default function RegisterPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-base-900 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative animate-slideUp">
        <div className="flex justify-center mb-8">
          <Logo size="large" />
        </div>

        <div className="panel p-6">
          <h1 className="text-lg font-semibold text-txt-primary">Create your account</h1>
          <p className="mt-1 text-xs text-txt-secondary">Set up your finance terminal in under a minute.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {serverError && (
              <div className="rounded-lg border border-loss/40 bg-loss-dim px-3.5 py-2.5 text-xs text-loss" role="alert">
                {serverError}
              </div>
            )}
            <Input
              label="Full name"
              name="name"
              autoComplete="name"
              placeholder="Arjun Mehta"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
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
              hint="Used to secure your financial data."
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
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-stroke" />
            <span className="text-2xs text-txt-muted">or</span>
            <span className="h-px flex-1 bg-stroke" />
          </div>

          <GoogleButton
            onSuccess={() => navigate('/', { replace: true })}
            onError={setServerError}
          />

          <p className="mt-5 text-center text-xs text-txt-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-gain hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
