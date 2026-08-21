import { useEffect, useRef, useState } from 'react';
import { apiError } from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function GoogleButton({ onSuccess, onError, label = 'Continue with Google' }) {
  const divRef = useRef(null);
  const [available, setAvailable] = useState(!!CLIENT_ID);
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then((google) => {
        if (cancelled || !divRef.current) return;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential);
              onSuccess?.();
            } catch (err) {
              onError?.(apiError(err));
            }
          },
        });
        google.accounts.id.renderButton(divRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'pill',
        });
      })
      .catch(() => setAvailable(false));

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, onSuccess, onError]);

  if (!available) {
    return (
      <button
        type="button"
        disabled
        className="w-full h-11 inline-flex items-center justify-center gap-2.5 rounded-lg border border-stroke text-sm text-txt-muted cursor-not-allowed"
        title="Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
        </svg>
        {label}
      </button>
    );
  }

  return <div ref={divRef} className="flex justify-center" />;
}
