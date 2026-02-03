'use client';

import { useState, useEffect, useCallback } from 'react';

interface SlashCommandMenuProps {
    isOpen: boolean;
    position: { top: number; left: number };
    onSelect: (action: string) => void;
    onClose: () => void;
}

const COMMANDS = [
    { id: 'continue', label: 'Continue writing', icon: '➡️', description: 'AI continues from cursor' },
    { id: 'expand', label: 'Expand selection', icon: '📝', description: 'Add more detail to selected text' },
    { id: 'improve', label: 'Improve writing', icon: '✨', description: 'Enhance clarity and flow' },
    { id: 'summarize', label: 'Summarize', icon: '📋', description: 'Create a concise summary' },
    { id: 'specific_aims', label: 'Generate Specific Aims', icon: '🎯', description: 'Draft a Specific Aims section' },
    { id: 'significance', label: 'Generate Significance', icon: '💡', description: 'Draft a Significance section' },
    { id: 'innovation', label: 'Generate Innovation', icon: '🚀', description: 'Draft an Innovation section' },
    { id: 'approach', label: 'Generate Approach', icon: '🔬', description: 'Draft a Research Approach section' },
];

export default function SlashCommandMenu({ isOpen, position, onSelect, onClose }: SlashCommandMenuProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [filter, setFilter] = useState('');

    const filteredCommands = COMMANDS.filter(
        (cmd) =>
            cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
            cmd.description.toLowerCase().includes(filter.toLowerCase())
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((i) => (i + 1) % filteredCommands.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        onSelect(filteredCommands[selectedIndex].id);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        },
        [isOpen, filteredCommands, selectedIndex, onSelect, onClose]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
            style={{ top: position.top, left: position.left, minWidth: '280px' }}
        >
            <div className="p-2 border-b border-gray-700">
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search commands..."
                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                />
            </div>
            <div className="max-h-64 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                    <div className="p-3 text-gray-500 text-sm">No commands found</div>
                ) : (
                    filteredCommands.map((cmd, index) => (
                        <button
                            key={cmd.id}
                            onClick={() => onSelect(cmd.id)}
                            className={`w-full text-left px-3 py-2 flex items-center gap-3 ${
                                index === selectedIndex
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <span className="text-lg">{cmd.icon}</span>
                            <div>
                                <div className="text-sm font-medium">{cmd.label}</div>
                                <div className={`text-xs ${index === selectedIndex ? 'text-indigo-200' : 'text-gray-500'}`}>
                                    {cmd.description}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
            <div className="p-2 border-t border-gray-700 text-xs text-gray-500">
                ↑↓ Navigate • Enter Select • Esc Close
            </div>
        </div>
    );
}
