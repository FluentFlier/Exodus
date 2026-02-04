import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

const RESEND_URL = 'https://api.resend.com/emails';

const getAppBaseUrl = (request: Request) => {
  const envUrl = process.env.APP_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return new URL(request.url).origin;
};

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

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data, error } = await insforge.database
      .from('project_invites')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
    }

    return NextResponse.json({ invites: data || [] });
  } catch (error: any) {
    console.error('Invites GET error:', error);
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
    const { email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const validRoles = ['editor', 'viewer', 'co-pi'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: userData } = await insforge.auth.getUser(token);
    const inviterId = userData?.user?.id;
    const inviterEmail = userData?.user?.email;

    const normalizedEmail = String(email).toLowerCase().trim();

    const { data: inviterMembership } = await insforge.database
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('user_id', inviterId)
      .maybeSingle();

    if (!inviterMembership) {
      return NextResponse.json({ error: 'Not authorized to invite' }, { status: 403 });
    }

    const { data: invitedProfile } = await insforge.database
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (invitedProfile?.id) {
      const { data: alreadyMember } = await insforge.database
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId)
        .eq('user_id', invitedProfile.id)
        .maybeSingle();

      if (alreadyMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 409 });
      }
    }

    const { data: existingInvite } = await insforge.database
      .from('project_invites')
      .select('*')
      .eq('project_id', projectId)
      .eq('invited_email', normalizedEmail)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvite?.id) {
      return NextResponse.json({ invite: existingInvite });
    }

    const { data: project } = await insforge.database
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .single();

    const tokenValue = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

    const { data: invite, error } = await insforge.database
      .from('project_invites')
      .insert({
        project_id: projectId,
        invited_email: normalizedEmail,
        invited_by: inviterId || null,
        role: role || 'viewer',
        status: 'pending',
        token: tokenValue,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invite:', error);
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }

    const appBaseUrl = getAppBaseUrl(request);
    const inviteLink = `${appBaseUrl}/invites/${tokenValue}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111;">
          <h2>You are invited to join ${project?.title || 'a grant project'}</h2>
          <p>${inviterEmail || 'A teammate'} invited you to collaborate on Exodus.</p>
          <p>Click the button below to accept the invite:</p>
          <p style="margin: 24px 0;">
            <a href="${inviteLink}" style="background:#0f766e;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;">
              Accept invite
            </a>
          </p>
          <p>If the button does not work, copy and paste this link:</p>
          <p>${inviteLink}</p>
        </div>
      `;

      await fetch(RESEND_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Exodus <no-reply@exodus.ai>',
          to: normalizedEmail,
          subject: `Invitation to join ${project?.title || 'an Exodus project'}`,
          html,
        }),
      });
    }

    if (invitedProfile?.id) {
      await insforge.database.from('notifications').insert({
        user_id: invitedProfile.id,
        type: 'project_invite',
        message: `You were invited to join ${project?.title || 'a project'}.`,
        payload: { project_id: projectId, token: tokenValue },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ invite });
  } catch (error: any) {
    console.error('Invites POST error:', error);
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
    const inviteId = searchParams.get('id');

    if (!inviteId) {
      return NextResponse.json({ error: 'Invite id required' }, { status: 400 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { error } = await insforge.database
      .from('project_invites')
      .update({ status: 'revoked' })
      .eq('project_id', projectId)
      .eq('id', inviteId);

    if (error) {
      return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Invites DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
