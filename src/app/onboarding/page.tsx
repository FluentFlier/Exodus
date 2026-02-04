'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser } from '@insforge/nextjs';

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    institution: '',
    bio: '',
    tags: '',
    methods: '',
    collab_open: false,
    availability: 'medium',
    collab_roles: [] as string[],
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login?redirect=/onboarding');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          methods: formData.methods.split(',').map((m) => m.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save profile');
      }

      router.push('/grants');
    } catch (err: any) {
      console.error('Profile save error:', err);
      setError(err.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal to-teal-600 flex items-center justify-center animate-pulse">
            <span className="font-serif text-lg font-bold text-white">E</span>
          </div>
          <p className="text-sm text-ink/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if not signed in (will redirect)
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal to-teal-600 flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-white">E</span>
            </div>
            <div>
              <div className="font-serif text-lg tracking-tight">Exodus</div>
              <div className="text-xs text-ink/50">Profile setup</div>
            </div>
          </Link>
          <Link
            href="/grants"
            className="text-sm text-ink/60 hover:text-ink transition-colors"
          >
            Explore grants →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl text-ink">Complete your research profile</h1>
            <p className="mt-2 text-ink/60">
              This profile powers grant matching, collaborator suggestions, and compliance checks.
            </p>
            {user?.email && (
              <p className="mt-1 text-sm text-teal">
                Signed in as {user.email}
              </p>
            )}
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-coral-50 border border-coral-500/30 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink/80 mb-2">Institution</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-ink placeholder:text-inkSubtle focus:border-teal focus:ring-0 outline-none transition-colors"
                placeholder="Stanford University"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink/80 mb-2">Bio / Research interests</label>
              <textarea
                required
                rows={4}
                className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-ink placeholder:text-inkSubtle focus:border-teal focus:ring-0 outline-none transition-colors resize-none"
                placeholder="Describe your research focus, recent work, and preferred funders."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Key tags</label>
              <input
                type="text"
                className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-ink placeholder:text-inkSubtle focus:border-teal focus:ring-0 outline-none transition-colors"
                placeholder="Genomics, AI, Public Health"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <p className="mt-1 text-xs text-ink/50">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Methods</label>
              <input
                type="text"
                className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-ink placeholder:text-inkSubtle focus:border-teal focus:ring-0 outline-none transition-colors"
                placeholder="PCR, Ethnography, Time-series"
                value={formData.methods}
                onChange={(e) => setFormData({ ...formData, methods: e.target.value })}
              />
              <p className="mt-1 text-xs text-ink/50">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Collaboration roles</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'co-pi', label: 'Co-PI' },
                  { value: 'domain-expert', label: 'Domain expert' },
                  { value: 'methods-expert', label: 'Methods expert' },
                  { value: 'writing', label: 'Writing support' },
                  { value: 'budget', label: 'Budget support' },
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 cursor-pointer transition-colors ${formData.collab_roles.includes(role.value)
                        ? 'border-teal bg-teal-50 text-teal-700'
                        : 'border-border bg-surface text-inkMuted hover:border-borderHover'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.collab_roles.includes(role.value)}
                      onChange={(e) => {
                        const nextRoles = e.target.checked
                          ? [...formData.collab_roles, role.value]
                          : formData.collab_roles.filter((item) => item !== role.value);
                        setFormData({ ...formData, collab_roles: nextRoles });
                      }}
                    />
                    <span className="text-sm">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Availability</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-ink focus:border-teal focus:ring-0 outline-none transition-colors"
              >
                <option value="low">Low availability</option>
                <option value="medium">Medium availability</option>
                <option value="high">High availability</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.collab_open
                    ? 'border-teal bg-teal-50'
                    : 'border-border bg-surface hover:border-borderHover'
                  }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.collab_open}
                  onChange={(e) => setFormData({ ...formData, collab_open: e.target.checked })}
                />
                <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${formData.collab_open ? 'bg-teal border-teal' : 'border-border'
                  }`}>
                  {formData.collab_open && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className={`text-sm font-medium ${formData.collab_open ? 'text-teal-700' : 'text-ink'}`}>
                    Open to collaboration requests
                  </span>
                  <p className="text-xs text-ink/50 mt-0.5">
                    Other researchers can find and contact you for collaboration opportunities
                  </p>
                </div>
              </label>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3.5 rounded-xl bg-teal text-white font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal/50 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving profile...
                  </span>
                ) : 'Complete profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
