import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

// POST - Create a new project
export async function POST(request: Request) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { grantId, title } = await request.json();

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const { data: { user } } = await insforge.auth.getUser(token);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: project, error } = await insforge
            .from('projects')
            .insert({
                grant_id: grantId,
                owner_id: user.id,
                status: 'draft',
                title: title || 'New Application',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('Error in POST /projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
