import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

// GET - List projects for the user
export async function GET() {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const userResponse = await insforge.auth.getUser(token);
        const user = userResponse?.data?.user;
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await insforge.database
            .from('projects')
            .select('*, grants(*)')
            .eq('owner_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
        }

        return NextResponse.json({ projects: data || [] });
    } catch (error: any) {
        console.error('Error in GET /projects:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new project
export async function POST(request: Request) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { grantId, title } = body;

        console.log('[POST /api/projects] Creating project with:', { grantId, title });

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const userResponse = await insforge.auth.getUser(token);
        const user = userResponse?.data?.user;
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[POST /api/projects] User ID:', user.id);

        const insertPayload = {
            grant_id: grantId || null,
            owner_id: user.id,
            status: 'in_preparation',
            title: title || 'New Application',
        };

        console.log('[POST /api/projects] Insert payload:', insertPayload);

        const { data: project, error } = await insforge.database
            .from('projects')
            .insert(insertPayload)
            .select()
            .single();

        if (error) {
            console.error('[POST /api/projects] Database error:', error);
            return NextResponse.json({ error: 'Failed to create project', details: error }, { status: 500 });
        }

        console.log('[POST /api/projects] Created project:', project?.id);

        // Add project member
        if (project?.id) {
            await insforge.database.from('project_members').insert({
                project_id: project.id,
                user_id: user.id,
                role: 'owner',
            });

            // Seed default docs (best-effort)
            const defaultDocs = [
                { doc_type: 'proposal', title: 'Research Proposal' },
                { doc_type: 'summary', title: 'Project Summary' },
                { doc_type: 'specific_aims', title: 'Specific Aims' },
                { doc_type: 'broader_impacts', title: 'Broader Impacts' },
                { doc_type: 'data_management', title: 'Data Management Plan' },
                { doc_type: 'budget_justification', title: 'Budget Justification' },
                { doc_type: 'internal_notes', title: 'Internal Notes' },
            ];
            await insforge.database.from('project_docs').insert(
                defaultDocs.map((doc) => ({
                    project_id: project.id,
                    title: doc.title,
                    doc_type: doc.doc_type,
                    content: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }))
            );

            // Add default tasks
            const defaultTasks = [
                { title: 'Draft outline', offsetDays: 7 },
                { title: 'Draft budget', offsetDays: 14 },
                { title: 'Draft summary', offsetDays: 18 },
                { title: 'Collect biosketches', offsetDays: 21 },
                { title: 'Internal review', offsetDays: 28 },
                { title: 'Finalize submission package', offsetDays: 35 },
            ];
            const tasksPayload = defaultTasks.map((task) => ({
                project_id: project.id,
                title: task.title,
                status: 'todo',
                due_date: new Date(Date.now() + task.offsetDays * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }));
            await insforge.database.from('tasks').insert(tasksPayload);
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('Error in POST /projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
