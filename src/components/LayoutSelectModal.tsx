import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  LayoutTemplate,
  Sparkles,
  FileCheck,
  FilePlus,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Pencil,
} from 'lucide-react';
import { ResumeDocument, ResumeLayoutId } from '../types/resume';
import { RESUME_LAYOUTS, LayoutDefinition, getLayoutById } from '../data/layouts';
import { DEFAULT_LAYOUT_ID, normalizeLayoutId } from '../layouts/registry';
import { ResumeMiniPreview } from './ResumeMiniPreview';
import { extractTextFromPdf } from '../lib/pdf/extractor';
import { parseResumeWithGemini, formatResumeImportError } from '../lib/ai/geminiParser';
import { adaptParsedResumeToDocument } from '../lib/ai/resumeAdapter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OnboardingStepper, OnboardingStepperStep } from '@/components/ui/onboarding-stepper';
import { TaskSteps, TaskStep } from '@/components/ui/task-steps';
import { MagneticDropZone } from '@/components/ui/magnetic-drop-zone';
import { cn } from '@/lib/utils';

const ONBOARDING_STEPS: OnboardingStepperStep[] = [
  {
    id: 'step-layout',
    label: 'Choose layout',
    title: 'Choose resume layout',
    description: 'Select a starting layout for your resume. You can change this anytime in the editor.',
  },
  {
    id: 'step-content',
    label: 'Content source',
    title: 'Choose content source',
    description: 'Name your resume and choose whether to start blank or import a PDF.',
  },
];

const AI_TASK_STEPS: TaskStep[] = [
  { id: 'extract', label: 'Extracting PDF document text' },
  { id: 'structure', label: 'Structuring experience and skills with AI' },
  { id: 'format', label: 'Formatting layout and readying editor' },
];

interface LayoutSelectModalProps {
  isOpen: boolean;
  mode: 'create' | 'switch';
  currentLayoutId?: string;
  onConfirm: (
    layoutId: ResumeLayoutId,
    importedResume?: ResumeDocument,
    customTitle?: string,
  ) => void;
  onClose: () => void;
}

export const LayoutSelectModal: React.FC<LayoutSelectModalProps> = ({
  isOpen,
  mode,
  currentLayoutId = DEFAULT_LAYOUT_ID,
  onConfirm,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedId, setSelectedId] = useState<ResumeLayoutId>(normalizeLayoutId(currentLayoutId));
  const [creationMethod, setCreationMethod] = useState<'blank' | 'import'>('blank');
  const [file, setFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(normalizeLayoutId(currentLayoutId));
      setStep(1);
      setCreationMethod('blank');
      setFile(null);
      setCustomTitle('');
      setIsProcessing(false);
      setProcessPercent(0);
      setErrorText(null);
    }
  }, [isOpen, currentLayoutId]);

  const handleModalClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const handleFileSelect = (selectedFile?: File | null) => {
    setErrorText(null);
    if (!selectedFile) return;

    if (
      selectedFile.type !== 'application/pdf' &&
      !selectedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorText('Only PDF files are supported.');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorText('File size must be 15 MB or less.');
      return;
    }

    setFile(selectedFile);
    if (!customTitle) {
      const defaultName = selectedFile.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setCustomTitle(defaultName);
    }
  };

  const handleCreateBlank = () => {
    onConfirm(selectedId, undefined, customTitle.trim() || undefined);
  };

  const handleStartImport = async () => {
    if (!file) {
      setErrorText('Select or upload a PDF resume first.');
      return;
    }

    setIsProcessing(true);
    setErrorText(null);
    setProcessPercent(20);

    try {
      // 1. PDF Text extraction
      const { text: pdfText } = await extractTextFromPdf(file);
      setProcessPercent(55);

      // 2. Parse text with structured AI extraction
      const parsedData = await parseResumeWithGemini(pdfText, {
        onStatusUpdate: () => {
          setProcessPercent((prev) => Math.min(prev + 10, 85));
        },
      });

      // 3. Populate into Cevee ResumeDocument
      setProcessPercent(92);
      const resumeDoc = adaptParsedResumeToDocument(
        parsedData,
        selectedId,
        customTitle.trim() || undefined,
      );

      // 4. Completed
      setProcessPercent(100);
      onConfirm(selectedId, resumeDoc, customTitle.trim() || undefined);
    } catch (err: unknown) {
      console.error('Import Resume Error:', err);
      setErrorText(formatResumeImportError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedLayout = getLayoutById(selectedId);
  const activeTaskIndex =
    processPercent >= 100 ? 3 : processPercent >= 85 ? 2 : processPercent >= 45 ? 1 : 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleModalClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden no-print">
        {/* Modal Header */}
        <DialogHeader className="p-5 sm:p-6 border-b border-border space-y-0 text-left bg-card">
          {mode === 'create' ? (
            <div className="space-y-3.5">
              {/* Onboarding Stepper Indicator */}
              <OnboardingStepper
                steps={ONBOARDING_STEPS}
                index={step - 1}
                onIndexChange={(newIdx) => {
                  if (!isProcessing) {
                    setStep((newIdx + 1) as 1 | 2);
                  }
                }}
                progressStyle="segments"
                labelMode="none"
                progressLabel="Resume creation progress"
              />

              {/* Step Header Content */}
              <div className="flex items-start gap-3 pt-0.5">
                <div className="p-2 bg-accent text-accent-foreground rounded-xl border border-border flex-shrink-0 mt-0.5">
                  {step === 1 ? (
                    <LayoutTemplate className="size-4.5 text-primary" />
                  ) : (
                    <FileText className="size-4.5 text-primary" />
                  )}
                </div>
                <div className="flex-1 pr-6">
                  <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                    {step === 1
                      ? 'Choose resume layout'
                      : 'Choose content source'}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                    {step === 1
                      ? 'Select a starting layout for your resume. You can change this anytime in the editor.'
                      : 'Name your resume and choose whether to start blank or import a PDF.'}
                  </DialogDescription>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent text-accent-foreground rounded-xl border border-border flex-shrink-0 mt-0.5">
                <LayoutTemplate className="size-4.5 text-primary" />
              </div>
              <div className="flex-1 pr-6">
                <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Change resume layout
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  Select a layout for this resume. Your content stays the same.
                </DialogDescription>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAHAP 1: Pilih Layout */}
          {(mode === 'switch' || step === 1) && (
            <div className="space-y-4">
              <RadioGroup
                value={selectedId}
                onValueChange={(value) => setSelectedId(normalizeLayoutId(value))}
                aria-label="Pilihan layout resume"
                className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
              >
                {RESUME_LAYOUTS.map((layout: LayoutDefinition) => {
                  const isSelected = selectedId === layout.id;

                  return (
                    <label
                      key={layout.id}
                      className={cn(
                        'relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-[border-color,background-color,box-shadow] duration-150 cursor-pointer',
                        'focus-within:ring-2 focus-within:ring-primary/30',
                        isSelected
                          ? 'border-primary bg-accent/40 shadow-xs'
                          : 'border-border bg-card [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:bg-muted/40',
                      )}
                    >
                      <RadioGroupItem
                        value={layout.id}
                        aria-label={layout.name}
                        className="sr-only"
                      />

                      {/* Mini Preview Box: True A4 Aspect Ratio without horizontal distortion */}
                      <div className="w-full rounded-xl bg-slate-50/80 p-2 sm:p-2.5 mb-3.5 flex items-center justify-center border border-border/70 transition-colors">
                        <div className="w-full max-w-[210px] sm:max-w-none aspect-[210/297] shadow-xs rounded-lg overflow-hidden bg-white">
                          <ResumeMiniPreview
                            layoutId={layout.id}
                            className="w-full h-full border-0 rounded-none shadow-none pointer-events-none"
                          />
                        </div>
                      </div>

                      {/* Info & Badges */}
                      <div className="flex items-center justify-between gap-1.5 w-full mb-1">
                        <span className="text-xs font-bold text-foreground truncate">
                          {layout.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 h-4 shrink-0 font-medium"
                        >
                          {layout.badge}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-2.5">
                        {layout.description}
                      </p>

                      {/* Features Bullet List */}
                      <ul className="space-y-1 w-full mt-auto pt-2 border-t border-border/60">
                        {layout.features.slice(0, 2).map((feat, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-1.5 text-[10px] text-foreground font-medium"
                          >
                            <CheckCircle2 className="size-3 text-primary shrink-0" />
                            <span className="truncate">{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Check indicator circle */}
                      <div className="absolute top-2.5 right-2.5 pointer-events-none">
                        <div
                          className={cn(
                            'flex size-4 items-center justify-center rounded-full border transition-colors duration-150',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                              : 'border-border bg-card',
                          )}
                        >
                          {isSelected && <Check className="size-2.5" strokeWidth={3} />}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* TAHAP 2: Metode & Data Resume */}
          {mode === 'create' && step === 2 && (
            <div className="space-y-4">
              {/* Selected Layout Compact Summary Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/40 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-11 rounded border border-border/70 overflow-hidden bg-white shadow-2xs flex-shrink-0">
                    <ResumeMiniPreview
                      layoutId={selectedId}
                      className="w-full h-full border-0 rounded-none shadow-none pointer-events-none"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {selectedLayout.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 h-4 font-medium"
                      >
                        {selectedLayout.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {selectedLayout.description}
                    </p>
                  </div>
                </div>

                {!isProcessing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold gap-1 text-primary hover:text-primary hover:bg-accent shrink-0 h-8 px-2.5"
                  >
                    <Pencil className="size-3" />
                    <span>Change</span>
                  </Button>
                )}
              </div>

              {/* Resume Title Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="resume-custom-title"
                  className="text-xs font-semibold text-foreground block"
                >
                  Resume title
                </label>
                <Input
                  id="resume-custom-title"
                  type="text"
                  value={customTitle}
                  disabled={isProcessing}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Software Engineer Resume 2026"
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Document name for your dashboard. You can change this anytime.
                </p>
              </div>

              {/* Method Selection Cards */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Choose how to start
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card 1: Blank Template */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setCreationMethod('blank');
                      setErrorText(null);
                    }}
                    className={cn(
                      'relative flex flex-col items-start p-4 rounded-xl border text-left transition-[border-color,background-color,box-shadow] duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
                      creationMethod === 'blank'
                        ? 'border-primary bg-accent/40 shadow-xs'
                        : 'border-border bg-card hover:border-foreground/20 hover:bg-muted/40',
                    )}
                  >
                    <div className="p-2 rounded-lg bg-accent text-accent-foreground border border-border/70 mb-2.5">
                      <FilePlus className="size-4 text-primary" />
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                      Start with blank template
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      ATS-structured template with guidance text. Fill in your details directly in the
                      canvas editor.
                    </p>

                    <div className="absolute top-3.5 right-3.5 pointer-events-none">
                      <div
                        className={cn(
                          'flex size-4 items-center justify-center rounded-full border transition-colors duration-150',
                          creationMethod === 'blank'
                            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                            : 'border-border bg-card',
                        )}
                      >
                        {creationMethod === 'blank' && (
                          <Check className="size-2.5" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Card 2: Scan PDF AI */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setCreationMethod('import');
                      setErrorText(null);
                    }}
                    className={cn(
                      'relative flex flex-col items-start p-4 rounded-xl border text-left transition-[border-color,background-color,box-shadow] duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
                      creationMethod === 'import'
                        ? 'border-primary bg-accent/40 shadow-xs'
                        : 'border-border bg-card hover:border-foreground/20 hover:bg-muted/40',
                    )}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 mb-2.5">
                      <Sparkles className="size-4" />
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                      Scan & import from PDF
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Upload an existing PDF resume to automatically extract content into the template.
                    </p>

                    <div className="absolute top-3.5 right-3.5 pointer-events-none">
                      <div
                        className={cn(
                          'flex size-4 items-center justify-center rounded-full border transition-colors duration-150',
                          creationMethod === 'import'
                            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                            : 'border-border bg-card',
                        )}
                      >
                        {creationMethod === 'import' && (
                          <Check className="size-2.5" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone / In-place TaskSteps (Only shown when Import option is selected) */}
              {creationMethod === 'import' && (
                <div className="space-y-3 pt-1">
                  {isProcessing ? (
                    <div className="p-4 rounded-xl border border-primary/25 bg-card shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                            <FileCheck className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {file?.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Extracting document
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary tabular-nums">
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>{processPercent}%</span>
                        </div>
                      </div>

                      <TaskSteps
                        steps={AI_TASK_STEPS}
                        current={activeTaskIndex}
                        failed={Boolean(errorText)}
                        label="AI extraction progress"
                      />
                    </div>
                  ) : !file ? (
                    <MagneticDropZone
                      onFileSelect={handleFileSelect}
                      disabled={isProcessing}
                    />
                  ) : (
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <FileCheck className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to import
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFile(null)}
                        className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                        title="Change file"
                        aria-label="Change file"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}

                  {/* Error Message Alert */}
                  {errorText && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs leading-relaxed">
                      <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">Unable to import resume</p>
                        <p className="mt-0.5 text-destructive/90">{errorText}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
          {mode === 'switch' ? (
            <>
              <span className="text-[11px] font-medium text-muted-foreground">
                Export in standard ATS-friendly PDF format.
              </span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => onConfirm(selectedId)}
                >
                  Apply layout
                </Button>
              </div>
            </>
          ) : step === 1 ? (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setStep(2)}
                className="gap-2 text-xs font-semibold px-4"
              >
                <span>Choose content source</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isProcessing}
                onClick={() => setStep(1)}
                className="gap-1.5 text-xs font-medium"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to layouts</span>
              </Button>

              <div className="flex items-center gap-2">
                {creationMethod === 'blank' ? (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={isProcessing}
                    onClick={handleCreateBlank}
                    className="gap-2 text-xs font-semibold px-4"
                  >
                    <FilePlus className="size-3.5" />
                    <span>Create blank resume</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={isProcessing || !file}
                    onClick={handleStartImport}
                    className="gap-2 text-xs font-semibold px-4"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Processing ({processPercent}%)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3.5" />
                        <span>Import resume</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
