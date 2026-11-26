import React, { useEffect, useMemo, useState } from 'react';
import {
  IconAlertCircle as AlertCircle,
  IconCheck as Check,
  IconCopy as Copy,
  IconExternalLink as ExternalLink,
  IconFileText as FileText,
} from '@tabler/icons-react';
import {
  ACTIVE_JOB_STATUSES,
  JOB_STATUS_LABELS,
  JobApplication,
  JobApplicationInput,
  JobStatus,
  WORK_MODE_LABELS,
  WORK_MODES,
  WorkMode,
} from '../../types/job';
import { ResumeDocument } from '../../types/resume';
import { matchJobToResume } from '../../lib/domain/jdMatch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface JobFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialJob?: JobApplication | null;
  defaultStatus?: JobStatus;
  resumes: ResumeDocument[];
  onSave: (input: JobApplicationInput, existingId?: string) => void;
  onTailorResume?: (baseResumeId: string, company: string, role: string) => string | null;
  onOpenResumeEditor?: (resumeId: string) => void;
}

export const JobFormDialog: React.FC<JobFormDialogProps> = ({
  isOpen,
  onClose,
  initialJob,
  defaultStatus = 'on_progress',
  resumes,
  onSave,
  onTailorResume,
  onOpenResumeEditor,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<JobStatus>(defaultStatus);
  const [workMode, setWorkMode] = useState<WorkMode>('onsite');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [resumeId, setResumeId] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [tailorNotice, setTailorNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setTailorNotice(null);
    if (initialJob) {
      setCompany(initialJob.company);
      setRole(initialJob.role);
      setStatus(initialJob.status);
      setWorkMode(initialJob.workMode);
      setLocation(initialJob.location);
      setSalaryRange(initialJob.salaryRange);
      setJobUrl(initialJob.jobUrl);
      setAppliedDate(initialJob.appliedDate || '');
      setResumeId(initialJob.resumeId || '');
      setJobDescription(initialJob.jobDescription);
      setNotes(initialJob.notes);
    } else {
      setCompany('');
      setRole('');
      setStatus(defaultStatus);
      setWorkMode('onsite');
      setLocation('');
      setSalaryRange('');
      setJobUrl('');
      setAppliedDate(new Date().toISOString().slice(0, 10));
      setResumeId(resumes[0]?.id || '');
      setJobDescription('');
      setNotes('');
    }
  }, [isOpen, initialJob, defaultStatus, resumes]);

  const linkedResume = useMemo(
    () => resumes.find((r) => r.id === resumeId) || null,
    [resumes, resumeId]
  );

  const jdMatch = useMemo(() => {
    if (!linkedResume || !jobDescription.trim()) return null;
    return matchJobToResume(jobDescription, role, linkedResume);
  }, [jobDescription, role, linkedResume]);

  const handleTailorDuplicate = () => {
    if (!onTailorResume) return;
    const baseId = resumeId || resumes[0]?.id;
    if (!baseId) return;
    const newId = onTailorResume(baseId, company.trim(), role.trim());
    if (newId) {
      setResumeId(newId);
      setTailorNotice('Created and linked a tailored resume copy for this application.');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!company.trim() || !role.trim()) {
      setErrorMsg('Enter both the company name and role title.');
      return;
    }

    onSave(
      {
        company: company.trim(),
        role: role.trim(),
        status,
        workMode,
        location: location.trim(),
        salaryRange: salaryRange.trim(),
        jobUrl: jobUrl.trim(),
        appliedDate: appliedDate.trim() || undefined,
        resumeId: resumeId || undefined,
        jobDescription,
        notes,
      },
      initialJob?.id
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
            {initialJob ? 'Edit application' : 'Add job application'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Record the role details, link the resume version you used, and paste the job description to check keyword coverage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="job-company" className="block text-xs font-semibold text-foreground">
                Company <span className="text-destructive">*</span>
              </label>
              <Input
                id="job-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Tokopedia, GoTo"
                required
                autoFocus
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="job-role" className="block text-xs font-semibold text-foreground">
                Role title <span className="text-destructive">*</span>
              </label>
              <Input
                id="job-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                required
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Row 2: Stage, Work mode, Applied date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="job-status" className="block text-xs font-semibold text-foreground">
                Stage
              </label>
              <select
                id="job-status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as JobStatus);
                }}
                className="flex h-10 w-full rounded-[0.875rem] border border-input bg-card px-3 py-2 text-sm text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ACTIVE_JOB_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {JOB_STATUS_LABELS[st]}
                  </option>
                ))}
                {initialJob?.status === 'archived' && (
                  <option value="archived">{JOB_STATUS_LABELS.archived}</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="job-work-mode" className="block text-xs font-semibold text-foreground">
                Work mode
              </label>
              <select
                id="job-work-mode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="flex h-10 w-full rounded-[0.875rem] border border-input bg-card px-3 py-2 text-sm text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {WORK_MODES.map((wm) => (
                  <option key={wm} value={wm}>
                    {WORK_MODE_LABELS[wm]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="job-applied-date" className="block text-xs font-semibold text-foreground">
                Applied date
              </label>
              <Input
                id="job-applied-date"
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Row 3: Location & Salary Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="job-location" className="block text-xs font-semibold text-foreground">
                Location
              </label>
              <Input
                id="job-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Jakarta, Indonesia"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="job-salary" className="block text-xs font-semibold text-foreground">
                Salary range
              </label>
              <Input
                id="job-salary"
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. IDR 15M – 22M / month"
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Row 4: Job URL */}
          <div className="space-y-1.5">
            <label htmlFor="job-url" className="block text-xs font-semibold text-foreground">
              Job posting link
            </label>
            <Input
              id="job-url"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
              className="h-10 text-sm"
            />
          </div>

          {/* Row 5: Linked Resume & 1-Click Tailor */}
          <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label htmlFor="job-resume" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                <span>Linked resume version</span>
              </label>

              {resumes.length > 0 && onTailorResume && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleTailorDuplicate}
                    className="h-8 gap-1.5 text-xs font-medium"
                    title="Create a duplicate resume tailored for this role"
                  >
                    <Copy className="size-3.5 text-muted-foreground" />
                    <span>Duplicate & tailor copy</span>
                  </Button>
                  {resumeId && onOpenResumeEditor && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onSave(
                          {
                            company: company.trim() || 'Untitled Company',
                            role: role.trim() || 'Untitled Role',
                            status,
                            workMode,
                            location: location.trim(),
                            salaryRange: salaryRange.trim(),
                            jobUrl: jobUrl.trim(),
                            appliedDate: appliedDate.trim() || undefined,
                            resumeId: resumeId || undefined,
                            jobDescription,
                            notes,
                          },
                          initialJob?.id
                        );
                        onOpenResumeEditor(resumeId);
                      }}
                      className="h-8 gap-1 text-xs font-medium text-primary hover:text-primary"
                    >
                      <span>Save & edit resume</span>
                      <ExternalLink className="size-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <select
              id="job-resume"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="flex h-10 w-full rounded-[0.875rem] border border-input bg-card px-3 py-2 text-sm text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">No resume linked</option>
              {resumes.map((res) => (
                <option key={res.id} value={res.id}>
                  {res.title} ({res.content.header.fullName || 'Unnamed'})
                </option>
              ))}
            </select>

            {tailorNotice && (
              <p className="text-xs text-emerald-700 flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0" />
                <span>{tailorNotice}</span>
              </p>
            )}
          </div>

          {/* Row 6: Job Description & Local Keyword Match */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="job-description" className="block text-xs font-semibold text-foreground">
                Job description
              </label>
              <span className="text-[11px] text-muted-foreground">
                Used for local keyword matching against the linked resume
              </span>
            </div>
            <textarea
              id="job-description"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the responsibilities, required skills, and qualifications from the job posting..."
              className="w-full rounded-[0.875rem] border border-input bg-card px-3 py-2 text-sm text-foreground shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            {/* Live Local ATS Keyword Match Analysis */}
            {jdMatch && (
              <div className="mt-2 rounded-2xl border border-border bg-card p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={jdMatch.score >= 70 ? 'secondary' : 'outline'}
                      className="gap-1.5 text-xs font-semibold tabular-nums"
                    >
                      {jdMatch.score >= 70 ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="size-3.5 text-amber-600" />
                      )}
                      <span>{jdMatch.score}% keyword match</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ({jdMatch.matchedKeywords.length} of {jdMatch.totalKeywords} key terms in {linkedResume?.title})
                    </span>
                  </div>
                </div>

                {jdMatch.missingKeywords.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Missing from linked resume:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {jdMatch.missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {jdMatch.matchedKeywords.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Matched in linked resume:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {jdMatch.matchedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                        >
                          <Check className="size-3 shrink-0" />
                          <span>{kw}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 7: Notes */}
          <div className="space-y-1.5">
            <label htmlFor="job-notes" className="block text-xs font-semibold text-foreground">
              Notes & interview log
            </label>
            <textarea
              id="job-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recruiter name, interview dates, take-home assignment links, or follow-up notes..."
              className="w-full rounded-[0.875rem] border border-input bg-card px-3 py-2 text-sm text-foreground shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="font-semibold">
              {initialJob ? 'Save changes' : 'Add application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
