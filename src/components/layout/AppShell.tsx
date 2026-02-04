'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@insforge/nextjs';

import { Logo } from '@/components/ui/Logo';

// Icons
const HomeIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const MenuIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

const navItems = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/grants', label: 'Grants', icon: SearchIcon },
  { href: '/projects', label: 'Projects', icon: FolderIcon },
  { href: '/collaborators', label: 'Collaborators', icon: UsersIcon },
  { href: '/analytics', label: 'Analytics', icon: ChartIcon },
];

const bottomNavItems = [
  { href: '/profile', label: 'Profile', icon: UserIcon },
  { href: '/notifications', label: 'Notifications', icon: BellIcon },
];

interface NearestDeadline {
  days: number;
  grantTitle: string;
  projectId: string;
}

export default function AppShell({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [nearestDeadline, setNearestDeadline] = useState<NearestDeadline | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchNearestDeadline = async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) return;
        const data = await res.json();
        const projects = data.projects || [];

        let nearest: NearestDeadline | null = null;
        for (const project of projects) {
          if (project.grants?.deadline) {
            const days = Math.ceil(
              (new Date(project.grants.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            if (days > 0 && (!nearest || days < nearest.days)) {
              nearest = {
                days,
                grantTitle: project.grants.title || 'Grant Application',
                projectId: project.id,
              };
            }
          }
        }
        setNearestDeadline(nearest);
      } catch {
        // Silently fail - widget will just not show
      }
    };

    fetchNearestDeadline();
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden btn-ghost p-2 -ml-2"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative transition-transform group-hover:scale-105">
              <Logo size="sm" />
            </div>
            <div className="hidden sm:block">
              <div className="font-serif text-lg tracking-tight">Exodus</div>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-panel/50 px-4 py-2 text-sm text-inkMuted hover:border-borderHover transition-colors w-72">
            <SearchIcon />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search grants, projects..."
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-inkMuted outline-none"
            />
            <kbd className="hidden lg:inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-2xs font-medium text-inkSubtle border border-border">
              <span>⌘</span>K
            </kbd>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="btn-icon btn-ghost relative"
            >
              <BellIcon />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-coral-500" />
            </Link>
            <Link href="/grants" className="btn-primary btn-sm">
              <PlusIcon />
              <span className="hidden sm:inline">New Project</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex pt-[57px]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-[57px] bottom-0 hidden w-60 flex-col border-r border-border bg-surface p-4 md:flex">
          {/* Main Navigation */}
          <nav className="flex-1 space-y-1">
            <div className="label px-3 py-2">Navigate</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active
                      ? 'bg-teal-50 text-teal font-medium'
                      : 'text-inkMuted hover:bg-panel hover:text-ink'
                    }`}
                >
                  <Icon />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-border pt-4 space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active
                      ? 'bg-teal-50 text-teal font-medium'
                      : 'text-inkMuted hover:bg-panel hover:text-ink'
                    }`}
                >
                  <Icon />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-inkMuted hover:bg-panel hover:text-ink transition-all disabled:opacity-50"
            >
              <LogoutIcon />
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          {/* Deadline Widget */}
          {nearestDeadline && (
            <div className={`mt-4 rounded-2xl p-4 border ${nearestDeadline.days <= 7
                ? 'bg-gradient-to-br from-coral-50 to-coral-100/50 border-coral-200/50'
                : nearestDeadline.days <= 30
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50'
                  : 'bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200/50'
              }`}>
              <div className={`label ${nearestDeadline.days <= 7 ? 'text-coral-600/70' :
                  nearestDeadline.days <= 30 ? 'text-amber-700/70' : 'text-teal-700/70'
                }`}>Upcoming Deadline</div>
              <div className={`mt-2 font-serif text-2xl ${nearestDeadline.days <= 7 ? 'text-coral-600' :
                  nearestDeadline.days <= 30 ? 'text-amber-700' : 'text-teal-700'
                }`}>{nearestDeadline.days} days</div>
              <div className={`text-xs mt-1 line-clamp-1 ${nearestDeadline.days <= 7 ? 'text-coral-500/80' :
                  nearestDeadline.days <= 30 ? 'text-amber-600/80' : 'text-teal-600/80'
                }`}>{nearestDeadline.grantTitle}</div>
              <Link
                href={`/projects/${nearestDeadline.projectId}`}
                className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${nearestDeadline.days <= 7 ? 'text-coral-600 hover:text-coral-700' :
                    nearestDeadline.days <= 30 ? 'text-amber-700 hover:text-amber-800' : 'text-teal-700 hover:text-teal-800'
                  }`}
              >
                View project
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-60">
          <div className={`mx-auto px-6 py-8 ${fullWidth ? 'max-w-[1680px]' : 'max-w-6xl'}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/30 z-50 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 bg-surface border-r border-border z-50 md:hidden animate-slide-in overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <Logo size="sm" />
                  <span className="font-serif text-lg">Exodus</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-ghost p-2"
                  aria-label="Close menu"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                <div className="label px-3 py-2">Navigate</div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active
                          ? 'bg-teal-50 text-teal font-medium'
                          : 'text-inkMuted hover:bg-panel hover:text-ink'
                        }`}
                    >
                      <Icon />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Navigation */}
              <div className="border-t border-border mt-4 pt-4 space-y-1">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active
                          ? 'bg-teal-50 text-teal font-medium'
                          : 'text-inkMuted hover:bg-panel hover:text-ink'
                        }`}
                    >
                      <Icon />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-inkMuted hover:bg-panel hover:text-ink transition-all disabled:opacity-50"
                >
                  <LogoutIcon />
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>

              {/* Deadline Widget */}
              {nearestDeadline && (
                <div className={`mt-6 rounded-2xl p-4 border ${nearestDeadline.days <= 7
                    ? 'bg-gradient-to-br from-coral-50 to-coral-100/50 border-coral-200/50'
                    : nearestDeadline.days <= 30
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50'
                      : 'bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200/50'
                  }`}>
                  <div className={`label ${nearestDeadline.days <= 7 ? 'text-coral-600/70' :
                      nearestDeadline.days <= 30 ? 'text-amber-700/70' : 'text-teal-700/70'
                    }`}>Upcoming Deadline</div>
                  <div className={`mt-2 font-serif text-2xl ${nearestDeadline.days <= 7 ? 'text-coral-600' :
                      nearestDeadline.days <= 30 ? 'text-amber-700' : 'text-teal-700'
                    }`}>{nearestDeadline.days} days</div>
                  <div className={`text-xs mt-1 line-clamp-1 ${nearestDeadline.days <= 7 ? 'text-coral-500/80' :
                      nearestDeadline.days <= 30 ? 'text-amber-600/80' : 'text-teal-600/80'
                    }`}>{nearestDeadline.grantTitle}</div>
                  <Link
                    href={`/projects/${nearestDeadline.projectId}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${nearestDeadline.days <= 7 ? 'text-coral-600 hover:text-coral-700' :
                        nearestDeadline.days <= 30 ? 'text-amber-700 hover:text-amber-800' : 'text-teal-700 hover:text-teal-800'
                      }`}
                  >
                    View project
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
