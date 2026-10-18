import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  FileText,
  Key,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {
  getSupabase,
  isSupabaseConfigured,
  saveSupabaseCredentials,
  getSupabaseUrl,
} from '../lib/supabase';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onContinueAsGuest?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Supabase credentials modal fallback (if .env is missing)
  const [showConfigModal, setShowConfigModal] = useState(!isSupabaseConfigured());
  const [configUrl, setConfigUrl] = useState(getSupabaseUrl());
  const [configKey, setConfigKey] = useState('');

  // Check URL parameters for OAuth redirect errors
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash
    );
    const errorDesc =
      params.get('error_description') ||
      hashParams.get('error_description') ||
      params.get('error');
    if (errorDesc) {
      setErrorMsg(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // The Supabase setup dialog is only dismissable once credentials exist; allow Escape then
  React.useEffect(() => {
    if (!showConfigModal || !isSupabaseConfigured()) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowConfigModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfigModal]);

  const handleOAuthGoogle = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const supabase = getSupabase();
    if (!supabase) {
      setShowConfigModal(true);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (
        message.toLowerCase().includes('provider is not enabled') ||
        message.toLowerCase().includes('unsupported provider')
      ) {
        setErrorMsg(
          'Google sign-in is not enabled in your Supabase project. Enable it in Authentication → Providers → Google.'
        );
      } else {
        setErrorMsg(message || 'Failed to authenticate with Google');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = getSupabase();
    if (!supabase) {
      setShowConfigModal(true);
      return;
    }

    if (!email || !password) {
      setErrorMsg('Enter both email and password to continue.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          onAuthSuccess();
        } else if (data.user && !data.session) {
          setSuccessMsg(
            'Verification link sent. Check your email to finish creating your account.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setErrorMsg(
        message || 'Unable to sign in. Check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configUrl.trim() || !configKey.trim()) {
      setErrorMsg('Enter both Project URL and Anon Key to continue.');
      return;
    }
    saveSupabaseCredentials(configUrl, configKey);
    setShowConfigModal(false);
    setErrorMsg(null);
    setSuccessMsg('Supabase credentials saved.');
  };

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = getSupabase();
    if (!supabase) {
      setShowConfigModal(true);
      return;
    }

    if (!email) {
      setErrorMsg('Enter your email address first, then request a reset link.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setSuccessMsg('Password reset link sent. Check your email to set a new password.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setErrorMsg(message || 'Could not send the reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Top Bar */}
      <header className="relative z-10 px-4 sm:px-8 py-5 flex items-center justify-end">
        {/* Database setup helper if Supabase credentials are missing */}
        {!isSupabaseConfigured() && (
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-medium motion-safe:transition-[background-color,border-color] duration-150 enabled:active:scale-[0.96]"
          >
            <Key size={13} strokeWidth={2} />
            <span>Connect Supabase</span>
          </button>
        )}
      </header>

      {/* Centered card (the one focal point on this screen) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[420px]">
          {/* Card lifts off the calm page: single elevation marker */}
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8">
            {/* Heading */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center gap-2.5 mb-3.5">
                <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <FileText size={18} strokeWidth={2} />
                </span>
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Cevee
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {mode === 'signup'
                  ? 'Build ATS-optimized resumes in minutes with instant PDF exports.'
                  : 'Sign in to access and edit your tailored resume documents.'}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                role="alert"
                className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-start gap-2.5"
              >
                <AlertCircle
                  size={15}
                  strokeWidth={2}
                  className="mt-0.5 flex-shrink-0 text-red-600"
                />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div
                role="status"
                className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2.5"
              >
                <CheckCircle
                  size={15}
                  strokeWidth={2}
                  className="mt-0.5 flex-shrink-0 text-emerald-600"
                />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Social Authentication & Guest Option */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleOAuthGoogle}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-50/80 border border-slate-300/90 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 enabled:active:scale-[0.96] motion-safe:transition-[transform,background-color,border-color] duration-150 ease-out disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {onContinueAsGuest && (
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="w-full bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-medium py-2.5 px-4 rounded-xl flex items-center justify-center enabled:active:scale-[0.96] motion-safe:transition-[transform,background-color,border-color,color] duration-150 ease-out cursor-pointer"
                >
                  <span>Continue as guest</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white px-2.5 text-slate-500 font-medium">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl placeholder-slate-400 outline-none motion-safe:transition-[background-color,border-color,box-shadow] duration-150"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2 rounded transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      mode === 'signup' ? 'new-password' : 'current-password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 pr-10 rounded-xl placeholder-slate-400 outline-none motion-safe:transition-[background-color,border-color,box-shadow] duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 transition-colors p-1.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={15} strokeWidth={2} />
                    ) : (
                      <Eye size={15} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 enabled:active:scale-[0.96] motion-safe:transition-[transform,background-color] duration-150 ease-out flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading && (
                  <Loader2 size={15} className="animate-spin text-white" />
                )}
                <span>
                  {mode === 'signup' ? 'Create Account' : 'Sign In to Cevee'}
                </span>
              </button>
            </form>

            {/* Toggle Mode Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              {mode === 'signup' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2 transition-colors ml-0.5 cursor-pointer"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2 transition-colors ml-0.5 cursor-pointer"
                  >
                    Sign up
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* What the tool does, stated plainly */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
            <span>ATS-optimized formatting</span>
            <span aria-hidden="true">•</span>
            <span>Cloud and local storage</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center">
        <p className="text-[11px] text-slate-500">
          Cevee ATS Resume Builder • Clean standard A4 PDF format
        </p>
      </footer>

      {/* Supabase Connection Setup Modal */}
      {showConfigModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 [overscroll-behavior:contain]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="supabase-dialog-title"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-emerald-700">
              <Key size={18} strokeWidth={2} />
              <h2 id="supabase-dialog-title" className="text-base font-bold text-slate-900">
                Connect Supabase
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Enter <strong>Project URL</strong> and <strong>Anon Public Key</strong> from your Supabase dashboard (Settings → API), or add them to your <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded text-[11px]">.env</code> file.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs px-3 py-2 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs px-3 py-2 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-4">
                {isSupabaseConfigured() && (
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 enabled:active:scale-[0.96] motion-safe:transition-[transform,background-color] duration-150 cursor-pointer"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuthPage;
