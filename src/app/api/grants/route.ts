import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { CURATED_GRANTS } from '@/data/mock-grant-data';

// GET - Fetch all grants
export async function GET() {
    try {
        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        });

        const { data, error } = await insforge.database
            .from('grants')
            .select('id, title, description, funder, deadline, amount_min, amount_max, eligibility_text, eligibility_json, tags, categories, source_url, source_name, source_identifier')
            .order('deadline', { ascending: true })
            .limit(200);

        const { data: latestIngest } = await insforge.database
            .from('grant_sources')
            .select('last_ingested_at')
            .order('last_ingested_at', { ascending: false })
            .maybeSingle();

        if (error) {
            console.error('Error fetching grants:', error);
            return NextResponse.json({ error: 'Failed to fetch grants' }, { status: 500 });
        }

        const prioritizedTitle = 'NSF CAREER: Faculty Early Career Development Program';

        const reorderWithPriority = (grants: any[]) => {
            if (!grants.length) return grants;
            const priorityIndex = grants.findIndex((grant) => grant.title === prioritizedTitle);
            if (priorityIndex <= 0) return grants;
            const prioritized = grants[priorityIndex];
            return [prioritized, ...grants.slice(0, priorityIndex), ...grants.slice(priorityIndex + 1)];
        };

        if (!data || data.length === 0) {
            return NextResponse.json(
                {
                    grants: reorderWithPriority(CURATED_GRANTS),
                    lastUpdatedAt: latestIngest?.last_ingested_at || null,
                },
                {
                    headers: {
                        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
                    },
                }
            );
        }

        return NextResponse.json(
            {
                grants: reorderWithPriority(data || []),
                lastUpdatedAt: latestIngest?.last_ingested_at || null,
            },
            {
                headers: {
                    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
                },
            }
        );
    } catch (error) {
        console.error('Error in GET /grants:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
