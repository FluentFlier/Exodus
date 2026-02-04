'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined' | 'error' | 'unauthorized'>(
    'pending'
  );
  const [message, setMessage] = useState('Validating invite...');

  useEffect(() => {
    if (!token) return;

    const acceptInvite = async () => {
      try {
        const res = await fetch('/api/invites/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteToken: token }),
        });

        if (res.status === 401) {
          setStatus('unauthorized');
          setMessage('Please sign in to accept this invitation.');
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Unable to accept invite.');
          return;
        }

        setStatus('accepted');
        setMessage('Invite accepted! Redirecting to project...');
        if (data.projectId) {
          setTimeout(() => router.push(`/projects/${data.projectId}`), 1000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Unable to accept invite.');
      }
    };

    void acceptInvite();
  }, [token, router]);

  const handleDecline = async () => {
    try {
      const res = await fetch('/api/invites/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteToken: token }),
      });

      if (res.status === 401) {
        setStatus('unauthorized');
        setMessage('Please sign in to decline this invitation.');
        return;
      }

      if (res.ok) {
        setStatus('declined');
        setMessage('Invite declined.');
      } else {
        const data = await res.json();
        setStatus('error');
        setMessage(data.error || 'Unable to decline invite.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Unable to decline invite.');
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
      <div className="card w-full max-w-lg p-8 text-center">
        <h1 className="font-serif text-2xl">Project Invitation</h1>
        <p className="mt-3 text-sm text-inkMuted">{message}</p>

        {status === 'unauthorized' && (
          <Link
            href={`/login?redirect=/invites/${token}`}
            className="mt-6 inline-flex rounded-full bg-teal px-4 py-2 text-sm text-white"
          >
            Sign in to continue
          </Link>
        )}

        {status === 'pending' && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={handleDecline}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-inkMuted"
            >
              Decline
            </button>
          </div>
        )}

        {status === 'declined' && (
          <Link href="/" className="mt-6 inline-flex text-sm text-inkMuted hover:text-ink">
            Return home
          </Link>
        )}
      </div>
    </div>
  );
}
