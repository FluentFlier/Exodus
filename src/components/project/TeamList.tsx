'use client';

import { useEffect, useState } from 'react';

interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    institution: string | null;
}

interface Member {
    project_id: string;
    user_id: string;
    role: string | null;
    profiles: Profile;
}

interface Invite {
    id: string;
    invited_email: string | null;
    role: string | null;
    status: string | null;
    created_at: string | null;
    token: string | null;
}

export default function TeamList({ projectId }: { projectId: string }) {
    const [members, setMembers] = useState<Member[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMembers();
    }, [projectId]);

    const fetchMembers = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/members`);
            const data = await res.json();
            if (data.members) {
                setMembers(data.members);
            }
            const inviteRes = await fetch(`/api/projects/${projectId}/invites`);
            const inviteData = await inviteRes.json();
            if (inviteData.invites) {
                setInvites(inviteData.invites);
            }
        } catch (err) {
            console.error('Failed to fetch members:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: any) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setInviting(true);
        setError('');

        try {
            const res = await fetch(`/api/projects/${projectId}/invites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to invite');
                return;
            }

            if (data.invite) {
                setInvites((prev) => [data.invite, ...prev]);
            }

            // Reset form and close modal
            setInviteEmail('');
            setInviteRole('editor');
            setShowModal(false);
        } catch (err) {
            setError('Failed to invite member');
        } finally {
            setInviting(false);
        }
    };

    const handleRemove = async (userId: string, name: string | null) => {
        if (!confirm(`Remove ${name || 'this member'} from the team?`)) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMembers((prev) => prev.filter((m) => m.user_id !== userId));
            }
        } catch (err) {
            console.error('Failed to remove member:', err);
        }
    };

    const handleRevoke = async (inviteId: string) => {
        if (!confirm('Revoke this invite?')) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/invites?id=${inviteId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
            }
        } catch (err) {
            console.error('Failed to revoke invite:', err);
        }
    };

    const getInviteLink = (token: string | null) => {
        if (!token) return '';
        return `${window.location.origin}/invites/${token}`;
    };

    const getRoleBadgeClass = (role: string | null) => {
        switch (role) {
            case 'co-pi':
                return 'bg-green-600/20 text-green-400 border-green-600/50';
            case 'editor':
                return 'bg-indigo-600/20 text-indigo-400 border-indigo-600/50';
            case 'viewer':
            default:
                return 'bg-gray-600/20 text-gray-400 border-gray-600/50';
        }
    };

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="font-semibold text-gray-300 mb-4">Team</h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                {loading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                ) : members.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">Only you.</div>
                ) : (
                    members.map((member) => (
                        <div
                            key={member.user_id}
                            className="flex items-center justify-between p-2 bg-gray-800 rounded group"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-medium">
                                    {getInitials(member.profiles?.full_name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm text-gray-200 truncate">
                                        {member.profiles?.full_name || 'Unknown'}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {member.profiles?.email}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-xs px-2 py-0.5 rounded border ${getRoleBadgeClass(member.role)}`}
                                >
                                    {member.role || 'viewer'}
                                </span>
                                <button
                                    onClick={() => handleRemove(member.user_id, member.profiles?.full_name)}
                                    className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {invites.length > 0 && (
                <div className="mt-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Pending Invites</div>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {invites.map((invite) => (
                            <div
                                key={invite.id}
                                className="flex items-center justify-between p-2 bg-gray-800 rounded"
                            >
                                <div className="min-w-0">
                                    <div className="text-sm text-gray-200 truncate">{invite.invited_email}</div>
                                    <div className="text-xs text-gray-500">{invite.role || 'viewer'} • {invite.status}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const link = getInviteLink(invite.token);
                                            if (link) void navigator.clipboard.writeText(link);
                                        }}
                                        className="text-xs text-indigo-300 hover:text-indigo-200"
                                    >
                                        Copy link
                                    </button>
                                    <button
                                        onClick={() => handleRevoke(invite.id)}
                                        className="text-xs text-red-400 hover:text-red-300"
                                    >
                                        Revoke
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={() => setShowModal(true)}
                className="mt-4 w-full py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/50 rounded hover:bg-indigo-600/30 text-sm"
            >
                + Invite Collaborator
            </button>

            {/* Invite Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
                        <h4 className="text-lg font-semibold text-white mb-4">
                            Invite Collaborator
                        </h4>

                        <form onSubmit={(e) => void handleInvite(e)}>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="collaborator@university.edu"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-2">
                                    Role
                                </label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="editor">Editor - Can edit documents</option>
                                    <option value="viewer">Viewer - Read-only access</option>
                                    <option value="co-pi">Co-PI - Full access</option>
                                </select>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setError('');
                                        setInviteEmail('');
                                    }}
                                    className="flex-1 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviting}
                                    className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 text-sm disabled:opacity-50"
                                >
                                    {inviting ? 'Inviting...' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
