import { createClient } from '@insforge/sdk';

// Singleton client for browser use
let browserClient: ReturnType<typeof createClient> | null = null;

export function getInsforgeClient() {
    if (typeof window === 'undefined') {
        // Server-side: create a new client each time
        return createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        });
    }

    // Browser-side: reuse the same client
    if (!browserClient) {
        browserClient = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        });
    }

    return browserClient;
}

// For direct import in client components
export const insforge = typeof window !== 'undefined'
    ? getInsforgeClient()
    : null;
