'use client';

import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
      <div className="card max-w-lg p-8 text-center">
        <h1 className="font-serif text-2xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-inkMuted">{error.message || 'Unexpected error.'}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-full bg-teal px-4 py-2 text-sm text-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-inkMuted"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
