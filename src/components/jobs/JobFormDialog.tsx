import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconAlertCircle as AlertCircle,
  IconCheck as Check,
  IconCopy as Copy,
  IconExternalLink as ExternalLink,
  IconFileText as FileText,
} from '@tabler/icons-react';
import {
  ACTIVE_JOB_STATUSES,
  ActiveJobStatus,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  EmploymentType,
  JOB_PROGRESS_STAGE_LABELS,
  JOB_PROGRESS_STAGES,
  JOB_STATUS_LABELS,
  JobApplication,
  JobApplicationInput,
  JobProgressStage,
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
import { cn } from '@/lib/utils';

interface JobFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialJob?: JobApplication | null;
  defaultStatus?: ActiveJobStatus;
  resumes: ResumeDocument[];
  onSave: (input: JobApplicationInput, existingId?: string) => void;
  onTailorResume?: (baseResumeId: string, company: string, role: string) => string | null;
  onOpenResumeEditor?: (resumeId: string) => void;
}

export const JobFormDialog: React.FC<JobFormDialogProps> = ({
  isOpen,
  onClose,
  initialJob,
  defaultStatus = 'applied',
  resumes,
  onSave,
  onTailorResume,
  onOpenResumeEditor,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<JobStatus>(defaultStatus);
  const [progressStage, setProgressStage] = useState<JobProgressStage>('hr_interview');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time');
  const [workMode, setWorkMode] = useState<WorkMode>('onsite');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [resumeId, setResumeId] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [tailorNotice, setTailorNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ company?: string; role?: string }>({});

  const companyInputRef = useRef<HTMLInputElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setTailorNotice(null);
    if (initialJob) {
      setCompany(initialJob.company);
      setRole(initialJob.role);
      setStatus(initialJob.status);
      setProgressStage(initialJob.progressStage || 'hr_interview');
      setEmploymentType(initialJob.employmentType || 'full_time');
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
      setProgressStage('hr_interview');
      setEmploymentType('full_time');
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
    const nextErrors: { company?: string; role?: string } = {};
    if (!company.trim()) {
      nextErrors.company = 'Enter the company name.';
    }
    if (!role.trim()) {
      nextErrors.role = 'Enter the role title.';
    }

    if (nextErrors.company || nextErrors.role) {
      setFieldErrors(nextErrors);
      if (nextErrors.company) {
        companyInputRef.current?.focus();
      } else if (nextErrors.role) {
        roleInputRef.current?.focus();
      }
      return;
    }

    onSave(
      {
        company: company.trim(),
        role: role.trim(),
        status,
        progressStage: status === 'on_progress' ? progressStage : undefined,
        employmentType,
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
            Record the role details, link the resume version you sent, and paste the job description to check keyword coverage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          {/* Row 1: Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="job-company" className="block text-xs font-semibold text-foreground">
                Company <span className="text-destructive">*</span>
              </label>
              <Input
                ref={companyInputRef}
                id="job-company"
                name="company"
                type="text"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  if (fieldErrors.company) {
                    setFieldErrors((prev) => ({ ...prev, company: undefined }));
                  }
                }}
                placeholder="e.g. Stripe, Tokopedia, GoTo"
                aria-invalid={Boolean(fieldErrors.company)}
                aria-describedby={fieldErrors.company ? 'job-company-error' : undefined}
                autoFocus
                className="h-10 text-sm"
              />
              {fieldErrors.company && (
                <p id="job-company-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.company}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="job-role" className="block text-xs font-semibold text-foreground">
                Role title <span className="text-destructive">*</span>
              </label>
              <Input
                ref={roleInputRef}
                id="job-role"
                name="role"
                type="text"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (fieldErrors.role) {
                    setFieldErrors((prev) => ({ ...prev, role: undefined }));
                  }
                }}
                placeholder="e.g. Senior Frontend Engineer"
                aria-invalid={Boolean(fieldErrors.role)}
                aria-describedby={fieldErrors.role ? 'job-role-error' : undefined}
                className="h-10 text-sm"
              />
              {fieldErrors.role && (
                <p id="job-role-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.role}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Employment Type (1-Click Chips) */}
          <div className="space-y-1.5">
            <span id="job-employment-type-label" className="block text-xs font-semibold text-foreground">
              Employment type
            </span>
            <div
              role="group"
              aria-labelledby="job-employment-type-label"
              className="flex flex-wrap gap-1.5"
            >
              {EMPLOYMENT_TYPES.map((type) => {
                const isSelected = employmentType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setEmploymentType(type)}
                    className={cn(
                      'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected
                        ? 'border-primary/40 bg-accent text-primary font-semibold'
                        : 'border-border bg-card text-muted-foreground [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:text-foreground'
                    )}
                  >
                    {EMPLOYMENT_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Stage, Work mode, Applied date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="job-status" className="block text-xs font-semibold text-foreground">
                Stage
              </label>
              <select
                id="job-status"
                name="status"
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
                name="workMode"
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
                name="appliedDate"
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Conditional Sub-Stage Selector when Stage = On progress */}
          {status === 'on_progress' && (
            <div className="rounded-2xl border border-primary/20 bg-accent/40 p-3.5 space-y-2">
              <span
                id="job-progress-stage-label"
                className="block text-xs font-semibold text-foreground"
              >
                Current progress step
              </span>
              <div
                role="group"
                aria-labelledby="job-progress-stage-label"
                className="flex flex-wrap gap-1.5"
              >
                {JOB_PROGRESS_STAGES.map((stage) => {
                  const isSelected = progressStage === stage;
                  return (
                    <button
                      key={stage}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setProgressStage(stage)}
                      className={cn(
                        'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground font-semibold'
                          : 'border-border bg-card text-foreground [@media(hover:hover)]:hover:border-primary/40'
                      )}
                    >
                      {JOB_PROGRESS_STAGE_LABELS[stage]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Row 4: Location & Salary Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="job-location" className="block text-xs font-semibold text-foreground">
                Location
              </label>
              <Input
                id="job-location"
                name="location"
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
                name="salaryRange"
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. IDR 15M – 22M / month"
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Row 5: Job URL */}
          <div className="space-y-1.5">
            <label htmlFor="job-url" className="block text-xs font-semibold text-foreground">
              Job posting link
            </label>
            <Input
              id="job-url"
              name="jobUrl"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
              className="h-10 text-sm"
            />
          </div>

          {/* Row 6: Linked Resume & 1-Click Tailor */}
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
                            progressStage: status === 'on_progress' ? progressStage : undefined,
                            employmentType,
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
              name="resumeId"
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
              <p role="status" className="text-xs text-emerald-700 flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0" />
                <span>{tailorNotice}</span>
              </p>
            )}
          </div>

          {/* Row 7: Job Description & Local Keyword Match */}
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
              name="jobDescription"
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
                  <div className="flex items-center gap-2 flex-wrap">
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

          {/* Row 8: Notes */}
          <div className="space-y-1.5">
            <label htmlFor="job-notes" className="block text-xs font-semibold text-foreground">
              Notes & interview log
            </label>
            <textarea
              id="job-notes"
              name="notes"
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
