'use client';

import { useEffect, useState } from 'react';

interface ReadinessChecklistProps {
    projectId: string;
}

interface CheckItem {
    id: string;
    label: string;
    isValid: boolean;
    description: string;
    category: string;
}

export default function ReadinessChecklist({ projectId }: ReadinessChecklistProps) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReadiness();
    }, [projectId]);

    const fetchReadiness = async () => {
        try {
            const [docsRes, artifactsRes] = await Promise.all([
                fetch(`/api/projects/${projectId}/docs`),
                fetch(`/api/projects/${projectId}/artifacts`),
            ]);

            const docsData = await docsRes.json();
            const artifactsData = await artifactsRes.json();

            const docs = docsData.docs || [];
            const artifacts = artifactsData.artifacts || [];

            const checks: CheckItem[] = [
                {
                    id: 'project_summary',
                    label: 'Project Summary',
                    isValid: docs.some((d: any) =>
                        d.title?.toLowerCase().includes('summary') ||
                        (d.title?.toLowerCase().includes('proposal') && d.content?.length > 500)
                    ),
                    description: '1 page max. Must include overview, intellectual merit, and broader impacts',
                    category: 'Required Documents',
                },
                {
                    id: 'project_description',
                    label: 'Project Description',
                    isValid: docs.some((d: any) =>
                        d.title?.toLowerCase().includes('proposal') ||
                        d.title?.toLowerCase().includes('description')
                    ) && docs.some((d: any) => d.content?.length > 1000),
                    description: '15 pages max. Must integrate research and education activities',
                    category: 'Required Documents',
                },
                {
                    id: 'references',
                    label: 'References Cited',
                    isValid: docs.some((d: any) => d.title?.toLowerCase().includes('reference')),
                    description: 'All cited references in proper format (no page limit)',
                    category: 'Required Documents',
                },
                {
                    id: 'biosketch',
                    label: 'Biographical Sketch',
                    isValid: artifacts.some((a: any) =>
                        a.name?.toLowerCase().includes('bio') ||
                        a.name?.toLowerCase().includes('cv') ||
                        a.name?.toLowerCase().includes('sketch')
                    ),
                    description: '3 pages max. Use NSF format with synergistic activities',
                    category: 'Required Documents',
                },
                {
                    id: 'budget',
                    label: 'Budget & Justification',
                    isValid: artifacts.some((a: any) => a.name?.toLowerCase().includes('budget')),
                    description: '$400K-$600K over 5 years. Include summer salary, equipment, and participant support',
                    category: 'Required Documents',
                },
                {
                    id: 'current_pending',
                    label: 'Current & Pending Support',
                    isValid: artifacts.some((a: any) =>
                        a.name?.toLowerCase().includes('current') ||
                        a.name?.toLowerCase().includes('support')
                    ),
                    description: 'List all current and pending funding sources for PI',
                    category: 'Required Documents',
                },
                {
                    id: 'facilities',
                    label: 'Facilities & Resources',
                    isValid: docs.some((d: any) =>
                        d.title?.toLowerCase().includes('facilities') ||
                        d.title?.toLowerCase().includes('resources')
                    ),
                    description: 'Describe institutional support, equipment, and available resources',
                    category: 'Required Documents',
                },
                {
                    id: 'data_management',
                    label: 'Data Management Plan',
                    isValid: docs.some((d: any) => d.title?.toLowerCase().includes('data')),
                    description: '2 pages max. Required for proposals generating data',
                    category: 'Supplementary',
                },
            ];

            const completed = checks.filter(c => c.isValid).length;
            const progress = (completed / checks.length) * 100;

            // Group checks by category
            const categories = Array.from(new Set(checks.map(c => c.category)));
            const groupedChecks = categories.map(cat => ({
                category: cat,
                items: checks.filter(c => c.category === cat),
            }));

            setStats({ checks, progress, completed, total: checks.length, groupedChecks });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-lg bg-surface border border-panel p-6">
                <div className="h-6 w-48 bg-panel rounded animate-pulse mb-4" />
                <div className="h-4 w-full bg-panel rounded animate-pulse mb-2" />
                <div className="h-2 w-full bg-panel rounded animate-pulse mb-6" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-panel rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-surface border border-teal/20 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl text-ink">Submission Readiness</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-inkMuted">
                        {stats.completed} / {stats.total}
                    </span>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        stats.progress === 100
                            ? 'bg-teal/10 text-teal-700'
                            : stats.progress >= 50
                            ? 'bg-amber/10 text-amber-700'
                            : 'bg-panel text-inkMuted'
                    }`}>
                        {stats.progress === 100 ? 'Ready' : stats.progress >= 50 ? 'In Progress' : 'Getting Started'}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-2 w-full rounded-full bg-panel overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            stats.progress === 100 ? 'bg-teal' : stats.progress >= 50 ? 'bg-amber' : 'bg-violet'
                        }`}
                        style={{ width: `${stats.progress}%` }}
                    />
                </div>
                <div className="mt-1 text-xs text-inkMuted text-right">
                    {stats.progress.toFixed(0)}% Complete
                </div>
            </div>

            {/* Grouped Checklist */}
            <div className="space-y-6">
                {stats.groupedChecks.map((group: any) => (
                    <div key={group.category}>
                        {/* Category Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-px flex-1 bg-panel" />
                            <span className="text-xs font-medium text-inkMuted uppercase tracking-wider">
                                {group.category}
                            </span>
                            <div className="h-px flex-1 bg-panel" />
                        </div>

                        {/* Category Items */}
                        <div className="space-y-2">
                            {group.items.map((check: CheckItem) => (
                                <div
                                    key={check.id}
                                    className={`rounded-lg p-3 transition-all ${
                                        check.isValid
                                            ? 'bg-teal/5 border border-teal/20'
                                            : 'bg-panel/50 border border-panel'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Checkbox */}
                                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                            check.isValid
                                                ? 'bg-teal text-white'
                                                : 'bg-panel border-2 border-panel'
                                        }`}>
                                            {check.isValid && (
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium ${
                                                check.isValid ? 'text-ink/70 line-through' : 'text-ink'
                                            }`}>
                                                {check.label}
                                            </div>
                                            {!check.isValid && (
                                                <div className="mt-1 text-xs text-inkMuted leading-relaxed">
                                                    {check.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Message */}
            {stats.progress === 100 ? (
                <div className="mt-6 p-4 rounded-lg bg-teal/10 border border-teal/20">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <div className="text-sm font-medium text-teal-700">Ready for Submission</div>
                            <div className="text-xs text-teal-600 mt-1">
                                All required documents are complete. Review carefully before final submission.
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-6 p-4 rounded-lg bg-amber/5 border border-amber/20">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <div className="text-sm font-medium text-amber-700">Documents Needed</div>
                            <div className="text-xs text-amber-600 mt-1">
                                Complete {stats.total - stats.completed} remaining {stats.total - stats.completed === 1 ? 'item' : 'items'} before submission deadline.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
