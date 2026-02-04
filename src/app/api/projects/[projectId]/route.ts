import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

// GET - Fetch a single project with grant info
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { projectId } = await params;

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const { data: project, error } = await insforge.database
            .from('projects')
            .select('*, grants(*)')
            .eq('id', projectId)
            .single();

        if (error) {
            console.error('Error fetching project:', error);
            return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
        }

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('Error in GET /projects/[projectId]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
