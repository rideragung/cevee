import { describe, expect, it, vi } from 'vitest';
import { JobOutbox } from '../../src/lib/jobOutbox';
import { buildJobRowPayload, createJobApplication, mapJobRowToDocument, type JobRow } from '../../src/lib/domain/jobRow';
import type { SaveJobResult } from '../../src/lib/jobService';

const fixture = () => createJobApplication({ company: 'Test', role: 'Test role', status: 'on_progress' }, 'test-job');
function storage() {
  const map = new Map<string, string>();
  return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, val: string) => map.set(key, val), removeItem: (key: string) => map.delete(key) } as Storage;
}
describe('job tracker recovery', () => {
  it('recovers an offline edit after reload, isolates accounts and retries only once', async () => {
    const disk = storage(), job = fixture();
    const queue = new JobOutbox('a', disk, async () => ({ ok: false, reason: 'error', message: 'offline' }), vi.fn(), vi.fn());
    queue.enqueue({ ...job, notes: 'Pending' }, 1);
    expect(await queue.settle(job.id)).toBe(false);
    const write = vi.fn(async () => ({ ok: true as const, version: 2 }));
    const restored = new JobOutbox('a', disk, write, vi.fn(), vi.fn());
    expect(restored.merge([job]).map(j => j.notes)).toEqual(['Pending']);
    expect(new JobOutbox('b', disk, write, vi.fn(), vi.fn()).count).toBe(0);
    restored.retry(); restored.retry();
    expect(await restored.settle(job.id)).toBe(true);
    expect(write).toHaveBeenCalledTimes(1);
    expect(restored.count).toBe(0);
  });
  it('preserves a second edit made during an in-flight insert', async () => {
    const accepted = vi.fn(), versions: number[] = [];
    let release!: (result: SaveJobResult) => void;
    const q = new JobOutbox('a', storage(), async (_, version) => {
      versions.push(version);
      return version ? { ok: true, version: version + 1 } : new Promise(resolve => { release = resolve; });
    }, vi.fn(), accepted);
    const job = fixture(); q.enqueue(job); await Promise.resolve();
    q.enqueue({ ...job, notes: 'Second edit' }, 1); release({ ok: true, version: 1 });
    expect(await q.settle(job.id)).toBe(true);
    expect(versions).toEqual([0, 1]);
    expect(accepted.mock.calls[0][0]).toMatchObject({ notes: 'Second edit', version: 2 });
  });
  it.each([true, false])('keeps both versions until explicit conflict choice (keep local: %s)', async keepLocal => {
    const local = fixture(), remote = { ...local, notes: 'Cloud', version: 3 }, accepted = vi.fn();
    const q = new JobOutbox('a', storage(), async (_, version) => version === 3 ? { ok: true, version: 4 } : { ok: false, reason: 'conflict', latest: remote }, vi.fn(), accepted);
    q.enqueue(local, 1); await q.flush(local.id);
    expect(q.count).toBe(1); expect(q.conflicts.get(local.id)).toEqual(remote);
    q.resolve(local.id, keepLocal); await q.flush(local.id);
    expect(accepted.mock.calls[0][0].notes).toBe(keepLocal ? local.notes : 'Cloud');
    expect(q.count).toBe(0);
  });
  it('round-trips optional steps and archive origin without guessing missing history', () => {
    const job = fixture(); expect(job.progressStage).toBeUndefined();
    const row = buildJobRowPayload({ ...job, status: 'archived', archivedFrom: 'on_progress', progressStage: 'technical_test' }, 2) as unknown as JobRow;
    expect(mapJobRowToDocument(row)).toMatchObject({ archivedFrom: 'on_progress', progressStage: 'technical_test' });
    expect(mapJobRowToDocument({ ...row, archived_from: null }).archivedFrom).toBeUndefined();
    expect(mapJobRowToDocument({ ...row, status: 'on_progress', progress_stage: null }).progressStage).toBeUndefined();
  });
});
