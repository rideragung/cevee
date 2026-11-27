import type { JobApplication } from '../types/job';
import type { SaveJobResult } from './jobService';

type Entry = { job: JobApplication; expected: number; token: string };
type Writer = (job: JobApplication, version: number, owner: string) => Promise<SaveJobResult>;

/** One queue per account; one in-flight write per application. A newer edit inherits
 * the acknowledged version, never the stale version from the card it edited. */
export class JobOutbox {
  private entries: Record<string, Entry> = {};
  private flights = new Map<string, Promise<void>>();
  readonly conflicts = new Map<string, JobApplication>();
  durable = true;
  active = true;

  constructor(readonly owner: string, private storage: Storage, private write: Writer,
    private changed: () => void, private accepted: (job: JobApplication) => void) {
    try { this.entries = JSON.parse(storage.getItem(this.key) || '{}') ?? {}; }
    catch { this.durable = false; }
  }

  private get key() { return `cevee.jobs.pending.v1:${this.owner}`; }
  get count() { return Object.keys(this.entries).length; }
  get saving() { return this.flights.size > 0; }
  merge(cloud: JobApplication[]) {
    return [...Object.values(this.entries).map(e => e.job), ...cloud.filter(j => !this.entries[j.id])];
  }
  private persist() {
    try {
      if (this.count) this.storage.setItem(this.key, JSON.stringify(this.entries));
      else this.storage.removeItem(this.key);
      this.durable = true;
    } catch { this.durable = false; }
    if (this.active) this.changed();
  }
  enqueue(job: JobApplication, expected = 0) {
    this.entries[job.id] = { job, expected: this.entries[job.id]?.expected ?? expected, token: crypto.randomUUID() };
    this.persist();
    void this.flush(job.id);
  }
  retry() { Object.keys(this.entries).forEach(id => void this.flush(id)); }
  flush(id: string): Promise<void> {
    const flight = this.flights.get(id);
    if (flight) return flight;
    if (!this.active || !this.entries[id] || this.conflicts.has(id)) return Promise.resolve();
    const work = Promise.resolve().then(async () => {
      while (this.active && this.entries[id]) {
        const sent = this.entries[id];
        const result = await this.write(sent.job, sent.expected, this.owner);
        if (!this.active || !this.entries[id]) return;
        if (!result.ok) {
          if (result.reason === 'conflict' && result.latest) this.conflicts.set(id, result.latest);
          break;
        }
        if (this.entries[id].token === sent.token) {
          delete this.entries[id];
          this.accepted({ ...sent.job, version: result.version });
        } else this.entries[id].expected = result.version;
        this.persist();
      }
    }).catch(() => { /* keep the pending entry until retry */ }).finally(() => {
      this.flights.delete(id);
      if (this.active) this.changed();
    });
    this.flights.set(id, work);
    this.changed();
    return work;
  }
  resolve(id: string, keepLocal: boolean) {
    const latest = this.conflicts.get(id);
    if (!latest || !this.entries[id]) return;
    this.conflicts.delete(id);
    if (keepLocal) this.entries[id].expected = latest.version ?? 1;
    else { delete this.entries[id]; this.accepted(latest); }
    this.persist();
    if (keepLocal) void this.flush(id);
  }
  async settle(id: string) { await this.flush(id); return !this.entries[id]; }
}
