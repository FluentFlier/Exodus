import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';
import { INSFORGE_EMBEDDING_MODEL } from '@/lib/ai-config';

import { getUserFromToken } from '@/lib/auth-helpers';

export async function GET() {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = getUserFromToken(token);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token,
        });

        const { data: profile, error } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        return NextResponse.json({ profile });
    } catch (error: any) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            full_name,
            institution,
            bio,
            tags,
            methods,
            collab_open,
            availability,
            collab_roles,
            headline,
            preferences,
            cv_text,
            profile_links,
            focus_areas,
            preferred_funders,
            budget_range,
            career_stage,
            lab_size,
            recent_papers,
            citations,
        } = await request.json();

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token, // Use user token for RLS
        });

        // 1. Generate Embedding (Bio + Tags)
        const normalizedTags = Array.isArray(tags) ? tags : [];
        const normalizedMethods = Array.isArray(methods) ? methods : [];
        const normalizedFocus = Array.isArray(focus_areas) ? focus_areas : [];
        const normalizedFunders = Array.isArray(preferred_funders) ? preferred_funders : [];
        const textToEmbed = `${headline || ''} ${bio || ''} Tags: ${normalizedTags.join(', ')} Methods: ${normalizedMethods.join(', ')} Focus: ${normalizedFocus.join(', ')} Funders: ${normalizedFunders.join(', ')}`;

        // Using InsForge AI (OpenAI compatible)
        const embeddingResponse = await insforge.ai.embeddings.create({
            model: INSFORGE_EMBEDDING_MODEL,
            input: textToEmbed,
        });

        if (!embeddingResponse.data) {
            return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 });
        }

        const embedding = embeddingResponse.data[0].embedding;

        // 2. Update Profile
        // We need the user ID from the token
        const { data: { user } } = getUserFromToken(token);

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { data: existingProfile } = await insforge.database
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .maybeSingle();

        const existingPreferences =
            existingProfile?.preferences && typeof existingProfile.preferences === 'object'
                ? existingProfile.preferences
                : {};

        const mergedPreferences = {
            ...existingPreferences,
            ...preferences,
            focus_areas: normalizedFocus,
            preferred_funders: normalizedFunders,
            budget_range: budget_range || existingPreferences?.budget_range || null,
            career_stage: career_stage || existingPreferences?.career_stage || null,
            lab_size: lab_size || existingPreferences?.lab_size || null,
            recent_papers: recent_papers || existingPreferences?.recent_papers || null,
            citations: citations || existingPreferences?.citations || null,
            profile_links: {
                ...(existingPreferences?.profile_links || {}),
                ...(profile_links || {}),
            },
        };

        const { error } = await insforge.database
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: full_name || null,
                institution,
                bio,
                tags: normalizedTags,
                methods: normalizedMethods,
                collab_open,
                availability: availability || 'medium',
                collab_roles: collab_roles || [],
                headline: headline || null,
                preferences: mergedPreferences,
                embedding: embedding as any, // Vector type casting
                updated_at: new Date().toISOString(),
                cv_text: cv_text || null,
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
