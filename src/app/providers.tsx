'use client';
import { InsforgeBrowserProvider, type InitialAuthState } from '@insforge/nextjs';
import { createClient } from '@insforge/sdk';
import { useState } from 'react';

export function InsforgeProvider({
    children,
    initialAuthState,
}: {
    children: React.ReactNode;
    initialAuthState?: InitialAuthState;
}) {
    const [client] = useState(() => createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!
    }));

    return (
        <InsforgeBrowserProvider
            client={client}
            initialState={initialAuthState}
        >
            {children}
        </InsforgeBrowserProvider>
    );
}
