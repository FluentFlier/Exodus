'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

type NotificationItem = {
  id: string;
  type: string | null;
  message: string | null;
  payload: any;
  read_at: string | null;
  created_at: string | null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAll = async () => {
    setMarking(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } finally {
      setMarking(false);
    }
  };

  const markSingle = async (id: string) => {
    setMarking(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } finally {
      setMarking(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl">Notifications</h1>
              <p className="text-sm text-inkMuted">Invite updates, project changes, and activity alerts.</p>
            </div>
            <button
              onClick={markAll}
              disabled={marking}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-inkMuted"
            >
              {marking ? 'Updating...' : 'Mark all read'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-inkMuted">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="card p-6 text-sm text-inkMuted">No notifications yet.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-inkMuted">
                      {item.type || 'Update'}
                    </div>
                    <div className="mt-2 text-sm text-ink">{item.message}</div>
                    {item.created_at && (
                      <div className="mt-2 text-xs text-inkMuted">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  {item.read_at ? (
                    <span className="text-xs text-inkMuted">Read</span>
                  ) : (
                    <button
                      onClick={() => markSingle(item.id)}
                      className="rounded-full bg-tealSoft px-3 py-1 text-xs text-teal"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
