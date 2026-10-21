import React, { useState } from 'react';
import { ResumeDocument } from '../types/resume';
import {
  Plus,
  Copy,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  ChevronDown,
  Edit2,
  Check,
  ArrowLeft,
  Cloud,
  Loader2,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { logoIcon } from '@/assets/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  resumes: ResumeDocument[];
  currentResumeId: string;
  onSelectResume: (id: string) => void;
  onCreateResume: () => void;
  onDuplicateResume: (id: string) => void;
  onDeleteResume: (id: string) => void;
  onRenameResume: (id: string, newTitle: string) => void;
  onOpenPreview: () => void;
  onDownloadPdf: () => void;
  onBackToDashboard?: () => void;
  syncStatus?: 'saved' | 'saving' | 'error';
  isCloudUser?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  resumes,
  currentResumeId,
  onSelectResume,
  onCreateResume,
  onDuplicateResume,
  onDeleteResume,
  onRenameResume,
  onOpenPreview,
  onDownloadPdf,
  onBackToDashboard,
  syncStatus = 'saved',
  isCloudUser = false,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const currentResume = resumes.find((r) => r.id === currentResumeId) || resumes[0];
  const [editTitle, setEditTitle] = useState(currentResume?.title || '');

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameResume(currentResume.id, editTitle.trim());
      setIsRenaming(false);
    }
  };

  const syncTitle =
    syncStatus === 'saving'
      ? isCloudUser
        ? 'Saving to cloud'
        : 'Saving'
      : syncStatus === 'error'
      ? 'Cloud save failed. Changes are saved on this device.'
      : isCloudUser
      ? 'Saved to cloud'
      : 'Saved locally';

  return (
    <>
      <header className="app-navbar sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-xs no-print">
        <div className="w-full max-w-[210mm] mx-auto px-2.5 sm:px-6 min-[901px]:px-0 flex items-center justify-between gap-2 sm:gap-3 py-2 lg:h-14 lg:py-0">
          {/* Left: Back button (aligned to canvas left edge) */}
          <div className="flex items-center min-w-0 flex-1">
            {onBackToDashboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="gap-2 px-2.5 h-8 text-muted-foreground hover:text-foreground flex-shrink-0"
                title="Back to dashboard"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="size-4" />
                <img src={logoIcon} alt="Cevee" className="size-5 object-contain" />
                <span className="hidden md:inline font-semibold text-xs text-foreground">Cevee</span>
              </Button>
            )}
          </div>

          {/* Center: sync indicator + file selector */}
          <div className="flex items-center gap-2 justify-center min-w-0">
            {/* Sync status indicator */}
            <div
              className="flex flex-shrink-0 items-center justify-center"
              title={syncTitle}
              role="status"
              aria-live="polite"
            >
              {syncStatus === 'saving' ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : syncStatus === 'error' ? (
                <span className="size-2 rounded-full bg-amber-500" />
              ) : isCloudUser ? (
                <Cloud className="size-4 text-primary" />
              ) : (
                <CheckCircle2 className="size-4 text-primary" />
              )}
              <span className="sr-only">{syncTitle}</span>
            </div>

            {/* Multi-CV Switcher */}
            <div className="relative min-w-0">
              {isRenaming ? (
                <form onSubmit={handleRenameSubmit} className="flex items-center gap-1.5">
                  <Input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleRenameSubmit}
                    autoFocus
                    aria-label="Resume title"
                    className="h-8 w-36 text-xs font-medium sm:w-48"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-primary"
                    title="Save"
                    aria-label="Save title"
                  >
                    <Check className="size-4" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-1 min-w-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 gap-1.5 px-2.5 text-xs font-medium min-w-0"
                      >
                        <span className="truncate max-w-[110px] sm:max-w-[220px]">
                          {currentResume?.title}
                        </span>
                        <ChevronDown className="size-3.5 text-muted-foreground flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-64 max-w-[calc(100vw-1.5rem)]">
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        Your resumes ({resumes.length})
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-56 overflow-y-auto space-y-0.5">
                        {resumes.map((r) => (
                          <DropdownMenuItem
                            key={r.id}
                            onClick={() => onSelectResume(r.id)}
                            className="flex items-center justify-between text-xs cursor-pointer"
                          >
                            <span className="truncate">{r.title}</span>
                            {r.id === currentResumeId && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/30 text-primary">
                                Active
                              </Badge>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onCreateResume}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Plus className="size-4 text-muted-foreground" />
                        <span>Create new resume</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDuplicateResume(currentResume.id)}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Copy className="size-4 text-muted-foreground" />
                        <span>Duplicate resume</span>
                      </DropdownMenuItem>
                      {resumes.length > 1 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setIsConfirmingDelete(true)}
                            className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                            <span>Delete resume</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditTitle(currentResume.title);
                      setIsRenaming(true);
                    }}
                    className="size-8 text-muted-foreground hover:text-foreground flex-shrink-0"
                    title="Rename resume"
                    aria-label="Rename resume"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview + Download (desktop) */}
          <div className="hidden sm:flex items-center justify-end gap-2 min-w-0 flex-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenPreview}
              className="gap-1.5 h-8 text-xs font-medium flex-shrink-0"
              title="Preview resume"
              aria-label="Preview resume"
            >
              <Eye className="size-3.5" />
              <span>Preview</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onDownloadPdf}
              className="gap-1.5 h-8 text-xs font-medium flex-shrink-0"
              title="Download PDF"
              aria-label="Download PDF"
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmDialog
          isOpen={isConfirmingDelete}
          title={`Delete "${currentResume.title}"?`}
          description="This action cannot be undone. All customized sections, contact details, and formatted content in this resume will be permanently deleted."
          confirmLabel="Delete Resume"
          cancelLabel="Keep Resume"
          isDestructive={true}
          onConfirm={() => {
            onDeleteResume(currentResume.id);
            setIsConfirmingDelete(false);
          }}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      </header>

      {/* Mobile Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 no-print bg-background/95 backdrop-blur-md border-t border-border shadow-lg px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={onOpenPreview}
          className="size-10 flex-shrink-0"
          title="Preview resume"
          aria-label="Preview resume"
        >
          <Eye className="size-4" />
        </Button>

        <Button
          variant="default"
          onClick={onDownloadPdf}
          className="h-10 flex-1 gap-2 text-sm font-semibold"
          title="Download PDF"
        >
          <Download className="size-4" />
          <span>Download PDF</span>
        </Button>
      </div>
    </>
  );
};
