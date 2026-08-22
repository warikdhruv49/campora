import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { authService } from '../../services/auth.service.js';
import { apiError } from '../../services/apiClient.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';

export default function ForgotPasswordPage() {
  usePageMeta({
    title: 'Reset password · CAMPORA',
    description: 'Recover access to your CAMPORA student finance dashboard.',
    canonicalPath: '/forgot-password',
  });
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setResult(await authService.forgotPassword(email));
    } catch (err) {
      setError(apiError(err));
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
          {result ? (
            <div>
              <div className="flex justify-center mb-4">
                <span className="w-11 h-11 rounded-full bg-gain-dim flex items-center justify-center">
                  <MailCheck size={20} className="text-gain" />
                </span>
              </div>
              <h1 className="text-base font-semibold text-txt-primary text-center">Check your inbox</h1>
              <p className="mt-1.5 text-xs text-txt-secondary text-center leading-relaxed">
                If an account exists for {email}, a password reset link has been generated.
              </p>
              {result.devResetUrl && (
                <div className="mt-4 rounded-lg border border-stroke bg-base-800 px-3.5 py-3">
                  <p className="label-xs mb-1.5">Development mode</p>
                  <a href={result.devResetUrl} className="text-2xs text-gain break-all hover:underline">
                    Open reset link
                  </a>
                </div>
              )}
              <Link to="/login" className="block mt-5 text-center text-xs text-gain hover:underline font-medium">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-txt-primary">Forgot your password?</h1>
              <p className="mt-1 text-xs text-txt-secondary">
                Enter your email and we will generate a reset link for you.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                {error && (
                  <div className="rounded-lg border border-loss/40 bg-loss-dim px-3.5 py-2.5 text-xs text-loss" role="alert">
                    {error}
                  </div>
                )}
                <Input
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" loading={loading} className="w-full">
                  Send reset link
                </Button>
              </form>

              <p className="mt-5 text-center text-xs text-txt-secondary">
                Remembered it?{' '}
                <Link to="/login" className="text-gain hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
