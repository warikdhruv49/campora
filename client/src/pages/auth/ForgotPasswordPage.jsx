import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import AuthPageLayout, { AuthCard, AuthAlert, AuthSteps } from '../../components/auth/AuthPageLayout.jsx';
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
    <AuthPageLayout
      headline={
        <>
          Forgot your <span className="text-gain">password</span>?
        </>
      }
      supporting="No problem. Enter the email address connected to your CAMPORA account and we'll send you instructions to reset it."
      aside={
        <>
          <AuthSteps
            title="What happens next?"
            steps={[
              'Enter your account email',
              'Check your inbox',
              'Open the password reset email',
              'Create a new password',
              'Return to CAMPORA and sign in',
            ]}
          />

          <section className="rounded-lg border border-stroke bg-base-850 px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-gain" />
              <p className="text-2xs leading-relaxed text-txt-muted">
                For your privacy, CAMPORA never reveals whether a specific email
                address is registered — so no account details are exposed here.
              </p>
            </div>
          </section>
        </>
      }
    >
      <AuthCard>
        {result ? (
          <div>
            <div className="flex justify-center mb-5">
              <span className="w-12 h-12 rounded-full bg-gain-dim flex items-center justify-center">
                <MailCheck size={22} className="text-gain" />
              </span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-txt-primary text-center">Check your inbox</h2>
            <p className="mt-2 text-sm text-txt-secondary text-center leading-relaxed">
              If an account exists for <span className="text-txt-primary">{email}</span>, a password
              reset link is on its way.
            </p>

            {result.devResetUrl && (
              <div className="mt-5 rounded-lg border border-stroke bg-base-850 px-3.5 py-3">
                <p className="label-xs mb-1.5">Development mode</p>
                <a href={result.devResetUrl} className="text-2xs text-gain break-all hover:underline">
                  Open reset link
                </a>
              </div>
            )}

            <Link
              to="/login"
              className="mt-6 block border-t border-stroke pt-5 text-center text-xs font-semibold text-gain transition-colors hover:text-[#00e6a2] hover:underline underline-offset-2"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold tracking-tight text-txt-primary">Reset your password</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-txt-secondary">
              You'll receive a password reset email if an account exists for that address.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
              <AuthAlert>{error}</AuthAlert>

              <Input
                label="Email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="Example: you signed up with student@example.com — enter that same email."
                className="h-11"
              />

              <Button type="submit" loading={loading} size="lg" className="h-12 w-full text-sm tracking-wide active:scale-[0.99]">
                Send Reset Email
              </Button>
            </form>

            <p className="mt-7 border-t border-stroke pt-5 text-center text-xs text-txt-secondary">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-gain transition-colors hover:text-[#00e6a2] hover:underline underline-offset-2">
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </AuthCard>
    </AuthPageLayout>
  );
}
