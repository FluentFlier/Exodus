'use client';

import { InsforgeBrowserProvider } from '@insforge/nextjs';
import { createClient } from '@insforge/sdk';
import { useMemo } from 'react';
import { ToastProvider } from '@/components/ui/Toast';

export function InsforgeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const client = useMemo(() => createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    }), []);

    return (
        <InsforgeBrowserProvider
            client={client}
            afterSignInUrl="/grants"
        >
            <ToastProvider>
                {children}
            </ToastProvider>
        </InsforgeBrowserProvider>
    );
}
