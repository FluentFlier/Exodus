import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

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
    const { searchParams } = new URL(_request.url);
    const docId = searchParams.get('docId') || projectId;

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data, error } = await insforge.database
      .from('doc_versions')
      .select('id, doc_id, name, created_at, snapshot')
      .eq('doc_id', docId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
    }

    return NextResponse.json({ versions: data || [] });
  } catch (error: any) {
    console.error('Doc versions GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const { docId, name, content } = await request.json();

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: { user } } = await insforge.auth.getUser(token);

    const { data, error } = await insforge.database
      .from('doc_versions')
      .insert({
        doc_id: docId || projectId,
        name: name || 'Snapshot',
        snapshot: content,
        created_by: user?.id || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save version' }, { status: 500 });
    }

    return NextResponse.json({ version: data });
  } catch (error: any) {
    console.error('Doc versions POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
