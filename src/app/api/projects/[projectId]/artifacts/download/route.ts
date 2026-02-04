import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

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
    const { searchParams } = new URL(request.url);
    const artifactId = searchParams.get('id');

    if (!artifactId) {
      return NextResponse.json({ error: 'Artifact id required' }, { status: 400 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: artifact, error } = await insforge.database
      .from('artifacts')
      .select('id, name, storage_path, file_type')
      .eq('project_id', projectId)
      .eq('id', artifactId)
      .single();

    if (error || !artifact?.storage_path) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    const { data: blob, error: downloadError } = await insforge.storage
      .from('artifacts')
      .download(artifact.storage_path);

    if (downloadError || !blob) {
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    const arrayBuffer = await blob.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': artifact.file_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${artifact.name || 'artifact'}"`,
      },
    });
  } catch (error: any) {
    console.error('Artifacts download error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
