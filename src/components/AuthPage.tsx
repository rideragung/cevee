import React, { useState } from 'react';
import { Eye, EyeOff, FileText, Key, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import {
  getSupabase,
  isSupabaseConfigured,
  saveSupabaseCredentials,
  supabaseUrl,
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
  const [configUrl, setConfigUrl] = useState(supabaseUrl || '');
  const [configKey, setConfigKey] = useState('');

  // Check URL parameters for OAuth redirect errors
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash);
    const errorDesc = params.get('error_description') || hashParams.get('error_description') || params.get('error');
    if (errorDesc) {
      setErrorMsg(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      // Clean error params from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
    } catch (err: any) {
      const message = err.message || '';
      if (message.toLowerCase().includes('provider is not enabled') || message.toLowerCase().includes('unsupported provider')) {
        setErrorMsg('Google OAuth belum diaktifkan di dashboard Supabase. Masukkan Client ID & Secret di Authentication → Providers → Google.');
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
      setErrorMsg('Please enter both email and password');
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
            'Confirmation link sent to your email. Please verify to complete registration.'
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configUrl.trim() || !configKey.trim()) {
      setErrorMsg('Please provide both Project URL and Anon Key');
      return;
    }
    saveSupabaseCredentials(configUrl, configKey);
    setShowConfigModal(false);
    setErrorMsg(null);
    setSuccessMsg('Supabase credentials saved successfully.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      {/* Top Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
        {/* Left: Cevee Branding */}
        <div className="flex items-center gap-2.5">
          <span className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-2xs">
            <FileText size={17} />
          </span>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            Cevee
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {!isSupabaseConfigured() && (
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-medium transition"
            >
              <Key size={13} />
              <span>Connect Supabase</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Authentication Center Card (Adapted Layout from reference) */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[390px] bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8">
          {/* Header text */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
              {mode === 'signup' ? 'Get started' : 'Welcome back'}
            </h1>
            <p className="text-xs text-slate-500">
              {mode === 'signup'
                ? 'Create a new Cevee account'
                : 'Sign in to access your resumes'}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle size={15} className="mt-0.5 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions: Google OAuth & Guest Access */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleOAuthGoogle}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-3 transition shadow-2xs disabled:opacity-50"
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
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center transition shadow-2xs"
              >
                Continue as Guest
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-normal">
                or
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg placeholder-slate-400 outline-none transition"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 pr-10 rounded-lg placeholder-slate-400 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Cevee Emerald Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-lg transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{mode === 'signup' ? 'Sign up' : 'Sign in'}</span>
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {mode === 'signup' ? (
              <span>
                Have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline transition ml-1"
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
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline transition ml-1"
                >
                  Sign up
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 text-center border-t border-slate-200 bg-white">
        <p className="text-[11px] leading-relaxed text-slate-500 max-w-sm sm:max-w-md mx-auto">
          Cevee ATS Resume Builder. Data stored securely in your Supabase account.
        </p>
      </footer>

      {/* Supabase Connection Setup Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-3 text-emerald-700">
              <Key size={18} />
              <h2 className="text-base font-semibold text-slate-900">
                Connect Supabase
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-normal">
              Enter <strong>Project URL</strong> and <strong>Anon Public Key</strong> from your Supabase dashboard (Settings → API), or add to <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded">.env</code>.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-4">
                {isSupabaseConfigured() && (
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs"
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
