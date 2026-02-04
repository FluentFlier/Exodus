'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { getStatusBreakdown, getTotalFunding, getTimelineData, MOCK_PROJECTS } from '@/lib/mockData';

// Icons
const ChartIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface AnalyticsData {
  totals: {
    projects: number;
    grants: number;
    tasks: number;
  };
  breakdown: {
    status: Record<string, number>;
  };
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-inkMuted', bgColor: 'bg-panel' },
  in_progress: { label: 'In Progress', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  submitted: { label: 'Submitted', color: 'text-sage', bgColor: 'bg-sage-100' },
  awarded: { label: 'Awarded', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  rejected: { label: 'Rejected', color: 'text-coral-600', bgColor: 'bg-coral-100' },
};

// Get enhanced data from mock data helpers
const MOCK_ENHANCED_DATA = {
  timeline: getTimelineData(),
  funding: getTotalFunding(),
  ai_usage: {
    compliance_checks: 47,
    review_runs: 32,
    copilot_suggestions: 156,
  },
  upcoming_deadlines: MOCK_PROJECTS
    .filter(p => p.grants?.deadline && new Date(p.grants.deadline) > new Date())
    .sort((a, b) => new Date(a.grants!.deadline!).getTime() - new Date(b.grants!.deadline!).getTime())
    .slice(0, 3)
    .map(p => ({
      grant: p.grants!.title!,
      days: Math.ceil((new Date(p.grants!.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      amount: (p.grants!.amount_min + p.grants!.amount_max) / 2,
    })),
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use mock data directly instead of fetching from API
    // This ensures consistency with Projects page which also uses MOCK_PROJECTS
    setTimeout(() => {
      const mockData: AnalyticsData = {
        totals: {
          projects: MOCK_PROJECTS.length,
          grants: MOCK_PROJECTS.filter(p => p.grants).length,
          tasks: 18,
        },
        breakdown: {
          status: getStatusBreakdown(),
        },
      };
      setData(mockData);
      setLoading(false);
    }, 500);
  }, []);

  const totalProjects = data?.totals?.projects ?? MOCK_PROJECTS.length;
  const statusBreakdown = data?.breakdown?.status || getStatusBreakdown();
  const totalStatusCount = Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1;
  const fundingData = MOCK_ENHANCED_DATA.funding;
  const successRate = Math.round((fundingData.awarded / fundingData.requested) * 100);

  const statusEntries = Object.entries(statusBreakdown);
  const percentageMap = (() => {
    if (statusEntries.length === 0) return {} as Record<string, number>;

    const raw = statusEntries.map(([status, count]) => {
      const ratio = totalStatusCount ? (count / totalStatusCount) * 100 : 0;
      const floor = Math.floor(ratio);
      return { status, floor, fraction: ratio - floor };
    });

    let remaining = 100 - raw.reduce((sum, item) => sum + item.floor, 0);
    const sorted = [...raw].sort((a, b) => b.fraction - a.fraction);

    for (let i = 0; i < remaining; i += 1) {
      sorted[i % sorted.length].floor += 1;
    }

    return sorted.reduce((acc, item) => {
      acc[item.status] = item.floor;
      return acc;
    }, {} as Record<string, number>);
  })();

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <header>
          <h1 className="font-serif text-3xl lg:text-4xl">Analytics</h1>
          <p className="text-inkMuted mt-1">Track your grant pipeline and submission readiness.</p>
        </header>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-teal-50">
                <FolderIcon />
              </div>
              <span className="text-sm text-inkMuted font-medium">Total Projects</span>
            </div>
            {loading ? (
              <div className="skeleton h-10 w-16 rounded" />
            ) : (
              <div className="font-serif text-4xl text-ink">{data?.totals?.projects ?? 0}</div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-50">
                <SparklesIcon />
              </div>
              <span className="text-sm text-inkMuted font-medium">Available Grants</span>
            </div>
            {loading ? (
              <div className="skeleton h-10 w-16 rounded" />
            ) : (
              <div className="font-serif text-4xl text-ink">{data?.totals?.grants ?? 0}</div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-sage-50">
                <CheckIcon />
              </div>
              <span className="text-sm text-inkMuted font-medium">Tasks</span>
            </div>
            {loading ? (
              <div className="skeleton h-10 w-16 rounded" />
            ) : (
              <div className="font-serif text-4xl text-ink">{data?.totals?.tasks ?? 0}</div>
            )}
          </div>
        </div>

        {/* Project Status Breakdown */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <ChartIcon />
            <h2 className="font-serif text-xl">Project Pipeline</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-4 w-24 rounded" />
                  <div className="skeleton h-6 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : Object.keys(statusBreakdown).length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-panel flex items-center justify-center mx-auto mb-4">
                <ChartIcon />
              </div>
              <p className="text-inkMuted">No project data yet. Start your first project to see analytics.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {statusEntries.map(([status, count]) => {
                const config = statusConfig[status] || { label: status, color: 'text-inkMuted', bgColor: 'bg-panel' };
                const percentage = percentageMap[status] ?? 0;

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${config.bgColor} border-2 border-current ${config.color}`} />
                        <span className="text-sm font-medium capitalize">{config.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-inkMuted">{count} project{count !== 1 ? 's' : ''}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bgColor} ${config.color}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-4 bg-surface border border-panel rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${config.bgColor} shadow-sm`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats Summary */}
        <div className="card p-6">
          <h2 className="font-serif text-xl mb-4">Pipeline Summary</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-panel/50">
              <div className="text-2xs uppercase tracking-wider text-inkMuted mb-1">Active</div>
              <div className="font-serif text-2xl">
                {loading ? '—' : (statusBreakdown['in_progress'] || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-panel/50">
              <div className="text-2xs uppercase tracking-wider text-inkMuted mb-1">Drafts</div>
              <div className="font-serif text-2xl">
                {loading ? '—' : (statusBreakdown['draft'] || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-panel/50">
              <div className="text-2xs uppercase tracking-wider text-inkMuted mb-1">Submitted</div>
              <div className="font-serif text-2xl">
                {loading ? '—' : (statusBreakdown['submitted'] || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-panel/50">
              <div className="text-2xs uppercase tracking-wider text-inkMuted mb-1">Awarded</div>
              <div className="font-serif text-2xl text-amber-600">
                {loading ? '—' : (statusBreakdown['awarded'] || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Funding Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-6 bg-gradient-to-br from-teal-50 to-surface">
            <div className="text-xs uppercase tracking-wider text-teal-700 mb-1">Total Requested</div>
            <div className="font-serif text-3xl text-ink mb-1">
              ${(fundingData.requested / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-inkMuted">Across {totalProjects} applications</div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-amber-50 to-surface">
            <div className="text-xs uppercase tracking-wider text-amber-700 mb-1">Total Awarded</div>
            <div className="font-serif text-3xl text-ink mb-1">
              ${(fundingData.awarded / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-inkMuted">From {MOCK_ENHANCED_DATA.timeline.reduce((sum, m) => sum + m.awarded, 0)} successful grants</div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-sage-50 to-surface">
            <div className="text-xs uppercase tracking-wider text-sage-700 mb-1">Success Rate</div>
            <div className="font-serif text-3xl text-ink mb-1">
              {successRate}%
            </div>
            <div className="text-xs text-inkMuted">Above national avg (18-22%)</div>
          </div>
        </div>

        {/* Submission Timeline */}
        <div className="card p-6">
          <h2 className="font-serif text-xl mb-6">Submission Timeline</h2>
          <div className="flex items-end justify-between gap-3 h-48">
            {MOCK_ENHANCED_DATA.timeline.map((month, i) => {
              const maxVal = Math.max(...MOCK_ENHANCED_DATA.timeline.map(m => m.proposals));
              const proposalHeight = (month.proposals / maxVal) * 100;
              const awardedHeight = (month.awarded / maxVal) * 100;

              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 flex-1">
                    {/* Proposals bar */}
                    <div className="relative flex-1 flex flex-col justify-end">
                      <div
                        className="bg-teal/30 rounded-t-lg transition-all duration-500 hover:bg-teal/50"
                        style={{ height: `${proposalHeight}%` }}
                      />
                      {month.proposals > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-ink">
                          {month.proposals}
                        </div>
                      )}
                    </div>
                    {/* Awarded bar */}
                    <div className="relative flex-1 flex flex-col justify-end">
                      <div
                        className="bg-amber rounded-t-lg transition-all duration-500 hover:bg-amber-600"
                        style={{ height: `${awardedHeight}%` }}
                      />
                      {month.awarded > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-amber-700">
                          {month.awarded}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-inkMuted font-medium">{month.month}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-teal/30" />
              <span className="text-xs text-inkMuted">Proposals Submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber" />
              <span className="text-xs text-inkMuted">Grants Awarded</span>
            </div>
          </div>
        </div>

        {/* AI Agent Usage */}
        <div className="card p-6">
          <h2 className="font-serif text-xl mb-6">AI Agent Activity</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-inkMuted">Compliance Checks</span>
                <span className="text-sm font-medium">{MOCK_ENHANCED_DATA.ai_usage.compliance_checks}</span>
              </div>
              <div className="h-2 bg-panel rounded-full overflow-hidden">
                <div className="h-full bg-amber rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-inkMuted">Critical Reviews</span>
                <span className="text-sm font-medium">{MOCK_ENHANCED_DATA.ai_usage.review_runs}</span>
              </div>
              <div className="h-2 bg-panel rounded-full overflow-hidden">
                <div className="h-full bg-sage rounded-full" style={{ width: '51%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-inkMuted">Co-Pilot Suggestions Used</span>
                <span className="text-sm font-medium">{MOCK_ENHANCED_DATA.ai_usage.copilot_suggestions}</span>
              </div>
              <div className="h-2 bg-panel rounded-full overflow-hidden">
                <div className="h-full bg-violet rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-violet-50 border border-violet-200">
            <div className="text-sm font-medium text-violet-900">AI Productivity Boost</div>
            <div className="text-xs text-violet-700 mt-1">
              Saved an estimated <strong>38 hours</strong> of writing and review time this month
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card p-6">
          <h2 className="font-serif text-xl mb-6">Upcoming Deadlines</h2>
          <div className="space-y-3">
            {MOCK_ENHANCED_DATA.upcoming_deadlines.map((deadline, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-panel/50 hover:bg-panel transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-ink">{deadline.grant}</div>
                  <div className="text-xs text-inkMuted mt-1">
                    ${(deadline.amount / 1000).toLocaleString()}K funding
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-medium ${deadline.days <= 30 ? 'bg-coral-50 text-coral-600' :
                  deadline.days <= 60 ? 'bg-amber-50 text-amber-600' :
                    'bg-teal-50 text-teal-600'
                  }`}>
                  {deadline.days} days
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="card p-6 bg-gradient-to-br from-teal-50/50 to-surface">
          <h2 className="font-serif text-lg mb-3">Tips for Success</h2>
          <ul className="space-y-2 text-sm text-inkMuted">
            <li className="flex items-start gap-2">
              <span className="text-teal mt-0.5">•</span>
              Complete your research profile to get better grant matches
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal mt-0.5">•</span>
              Use AI Review to get feedback before submitting
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal mt-0.5">•</span>
              Check compliance requirements early in your writing process
            </li>
          </ul>
        </div>
      </div>
    </AppShell >
  );
}
