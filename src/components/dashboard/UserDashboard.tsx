'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { MOCK_PROJECTS, MOCK_RECOMMENDED_GRANTS } from '@/lib/mockData';

// Icons
const ArrowRightIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const SparklesIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

const FolderIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface Project {
    id: string;
    title: string | null;
    status: string | null;
    grants?: {
        title?: string | null;
        funder?: string | null;
        deadline?: string | null;
    } | null;
    updated_at: string;
}

interface Grant {
    id: string;
    title: string;
    funder: string | null;
    deadline: string | null;
    reasons?: string[];
    description: string | null;
}

// Skeleton components
const ProjectCardSkeleton = () => (
    <div className="card p-5 space-y-4">
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-6 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-6 w-24 rounded-full" />
    </div>
);

const GrantCardSkeleton = () => (
    <div className="card p-5 space-y-4">
        <div className="flex justify-between">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
        </div>
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-9 w-full rounded-lg mt-4" />
    </div>
);

export default function UserDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [recommended, setRecommended] = useState<Grant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, grantsRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/grants/match', { method: 'POST' })
                ]);

                if (projectsRes.ok) {
                    const data = await projectsRes.json();
                    const fetchedProjects = data.projects || [];

                    // Use centralized mock data if no real projects exist
                    if (fetchedProjects.length === 0) {
                        setProjects(MOCK_PROJECTS);
                    } else {
                        setProjects(fetchedProjects);
                    }
                } else {
                    // API failed, use mock data
                    setProjects(MOCK_PROJECTS);
                }

                if (grantsRes.ok) {
                    const data = await grantsRes.json();
                    const fetchedGrants = data.grants || [];

                    // Use centralized mock grants if API returns empty
                    if (fetchedGrants.length === 0) {
                        setRecommended(MOCK_RECOMMENDED_GRANTS.slice(0, 3));
                    } else {
                        setRecommended(fetchedGrants.slice(0, 3));
                    }
                } else {
                    // API failed, use mock grants
                    setRecommended(MOCK_RECOMMENDED_GRANTS.slice(0, 3));
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                // On error, ensure we use mock data
                setProjects(MOCK_PROJECTS);
                setRecommended(MOCK_RECOMMENDED_GRANTS.slice(0, 3));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const goToWorkspace = (grantId: string) => {
        window.location.href = `/projects/demo?grantId=${encodeURIComponent(grantId)}`;
    };

    const startProject = async (grantId: string) => {
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grantId, title: 'New Application' }),
            });

            if (res.status === 401) {
                goToWorkspace(grantId);
                return;
            }

            if (!res.ok) {
                const errorBody = await res.json().catch(() => ({}));
                console.error('Project create failed:', errorBody);
                goToWorkspace(grantId);
                return;
            }

            const data = await res.json();
            if (data.project) {
                window.location.href = `/projects/${data.project.id}`;
                return;
            }

            goToWorkspace(grantId);
        } catch (error) {
            console.error('Error creating project:', error);
            goToWorkspace(grantId);
        }
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'in_progress': return 'bg-teal-50 text-teal-700';
            case 'draft': return 'bg-panel text-inkMuted';
            case 'submitted': return 'bg-sage-50 text-sage';
            case 'awarded': return 'bg-amber-50 text-amber-600';
            default: return 'bg-panel text-inkMuted';
        }
    };

    const getDaysUntil = (deadline: string | null) => {
        if (!deadline) return null;
        const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : null;
    };

    return (
        <AppShell>
            <div className="space-y-10 animate-fade-in">

                {/* Welcome Section */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50 via-surface to-amber-50/30 p-8 lg:p-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div>
                            <h1 className="font-serif text-3xl lg:text-4xl text-ink">Welcome back</h1>
                            <p className="mt-2 text-inkMuted text-lg">
                                Your grant pipeline is active. Keep the momentum going.
                            </p>
                        </div>
                        <Link href="/grants" className="btn-primary btn-lg group">
                            Find new grants
                            <ArrowRightIcon />
                        </Link>
                    </div>

                    {/* Quick stats */}
                    <div className="relative mt-8 grid grid-cols-3 gap-4 lg:gap-8">
                        {[
                            { label: 'Active Projects', value: loading ? '—' : projects.length.toString(), icon: FolderIcon },
                            { label: 'Recommendations', value: loading ? '—' : recommended.length.toString(), icon: SparklesIcon },
                            {
                                label: 'Days to Deadline', value: loading ? '—' : (() => {
                                    const deadlines = projects
                                        .map(p => p.grants?.deadline)
                                        .filter(Boolean)
                                        .map(d => getDaysUntil(d as string))
                                        .filter((d): d is number => d !== null);
                                    return deadlines.length > 0 ? Math.min(...deadlines).toString() : '—';
                                })(), icon: ClockIcon
                            },
                        ].map((stat, i) => (
                            <div key={i} className="card p-4 lg:p-5">
                                <div className="flex items-center gap-2 text-inkMuted mb-2">
                                    <stat.icon />
                                    <span className="text-xs font-medium">{stat.label}</span>
                                </div>
                                <div className="font-serif text-2xl lg:text-3xl">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Active Projects */}
                <section>
                    <div className="section-header">
                        <h2 className="section-title">Active Projects</h2>
                        <Link href="/projects" className="link-underline text-sm">
                            View all
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => <ProjectCardSkeleton key={i} />)}
                        </div>
                    ) : (
                        <>
                            {/* Status Breakdown */}
                            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { status: 'in_progress', label: 'In Progress', count: projects.filter(p => p.status === 'in_progress').length, color: 'teal' },
                                    { status: 'draft', label: 'Draft', count: projects.filter(p => p.status === 'draft').length, color: 'gray' },
                                    { status: 'submitted', label: 'Submitted', count: projects.filter(p => p.status === 'submitted').length, color: 'sage' },
                                    { status: 'awarded', label: 'Awarded', count: projects.filter(p => p.status === 'awarded').length, color: 'amber' },
                                ].map((item) => (
                                    <div key={item.status} className="card p-4">
                                        <div className={`text-xs font-medium mb-1 ${item.color === 'teal' ? 'text-teal-700' :
                                            item.color === 'gray' ? 'text-inkMuted' :
                                                item.color === 'sage' ? 'text-sage-700' :
                                                    'text-amber-600'
                                            }`}>
                                            {item.label}
                                        </div>
                                        <div className="font-serif text-2xl">{item.count}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Project Grid */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {projects.slice(0, 6).map((project, i) => (
                                    <Link
                                        key={project.id}
                                        href={`/projects/${project.id}`}
                                        className="card-interactive p-5 group"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`badge ${getStatusColor(project.status)}`}>
                                                {project.status?.replace('_', ' ') || 'Draft'}
                                            </span>
                                            {project.grants?.deadline && getDaysUntil(project.grants.deadline) && (
                                                <span className="badge-amber">
                                                    {getDaysUntil(project.grants.deadline)}d left
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-serif text-lg text-ink group-hover:text-teal transition-colors line-clamp-1">
                                            {project.title || 'Untitled Project'}
                                        </h3>

                                        <p className="mt-2 text-sm text-inkMuted line-clamp-1">
                                            {project.grants?.title || 'General Application'}
                                        </p>

                                        {project.grants?.funder && (
                                            <div className="mt-4 flex items-center gap-2">
                                                <span className="badge-default text-2xs">
                                                    {project.grants.funder}
                                                </span>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* Recommended Grants */}
                <section>
                    <div className="section-header">
                        <div className="flex items-center gap-3">
                            <h2 className="section-title">Recommended for you</h2>
                            <span className="badge-teal">
                                <SparklesIcon />
                                AI Matched
                            </span>
                        </div>
                        <Link href="/grants" className="link-underline text-sm">
                            Browse all
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid gap-5 md:grid-cols-3">
                            {[1, 2, 3].map((i) => <GrantCardSkeleton key={i} />)}
                        </div>
                    ) : recommended.length === 0 ? (
                        <div className="card p-8 text-center">
                            <p className="text-inkMuted">
                                Complete your profile to get personalized grant recommendations.
                            </p>
                            <Link href="/profile" className="btn-secondary mt-4">
                                Update Profile
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-3">
                            {recommended.map((grant, i) => (
                                <div
                                    key={grant.id}
                                    className="card-hover flex flex-col p-5"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-4">
                                        <span className="badge-default">
                                            {grant.funder || 'Independent'}
                                        </span>
                                        {grant.reasons && grant.reasons[0] && (
                                            <span className="badge-teal">Top Match</span>
                                        )}
                                    </div>

                                    <h3 className="font-serif text-lg text-ink line-clamp-2 mb-2">
                                        {grant.title}
                                    </h3>

                                    {grant.deadline && (
                                        <div className="flex items-center gap-2 text-sm text-inkMuted mb-4">
                                            <ClockIcon />
                                            <span>Due {new Date(grant.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    )}

                                    {grant.reasons && grant.reasons.length > 0 && (
                                        <div className="rounded-xl bg-teal-50/50 px-4 py-3 text-xs text-teal-700 mb-4">
                                            {grant.reasons.slice(0, 2).join(' • ')}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => startProject(grant.id)}
                                        className="mt-auto btn-primary w-full"
                                    >
                                        Start Application
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </AppShell>
    );
}
