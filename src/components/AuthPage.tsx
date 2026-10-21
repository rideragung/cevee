import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Key,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from 'lucide-react';
import { logoIcon } from '@/assets/logo';
import {
  getSupabase,
  isSupabaseConfigured,
  saveSupabaseCredentials,
  getSupabaseUrl,
} from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onContinueAsGuest?: () => void;
  isModal?: boolean;
  onClose?: () => void;
  guestResumeCount?: number;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
  isModal = false,
  onClose,
  guestResumeCount,
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

  const authCard = (
    <Card className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl sm:p-8 relative">
            {isModal && onClose && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute right-4 top-4 size-8 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            )}

            {/* Heading — Centered brand & title preserved from original layout */}
            <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <img
            src={logoIcon}
            alt="Cevee"
            className="size-12 object-contain drop-shadow-xs"
          />
          <span className="font-extrabold text-2xl tracking-tight text-foreground">
            Cevee
          </span>
        </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {isModal
                  ? mode === 'signup'
                    ? 'Create account to save'
                    : 'Sign in to save'
                  : mode === 'signup'
                  ? 'Create your account'
                  : 'Welcome back'}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {isModal
                  ? `Sign in or register to sync your ${
                      guestResumeCount && guestResumeCount > 1
                        ? `${guestResumeCount} resumes`
                        : 'resume'
                    } to the cloud.`
                  : mode === 'signup'
                  ? 'Build an ATS-friendly resume, then export it as a PDF.'
                  : 'Sign in to access and edit your resumes.'}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <Alert variant="destructive" className="mb-5 flex items-start gap-2.5 p-3 rounded-2xl">
                  <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                <AlertDescription className="text-xs leading-relaxed">
                  {errorMsg}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {successMsg && (
              <Alert className="mb-5 flex items-start gap-2.5 border-emerald-200 bg-emerald-50 p-3 text-emerald-800 rounded-2xl">
                <CheckCircle className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <AlertDescription className="text-xs leading-relaxed">
                  {successMsg}
                </AlertDescription>
              </Alert>
            )}

            {/* Social Authentication & Guest Option — Stacked original layout */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleOAuthGoogle}
                disabled={loading}
                className="w-full gap-3"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
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
              </Button>

              {!isModal && onContinueAsGuest && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onContinueAsGuest}
                  className="w-full"
                >
                  Continue as guest
                </Button>
              )}
            </div>

            {/* Divider with background shield preventing line intersection */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/80" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground font-medium">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-foreground"
                >
                  Email address
                </label>
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="[@media(hover:hover)]:hover:underline text-xs font-medium text-primary"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      mode === 'signup' ? 'new-password' : 'current-password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="[@media(hover:hover)]:hover:text-foreground absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <Button
                type="submit"
                variant="default"
                disabled={loading}
                className="mt-6 w-full gap-2"
              >
                {loading && (
                  <Loader2 className="size-4 animate-spin text-primary-foreground" />
                )}
                <span>
                  {mode === 'signup' ? 'Create account' : 'Sign in'}
                </span>
              </Button>
            </form>

            {/* Toggle Mode Footer */}
            <div className="mt-6 pt-5 border-t border-border/80 text-center text-xs text-muted-foreground">
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
                    className="[@media(hover:hover)]:hover:underline font-semibold text-foreground ml-1"
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
                    className="[@media(hover:hover)]:hover:underline font-semibold text-foreground ml-1"
                  >
                    Sign up
                  </button>
                </span>
                )}
              </div>

              {isModal && onClose && (
                <div className="mt-5 pt-3 border-t border-border/60 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Stay in guest mode
                  </Button>
                </div>
              )}
            </Card>
  );

  const configModal = (
    <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="flex flex-row items-center gap-2 space-y-0 text-left">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Key className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold">Connect Supabase</DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Enter <strong>Project URL</strong> and <strong>Anon public key</strong> from your Supabase dashboard (Settings → API), or add them to your <code className="rounded bg-muted px-1 py-0.5 text-[11px] text-foreground">.env</code> file.
        </DialogDescription>

        <form onSubmit={handleSaveConfig} className="mt-2 space-y-3">
          <div className="space-y-1">
            <label htmlFor="supabase-url" className="block text-[11px] font-semibold text-foreground">
              Project URL
            </label>
            <Input
              id="supabase-url"
              type="url"
              autoComplete="url"
              placeholder="https://xyzcompany.supabase.co"
              value={configUrl}
              onChange={(e) => setConfigUrl(e.target.value)}
              required
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="supabase-anon-key" className="block text-[11px] font-semibold text-foreground">
              Anon public key
            </label>
            <Input
              id="supabase-anon-key"
              type="password"
              autoComplete="off"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={configKey}
              onChange={(e) => setConfigKey(e.target.value)}
              required
              className="h-9 text-xs"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3">
            {isSupabaseConfigured() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfigModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="text-xs font-semibold"
            >
              Save and connect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (isModal) {
    return (
      <div className="w-full max-w-[420px] mx-auto p-0">
        {authCard}
        {configModal}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-between overflow-x-hidden bg-muted text-foreground">
      {/* Top Bar */}
      <header className="relative z-10 px-4 sm:px-8 py-5 flex items-center justify-end">
        {!isSupabaseConfigured() && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowConfigModal(true)}
            className="gap-1.5 border-amber-300 bg-amber-50 text-amber-800 [@media(hover:hover)]:hover:bg-amber-100 text-xs"
          >
            <Key className="size-3.5" />
            <span>Connect Supabase</span>
          </Button>
        )}
      </header>

      {/* Centered card (focal point on this screen, layout preserved) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[420px]">
          {authCard}

          {/* Plain facts */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span>ATS-friendly formatting</span>
            <span aria-hidden="true">•</span>
            <span>Cloud and local storage</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Cevee ATS Resume Builder • Clean standard A4 PDF format
        </p>
      </footer>

      {configModal}
    </div>
  );
};
export default AuthPage;
