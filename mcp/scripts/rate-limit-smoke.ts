import { getAuthenticatedClient } from '../src/session';
import { loadConfigEnv } from '../src/config';

interface QuotaRow {
  allowed: boolean;
  remaining: number;
  reset_at: string;
}

const main = async (): Promise<void> => {
  loadConfigEnv();
  const { client } = await getAuthenticatedClient();

  const rows: QuotaRow[] = [];

  for (let index = 0; index < 3; index += 1) {
    const { data, error } = await client.rpc('consume_mcp_quota', {
      p_limit: 2,
      p_window_seconds: 60,
    });

    if (error) {
      throw new Error(error.message);
    }

    const row = (Array.isArray(data) ? data[0] : data) as QuotaRow | null;
    if (!row) throw new Error('consume_mcp_quota returned no rows.');
    rows.push(row);
  }

  console.log(
    rows.map((row) => ({ allowed: row.allowed, remaining: row.remaining }))
  );

  if (!rows[0].allowed || !rows[1].allowed || rows[2].allowed) {
    throw new Error('Unexpected quota sequence; expected true, true, false.');
  }

  console.log('rate limit smoke: ok');
};

main().catch((error: unknown) => {
  console.error(
    `rate limit smoke failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
