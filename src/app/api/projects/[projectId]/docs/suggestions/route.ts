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
    const docId = searchParams.get('docId') || projectId;

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data, error } = await insforge.database
      .from('doc_suggestions')
      .select('*')
      .eq('doc_id', docId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }

    return NextResponse.json({ suggestions: data || [] });
  } catch (error: any) {
    console.error('Suggestions GET error:', error);
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
    const { text, docId } = await request.json();

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: { user } } = await insforge.auth.getUser(token);

    const { data, error } = await insforge.database
      .from('doc_suggestions')
      .insert({
        doc_id: docId || projectId,
        author_id: user?.id || null,
        payload: { text },
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 });
    }

    return NextResponse.json({ suggestion: data });
  } catch (error: any) {
    console.error('Suggestions POST error:', error);
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
    const { id, status, docId } = await request.json();

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data, error } = await insforge.database
      .from('doc_suggestions')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('doc_id', docId || projectId)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 });
    }

    return NextResponse.json({ suggestion: data });
  } catch (error: any) {
    console.error('Suggestions PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const id = searchParams.get('id');
    const docId = searchParams.get('docId');

    if (!id) {
      return NextResponse.json({ error: 'Suggestion id required' }, { status: 400 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { error } = await insforge.database
      .from('doc_suggestions')
      .delete()
      .eq('id', id)
      .eq('doc_id', docId || projectId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete suggestion' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Suggestions DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
