import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@insforge/nextjs/server';

const publicRoutes = ['/', '/login', '/signup', '/onboarding', '/invites'];

function isPublicRoute(path: string) {
    return publicRoutes.some(route => path === route || path.startsWith(route + '/')); // Simple prefix check for now
}

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Skip static files and API routes (though we might want to protect API routes, let's stick to page protection for now to match verified gap)
    if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')) {
        return NextResponse.next();
    }

    if (isPublicRoute(path)) {
        return NextResponse.next();
    }

    // Protected route logic
    try {
        const { token } = await auth();

        if (!token) {
            const url = req.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('redirect', path);
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    } catch (e) {
        console.error('Middleware auth check failed:', e);
        // If auth fails, redirect to login
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
