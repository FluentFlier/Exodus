'use client';

export default function TaskList({ projectId }: { projectId: string }) {
    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="font-semibold text-gray-300 mb-4">Tasks</h3>
            <div className="text-sm text-gray-500 italic">
                No tasks yet. (Not implemented)
            </div>
            <button className="mt-4 w-full py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm">
                + Add Task
            </button>
        </div>
    );
}
