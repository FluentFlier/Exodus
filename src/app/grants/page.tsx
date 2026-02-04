'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

// Icons
const SearchIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const SparklesIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
);

const RefreshIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

const ClockIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const CheckIcon = () => (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const XIcon = () => (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const MinusIcon = () => (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
);

const FilterIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

type RequirementStatus = 'yes' | 'no' | 'maybe';

interface GrantRequirement {
    label: string;
    status: RequirementStatus;
}

interface GrantEligibilityPayload {
    eligibility?: string;
    effort?: string;
    collaborator_match_count?: number;
    requirements?: GrantRequirement[];
}

interface GrantCardData {
    id: string;
    title: string;
    description: string | null;
    funder: string | null;
    deadline: string | null;
    deadline_display?: string | null;
    tags?: string[] | null;
    categories?: string[] | null;
    amount_min?: number | null;
    amount_max?: number | null;
    amount_display?: string | null;
    reasons?: string[];
    eligibility?: string;
    effort?: string;
    collaborator_match_count?: number | null;
    requirements?: GrantRequirement[] | null;
    eligibility_json?: GrantEligibilityPayload | null;
    source_url?: string | null;
}

// Skeleton
const GrantCardSkeleton = () => (
    <div className="card p-6 space-y-4">
        <div className="flex justify-between">
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-24 rounded" />
        </div>
        <div className="skeleton h-6 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex gap-2">
            <div className="skeleton h-6 w-16 rounded-full" />
            <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="skeleton h-10 w-full rounded-full mt-4" />
    </div>
);

export default function GrantsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [scouting, setScouting] = useState(false);
    const [recommended, setRecommended] = useState<GrantCardData[]>([]);
    const [allGrants, setAllGrants] = useState<GrantCardData[]>([]);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [funder, setFunder] = useState('');
    const [deadline, setDeadline] = useState('');
    const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('all');

    const searchParams = useSearchParams();
    const handledStartRef = useRef<string | null>(null);

    useEffect(() => {
        fetchGrants();
    }, []);

    useEffect(() => {
        const startId = searchParams.get('start');
        if (!startId || handledStartRef.current === startId) {
            return;
        }
        handledStartRef.current = startId;
        startProject(startId);
    }, [searchParams]);

    const fetchGrants = async () => {
        try {
            const [matchRes, grantsRes] = await Promise.all([
                fetch('/api/grants/match', { method: 'POST' }),
                fetch('/api/grants'),
            ]);

            if (grantsRes.ok) {
                const { grants, lastUpdatedAt: lastUpdated } = await grantsRes.json();
                setAllGrants(grants || []);
                setLastUpdatedAt(lastUpdated || null);
            }

            if (matchRes.ok) {
                const { grants } = await matchRes.json();
                setRecommended(grants || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const goToWorkspace = (grantId: string) => {
        router.push(`/projects/demo?grantId=${encodeURIComponent(grantId)}`);
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
                router.push(`/projects/${data.project.id}`);
                return;
            }

            goToWorkspace(grantId);
        } catch (error) {
            console.error('Error creating project:', error);
            goToWorkspace(grantId);
        }
    };

    const runGrantScout = async () => {
        setScouting(true);
        try {
            const res = await fetch('/api/ai/scout', { method: 'POST' });
            if (res.status === 401) {
                router.push('/login?redirect=/grants');
                return;
            }
            const data = await res.json();
            if (data.success) {
                fetchGrants();
            }
        } catch (error) {
            console.error('Scout error:', error);
        } finally {
            setScouting(false);
        }
    };

    const filteredGrants = useMemo(() => {
        return allGrants.filter((grant) => {
            const matchesQuery =
                grant.title.toLowerCase().includes(query.toLowerCase()) ||
                grant.description?.toLowerCase().includes(query.toLowerCase());
            const matchesFunder = funder ? grant.funder?.toLowerCase().includes(funder.toLowerCase()) : true;
            const matchesDeadline = deadline ? grant.deadline?.startsWith(deadline) : true;
            return matchesQuery && matchesFunder && matchesDeadline;
        });
    }, [allGrants, query, funder, deadline]);

    const getDaysUntil = (deadline: string | null) => {
        if (!deadline) return null;
        const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : null;
    };

    const formatAmount = (min?: number | null, max?: number | null) => {
        if (!min && !max) return null;
        const format = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;
        if (min && max) return `${format(min)} - ${format(max)}`;
        if (max) return `Up to ${format(max)}`;
        return `From ${format(min!)}`;
    };

    const displayAmount = (grant: GrantCardData) => grant.amount_display || formatAmount(grant.amount_min, grant.amount_max);

    return (
        <AppShell>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl lg:text-4xl">Funding Opportunities</h1>
                        <p className="text-inkMuted mt-1">
                            Discover grants matched to your research profile
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={runGrantScout}
                            disabled={scouting}
                            className="btn-primary"
                        >
                            <SparklesIcon />
                            {scouting ? 'Scanning...' : 'Run Grant Scout'}
                        </button>
                        <button
                            onClick={fetchGrants}
                            className="btn-secondary"
                        >
                            <RefreshIcon />
                            Refresh
                        </button>
                    </div>
                </header>

                {lastUpdatedAt && (
                    <div className="text-xs text-inkMuted">
                        Last updated {new Date(lastUpdatedAt).toLocaleString()}
                    </div>
                )}

                {/* Search & Filters */}
                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <FilterIcon />
                        <span className="label">Filters</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="relative">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search grants..."
                                className="input pl-10"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-inkMuted pointer-events-none">
                                <SearchIcon />
                            </div>
                        </div>
                        <input
                            value={funder}
                            onChange={(e) => setFunder(e.target.value)}
                            placeholder="Filter by funder"
                            className="input"
                        />
                        <input
                            type="month"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            placeholder="Deadline"
                            className="input"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 bg-panel rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'all'
                                ? 'bg-surface shadow-sm text-ink'
                                : 'text-inkMuted hover:text-ink'
                        }`}
                    >
                        All Grants
                        {allGrants.length > 0 && (
                            <span className="ml-2 text-inkMuted">({filteredGrants.length})</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('recommended')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'recommended'
                                ? 'bg-surface shadow-sm text-ink'
                                : 'text-inkMuted hover:text-ink'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <SparklesIcon />
                            Recommended
                            {recommended.length > 0 && (
                                <span className="badge-teal text-2xs">{recommended.length}</span>
                            )}
                        </span>
                    </button>
                </div>

                {/* Grants Grid */}
                {loading ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => <GrantCardSkeleton key={i} />)}
                    </div>
                ) : activeTab === 'all' ? (
                    filteredGrants.length === 0 ? (
                        <div className="empty-state py-16">
                            <div className="w-16 h-16 rounded-2xl bg-panel flex items-center justify-center mb-4 text-inkMuted">
                                <SearchIcon />
                            </div>
                            <h3 className="font-serif text-lg mb-2">No grants found</h3>
                            <p className="text-inkMuted text-sm">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredGrants.map((grant, i) => (
                                <GrantCard
                                    key={grant.id}
                                    grant={grant}
                                    onStart={() => startProject(grant.id)}
                                    getDaysUntil={getDaysUntil}
                                    formatAmount={formatAmount}
                                    displayAmount={displayAmount}
                                    style={{ animationDelay: `${i * 30}ms` }}
                                />
                            ))}
                        </div>
                    )
                ) : loading ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="card p-6 space-y-4">
                                <div className="skeleton h-4 w-20 rounded" />
                                <div className="skeleton h-6 w-3/4 rounded" />
                                <div className="skeleton h-4 w-full rounded" />
                                <div className="skeleton h-9 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : recommended.length === 0 ? (
                    <div className="empty-state py-16">
                        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4 text-teal">
                            <SparklesIcon />
                        </div>
                        <h3 className="font-serif text-lg mb-2">No personalized recommendations yet</h3>
                        <p className="text-inkMuted text-sm mb-4 max-w-sm">
                            Complete your profile to get AI-matched grant recommendations.
                        </p>
                        <button onClick={() => router.push('/profile')} className="btn-primary">
                            Update Profile
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {recommended.map((grant, i) => (
                            <GrantCard
                                key={grant.id}
                                grant={grant}
                                isRecommended
                                onStart={() => startProject(grant.id)}
                                getDaysUntil={getDaysUntil}
                                formatAmount={formatAmount}
                                displayAmount={displayAmount}
                                style={{ animationDelay: `${i * 50}ms` }}
                            />
                        ))}
                    </div>
                )}

            </div>
        </AppShell>
    );
}

function GrantCard({
    grant,
    isRecommended,
    onStart,
    getDaysUntil,
    formatAmount,
    displayAmount,
    style,
}: {
    grant: GrantCardData;
    isRecommended?: boolean;
    onStart: () => void;
    getDaysUntil: (d: string | null) => number | null;
    formatAmount: (min?: number | null, max?: number | null) => string | null;
    displayAmount: (grant: GrantCardData) => string | null;
    style?: React.CSSProperties;
}) {
    const days = getDaysUntil(grant.deadline);
    const amount = displayAmount(grant);
    const requirementPayload = grant.eligibility_json || {};
    const requirements = grant.requirements || requirementPayload.requirements || [];
    const eligibility = grant.eligibility || requirementPayload.eligibility || 'Eligibility varies by program';
    const effort = grant.effort || requirementPayload.effort || 'Medium';
    const collaboratorCount = grant.collaborator_match_count ?? requirementPayload.collaborator_match_count;
    const deadlineLabel = grant.deadline_display || (grant.deadline ? new Date(grant.deadline).toLocaleDateString() : 'Rolling');

    const requirementRows = requirements.slice(0, 3);

    const requirementStyle = (status: RequirementStatus) => {
        if (status === 'yes') return 'text-success bg-sage-50';
        if (status === 'no') return 'text-error bg-coral-50';
        return 'text-inkMuted bg-panel';
    };

    const requirementIcon = (status: RequirementStatus) => {
        if (status === 'yes') return <CheckIcon />;
        if (status === 'no') return <XIcon />;
        return <MinusIcon />;
    };

    return (
        <div
            className={`card-hover flex flex-col p-6 animate-fade-up ${isRecommended ? 'ring-1 ring-teal/20' : ''}`}
            style={style}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <span className="badge-default">
                    {grant.funder || 'Independent'}
                </span>
                {isRecommended && (
                    <span className="badge-teal">
                        <SparklesIcon />
                        Match
                    </span>
                )}
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg text-ink mb-2 line-clamp-2">
                {grant.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-inkMuted line-clamp-2 mb-4">
                {grant.description}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {days && (
                    <div className={`flex items-center gap-1.5 text-sm ${days <= 14 ? 'text-error' : days <= 30 ? 'text-amber-600' : 'text-inkMuted'}`}>
                        <ClockIcon />
                        <span>{days}d left</span>
                    </div>
                )}
                <div className="text-xs text-inkMuted">
                    Deadline: <span className="text-ink">{deadlineLabel}</span>
                </div>
                {amount && (
                    <div className="text-xs text-inkMuted font-medium">
                        {amount}
                    </div>
                )}
            </div>

            {typeof collaboratorCount === 'number' && (
                <div className="flex items-center gap-2 text-xs text-inkMuted mb-4">
                    <span className="status-dot status-dot-success" />
                    {collaboratorCount} collaborator match{collaboratorCount === 1 ? '' : 'es'} found
                </div>
            )}

            {/* Requirements */}
            {requirementRows.length > 0 && (
                <div className="rounded-xl border border-border bg-panel/40 p-3 mb-4">
                    <div className="label mb-2">Key requirements</div>
                    <div className="space-y-2">
                        {requirementRows.map((req) => (
                            <div key={req.label} className="flex items-start gap-2 text-xs">
                                <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${requirementStyle(req.status)}`}>
                                    {requirementIcon(req.status)}
                                </span>
                                <span className="text-inkMuted">{req.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags */}
            {grant.tags && grant.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {grant.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="badge-default text-2xs">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Match reasons */}
            {isRecommended && grant.reasons && grant.reasons.length > 0 && (
                <div className="rounded-xl bg-teal-50/50 px-4 py-3 text-xs text-teal-700 mb-4">
                    {grant.reasons.slice(0, 2).join(' • ')}
                </div>
            )}

            <div className="flex flex-wrap gap-2 mb-5">
                <span className="badge-success text-2xs">{eligibility}</span>
                <span className="badge-amber text-2xs">Effort: {effort}</span>
                {grant.categories?.length ? (
                    <span className="badge-default text-2xs">{grant.categories[0]}</span>
                ) : null}
                {grant.source_url ? (
                    <a
                        href={grant.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="badge-default text-2xs hover:text-ink"
                    >
                        Source
                    </a>
                ) : null}
            </div>

            {/* CTA */}
            <button
                onClick={onStart}
                className="mt-auto btn-primary w-full group"
            >
                Start Application
                <ArrowRightIcon />
            </button>
        </div>
    );
}
