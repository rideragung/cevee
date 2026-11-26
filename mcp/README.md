# cevee-mcp

MCP server for Cevee resume data. Phase 1 is a local stdio server with resume
CRUD, section/item editing, layout selection, and structural validation.

## Requirements

- Node.js 20 or newer
- A Cevee account (Supabase)

## Install and build

```bash
npm --prefix mcp install
npm --prefix mcp run build
npm --prefix mcp test
```

## Sign in

```bash
node mcp/dist/index.js login
node mcp/dist/index.js whoami
node mcp/dist/index.js logout
```

`login` prompts for the Supabase URL, anon key, email, and password. The session
is stored in `~/.cevee` with owner-only permissions. For automation:

```bash
CEEVEE_SUPABASE_URL=... \
CEEVEE_SUPABASE_ANON_KEY=... \
CEEVEE_EMAIL=... \
CEEVEE_PASSWORD=... \
node mcp/dist/index.js login
```

`CEEVEE_HOME` overrides the config directory. The server never uses a service
role key: every query runs with the signed-in user's token and Supabase RLS.

## Tools

- `get_capabilities`, `validate_resume`
- `list_resumes`, `get_resume`, `create_resume`, `update_resume`,
  `duplicate_resume`, `delete_resume`
- `update_header`
- `list_sections`, `add_section`, `update_section`, `remove_section`,
  `reorder_sections`
- `add_item`, `update_item`, `remove_item`, `reorder_items`
- `list_layouts`, `set_layout`
- `import_resume` — PDF text/base64/file → Gemini draft; `save: false` by default
- `ats_audit` — deterministic ATS score and issues

Every update requires `expectedVersion`. A stale version returns a conflict with
the latest document; re-read it and retry. Creates do not need a version. Delete
operations require `confirm: true`.

`import_resume` requires `GEMINI_API_KEYS` (and optional `GEMINI_MODEL`). It
returns a draft by default; `save: true` creates a new resume and never
overwrites an existing one. `pdfBase64` and `filePath` are local-only inputs;
the remote server will accept `pdfText` only. The extracted text is sent to
Google Gemini.

Summary and bullet inputs are plain text. The server escapes text and converts
bullets to safe HTML; it does not accept raw HTML from the agent.

## Resources and prompts

- Resources: `cevee://capabilities`, `cevee://resumes`,
  `cevee://resumes/{resumeId}`, `cevee://layouts`, `cevee://schema/resume`,
  `cevee://guides/ats`
- Prompts: `create-resume-from-bio`, `ats-review`

## OpenCode config

```json
{
  "mcp": {
    "cevee": {
      "type": "local",
      "command": ["node", "C:/path/to/Cevee/mcp/dist/index.js"],
      "enabled": true
    }
  }
}
```

Logs go to stderr only; stdout is reserved for the MCP protocol.

## Remote endpoint (Vercel)

Current production endpoint: `https://cevee-beta.vercel.app/api/mcp`

The same tool core is served from `api/mcp.ts` on Vercel Edge:

- Endpoint: `https://<domain>/api/mcp`
- Discovery: `https://<domain>/.well-known/oauth-protected-resource`
- Consent page: `/oauth/consent`
- Connect page: `/connect-ai`
- Auth: Supabase OAuth 2.1 (DCR + PKCE S256 + `offline_access`). The server
  verifies the access token through Supabase JWKS, then queries Supabase with
  that user token so RLS applies. No service role key is used.
- Remote `import_resume` accepts `pdfText` only; base64/file extraction stays
  local.
- `MCP_PUBLIC_ORIGIN` is optional; set it only when the request origin is not
  the public domain.

Remote requests without a bearer token receive `401` with a
`WWW-Authenticate` challenge pointing at the protected resource metadata.

### Rate limit

Remote requests are limited per user by `consume_mcp_quota` (120 requests per
minute by default). Exceeding it returns `429` with `Retry-After`. The counter
lives in `public.mcp_usage`; only the security-definer function can write it.

### Client compatibility

| Client | Transport | Auth | Notes |
|---|---|---|---|
| Claude.ai web | Remote | OAuth | Custom connector; paid plan |
| ChatGPT | Remote | OAuth | Plugin flow; plan/workspace restrictions |
| Claude Desktop | Local stdio or remote | OAuth / local login | Local is easiest |
| Cursor | Remote or local | OAuth / headers | Remote OAuth preferred |
| OpenCode | Remote or local | OAuth / local login | Both supported |
| Codex CLI | Local stdio | Local login | Use `node mcp/dist/index.js` |
| Gemini CLI | Local stdio | Local login | Use `node mcp/dist/index.js` |
| VS Code / Continue / Cline | Remote via bridge | OAuth | Use `mcp-remote` |

For stdio-only clients, bridge to the remote endpoint:

```bash
npx -y mcp-remote https://<domain>/api/mcp
```

Public sign-up is enabled with email confirmation and an 8-character password
minimum. Revoke a connected app by removing the connector in the AI client; the
owner can also revoke clients in Supabase → Authentication → OAuth Server.

RLS has been verified with two users: the owner and a test user cannot read,
list, or update each other's resumes.

### Header-only clients

A static PAT path is intentionally not enabled yet. It would need a
service-role data layer that bypasses RLS, so it stays disabled until dedicated
isolation tests exist. Use OAuth or `mcp-remote` instead.

### Privacy

`/privacy` and `/terms` document what is stored, which third parties process
data (Supabase, Vercel, Google Gemini, the AI client), and how to delete
resumes or revoke connected apps.

## Tests

`npm --prefix mcp test` builds the server and runs Vitest unit, in-memory tool,
and stdio integration tests. The stdio test uses `CEEVEE_MCP_TEST_MODE=1`, which
uses an empty in-memory store and never touches Supabase.
