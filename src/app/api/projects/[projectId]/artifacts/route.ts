import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

// GET - List artifacts for a project
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

        const { data, error } = await insforge.database
            .from('artifacts')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching artifacts:', error);
            return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
        }

        const artifactsWithUrls = (data || []).map((artifact: any) => ({
            ...artifact,
            download_url: `/api/projects/${projectId}/artifacts/download?id=${artifact.id}`,
        }));

        return NextResponse.json({ artifacts: artifactsWithUrls || [] });
    } catch (error) {
        console.error('Error in GET /artifacts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Upload artifact file and metadata
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
        const formData = await request.formData();
        const fileEntry = formData.get('file');

        if (!fileEntry || typeof fileEntry === 'string') {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        const nameValue = formData.get('name');
        const artifactTypeValue = formData.get('artifactType');
        const tagsValue = formData.get('tags');

        const uploadedFile = fileEntry as File;
        const name =
            typeof nameValue === 'string' && nameValue.trim()
                ? nameValue.trim()
                : uploadedFile.name;
        const artifactType =
            typeof artifactTypeValue === 'string' && artifactTypeValue.trim()
                ? artifactTypeValue.trim()
                : null;
        const tags = (() => {
            if (typeof tagsValue !== 'string' || !tagsValue.trim()) {
                return [] as string[];
            }

            try {
                const parsed = JSON.parse(tagsValue);
                if (Array.isArray(parsed)) {
                    return parsed.map((tag) => String(tag));
                }
            } catch {
                return tagsValue
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean);
            }

            return [] as string[];
        })();

        const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
        const storagePath = `projects/${projectId}/${uniqueId}-${safeName}`;

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const { error: uploadError } = await insforge.storage
            .from('artifacts')
            .upload(storagePath, uploadedFile);

        if (uploadError) {
            console.error('Error uploading artifact:', uploadError);
            return NextResponse.json({ error: 'Failed to upload artifact' }, { status: 500 });
        }

        const { data, error } = await insforge.database
            .from('artifacts')
            .insert({
                project_id: projectId,
                name,
                storage_path: storagePath,
                file_type: uploadedFile.type || null,
                size_bytes: uploadedFile.size || null,
                is_required: false,
                artifact_type: artifactType,
                tags,
                version: 1,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating artifact:', error);
            await insforge.storage.from('artifacts').remove(storagePath);
            return NextResponse.json({ error: 'Failed to create artifact' }, { status: 500 });
        }

        return NextResponse.json({
            artifact: {
                ...data,
                download_url: `/api/projects/${projectId}/artifacts/download?id=${data.id}`,
            },
        });
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
            await insforge.storage.from('artifacts').remove(storagePath);
        }

        // Delete from database
        const { error } = await insforge.database
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
