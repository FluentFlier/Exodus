import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { token } = await auth();

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token || undefined,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        });

        const authObj = (insforge as any).auth;
        const proto = authObj ? Object.getPrototypeOf(authObj) : null;

        console.log('--- INSFORGE DEBUG DEEP ---');
        console.log('auth object:', authObj);
        console.log('auth prototype keys:', proto ? Object.getOwnPropertyNames(proto) : 'no proto');
        console.log('typeof auth.getUser:', typeof (authObj?.getUser));
        console.log('typeof auth.user:', typeof (authObj?.user));
        console.log('token:', token ? 'Present' : 'Missing');
        console.log('--- END DEBUG ---');

        return NextResponse.json({
            authKeys: authObj ? Object.keys(authObj) : null,
            protoKeys: proto ? Object.getOwnPropertyNames(proto) : null,
            hasGetUser: typeof authObj?.getUser === 'function'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
