'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import CollaborativeEditor, { EditorRef } from '@/components/editor/Editor';
import TeamList from '@/components/project/TeamList';
import ArtifactsList from '@/components/project/ArtifactsList';
import AIActions from '@/components/project/AIActions';

export default function ProjectPage() {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const editorRef = useRef<EditorRef>(null);

    useEffect(() => {
        if (id) fetchProject(id as string);
    }, [id]);

    const fetchProject = async (projectId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            const data = await res.json();
            if (data.project) {
                setProject(data.project);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!editorRef.current || !project) return;

        setExporting(true);
        try {
            const documentHtml = editorRef.current.getHTML();

            const res = await fetch(`/api/projects/${project.id}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentHtml,
                    documentTitle: 'Research Proposal',
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Export failed');
                return;
            }

            // Download the HTML document
            const blob = new Blob([data.package.html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title || 'submission'}-proposal.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Download manifest
            const manifestBlob = new Blob(
                [JSON.stringify(data.package.manifest, null, 2)],
                { type: 'application/json' }
            );
            const manifestUrl = URL.createObjectURL(manifestBlob);
            const manifestLink = document.createElement('a');
            manifestLink.href = manifestUrl;
            manifestLink.download = `${project.title || 'submission'}-manifest.json`;
            document.body.appendChild(manifestLink);
            manifestLink.click();
            document.body.removeChild(manifestLink);
            URL.revokeObjectURL(manifestUrl);

            // Notify about artifacts
            if (data.package.artifacts?.length > 0) {
                alert(
                    `Document and manifest downloaded!\n\n` +
                    `You have ${data.package.artifacts.length} artifact(s) to download separately from the Artifacts panel.`
                );
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export submission');
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className="text-white p-8">Loading workspace...</div>;
    if (!project) return <div className="text-white p-8">Project not found</div>;

    return (
        <div className="h-screen bg-gray-950 flex flex-col text-white">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex justify-between items-center">
                <div>
                    <div className="text-xs text-indigo-400 uppercase font-bold tracking-wider mb-1">
                        Project Workspace
                    </div>
                    <h1 className="text-xl font-bold">{project.title || 'Untitled Project'}</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Grant: {project.grants?.title} ({project.grants?.funder})
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="flex -space-x-2">
                        {/* Team Avatars Placeholder */}
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs border-2 border-gray-900">ME</div>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-green-600 px-4 py-2 rounded text-sm font-semibold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exporting ? 'Exporting...' : '📦 Export Submission'}
                    </button>
                    <button className="bg-indigo-600 px-4 py-2 rounded text-sm font-semibold hover:bg-indigo-500">
                        Share
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <nav className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Documents</div>
                    <button className="text-left px-3 py-2 bg-gray-800 rounded text-sm text-white font-medium">
                        Research Proposal
                    </button>
                    <button className="text-left px-3 py-2 hover:bg-gray-800 rounded text-sm text-gray-400">
                        Budget Justification
                    </button>
                    <button className="text-left px-3 py-2 hover:bg-gray-800 rounded text-sm text-gray-400">
                        Data Management Plan
                    </button>
                </nav>

                {/* Editor Area */}
                <main className="flex-1 overflow-auto p-8 bg-gray-950">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-4 flex justify-between items-end border-b border-gray-800 pb-2">
                            <h2 className="text-2xl font-bold font-serif">Research Proposal</h2>
                            <span className="text-xs text-gray-500">Last edited just now</span>
                        </div>

                        {/* We use docId = project.id for the main proposal for simplicity in MVP */}
                        <CollaborativeEditor
                            ref={editorRef}
                            projectId={project.id}
                            docId={project.id}
                            grantInfo={{
                                title: project.grants?.title,
                                funder: project.grants?.funder,
                                description: project.grants?.description,
                            }}
                        />

                        <div className="mt-8 border-t border-gray-800 pt-8 text-gray-500 text-sm center">
                            <p>AI Suggestions enabled. Type "/" to insert blocks (pending).</p>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Agent Actions & Meta */}
                <aside className="w-80 bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-6 overflow-auto">
                    <AIActions
                        projectId={project.id}
                        getDocumentContent={() => editorRef.current?.getHTML() || ''}
                        grantInfo={{
                            title: project.grants?.title,
                            funder: project.grants?.funder,
                            eligibility_text: project.grants?.eligibility_text,
                        }}
                    />
                    <TeamList projectId={project.id} />
                    <ArtifactsList projectId={project.id} />
                </aside>
            </div>
        </div>
    );
}
