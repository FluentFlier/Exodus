'use client';

import { useEffect, useState, useRef } from 'react';
import { Database } from '@/lib/database.types';

type Artifact = Database['public']['Tables']['artifacts']['Row'];

export default function ArtifactsList({ projectId }: { projectId: string }) {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchArtifacts();
    }, [projectId]);

    const fetchArtifacts = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/artifacts`);
            const data = await res.json();
            if (data.artifacts) {
                setArtifacts(data.artifacts);
            }
        } catch (error) {
            console.error('Error fetching artifacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            // For now, just save metadata (storage upload would need signed URLs)
            const timestamp = Date.now();
            const storagePath = `${projectId}/${timestamp}-${file.name}`;

            // Save artifact metadata via API
            const res = await fetch(`/api/projects/${projectId}/artifacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: file.name,
                    storagePath,
                    fileType: file.type || 'application/octet-stream',
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to save artifact');
                return;
            }

            // Refresh list
            await fetchArtifacts();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDownload = async (artifact: Artifact) => {
        // For now, just show a message since storage requires server-side signed URLs
        alert(`Download: ${artifact.name}\nStorage path: ${artifact.storage_path}\n\nNote: Full storage download requires InsForge storage configuration.`);
    };

    const handleDelete = async (artifact: Artifact) => {
        if (!confirm(`Delete "${artifact.name}"?`)) return;

        try {
            const res = await fetch(
                `/api/projects/${projectId}/artifacts?id=${artifact.id}&storagePath=${artifact.storage_path || ''}`,
                { method: 'DELETE' }
            );

            if (res.ok) {
                await fetchArtifacts();
            } else {
                alert('Failed to delete artifact');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete artifact');
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (fileType?: string | null) => {
        if (!fileType) return '📄';
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.includes('pdf')) return '📕';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
        if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
        return '📄';
    };

    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="font-semibold text-gray-300 mb-4">Artifacts</h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                {loading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                ) : artifacts.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">No artifacts uploaded.</div>
                ) : (
                    artifacts.map((artifact) => (
                        <div
                            key={artifact.id}
                            className="flex items-center justify-between p-2 bg-gray-800 rounded group"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span>{getFileIcon(artifact.file_type)}</span>
                                <span className="text-sm text-gray-300 truncate">
                                    {artifact.name}
                                </span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDownload(artifact)}
                                    className="p-1 text-gray-400 hover:text-white text-xs"
                                    title="Download"
                                >
                                    ⬇️
                                </button>
                                <button
                                    onClick={() => handleDelete(artifact)}
                                    className="p-1 text-gray-400 hover:text-red-400 text-xs"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleUpload}
                className="hidden"
                id={`artifact-upload-${projectId}`}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-4 w-full py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? 'Uploading...' : 'Upload File'}
            </button>
        </div>
    );
}
