import { createAuthRouteHandlers } from '@insforge/nextjs/api';

const handlers = createAuthRouteHandlers({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://h2iv6ua5.us-west.insforge.app',
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const DELETE = handlers.DELETE;
