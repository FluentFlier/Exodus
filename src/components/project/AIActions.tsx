'use client';

import { useState } from 'react';

interface AIActionsProps {
    projectId: string;
    getDocumentContent: () => string;
    grantInfo?: {
        title?: string;
        funder?: string;
        eligibility_text?: string;
    };
}

interface ComplianceIssue {
    severity: 'critical' | 'major' | 'minor';
    requirement: string;
    finding: string;
    suggestion: string;
}

interface ComplianceResult {
    compliant: boolean;
    score: number;
    issues: ComplianceIssue[];
    summary: string;
}

interface ReviewCriterion {
    score: number;
    strengths: string[];
    weaknesses: string[];
}

interface ReviewResult {
    overallScore: number;
    overallImpact: string;
    criteria?: {
        significance?: ReviewCriterion;
        innovation?: ReviewCriterion;
        approach?: ReviewCriterion;
        investigator?: ReviewCriterion;
        environment?: ReviewCriterion;
    };
    summary: string;
    recommendations?: string[];
}

export default function AIActions({ projectId, getDocumentContent, grantInfo }: AIActionsProps) {
    const [activeTab, setActiveTab] = useState<'compliance' | 'review' | 'copilot'>('compliance');
    const [loading, setLoading] = useState(false);
    const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
    const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
    const [copilotPrompt, setCopilotPrompt] = useState('');
    const [copilotResult, setCopilotResult] = useState('');

    const runComplianceCheck = async () => {
        const content = getDocumentContent();
        if (!content || content.length < 50) {
            alert('Please write some content in the proposal first.');
            return;
        }

        setLoading(true);
        setComplianceResult(null);

        try {
            const res = await fetch('/api/ai/compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalText: content,
                    eligibilityText: grantInfo?.eligibility_text || 'General academic research grant eligibility.',
                    grantTitle: grantInfo?.title,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setComplianceResult(data.analysis);
            } else {
                alert(data.error || 'Compliance check failed');
            }
        } catch (error) {
            alert('Failed to run compliance check');
        } finally {
            setLoading(false);
        }
    };

    const runReview = async () => {
        const content = getDocumentContent();
        if (!content || content.length < 100) {
            alert('Please write more content in the proposal first (at least a few paragraphs).');
            return;
        }

        setLoading(true);
        setReviewResult(null);

        try {
            const res = await fetch('/api/ai/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalText: content,
                    grantTitle: grantInfo?.title,
                    reviewCriteria: 'NIH',
                }),
            });

            const data = await res.json();
            if (data.success) {
                setReviewResult(data.review);
            } else {
                alert(data.error || 'Review failed');
            }
        } catch (error) {
            alert('Failed to run review');
        } finally {
            setLoading(false);
        }
    };

    const runCopilot = async (action?: string) => {
        if (!copilotPrompt.trim() && !action) {
            alert('Please enter a prompt or select content.');
            return;
        }

        setLoading(true);
        setCopilotResult('');

        try {
            const res = await fetch('/api/ai/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: copilotPrompt,
                    action: action || 'assist',
                    context: getDocumentContent().slice(0, 2000), // Last 2000 chars for context
                    grantInfo,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setCopilotResult(data.text);
            } else {
                alert(data.error || 'Co-pilot failed');
            }
        } catch (error) {
            alert('Failed to get AI assistance');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-400 bg-red-900/30 border-red-700';
            case 'major': return 'text-orange-400 bg-orange-900/30 border-orange-700';
            case 'minor': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
            default: return 'text-gray-400 bg-gray-900/30 border-gray-700';
        }
    };

    const getScoreColor = (score: number) => {
        if (score <= 3) return 'text-green-400';
        if (score <= 5) return 'text-yellow-400';
        if (score <= 7) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="font-semibold text-gray-300 mb-4">AI Agents</h3>

            {/* Tabs */}
            <div className="flex gap-1 mb-4">
                {(['compliance', 'review', 'copilot'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-xs rounded capitalize ${
                            activeTab === tab
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        {tab === 'copilot' ? 'Co-Pilot' : tab}
                    </button>
                ))}
            </div>

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
                <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                        Check your proposal against grant eligibility requirements.
                    </p>
                    <button
                        onClick={runComplianceCheck}
                        disabled={loading}
                        className="w-full py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/50 rounded hover:bg-indigo-600/30 text-sm disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : '🔍 Run Compliance Check'}
                    </button>

                    {complianceResult && (
                        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                            <div className={`text-sm font-medium ${complianceResult.compliant ? 'text-green-400' : 'text-red-400'}`}>
                                {complianceResult.compliant ? '✓ Compliant' : '✗ Issues Found'} — Score: {complianceResult.score}/100
                            </div>
                            <p className="text-xs text-gray-400">{complianceResult.summary}</p>
                            {complianceResult.issues?.map((issue, i) => (
                                <div key={i} className={`p-2 rounded border text-xs ${getSeverityColor(issue.severity)}`}>
                                    <div className="font-medium uppercase text-[10px] mb-1">{issue.severity}</div>
                                    <div className="mb-1">{issue.finding}</div>
                                    <div className="text-gray-400">💡 {issue.suggestion}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Review Tab */}
            {activeTab === 'review' && (
                <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                        Simulate an NIH-style peer review of your proposal.
                    </p>
                    <button
                        onClick={runReview}
                        disabled={loading}
                        className="w-full py-2 bg-purple-600/20 text-purple-400 border border-purple-600/50 rounded hover:bg-purple-600/30 text-sm disabled:opacity-50"
                    >
                        {loading ? 'Reviewing...' : '📝 Simulate Review'}
                    </button>

                    {reviewResult && (
                        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-bold ${getScoreColor(reviewResult.overallScore)}`}>
                                    {reviewResult.overallScore}
                                </span>
                                <span className="text-xs text-gray-400">
                                    Overall Score (1-9) • Impact: {reviewResult.overallImpact}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">{reviewResult.summary}</p>

                            {reviewResult.criteria && Object.entries(reviewResult.criteria).map(([key, criterion]) => (
                                <div key={key} className="p-2 bg-gray-800 rounded text-xs">
                                    <div className="flex justify-between mb-1">
                                        <span className="capitalize font-medium">{key}</span>
                                        <span className={getScoreColor(criterion.score)}>{criterion.score}/9</span>
                                    </div>
                                    {criterion.strengths?.length > 0 && (
                                        <div className="text-green-400 text-[10px]">+ {criterion.strengths[0]}</div>
                                    )}
                                    {criterion.weaknesses?.length > 0 && (
                                        <div className="text-red-400 text-[10px]">- {criterion.weaknesses[0]}</div>
                                    )}
                                </div>
                            ))}

                            {reviewResult.recommendations && reviewResult.recommendations.length > 0 && (
                                <div className="p-2 bg-indigo-900/30 border border-indigo-700 rounded text-xs">
                                    <div className="font-medium text-indigo-400 mb-1">Recommendations</div>
                                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                                        {reviewResult.recommendations.slice(0, 3).map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Co-Pilot Tab */}
            {activeTab === 'copilot' && (
                <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                        Get AI help with writing, expanding, or improving text.
                    </p>
                    <textarea
                        value={copilotPrompt}
                        onChange={(e) => setCopilotPrompt(e.target.value)}
                        placeholder="Enter text to improve, or describe what you need..."
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white placeholder-gray-500 resize-none"
                        rows={3}
                    />
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => runCopilot('improve')}
                            disabled={loading}
                            className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700 disabled:opacity-50"
                        >
                            ✨ Improve
                        </button>
                        <button
                            onClick={() => runCopilot('expand')}
                            disabled={loading}
                            className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700 disabled:opacity-50"
                        >
                            📝 Expand
                        </button>
                        <button
                            onClick={() => runCopilot('continue')}
                            disabled={loading}
                            className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700 disabled:opacity-50"
                        >
                            ➡️ Continue
                        </button>
                        <button
                            onClick={() => runCopilot()}
                            disabled={loading}
                            className="px-2 py-1 bg-green-600/20 text-green-400 border border-green-600/50 rounded text-xs hover:bg-green-600/30 disabled:opacity-50"
                        >
                            {loading ? '...' : '🚀 Generate'}
                        </button>
                    </div>

                    {copilotResult && (
                        <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {copilotResult}
                            <button
                                onClick={() => navigator.clipboard.writeText(copilotResult)}
                                className="block mt-2 text-indigo-400 hover:text-indigo-300"
                            >
                                📋 Copy to clipboard
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
