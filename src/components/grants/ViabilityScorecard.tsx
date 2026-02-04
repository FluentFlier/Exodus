'use client';

import { useState } from 'react';
import { createClient } from '@insforge/sdk';

interface ViabilityScorecardProps {
    grant: {
        id: string;
        title: string;
        eligibility_text?: string | null;
    };
}

export default function ViabilityScorecard({ grant }: ViabilityScorecardProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const analyzeViability = async () => {
        setLoading(true);
        setError(null);
        try {
            const insforge = createClient({
                baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
                anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
            });

            // Fetch user from our own API to avoid client SDK issues
            const authRes = await fetch('/api/auth/me');
            if (authRes.status === 401) {
                setError('Please log in to analyze viability.');
                return;
            }
            const { user } = await authRes.json();

            if (!user) {
                setError('Please log in to analyze viability.');
                return;
            }

            // Fetch full profile
            // We can still use the client for DB if we have anon key, but strict RLS might need token.
            // However, the previous code didn't pass token to createClient unless it had it.
            // Let's assume fetching own profile is allowed if we are authenticated (cookie-based).
            // Actually, we should probably fetch the profile in the API route too to be safe, but let's try DB call first.
            // If DB call fails due to RLS, we might need to proxy that too.
            // For now, let's try reading profile from client using the anon key (which we initialized).
            // If RLS relies on the auth header, the anon key client won't have it automatically unless we set it.
            // But let's proceed with finding the profile.

            const { data: profile } = await (insforge as any).database
                .from('profiles')
                .select('bio, institution, tags')
                .eq('id', user.id)
                .single();

            const contextText = profile
                ? `Researcher Bio: ${profile.bio}\nInstitution: ${profile.institution}\nExpertise: ${profile.tags?.join(', ')}`
                : 'No profile information available.';

            const res = await fetch('/api/ai/compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grantTitle: grant.title,
                    eligibilityText: grant.eligibility_text || 'No eligibility requirements specified.',
                    proposalText: contextText, // Using profile as proxy for proposal checks
                }),
            });

            const data = await res.json();
            if (data.success) {
                setResult(data.analysis);
            } else {
                setError(data.error || 'Analysis failed');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to run analysis');
        } finally {
            setLoading(false);
        }
    };

    if (!grant.eligibility_text) return null;

    return (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="font-serif text-lg text-ink">Go / No-Go Decision</h3>
            <p className="text-sm text-inkMuted mb-4">AI-powered eligibility & fit check.</p>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                    {error}
                </div>
            )}

            {!result ? (
                <button
                    onClick={analyzeViability}
                    disabled={loading}
                    className="w-full rounded-full bg-teal px-4 py-2 text-sm text-white disabled:opacity-70 hover:bg-teal/90 transition-colors"
                >
                    {loading ? 'Analyzing...' : 'Evaluate Viability'}
                </button>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="text-sm font-medium text-ink">Viability Score</span>
                        <div className={`flex items-center gap-2 ${result.score >= 80 ? 'text-teal' : result.score >= 50 ? 'text-amber' : 'text-error'
                            }`}>
                            <span className="text-2xl font-bold">{result.score}</span>
                            <span className="text-xs uppercase tracking-wider font-semibold">/ 100</span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-panel p-3">
                        <div className="text-xs uppercase tracking-wider text-inkMuted mb-1 font-medium">Recommendation</div>
                        <div className="font-semibold text-ink">
                            {result.compliant ? '✅ Pursue Opportunity' : result.score > 40 ? '⚠️ High Risk' : '⛔ Do Not Pursue'}
                        </div>
                        <p className="mt-2 text-xs text-inkMuted leading-relaxed">{result.summary}</p>
                    </div>

                    {result.issues && result.issues.length > 0 && (
                        <div>
                            <div className="text-xs uppercase tracking-wider text-inkMuted mb-2 font-medium">Key Considerations</div>
                            <ul className="space-y-2">
                                {result.issues.slice(0, 3).map((issue: any, i: number) => (
                                    <li key={i} className="text-xs border-l-2 border-amber pl-3 py-0.5">
                                        <div className="font-medium text-ink">{issue.finding}</div>
                                        <div className="text-inkMuted mt-0.5">{issue.suggestion}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={analyzeViability}
                        className="w-full mt-2 text-xs text-inkMuted hover:text-teal underline"
                    >
                        Re-evaluate
                    </button>
                </div>
            )}
        </div>
    );
}
