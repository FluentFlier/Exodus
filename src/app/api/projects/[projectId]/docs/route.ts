import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

const DEFAULT_DOCS = [
  { doc_type: 'proposal', title: 'Research Proposal' },
  { doc_type: 'summary', title: 'Project Summary' },
  { doc_type: 'specific_aims', title: 'Specific Aims' },
  { doc_type: 'broader_impacts', title: 'Broader Impacts' },
  { doc_type: 'data_management', title: 'Data Management Plan' },
  { doc_type: 'budget_justification', title: 'Budget Justification' },
  { doc_type: 'internal_notes', title: 'Internal Notes' },
];

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
    const docId = searchParams.get('docId');

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    if (docId) {
      const { data, error } = await insforge.database
        .from('project_docs')
        .select('*')
        .eq('project_id', projectId)
        .eq('id', docId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch doc' }, { status: 500 });
      }

      return NextResponse.json({ doc: data });
    }

    const { data, error } = await insforge.database
      .from('project_docs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 });
    }

    return NextResponse.json({ docs: data || [] });
  } catch (error: any) {
    console.error('Docs GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
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

    const { data: existing } = await insforge.database
      .from('project_docs')
      .select('id')
      .eq('project_id', projectId)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true });
    }

    const { data, error } = await insforge.database
      .from('project_docs')
      .insert(
        DEFAULT_DOCS.map((doc) => ({
          project_id: projectId,
          title: doc.title,
          doc_type: doc.doc_type,
          content: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      )
      .select();

    if (error) {
      return NextResponse.json({ error: 'Failed to create docs' }, { status: 500 });
    }

    return NextResponse.json({ docs: data || [] });
  } catch (error: any) {
    console.error('Docs POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { token } = await auth();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const { docId, content } = await request.json();

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data, error } = await insforge.database
      .from('project_docs')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .eq('id', docId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update doc' }, { status: 500 });
    }

    return NextResponse.json({ doc: data });
  } catch (error: any) {
    console.error('Docs PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
