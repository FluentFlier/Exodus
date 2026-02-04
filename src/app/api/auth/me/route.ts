import { NextResponse } from 'next/server';
import { auth } from '@insforge/nextjs/server';
import { getUserFromToken } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Use manual decoding since SDK auth methods are missing
        const { data: { user }, error } = getUserFromToken(token);

        if (error || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}
