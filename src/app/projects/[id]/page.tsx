'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import CollaborativeEditor, { EditorRef } from '@/components/editor/Editor';
import TeamList from '@/components/project/TeamList';
import ArtifactsList from '@/components/project/ArtifactsList';
import AIActions from '@/components/project/AIActions';
import TaskList from '@/components/project/TaskList';
import DocList from '@/components/project/DocList';
import CommentsPanel from '@/components/project/CommentsPanel';
import SuggestionsPanel from '@/components/project/SuggestionsPanel';
import ReadinessChecklist from '@/components/project/ReadinessChecklist';
import UniversityResources from '@/components/project/UniversityResources';

// Icons
const DownloadIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const ShareIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SparklesIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);

const BuildingIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);

// Skeleton components
const EditorSkeleton = () => (
    <div className="space-y-4">
        <div className="skeleton h-6 w-48 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
    </div>
);

const SidebarSkeleton = () => (
    <div className="space-y-4">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="skeleton h-10 w-full rounded-xl" />
    </div>
);

export default function ProjectPage() {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);
    const [activeDocTitle, setActiveDocTitle] = useState('Research Proposal');
    const [docContent, setDocContent] = useState<any>(null);
    const [activePanel, setActivePanel] = useState<'readiness' | 'ai' | 'tasks' | 'team' | 'files' | 'university'>('readiness');
    const [readinessProgress, setReadinessProgress] = useState(0);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const editorRef = useRef<EditorRef>(null);

    useEffect(() => {
        if (id) fetchProject(id as string);
    }, [id]);

    useEffect(() => {
        if (!project?.id) return;

        // Fetch readiness data for progress bar
        const fetchReadiness = async () => {
            try {
                const [docsRes, artifactsRes, membersRes] = await Promise.all([
                    fetch(`/api/projects/${project.id}/docs`),
                    fetch(`/api/projects/${project.id}/artifacts`),
                    fetch(`/api/projects/${project.id}/members`),
                ]);

                const docsData = await docsRes.json();
                const artifactsData = await artifactsRes.json();
                const membersData = await membersRes.json();

                const docs = docsData.docs || [];
                const artifacts = artifactsData.artifacts || [];
                const members = membersData.members || [];

                setTeamMembers(members);

                // Calculate readiness based on items
                let completed = 0;
                const total = 3;

                if (docs.some((d: any) => d.content?.length > 100)) completed++;
                if (artifacts.some((a: any) => a.name?.toLowerCase().includes('budget'))) completed++;
                if (artifacts.some((a: any) =>
                    a.name?.toLowerCase().includes('bio') || a.name?.toLowerCase().includes('cv')
                )) completed++;

                setReadinessProgress((completed / total) * 100);
            } catch (error) {
                // Silent fail
            }
        };

        fetchReadiness();
    }, [project?.id]);

    const fetchProject = async (projectId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            const data = await res.json();
            if (data.project) {
                setProject(data.project);
                if (!activeDocId) {
                    fetch(`/api/projects/${data.project.id}/docs`)
                        .then((res) => res.json())
                        .then((docsData) => {
                            const firstDoc = docsData.docs?.[0];
                            if (firstDoc) {
                                setActiveDocId(firstDoc.id);
                                setActiveDocTitle(firstDoc.title || 'Document');
                                setDocContent(firstDoc.content || null);
                            }
                        })
                        .catch(() => undefined);
                }
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!editorRef.current || !project) return;

        setExporting(true);
        try {
            const documentHtml = editorRef.current.getHTML();

            const res = await fetch(`/api/projects/${project.id}/export/zip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentHtml,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                return;
            }

            const binary = Uint8Array.from(atob(data.zipBase64), (c) => c.charCodeAt(0));
            const blob = new Blob([binary], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = data.fileName || `${project.title || 'submission'}-package.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setExporting(false);
        }
    };

    const getDaysUntil = (deadline: string | null) => {
        if (!deadline) return null;
        const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : null;
    };

    if (loading) {
        return (
            <AppShell>
                <div className="space-y-6 animate-fade-in">
                    <div className="card p-6">
                        <div className="skeleton h-4 w-24 rounded mb-2" />
                        <div className="skeleton h-8 w-64 rounded mb-2" />
                        <div className="skeleton h-4 w-48 rounded" />
                    </div>
                    <div className="grid gap-6 lg:grid-cols-[240px_1fr_340px]">
                        <div className="card p-4"><SidebarSkeleton /></div>
                        <div className="card p-6"><EditorSkeleton /></div>
                        <div className="card p-4"><SidebarSkeleton /></div>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!project) {
        return (
            <AppShell>
                <div className="empty-state py-20">
                    <h3 className="font-serif text-xl mb-2">Project not found</h3>
                    <p className="text-inkMuted">This project may have been deleted or you don't have access.</p>
                </div>
            </AppShell>
        );
    }

    const deadline = project.grants?.deadline;
    const daysLeft = getDaysUntil(deadline);

    const panels = [
        { id: 'readiness', label: 'Readiness', icon: '✓' },
        { id: 'ai', label: 'AI Tools', icon: <SparklesIcon /> },
        { id: 'university', label: 'ASU Directory', icon: <BuildingIcon /> },
        { id: 'tasks', label: 'Tasks', icon: '☐' },
        { id: 'team', label: 'Team', icon: <UsersIcon /> },
        { id: 'files', label: 'Files', icon: '📎' },
    ];

    return (
        <AppShell>
            <div className="space-y-6 animate-fade-in">
                {/* Project Header */}
                <div className="card overflow-hidden">
                    <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="label mb-1">Project Workspace</div>
                            <h1 className="font-serif text-2xl lg:text-3xl truncate">
                                {project.title || 'Untitled Project'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-inkMuted">
                                <span className="badge-default">
                                    {project.grants?.funder || 'Grant'}
                                </span>
                                <span className="truncate max-w-xs">
                                    {project.grants?.title}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {daysLeft && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                                    daysLeft <= 7 ? 'bg-coral-50 text-error' :
                                    daysLeft <= 30 ? 'bg-amber-50 text-amber-600' :
                                    'bg-panel text-inkMuted'
                                }`}>
                                    <ClockIcon />
                                    <span className="font-medium">{daysLeft}d left</span>
                                </div>
                            )}
                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                className="btn-primary"
                            >
                                <DownloadIcon />
                                {exporting ? 'Exporting...' : 'Export'}
                            </button>
                            <button className="btn-secondary">
                                <ShareIcon />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-panel">
                        <div
                            className={`h-full transition-all duration-500 ${
                                readinessProgress === 100 ? 'bg-teal' : 'bg-amber-500'
                            }`}
                            style={{ width: `${readinessProgress}%` }}
                        />
                    </div>
                </div>

                {/* Main Workspace Grid */}
                <div className="grid gap-6 lg:grid-cols-[240px_1fr_360px]">
                    {/* Left Sidebar - Documents */}
                    <div className="card p-4 h-fit lg:sticky lg:top-24">
                        <div className="label mb-3">Documents</div>
                        <DocList
                            projectId={project.id}
                            activeDocId={activeDocId}
                            onSelectAction={(doc) => {
                                setActiveDocId(doc.id);
                                setActiveDocTitle(doc.title || 'Document');
                                setDocContent(null);
                                fetch(`/api/projects/${project.id}/docs?docId=${doc.id}`)
                                    .then((res) => res.json())
                                    .then((data) => setDocContent(data.doc?.content || null))
                                    .catch(() => setDocContent(null));
                            }}
                        />
                    </div>

                    {/* Center - Editor */}
                    <div className="card flex flex-col min-h-[600px]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <h2 className="font-serif text-xl">{activeDocTitle}</h2>
                                <span className="flex items-center gap-1.5 text-xs text-success bg-sage-50 px-2 py-1 rounded-full">
                                    <span className="status-dot-success" />
                                    Synced
                                </span>
                            </div>
                            {teamMembers.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {teamMembers.slice(0, 3).map((member, i) => (
                                            <div
                                                key={member.id || i}
                                                className="avatar avatar-sm border-2 border-surface"
                                                title={member.profiles?.full_name || member.user_id}
                                            >
                                                {(member.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {teamMembers.length > 3 && (
                                            <div className="avatar avatar-sm border-2 border-surface bg-panel text-inkMuted">
                                                +{teamMembers.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-inkMuted">
                                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-6 overflow-auto">
                            <CollaborativeEditor
                                ref={editorRef}
                                projectId={project.id}
                                docId={activeDocId || project.id}
                                initialContent={docContent}
                                grantInfo={{
                                    title: project.grants?.title,
                                    funder: project.grants?.funder,
                                    description: project.grants?.description,
                                }}
                            />
                        </div>

                        <div className="px-6 py-3 border-t border-border bg-panel/30">
                            <div className="flex items-center gap-2 text-xs text-inkMuted">
                                <SparklesIcon />
                                <span>Type <kbd className="px-1.5 py-0.5 rounded bg-panel border border-border font-mono">/</kbd> for AI commands</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Tools */}
                    <div className="space-y-4 lg:sticky lg:top-24 h-fit">
                        {/* Panel Tabs */}
                        <div className="card p-2">
                            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                                {panels.map((panel) => (
                                    <button
                                        key={panel.id}
                                        onClick={() => setActivePanel(panel.id as any)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                            activePanel === panel.id
                                                ? 'bg-teal-50 text-teal'
                                                : 'text-inkMuted hover:bg-panel hover:text-ink'
                                        }`}
                                    >
                                        <span className="text-sm">{panel.icon}</span>
                                        {panel.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Panel */}
                        <div className="card p-4">
                            {activePanel === 'readiness' && (
                                <ReadinessChecklist projectId={project.id} />
                            )}
                            {activePanel === 'ai' && (
                                <AIActions
                                    projectId={project.id}
                                    getDocumentContent={() => editorRef.current?.getHTML() || ''}
                                    grantInfo={{
                                        title: project.grants?.title,
                                        funder: project.grants?.funder,
                                        eligibility_text: project.grants?.eligibility_text,
                                    }}
                                />
                            )}
                            {activePanel === 'university' && (
                                <UniversityResources
                                    projectId={project.id}
                                    proposalContent={editorRef.current?.getHTML() || ''}
                                />
                            )}
                            {activePanel === 'tasks' && (
                                <TaskList projectId={project.id} />
                            )}
                            {activePanel === 'team' && (
                                <TeamList projectId={project.id} />
                            )}
                            {activePanel === 'files' && (
                                <ArtifactsList projectId={project.id} />
                            )}
                        </div>

                        {/* Comments & Suggestions (Always visible) */}
                        <div className="card p-4">
                            <CommentsPanel projectId={project.id} docId={activeDocId} />
                        </div>
                        <div className="card p-4">
                            <SuggestionsPanel projectId={project.id} docId={activeDocId} />
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
