import React from 'react';
import { IconArrowLeft as ArrowLeft, IconShieldCheck as ShieldCheck } from '@tabler/icons-react';
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

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-center gap-2.5">
          <img src={logoIcon} alt="" className="size-9 rounded-xl" />
          <div>
            <p className="text-sm font-semibold text-foreground">Cevee</p>
            <p className="text-xs text-muted-foreground">Privacy Policy</p>
          </div>
        </header>

        <Card className="border border-border bg-card p-6 shadow-pillow-secondary">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="size-5" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Privacy Policy
                </h1>
                <p className="text-xs text-muted-foreground">
                  Last updated: November 26, 2026
                </p>
              </div>
            </div>

            <Section title="What Cevee stores">
              <p>
                Your account email and Supabase Auth metadata. Resume documents
                contain the title, layout, language, contact details, section
                content, and an optional profile photo you upload. Resumes are
                stored in Supabase Postgres as JSONB.
              </p>
              <p>
                Guest mode stores resumes in your browser&apos;s localStorage. For
                signed-in users, only unsaved drafts are stored locally; each draft
                is removed after a successful save or sign-out.
              </p>
            </Section>

            <Section title="Who can access your resumes">
              <p>
                Supabase Row Level Security limits every row to the signed-in user.
                The Cevee MCP server uses your own OAuth access token and never a
                service-role key.
              </p>
              <p>
                An AI client you connect through MCP receives the resume data it
                requests. That provider&apos;s terms and retention settings apply.
                Cevee does not track or report resume contents.
              </p>
            </Section>

            <Section title="PDF import">
              <p>
                The PDF file is read in your browser. Only the extracted text is
                sent to Google Gemini for structuring, and Gemini&apos;s terms
                apply. A generated draft is saved only when you choose to save it.
              </p>
            </Section>

            <Section title="Retention and deletion">
              <p>
                Delete resumes from the dashboard. Deleting your Supabase account
                cascades to your resumes. You can revoke connected OAuth clients in
                Supabase under Authentication → OAuth Server.
              </p>
            </Section>

            <Section title="Third parties">
              <p>
                Supabase provides the database and authentication. Vercel hosts the
                web app and MCP endpoint. Google Gemini processes PDF text during
                import. Your chosen AI client processes the data you ask it to read.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions or deletion requests:{' '}
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
            <a className="hover:text-foreground" href="/terms">
              Terms
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
