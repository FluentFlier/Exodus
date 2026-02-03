import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

// POST - Simulate grant review and score proposal
export async function POST(request: Request) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { proposalText, grantTitle, reviewCriteria } = await request.json();

        if (!proposalText) {
            return NextResponse.json({ error: 'proposalText is required' }, { status: 400 });
        }

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const criteria = reviewCriteria || 'NIH';

        const systemPrompt = `You are a Critical Reviewer AI agent simulating an experienced grant reviewer. You evaluate proposals using ${criteria} review criteria.

Score each criterion on a scale of 1-9:
- 1 (Exceptional): Outstanding, no weaknesses
- 3 (Excellent): Minor weaknesses
- 5 (Good): Moderate strengths outweigh weaknesses
- 7 (Fair): Moderate weaknesses
- 9 (Poor): Serious weaknesses

For NIH-style reviews, evaluate:
1. **Significance**: Does the project address an important problem?
2. **Innovation**: Does it employ novel approaches?
3. **Approach**: Is the methodology sound and feasible?
4. **Investigator(s)**: Are they qualified? (Assess based on proposal quality)
5. **Environment**: Is the institutional support adequate? (Assess based on resources mentioned)

Format your response as JSON:
{
  "overallScore": number (1-9, weighted average),
  "overallImpact": "High" | "Medium" | "Low",
  "criteria": {
    "significance": { "score": number, "strengths": [], "weaknesses": [] },
    "innovation": { "score": number, "strengths": [], "weaknesses": [] },
    "approach": { "score": number, "strengths": [], "weaknesses": [] },
    "investigator": { "score": number, "strengths": [], "weaknesses": [] },
    "environment": { "score": number, "strengths": [], "weaknesses": [] }
  },
  "summary": "Overall assessment paragraph",
  "recommendations": ["Specific improvement suggestions"]
}`;

        const userPrompt = `Grant Application: ${grantTitle || 'Research Proposal'}

PROPOSAL:
${proposalText}

Please provide a thorough ${criteria}-style review of this proposal.`;

        const response = await insforge.ai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
        });

        // Parse the response
        let review;
        try {
            const content = response.data?.choices?.[0]?.message?.content || '';
            const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || [null, content];
            review = JSON.parse(jsonMatch[1] || content);
        } catch {
            review = {
                overallScore: 5,
                overallImpact: 'Medium',
                summary: response.data?.choices?.[0]?.message?.content || 'Review failed',
                raw: true,
            };
        }

        return NextResponse.json({
            success: true,
            review,
        });
    } catch (error) {
        console.error('Review error:', error);
        return NextResponse.json({ error: 'Failed to run review' }, { status: 500 });
    }
}
