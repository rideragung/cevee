# cevee-mcp

MCP server for Cevee resume data.

Phase 0 currently exposes only `get_capabilities`. The remaining tools are
implemented in Phase 1.

## Requirements

- Node.js 20 or newer
- A Cevee account (Supabase) for Phase 1 tools

## Build and run

```bash
npm --prefix mcp install
npm --prefix mcp run build
node mcp/dist/index.js
```

The server speaks MCP over stdio. It must be launched by an MCP client, not by
opening a browser.

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
