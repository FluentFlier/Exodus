'use client';

import Link from 'next/link';
import { type FunctionComponent, useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';

// Icons
const SparklesIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const SearchIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);

const CheckBadgeIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);


export const LandingPage: FunctionComponent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            icon: <SearchIcon />,
            title: 'Smart Discovery',
            description: 'AI-powered grant matching using semantic embeddings. Analyzes your research profile to surface the highest-fit opportunities.',
            color: 'teal',
        },
        {
            icon: <UsersIcon />,
            title: 'Real-Time Collaboration',
            description: 'Write together like Google Docs—see your team\'s edits instantly, leave comments, and never worry about version conflicts. Perfect for multi-PI proposals.',
            color: 'violet',
        },
        {
            icon: <SparklesIcon />,
            title: 'AI Compliance Officer',
            description: 'Automatically checks formatting requirements, page limits, and submission guidelines. Identifies critical issues before you submit.',
            color: 'amber',
        },
        {
            icon: <CheckBadgeIcon />,
            title: 'Critical Reviewer',
            description: 'NSF-style peer review simulation with detailed scoring, strengths/weaknesses analysis, and recommendations for improvement.',
            color: 'sage',
        },
    ];

    const additionalFeatures = [
        {
            title: 'AI Co-Pilot',
            description: 'Get writing assistance, section suggestions, and citation formatting help. Your AI writing partner for proposals.',
            color: 'violet',
        },
        {
            title: 'Readiness Checklist',
            description: 'Track every required document, page limit, and formatting rule. Know exactly what\'s missing before deadline day.',
            color: 'amber',
        },
        {
            title: 'Profile Analytics',
            description: 'Create a research profile once. AI extracts your focus areas, methods, and expertise for better grant matching.',
            color: 'teal',
        },
        {
            title: 'Project Dashboard',
            description: 'Visualize progress across all applications. Track status, deadlines, and team activity in one central hub.',
            color: 'sage',
        },
    ];

    const stats = [
        { value: 'Real-Time', label: 'Collaboration' },
        { value: 'AI Agents', label: 'Working for You' },
        { value: 'Instant', label: 'Compliance Checks' },
    ];

    return (
        <div className="min-h-screen bg-paper text-ink overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative transition-transform group-hover:scale-105">
                            <Logo size="md" />
                        </div>
                        <div>
                            <div className="font-serif text-xl tracking-tight">Exodus</div>
                            <div className="text-2xs uppercase tracking-[0.2em] text-inkMuted">Grant Intelligence</div>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/grants" className="text-sm text-inkMuted hover:text-ink transition-colors">
                            Explore Grants
                        </Link>
                        <Link href="#features" className="text-sm text-inkMuted hover:text-ink transition-colors">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="text-sm text-inkMuted hover:text-ink transition-colors">
                            How it Works
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link href="/login" className="btn-ghost hidden sm:flex">
                            Log in
                        </Link>
                        <Link href="/login?signup=true" className="btn-primary">
                            Get Started
                            <ChevronRightIcon />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
                {/* Background decoration */}
                <div className="absolute inset-0 gradient-hero" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl" />

                <div className="relative mx-auto max-w-6xl px-6">
                    <div className={`grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {/* Left Column - Text */}
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm text-teal-700 mb-6">
                                <SparklesIcon />
                                <span>AI Agents • Real-Time Collaboration • Smart Matching</span>
                            </div>

                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-ink leading-[1.1]">
                                Write winning grants with{' '}
                                <span className="font-bold text-teal">grant intelligence</span>{' '}
                                and real-time collaboration
                            </h1>

                            <p className="mt-6 text-lg text-inkMuted leading-relaxed">
                                Exodus is grant intelligence infrastructure for universities—helping faculty make faster
                                go/no-go decisions, align collaborators early, and submit stronger proposals with shared workflows.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link href="/login?signup=true" className="btn-primary btn-lg group">
                                    Get Started
                                    <ArrowRightIcon />
                                </Link>
                                <Link href="/grants" className="btn-secondary btn-lg group">
                                    <SearchIcon />
                                    Explore Grants
                                </Link>
                                <Link href="/grants" className="text-sm text-inkMuted hover:text-ink transition-colors">
                                    Skip for now
                                </Link>
                            </div>

                            {/* Social Proof */}
                            <div className="mt-10 flex items-center gap-6">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="avatar avatar-sm border-2 border-surface" style={{ backgroundColor: ['#D1EBEB', '#FDE68A', '#E1EBE1', '#F3F1FA'][i - 1] }}>
                                            <span className="text-2xs" style={{ color: ['#0D7377', '#D97706', '#6B8E6B', '#8B7EC8'][i - 1] }}>
                                                {['JD', 'SM', 'AK', 'RW'][i - 1]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm text-inkMuted">
                                    Grant intelligence infrastructure for research teams
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Preview Card */}
                        <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <div className="relative">
                                {/* Glow effect */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-teal-200/50 via-transparent to-amber-200/50 rounded-3xl blur-2xl opacity-60" />

                                {/* Main card */}
                                <div className="relative card p-6 lg:p-8 shadow-xl">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4 pb-5 border-b border-border">
                                        <div>
                                            <div className="label mb-2">Live Opportunity</div>
                                            <h3 className="font-serif text-xl lg:text-2xl">NSF CAREER Award</h3>
                                            <p className="text-sm text-inkMuted mt-1">Faculty Early Career Development</p>
                                        </div>
                                        <div className="badge-teal">
                                            <span className="font-semibold">98%</span> match
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 py-5 border-b border-border">
                                        <div>
                                            <div className="text-2xs text-inkMuted mb-1">Deadline</div>
                                            <div className="font-semibold text-amber-600">42 days</div>
                                        </div>
                                        <div>
                                            <div className="text-2xs text-inkMuted mb-1">Award</div>
                                            <div className="font-semibold">$500K+</div>
                                        </div>
                                        <div>
                                            <div className="text-2xs text-inkMuted mb-1">Duration</div>
                                            <div className="font-semibold">5 years</div>
                                        </div>
                                    </div>

                                    {/* AI Insights */}
                                    <div className="py-5 space-y-3">
                                        <div className="label">AI Analysis</div>
                                        {[
                                            { icon: '🎯', text: 'Semantic match score: 98% based on research profile signals' },
                                            { icon: '📋', text: 'Compliance check ready - 8 requirements tracked' },
                                            { icon: '⭐', text: 'Competitive score prediction available after draft' },
                                        ].map((insight, i) => (
                                            <div key={i} className="flex items-start gap-3 rounded-xl bg-panel/60 px-4 py-3">
                                                <span className="text-lg">{insight.icon}</span>
                                                <span className="text-sm text-inkMuted">{insight.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <Link href="/login?signup=true" className="w-full btn-primary mt-2">
                                        Start Application
                                        <ArrowRightIcon />
                                    </Link>
                                </div>

                                {/* Floating elements */}
                                <div className="absolute -top-4 -right-4 card p-3 shadow-lg animate-float">
                                    <div className="flex items-center gap-2">
                                        <div className="status-dot-success" />
                                        <span className="text-xs font-medium">Real-time sync</span>
                                    </div>
                                </div>

                                <div className="absolute -bottom-4 -left-4 card p-3 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon />
                                        <span className="text-xs font-medium text-teal">AI Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="relative py-12 bg-ink">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="grid grid-cols-3 gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="font-serif text-3xl lg:text-4xl text-white">{stat.value}</div>
                                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 lg:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="label mb-4">Features</div>
                        <h2 className="font-serif text-3xl lg:text-4xl tracking-tight">
                            Everything you need to win grants
                        </h2>
                        <p className="mt-4 text-inkMuted">
                            From discovery to submission, Exodus streamlines every step of the grant application process.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="card-hover p-8 group"
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${feature.color === 'teal' ? 'bg-teal-50 text-teal' :
                                    feature.color === 'violet' ? 'bg-violet-50 text-violet' :
                                        feature.color === 'amber' ? 'bg-amber-50 text-amber' :
                                            'bg-sage-50 text-sage'
                                    }`}>
                                    {feature.icon}
                                </div>
                                <h3 className="font-serif text-xl mb-3 group-hover:text-teal transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-inkMuted leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features */}
            <section className="py-20 lg:py-32 bg-surface">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="label mb-4">More Capabilities</div>
                        <h2 className="font-serif text-3xl lg:text-4xl tracking-tight">
                            Powered by intelligent automation
                        </h2>
                        <p className="mt-4 text-inkMuted">
                            Beyond the basics, Exodus includes advanced tools to streamline every aspect of grant applications.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {additionalFeatures.map((feature, i) => (
                            <div
                                key={i}
                                className="rounded-xl bg-paper border border-border p-6 hover:border-teal/30 transition-colors"
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${feature.color === 'teal' ? 'bg-teal-50' :
                                    feature.color === 'violet' ? 'bg-violet-50' :
                                        feature.color === 'amber' ? 'bg-amber-50' :
                                            'bg-sage-50'
                                    }`}>
                                    <div className={`w-3 h-3 rounded-full ${feature.color === 'teal' ? 'bg-teal' :
                                        feature.color === 'violet' ? 'bg-violet' :
                                            feature.color === 'amber' ? 'bg-amber' :
                                                'bg-sage'
                                        }`} />
                                </div>
                                <h3 className="font-serif text-lg mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-inkMuted leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 lg:py-32 bg-panel/50">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="label mb-4">How It Works</div>
                        <h2 className="font-serif text-3xl lg:text-4xl tracking-tight">
                            From profile to submission in 6 steps
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
                        {[
                            { step: '01', title: 'Create Profile', desc: 'Capture your research focus, methods, and expertise once.' },
                            { step: '02', title: 'Get Matched', desc: 'Semantic search finds grants aligned with your profile.' },
                            { step: '03', title: 'Start Project', desc: 'Create workspace with team members and collaborators.' },
                            { step: '04', title: 'Write Together', desc: 'Real-time editing with AI assistance.' },
                            { step: '05', title: 'AI Review', desc: 'Compliance check and peer review simulation.' },
                            { step: '06', title: 'Export & Submit', desc: 'Package documents ready for submission portal.' },
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className="text-5xl lg:text-6xl font-serif text-teal-300 font-bold mb-3">{item.step}</div>
                                <h3 className="font-serif text-base lg:text-lg mb-2">{item.title}</h3>
                                <p className="text-xs lg:text-sm text-inkMuted leading-relaxed">{item.desc}</p>
                                {i < 5 && (
                                    <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 text-teal-200">
                                        <ChevronRightIcon />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-100/50 via-transparent to-amber-100/50 rounded-3xl blur-3xl" />
                        <div className="relative card p-12 lg:p-16 shadow-xl">
                            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight mb-4">
                                Ready to transform your grant process?
                            </h2>
                            <p className="text-inkMuted text-lg mb-8 max-w-xl mx-auto">
                                Make faster go/no-go decisions, align collaborators early, and submit stronger proposals.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/login?signup=true" className="btn-primary btn-lg">
                                    Get Started
                                    <ArrowRightIcon />
                                </Link>
                                <Link href="/grants" className="btn-secondary btn-lg">
                                    Browse Grants
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12 bg-surface">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Logo size="sm" />
                            <span className="font-serif text-lg">Exodus</span>
                        </div>
                        <div className="flex items-center gap-8 text-sm text-inkMuted">
                            <Link href="/grants" className="hover:text-ink transition-colors">Grants</Link>
                            <Link href="#features" className="hover:text-ink transition-colors">Features</Link>
                            <Link href="/login" className="hover:text-ink transition-colors">Login</Link>
                        </div>
                        <div className="text-sm text-inkMuted">
                            &copy; {new Date().getFullYear()} Exodus. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
