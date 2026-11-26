import React from 'react';
import { IconArrowLeft as ArrowLeft, IconFileText as FileText } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logoIcon } from '@/assets/logo';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="space-y-2">
    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  </section>
);

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-center gap-2.5">
          <img src={logoIcon} alt="" className="size-9 rounded-xl" />
          <div>
            <p className="text-sm font-semibold text-foreground">Cevee</p>
            <p className="text-xs text-muted-foreground">Terms of Service</p>
          </div>
        </header>

        <Card className="border border-border bg-card p-6 shadow-pillow-secondary">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Terms of Service
                </h1>
                <p className="text-xs text-muted-foreground">
                  Last updated: November 26, 2026
                </p>
              </div>
            </div>

            <Section title="1. Acceptance">
              <p>
                By using Cevee you agree to these terms. If you do not agree, do not
                use the service.
              </p>
            </Section>

            <Section title="2. Accounts">
              <p>
                You are responsible for your account credentials and for activity
                under your account. Use a strong password and keep your device
                secure.
              </p>
            </Section>

            <Section title="3. Your content">
              <p>
                You retain ownership of your resume content. You grant Cevee the
                limited right to store and process it to provide the service.
              </p>
            </Section>

            <Section title="4. AI-assisted features">
              <p>
                PDF import and MCP are assisted by third-party AI. Output can be
                incomplete or wrong; review it before using it. Keep your own backup
                of important documents.
              </p>
            </Section>

            <Section title="5. Acceptable use">
              <p>
                Do not use Cevee to store unlawful content, attack the service, or
                access another user&apos;s data. Do not attempt to bypass
                authentication or row-level security.
              </p>
            </Section>

            <Section title="6. Third-party services">
              <p>
                Supabase, Vercel, Google Gemini, and your AI client have their own
                terms and privacy policies. Cevee is not responsible for those
                services.
              </p>
            </Section>

            <Section title="7. Availability and warranty">
              <p>
                The service is provided &quot;as is&quot; without warranties.
                Features may change, be limited, or become unavailable.
              </p>
            </Section>

            <Section title="8. Limitation of liability">
              <p>
                To the maximum extent permitted by law, Cevee is not liable for
                indirect or consequential damages, or for lost data. Keep your own
                backup of important documents.
              </p>
            </Section>

            <Section title="9. Changes">
              <p>
                These terms may be updated. Continued use after an update means you
                accept the revised terms.
              </p>
            </Section>

            <Section title="10. Contact">
              <p>
                Questions about these terms:{' '}
                <a
                  className="font-medium text-primary underline underline-offset-2"
                  href="https://github.com/rideragung/cevee/issues"
                  target="_blank"
                  rel="noreferrer"
                >
                  open an issue
                </a>
                .
              </p>
            </Section>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => (window.location.href = '/')}>
            <ArrowLeft className="size-4" />
            Back to Cevee
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <a className="hover:text-foreground" href="/privacy">
              Privacy
            </a>
            <a className="hover:text-foreground" href="/connect-ai">
              Connect AI
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
