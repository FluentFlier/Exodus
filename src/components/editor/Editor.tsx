'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { createClient } from '@insforge/sdk';
import { InsForgeProvider } from '@/lib/yjs-insforge-provider';
import SlashCommandMenu from './SlashCommandMenu';

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

export interface EditorRef {
    getHTML: () => string;
    getJSON: () => object;
}

interface CollaborativeEditorProps {
    projectId: string;
    docId: string;
    grantInfo?: {
        title?: string;
        funder?: string;
        description?: string;
    };
}

const CollaborativeEditor = forwardRef<EditorRef, CollaborativeEditorProps>(
    ({ projectId, docId, grantInfo }, ref) => {
        const [ydoc] = useState(() => new Y.Doc());
        const [provider, setProvider] = useState<InsForgeProvider | null>(null);
        const [showSlashMenu, setShowSlashMenu] = useState(false);
        const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
        const [isGenerating, setIsGenerating] = useState(false);

        useEffect(() => {
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
                    // @ts-expect-error - Y.js handles history, disable built-in
                    history: false,
                }),
                Collaboration.configure({
                    document: ydoc,
                }),
            ],
            editorProps: {
                attributes: {
                    class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-4 bg-gray-900 rounded-lg border border-gray-800',
                },
                handleKeyDown: (view, event) => {
                    if (event.key === '/' && !showSlashMenu) {
                        // Get cursor position for menu placement
                        const { from } = view.state.selection;
                        const coords = view.coordsAtPos(from);
                        setSlashMenuPosition({
                            top: coords.bottom + 5,
                            left: coords.left,
                        });
                        setShowSlashMenu(true);
                        return false; // Let the "/" be typed
                    }
                    if (showSlashMenu && event.key === 'Escape') {
                        setShowSlashMenu(false);
                        return true;
                    }
                    return false;
                },
            },
            onUpdate: ({ editor }) => {
                // Close slash menu if user types something other than a command
                const text = editor.getText();
                if (showSlashMenu && !text.endsWith('/')) {
                    // Give a small delay to allow command selection
                    setTimeout(() => {
                        const currentText = editor.getText();
                        if (!currentText.includes('/')) {
                            setShowSlashMenu(false);
                        }
                    }, 100);
                }
            },
        });

        const handleSlashCommand = useCallback(async (action: string) => {
            if (!editor || isGenerating) return;

            setShowSlashMenu(false);
            setIsGenerating(true);

            // Remove the "/" that triggered the menu
            const { from } = editor.state.selection;
            const textBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from);
            if (textBefore === '/') {
                editor.commands.deleteRange({ from: from - 1, to: from });
            }

            try {
                // Get context from document
                const docContent = editor.getText();
                const selectedText = editor.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to
                );

                // Map action to prompt
                let prompt = selectedText || docContent.slice(-1000);
                let apiAction = action;

                // Handle section generation
                if (action.startsWith('specific_aims')) {
                    prompt = 'Specific Aims';
                    apiAction = 'generate_section';
                } else if (action.startsWith('significance')) {
                    prompt = 'Significance';
                    apiAction = 'generate_section';
                } else if (action.startsWith('innovation')) {
                    prompt = 'Innovation';
                    apiAction = 'generate_section';
                } else if (action.startsWith('approach')) {
                    prompt = 'Research Approach';
                    apiAction = 'generate_section';
                }

                // Insert loading indicator
                editor.commands.insertContent('<span class="text-gray-500">⏳ Generating...</span>');
                const loadingPos = editor.state.selection.from;

                const res = await fetch('/api/ai/copilot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        action: apiAction,
                        context: docContent.slice(-2000),
                        grantInfo,
                    }),
                });

                const data = await res.json();

                // Remove loading indicator
                editor.commands.setTextSelection({ from: loadingPos - 25, to: loadingPos });
                editor.commands.deleteSelection();

                if (data.success && data.text) {
                    // Insert the generated text
                    editor.commands.insertContent(data.text);
                } else {
                    editor.commands.insertContent('[AI generation failed - try again]');
                }
            } catch (error) {
                console.error('Co-pilot error:', error);
                editor.commands.insertContent('[Error generating content]');
            } finally {
                setIsGenerating(false);
            }
        }, [editor, isGenerating, grantInfo]);

        useImperativeHandle(ref, () => ({
            getHTML: () => editor?.getHTML() || '',
            getJSON: () => editor?.getJSON() || {},
        }), [editor]);

        if (!editor) {
            return null;
        }

        return (
            <div className="w-full relative">
                <div className="border-b border-gray-800 p-2 text-sm text-gray-500 flex justify-between items-center">
                    <span>Status: {provider ? 'Connected' : 'Connecting...'}</span>
                    <div className="flex items-center gap-4">
                        {isGenerating && (
                            <span className="text-indigo-400 animate-pulse">AI generating...</span>
                        )}
                        <span className="text-xs">Type / for AI commands</span>
                    </div>
                </div>
                <EditorContent editor={editor} />
                <SlashCommandMenu
                    isOpen={showSlashMenu}
                    position={slashMenuPosition}
                    onSelect={handleSlashCommand}
                    onClose={() => setShowSlashMenu(false)}
                />
            </div>
        );
    }
);

CollaborativeEditor.displayName = 'CollaborativeEditor';

export default CollaborativeEditor;
