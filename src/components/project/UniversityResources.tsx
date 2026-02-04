'use client';

import { useState } from 'react';
import type { UniversityFaculty, UniversityService } from '@/data/university-index';

interface UniversityResourcesProps {
    projectId: string;
    proposalContent: string;
}

export default function UniversityResources({ projectId, proposalContent }: UniversityResourcesProps) {
    const [suggestions, setSuggestions] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'faculty' | 'services'>('faculty');

    const findResources = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/university/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalText: proposalContent,
                    universityId: 'asu', // Default to ASU for now
                }),
            });

            const data = await res.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg bg-surface border border-panel p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-serif text-lg text-ink">University Resources</h3>
                    <p className="text-xs text-inkMuted mt-1">
                        AI-matched collaborators and services from ASU
                    </p>
                </div>
                <button
                    onClick={findResources}
                    disabled={loading || !proposalContent}
                    className="btn-primary btn-sm"
                >
                    {loading ? 'Analyzing...' : 'Find Matches'}
                </button>
            </div>

            {!suggestions && !loading && (
                <div className="text-center py-8 text-sm text-inkMuted">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    Click "Find Matches" to discover ASU faculty and services for this proposal
                </div>
            )}

            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-panel rounded-lg animate-pulse" />
                    ))}
                </div>
            )}

            {suggestions && (
                <>
                    {/* Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab('faculty')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'faculty'
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'bg-panel text-inkMuted hover:bg-panel/80'
                            }`}
                        >
                            Faculty ({suggestions.suggestions.faculty.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'services'
                                    ? 'bg-violet-50 text-violet-700'
                                    : 'bg-panel text-inkMuted hover:bg-panel/80'
                            }`}
                        >
                            Services ({suggestions.suggestions.services.length})
                        </button>
                    </div>

                    {/* Faculty Tab */}
                    {activeTab === 'faculty' && (
                        <div className="space-y-3">
                            {suggestions.suggestions.faculty.length === 0 ? (
                                <div className="text-center py-6 text-sm text-inkMuted">
                                    No faculty matches found for this proposal
                                </div>
                            ) : (
                                suggestions.suggestions.faculty.map((faculty: UniversityFaculty & { matchScore: number; matchReason: string }) => (
                                    <div key={faculty.id} className="rounded-lg bg-panel/50 border border-panel p-4 hover:border-teal/30 transition-colors">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div>
                                                <h4 className="font-medium text-ink">{faculty.name}</h4>
                                                <p className="text-xs text-inkMuted">{faculty.title} • {faculty.department}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-medium">
                                                    {Math.round(faculty.matchScore * 100)}% match
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${
                                                    faculty.availability === 'open' ? 'bg-teal' :
                                                    faculty.availability === 'limited' ? 'bg-amber' : 'bg-panel'
                                                }`} />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {faculty.expertise.slice(0, 3).map(exp => (
                                                <span key={exp} className="px-2 py-0.5 rounded-md bg-surface text-2xs text-ink border border-border">
                                                    {exp}
                                                </span>
                                            ))}
                                        </div>

                                        <p className="text-xs text-inkMuted mb-3">{faculty.matchReason}</p>

                                        {faculty.citations && (
                                            <div className="flex items-center gap-4 text-2xs text-inkMuted mb-3">
                                                <span>{faculty.citations.toLocaleString()} citations</span>
                                                {faculty.h_index && <span>h-index: {faculty.h_index}</span>}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`mailto:${faculty.email}`}
                                                className="btn-ghost btn-xs flex-1"
                                            >
                                                Email
                                            </a>
                                            {faculty.website && (
                                                <a
                                                    href={faculty.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-ghost btn-xs flex-1"
                                                >
                                                    Profile
                                                </a>
                                            )}
                                            <button className="btn-primary btn-xs flex-1">
                                                Invite to Project
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <div className="space-y-3">
                            {suggestions.suggestions.services.length === 0 ? (
                                <div className="text-center py-6 text-sm text-inkMuted">
                                    No service matches found for this proposal
                                </div>
                            ) : (
                                suggestions.suggestions.services.map((service: UniversityService & { matchScore: number; matchReason: string }) => (
                                    <div key={service.id} className="rounded-lg bg-panel/50 border border-panel p-4 hover:border-violet/30 transition-colors">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div>
                                                <h4 className="font-medium text-ink">{service.name}</h4>
                                                <p className="text-xs text-inkMuted capitalize">{service.type.replace('_', ' ')}</p>
                                            </div>
                                            <div className="px-2 py-1 rounded-md bg-violet-50 text-violet-700 text-xs font-medium">
                                                {Math.round(service.matchScore * 100)}% match
                                            </div>
                                        </div>

                                        <p className="text-xs text-inkMuted mb-3">{service.description}</p>

                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {service.capabilities.slice(0, 4).map(cap => (
                                                <span key={cap} className="px-2 py-0.5 rounded-md bg-surface text-2xs text-ink border border-border">
                                                    {cap}
                                                </span>
                                            ))}
                                        </div>

                                        <p className="text-xs text-inkMuted mb-3 italic">{service.matchReason}</p>

                                        {service.cost_structure && (
                                            <p className="text-xs text-amber-600 mb-3">💰 {service.cost_structure}</p>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`mailto:${service.contact_email}`}
                                                className="btn-ghost btn-xs flex-1"
                                            >
                                                Contact {service.contact_person}
                                            </a>
                                            {service.website && (
                                                <a
                                                    href={service.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-ghost btn-xs flex-1"
                                                >
                                                    Visit Website
                                                </a>
                                            )}
                                            <button className="btn-primary btn-xs flex-1">
                                                Add to Proposal
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
