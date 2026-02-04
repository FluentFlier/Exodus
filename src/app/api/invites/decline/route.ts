import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

export async function POST(request: Request) {
  try {
    const { token } = await auth();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteToken } = await request.json();
    if (!inviteToken) {
      return NextResponse.json({ error: 'Invite token required' }, { status: 400 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: userData } = await insforge.auth.getUser(token);
    const user = userData?.user;
    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: invite } = await insforge.database
      .from('project_invites')
      .select('*')
      .eq('token', inviteToken)
      .single();

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (invite.invited_email?.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Invite email does not match user' }, { status: 403 });
    }

    await insforge.database
      .from('project_invites')
      .update({ status: 'declined' })
      .eq('id', invite.id);

    if (invite.invited_by) {
      await insforge.database.from('notifications').insert({
        user_id: invite.invited_by,
        type: 'invite_declined',
        message: `${user.email} declined your invite.`,
        payload: { project_id: invite.project_id },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Invite decline error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
