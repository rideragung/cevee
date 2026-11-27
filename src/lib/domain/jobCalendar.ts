import { JOB_PROGRESS_STAGE_LABELS, type JobApplication } from '../../types/job';

export function scheduleDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const day = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(+day) && day.toISOString().startsWith(value) ? day : null;
}

export function eventLabel(job: JobApplication) {
  const step = job.status === 'on_progress' ? job.progressStage : undefined;
  return step && step !== 'preparing_interview' && step !== 'interview_finished'
    ? JOB_PROGRESS_STAGE_LABELS[step] : 'Interview';
}

const escapeText = (text: string) => text.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/([;,])/g, '\\$1');
// Fold at 75 octets without splitting a Unicode character (RFC 5545).
function fold(line: string) {
  const encoder = new TextEncoder();
  let result = '', bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > 75) { result += '\r\n '; bytes = 1; }
    result += ch; bytes += size;
  }
  return result;
}

export function applicationCalendar(job: JobApplication, now = new Date()) {
  const start = scheduleDate(job.interviewDate);
  if (!start) return null;
  const end = new Date(+start + 86_400_000);
  const day = (value: Date) => value.toISOString().slice(0, 10).replace(/-/g, '');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cevee//Job Tracker//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${encodeURIComponent(job.id)}@cevee`, `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${day(start)}`, `DTEND;VALUE=DATE:${day(end)}`,
    `SUMMARY:${escapeText(`${eventLabel(job)}: ${job.role} at ${job.company}`)}`, 'END:VEVENT', 'END:VCALENDAR', ''].map(fold).join('\r\n');
}

export function downloadJobCalendar(job: JobApplication) {
  const body = applicationCalendar(job);
  if (!body) return;
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `application-${job.interviewDate}.ics`;
  document.body.appendChild(link);
  link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
