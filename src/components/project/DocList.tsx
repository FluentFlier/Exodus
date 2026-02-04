'use client';

import { useEffect, useState } from 'react';

interface DocItem {
  id: string;
  title: string | null;
  doc_type: string | null;
}

export default function DocList({
  projectId,
  activeDocId,
  onSelectAction,
}: {
  projectId: string;
  activeDocId: string | null;
  onSelectAction: (doc: DocItem) => void;
}) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, [projectId]);

  const fetchDocs = async () => {
    try {
      await fetch(`/api/projects/${projectId}/docs`, { method: 'POST' });
      const res = await fetch(`/api/projects/${projectId}/docs`);
      const data = await res.json();
      if (data.docs) {
        setDocs(data.docs);
        if (!activeDocId && data.docs.length > 0) {
          onSelectAction(data.docs[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load docs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-inkMuted">Loading docs...</div>;
  }

  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelectAction(doc)}
          className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
            activeDocId === doc.id ? 'bg-tealSoft text-teal' : 'bg-panel text-inkMuted hover:text-ink'
          }`}
        >
          {doc.title}
        </button>
      ))}
    </div>
  );
}
