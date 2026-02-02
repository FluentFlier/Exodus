'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@insforge/sdk';
import { useRouter } from 'next/navigation';

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

export default function GrantsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [allGrants, setAllGrants] = useState<any[]>([]);

    useEffect(() => {
        fetchGrants();
    }, []);

    const fetchGrants = async () => {
        try {
            // 1. Fetch Recommendations
            const matchRes = await fetch('/api/grants/match', { method: 'POST' });
            if (matchRes.ok) {
                const { grants } = await matchRes.json();
                setRecommended(grants || []);
            }

            // 2. Fetch All Grants (Fallback/Browse)
            const { data } = await insforge
                .from('grants')
                .select('*')
                .order('deadline', { ascending: true })
                .limit(20);

            setAllGrants(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const startProject = async (grantId: string) => {
        // Navigate to project creation or create immediately
        // For now, let's just create and redirect
        const { data: { user } } = await insforge.auth.getUser();
        if (!user) return;

        const { data: project, error } = await insforge
            .from('projects')
            .insert({
                grant_id: grantId,
                owner_id: user.id,
                status: 'draft',
                title: 'New Application', // Should ask user ideally
            })
            .select()
            .single();

        if (project) {
            router.push(`/projects/${project.id}`);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading opportunities...</div>;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Funding Opportunities</h1>
                    <p className="text-gray-400">Curated grants matched to your expertise.</p>
                </div>
                <button
                    onClick={() => router.push('/api/seed')} // Temporary Helper
                    className="text-xs text-gray-600 hover:text-gray-400"
                >
                    (Dev: Seed Grants)
                </button>
            </header>

            {/* Recommended Section */}
            {recommended.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-6 text-indigo-400 flex items-center gap-2">
                        <span>✨</span> Recommended for You
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommended.map((grant) => (
                            <GrantCard key={grant.id} grant={grant} isRecommended onStart={() => startProject(grant.id)} />
                        ))}
                    </div>
                </section>
            )}

            {/* Browse All Section */}
            <section>
                <h2 className="text-xl font-semibold mb-6 text-gray-300">Browse All</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allGrants.map((grant) => (
                        <GrantCard key={grant.id} grant={grant} onStart={() => startProject(grant.id)} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function GrantCard({ grant, isRecommended, onStart }: { grant: any, isRecommended?: boolean, onStart: () => void }) {
    return (
        <div className={`p-6 rounded-xl border ${isRecommended ? 'border-indigo-500/50 bg-indigo-950/10' : 'border-gray-800 bg-gray-900'} hover:border-indigo-500 transition-all flex flex-col h-full`}>
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded">{grant.funder}</span>
                {grant.deadline && (
                    <span className="text-xs text-orange-400">Due {new Date(grant.deadline).toLocaleDateString()}</span>
                )}
            </div>

            <h3 className="text-lg font-bold mb-2 line-clamp-2">{grant.title}</h3>
            <p className="text-sm text-gray-400 mb-6 flex-grow line-clamp-3">{grant.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
                {grant.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{tag}</span>
                ))}
            </div>

            <button
                onClick={onStart}
                className="w-full py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors mt-auto"
            >
                Start Application
            </button>
        </div>
    );
}
