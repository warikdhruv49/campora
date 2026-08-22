import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck, CircleX, Loader2 } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import { authService } from '../../services/auth.service.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';

export default function VerifyEmailPage() {
  usePageMeta({ title: 'Verify email · CAMPORA', noindex: true });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState(token ? 'verifying' : 'invalid');
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    authService
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [token]);

  const content = {
    verifying: {
      icon: <Loader2 size={22} className="text-gain animate-spin" />,
      title: 'Verifying your email…',
      text: 'Hang on a moment.',
    },
    success: {
      icon: <BadgeCheck size={22} className="text-gain" />,
      title: 'Email verified',
      text: 'Your email is confirmed. Everything is set.',
    },
    error: {
      icon: <CircleX size={22} className="text-loss" />,
      title: 'Verification failed',
      text: 'This link may have expired or already been used.',
    },
    invalid: {
      icon: <CircleX size={22} className="text-loss" />,
      title: 'Invalid link',
      text: 'This verification link is missing its token.',
    },
  }[state];

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-900 p-4">
      <div className="w-full max-w-sm panel p-6 text-center animate-slideUp">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>
        <div className="flex justify-center mb-4">
          <span className="w-11 h-11 rounded-full bg-base-700 flex items-center justify-center">{content.icon}</span>
        </div>
        <h1 className="text-base font-semibold text-txt-primary">{content.title}</h1>
        <p className="mt-1.5 text-xs text-txt-secondary">{content.text}</p>
        <Link to="/login" className="inline-block mt-5 text-xs text-gain hover:underline font-medium">
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
