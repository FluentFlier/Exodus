import { notFound } from 'next/navigation';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';
import AppShell from '@/components/layout/AppShell';
import ViabilityScorecard from '@/components/grants/ViabilityScorecard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function GrantDetailsPage({ params }: PageProps) {
    const { id } = await params;

    // Auth check
    const { token } = await auth().catch(() => ({ token: null }));
    const insforge = createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
        edgeFunctionToken: token || undefined,
        // Fallback to anon key if no token, for public grants read access
        anonKey: !token ? process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY : undefined,
    });

    const { data: grant, error } = await (insforge as any).database
        .from('grants')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !grant) {
        notFound();
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-5xl space-y-8">
                <Link href="/grants" className="text-sm text-inkMuted hover:text-ink flex items-center gap-1">
                    &larr; Back to grants
                </Link>

                <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                    {/* Main Content */}
                    <div className="space-y-6">
                        <header>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="rounded-full bg-panel px-3 py-1 text-xs text-inkMuted font-medium uppercase tracking-wider">{grant.funder || 'Independent'}</span>
                                {grant.deadline && (
                                    <span className="rounded-full bg-amber/10 px-3 py-1 text-xs text-amber font-medium">Due {new Date(grant.deadline).toLocaleDateString()}</span>
                                )}
                            </div>
                            <h1 className="font-serif text-3xl text-ink leading-tight">{grant.title}</h1>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {grant.tags?.map((tag: string) => (
                                    <span key={tag} className="rounded-full border border-border px-2 py-1 text-xs text-inkMuted">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </header>

                        <section className="prose prose-sm max-w-none text-ink">
                            <h3 className="text-lg font-serif">Description</h3>
                            <div className="whitespace-pre-line">{grant.description}</div>
                        </section>

                        {grant.eligibility_text && (
                            <section className="rounded-xl bg-panel p-6">
                                <h3 className="text-lg font-serif mb-3">Eligibility Requirements</h3>
                                <div className="text-sm text-inkMuted whitespace-pre-line leading-relaxed">{grant.eligibility_text}</div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions Card */}
                        <div className="card p-6">
                            <h3 className="font-serif text-lg mb-2">Ready to apply?</h3>
                            <p className="text-sm text-inkMuted mb-4">Start a new project workspace for this grant.</p>
                            {/* Create Project Button Logic would go here - reused from GrantsPage or link to API */}
                            <div className="rounded-xl bg-panel/60 p-4 text-xs text-inkMuted">
                                Project creation is currently unavailable. Open the workspace view for this grant.
                            </div>
                            <Link href={`/projects/demo?grantId=${grant.id}`} className="mt-4 block w-full text-center rounded-full bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-ink/90">
                                Open Workspace
                            </Link>
                        </div>

                        {/* Viability Scorecard */}
                        <ViabilityScorecard grant={grant} />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
