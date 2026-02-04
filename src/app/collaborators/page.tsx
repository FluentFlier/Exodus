'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { ASU_FACULTY, ASU_SERVICES } from '@/data/university-index';

interface Profile {
  id: string;
  full_name: string | null;
  institution: string | null;
  tags: string[] | null;
  methods: string[] | null;
  collab_roles: string[] | null;
  availability: string | null;
  headline: string | null;
  bio: string | null;
  source?: string | null;
}

export default function CollaboratorsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState('');
  const [role, setRole] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'asu-faculty' | 'asu-services'>('asu-faculty');

  useEffect(() => {
    refreshCollaborators();
  }, []);

  const refreshCollaborators = () => {
    fetch('/api/collaborators')
      .then((res) => res.json())
      .then((data) => {
        if (data.profiles && data.profiles.length > 0) {
          setProfiles(data.profiles || []);
          return;
        }
        setProfiles([
          {
            id: 'mock-1',
            full_name: 'Dr. Maya Singh',
            institution: 'Stanford University',
            tags: ['Machine Learning', 'AI Ethics'],
            methods: ['Deep Learning', 'Human-Centered AI'],
            collab_roles: ['co-pi'],
            availability: 'medium',
            headline: 'AI systems researcher open to CAREER collaborations',
            bio: 'Focus on trustworthy ML, interpretability, and evaluation frameworks for public sector deployments.',
            source: 'Directory',
          },
          {
            id: 'mock-2',
            full_name: 'Luis Ortega',
            institution: 'Arizona State University',
            tags: ['Data Management', 'Policy'],
            methods: ['Mixed Methods', 'Survey Design'],
            collab_roles: ['methods-expert'],
            availability: 'high',
            headline: 'Quant + qual methods expert for grant narratives',
            bio: 'Specializes in research design, metrics, and evaluation planning for NSF/NIH proposals.',
            source: 'Directory',
          },
          {
            id: 'mock-3',
            full_name: 'Prof. Elena Morozov',
            institution: 'University of Michigan',
            tags: ['Cybersecurity', 'Resilience'],
            methods: ['Risk Modeling', 'Systems Analysis'],
            collab_roles: ['domain-expert'],
            availability: 'low',
            headline: 'Resilience and security co-PI',
            bio: 'Works on resilient infrastructure and applied cybersecurity for critical systems.',
            source: 'Directory',
          },
        ]);
      })
      .catch((error) => {
        console.error('Failed to load collaborators:', error);
        setProfiles([
          {
            id: 'mock-1',
            full_name: 'Dr. Maya Singh',
            institution: 'Stanford University',
            tags: ['Machine Learning', 'AI Ethics'],
            methods: ['Deep Learning', 'Human-Centered AI'],
            collab_roles: ['co-pi'],
            availability: 'medium',
            headline: 'AI systems researcher open to CAREER collaborations',
            bio: 'Focus on trustworthy ML, interpretability, and evaluation frameworks for public sector deployments.',
            source: 'Directory',
          },
          {
            id: 'mock-2',
            full_name: 'Luis Ortega',
            institution: 'Arizona State University',
            tags: ['Data Management', 'Policy'],
            methods: ['Mixed Methods', 'Survey Design'],
            collab_roles: ['methods-expert'],
            availability: 'high',
            headline: 'Quant + qual methods expert for grant narratives',
            bio: 'Specializes in research design, metrics, and evaluation planning for NSF/NIH proposals.',
            source: 'Directory',
          },
          {
            id: 'mock-3',
            full_name: 'Prof. Elena Morozov',
            institution: 'University of Michigan',
            tags: ['Cybersecurity', 'Resilience'],
            methods: ['Risk Modeling', 'Systems Analysis'],
            collab_roles: ['domain-expert'],
            availability: 'low',
            headline: 'Resilience and security co-PI',
            bio: 'Works on resilient infrastructure and applied cybersecurity for critical systems.',
            source: 'Directory',
          },
        ]);
      });
  };

  const seedDirectory = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/collaborators/seed', { method: 'POST' });
      if (res.status === 401) {
        alert('Please sign in to seed collaborators.');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to seed collaborators');
        return;
      }
      refreshCollaborators();
    } catch (error) {
      console.error('Seed error', error);
      alert('Failed to seed collaborators');
    } finally {
      setSeeding(false);
    }
  };

  const filtered = profiles.filter((profile) => {
    const search = query.toLowerCase();
    const tagSearch = tagFilter.toLowerCase();
    const matchesSearch =
      profile.full_name?.toLowerCase().includes(search) ||
      profile.headline?.toLowerCase().includes(search) ||
      profile.tags?.some((tag) => tag.toLowerCase().includes(search)) ||
      profile.methods?.some((method) => method.toLowerCase().includes(search));

    const matchesAvailability = availability ? profile.availability === availability : true;
    const matchesRole = role ? profile.collab_roles?.includes(role) : true;
    const matchesTag = tagSearch
      ? profile.tags?.some((tag) => tag.toLowerCase().includes(tagSearch)) ||
        profile.methods?.some((method) => method.toLowerCase().includes(tagSearch))
      : true;

    return matchesSearch && matchesAvailability && matchesRole && matchesTag;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl">Collaborators & University Resources</h1>
              <p className="text-sm text-inkMuted">Find ASU faculty, research services, and collaborators.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={seedDirectory}
                disabled={seeding}
                className="rounded-full bg-teal px-4 py-2 text-sm text-white"
              >
                {seeding ? 'Seeding...' : 'Seed directory'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2 border-b border-border pb-0">
            <button
              onClick={() => setActiveTab('asu-faculty')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'asu-faculty'
                  ? 'border-teal text-teal'
                  : 'border-transparent text-inkMuted hover:text-ink'
              }`}
            >
              Suggested Collaborators ({ASU_FACULTY.length})
            </button>
            <button
              onClick={() => setActiveTab('asu-services')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'asu-services'
                  ? 'border-violet text-violet'
                  : 'border-transparent text-inkMuted hover:text-ink'
              }`}
            >
              ASU Services ({ASU_SERVICES.length})
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'general'
                  ? 'border-amber text-amber'
                  : 'border-transparent text-inkMuted hover:text-ink'
              }`}
            >
              All Collaborators ({profiles.length})
            </button>
          </div>
          {activeTab === 'general' && (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or topic"
              className="w-full rounded-xl border border-border bg-panel px-4 py-2 text-sm"
            />
            <input
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder="Filter by tag or method"
              className="w-full rounded-xl border border-border bg-panel px-4 py-2 text-sm"
            />
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full rounded-xl border border-border bg-panel px-4 py-2 text-sm"
            >
              <option value="">Availability</option>
              <option value="low">Low availability</option>
              <option value="medium">Medium availability</option>
              <option value="high">High availability</option>
            </select>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-border bg-panel px-4 py-2 text-sm md:col-span-1"
            >
              <option value="">Collaboration role</option>
              <option value="co-pi">Co-PI</option>
              <option value="domain-expert">Domain expert</option>
              <option value="methods-expert">Methods expert</option>
              <option value="writing">Writing/editing</option>
              <option value="budget">Budget support</option>
            </select>
          </div>
          )}
        </div>

        {/* ASU Faculty Tab */}
        {activeTab === 'asu-faculty' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ASU_FACULTY.map((faculty) => (
              <div key={faculty.id} className="card p-6 hover:border-teal/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif text-lg truncate">{faculty.name}</h2>
                    <p className="text-xs text-inkMuted">{faculty.title}</p>
                    <p className="text-xs text-inkMuted">{faculty.department}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                    faculty.availability === 'open' ? 'bg-teal' :
                    faculty.availability === 'limited' ? 'bg-amber' : 'bg-panel'
                  }`} />
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {faculty.expertise.slice(0, 3).map(exp => (
                    <span key={exp} className="px-2 py-0.5 rounded-md bg-panel text-2xs text-ink">
                      {exp}
                    </span>
                  ))}
                </div>

                {faculty.citations && (
                  <div className="flex items-center gap-4 text-2xs text-inkMuted mb-3 pb-3 border-b border-border">
                    <span>{faculty.citations.toLocaleString()} citations</span>
                    {faculty.h_index && <span>h-index: {faculty.h_index}</span>}
                  </div>
                )}

                {faculty.collaboration_interests && (
                  <div className="mb-3">
                    <p className="text-2xs text-inkMuted mb-1">Open to:</p>
                    <div className="flex flex-wrap gap-1">
                      {faculty.collaboration_interests.slice(0, 2).map(interest => (
                        <span key={interest} className="px-2 py-0.5 rounded-md bg-teal-50 text-2xs text-teal-700">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <a
                    href={`mailto:${faculty.email}`}
                    className="btn-ghost btn-sm flex-1 text-center"
                  >
                    Email
                  </a>
                  {faculty.website && (
                    <a
                      href={faculty.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost btn-sm flex-1 text-center"
                    >
                      Profile
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ASU Services Tab */}
        {activeTab === 'asu-services' && (
          <div className="grid gap-4 md:grid-cols-2">
            {ASU_SERVICES.map((service) => (
              <div key={service.id} className="card p-6 hover:border-violet/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="inline-block px-2 py-1 rounded-md bg-violet-50 text-violet-700 text-2xs font-medium mb-2 capitalize">
                      {service.type.replace('_', ' ')}
                    </div>
                    <h2 className="font-serif text-lg">{service.name}</h2>
                  </div>
                </div>

                <p className="text-sm text-inkMuted mb-4">{service.description}</p>

                <div className="mb-4">
                  <p className="text-2xs text-inkMuted mb-2">Capabilities:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {service.capabilities.slice(0, 5).map(cap => (
                      <span key={cap} className="px-2 py-0.5 rounded-md bg-panel text-2xs text-ink">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {service.cost_structure && (
                  <div className="mb-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-xs text-amber-700">💰 {service.cost_structure}</p>
                  </div>
                )}

                <div className="text-xs text-inkMuted mb-4">
                  <span className="font-medium">Contact:</span> {service.contact_person}
                </div>

                <div className="flex gap-2">
                  <a
                    href={`mailto:${service.contact_email}`}
                    className="btn-ghost btn-sm flex-1 text-center"
                  >
                    Email
                  </a>
                  {service.website && (
                    <a
                      href={service.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary btn-sm flex-1 text-center"
                    >
                      Learn More
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* General Collaborators Tab */}
        {activeTab === 'general' && (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((profile) => (
            <div key={profile.id} className="card p-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-inkMuted">
                <span>{profile.availability || 'Availability unknown'}</span>
                <span>
                  {profile.source || 'Directory'}
                  {profile.collab_roles?.length ? ` • ${profile.collab_roles.slice(0, 2).join(', ')}` : ''}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-lg">{profile.full_name || 'Unnamed'}</h2>
              <div className="mt-1 text-sm text-inkMuted">{profile.institution}</div>
              {profile.headline && (
                <div className="mt-3 text-sm text-ink">{profile.headline}</div>
              )}
              {profile.bio && (
                <div className="mt-2 text-xs text-inkMuted line-clamp-3">{profile.bio}</div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.tags?.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-panel px-2 py-1 text-xs text-inkMuted">
                    {tag}
                  </span>
                ))}
                {profile.methods?.slice(0, 3).map((method) => (
                  <span key={method} className="rounded-full bg-tealSoft px-2 py-1 text-xs text-teal">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Info Banner for ASU Tabs */}
        {(activeTab === 'asu-faculty' || activeTab === 'asu-services') && (
          <div className="rounded-2xl border border-teal-200/60 bg-teal-50 px-6 py-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-sm font-medium text-teal-900">ASU University Index</div>
                <div className="mt-1 text-xs text-teal-700">
                  Real ASU faculty and research services. Click "Find Matches" in project workspace to get AI-suggested collaborators based on your proposal.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
