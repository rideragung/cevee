import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconAlertCircle as AlertCircle,
  IconCheck as Check,
  IconCopy as Copy,
  IconExternalLink as ExternalLink,
  IconFileText as FileText,
} from '@tabler/icons-react';
import {
  JOB_STATUS_CHOICES,
  ActiveJobStatus,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  EmploymentType,
  JOB_INDUSTRIES,
  JOB_INDUSTRY_LABELS,
  JOB_PLATFORM_LABELS,
  JOB_PLATFORMS,
  JOB_PROGRESS_STAGE_LABELS,
  JobApplication,
  JobApplicationInput,
  JobIndustry,
  JobPlatform,
  JobProgressStage,
  JobStatus,
  WORK_MODE_LABELS,
  WORK_MODES,
  WorkMode,
} from '../../types/job';
import { ResumeDocument } from '../../types/resume';
import { matchJobToResume } from '../../lib/domain/jdMatch';
import { detectJobPlatform } from '../../lib/domain/jobPlatform';
import {
  getProvinceName,
  getRegencyName,
  INDONESIA_PROVINCES,
  INDONESIA_REGENCY_BY_PROVINCE,
} from '../../data/indonesiaRegions';
import {
  describeWageSource,
  formatRupiah,
  formatWageEffectiveDate,
  resolveMinimumWage,
} from '../../lib/wagesService';
import { useMinimumWageDataset } from '../../hooks/useMinimumWageDataset';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MANUAL_LOCATION_VALUE = 'manual';

interface JobFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialJob?: JobApplication | null;
  defaultStatus?: ActiveJobStatus;
  focusField?: 'resume' | 'schedule';
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
  focusField,
  resumes,
  onSave,
  onTailorResume,
  onOpenResumeEditor,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<JobStatus>(defaultStatus);
  const [progressStage, setProgressStage] = useState<JobProgressStage>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  useEffect(() => {
    if (!isOpen || !detailsOpen || !focusField) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(focusField === 'schedule' ? 'job-interview-date' : 'job-resume')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, detailsOpen, focusField]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time');
  const [workMode, setWorkMode] = useState<WorkMode>('onsite');
  const [provinceCode, setProvinceCode] = useState('');
  const [regencyCode, setRegencyCode] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [jobPlatform, setJobPlatform] = useState<JobPlatform | ''>('');
  const [industry, setIndustry] = useState<JobIndustry | ''>('');
  const [platformTouched, setPlatformTouched] = useState(false);
  const [autoDetectedPlatform, setAutoDetectedPlatform] = useState<JobPlatform | ''>('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
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
    setDetailsOpen(Boolean(initialJob));
    setTailorNotice(null);
    if (initialJob) {
      const initialProvince = getProvinceName(initialJob.provinceCode)
        ? initialJob.provinceCode ?? ''
        : '';
      const initialPlatform =
        initialJob.jobPlatform ?? detectJobPlatform(initialJob.jobUrl) ?? '';

      setCompany(initialJob.company);
      setRole(initialJob.role);
      setStatus(initialJob.status);
      setProgressStage(initialJob.progressStage);
      setEmploymentType(initialJob.employmentType || 'full_time');
      setWorkMode(initialJob.workMode);
      setProvinceCode(
        initialProvince || (initialJob.location ? MANUAL_LOCATION_VALUE : '')
      );
      setRegencyCode(initialProvince ? initialJob.regencyCode ?? '' : '');
      setManualLocation(initialProvince ? '' : initialJob.location);
      setJobPlatform(initialPlatform);
      setIndustry(initialJob.industry ?? '');
      setPlatformTouched(Boolean(initialJob.jobPlatform));
      setAutoDetectedPlatform(
        initialJob.jobPlatform || !initialPlatform ? '' : initialPlatform
      );
      setSalaryRange(initialJob.salaryRange);
      setJobUrl(initialJob.jobUrl);
      setAppliedDate(initialJob.appliedDate || '');
      setInterviewDate(initialJob.interviewDate || '');
      setResumeId(initialJob.resumeId || '');
      setJobDescription(initialJob.jobDescription);
      setNotes(initialJob.notes);
    } else {
      setCompany('');
      setRole('');
      setStatus(defaultStatus);
      setProgressStage(undefined);
      setEmploymentType('full_time');
      setWorkMode('onsite');
      setProvinceCode('');
      setRegencyCode('');
      setManualLocation('');
      setJobPlatform('');
      setIndustry('');
      setPlatformTouched(false);
      setAutoDetectedPlatform('');
      setSalaryRange('');
      setJobUrl('');
      setAppliedDate(new Date().toISOString().slice(0, 10));
      setInterviewDate('');
      setResumeId('');
      setJobDescription('');
      setNotes('');
    }
  }, [isOpen, initialJob, defaultStatus]);

  const linkedResume = useMemo(
    () => resumes.find((r) => r.id === resumeId) || null,
    [resumes, resumeId]
  );

  const jdMatch = useMemo(() => {
    if (!linkedResume || !jobDescription.trim()) return null;
    return matchJobToResume(jobDescription, role, linkedResume);
  }, [jobDescription, role, linkedResume]);

  const wageDataset = useMinimumWageDataset(isOpen);

  const regencyOptions = useMemo(
    () =>
      provinceCode && provinceCode !== MANUAL_LOCATION_VALUE
        ? INDONESIA_REGENCY_BY_PROVINCE[provinceCode] ?? []
        : [],
    [provinceCode]
  );

  const minimumWage = useMemo(
    () =>
      resolveMinimumWage(
        wageDataset,
        provinceCode === MANUAL_LOCATION_VALUE ? null : provinceCode,
        regencyCode
      ),
    [wageDataset, provinceCode, regencyCode]
  );

  const resolvedLocation = useMemo(() => {
    if (provinceCode === MANUAL_LOCATION_VALUE) return manualLocation.trim();
    if (provinceCode) {
      return [getRegencyName(regencyCode), getProvinceName(provinceCode)]
        .filter(Boolean)
        .join(', ');
    }
    return manualLocation.trim();
  }, [provinceCode, regencyCode, manualLocation]);

  const handleProvinceChange = (nextProvince: string) => {
    setProvinceCode(nextProvince);
    setRegencyCode('');
    if (nextProvince === MANUAL_LOCATION_VALUE) {
      setManualLocation(resolvedLocation);
    }
  };

  const handlePlatformChange = (value: string) => {
    setJobPlatform(value as JobPlatform | '');
    setPlatformTouched(Boolean(value));
    setAutoDetectedPlatform('');
  };

  const handleJobUrlChange = (value: string) => {
    setJobUrl(value);
    if (platformTouched) return;

    const detected = detectJobPlatform(value);
    if (detected) {
      setJobPlatform(detected);
      setAutoDetectedPlatform(detected);
      return;
    }

    if (autoDetectedPlatform) {
      setJobPlatform('');
      setAutoDetectedPlatform('');
    }
  };

  const buildInput = (): JobApplicationInput => ({
    company: company.trim(),
    role: role.trim(),
    status,
    progressStage: status === 'on_progress' ? progressStage : undefined,
    employmentType,
    workMode,
    location: resolvedLocation,
    provinceCode:
      provinceCode && provinceCode !== MANUAL_LOCATION_VALUE ? provinceCode : undefined,
    regencyCode:
      provinceCode && provinceCode !== MANUAL_LOCATION_VALUE
        ? regencyCode || undefined
        : undefined,
    jobPlatform: jobPlatform || undefined,
    industry: industry || undefined,
    salaryRange: salaryRange.trim(),
    jobUrl: jobUrl.trim(),
    appliedDate: appliedDate.trim() || undefined,
    interviewDate: interviewDate.trim() || undefined,
    resumeId: resumeId || undefined,
    jobDescription,
    notes,
  });

  const handleTailorDuplicate = () => {
    if (!onTailorResume) return;
    const baseId = resumeId;
    if (!baseId) return;
    const newId = onTailorResume(baseId, company.trim(), role.trim());
    if (newId) {
      setResumeId(newId);
      setTailorNotice('Copy created. Save the application to link it.');
    }
  };

  const saveDraft = () => {
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
      return false;
    }

    if (status === 'on_progress' && !progressStage) {
      const selector = document.getElementById('job-status') as HTMLSelectElement | null;
      selector?.focus();
      selector?.reportValidity();
      return false;
    }
    onSave(buildInput(), initialJob?.id);
    return true;
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!saveDraft()) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} onOpenAutoFocus={(event) => {
        if (focusField) {
          event.preventDefault();
        }
      }} className="flex max-w-2xl max-h-[90dvh] flex-col overflow-hidden rounded-2xl p-4 sm:p-6 [&>button:last-child]:size-11 [&>button:last-child]:grid [&>button:last-child]:place-items-center [&>button:last-child]:right-1 [&>button:last-child]:top-1 [&>button:last-child]:before:inset-0">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
            {initialJob ? 'Edit application' : 'Add job application'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 min-w-0 flex-col">
          <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain px-1 py-2">
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
                autoFocus={!focusField}
                className="h-11 text-base sm:text-sm"
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
                className="h-11 text-base sm:text-sm"
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
            <label htmlFor="job-status" className="block text-xs font-semibold">Status</label>
            <select id="job-status" required value={status === 'on_progress' ? progressStage ?? '' : status} onChange={(e) => {
              const choice = JOB_STATUS_CHOICES.find(item => item.value === e.target.value);
              if (choice) { setStatus(choice.status); setProgressStage(choice.step); }
              else if (e.target.value === 'archived') setStatus('archived');
            }} className="h-11 w-full rounded-[0.875rem] border border-input bg-card px-3 text-base sm:text-sm">
              <option disabled value="">Choose status</option>
              {JOB_STATUS_CHOICES.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
              {initialJob?.status === 'archived' && <option value="archived">Archived</option>}
            </select>
          </div>
          <button type="button" aria-controls="job-details" aria-expanded={detailsOpen} onClick={() => setDetailsOpen(!detailsOpen)} className="min-h-11 text-sm font-semibold text-primary">{detailsOpen ? 'Hide details' : 'More details'}</button>
          <div id="job-details" hidden={!detailsOpen} className="space-y-4">
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
                      'relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:content-[\'\']',
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">

            <div className="space-y-1.5">
              <label htmlFor="job-work-mode" className="block text-xs font-semibold text-foreground">
                Work mode
              </label>
              <select
                id="job-work-mode"
                name="workMode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="flex h-11 w-full min-w-0 rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {WORK_MODES.map((wm) => (
                  <option key={wm} value={wm}>
                    {WORK_MODE_LABELS[wm]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="job-industry" className="block text-xs font-semibold text-foreground">
                Industry
              </label>
              <select
                id="job-industry"
                name="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value as JobIndustry | '')}
                className="flex h-11 w-full min-w-0 rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select industry</option>
                {JOB_INDUSTRIES.map((value) => (
                  <option key={value} value={value}>
                    {JOB_INDUSTRY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Applied date & Interview date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                className="h-11 text-base sm:text-sm"
              />
            </div>

            {status === 'on_progress' ? <div className="space-y-1.5">
              <label htmlFor="job-interview-date" className="block text-xs font-semibold text-foreground">
                Interview or test date
              </label>
              <Input
                id="job-interview-date"
                name="interviewDate"
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="h-11 text-base sm:text-sm"
              />
            </div> : status !== 'applied' && initialJob?.interviewDate ? <div className="space-y-1.5 text-xs">
              <p className="font-semibold">Schedule history</p>
              <p>{initialJob.progressStage ? JOB_PROGRESS_STAGE_LABELS[initialJob.progressStage] : 'Interview or test'} · <time dateTime={initialJob.interviewDate}>{initialJob.interviewDate}</time></p>
            </div> : null}
          </div>


          {/* Row 4: Province, City/Regency & minimum wage reference */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label htmlFor="job-province" className="block text-xs font-semibold text-foreground">
                  Province
                </label>
                <select
                  id="job-province"
                  name="provinceCode"
                  value={provinceCode}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="flex h-11 w-full min-w-0 rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select province</option>
                  {INDONESIA_PROVINCES.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                  <option value={MANUAL_LOCATION_VALUE}>Outside Indonesia / other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="job-regency" className="block text-xs font-semibold text-foreground">
                  City / Regency
                </label>
                <select
                  id="job-regency"
                  name="regencyCode"
                  value={regencyCode}
                  onChange={(e) => setRegencyCode(e.target.value)}
                  disabled={!provinceCode || provinceCode === MANUAL_LOCATION_VALUE}
                  className="flex h-11 w-full min-w-0 rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {provinceCode && provinceCode !== MANUAL_LOCATION_VALUE
                      ? 'All cities & regencies'
                      : 'Select a province first'}
                  </option>
                  {regencyOptions.map((regency) => (
                    <option key={regency.code} value={regency.code}>
                      {regency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {provinceCode === MANUAL_LOCATION_VALUE && (
              <div className="space-y-1.5">
                <label htmlFor="job-location" className="block text-xs font-semibold text-foreground">
                  Location detail
                </label>
                <Input
                  id="job-location"
                  name="location"
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="e.g. Singapore, or Remote (APAC)"
                  className="h-11 text-base sm:text-sm"
                />
              </div>
            )}

            <div role="status" aria-live="polite">
              {minimumWage && (
                <div className="rounded-2xl border border-border bg-muted/30 px-3.5 py-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="px-2 py-0 text-[11px] font-semibold tabular-nums"
                      >
                        {minimumWage.kind} {minimumWage.year}
                      </Badge>
                      <span className="truncate text-xs font-semibold text-foreground">
                        {minimumWage.scopeLabel}
                      </span>
                    </div>
                    <p className="text-sm font-bold tabular-nums text-foreground">
                      {formatRupiah(minimumWage.amountIdr)}
                      <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                        / month
                      </span>
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                    <span>{describeWageSource(minimumWage.source)}</span>
                    {minimumWage.source?.effectiveDate && (
                      <span>
                        effective {formatWageEffectiveDate(minimumWage.source.effectiveDate)}
                      </span>
                    )}
                    {minimumWage.source?.url && (
                      <a
                        href={minimumWage.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
                      >
                        <span>Source</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                  {minimumWage.note && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {minimumWage.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Salary range */}
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
              className="h-11 text-base sm:text-sm"
            />
          </div>

          {/* Row 6: Platform & Job URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="job-platform" className="block text-xs font-semibold text-foreground">
                Job posting platform
              </label>
              <select
                id="job-platform"
                name="jobPlatform"
                value={jobPlatform}
                onChange={(e) => handlePlatformChange(e.target.value)}
                className="flex h-11 w-full min-w-0 rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Not set</option>
                {JOB_PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {JOB_PLATFORM_LABELS[platform]}
                  </option>
                ))}
              </select>
              {autoDetectedPlatform && jobPlatform === autoDetectedPlatform && (
                <p className="text-[11px] text-muted-foreground">Detected from the link</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="job-url" className="block text-xs font-semibold text-foreground">
                Job posting link
              </label>
              <Input
                id="job-url"
                name="jobUrl"
                type="url"
                value={jobUrl}
                onChange={(e) => handleJobUrlChange(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/..."
                className="h-11 text-base sm:text-sm"
              />
            </div>
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
                    disabled={!resumeId}
                    className="relative h-8 gap-1.5 text-xs font-medium after:absolute after:-inset-y-1.5 after:content-['']"
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
                        if (saveDraft()) onOpenResumeEditor(resumeId);
                      }}
                      className="relative h-8 gap-1 text-xs font-medium text-primary after:absolute after:-inset-y-1.5 after:content-[''] hover:text-primary"
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
              className="flex h-11 w-full min-w-0 rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="w-full rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                      ({jdMatch.matchedCount} of {jdMatch.totalKeywords} key terms in {linkedResume?.title})
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
              className="w-full rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          </div>
          </div>
          <DialogFooter className="shrink-0 gap-2 border-t border-border pt-3">
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
