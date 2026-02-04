'use client';

import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string | null;
  status: 'todo' | 'in_progress' | 'done' | null;
  due_date: string | null;
}

export default function TaskList({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => [...prev, data.task]);
        setNewTask('');
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (taskId: string, status: Task['status']) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => prev.map((task) => (task.id === taskId ? data.task : task)));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg">Tasks & Milestones</h3>
        <span className="text-xs text-inkMuted">{tasks.length} tasks</span>
      </div>

      <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
        {loading ? (
          <div className="text-sm text-inkMuted">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-sm text-inkMuted italic">No tasks yet.</div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-xl border border-border bg-panel px-3 py-2"
            >
              <div>
                <div className="text-sm text-ink">{task.title}</div>
                {task.due_date && (
                  <div className="text-xs text-inkMuted">
                    Due {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              <select
                value={task.status || 'todo'}
                onChange={(e) => updateStatus(task.id, e.target.value as Task['status'])}
                className="rounded-full border border-border bg-surface px-2 py-1 text-xs text-inkMuted"
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task"
          className="flex-1 rounded-xl border border-border bg-panel px-3 py-2 text-sm text-ink outline-none"
        />
        <button
          onClick={addTask}
          disabled={saving}
          className="rounded-full bg-teal px-4 py-2 text-sm text-white"
        >
          {saving ? 'Saving' : 'Add'}
        </button>
      </div>
    </div>
  );
}
