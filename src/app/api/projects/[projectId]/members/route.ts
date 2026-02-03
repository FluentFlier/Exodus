import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

// GET - List all team members for a project
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

        // Fetch members with profile data
        const { data: members, error } = await insforge
            .from('project_members')
            .select('*, profiles(*)')
            .eq('project_id', projectId);

        if (error) {
            console.error('Error fetching members:', error);
            return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
        }

        return NextResponse.json({ members });
    } catch (error) {
        console.error('Error in GET /members:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Add a team member by email
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

        // Lookup user by email in profiles table
        const { data: profile, error: lookupError } = await insforge
            .from('profiles')
            .select('id, full_name, email, institution')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (lookupError || !profile) {
            return NextResponse.json(
                { error: 'User not found. They must sign up first.' },
                { status: 404 }
            );
        }

        // Check if already a member
        const { data: existing } = await insforge
            .from('project_members')
            .select('user_id')
            .eq('project_id', projectId)
            .eq('user_id', profile.id)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'User is already a team member' },
                { status: 409 }
            );
        }

        // Add to project_members
        const { error: insertError } = await insforge
            .from('project_members')
            .insert({
                project_id: projectId,
                user_id: profile.id,
                role: role || 'viewer',
            });

        if (insertError) {
            console.error('Error adding member:', insertError);
            return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            member: {
                user_id: profile.id,
                role: role || 'viewer',
                profiles: profile,
            },
        });
    } catch (error) {
        console.error('Error in POST /members:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove a team member
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
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const { error } = await insforge
            .from('project_members')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error removing member:', error);
            return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /members:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
