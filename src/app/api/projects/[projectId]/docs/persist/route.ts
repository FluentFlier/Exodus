import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

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
    const { docId, content, name } = await request.json();

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
      return NextResponse.json({ error: 'Failed to persist doc' }, { status: 500 });
    }

    if (name) {
      await insforge.database.from('doc_versions').insert({
        doc_id: docId,
        name,
        snapshot: content,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ doc: data });
  } catch (error: any) {
    console.error('Doc persist error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
