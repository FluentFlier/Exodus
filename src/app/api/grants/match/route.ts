import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

export async function POST(request: Request) {
    try {
        const { token } = await auth();
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        // 1. Get User Profile for Embedding
        const { data: { user } } = await insforge.auth.getUser(token);
        const { data: profile } = await insforge
            .from('profiles')
            .select('embedding')
            .eq('id', user?.id)
            .single();

        if (!profile?.embedding) {
            return NextResponse.json({ error: 'Profile not found or missing embedding' }, { status: 404 });
        }

        // 2. Call match_grants RPC
        const { data: grants, error } = await insforge.rpc('match_grants', {
            query_embedding: profile.embedding,
            match_threshold: 0.3, // Adjust threshold
            match_count: 5,
        });

        if (error) throw error;

        return NextResponse.json({ grants });
    } catch (error: any) {
        console.error('Matching error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
