'use client';

export default function TeamList({ projectId }: { projectId: string }) {
    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="font-semibold text-gray-300 mb-4">Team</h3>
            <div className="text-sm text-gray-500 italic">
                Only you.
            </div>
            <button className="mt-4 w-full py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/50 rounded hover:bg-indigo-600/30 text-sm">
                + Invite Collaborator
            </button>
        </div>
    );
}
