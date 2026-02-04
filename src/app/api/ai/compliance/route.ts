import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';
import { INSFORGE_LLM_MODEL } from '@/lib/ai-config';
import { getCompletionContent, parseJsonSafe } from '@/lib/ai-helpers';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Check proposal compliance against grant eligibility
export async function POST(request: Request) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
        const rate = checkRateLimit(`compliance:${clientKey}`, 10, 60 * 1000);
        if (!rate.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const { proposalText, eligibilityText, grantTitle } = await request.json();

        if (!proposalText || !eligibilityText) {
            return NextResponse.json(
                { error: 'proposalText and eligibilityText are required' },
                { status: 400 }
            );
        }

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const systemPrompt = `You are a Compliance Officer AI agent for grant applications. Your job is to analyze a proposal against the grant's eligibility requirements and identify any compliance issues.

Be thorough but constructive. For each issue found, explain:
1. What the requirement is
2. How the proposal fails to meet it (or is unclear)
3. A specific suggestion to fix it

Format your response as JSON with this structure:
{
  "compliant": boolean,
  "score": number (0-100),
  "issues": [
    {
      "severity": "critical" | "major" | "minor",
      "requirement": "The specific eligibility requirement",
      "finding": "What's wrong or missing",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Brief overall assessment"
}`;

        const userPrompt = `Grant: ${grantTitle || 'Unknown Grant'}

ELIGIBILITY REQUIREMENTS:
${eligibilityText}

PROPOSAL TEXT:
${proposalText}

Analyze this proposal against the eligibility requirements and provide your compliance assessment.`;

        const response = await insforge.ai.chat.completions.create({
            model: INSFORGE_LLM_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
        });

        const content = getCompletionContent(response);
        const analysis = parseJsonSafe(content, {
            compliant: false,
            score: 0,
            issues: [],
            summary: content || 'Analysis failed',
            raw: true,
        });

        return NextResponse.json({
            success: true,
            analysis,
        });
    } catch (error) {
        console.error('Compliance check error:', error);
        return NextResponse.json({ error: 'Failed to run compliance check' }, { status: 500 });
    }
}
