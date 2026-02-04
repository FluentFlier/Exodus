import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';
import JSZip from 'jszip';

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
    const { documentHtml } = await request.json();

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: project } = await insforge.database
      .from('projects')
      .select('*, grants(*)')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: artifacts } = await insforge.database
      .from('artifacts')
      .select('*')
      .eq('project_id', projectId);

    const manifest = {
      exportDate: new Date().toISOString(),
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
        createdAt: project.created_at,
      },
      grant: project.grants
        ? {
            title: project.grants.title,
            funder: project.grants.funder,
            deadline: project.grants.deadline,
          }
        : null,
      documents: [
        {
          title: 'Research Proposal',
          type: 'proposal',
          format: 'html',
        },
      ],
      artifacts: (artifacts || []).map((a: any) => ({
        name: a.name,
        type: a.file_type,
        required: a.is_required,
      })),
    };

    const zip = new JSZip();
    const proposalName = `${project.title || 'submission'}-proposal.html`;
    const manifestName = `${project.title || 'submission'}-manifest.json`;

    zip.file(proposalName, documentHtml || '<p>No content</p>');
    zip.file(manifestName, JSON.stringify(manifest, null, 2));

    const artifactFolder = zip.folder('artifacts');
    for (const artifact of artifacts || []) {
      if (!artifact.storage_path) continue;
      const { data: blob } = await insforge.storage
        .from('artifacts')
        .download(artifact.storage_path);
      if (!blob) continue;
      const buffer = await blob.arrayBuffer();
      artifactFolder?.file(artifact.name || 'artifact', buffer);
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
    const zipBase64 = Buffer.from(zipBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      zipBase64,
      fileName: `${project.title || 'submission'}-package.zip`,
    });
  } catch (error: any) {
    console.error('Export zip error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
