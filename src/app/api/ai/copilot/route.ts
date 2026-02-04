import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';
import { INSFORGE_LLM_MODEL } from '@/lib/ai-config';
import { getCompletionContent } from '@/lib/ai-helpers';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - AI Co-Pilot for writing assistance
export async function POST(request: Request) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
        const rate = checkRateLimit(`copilot:${clientKey}`, 20, 60 * 1000);
        if (!rate.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const { prompt, context, grantInfo, action } = await request.json();

        if (!prompt && !action) {
            return NextResponse.json({ error: 'prompt or action is required' }, { status: 400 });
        }

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        let systemPrompt = `You are an AI Co-Pilot helping researchers write grant proposals. You provide clear, concise, and academically rigorous text.

Guidelines:
- Write in an academic but accessible tone
- Be specific and evidence-based
- Avoid jargon unless necessary
- Keep responses focused and well-structured
- Match the style of the existing content when provided`;

        let userPrompt = prompt;

        // Handle different action types
        switch (action) {
            case 'expand':
                systemPrompt += '\n\nYour task is to expand the given text with more detail, examples, and supporting arguments.';
                userPrompt = `Expand the following text:\n\n${prompt}`;
                break;
            case 'summarize':
                systemPrompt += '\n\nYour task is to summarize the given text concisely while preserving key points.';
                userPrompt = `Summarize the following text:\n\n${prompt}`;
                break;
            case 'improve':
                systemPrompt += '\n\nYour task is to improve the clarity, flow, and academic rigor of the given text.';
                userPrompt = `Improve the following text:\n\n${prompt}`;
                break;
            case 'generate_section':
                systemPrompt += '\n\nYour task is to generate a complete section for a grant proposal based on the given topic and context.';
                userPrompt = `Generate a ${prompt} section for this grant proposal.`;
                break;
            case 'continue':
                systemPrompt += '\n\nYour task is to continue writing from where the text leaves off, maintaining the same style and direction.';
                userPrompt = `Continue writing from:\n\n${prompt}`;
                break;
            default:
                // Generic assistance
                break;
        }

        // Add grant context if provided
        if (grantInfo) {
            systemPrompt += `\n\nGrant Context:
- Title: ${grantInfo.title || 'Unknown'}
- Funder: ${grantInfo.funder || 'Unknown'}
- Focus: ${grantInfo.description || 'Not specified'}`;
        }

        // Add document context if provided
        if (context) {
            userPrompt += `\n\nExisting document context:\n${context}`;
        }

        const response = await insforge.ai.chat.completions.create({
            model: INSFORGE_LLM_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
        });

        const generatedText = getCompletionContent(response);

        return NextResponse.json({
            success: true,
            text: generatedText,
            action: action || 'assist',
        });
    } catch (error) {
        console.error('Co-pilot error:', error);
        return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
    }
}
