import React, { useEffect, useMemo, useState } from 'react';
import {
  IconAlertTriangle as AlertTriangle,
  IconArrowLeft as ArrowLeft,
  IconCheck as Check,
  IconLoader2 as Loader2,
  IconShieldCheck as ShieldCheck,
  IconX as X,
} from '@tabler/icons-react';
import { AuthPage } from './AuthPage';
import { getSupabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { logoIcon } from '@/assets/logo';

interface AuthorizationDetails {
  client?: {
    name?: string;
    client_uri?: string;
  };
  redirect_uri?: string;
  scope?: string;
}

interface DecisionResult {
  redirect_url?: string;
}

interface OAuthApi {
  getAuthorizationDetails: (id: string) => Promise<{
    data: AuthorizationDetails | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (id: string) => Promise<{
    data: DecisionResult | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (id: string) => Promise<{
    data: DecisionResult | null;
    error: { message: string } | null;
  }>;
}

const getOAuthApi = (): OAuthApi | null => {
  const supabase = getSupabase();
  if (!supabase) return null;
  return (supabase.auth as unknown as { oauth?: OAuthApi }).oauth ?? null;
};

export const OAuthConsentPage: React.FC = () => {
  const authorizationId = useMemo(
    () => new URLSearchParams(window.location.search).get('authorization_id'),
    []
  );

  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!authorizationId) {
        setError('This authorization request is missing an identifier.');
        setLoading(false);
        return;
      }

      const supabase = getSupabase();
      const oauth = getOAuthApi();

      if (!supabase || !oauth) {
        setError('Cevee OAuth is not configured for this deployment.');
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setNeedsAuth(true);
          setLoading(false);
        }
        return;
      }

      const { data, error: detailsError } =
        await oauth.getAuthorizationDetails(authorizationId);

      if (!mounted) return;

      if (detailsError) {
        setError(detailsError.message);
      } else {
        setDetails(data);
      }
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [authorizationId, refreshKey]);

  const decide = async (approve: boolean) => {
    if (!authorizationId) return;

    const oauth = getOAuthApi();
    if (!oauth) {
      setError('Cevee OAuth is not configured for this deployment.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: decisionError } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);

    if (decisionError) {
      setError(decisionError.message);
      setSubmitting(false);
      return;
    }

    if (data?.redirect_url) {
      window.location.href = data.redirect_url;
      return;
    }

    setError('The authorization server did not return a redirect URL.');
    setSubmitting(false);
  };

  if (needsAuth) {
    return (
      <AuthPage
        onAuthSuccess={() => {
          setNeedsAuth(false);
          setLoading(true);
          setRefreshKey((value) => value + 1);
        }}
      />
    );
  }

  const clientName = details?.client?.name || 'An AI client';
  const scopes = (details?.scope || '')
    .split(' ')
    .map((scope) => scope.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-muted px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center gap-2.5 px-1">
          <img src={logoIcon} alt="" className="size-8 rounded-lg" />
          <div>
            <p className="text-sm font-semibold text-foreground">Cevee</p>
            <p className="text-xs text-muted-foreground">Authorization request</p>
          </div>
        </div>

        <Card className="border border-border bg-card p-6 shadow-pillow-secondary">
          {loading ? (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Loading authorization request
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-5" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-base font-semibold text-foreground">
                    Unable to continue
                  </h1>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => (window.location.href = '/')}>
                <ArrowLeft className="size-4" />
                Back to Cevee
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-base font-semibold text-foreground">
                    Authorize {clientName}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This client wants to connect to your Cevee account through the
                    Model Context Protocol.
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Client</span>
                  <span className="text-right font-medium text-foreground">
                    {clientName}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Redirect URI</span>
                  <span className="max-w-[60%] break-all text-right font-mono text-xs text-foreground">
                    {details?.redirect_uri || 'Not provided'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Requested access</span>
                  <div className="flex max-w-[60%] flex-wrap justify-end gap-1.5">
                    {scopes.length > 0 ? (
                      scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="text-[10px]">
                          {scope}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Resume access
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Approving grants this client read and edit access to every resume in
                your account. You can revoke it later from your Supabase account.
              </p>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  disabled={submitting}
                  onClick={() => void decide(false)}
                >
                  <X className="size-4" />
                  Deny
                </Button>
                <Button
                  disabled={submitting}
                  onClick={() => void decide(true)}
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Approve access
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
