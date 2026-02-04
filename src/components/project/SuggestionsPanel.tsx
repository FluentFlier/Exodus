'use client';

import { useEffect, useState } from 'react';

interface Suggestion {
  id: string;
  payload: { text?: string } | null;
  status: string | null;
}

export default function SuggestionsPanel({
  projectId,
  docId,
}: {
  projectId: string;
  docId: string | null;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState('');

  useEffect(() => {
    if (!docId) {
      setSuggestions([]);
      return;
    }
    fetch(`/api/projects/${projectId}/docs/suggestions?docId=${docId}`)
      .then((res) => res.json())
      .then((data) => setSuggestions(data.suggestions || []))
      .catch(() => setSuggestions([]));
  }, [projectId, docId]);

  const addSuggestion = async () => {
    if (!newSuggestion.trim() || !docId) return;
    const res = await fetch(`/api/projects/${projectId}/docs/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, text: newSuggestion }),
    });
    const data = await res.json();
    if (data.suggestion) {
      setSuggestions((prev) => [data.suggestion, ...prev]);
      setNewSuggestion('');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/projects/${projectId}/docs/suggestions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, docId }),
    });
    const data = await res.json();
    if (data.suggestion) {
      setSuggestions((prev) => prev.map((item) => (item.id === id ? data.suggestion : item)));
    }
  };

  const deleteSuggestion = async (id: string) => {
    if (!docId) return;
    const res = await fetch(
      `/api/projects/${projectId}/docs/suggestions?id=${id}&docId=${docId}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      setSuggestions((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg">Suggestions</h3>
        <span className="text-xs text-inkMuted">{suggestions.length}</span>
      </div>
      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {suggestions.length === 0 ? (
          <div className="text-xs text-inkMuted italic">No suggestions yet.</div>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="rounded-xl border border-border bg-panel px-3 py-2">
              <div className="text-sm text-ink">{suggestion.payload?.text || 'Suggestion'}</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => updateStatus(suggestion.id, 'accepted')}
                  className="rounded-full bg-tealSoft px-2 py-1 text-xs text-teal"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(suggestion.id, 'rejected')}
                  className="rounded-full bg-panel px-2 py-1 text-xs text-inkMuted"
                >
                  Reject
                </button>
                <button
                  onClick={() => deleteSuggestion(suggestion.id)}
                  className="rounded-full bg-panel px-2 py-1 text-xs text-error"
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
          value={newSuggestion}
          onChange={(e) => setNewSuggestion(e.target.value)}
          placeholder={docId ? 'Add a suggestion' : 'Select a document first'}
          className="flex-1 rounded-xl border border-border bg-panel px-3 py-2 text-sm text-ink outline-none"
          disabled={!docId}
        />
        <button
          onClick={addSuggestion}
          className="rounded-full bg-teal px-3 py-2 text-xs text-white disabled:opacity-60"
          disabled={!docId}
        >
          Add
        </button>
      </div>
    </div>
  );
}
