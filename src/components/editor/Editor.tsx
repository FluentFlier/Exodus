'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { useEffect, useState } from 'react';
import { createClient } from '@insforge/sdk';
import { InsForgeProvider } from '@/lib/yjs-insforge-provider'; // Custom provider

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

export default function CollaborativeEditor({ projectId, docId }: { projectId: string; docId: string }) {
    const [ydoc] = useState(() => new Y.Doc());
    const [provider, setProvider] = useState<InsForgeProvider | null>(null);

    useEffect(() => {
        // Initialize provider
        const channelName = `project:${projectId}`;
        const newProvider = new InsForgeProvider(insforge, channelName, ydoc);
        setProvider(newProvider);

        return () => {
            newProvider.disconnect();
        };
    }, [projectId, ydoc]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false, // Y.js handles history
            }),
            Collaboration.configure({
                document: ydoc,
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-4 bg-gray-900 rounded-lg border border-gray-800',
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="w-full">
            <div className="border-b border-gray-800 p-2 text-sm text-gray-500 flex justify-between">
                <span>Status: {provider ? 'Connected' : 'Connecting...'}</span>
                <span>Doc ID: {docId}</span>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
