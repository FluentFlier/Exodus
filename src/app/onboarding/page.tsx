'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@insforge/sdk';

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        institution: '',
        bio: '',
        tags: '',
        methods: '',
        collab_open: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Get current user
            const { data: { user } } = await insforge.auth.getUser();
            if (!user) throw new Error('No user found');

            // 2. Call API to update profile and generate embedding
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map(t => t.trim()),
                    methods: formData.methods.split(',').map(m => m.trim()),
                }),
            });

            if (!response.ok) throw new Error('Failed to update profile');

            router.push('/grants');
        } catch (error) {
            console.error(error);
            alert('Error saving profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
            <div className="max-w-2xl w-full space-y-8 bg-gray-900 p-8 rounded-2xl border border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold">Complete your Profile</h1>
                    <p className="text-gray-400 mt-2">Help us match you with the right grants and collaborators.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Institution</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.institution}
                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Bio / Research Interests</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Describe your research focus..."
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Key Tags (comma separated)</label>
                            <input
                                type="text"
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Genomics, AI, Public Health"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Methods (comma separated)</label>
                            <input
                                type="text"
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="PCR, Ethnography, Time-series"
                                value={formData.methods}
                                onChange={(e) => setFormData({ ...formData, methods: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="collab"
                            className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                            checked={formData.collab_open}
                            onChange={(e) => setFormData({ ...formData, collab_open: e.target.checked })}
                        />
                        <label htmlFor="collab" className="text-sm font-medium">Open to Collaboration</label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-md transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
