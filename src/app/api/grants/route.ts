import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

// GET - Fetch all grants
export async function GET() {
    try {
        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        });

        const { data, error } = await insforge
            .from('grants')
            .select('*')
            .order('deadline', { ascending: true })
            .limit(50);

        if (error) {
            console.error('Error fetching grants:', error);
            return NextResponse.json({ error: 'Failed to fetch grants' }, { status: 500 });
        }

        return NextResponse.json({ grants: data || [] });
    } catch (error) {
        console.error('Error in GET /grants:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
