import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  CheckCircle2,
  LayoutTemplate,
  Sparkles,
  UploadCloud,
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
import { parseResumeWithGemini } from '../lib/ai/geminiParser';
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(normalizeLayoutId(currentLayoutId));
      setStep(1);
      setCreationMethod('blank');
      setFile(null);
      setCustomTitle('');
      setIsProcessing(false);
      setProcessPercent(0);
      setStatusText('');
      setErrorText(null);
      setIsDragging(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
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
    setStatusText('1/3: Extracting text from PDF document...');

    try {
      // 1. PDF Text extraction
      const { text: pdfText } = await extractTextFromPdf(file);
      setProcessPercent(55);

      // 2. Parse text with Gemini model
      setStatusText('2/3: Analyzing and structuring resume with Gemini AI...');
      const parsedData = await parseResumeWithGemini(pdfText, {
        onStatusUpdate: (msg) => {
          setStatusText(`2/3: ${msg}`);
          setProcessPercent((prev) => Math.min(prev + 10, 85));
        },
      });

      // 3. Populate into Cevee ResumeDocument
      setProcessPercent(92);
      setStatusText('3/3: Populating resume layout template...');
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
      setErrorText(
        err instanceof Error
          ? err.message
          : 'Unable to process resume. Check that the PDF file is valid and your API key is active.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedLayout = getLayoutById(selectedId);
  const stepPercent = step === 1 ? 50 : 100;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleModalClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden no-print">
        {/* Progress Bar (Create mode only) */}
        {mode === 'create' && (
          <Progress
            value={stepPercent}
            aria-label="Resume creation progress"
            className="w-full h-2 rounded-none bg-muted/60"
          />
        )}

        {/* Modal Header */}
        <DialogHeader className="p-5 sm:p-6 border-b border-border space-y-0 text-left bg-card">
          {mode === 'create' ? (
            <>
              {/* Stepper Tracker Bar */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Step 1 Pill */}
                  <button
                    type="button"
                    onClick={() => !isProcessing && setStep(1)}
                    disabled={isProcessing}
                    className={cn(
                      'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
                      step === 1
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer',
                    )}
                  >
                    {step > 1 ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : (
                      <span className="size-3.5 rounded-full bg-primary-foreground/20 text-primary-foreground flex items-center justify-center text-[9px] font-bold">
                        1
                      </span>
                    )}
                    <span>Choose layout</span>
                  </button>

                  <div
                    className={cn(
                      'h-0.5 w-3 sm:w-5 rounded-full transition-colors',
                      step === 2 ? 'bg-primary' : 'bg-border',
                    )}
                  />

                  {/* Step 2 Pill */}
                  <div
                    className={cn(
                      'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
                      step === 2
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'bg-muted/70 text-muted-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'size-3.5 rounded-full flex items-center justify-center text-[9px] font-bold',
                        step === 2
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-foreground/10 text-foreground',
                      )}
                    >
                      2
                    </span>
                    <span>Content source</span>
                  </div>
                </div>

                {/* Progress Metric */}
                <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground tabular-nums shrink-0">
                  <span className="text-primary font-bold">{stepPercent}%</span>
                  <span className="hidden sm:inline">completed</span>
                </div>
              </div>

              {/* Step Header Content */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-accent text-accent-foreground rounded-xl border border-border flex-shrink-0 mt-0.5">
                  {step === 1 ? (
                    <LayoutTemplate className="size-5 text-primary" />
                  ) : (
                    <FileText className="size-5 text-primary" />
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
            </>
          ) : (
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-accent text-accent-foreground rounded-xl border border-border flex-shrink-0 mt-0.5">
                <LayoutTemplate className="size-5 text-primary" />
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
            <div className="space-y-5">
              {/* Selected Layout Indicator Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border bg-card shadow-xs gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 sm:w-24 aspect-[210/297] rounded-lg border border-border/80 overflow-hidden bg-white shadow-2xs flex-shrink-0">
                    <ResumeMiniPreview
                      layoutId={selectedId}
                      className="w-full h-full border-0 rounded-none shadow-none pointer-events-none"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-foreground truncate">
                        {selectedLayout.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 h-5 font-medium"
                      >
                        {selectedLayout.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedLayout.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-foreground font-medium pt-0.5">
                      {selectedLayout.features.slice(0, 2).map((feat, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-muted-foreground">
                          <CheckCircle2 className="size-3 text-primary shrink-0" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {!isProcessing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold gap-1.5 shrink-0 self-end sm:self-center h-9 px-3"
                  >
                    <Pencil className="size-3.5" />
                    <span>Change layout</span>
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

              {/* Upload Dropzone (Only shown when Import option is selected) */}
              {creationMethod === 'import' && (
                <div className="space-y-3 pt-1">
                  {!file ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5',
                        isDragging
                          ? 'border-primary bg-primary/5 scale-[0.99]'
                          : 'border-border hover:border-primary/50 hover:bg-muted/40',
                      )}
                    >
                      <div className="p-2.5 bg-muted rounded-full text-muted-foreground">
                        <UploadCloud className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          Drag and drop your PDF resume here, or click to browse
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          PDF format up to 15 MB. Content will be scanned directly into the template.
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        className="hidden"
                      />
                    </div>
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
                      {!isProcessing && (
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
                      )}
                    </div>
                  )}

                  {/* Processing Multi-stage Progress Bar */}
                  {isProcessing && (
                    <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-primary">
                        <div className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          <span>{statusText || 'Processing resume...'}</span>
                        </div>
                        <span className="tabular-nums font-bold">{processPercent}%</span>
                      </div>

                      {/* Bar Visual Progress */}
                      <Progress
                        value={processPercent}
                        aria-label="Document extraction progress"
                        className="w-full h-2 bg-primary/15"
                      />

                      <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-muted-foreground">
                        <div
                          className={cn(
                            'flex items-center gap-1',
                            processPercent >= 20 ? 'text-primary font-medium' : '',
                          )}
                        >
                          <CheckCircle2 className="size-3" />
                          <span>1. Extract PDF</span>
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-1',
                            processPercent >= 55 ? 'text-primary font-medium' : '',
                          )}
                        >
                          <CheckCircle2 className="size-3" />
                          <span>2. AI Analysis</span>
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-1',
                            processPercent >= 92 ? 'text-primary font-medium' : '',
                          )}
                        >
                          <CheckCircle2 className="size-3" />
                          <span>3. Template</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message Alert */}
                  {errorText && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs leading-relaxed">
                      <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">Unable to process resume</p>
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
