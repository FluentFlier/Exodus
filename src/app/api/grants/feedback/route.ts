import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

export async function POST(request: Request) {
  try {
    const { token } = await auth();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { grantId, rating, reason, notes } = await request.json();
    if (!grantId) {
      return NextResponse.json({ error: 'grantId is required' }, { status: 400 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: { user } } = await insforge.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { error } = await insforge.database.from('grant_feedback').insert({
      user_id: user.id,
      grant_id: grantId,
      rating,
      reason,
      notes,
      created_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Grant feedback error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
