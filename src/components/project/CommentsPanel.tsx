'use client';

import { useEffect, useState } from 'react';

interface CommentItem {
  id: string;
  thread: { messages: { text: string; created_at: string }[] } | null;
  created_at: string;
  status: string | null;
}

export default function CommentsPanel({ projectId, docId }: { projectId: string; docId: string | null }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!docId) {
      setComments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchComments();
  }, [projectId, docId]);

  const fetchComments = async () => {
    if (!docId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/docs/comments?docId=${docId}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/docs/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment, docId }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!docId) return;
    const res = await fetch(`/api/projects/${projectId}/docs/comments`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, docId }),
    });
    const data = await res.json();
    if (data.comment) {
      setComments((prev) => prev.map((item) => (item.id === id ? data.comment : item)));
    }
  };

  const deleteComment = async (id: string) => {
    if (!docId) return;
    const res = await fetch(
      `/api/projects/${projectId}/docs/comments?id=${id}&docId=${docId}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      setComments((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg">Comments</h3>
        <span className="text-xs text-inkMuted">{comments.length}</span>
      </div>
      <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
        {loading ? (
          <div className="text-xs text-inkMuted">Loading...</div>
        ) : comments.length === 0 ? (
          <div className="text-xs text-inkMuted italic">No comments yet.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-border bg-panel px-3 py-2 text-xs text-inkMuted">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
                <span>Thread</span>
                <span className="text-inkMuted">{comment.status || 'open'}</span>
              </div>
              <div className="mt-2 text-sm text-ink">
                {comment.thread?.messages?.[0]?.text || 'Comment'}
              </div>
              <div className="mt-2 flex gap-2">
                {comment.status !== 'resolved' && (
                  <button
                    onClick={() => updateStatus(comment.id, 'resolved')}
                    className="rounded-full bg-tealSoft px-2 py-1 text-[10px] text-teal"
                  >
                    Resolve
                  </button>
                )}
                {comment.status === 'resolved' && (
                  <button
                    onClick={() => updateStatus(comment.id, 'open')}
                    className="rounded-full bg-panel px-2 py-1 text-[10px] text-inkMuted"
                  >
                    Reopen
                  </button>
                )}
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="rounded-full bg-panel px-2 py-1 text-[10px] text-error"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={docId ? 'Leave a comment' : 'Select a document first'}
          className="flex-1 rounded-xl border border-border bg-panel px-3 py-2 text-sm text-ink outline-none"
          disabled={!docId}
        />
        <button
          onClick={addComment}
          className="rounded-full bg-teal px-3 py-2 text-xs text-white disabled:opacity-60"
          disabled={!docId}
        >
          Post
        </button>
      </div>
    </div>
  );
}
