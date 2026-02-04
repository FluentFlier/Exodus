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
      .from('doc_comments')
      .select('*')
      .eq('doc_id', docId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error: any) {
    console.error('Comments GET error:', error);
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
      .from('doc_comments')
      .insert({
        doc_id: docId || projectId,
        author_id: user?.id || null,
        thread: { messages: [{ text, created_at: new Date().toISOString() }] },
        status: 'open',
        anchor: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json({ comment: data });
  } catch (error: any) {
    console.error('Comments POST error:', error);
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
    const { id, status, message, docId } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Comment id required' }, { status: 400 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: existing } = await insforge.database
      .from('doc_comments')
      .select('*')
      .eq('id', id)
      .eq('doc_id', docId || projectId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const updatedThread = existing.thread || { messages: [] };
    if (message) {
      updatedThread.messages = [
        ...(updatedThread.messages || []),
        { text: message, created_at: new Date().toISOString() },
      ];
    }

    const { data, error } = await insforge.database
      .from('doc_comments')
      .update({
        thread: updatedThread,
        status: status || existing.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }

    return NextResponse.json({ comment: data });
  } catch (error: any) {
    console.error('Comments PATCH error:', error);
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
      return NextResponse.json({ error: 'Comment id required' }, { status: 400 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { error } = await insforge.database
      .from('doc_comments')
      .delete()
      .eq('id', id)
      .eq('doc_id', docId || projectId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Comments DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
