import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

export async function POST(request: Request) {
    try {
        const { token } = await auth();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { institution, bio, tags, methods, collab_open } = await request.json();

        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            edgeFunctionToken: token, // Use user token for RLS
        });

        // 1. Generate Embedding (Bio + Tags)
        const textToEmbed = `${bio} Tags: ${tags.join(', ')} Methods: ${methods.join(', ')}`;

        // Using InsForge AI (OpenAI compatible)
        const embeddingResponse = await insforge.ai.embeddings.create({
            model: 'text-embedding-3-small',
            input: textToEmbed,
        });

        if (!embeddingResponse.data) {
            return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 });
        }

        const embedding = embeddingResponse.data[0].embedding;

        // 2. Update Profile
        // We need the user ID from the token, the client handles it if we use the token
        const { data: { user } } = await insforge.auth.getUser(token);

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { error } = await insforge
            .from('profiles')
            .upsert({
                id: user.id,
                institution,
                bio,
                tags,
                methods,
                collab_open,
                embedding: embedding as any, // Vector type casting
                updated_at: new Date().toISOString(),
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
