import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { authService } from '../../services/auth.service.js';
import { apiError } from '../../services/apiClient.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';

export default function ResetPasswordPage() {
  usePageMeta({ title: 'Set new password · CAMPORA', noindex: true });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword({ token, newPassword: password });
      navigate('/login', { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900 p-4">
        <div className="w-full max-w-sm panel p-6 text-center animate-slideUp">
          <h1 className="text-base font-semibold text-txt-primary">Invalid reset link</h1>
          <p className="mt-1.5 text-xs text-txt-secondary">This link is missing its token. Request a new one.</p>
          <Link to="/forgot-password" className="inline-block mt-4 text-xs text-gain hover:underline font-medium">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-900 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative animate-slideUp">
        <div className="flex justify-center mb-8">
          <Logo size="large" />
        </div>

        <div className="panel p-6">
          <h1 className="text-lg font-semibold text-txt-primary">Set a new password</h1>
          <p className="mt-1 text-xs text-txt-secondary">Choose something strong you have not used before.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {error && (
              <div className="rounded-lg border border-loss/40 bg-loss-dim px-3.5 py-2.5 text-xs text-loss" role="alert">
                {error}
              </div>
            )}
            <div className="relative">
              <Input
                label="New password"
                type={show ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-[34px] text-txt-muted hover:text-txt-secondary transition-colors"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <Input
              label="Confirm new password"
              type={show ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Update password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
