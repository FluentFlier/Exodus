import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@insforge/sdk';
import { Database } from '@/lib/database.types';
import CollaborativeEditor from '@/components/editor/Editor';
import TeamList from '@/components/project/TeamList';
import TaskList from '@/components/project/TaskList';
import ArtifactsList from '@/components/project/ArtifactsList';

const insforge = createClient<Database>({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

export default function ProjectPage() {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchProject(id as string);
    }, [id]);

    const fetchProject = async (projectId: string) => {
        const { data } = await insforge
            .from('projects')
            .select('*, grants(*)') // Join with grants
            .eq('id', projectId)
            .single();

        setProject(data);
        setLoading(false);
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
                </div>
                <h1 className="text-xl font-bold">{project.title || 'Untitled Project'}</h1>
                <p className="text-xs text-gray-500 mt-1">
                    Grant: {project.grants?.title} ({project.grants?.funder})
                </p>
                <div className="flex gap-3">
                    <div className="flex -space-x-2">
                        {/* Team Avatars Placeholder */}
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs border-2 border-gray-900">ME</div>
                    </div>
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
                        <CollaborativeEditor projectId={project.id} docId={project.id} />

                        <div className="mt-8 border-t border-gray-800 pt-8 text-gray-500 text-sm center">
                            <p>AI Suggestions enabled. Type "/" to insert blocks (pending).</p>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Agent Actions & Meta */}
                <aside className="w-72 bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-6 overflow-auto">
                    <TeamList projectId={project.id} />
                    <TaskList projectId={project.id} />
                    <ArtifactsList projectId={project.id} />
                </aside>
            </div>
        </div>
    );
}
