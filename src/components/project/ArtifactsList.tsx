'use client';

import { useEffect, useState, useRef } from 'react';
import { Database } from '@/lib/database.types';

type Artifact = Database['public']['Tables']['artifacts']['Row'] & {
    download_url?: string | null;
    size_bytes?: number | null;
};

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
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/projects/${projectId}/artifacts`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to upload file');
                return;
            }

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
        if (!artifact.download_url) {
            alert('Download not available yet.');
            return;
        }
        window.open(artifact.download_url, '_blank', 'noopener,noreferrer');
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

    const formatFileSize = (bytes?: number | null) => {
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
        <div className="card p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg">Artifacts</h3>
                <span className="text-xs text-inkMuted">{artifacts.length} files</span>
            </div>

            <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
                {loading ? (
                    <div className="text-sm text-inkMuted">Loading...</div>
                ) : artifacts.length === 0 ? (
                    <div className="text-sm text-inkMuted italic">No artifacts uploaded.</div>
                ) : (
                    artifacts.map((artifact) => (
                        <div
                            key={artifact.id}
                            className="flex items-center justify-between rounded-xl border border-border bg-panel px-3 py-2"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span>{getFileIcon(artifact.file_type)}</span>
                                <div className="min-w-0">
                                    <div className="text-sm text-ink truncate">{artifact.name}</div>
                                    <div className="text-xs text-inkMuted">
                                        {artifact.file_type || 'file'} {artifact.size_bytes ? `• ${formatFileSize(artifact.size_bytes)}` : ''}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleDownload(artifact)}
                                    className="rounded-full bg-surface px-2 py-1 text-xs text-inkMuted hover:text-ink"
                                    title="Download"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => handleDelete(artifact)}
                                    className="rounded-full bg-surface px-2 py-1 text-xs text-error"
                                    title="Delete"
                                >
                                    Remove
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
                className="mt-4 w-full rounded-full bg-teal px-4 py-2 text-sm text-white disabled:opacity-60"
            >
                {uploading ? 'Uploading...' : 'Upload file'}
            </button>
        </div>
    );
}
