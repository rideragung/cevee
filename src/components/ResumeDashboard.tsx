import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Check,
  Clock,
  Copy,
  Download,
  Edit2,
  Eye,
  FileText,
  LayoutGrid,
  LayoutTemplate,
  List,
  LogOut,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { ResumeDocument } from '../types/resume';
import { ConfirmDialog } from './ConfirmDialog';
import { ResumeContentThumbnail } from './ResumeContentThumbnail';
import { getLayoutById } from '../data/layouts';
import { formatRelativeTime } from '../utils/relativeTime';

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

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50';

const iconButtonClass = `inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:h-9 sm:w-9 ${focusRing}`;

const quietButtonClass = `inline-flex h-11 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:h-8 sm:px-2.5 ${focusRing}`;

const menuItemClass = `flex w-full items-center gap-2 px-3 py-3.5 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-100 sm:py-2`;

const menuItemDangerClass = `flex w-full items-center gap-2 px-3 py-3.5 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:bg-red-50 sm:py-2`;

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
}) => {
  const [deletingResume, setDeletingResume] = useState<ResumeDocument | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>(() =>
    readStoredValue(SORT_STORAGE_KEY, SORT_KEYS, 'updated'),
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    readStoredValue(VIEW_STORAGE_KEY, VIEW_MODES, 'grid'),
  );
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
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

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return 'Recently';
    }
  };

  const closeMenusOnEscape = (event: React.KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    setIsUserMenuOpen(false);
    setIsSortMenuOpen(false);
    setOpenMenuId(null);
  };

  const startRename = (resume: ResumeDocument) => {
    setOpenMenuId(null);
    setRenameDraft(resume.title);
    setRenamingResumeId(resume.id);
  };

  const cancelRename = () => {
    isRenameSubmittingRef.current = true;
    setRenamingResumeId(null);
    window.setTimeout(() => {
      isRenameSubmittingRef.current = false;
    }, 100);
  };

  const submitRename = (resume: ResumeDocument, event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (isRenameSubmittingRef.current) return;
    isRenameSubmittingRef.current = true;

    const trimmed = renameDraft.trim();
    if (trimmed && trimmed !== resume.title) {
      onRenameResume(resume.id, trimmed);
    }
    setRenamingResumeId(null);
    window.setTimeout(() => {
      isRenameSubmittingRef.current = false;
    }, 100);
  };

  const renderRenameField = (resume: ResumeDocument) => (
    <form
      onSubmit={(event) => submitRename(resume, event)}
      className="flex items-center gap-1.5"
    >
      <input
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
        className="h-11 w-full min-w-0 rounded-md border border-emerald-500 bg-white px-2 text-sm font-bold tracking-tight text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600/15 sm:h-8"
      />
      <button
        type="submit"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 sm:h-8 sm:w-8 ${focusRing}`}
        title="Save title"
        aria-label="Save resume title"
      >
        <Check size={15} />
      </button>
    </form>
  );

  const renderMoreMenu = (resume: ResumeDocument) => {
    const isOpen = openMenuId === resume.id;

    return (
      <div className="relative" onKeyDown={closeMenusOnEscape}>
        <button
          type="button"
          onClick={() => setOpenMenuId(isOpen ? null : resume.id)}
          className={iconButtonClass}
          title="More actions"
          aria-label={`More actions for ${resume.title}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <MoreVertical size={15} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpenMenuId(null)}
            />
            <div
              role="menu"
              aria-label={`Actions for ${resume.title}`}
              className="absolute bottom-full right-0 z-50 mb-1.5 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => startRename(resume)}
                className={menuItemClass}
              >
                <Edit2 size={14} className="text-slate-400" />
                <span>Rename</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenuId(null);
                  onDuplicateResume(resume.id);
                }}
                className={menuItemClass}
              >
                <Copy size={14} className="text-slate-400" />
                <span>Duplicate</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenuId(null);
                  onDownloadResume(resume.id);
                }}
                className={menuItemClass}
              >
                <Download size={14} className="text-slate-400" />
                <span>Download PDF</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenuId(null);
                  setDeletingResume(resume);
                }}
                className={menuItemDangerClass}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-2">
              <span className="bg-emerald-600 text-white p-1.5 rounded-lg">
                <FileText size={18} />
              </span>
              Cevee
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onSignOut && (
              <div className="relative" onKeyDown={closeMenusOnEscape}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className={`h-11 w-11 sm:h-9 sm:w-9 rounded-full overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-center bg-emerald-600 text-white ${focusRing}`}
                  title="Account"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : initials ? (
                    <span className="text-xs font-bold leading-none">{initials}</span>
                  ) : (
                    <UserIcon size={16} />
                  )}
                </button>

                {isUserMenuOpen && (
                  <>
                    {/* Backdrop to dismiss on outside click */}
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setIsUserMenuOpen(false)}
                    />

                    <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                      {userEmail && (
                        <>
                          <div
                            className="px-3 py-2 text-[11px] text-slate-500 truncate"
                            title={userEmail}
                          >
                            {userEmail}
                          </div>
                          <div className="border-t border-slate-100" />
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (isGuest) {
                            setIsConfirmingSignOut(true);
                          } else {
                            onSignOut();
                          }
                        }}
                        className={`w-full text-left px-3 py-3.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors sm:py-2 ${focusRing}`}
                      >
                        <LogOut size={14} />
                        <span>{isGuest ? 'Exit guest mode' : 'Log out'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24 sm:py-10 flex-1 w-full">
        {/* Title Section */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Your resumes{' '}
              <span className="font-medium text-slate-400" aria-live="polite">
                (
                {normalizedQuery
                  ? `${visibleResumes.length} of ${resumes.length}`
                  : resumes.length}
                )
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage, edit, and export your ATS-compliant resumes.
            </p>
          </div>

          {resumes.length > 0 && (
            <button
              type="button"
              onClick={onCreateResume}
              className={`hidden sm:inline-flex h-9 items-center gap-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex-shrink-0 whitespace-nowrap motion-safe:enabled:active:scale-[0.96] ${focusRing}`}
            >
              <Plus size={15} />
              <span>Create resume</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {resumes.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900">No resumes created yet</h2>
            <p className="text-xs text-slate-500 mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
              You haven't created any resumes yet. Start building your first ATS-friendly resume to
              edit and download.
            </p>
            <button
              type="button"
              onClick={onCreateResume}
              className={`inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors motion-safe:enabled:active:scale-[0.96] ${focusRing}`}
            >
              <Plus size={15} />
              <span>Start building resume</span>
            </button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by title or name"
                  aria-label="Search resumes by title or candidate name"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-500 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15 sm:h-9"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    title="Clear search"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 transition-colors hover:text-slate-700 sm:p-1 ${focusRing}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                {/* Sort menu */}
                <div className="relative" onKeyDown={closeMenusOnEscape}>
                  <button
                    type="button"
                    onClick={() => setIsSortMenuOpen((open) => !open)}
                    className={`inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 sm:h-9 ${focusRing}`}
                    aria-haspopup="menu"
                    aria-expanded={isSortMenuOpen}
                    aria-label={`Sort resumes, currently ${currentSortLabel.toLowerCase()}`}
                    title="Sort resumes"
                  >
                    <ArrowUpDown size={14} className="text-slate-400" />
                    <span>{currentSortLabel}</span>
                  </button>

                  {isSortMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsSortMenuOpen(false)}
                      />
                      <div
                        role="menu"
                        aria-label="Sort resumes"
                        className="absolute right-0 z-50 mt-1.5 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            role="menuitemradio"
                            aria-checked={sortBy === option.key}
                            onClick={() => {
                              setSortBy(option.key);
                              setIsSortMenuOpen(false);
                            }}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-100"
                          >
                            <span>{option.label}</span>
                            {sortBy === option.key && (
                              <Check size={13} className="text-emerald-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* View toggle */}
                <div
                  role="group"
                  aria-label="View mode"
                  className="inline-flex h-12 items-center rounded-lg border border-slate-200 bg-white p-0.5 sm:h-9"
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-pressed={viewMode === 'grid'}
                    aria-label="Grid view"
                    title="Grid view"
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors sm:h-8 sm:w-8 ${focusRing} ${
                      viewMode === 'grid'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                    aria-label="List view"
                    title="List view"
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors sm:h-8 sm:w-8 ${focusRing} ${
                      viewMode === 'list'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {visibleResumes.length === 0 ? (
              /* Search empty state */
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Search size={18} />
                </div>
                <p className="text-sm font-semibold text-slate-900 break-words">
                  No resumes match “{searchQuery.trim()}”
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Search checks resume titles and candidate names.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`mt-4 rounded-md text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800 ${focusRing}`}
                >
                  Clear search
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Resumes Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Create resume ghost card */}
                <button
                  type="button"
                  onClick={onCreateResume}
                  className={`group flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center transition-colors hover:border-emerald-600/50 hover:bg-white ${focusRing}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <Plus size={18} />
                  </span>
                  <span className="text-sm font-semibold text-slate-900">Create resume</span>
                </button>

                {visibleResumes.map((resume) => {
                  const fullName = resume.content.header.fullName || 'Untitled Candidate';

                  return (
                    <article
                      key={resume.id}
                      className="group relative flex flex-col rounded-xl border border-slate-200 bg-white transition-[border-color,box-shadow] duration-150 ease-out hover:border-slate-300 hover:shadow-sm"
                    >
                      {/* Thumbnail */}
                      <div className="rounded-t-[11px] border-b border-slate-100 bg-slate-50/80 p-4">
                        <ResumeContentThumbnail resume={resume} />
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="min-w-0">
                          {renamingResumeId === resume.id ? (
                            renderRenameField(resume)
                          ) : (
                            <h2 className="text-sm font-bold tracking-tight text-slate-900">
                              <button
                                type="button"
                                onClick={() => onSelectResume(resume.id)}
                                title={`Open ${resume.title}`}
                                className={`-my-3 block max-w-full truncate rounded-sm py-3 text-left transition-colors group-hover:text-emerald-700 after:absolute after:inset-0 ${focusRing}`}
                              >
                                {resume.title}
                              </button>
                            </h2>
                          )}
                          <p className="mt-0.5 truncate text-xs text-slate-500">{fullName}</p>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                            <LayoutTemplate size={11} className="text-slate-400" />
                            {getLayoutById(resume.layoutId).name}
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] text-slate-500"
                            title={`Updated ${formatDate(resume.updatedAt)}`}
                          >
                            <Clock size={11} className="text-slate-400" />
                            Updated {formatRelativeTime(resume.updatedAt)}
                          </span>
                        </div>

                        <div className="relative z-10 flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onSelectResume(resume.id)}
                            className={`inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-slate-800 motion-safe:enabled:active:scale-[0.96] sm:h-9 ${focusRing}`}
                          >
                            <Pencil size={13} />
                            <span>Edit resume</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onPreviewResume(resume.id)}
                            className={iconButtonClass}
                            title="Preview resume"
                            aria-label={`Preview ${resume.title}`}
                          >
                            <Eye size={15} />
                          </button>
                          {renderMoreMenu(resume)}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Resumes List */
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="hidden border-b border-slate-100 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-[minmax(0,1fr)_8.5rem_9rem_8.5rem] sm:items-center sm:gap-4">
                  <span>Resume</span>
                  <span>Layout</span>
                  <span>Updated</span>
                  <span className="text-right">Actions</span>
                </div>
                <ul className="divide-y divide-slate-100 [&>li:last-child]:rounded-b-[11px]">
                  {visibleResumes.map((resume) => {
                    const fullName = resume.content.header.fullName || 'Untitled Candidate';

                    return (
                      <li
                        key={resume.id}
                        className="group relative transition-colors hover:bg-slate-50/70"
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
                                <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                                  <button
                                    type="button"
                                    onClick={() => onSelectResume(resume.id)}
                                    title={`Open ${resume.title}`}
                                    className={`-my-3 block max-w-full truncate rounded-sm py-3 text-left transition-colors group-hover:text-emerald-700 after:absolute after:inset-0 ${focusRing}`}
                                  >
                                    {resume.title}
                                  </button>
                                </h2>
                              )}
                              <p className="mt-0.5 truncate text-xs text-slate-500">{fullName}</p>
                              <p className="mt-0.5 text-[11px] text-slate-500 sm:hidden">
                                {getLayoutById(resume.layoutId).name} · Updated{' '}
                                {formatRelativeTime(resume.updatedAt)}
                              </p>
                            </div>
                          </div>

                          <span className="hidden truncate text-xs text-slate-500 sm:block">
                            {getLayoutById(resume.layoutId).name}
                          </span>
                          <span
                            className="hidden text-xs text-slate-500 sm:block"
                            title={`Updated ${formatDate(resume.updatedAt)}`}
                          >
                            Updated {formatRelativeTime(resume.updatedAt)}
                          </span>

                          <div className="relative z-10 flex shrink-0 items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectResume(resume.id)}
                              className={quietButtonClass}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onPreviewResume(resume.id)}
                              className={iconButtonClass}
                              title="Preview resume"
                              aria-label={`Preview ${resume.title}`}
                            >
                              <Eye size={15} />
                            </button>
                            {renderMoreMenu(resume)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </main>

      {/* Confirmation Modal for Resume Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingResume)}
        title={`Delete "${deletingResume?.title}"?`}
        description="This action cannot be undone. All customized sections, contact details, and formatted content in this resume will be permanently deleted."
        confirmLabel="Delete Resume"
        cancelLabel="Keep Resume"
        isDestructive={true}
        onConfirm={() => {
          if (deletingResume) {
            onDeleteResume(deletingResume.id);
            setDeletingResume(null);
          }
        }}
        onCancel={() => setDeletingResume(null)}
      />

      {/* Confirmation Modal for Exiting Guest Mode (deletes local-only resumes) */}
      <ConfirmDialog
        isOpen={isConfirmingSignOut}
        title="Exit guest mode?"
        description="Your resumes are stored only in this browser while using guest mode. Exiting deletes them permanently and returns you to the sign-in screen."
        confirmLabel="Exit and delete"
        cancelLabel="Stay"
        isDestructive={true}
        onConfirm={() => {
          setIsConfirmingSignOut(false);
          onSignOut?.();
        }}
        onCancel={() => setIsConfirmingSignOut(false)}
      />

      {/* Mobile Bottom Action Bar: Create Resume (fixed white overlay) */}
      {resumes.length > 0 && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-6px_16px_-6px_rgba(15,23,42,0.15)] px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onCreateResume}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors motion-safe:enabled:active:scale-[0.96] ${focusRing}`}
          >
            <Plus size={16} />
            <span>Create resume</span>
          </button>
        </div>
      )}
    </div>
  );
};
