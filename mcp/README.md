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

Every write requires `expectedVersion`. A stale version returns a conflict with
the latest document; re-read it and retry. Delete operations require
`confirm: true`.

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

## Tests

`npm --prefix mcp test` builds the server and runs Vitest unit, in-memory tool,
and stdio integration tests. The stdio test uses `CEEVEE_MCP_TEST_MODE=1`, which
uses an empty in-memory store and never touches Supabase.
