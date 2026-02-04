import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';
import { CURATED_GRANTS } from '@/data/mock-grant-data';

const PRIORITY_TITLES = [
    'NSF CAREER: Faculty Early Career Development Program',
    'DOE Office of Science Early Career Research Program',
];

const buildPriorityGrants = () => {
    const picks = PRIORITY_TITLES
        .map((title) => CURATED_GRANTS.find((grant) => grant.title === title))
        .filter(Boolean) as typeof CURATED_GRANTS;

    if (picks.length < 2) {
        const fallback = CURATED_GRANTS.filter((grant) => !picks.some((pick) => pick.id === grant.id));
        picks.push(...fallback.slice(0, 2 - picks.length));
    }

    return picks.slice(0, 2).map((grant) => ({
        ...grant,
        reasons: ['Suggested from curated pool'],
    }));
};

const appendPriority = (grants: any[]) => {
    const existing = new Set(grants.map((grant) => grant.id));
    const priority = buildPriorityGrants().filter((grant) => !existing.has(grant.id));
    return [...grants, ...priority];
};

export async function POST(_request: Request) {

    try {
        const { token } = await auth();
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        // 1. Get User Profile for Embedding
        const userResponse = await insforge.auth.getUser(token);
        const user = userResponse?.data?.user;
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await insforge.database
            .from('profiles')
            .select('embedding')
            .eq('id', user.id)
            .single();

        if (!profile?.embedding) {
            return NextResponse.json({ grants: buildPriorityGrants() });
        }

        // 2. Call match_grants RPC
        const { data: grants, error } = await insforge.database.rpc('match_grants', {
            query_embedding: profile.embedding,
            match_threshold: 0.3,
            match_count: 8,
        });

        if (error) throw error;

        if (!grants || grants.length === 0) {
            return NextResponse.json({ grants: buildPriorityGrants() });
        }

        const { data: grantDetails, error: detailError } = await insforge.database
            .from('grants')
            .select('id, tags, eligibility_json, eligibility_text, source_url, categories')
            .in('id', grants.map((grant: any) => grant.id));

        if (detailError) {
            throw detailError;
        }

        const detailsById = new Map((grantDetails || []).map((grant: any) => [grant.id, grant]));

        const enriched = (grants || []).map((grant: any) => {
            const details = detailsById.get(grant.id) || {};
            const reasons = [] as string[];
            const tags = details.tags || grant.tags || [];
            if (tags.length) {
                reasons.push(`Overlap in ${tags.slice(0, 2).join(', ')}`);
            }
            if (grant.deadline) {
                reasons.push(`Deadline ${new Date(grant.deadline).toLocaleDateString()}`);
            }
            return {
                ...grant,
                tags,
                eligibility_json: details.eligibility_json,
                eligibility_text: details.eligibility_text || grant.eligibility_text,
                source_url: details.source_url || grant.source_url,
                categories: details.categories || grant.categories,
                reasons,
            };
        });

        const matchedIds = new Set(enriched.map((grant: any) => grant.id));
        const { data: suggestionPool, error: suggestionError } = await insforge.database
            .from('grants')
            .select('id, title, description, funder, deadline, amount_min, amount_max, tags, eligibility_json, eligibility_text, source_url, categories')
            .limit(50);

        if (suggestionError) {
            throw suggestionError;
        }

        const additional = (suggestionPool || [])
            .filter((grant: any) => !matchedIds.has(grant.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 2)
            .map((grant: any) => ({
                ...grant,
                reasons: ['Suggested from curated pool'],
            }));

        return NextResponse.json({ grants: appendPriority([...enriched, ...additional]) });
    } catch (error: any) {
        console.error('Matching error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
