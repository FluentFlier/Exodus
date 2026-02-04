'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { MOCK_PROJECTS, type MockProject } from '@/lib/mockData';

// Icons
const FilterIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
);

interface Project {
  id: string;
  title: string | null;
  status: string | null;
  grant_id?: string | null;
  grants?: {
    title?: string | null;
    funder?: string | null;
    deadline?: string | null;
  } | null;
}

type StatusFilter = 'all' | 'in_progress' | 'completed' | 'declined';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-inkMuted', bgColor: 'bg-panel' },
  in_progress: { label: 'In Progress', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  submitted: { label: 'Submitted', color: 'text-sage-700', bgColor: 'bg-sage-100' },
  awarded: { label: 'Awarded', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  declined: { label: 'Declined', color: 'text-coral-600', bgColor: 'bg-coral-100' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
      } else {
        // Use centralized mock data
        setProjects(MOCK_PROJECTS);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Fallback to mock data on error
      setProjects(MOCK_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on status
  const filteredProjects = projects.filter((project) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'in_progress') return project.status === 'in_progress' || project.status === 'draft';
    if (statusFilter === 'completed') return project.status === 'awarded' || project.status === 'submitted';
    if (statusFilter === 'declined') return project.status === 'declined';
    return true;
  });

  // Status counts
  const statusCounts = {
    all: projects.length,
    in_progress: projects.filter(p => p.status === 'in_progress' || p.status === 'draft').length,
    completed: projects.filter(p => p.status === 'awarded' || p.status === 'submitted').length,
    declined: projects.filter(p => p.status === 'declined').length,
  };

  const getStatusColor = (status: string | null) => {
    const config = statusConfig[status || 'draft'];
    return config || statusConfig.draft;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl">Your Projects</h1>
              <p className="text-sm text-inkMuted">Track active applications and submissions.</p>
            </div>
            <Link
              href="/grants"
              className="rounded-full bg-teal px-4 py-2 text-sm text-white hover:bg-teal-600 transition-colors"
            >
              Start new application
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-inkMuted">
              <FilterIcon />
              <span className="font-medium">Filter:</span>
            </div>
            {[
              { key: 'all' as StatusFilter, label: 'All Projects' },
              { key: 'in_progress' as StatusFilter, label: 'Active' },
              { key: 'completed' as StatusFilter, label: 'Completed' },
              { key: 'declined' as StatusFilter, label: 'Declined' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === filter.key
                    ? 'bg-teal-50 text-teal border-2 border-teal'
                    : 'bg-panel text-inkMuted hover:bg-panel/80 border-2 border-transparent'
                  }`}
              >
                {filter.label}
                {statusCounts[filter.key] > 0 && (
                  <span className={`ml-1.5 ${statusFilter === filter.key ? 'text-teal-600' : 'text-inkSubtle'}`}>
                    ({statusCounts[filter.key]})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-inkMuted">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-panel mb-4">
              <svg className="h-8 w-8 text-inkMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg mb-2">No {statusFilter !== 'all' && statusFilter} projects</h3>
            <p className="text-inkMuted text-sm mb-4 max-w-sm mx-auto">
              {statusFilter === 'all'
                ? 'Start your first grant application by browsing available opportunities.'
                : `You don't have any ${statusFilter.replace('_', ' ')} projects yet.`}
            </p>
            <Link href="/grants" className="btn-primary">
              Browse Grants
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredProjects.map((project) => {
              const config = getStatusColor(project.status);
              const targetHref = project.grants?.title === 'NSF CAREER: Faculty Early Career Development Program'
                ? `/projects/demo?grantId=${encodeURIComponent(project.grant_id || '')}`
                : `/projects/${project.id}`;

              return (
                <Link key={project.id} href={targetHref} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                    {project.grants?.deadline && (() => {
                      const days = Math.ceil((new Date(project.grants.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      if (days > 0 && days <= 60) {
                        return (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                            {days}d left
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <h2 className="font-serif text-xl text-ink line-clamp-1 mb-2">
                    {project.title || 'Untitled Project'}
                  </h2>

                  <div className="text-sm text-inkMuted line-clamp-2 mb-4">
                    {project.grants?.title || 'General Application'}
                  </div>

                  {project.grants?.funder && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-md bg-panel text-2xs font-medium text-inkMuted">
                        {project.grants.funder}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
