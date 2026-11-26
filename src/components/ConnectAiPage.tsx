import React, { useState } from 'react';
import {
  IconArrowLeft as ArrowLeft,
  IconBrandOpenai as OpenAi,
  IconCheck as Check,
  IconCode as Code,
  IconCopy as Copy,
  IconMessageChatbot as Chatbot,
  IconPlugConnected as Plug,
  IconShieldCheck as ShieldCheck,
  IconTerminal2 as Terminal,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { logoIcon } from '@/assets/logo';

const endpoint =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api/mcp`
    : 'https://your-domain/api/mcp';

const CopyButton: React.FC<{ value: string; label?: string }> = ({
  value,
  label = 'Copy',
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button variant="outline" size="sm" onClick={() => void copy()}>
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : label}
    </Button>
  );
};

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
  <div className="relative">
    <pre className="overflow-x-auto rounded-xl border border-border bg-muted/60 p-3 pr-24 text-[11px] leading-relaxed text-foreground">
      <code>{code}</code>
    </pre>
    <div className="absolute right-2 top-2">
      <CopyButton value={code} />
    </div>
  </div>
);

export const ConnectAiPage: React.FC = () => {
  const openCodeSnippet = JSON.stringify(
    {
      mcp: {
        cevee: {
          type: 'remote',
          url: endpoint,
          enabled: true,
          oauth: {},
        },
      },
    },
    null,
    2
  );

  const cursorSnippet = JSON.stringify(
    {
      mcpServers: {
        cevee: {
          url: endpoint,
        },
      },
    },
    null,
    2
  );

  return (
    <div className="min-h-screen bg-muted px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="" className="size-9 rounded-xl" />
            <div>
              <p className="text-sm font-semibold text-foreground">Cevee</p>
              <p className="text-xs text-muted-foreground">Connect your AI</p>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bring your resumes into your AI client
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Add Cevee as a remote MCP server. Your AI client opens a secure OAuth
              consent screen, you approve access, and it can read and edit the
              resumes in your own account.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">OAuth 2.1</Badge>
            <Badge variant="outline">Streamable HTTP</Badge>
            <Badge variant="outline">Supabase RLS</Badge>
          </div>
        </header>

        <Card className="border border-border bg-card p-5 shadow-pillow-secondary">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Server URL</p>
              <p className="text-xs text-muted-foreground">
                Use this endpoint in every MCP client. No API key is needed.
              </p>
            </div>
            <CopyButton value={endpoint} label="Copy URL" />
          </div>
          <div className="mt-3 rounded-xl border border-border bg-muted/60 p-3 font-mono text-xs break-all text-foreground">
            {endpoint}
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Chatbot className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Claude.ai</p>
            </div>
            <ol className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <li>1. Open Settings → Connectors.</li>
              <li>2. Choose Add custom connector.</li>
              <li>3. Paste the Server URL.</li>
              <li>4. Sign in and approve access.</li>
            </ol>
          </Card>

          <Card className="border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <OpenAi className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">ChatGPT</p>
            </div>
            <ol className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <li>1. Open chatgpt.com/plugins.</li>
              <li>2. Select + → Add custom MCP server.</li>
              <li>3. Paste the Server URL and choose OAuth.</li>
              <li>4. Create, install, then mention the app in chat.</li>
            </ol>
          </Card>

          <Card className="border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Code className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Cursor</p>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">
              Add this to your MCP settings.
            </p>
            <CodeBlock code={cursorSnippet} />
          </Card>

          <Card className="border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Terminal className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">OpenCode</p>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">
              Add this to opencode.json.
            </p>
            <CodeBlock code={openCodeSnippet} />
          </Card>
        </div>

        <Card className="border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-4" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">
                Your account stays yours
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cevee never uses a service role key for MCP requests. Every call runs
                with your own OAuth token, and Supabase row-level security limits it
                to your resumes. Revoke a client at any time from your Supabase
                account.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-3 pt-1">
          <Button variant="ghost" onClick={() => (window.location.href = '/')}>
            <ArrowLeft className="size-4" />
            Back to Cevee
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Plug className="size-3.5" />
            Remote MCP endpoint
          </div>
        </div>
      </div>
    </div>
  );
};
