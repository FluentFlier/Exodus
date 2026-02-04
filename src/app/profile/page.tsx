'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useToast } from '@/components/ui/Toast';

type ProfileLinks = {
  faculty?: string;
  lab?: string;
  scholar?: string;
  orcid?: string;
  cv?: string;
};

type ProfileAnalysis = {
  researchSummary?: string;
  expertiseAreas?: string[];
  methods?: string[];
  suggestedTags?: string[];
  suggestedKeywords?: string[];
  notablePapers?: string[];
  grantFit?: string[];
  collaborationAngles?: string[];
  risks?: string[];
  citationsEstimate?: string;
  recommendedDataToCollect?: string[];
};

const roleOptions = [
  { value: 'co-pi', label: 'Co-PI' },
  { value: 'domain-expert', label: 'Domain expert' },
  { value: 'methods-expert', label: 'Methods expert' },
  { value: 'writing', label: 'Writing support' },
  { value: 'budget', label: 'Budget support' },
];

export default function ProfilePage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [links, setLinks] = useState<ProfileLinks>({});
  const [formData, setFormData] = useState({
    full_name: '',
    headline: '',
    institution: '',
    bio: '',
    tags: '',
    methods: '',
    focus_areas: '',
    preferred_funders: '',
    career_stage: '',
    lab_size: '',
    recent_papers: '',
    citations: '',
    collab_open: false,
    availability: 'medium',
    collab_roles: [] as string[],
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const profile = data.profile || {};
        const prefs = profile.preferences || {};
        const profileLinks = prefs.profile_links || {};

        setFormData({
          full_name: profile.full_name || '',
          headline: profile.headline || '',
          institution: profile.institution || '',
          bio: profile.bio || '',
          tags: (profile.tags || []).join(', '),
          methods: (profile.methods || []).join(', '),
          focus_areas: (prefs.focus_areas || []).join(', '),
          preferred_funders: (prefs.preferred_funders || []).join(', '),
          career_stage: prefs.career_stage || '',
          lab_size: prefs.lab_size || '',
          recent_papers: prefs.recent_papers || '',
          citations: prefs.citations || '',
          collab_open: profile.collab_open || false,
          availability: profile.availability || 'medium',
          collab_roles: profile.collab_roles || [],
        });
        setLinks(profileLinks);
        setAnalysis(prefs.profile_analysis || null);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: formData.full_name,
        headline: formData.headline,
        institution: formData.institution,
        bio: formData.bio,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        methods: formData.methods.split(',').map((t) => t.trim()).filter(Boolean),
        focus_areas: formData.focus_areas.split(',').map((t) => t.trim()).filter(Boolean),
        preferred_funders: formData.preferred_funders.split(',').map((t) => t.trim()).filter(Boolean),
        career_stage: formData.career_stage,
        lab_size: formData.lab_size,
        recent_papers: formData.recent_papers,
        citations: formData.citations,
        collab_open: formData.collab_open,
        availability: formData.availability,
        collab_roles: formData.collab_roles,
        profile_links: links,
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error || 'Failed to save profile', 'error');
      } else {
        addToast('Profile saved successfully', 'success');
      }
    } catch (error) {
      console.error('Save error', error);
      addToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const profilePayload = {
        full_name: formData.full_name,
        headline: formData.headline,
        institution: formData.institution,
        bio: formData.bio,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        methods: formData.methods.split(',').map((t) => t.trim()).filter(Boolean),
        focus_areas: formData.focus_areas.split(',').map((t) => t.trim()).filter(Boolean),
        preferred_funders: formData.preferred_funders.split(',').map((t) => t.trim()).filter(Boolean),
        career_stage: formData.career_stage,
        lab_size: formData.lab_size,
        recent_papers: formData.recent_papers,
        citations: formData.citations,
      };

      const sourceLinks = Object.values(links).filter(Boolean);

      const res = await fetch('/api/profile/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profilePayload, sources: sourceLinks }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis || null);
        addToast('Profile analysis complete', 'success');
      } else {
        addToast(data.error || 'Failed to analyze profile', 'error');
      }
    } catch (error) {
      console.error('Analysis error', error);
      addToast('Failed to analyze profile', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="card p-6 text-sm text-inkMuted">Loading profile...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Research Profile</h1>
            <p className="text-sm text-inkMuted">Deep context drives better grant matching and AI guidance.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="rounded-full bg-ink px-4 py-2 text-sm text-surface"
            >
              {analyzing ? 'Analyzing...' : 'Run profile analysis'}
            </button>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="rounded-full bg-teal px-4 py-2 text-sm text-white"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </header>

        <section className="card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Basics</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              placeholder="Full name"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            <input
              placeholder="Headline (e.g., Computational Genomics Lab)"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            />
            <input
              placeholder="Institution"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
            <input
              placeholder="Career stage (assistant/associate/full/industry)"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.career_stage}
              onChange={(e) => setFormData({ ...formData, career_stage: e.target.value })}
            />
          </div>
          <textarea
            className="mt-4 w-full rounded-xl border border-border bg-panel px-4 py-3 text-sm"
            rows={4}
            placeholder="Bio and research interests"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </section>

        <section className="card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Research context</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              placeholder="Tags (comma separated)"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <input
              placeholder="Methods (comma separated)"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.methods}
              onChange={(e) => setFormData({ ...formData, methods: e.target.value })}
            />
            <input
              placeholder="Focus areas (comma separated)"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.focus_areas}
              onChange={(e) => setFormData({ ...formData, focus_areas: e.target.value })}
            />
            <input
              placeholder="Preferred funders (comma separated)"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.preferred_funders}
              onChange={(e) => setFormData({ ...formData, preferred_funders: e.target.value })}
            />
            <input
              placeholder="Lab size"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.lab_size}
              onChange={(e) => setFormData({ ...formData, lab_size: e.target.value })}
            />
            <input
              placeholder="Citations / h-index (optional)"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={formData.citations}
              onChange={(e) => setFormData({ ...formData, citations: e.target.value })}
            />
          </div>
          <textarea
            className="mt-4 w-full rounded-xl border border-border bg-panel px-4 py-3 text-sm"
            rows={3}
            placeholder="Recent papers or key projects"
            value={formData.recent_papers}
            onChange={(e) => setFormData({ ...formData, recent_papers: e.target.value })}
          />
        </section>

        <section className="card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Online profiles</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              placeholder="Faculty page URL"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={links.faculty || ''}
              onChange={(e) => setLinks({ ...links, faculty: e.target.value })}
            />
            <input
              placeholder="Lab website URL"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={links.lab || ''}
              onChange={(e) => setLinks({ ...links, lab: e.target.value })}
            />
            <input
              placeholder="Google Scholar URL"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={links.scholar || ''}
              onChange={(e) => setLinks({ ...links, scholar: e.target.value })}
            />
            <input
              placeholder="ORCID URL"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
              value={links.orcid || ''}
              onChange={(e) => setLinks({ ...links, orcid: e.target.value })}
            />
            <input
              placeholder="CV URL"
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm md:col-span-2"
              value={links.cv || ''}
              onChange={(e) => setLinks({ ...links, cv: e.target.value })}
            />
          </div>
        </section>

        <section className="card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Collaboration preferences</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="rounded-xl border border-border bg-panel px-4 py-2 text-sm"
            >
              <option value="low">Low availability</option>
              <option value="medium">Medium availability</option>
              <option value="high">High availability</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-inkMuted">
              <input
                type="checkbox"
                checked={formData.collab_open}
                onChange={(e) => setFormData({ ...formData, collab_open: e.target.checked })}
              />
              Open to collaboration requests
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {roleOptions.map((role) => (
              <label key={role.value} className="flex items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2">
                <input
                  type="checkbox"
                  checked={formData.collab_roles.includes(role.value)}
                  onChange={(e) => {
                    const nextRoles = e.target.checked
                      ? [...formData.collab_roles, role.value]
                      : formData.collab_roles.filter((item) => item !== role.value);
                    setFormData({ ...formData, collab_roles: nextRoles });
                  }}
                />
                <span>{role.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">Profile analysis</div>
          {analysis ? (
            <div className="mt-4 space-y-4 text-sm text-inkMuted">
              <div>
                <div className="text-xs uppercase tracking-[0.2em]">Summary</div>
                <p className="mt-2 text-ink">{analysis.researchSummary}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em]">Expertise</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(analysis.expertiseAreas || []).slice(0, 6).map((item) => (
                      <span key={item} className="rounded-full bg-panel px-2 py-1 text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em]">Suggested tags</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(analysis.suggestedTags || []).slice(0, 6).map((item) => (
                      <span key={item} className="rounded-full bg-tealSoft px-2 py-1 text-xs text-teal">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {analysis.grantFit?.length ? (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em]">Grant fit signals</div>
                  <ul className="mt-2 list-disc list-inside text-inkMuted">
                    {analysis.grantFit.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {analysis.citationsEstimate ? (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em]">Citation signal</div>
                  <p className="mt-2 text-ink">{analysis.citationsEstimate}</p>
                </div>
              ) : null}
              {analysis.notablePapers?.length ? (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em]">Notable papers</div>
                  <ul className="mt-2 list-disc list-inside text-inkMuted">
                    {analysis.notablePapers.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {analysis.recommendedDataToCollect?.length ? (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em]">Recommended data to collect</div>
                  <ul className="mt-2 list-disc list-inside text-inkMuted">
                    {analysis.recommendedDataToCollect.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 text-sm text-inkMuted">Run profile analysis to see insights.</div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
