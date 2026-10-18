import React, { useState, useEffect, useRef } from 'react';
import { initialResumes } from './data/initialData';
import {
  ResumeDocument,
  HeaderData,
  SectionType,
  ResumeLayoutId,
  SectionData,
  ResumeSection,
  CustomSectionItem,
} from './types/resume';
import { Navbar } from './components/Navbar';
import { ResumeHeader } from './components/ResumeHeader';
import { SummarySection } from './components/sections/SummarySection';
import { SkillsSection } from './components/sections/SkillsSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { EducationSection } from './components/sections/EducationSection';
import { CustomSection } from './components/sections/CustomSection';
import { AddSectionBar } from './components/AddSectionBar';
import { PreviewModal } from './components/PreviewModal';
import { PaginatedResumeView } from './components/PaginatedResumeView';
import { ResumeDashboard } from './components/ResumeDashboard';
import { ConfirmDialog } from './components/ConfirmDialog';
import { LayoutSelectModal } from './components/LayoutSelectModal';
import { LayoutSidebar } from './components/LayoutSidebar';
import { AuthPage } from './components/AuthPage';
import { getSupabase } from './lib/supabase';
import { fetchUserResumes, saveUserResume, deleteUserResume } from './lib/resumeService';
import { DEFAULT_LAYOUT_ID, normalizeLayoutId } from './layouts/registry';
import { User } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY = 'cevee_resumes_v3';
const ACTIVE_RESUME_KEY = 'cevee_active_resume_id_v3';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const fetchedUserIdRef = useRef<string | null>(null);
  const pendingPrintIdRef = useRef<string | null>(null);

  const [resumes, setResumes] = useState<ResumeDocument[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ResumeDocument[];
        return parsed.map((r) => ({ ...r, layoutId: normalizeLayoutId(r.layoutId) }));
      } catch (e) {
        console.error('Failed to parse saved resumes', e);
      }
    }
    return initialResumes;
  });

  const [activeResumeId, setActiveResumeId] = useState<string>(() => {
    const savedId = localStorage.getItem(ACTIVE_RESUME_KEY);
    if (savedId && resumes.some((r) => r.id === savedId)) {
      return savedId;
    }
    return resumes[0]?.id || '';
  });

  // Default view is 'dashboard' so user always lands on the resume list first!
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [layoutModal, setLayoutModal] = useState<{ isOpen: boolean; mode: 'create' | 'switch' }>({
    isOpen: false,
    mode: 'create',
  });
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Supabase Auth listener
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((prev) => {
        const next = session?.user ?? null;
        if (prev?.id === next?.id) return prev;
        return next;
      });
      setIsAuthChecking(false);
      if (session && (window.location.search.includes('code=') || window.location.hash.includes('access_token'))) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser((prev) => {
        const next = session?.user ?? null;
        if (prev?.id === next?.id) return prev;
        return next;
      });
      setIsAuthChecking(false);
      if (event === 'SIGNED_IN' && session) {
        if (window.location.search.includes('code=') || window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    fetchedUserIdRef.current = null;
    setUser(null);
    setIsGuest(false);
    setResumes([]);
    setActiveResumeId('');
    setCurrentView('dashboard');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_RESUME_KEY);
  };

  // Fetch user resumes from Supabase on login (only once per authenticated user)
  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      fetchedUserIdRef.current = null;
      return;
    }

    if (fetchedUserIdRef.current === userId) {
      return;
    }
    fetchedUserIdRef.current = userId;

    let isMounted = true;
    setSyncStatus('saving');
    fetchUserResumes().then(async (dbResumes) => {
      if (!isMounted) return;

      if (dbResumes && dbResumes.length > 0) {
        setResumes(dbResumes);
        setActiveResumeId((prevActiveId) => {
          return prevActiveId && dbResumes.some((r) => r.id === prevActiveId)
            ? prevActiveId
            : dbResumes[0].id;
        });
        setSyncStatus('saved');
      } else if (dbResumes && dbResumes.length === 0) {
        // First-time login: show clean empty dashboard
        setResumes([]);
        setActiveResumeId('');
        setCurrentView('dashboard');
        setSyncStatus('saved');
      } else {
        setSyncStatus('error');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const activeResume = resumes.find((r) => r.id === activeResumeId) || (resumes.length > 0 ? resumes[0] : undefined);

  // Auto-sync active resume to Supabase if logged in (debounced)
  useEffect(() => {
    if (!user || !activeResume || !activeResumeId || resumes.length === 0) return;

    setSyncStatus('saving');
    const timeout = setTimeout(async () => {
      const ok = await saveUserResume(activeResume);
      setSyncStatus(ok ? 'saved' : 'error');
    }, 800);

    return () => clearTimeout(timeout);
  }, [activeResume, activeResumeId, user, resumes.length]);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumes));
  }, [resumes]);

  useEffect(() => {
    if (activeResumeId) {
      localStorage.setItem(ACTIVE_RESUME_KEY, activeResumeId);
    }
  }, [activeResumeId]);

  // Helper to update active resume content
  const updateActiveResume = (updater: (prev: ResumeDocument) => ResumeDocument) => {
    setResumes((prev) =>
      prev.map((res) => {
        if (res.id === activeResumeId) {
          const updated = updater(res);
          return {
            ...updated,
            createdAt: updated.createdAt || res.updatedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return res;
      })
    );
  };

  // Header update
  const handleHeaderChange = (newHeader: HeaderData) => {
    updateActiveResume((res) => ({
      ...res,
      content: {
        ...res.content,
        header: newHeader,
      },
    }));
  };

  // Section title rename
  const handleRenameSection = (sectionId: string, newTitle: string) => {
    updateActiveResume((res) => ({
      ...res,
      content: {
        ...res.content,
        sections: res.content.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, title: newTitle } : sec
        ),
      },
    }));
  };

  // Section data update
  const handleUpdateSectionData = (sectionId: string, newData: SectionData, isPlaceholder?: boolean) => {
    updateActiveResume((res) => ({
      ...res,
      content: {
        ...res.content,
        sections: res.content.sections.map((sec) =>
          sec.id === sectionId
            ? ({
                ...sec,
                data: newData,
                isPlaceholder: isPlaceholder !== undefined ? isPlaceholder : sec.isPlaceholder,
              } as ResumeSection)
            : sec
        ),
      },
    }));
  };

  // Section reorder (move up)
  const handleMoveSectionUp = (index: number) => {
    if (index <= 0) return;
    updateActiveResume((res) => {
      const newSections = [...res.content.sections];
      const temp = newSections[index - 1];
      newSections[index - 1] = newSections[index];
      newSections[index] = temp;
      return {
        ...res,
        content: {
          ...res.content,
          sections: newSections,
        },
      };
    });
  };

  // Section reorder (move down)
  const handleMoveSectionDown = (index: number) => {
    updateActiveResume((res) => {
      if (index >= res.content.sections.length - 1) return res;
      const newSections = [...res.content.sections];
      const temp = newSections[index + 1];
      newSections[index + 1] = newSections[index];
      newSections[index] = temp;
      return {
        ...res,
        content: {
          ...res.content,
          sections: newSections,
        },
      };
    });
  };

  // Section delete trigger (opens confirmation modal)
  const handleDeleteSection = (sectionId: string) => {
    setDeletingSectionId(sectionId);
  };

  const executeDeleteSection = (sectionId: string) => {
    updateActiveResume((res) => ({
      ...res,
      content: {
        ...res.content,
        sections: res.content.sections.filter((s) => s.id !== sectionId),
      },
    }));
  };

  // Add section
  const handleAddSection = (title: string, type: SectionType) => {
    const newSectionId = `sec-${Date.now()}`;
    let defaultData: SectionData;

    if (type === 'summary') {
      defaultData = { html: '' };
    } else if (type === 'skills') {
      defaultData = {
        categories: [
          {
            id: `sk-${Date.now()}`,
            category: '',
            items: '',
          },
        ],
      };
    } else if (type === 'experience') {
      defaultData = {
        items: [
          {
            id: `exp-${Date.now()}`,
            role: '',
            company: '',
            location: '',
            period: '',
            startDate: '',
            endDate: '',
            current: false,
            bullets: '',
          },
        ],
      };
    } else if (type === 'education') {
      defaultData = {
        items: [
          {
            id: `edu-${Date.now()}`,
            degree: '',
            institution: '',
            period: '',
            startDate: '',
            endDate: '',
            gpa: '',
            description: '',
          },
        ],
      };
    } else if (type === 'projects') {
      defaultData = {
        items: [
          {
            id: `proj-${Date.now()}`,
            name: '',
            url: '',
            period: '',
            startDate: '',
            endDate: '',
            bullets: '',
          },
        ],
      };
    } else {
      defaultData = {
        items: [
          {
            id: `item-${Date.now()}`,
            title: '',
            subtitle: '',
            period: '',
            description: '',
          },
        ],
      };
    }

    updateActiveResume((res) => ({
      ...res,
      content: {
        ...res.content,
        sections: [
          ...res.content.sections,
          {
            id: newSectionId,
            type,
            title,
            isPlaceholder: true,
            data: defaultData,
          } as ResumeSection,
        ],
      },
    }));
  };

  // Multi-CV actions: Open layout selector before creating resume
  const handleCreateResume = () => {
    setLayoutModal({
      isOpen: true,
      mode: 'create',
    });
  };

  const handleSelectLayout = (layoutId: ResumeLayoutId) => {
    updateActiveResume((res) => ({
      ...res,
      layoutId,
    }));
  };

  const handleConfirmLayout = (layoutId: ResumeLayoutId) => {
    if (layoutModal.mode === 'create') {
      executeCreateResume(layoutId);
    } else {
      handleSelectLayout(layoutId);
    }
    setLayoutModal((prev) => ({ ...prev, isOpen: false }));
  };

  const executeCreateResume = (layoutId: ResumeLayoutId = DEFAULT_LAYOUT_ID) => {
    const newId = `resume-${Date.now()}`;
    const newResume: ResumeDocument = {
      id: newId,
      title: 'Untitled Resume',
      layoutId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: {
        header: {
          fullName: 'Your Name',
          isPlaceholder: true,
          roles: [],
          headline: '',
          location: 'City, State/Country',
          willingToRelocate: false,
          relocationStatus: '',
          email: 'email@address.com',
          phone: '+65 1234 5678',
          links: [
            {
              id: `l-${Date.now()}-1`,
              label: 'linkedin.com/in/your_linkedin',
              url: 'https://linkedin.com',
            },
            {
              id: `l-${Date.now()}-2`,
              label: 'github.com/username',
              url: 'https://github.com',
            },
            {
              id: `l-${Date.now()}-3`,
              label: 'otherlink.com',
              url: 'https://example.com',
            },
          ],
        },
        sections: [
          {
            id: `sec-${Date.now()}-1`,
            type: 'summary',
            title: 'SUMMARY',
            showTitle: false,
            isPlaceholder: true,
            data: { html: '' },
          },
          {
            id: `sec-${Date.now()}-2`,
            type: 'experience',
            title: 'WORK EXPERIENCE',
            isPlaceholder: true,
            data: { items: [] },
          },
          {
            id: `sec-${Date.now()}-3`,
            type: 'education',
            title: 'EDUCATION',
            isPlaceholder: true,
            data: { items: [] },
          },
          {
            id: `sec-${Date.now()}-4`,
            type: 'projects',
            title: 'PROJECTS',
            isPlaceholder: true,
            data: { items: [] },
          },
          {
            id: `sec-${Date.now()}-5`,
            type: 'skills',
            title: 'SKILLS',
            isPlaceholder: true,
            data: { categories: [] },
          },
        ],
      },
    };
    setResumes((prev) => [newResume, ...prev]);
    setActiveResumeId(newId);
    if (user) {
      saveUserResume(newResume);
    }
    setCurrentView('editor');
  };

  const handleDuplicateResume = (id: string) => {
    const target = resumes.find((r) => r.id === id);
    if (!target) return;
    const newId = `resume-${Date.now()}`;
    const duplicated: ResumeDocument = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      title: `${target.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setResumes((prev) => [duplicated, ...prev]);
    setActiveResumeId(newId);
    if (user) {
      saveUserResume(duplicated);
    }
  };

  const handleDeleteResume = (id: string) => {
    const filtered = resumes.filter((r) => r.id !== id);
    setResumes(filtered);
    if (user) {
      deleteUserResume(id);
    }
    if (filtered.length > 0) {
      setActiveResumeId(filtered[0].id);
    } else {
      setActiveResumeId('');
      setCurrentView('dashboard');
    }
  };

  const handleRenameResume = (id: string, newTitle: string) => {
    setResumes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title: newTitle } : r))
    );
    if (user) {
      const target = resumes.find((r) => r.id === id);
      if (target) {
        saveUserResume({ ...target, title: newTitle });
      }
    }
  };

  // Open editor for a chosen resume
  const handleOpenEditor = (id: string) => {
    setActiveResumeId(id);
    setCurrentView('editor');
  };

  // Quick preview from dashboard
  const handlePreviewResume = (id: string) => {
    setActiveResumeId(id);
    setIsPreviewOpen(true);
  };

  // Core print routine for a specific resume
  const printResume = (resume: ResumeDocument) => {
    const originalTitle = document.title;
    const cleanFullName = (resume.content.header.fullName || 'Candidate')
      .replace(/[/\\:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const cleanTitle = (resume.title || 'Resume')
      .replace(/[/\\:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    document.title = `CV_${cleanFullName}_${cleanTitle}`;
    setIsPreviewOpen(false);

    setTimeout(() => {
      // Isolate print view: temporarily hide any foreign elements outside #root and any fixed widgets
      const hiddenElements: { el: HTMLElement; prevDisplay: string; prevVisibility: string }[] = [];

      Array.from(document.body.children).forEach((child) => {
        if (child.id !== 'root' && child instanceof HTMLElement) {
          hiddenElements.push({
            el: child,
            prevDisplay: child.style.display,
            prevVisibility: child.style.visibility,
          });
          child.style.setProperty('display', 'none', 'important');
          child.style.setProperty('visibility', 'hidden', 'important');
        }
      });

      document.querySelectorAll('body *').forEach((node) => {
        if (node instanceof HTMLElement && !node.closest('.print-only-area')) {
          const comp = window.getComputedStyle(node);
          if (comp.position === 'fixed') {
            hiddenElements.push({
              el: node,
              prevDisplay: node.style.display,
              prevVisibility: node.style.visibility,
            });
            node.style.setProperty('display', 'none', 'important');
            node.style.setProperty('visibility', 'hidden', 'important');
          }
        }
      });

      window.print();

      // Restore elements after print
      setTimeout(() => {
        hiddenElements.forEach(({ el, prevDisplay, prevVisibility }) => {
          el.style.display = prevDisplay;
          el.style.visibility = prevVisibility;
        });
        document.title = originalTitle;
      }, 500);
    }, 200);
  };

  // Print the resume that was just activated, but only once it is actually
  // rendered inside the print-only area (avoids printing a stale document).
  useEffect(() => {
    const pendingId = pendingPrintIdRef.current;
    if (!pendingId || !activeResume || activeResume.id !== pendingId) return;
    pendingPrintIdRef.current = null;
    printResume(activeResume);
  }, [activeResume]);

  // Download PDF handler (editor / active resume)
  const handleDownloadPdf = () => {
    if (!activeResume) return;
    printResume(activeResume);
  };

  // Download a specific resume directly from the dashboard card
  const handleDownloadResumeById = (id: string) => {
    const target = resumes.find((r) => r.id === id);
    if (!target) return;
    if (activeResumeId === id && activeResume) {
      printResume(activeResume);
      return;
    }
    pendingPrintIdRef.current = id;
    setActiveResumeId(id);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <AuthPage
        onAuthSuccess={() => setIsGuest(false)}
        onContinueAsGuest={() => setIsGuest(true)}
      />
    );
  }

  return (
    <>
      {currentView === 'dashboard' || !activeResume ? (
        <div className="no-print">
          <ResumeDashboard
            resumes={resumes}
            onSelectResume={handleOpenEditor}
            onCreateResume={handleCreateResume}
            onDuplicateResume={handleDuplicateResume}
            onDeleteResume={handleDeleteResume}
            onRenameResume={handleRenameResume}
            onPreviewResume={handlePreviewResume}
            onDownloadResume={handleDownloadResumeById}
            userEmail={user?.email}
            userName={
              (user?.user_metadata?.full_name as string) ||
              (user?.user_metadata?.name as string) ||
              (user?.user_metadata?.display_name as string) ||
              user?.email
            }
            userAvatarUrl={
              (user?.user_metadata?.avatar_url as string) ||
              (user?.user_metadata?.picture as string)
            }
            onSignOut={handleSignOut}
          />
        </div>
      ) : (
        <div className="min-h-screen flex flex-row bg-slate-100 no-print">
          {/* Left Sidebar Container with Layout Selector inside */}
          <LayoutSidebar
            activeLayoutId={normalizeLayoutId(activeResume.layoutId)}
            onSelectLayout={handleSelectLayout}
          />

          {/* Editor Workspace: Top Navbar (aligned to Canvas) + Canvas Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Navbar
              resumes={resumes}
              currentResumeId={activeResumeId}
              onSelectResume={setActiveResumeId}
              onCreateResume={handleCreateResume}
              onDuplicateResume={handleDuplicateResume}
              onDeleteResume={handleDeleteResume}
              onRenameResume={handleRenameResume}
              onOpenPreview={() => setIsPreviewOpen(true)}
              onDownloadPdf={handleDownloadPdf}
              onBackToDashboard={() => setCurrentView('dashboard')}
              syncStatus={syncStatus}
              isCloudUser={Boolean(user)}
            />

            {/* Editor Canvas Area */}
            <main className="no-print-area flex-1 pt-4 pb-24 px-2.5 sm:py-8 sm:px-6 flex justify-center items-start overflow-x-hidden min-w-0">
              {/* A4 Canvas Page */}
              <div
                className="resume-a4-page w-full rounded-[20px] transition-all"
                data-layout={normalizeLayoutId(activeResume.layoutId)}
              >
              {/* Header */}
              <ResumeHeader
                data={activeResume.content.header}
                onChange={handleHeaderChange}
                layoutId={activeResume.layoutId}
              />

              {/* Dynamic Sections */}
              {activeResume.content.sections.map((section, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === activeResume.content.sections.length - 1;

                if (section.type === 'summary') {
                  return (
                    <SummarySection
                      key={section.id}
                      title={section.title}
                      showTitle={section.showTitle}
                      isPlaceholder={section.isPlaceholder}
                      data={section.data}
                      layoutId={activeResume.layoutId}
                      onRename={(newTitle) => handleRenameSection(section.id, newTitle)}
                      onUpdateData={(newData, isPlaceholder) =>
                        handleUpdateSectionData(section.id, newData, isPlaceholder)
                      }
                      onMoveUp={() => handleMoveSectionUp(idx)}
                      onMoveDown={() => handleMoveSectionDown(idx)}
                      onDelete={() => handleDeleteSection(section.id)}
                      isFirst={isFirst}
                      isLast={isLast}
                    />
                  );
                }

                if (section.type === 'skills') {
                  return (
                    <SkillsSection
                      key={section.id}
                      title={section.title}
                      isPlaceholder={section.isPlaceholder}
                      data={section.data}
                      onRename={(newTitle) => handleRenameSection(section.id, newTitle)}
                      onUpdateData={(newData, isPlaceholder) =>
                        handleUpdateSectionData(section.id, newData, isPlaceholder)
                      }
                      onMoveUp={() => handleMoveSectionUp(idx)}
                      onMoveDown={() => handleMoveSectionDown(idx)}
                      onDelete={() => handleDeleteSection(section.id)}
                      isFirst={isFirst}
                      isLast={isLast}
                    />
                  );
                }

                if (section.type === 'experience') {
                  return (
                    <ExperienceSection
                      key={section.id}
                      title={section.title}
                      isPlaceholder={section.isPlaceholder}
                      data={section.data}
                      onRename={(newTitle) => handleRenameSection(section.id, newTitle)}
                      onUpdateData={(newData, isPlaceholder) =>
                        handleUpdateSectionData(section.id, newData, isPlaceholder)
                      }
                      onMoveUp={() => handleMoveSectionUp(idx)}
                      onMoveDown={() => handleMoveSectionDown(idx)}
                      onDelete={() => handleDeleteSection(section.id)}
                      isFirst={isFirst}
                      isLast={isLast}
                    />
                  );
                }

                if (section.type === 'projects') {
                  return (
                    <ProjectsSection
                      key={section.id}
                      title={section.title}
                      isPlaceholder={section.isPlaceholder}
                      data={section.data}
                      onRename={(newTitle) => handleRenameSection(section.id, newTitle)}
                      onUpdateData={(newData, isPlaceholder) =>
                        handleUpdateSectionData(section.id, newData, isPlaceholder)
                      }
                      onMoveUp={() => handleMoveSectionUp(idx)}
                      onMoveDown={() => handleMoveSectionDown(idx)}
                      onDelete={() => handleDeleteSection(section.id)}
                      isFirst={isFirst}
                      isLast={isLast}
                    />
                  );
                }

                if (section.type === 'education') {
                  return (
                    <EducationSection
                      key={section.id}
                      title={section.title}
                      isPlaceholder={section.isPlaceholder}
                      data={section.data}
                      onRename={(newTitle) => handleRenameSection(section.id, newTitle)}
                      onUpdateData={(newData, isPlaceholder) =>
                        handleUpdateSectionData(section.id, newData, isPlaceholder)
                      }
                      onMoveUp={() => handleMoveSectionUp(idx)}
                      onMoveDown={() => handleMoveSectionDown(idx)}
                      onDelete={() => handleDeleteSection(section.id)}
                      isFirst={isFirst}
                      isLast={isLast}
                    />
                  );
                }

                // Custom or Fallback Section
                return (
                  <CustomSection
                    key={section.id}
                    title={section.title}
                    isPlaceholder={section.isPlaceholder}
                    data={section.data as { items: CustomSectionItem[] }}
                    onRename={(newTitle) => handleRenameSection(section.id, newTitle)}
                    onUpdateData={(newData, isPlaceholder) =>
                      handleUpdateSectionData(section.id, newData, isPlaceholder)
                    }
                    onMoveUp={() => handleMoveSectionUp(idx)}
                    onMoveDown={() => handleMoveSectionDown(idx)}
                    onDelete={() => handleDeleteSection(section.id)}
                    isFirst={isFirst}
                    isLast={isLast}
                  />
                );
              })}

              {/* Bottom Bar: Add Sections */}
              <AddSectionBar
                onAddSection={handleAddSection}
                existingTitles={activeResume.content.sections.map((s) => s.title)}
              />
            </div>
          </main>
        </div>
      </div>
      )}

      {/* Print-Only Paginated Sheets (used when downloading PDF).
          Skipped while the preview modal is open to avoid mounting the
          paginated view twice at once. */}
      {activeResume && !isPreviewOpen && (
        <div className="print-only-area">
          <PaginatedResumeView resume={activeResume} scale={1} showPageNumbers={false} />
        </div>
      )}

      {/* 1:1 Clean PDF Preview Modal */}
      {activeResume && (
        <PreviewModal
          resume={activeResume}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={handleDownloadPdf}
        />
      )}

      {/* Confirmation Modal for Section Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingSectionId)}
        title={`Delete "${activeResume?.content.sections.find((s) => s.id === deletingSectionId)?.title || 'Section'}"?`}
        description="This action cannot be undone. All entries, roles, and formatted descriptions in this section will be permanently deleted from this resume."
        confirmLabel="Delete Section"
        cancelLabel="Keep Section"
        isDestructive={true}
        onConfirm={() => {
          if (deletingSectionId) {
            executeDeleteSection(deletingSectionId);
            setDeletingSectionId(null);
          }
        }}
        onCancel={() => setDeletingSectionId(null)}
      />

      {/* Layout Selection & Switching Modal */}
      <LayoutSelectModal
        isOpen={layoutModal.isOpen}
        mode={layoutModal.mode}
        currentLayoutId={activeResume?.layoutId}
        onConfirm={handleConfirmLayout}
        onClose={() => setLayoutModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
export default App;
