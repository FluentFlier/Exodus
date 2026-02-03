import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

// GET - List artifacts for a project
export async function GET(
    request: Request,
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

        const { data, error } = await insforge
            .from('artifacts')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching artifacts:', error);
            return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
        }

        return NextResponse.json({ artifacts: data || [] });
    } catch (error) {
        console.error('Error in GET /artifacts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Upload artifact metadata (file upload happens client-side to storage)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { projectId } = await params;
        const { name, storagePath, fileType } = await request.json();

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const { data, error } = await insforge
            .from('artifacts')
            .insert({
                project_id: projectId,
                name,
                storage_path: storagePath,
                file_type: fileType,
                is_required: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating artifact:', error);
            return NextResponse.json({ error: 'Failed to create artifact' }, { status: 500 });
        }

        return NextResponse.json({ artifact: data });
    } catch (error) {
        console.error('Error in POST /artifacts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove an artifact
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { projectId } = await params;
        const { searchParams } = new URL(request.url);
        const artifactId = searchParams.get('id');
        const storagePath = searchParams.get('storagePath');

        if (!artifactId) {
            return NextResponse.json({ error: 'Artifact ID required' }, { status: 400 });
        }

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        // Delete from storage if path provided
        if (storagePath) {
            await insforge.storage.from('artifacts').remove([storagePath]);
        }

        // Delete from database
        const { error } = await insforge
            .from('artifacts')
            .delete()
            .eq('id', artifactId)
            .eq('project_id', projectId);

        if (error) {
            console.error('Error deleting artifact:', error);
            return NextResponse.json({ error: 'Failed to delete artifact' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /artifacts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
