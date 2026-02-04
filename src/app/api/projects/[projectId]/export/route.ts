import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

// POST - Generate submission package
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
        const { documentHtml, documentTitle } = await request.json();

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        // Fetch project details
        const { data: project } = await insforge.database
            .from('projects')
            .select('*, grants(*)')
            .eq('id', projectId)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Fetch artifacts
        const { data: artifacts } = await insforge.database
            .from('artifacts')
            .select('*')
            .eq('project_id', projectId);

        const artifactsWithUrls = (artifacts || []).map((artifact: any) => ({
            ...artifact,
            downloadUrl: artifact.storage_path
                ? `/api/projects/${projectId}/artifacts/download?id=${artifact.id}`
                : null,
        }));

        // Generate manifest
        const manifest = {
            exportDate: new Date().toISOString(),
            project: {
                id: project.id,
                title: project.title,
                status: project.status,
                createdAt: project.created_at,
            },
            grant: project.grants ? {
                title: project.grants.title,
                funder: project.grants.funder,
                deadline: project.grants.deadline,
            } : null,
            documents: [
                {
                    title: documentTitle || 'Research Proposal',
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

        // Generate complete HTML document
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentTitle || 'Research Proposal'} - ${project.title}</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            line-height: 1.6;
            color: #333;
        }
        h1 { font-size: 24px; margin-bottom: 0.5em; }
        h2 { font-size: 20px; margin-top: 1.5em; margin-bottom: 0.5em; }
        h3 { font-size: 16px; margin-top: 1.2em; margin-bottom: 0.5em; }
        p { margin-bottom: 1em; text-align: justify; }
        .header {
            border-bottom: 2px solid #333;
            padding-bottom: 1em;
            margin-bottom: 2em;
        }
        .meta {
            color: #666;
            font-size: 14px;
        }
        @media print {
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${project.title || 'Untitled Project'}</h1>
        <div class="meta">
            ${project.grants ? `<p>Grant: ${project.grants.title} (${project.grants.funder})</p>` : ''}
            <p>Exported: ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
    <div class="content">
        ${documentHtml || '<p>No content</p>'}
    </div>
</body>
</html>`;

        const manifestText = JSON.stringify(manifest, null, 2);
        const htmlName = `${project.title || 'submission'}-proposal.html`;
        const manifestName = `${project.title || 'submission'}-manifest.json`;

        return NextResponse.json({
            success: true,
            package: {
                html: fullHtml,
                manifest,
                artifacts: artifactsWithUrls,
                files: [
                    { name: htmlName, content: fullHtml },
                    { name: manifestName, content: manifestText },
                ],
            },
        });
    } catch (error) {
        console.error('Error generating export:', error);
        return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
    }
}
