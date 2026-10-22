import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Clock,
  Cloud,
  Copy,
  Download,
  Edit2,
  Eye,
  LayoutGrid,
  LayoutTemplate,
  List,
  Loader2,
  LogOut,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { ResumeDocument } from '../types/resume';
import { ConfirmDialog } from './ConfirmDialog';
import { ResumeContentThumbnail } from './ResumeContentThumbnail';
import { getLayoutById } from '../data/layouts';
import { formatRelativeTime } from '../utils/relativeTime';
import { ResumeEmptyState } from './ResumeEmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { logoIcon } from '@/assets/logo';

interface ResumeDashboardProps {
  resumes: ResumeDocument[];
  onSelectResume: (id: string) => void;
  onCreateResume: () => void;
  onDuplicateResume: (id: string) => void;
  onDeleteResume: (id: string) => void;
  onRenameResume: (id: string, newTitle: string) => void;
  onPreviewResume: (id: string) => void;
  onDownloadResume: (id: string) => void;
  userEmail?: string | null;
  userName?: string | null;
  userAvatarUrl?: string | null;
  onSignOut?: () => void;
  onSignIn?: () => void;
  isLoading?: boolean;
  syncStatus?: 'saved' | 'saving' | 'error';
}

type ViewMode = 'grid' | 'list';
type SortKey = 'updated' | 'created' | 'name';

const VIEW_STORAGE_KEY = 'cevee.dashboard.view';
const SORT_STORAGE_KEY = 'cevee.dashboard.sort';

const VIEW_MODES: readonly ViewMode[] = ['grid', 'list'];
const SORT_KEYS: readonly SortKey[] = ['updated', 'created', 'name'];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'updated', label: 'Last updated' },
  { key: 'created', label: 'Date created' },
  { key: 'name', label: 'Name (A–Z)' },
];

const readStoredValue = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredValue = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
};

function UKFlag({ className = 'size-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('overflow-hidden rounded-full shrink-0 border border-black/10 shadow-2xs', className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" fill="#012169" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#FFFFFF" strokeWidth="5.5" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#C8102E" strokeWidth="3.2" />
      <path d="M16 0 V32 M0 16 H32" stroke="#FFFFFF" strokeWidth="9" />
      <path d="M16 0 V32 M0 16 H32" stroke="#C8102E" strokeWidth="5.5" />
    </svg>
  );
}

function IndonesiaFlag({ className = 'size-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('overflow-hidden rounded-full shrink-0 border border-black/10 shadow-2xs', className)}
      aria-hidden="true"
    >
      <rect width="32" height="16" fill="#E70011" />
      <rect y="16" width="32" height="16" fill="#FFFFFF" />
    </svg>
  );
}

export const ResumeDashboard: React.FC<ResumeDashboardProps> = ({
  resumes,
  onSelectResume,
  onCreateResume,
  onDuplicateResume,
  onDeleteResume,
  onRenameResume,
  onPreviewResume,
  onDownloadResume,
  userEmail,
  userName,
  userAvatarUrl,
  onSignOut,
  onSignIn,
  isLoading = false,
  syncStatus = 'saved',
}) => {
  const [deletingResume, setDeletingResume] = useState<ResumeDocument | null>(null);
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>(() =>
    readStoredValue(SORT_STORAGE_KEY, SORT_KEYS, 'updated'),
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    readStoredValue(VIEW_STORAGE_KEY, VIEW_MODES, 'grid'),
  );
  const [renamingResumeId, setRenamingResumeId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const isRenameSubmittingRef = useRef(false);

  useEffect(() => {
    writeStoredValue(VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    writeStoredValue(SORT_STORAGE_KEY, sortBy);
  }, [sortBy]);

  const isGuest = !userEmail;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleResumes = useMemo(() => {
    const filtered = normalizedQuery
      ? resumes.filter((resume) => {
          const haystack = `${resume.title} ${resume.content.header.fullName || ''}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : resumes;

    const toTime = (value?: string) => {
      const time = value ? new Date(value).getTime() : NaN;
      return Number.isNaN(time) ? 0 : time;
    };

    const sorted = [...filtered];
    switch (sortBy) {
      case 'created':
        sorted.sort(
          (a, b) => toTime(b.createdAt || b.updatedAt) - toTime(a.createdAt || a.updatedAt),
        );
        break;
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        sorted.sort((a, b) => toTime(b.updatedAt) - toTime(a.updatedAt));
    }
    return sorted;
  }, [resumes, normalizedQuery, sortBy]);

  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.key === sortBy)?.label ?? 'Last updated';

  const getInitials = (name?: string | null) => {
    const source = (name || userEmail || '').trim();
    if (!source) return '';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(userName);
  const displayName = userName || (isGuest ? 'Guest' : userEmail?.split('@')[0] || 'User');
  const displayEmail = userEmail || (isGuest ? 'guest@cevee.app' : '');

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const startRename = (resume: ResumeDocument) => {
    setRenameDraft(resume.title);
    setRenamingResumeId(resume.id);
  };

  const cancelRename = () => {
    setRenamingResumeId(null);
    setRenameDraft('');
  };

  const submitRename = (resume: ResumeDocument) => {
    if (isRenameSubmittingRef.current) return;
    isRenameSubmittingRef.current = true;

    const nextTitle = renameDraft.trim();
    if (nextTitle && nextTitle !== resume.title) {
      onRenameResume(resume.id, nextTitle);
    }
    setRenamingResumeId(null);
    setRenameDraft('');

    setTimeout(() => {
      isRenameSubmittingRef.current = false;
    }, 100);
  };

  const renderRenameField = (resume: ResumeDocument) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitRename(resume);
      }}
      className="relative z-20 flex items-center gap-1.5"
    >
      <Input
        type="text"
        value={renameDraft}
        onChange={(event) => setRenameDraft(event.target.value)}
        onBlur={() => submitRename(resume)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            cancelRename();
          }
        }}
        autoFocus
        aria-label={`Rename ${resume.title}`}
        className="h-8 text-sm font-semibold"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="size-8 text-primary shrink-0"
        title="Save title"
        aria-label="Save resume title"
      >
        <Check className="size-4" />
      </Button>
    </form>
  );

  const renderMoreMenu = (resume: ResumeDocument) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="relative size-9 sm:size-8 shrink-0 text-muted-foreground after:absolute after:-inset-1.5 after:content-[''] hover:text-foreground"
          title="More actions"
          aria-label={`More actions for ${resume.title}`}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => startRename(resume)}
          className="gap-2 text-xs cursor-pointer"
        >
          <Edit2 className="size-3.5 text-muted-foreground" />
          <span>Rename</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDuplicateResume(resume.id)}
          className="gap-2 text-xs cursor-pointer"
        >
          <Copy className="size-3.5 text-muted-foreground" />
          <span>Duplicate</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDownloadResume(resume.id)}
          className="gap-2 text-xs cursor-pointer"
        >
          <Download className="size-3.5 text-muted-foreground" />
          <span>Download PDF</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setDeletingResume(resume)}
          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
      {/* Floating Top Header */}
      <header className="sticky top-0 z-30 pt-3 sm:pt-4 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-6xl mx-auto h-16 px-3.5 sm:px-6 flex items-center justify-between rounded-full border border-border/80 bg-background/90 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08),0_2px_8px_-2px_rgba(15,23,42,0.04)] pointer-events-auto transition-all">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-2.5">
              <img
                src={logoIcon}
                alt="Cevee"
                className="size-8 sm:size-9 object-contain drop-shadow-xs"
              />
              <span className="tracking-tight">Cevee</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isGuest && onSignIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSignIn}
                className="gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors h-9 px-3.5 rounded-full"
                title="Save resumes to cloud"
              >
                <Cloud className="size-3.5" />
                <span className="hidden sm:inline">Save to cloud</span>
              </Button>
            )}

            {onSignOut && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-11 py-1 pl-1 pr-1 sm:pr-3 rounded-full gap-2.5 hover:bg-muted/70 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    title="Account"
                    aria-label="Account menu"
                  >
                    <Avatar className="size-9 ring-1 ring-border/80 shadow-2xs shrink-0">
                      {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={displayName} className="object-cover" />}
                      <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                        {initials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col text-left leading-tight min-w-0 max-w-[130px] md:max-w-[170px]">
                      <span className="text-xs font-bold text-foreground truncate">
                        {displayName}
                      </span>
                      {displayEmail && (
                        <span className="text-[11px] text-muted-foreground truncate">
                          {displayEmail}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="size-3.5 text-muted-foreground shrink-0 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-[19rem] sm:w-[20rem] rounded-[1.75rem] border border-border/80 bg-card p-5 text-card-foreground shadow-[0_12px_40px_-8px_rgba(15,23,42,0.12),0_4px_16px_-2px_rgba(15,23,42,0.06)]"
                >
                  {/* Profile Header */}
                  <div className="flex items-center gap-3.5">
                    <Avatar className="size-14 rounded-full ring-2 ring-border/80 shrink-0 shadow-xs">
                      {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={displayName} className="object-cover" />}
                      <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                        {initials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="text-base font-bold text-foreground truncate leading-tight" title={displayName}>
                        {displayName}
                      </span>
                      <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF] shadow-2xs">
                        <User className="size-3 text-[#7E22CE] shrink-0" />
                        <span>Beta Tester</span>
                      </div>
                      {displayEmail && (
                        <span className="text-xs text-muted-foreground truncate leading-tight mt-0.5" title={displayEmail}>
                          {displayEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator className="-mx-5 my-4 bg-border/60" />

                  {/* Language Section */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-semibold text-foreground">Language</span>
                    <div className="flex items-center gap-2">
                      {/* English - Selected */}
                      <div
                        className="flex size-10 items-center justify-center rounded-xl border border-border bg-secondary/80 p-1.5 shadow-2xs ring-1 ring-border/50 cursor-default"
                        title="English (Selected)"
                        role="status"
                        aria-label="English selected"
                      >
                        <UKFlag className="size-6 rounded-full" />
                      </div>

                      {/* Indonesia - Inactive */}
                      <div
                        className="flex size-10 items-center justify-center rounded-xl p-1.5 opacity-35 cursor-not-allowed"
                        title="Indonesian (Coming soon)"
                        aria-disabled="true"
                        aria-label="Indonesian (Coming soon)"
                      >
                        <IndonesiaFlag className="size-6 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="-mx-5 my-4 bg-border/60" />

                  {/* Sign Out Section */}
                  <DropdownMenuItem
                    onClick={() => {
                      if (isGuest) {
                        setIsConfirmingSignOut(true);
                      } else {
                        onSignOut();
                      }
                    }}
                    className="w-full flex items-center gap-3.5 p-2 rounded-2xl text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <div className="size-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                      <LogOut className="size-5" />
                    </div>
                    <span className="text-sm font-semibold">
                      {isGuest ? 'Exit guest mode' : 'Log out'}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-24 sm:py-12 flex-1 w-full">
        {/* Title Section */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Your resumes
              {!isLoading && (
                <span className="ml-2 text-lg font-normal text-muted-foreground" aria-live="polite">
                  {normalizedQuery
                    ? `(${visibleResumes.length} of ${resumes.length})`
                    : `(${resumes.length})`}
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Open one to edit, or export a PDF.
            </p>
          </div>

          {!isLoading && onCreateResume && (
            <Button
              variant="default"
              onClick={onCreateResume}
              className="relative hidden sm:inline-flex gap-2 px-5 font-semibold shrink-0 after:absolute after:-inset-2 after:content-['']"
            >
              <Plus className="size-4" />
              <span>Create resume</span>
            </Button>
          )}
        </div>

        {syncStatus === 'error' && !isLoading && (
          <div
            role="status"
            className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
          >
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>Cloud save failed. Changes are saved on this device.</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Loading resumes</span>
            </div>
          </div>
        ) : resumes.length === 0 ? (
          <ResumeEmptyState onCreateResume={onCreateResume} />
        ) : (
          <>
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:flex-1 sm:min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by title or name"
                  aria-label="Search resumes by title or candidate name"
                  autoComplete="off"
                  spellCheck={false}
                  className="pl-9 pr-9 h-11 text-sm w-full"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    title="Clear search"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Sort menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 gap-2 text-xs font-medium text-foreground after:absolute after:-inset-2 after:content-['']"
                      title="Sort resumes"
                      aria-label={`Sort resumes, currently ${currentSortLabel.toLowerCase()}`}
                    >
                      <ArrowUpDown className="size-3.5 text-muted-foreground" />
                      <span>{currentSortLabel}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.key}
                        onClick={() => setSortBy(option.key)}
                        className="flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span>{option.label}</span>
                        {sortBy === option.key && <Check className="size-3.5 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View toggle */}
                <div
                  role="group"
                  aria-label="View mode"
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    aria-pressed={viewMode === 'grid'}
                    aria-label="Grid view"
                    title="Grid view"
                    className={cn(
                      'relative size-8 rounded-[12px] transition-colors after:absolute after:-inset-y-2 after:-inset-x-0.5 after:content-[""]',
                      viewMode === 'grid'
                        ? 'bg-secondary text-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                    aria-label="List view"
                    title="List view"
                    className={cn(
                      'relative size-8 rounded-[12px] transition-colors after:absolute after:-inset-y-2 after:-inset-x-0.5 after:content-[""]',
                      viewMode === 'list'
                        ? 'bg-secondary text-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {visibleResumes.length === 0 ? (
              /* Search empty state */
              <Card className="px-6 py-16 text-center">
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Search className="size-4" />
                </div>
                <p className="text-sm font-semibold text-foreground break-words">
                  No resumes match “{searchQuery.trim()}”
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Search checks titles and candidate names.
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs"
                >
                  Clear search
                </Button>
              </Card>
            ) : viewMode === 'grid' ? (
              /* Resumes Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleResumes.map((resume) => {
                  const fullName = resume.content.header.fullName || 'Untitled Candidate';

                  return (
                    <Card
                      key={resume.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-150 ease-out [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:shadow-md"
                    >
                      {/* Thumbnail */}
                      <div className="border-b border-border bg-muted/30 p-5">
                        <ResumeContentThumbnail resume={resume} />
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <div className="min-w-0">
                          {renamingResumeId === resume.id ? (
                            renderRenameField(resume)
                          ) : (
                            <h2 className="text-sm font-bold tracking-tight text-foreground">
                              <button
                                type="button"
                                onClick={() => onSelectResume(resume.id)}
                                title={`Open ${resume.title}`}
                                className="relative block max-w-full truncate text-left transition-colors after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:underline hover:underline-offset-4"
                              >
                                {resume.title}
                              </button>
                            </h2>
                          )}
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{fullName}</p>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <Badge variant="secondary" className="gap-1.5 text-[11px] font-medium py-0.5 px-2">
                            <LayoutTemplate className="size-3 text-muted-foreground" />
                            {getLayoutById(resume.layoutId).name}
                          </Badge>
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
                            title={`Updated ${formatDate(resume.updatedAt)}`}
                          >
                            <Clock className="size-3 text-muted-foreground" />
                            Updated {formatRelativeTime(resume.updatedAt)}
                          </span>
                        </div>

                        <div className="relative z-10 flex items-center gap-2 pt-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onSelectResume(resume.id)}
                            className="h-9 flex-1 gap-1.5 text-xs font-semibold"
                          >
                            <Pencil className="size-3.5" />
                            <span>Edit resume</span>
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => onPreviewResume(resume.id)}
                            className="relative size-9 shrink-0 text-muted-foreground after:absolute after:-inset-1 after:content-[''] hover:text-foreground"
                            title="Preview resume"
                            aria-label={`Preview ${resume.title}`}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {renderMoreMenu(resume)}
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {/* Create resume ghost card */}
                <button
                  type="button"
                  onClick={onCreateResume}
                  className="group flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/60 px-6 py-10 text-center shadow-2xs transition-[border-color,background-color,box-shadow] duration-150 [@media(hover:hover)]:hover:border-primary/50 [@media(hover:hover)]:hover:bg-card [@media(hover:hover)]:hover:shadow-sm"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground transition-[background-color,color,box-shadow] duration-150 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-pillow-primary">
                    <Plus className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">Create resume</span>
                </button>
              </div>
            ) : (
              /* Resumes List */
              <Card className="rounded-2xl overflow-hidden border border-border">
                <div className="hidden border-b border-border bg-muted/30 px-4 py-2.5 text-[11px] font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_8.5rem_9rem_8.5rem] sm:items-center sm:gap-4">
                  <span>Resume</span>
                  <span>Layout</span>
                  <span>Updated</span>
                  <span className="text-right">Actions</span>
                </div>
                <ul className="divide-y divide-border">
                  {visibleResumes.map((resume) => {
                    const fullName = resume.content.header.fullName || 'Untitled Candidate';

                    return (
                      <li
                        key={resume.id}
                        className="group relative transition-colors [@media(hover:hover)]:hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-3 px-4 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_8.5rem_9rem_8.5rem] sm:gap-4">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="w-10 shrink-0 sm:w-11">
                              <ResumeContentThumbnail resume={resume} />
                            </div>
                            <div className="min-w-0">
                              {renamingResumeId === resume.id ? (
                                renderRenameField(resume)
                              ) : (
                                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                                  <button
                                    type="button"
                                    onClick={() => onSelectResume(resume.id)}
                                    title={`Open ${resume.title}`}
                                    className="relative block max-w-full truncate text-left transition-colors after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:underline hover:underline-offset-4"
                                  >
                                    {resume.title}
                                  </button>
                                </h2>
                              )}
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">{fullName}</p>
                              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground sm:hidden">
                                <span>{getLayoutById(resume.layoutId).name}</span>
                                <span>Updated {formatRelativeTime(resume.updatedAt)}</span>
                              </p>
                            </div>
                          </div>

                          <span className="hidden truncate text-xs text-muted-foreground sm:block">
                            {getLayoutById(resume.layoutId).name}
                          </span>
                          <span
                            className="hidden text-xs text-muted-foreground sm:block"
                            title={`Updated ${formatDate(resume.updatedAt)}`}
                          >
                            Updated {formatRelativeTime(resume.updatedAt)}
                          </span>

                          <div className="relative z-10 flex shrink-0 items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => onSelectResume(resume.id)}
                              className="h-8 px-2.5 text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => onPreviewResume(resume.id)}
                              className="relative size-8 text-muted-foreground after:absolute after:-inset-1 after:content-[''] hover:text-foreground"
                              title="Preview resume"
                              aria-label={`Preview ${resume.title}`}
                            >
                              <Eye className="size-3.5" />
                            </Button>
                            {renderMoreMenu(resume)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Confirmation Modal for Resume Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingResume)}
        title={`Delete "${deletingResume?.title}"?`}
        description="This action cannot be undone. All customized sections, contact details, and formatted content in this resume will be permanently deleted."
        confirmLabel="Delete resume"
        cancelLabel="Keep resume"
        isDestructive={true}
        onConfirm={() => {
          if (deletingResume) {
            onDeleteResume(deletingResume.id);
            setDeletingResume(null);
          }
        }}
        onCancel={() => setDeletingResume(null)}
      />

      {/* Confirmation Modal for Exiting Guest Mode */}
      <ConfirmDialog
        isOpen={isConfirmingSignOut}
        title="Exit guest mode?"
        description="Your resumes are stored only in this browser while using guest mode. Exiting deletes them permanently. To keep them, use 'Save to cloud' to sign in."
        confirmLabel="Exit and delete"
        cancelLabel="Stay"
        isDestructive={true}
        onConfirm={() => {
          setIsConfirmingSignOut(false);
          onSignOut?.();
        }}
        onCancel={() => setIsConfirmingSignOut(false)}
      />

      {/* Mobile Bottom Action Bar */}
      {!isLoading && resumes.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 shadow-lg backdrop-blur-md sm:hidden">
          <Button
            variant="default"
            onClick={onCreateResume}
            className="w-full h-11 gap-2 text-sm font-semibold"
          >
            <Plus className="size-4" />
            <span>Create resume</span>
          </Button>
        </div>
      )}
    </div>
  );
};



