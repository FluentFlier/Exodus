import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';
import { getUserFromToken } from '@/lib/auth-helpers';

export interface Notification {
    id: string;
    type: 'grant_match' | 'deadline' | 'comment' | 'team' | 'ai_review' | 'compliance';
    title: string;
    message: string;
    created_at: string;
    read_at: string | null;
    action_url?: string;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1',
        type: 'grant_match',
        title: 'New Grant Match: 98% Fit',
        message: 'NSF CAREER Award matches your ML and neuroscience research profile',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read_at: null,
        action_url: '/grants',
    },
    {
        id: 'notif-2',
        type: 'deadline',
        title: 'Deadline Warning: 42 Days Left',
        message: 'NSF CAREER proposal deadline approaching on July 26, 2026',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        read_at: null,
        action_url: '/projects',
    },
    {
        id: 'notif-3',
        type: 'ai_review',
        title: 'AI Review Complete',
        message: 'Critical Review scored your proposal 4/5 with detailed feedback',
        created_at: new Date(Date.now() - 14400000).toISOString(),
        read_at: null,
        action_url: '/projects',
    },
    {
        id: 'notif-4',
        type: 'comment',
        title: 'New Comment from Dr. Singh',
        message: 'Commented on "Specific Aims" section - suggested revisions',
        created_at: new Date(Date.now() - 28800000).toISOString(),
        read_at: new Date(Date.now() - 14400000).toISOString(),
        action_url: '/projects',
    },
    {
        id: 'notif-5',
        type: 'team',
        title: 'Team Member Added',
        message: 'Luis Ortega joined NSF CAREER project as Methods Expert',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        read_at: new Date(Date.now() - 43200000).toISOString(),
        action_url: '/projects',
    },
    {
        id: 'notif-6',
        type: 'compliance',
        title: 'Compliance Check: 2 Issues Found',
        message: 'Page limit warning and missing budget justification detected',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        read_at: new Date(Date.now() - 86400000).toISOString(),
        action_url: '/projects',
    },
];

export async function GET() {
  try {
    const { token } = await auth();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: { user } } = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data, error } = await insforge.database
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Return mock data if no notifications in database
    if (error || !data || data.length === 0) {
      return NextResponse.json({
        notifications: MOCK_NOTIFICATIONS,
        unread_count: MOCK_NOTIFICATIONS.filter(n => !n.read_at).length,
      });
    }

    return NextResponse.json({
      notifications: data,
      unread_count: data.filter((n: any) => !n.read_at).length,
    });
  } catch (error: any) {
    console.error('Notifications GET error:', error);
    // Return mock data on error
    return NextResponse.json({
      notifications: MOCK_NOTIFICATIONS,
      unread_count: MOCK_NOTIFICATIONS.filter(n => !n.read_at).length,
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const { token } = await auth();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids, all } = await request.json();

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: userData } = await insforge.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const query = insforge.database
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (Array.isArray(ids) && ids.length > 0) {
      query.in('id', ids);
    }

    if (!all && (!Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ error: 'Specify ids or set all=true' }, { status: 400 });
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notifications PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
