import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import GoogleButton from '../../components/ui/GoogleButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiError } from '../../services/apiClient.js';

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-base-900 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[250px] bg-brand-blue/6 blur-[110px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative animate-slideUp">
        <div className="flex justify-center mb-8">
          <Logo size="large" />
        </div>

        <div className="panel p-6">
          <h1 className="text-lg font-semibold text-txt-primary">Sign in to your terminal</h1>
          <p className="mt-1 text-xs text-txt-secondary">Access your personal finance command center.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {error && (
              <div className="rounded-lg border border-loss/40 bg-loss-dim px-3.5 py-2.5 text-xs text-loss" role="alert">
                {error}
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
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-stroke" />
            <span className="text-2xs text-txt-muted">or</span>
            <span className="h-px flex-1 bg-stroke" />
          </div>

          <GoogleButton
            onSuccess={() => navigate('/', { replace: true })}
            onError={setError}
          />

          <p className="mt-4 text-center">
            <Link to="/forgot-password" className="text-xs text-txt-muted hover:text-gain transition-colors">
              Forgot your password?
            </Link>
          </p>

          <p className="mt-5 text-center text-xs text-txt-secondary">
            New to Campora?{' '}
            <Link to="/register" className="text-gain hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
