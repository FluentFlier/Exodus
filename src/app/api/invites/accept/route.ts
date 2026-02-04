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

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite is no longer active' }, { status: 400 });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    if (invite.invited_email?.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Invite email does not match user' }, { status: 403 });
    }

    const { data: existingMember } = await insforge.database
      .from('project_members')
      .select('user_id')
      .eq('project_id', invite.project_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingMember) {
      await insforge.database.from('project_members').insert({
        project_id: invite.project_id,
        user_id: user.id,
        role: invite.role || 'viewer',
        status: 'accepted',
        invited_email: invite.invited_email,
        invited_by: invite.invited_by,
        created_at: new Date().toISOString(),
      });
    }

    await insforge.database
      .from('project_invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    if (invite.invited_by) {
      await insforge.database.from('notifications').insert({
        user_id: invite.invited_by,
        type: 'invite_accepted',
        message: `${user.email} accepted your invite.`,
        payload: { project_id: invite.project_id },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, projectId: invite.project_id });
  } catch (error: any) {
    console.error('Invite accept error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
