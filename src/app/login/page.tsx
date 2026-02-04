'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@insforge/nextjs';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, isSignedIn, isLoaded } = useAuth();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsSignUpMode(true);
    }
  }, [searchParams]);

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const redirectParam = searchParams.get('redirect');
      const redirectTo = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/grants';
      router.push(redirectTo);
    }
  }, [isLoaded, isSignedIn, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const redirectParam = searchParams.get('redirect');
      const redirectTo = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/grants';

      if (isSignUpMode) {
        // Use custom signup
        const response = await fetch('/api/auth/signup-no-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Sign up failed');
        }

        // Try to sign in the newly created user immediately
        const signInResult = await signIn(email, password);

        if ('error' in signInResult && signInResult.error) {
          const errorMsg = signInResult.error.toLowerCase();

          // Check if it's an email verification error
          if (errorMsg.includes('email') && (errorMsg.includes('confirm') || errorMsg.includes('verif'))) {
            // Email verification is required - provide helpful message
            setError('Account created! You can now sign in with your credentials (email verification is optional).');
            setIsSignUpMode(false);
            return;
          }

          throw new Error(signInResult.error);
        }

        // Give auth state a moment to update, then redirect
        setTimeout(() => {
          window.location.href = '/onboarding';
        }, 100);
      } else {
        const result = await signIn(email, password);
        if ('error' in result && result.error) {
          throw new Error(result.error || 'Sign in failed');
        }

        // Give auth state a moment to update, then redirect
        setTimeout(() => {
          // Use window.location for more reliable redirect
          window.location.href = redirectTo;
        }, 100);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse">
            <Logo size="lg" />
          </div>
          <p className="text-sm text-inkMuted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="lg" />
            <div>
              <div className="font-serif text-2xl text-ink">Exodus</div>
              <div className="text-xs text-inkMuted">Grant Intelligence</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-ink">
              {isSignUpMode ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-inkMuted">
              {isSignUpMode
                ? 'Start your journey to winning more grants.'
                : 'Sign in to continue your grant workspace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink/80 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-colors"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink/80 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-coral-50 border border-coral-500/30 text-sm text-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-teal text-white font-medium hover:bg-teal-600 focus:ring-2 focus:ring-teal focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isSignUpMode ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-inkMuted">
            {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              className="font-medium text-teal hover:text-teal-600"
            >
              {isSignUpMode ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-inkSubtle">
          <Link href="/" className="hover:text-ink">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
