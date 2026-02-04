'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { CURATED_GRANTS } from '@/data/mock-grant-data';


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
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const mockTasks = [
  { title: 'Draft outline', status: 'in progress', due: 'Sep 18' },
  { title: 'Budget justification', status: 'todo', due: 'Sep 24' },
  { title: 'Collect biosketches', status: 'blocked', due: 'Sep 28' },
  { title: 'Finalize letters of support', status: 'todo', due: 'Oct 02' },
  { title: 'Internal compliance review', status: 'todo', due: 'Oct 05' },
];

const mockTeam = [
  { name: 'You', role: 'Principal Investigator', status: 'Editing' },
  { name: 'Dr. Maya Singh', role: 'Co-PI', status: 'Reviewing' },
  { name: 'Luis Ortega', role: 'Grants Specialist', status: 'Online' },
  { name: 'Hannah Park', role: 'Budget Analyst', status: 'Offline' },
];

const mockComments = [
  {
    author: 'Dr. Singh',
    note: 'Consider tightening the rationale in Aim 2 and linking to preliminary evidence.',
    time: '2h ago',
  },
  {
    author: 'Grants Office',
    note: 'Please upload the final biosketches by end of week for compliance review.',
    time: 'Yesterday',
  },
  {
    author: 'AI Reviewer',
    note: 'Eligibility check aligns with current program requirements.',
    time: 'Today',
  },
];

const mockDocs = [
  'Research Proposal',
  'Project Summary',
  'Specific Aims',
  'Broader Impacts',
  'Budget Justification',
  'Data Management Plan',
  'Facilities & Resources',
];

export default function DemoProjectPage() {
  const searchParams = useSearchParams();
  const grantParam = searchParams.get('grantId');
  const grant = useMemo(() => {
    if (!grantParam) return CURATED_GRANTS[0];
    return CURATED_GRANTS.find((item) => item.id === grantParam) || CURATED_GRANTS[0];
  }, [grantParam]);
  const projectTitle = grant.title;
  const [activePanel, setActivePanel] = useState<'readiness' | 'ai' | 'tasks' | 'team' | 'files'>('readiness');
  const [activeDoc, setActiveDoc] = useState(mockDocs[0]);

  const editorContent = useMemo(() => {
    if (!grant) return [] as string[];

    if (activeDoc === 'Project Summary') {
      return [
        grant.description,
        `Funding range: ${grant.amount_display || 'See solicitation'} | Funder: ${grant.funder}.`,
        `Deadline: ${grant.deadline_display || 'Standard due dates apply'}.`,
      ];
    }

    if (activeDoc === 'Specific Aims') {
      return [
        'Aim 1: Establish baseline data and validate preliminary findings.',
        'Aim 2: Deploy the core research workflow across two pilot environments.',
        'Aim 3: Evaluate outcomes, broader impacts, and dissemination strategy.',
      ];
    }

    if (activeDoc === 'Broader Impacts') {
      return [
        'Expand research training for early-career investigators and graduate researchers.',
        'Deliver open-source tools and workshops aligned with institutional partners.',
        'Engage stakeholders through public-facing webinars and policy briefs.',
      ];
    }

    if (activeDoc === 'Budget Justification') {
      return [
        'Personnel: PI summer salary, graduate research assistant, and part-time analyst.',
        'Equipment: compute and data storage to support research workflows.',
        'Travel: dissemination at two conferences and one program officer visit.',
      ];
    }

    if (activeDoc === 'Data Management Plan') {
      return [
        'Data will be stored in a secure institutional repository with access controls.',
        'Metadata and documentation will be published alongside de-identified datasets.',
        'Release schedule aligns with funder policy and project milestones.',
      ];
    }

    if (activeDoc === 'Facilities & Resources') {
      return [
        'Access to shared compute cluster and secured lab space for pilot studies.',
        'Dedicated support from research computing and compliance teams.',
        'Institutional commitments include matching graduate assistantship funding.',
      ];
    }

    return [
      grant.description,
      'This section details the research design, preliminary results, and validation plan.',
      'Milestones align with the funding period and compliance timeline.',
    ];
  }, [activeDoc, grant]);

  const requirementRows = grant.eligibility_json?.requirements || [];

  const amountLabel = useMemo(() => {
    if (grant.amount_display) return grant.amount_display;
    const min = grant.amount_min;
    const max = grant.amount_max;
    if (!min && !max) return 'Funding varies';
    const format = (value: number) => (value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : `$${Math.round(value / 1000)}K`);
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (max) return `Up to ${format(max)}`;
    return `From ${format(min ?? 0)}`;
  }, [grant]);

  const milestones = useMemo(
    () => [
      { title: 'Submission-ready draft', due: 'May 20' },
      { title: 'Internal compliance review', due: 'Jun 12' },
      { title: 'Finalize letters of support', due: 'Jul 01' },
      { title: 'Sponsor submission window', due: grant.deadline_display || 'Jul 22' },
    ],
    [grant]
  );

  const panels = useMemo(
    () => [
      { id: 'readiness', label: 'Readiness', icon: '✓' },
      { id: 'ai', label: 'AI Tools', icon: <SparklesIcon /> },
      { id: 'tasks', label: 'Tasks', icon: '☐' },
      { id: 'team', label: 'Team', icon: <UsersIcon /> },
      { id: 'files', label: 'Files', icon: '📎' },
    ],
    []
  );

  return (
    <AppShell fullWidth>
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-teal-100 bg-teal-50 px-6 py-4 text-teal-900">
          <div className="text-xs uppercase tracking-[0.2em]">Workspace Overview</div>
          <div className="mt-1 text-sm">
            Collaboration status: active. Autosave enabled, last sync 2 minutes ago.
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="label">Project Workspace</div>
                <div className="flex flex-col gap-3">
                  <h1 className="font-serif text-3xl lg:text-4xl leading-tight">{projectTitle}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-inkMuted">
                    <span className="badge-default">{grant.funder}</span>
                    <span className="badge-default">{grant.categories?.[0] || 'Research'}</span>
                    <span className="badge-default">{amountLabel}</span>
                    <span className="badge-default">Next due {grant.deadline_display || 'Rolling'}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] items-stretch">
                <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Status</div>
                  <div className="mt-2 text-base font-medium text-ink">Draft in review</div>
                  <div className="text-xs text-inkMuted mt-1">Last synced 2 min ago</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Match</div>
                  <div className="mt-2 flex items-center gap-2 text-base font-medium text-ink">
                    <SparklesIcon />
                    86% confidence
                  </div>
                  <div className="text-xs text-inkMuted mt-1">3 collaborators aligned</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Submission</div>
                  <div className="mt-2 flex items-center gap-2 text-base font-medium text-amber-700">
                    <ClockIcon />
                    {grant.deadline_display || 'Rolling'}
                  </div>
                  <div className="text-xs text-inkMuted mt-1">Internal deadline: 2 weeks prior</div>
                </div>
                <div className="flex flex-wrap gap-2 items-center justify-start lg:justify-end">
                  <button className="btn-primary" disabled>
                    <DownloadIcon />
                    Export
                  </button>
                  <button className="btn-secondary" disabled>
                    <ShareIcon />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 bg-panel">
            <div className="h-full bg-teal transition-all duration-500" style={{ width: '35%' }} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr_360px]">
          <div className="card p-4 h-fit lg:sticky lg:top-24">
            <div className="label mb-3">Documents</div>
            <div className="space-y-2">
              {mockDocs.map((doc) => (
                <button
                  key={doc}
                  onClick={() => setActiveDoc(doc)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    activeDoc === doc ? 'bg-tealSoft text-teal' : 'bg-panel text-inkMuted hover:text-ink'
                  }`}
                >
                  {doc}
                </button>
              ))}
            </div>
          </div>

            <div className="card flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-xl">{activeDoc}</h2>
                  <span className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                    In review
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C'].map((initial, i) => (
                      <div key={i} className="avatar avatar-sm border-2 border-surface">
                        {initial}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-inkMuted">3 editing</span>
                </div>
              </div>

            <div className="flex-1 bg-panel/30 px-8 py-10">
              <div className="mx-auto space-y-12 max-w-[1120px]">
                <div className="w-full min-h-[1120px] rounded-2xl border border-border/60 bg-surface px-16 py-14 text-sm text-ink shadow-sm">
                  <div className="flex items-center justify-between text-xs text-inkMuted">
                    <span>Draft proposal</span>
                    <span>Page 1</span>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-ink">{activeDoc}</h3>
                  <p className="mt-2 text-xs text-inkMuted">{grant.title} · {grant.funder}</p>
                  <div className="mt-6 space-y-4 leading-relaxed text-inkMuted">
                    {editorContent.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Key requirements</div>
                      <ul className="mt-3 space-y-2">
                        {requirementRows.slice(0, 4).map((req) => (
                          <li key={req.label} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-teal" />
                            <span>{req.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-10 border-t border-dashed border-border pt-4 text-xs text-inkMuted">
                    Prepared for {grant.funder} · Deadline {grant.deadline_display || 'TBD'}
                  </div>
                </div>

                <div className="w-full min-h-[1120px] rounded-2xl border border-border/60 bg-surface px-16 py-14 text-sm text-ink shadow-sm">
                  <div className="flex items-center justify-between text-xs text-inkMuted">
                    <span>Draft proposal</span>
                    <span>Page 2</span>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-ink">Methods & Milestones</h3>
                  <p className="mt-2 text-xs text-inkMuted">Aligned to {grant.deadline_display || 'standard due dates'}</p>
                  <div className="mt-6 space-y-4 leading-relaxed text-inkMuted">
                    <p>
                      The research plan details the methodological approach, evaluation metrics, and risk mitigation
                      strategy. Preliminary results support feasibility, and partner institutions have committed
                      resources to execute the work on schedule.
                    </p>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Milestones</div>
                      <ul className="mt-3 space-y-2">
                        {milestones.map((milestone) => (
                          <li key={milestone.title} className="flex items-center justify-between">
                            <span>{milestone.title}</span>
                            <span className="text-inkMuted">{milestone.due}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-10 border-t border-dashed border-border pt-4 text-xs text-inkMuted">
                    Section owner: PI team · Last edited 2 minutes ago
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-[860px] rounded-xl bg-panel/60 p-4 text-xs text-inkMuted">
                Latest updates: Eligibility checklist aligned, budget template refreshed, milestones synced to submission timeline.
              </div>
            </div>
            <div className="px-6 py-3 border-t border-border bg-panel/30">
              <div className="flex items-center gap-2 text-xs text-inkMuted">
                <SparklesIcon />
                <span>Type / for AI commands</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
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

            <div className="card p-4">
              {activePanel === 'readiness' && (
                <div className="space-y-3 text-sm text-inkMuted">
                  <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Eligibility</div>
                  {grant.eligibility_json?.requirements?.map((req) => (
                    <div key={req.label} className="flex items-center justify-between">
                      <span>{req.label}</span>
                      <span className={req.status === 'yes' ? 'text-teal' : req.status === 'no' ? 'text-error' : 'text-inkMuted'}>
                        {req.status === 'yes' ? 'Complete' : req.status === 'no' ? 'Ineligible' : 'Review'}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border text-xs text-inkMuted">Submission deadlines</div>
                  <div className="flex items-center justify-between">
                    <span>Next due date</span>
                    <span className="text-ink">{grant.deadline_display || 'Standard due dates apply'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Funding range</span>
                    <span className="text-ink">{grant.amount_display || 'See solicitation'}</span>
                  </div>
                </div>
              )}
              {activePanel === 'ai' && (
                <div className="space-y-3 text-sm text-inkMuted">
                  <div className="rounded-xl bg-teal-50/50 p-3 text-teal-700">
                    AI reviewer suggests clarifying the broader impacts narrative and adding a data-sharing plan.
                  </div>
                  <div className="rounded-xl bg-panel p-3">
                    Generate a compliance summary for {grant.title} requirements.
                  </div>
                </div>
              )}
              {activePanel === 'tasks' && (
                <div className="space-y-3">
                  {mockTasks.map((task) => (
                    <div key={task.title} className="flex items-center justify-between text-sm">
                      <span className="text-ink">{task.title}</span>
                      <span className="text-inkMuted">{task.due}</span>
                    </div>
                  ))}
                  <div className="rounded-xl bg-panel px-3 py-2 text-xs text-inkMuted">
                    Milestones synced to deadline {grant.deadline_display || 'TBD'}.
                  </div>
                  <div className="pt-2 border-t border-border text-xs text-inkMuted">Upcoming milestones</div>
                  <div className="space-y-2">
                    {milestones.map((milestone) => (
                      <div key={milestone.title} className="flex items-center justify-between text-sm">
                        <span className="text-ink">{milestone.title}</span>
                        <span className="text-inkMuted">{milestone.due}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activePanel === 'team' && (
                <div className="space-y-3">
                  {mockTeam.map((member) => (
                    <div key={member.name} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-ink font-medium">{member.name}</div>
                        <div className="text-xs text-inkMuted">{member.role}</div>
                      </div>
                      <span className="text-xs text-inkMuted">{member.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {activePanel === 'files' && (
                <div className="space-y-3 text-sm text-inkMuted">
                  <div className="rounded-xl bg-panel px-3 py-2">Biosketches.zip</div>
                  <div className="rounded-xl bg-panel px-3 py-2">Budget.xlsx</div>
                  <div className="rounded-xl bg-panel px-3 py-2">Letters_of_support.pdf</div>
                  <div className="rounded-xl bg-panel px-3 py-2">Compliance_Checklist.pdf</div>
                  <div className="rounded-xl bg-panel px-3 py-2">Data_Management_Plan.docx</div>
                  <div className="rounded-xl bg-panel px-3 py-2">Facilities_Resources.pdf</div>
                </div>
              )}
            </div>

            <div className="card p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Comments</div>
              <div className="mt-3 space-y-3">
                {mockComments.map((comment) => (
                  <div key={comment.note} className="rounded-xl bg-panel/60 p-3 text-sm">
                    <div className="text-ink font-medium">{comment.author}</div>
                    <div className="text-xs text-inkMuted">{comment.time}</div>
                    <p className="mt-2 text-inkMuted">{comment.note}</p>
                  </div>
                ))}
              </div>
            </div>

             <div className="card p-4 text-xs text-inkMuted">
               Project access is managed by your institution's grants office.
             </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
