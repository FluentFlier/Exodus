'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@insforge/sdk';
import { Database } from '@/lib/database.types';

const insforge = createClient<Database>({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

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
        const { data, error } = await insforge
            .from('artifacts')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setArtifacts(data);
        }
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            // Generate unique storage path
            const timestamp = Date.now();
            const storagePath = `${projectId}/${timestamp}-${file.name}`;

            // Upload to InsForge Storage
            const { error: uploadError } = await insforge.storage
                .from('artifacts')
                .upload(storagePath, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                alert('Failed to upload file');
                return;
            }

            // Store metadata in database
            const { error: dbError } = await insforge
                .from('artifacts')
                .insert({
                    project_id: projectId,
                    name: file.name,
                    storage_path: storagePath,
                    file_type: file.type || 'application/octet-stream',
                    is_required: false,
                });

            if (dbError) {
                console.error('Database error:', dbError);
                alert('Failed to save artifact metadata');
                return;
            }

            // Refresh list
            await fetchArtifacts();
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDownload = async (artifact: Artifact) => {
        if (!artifact.storage_path) return;

        // Get signed URL for download
        const { data, error } = await insforge.storage
            .from('artifacts')
            .createSignedUrl(artifact.storage_path, 60); // 60 seconds expiry

        if (error || !data?.signedUrl) {
            console.error('Failed to get download URL:', error);
            alert('Failed to get download link');
            return;
        }

        // Open in new tab or trigger download
        window.open(data.signedUrl, '_blank');
    };

    const handleDelete = async (artifact: Artifact) => {
        if (!confirm(`Delete "${artifact.name}"?`)) return;

        // Delete from storage
        if (artifact.storage_path) {
            await insforge.storage
                .from('artifacts')
                .remove([artifact.storage_path]);
        }

        // Delete from database
        await insforge
            .from('artifacts')
            .delete()
            .eq('id', artifact.id);

        // Refresh list
        await fetchArtifacts();
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
