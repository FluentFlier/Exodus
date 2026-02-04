import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { INSFORGE_EMBEDDING_MODEL } from '@/lib/ai-config';
import { CURATED_GRANTS } from '@/data/mock-grant-data';

// Sample Grants Data
const SAMPLE_GRANTS = CURATED_GRANTS;

export async function GET() {
    try {
        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        });

        console.log('InsForge Client Keys:', Object.keys(insforge));
        if (typeof (insforge as any).from !== 'function') {
            console.error('insforge.from is missing!');
        }

        const results = [];

        const { error: clearError } = await insforge.database
            .from('grants')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (clearError) {
            throw clearError;
        }

        for (const grant of SAMPLE_GRANTS) {
            // Generate Embedding
            const textToEmbed = `${grant.title} ${grant.description} ${grant.eligibility_text} Tags: ${grant.tags.join(', ')}`;

            console.log(`Embedding: ${grant.title}`);

            const embeddingResponse = await insforge.ai.embeddings.create({
                model: INSFORGE_EMBEDDING_MODEL,
                input: textToEmbed,
            });

            if (!embeddingResponse.data) {
                console.error(`Failed to generate embedding for: ${grant.title}`);
                continue;
            }

            const embedding = embeddingResponse.data[0].embedding;

            // Insert Grant
            const { data, error } = await insforge.database
                .from('grants')
                .upsert({
                    title: grant.title,
                    description: grant.description,
                    funder: grant.funder,
                    amount_min: grant.amount_min,
                    amount_max: grant.amount_max,
                    deadline: grant.deadline,
                    eligibility_text: grant.eligibility_text,
                    eligibility_json: grant.eligibility_json,
                    tags: grant.tags,
                    categories: grant.categories,
                    source_url: grant.source_url,
                    source_name: grant.source_name,
                    source_identifier: grant.source_identifier,
                    embedding: embedding as any,
                } as any)

                .select()
                .single();

            if (error) {
                console.error(`Error inserting ${grant.title}:`, error);
            } else {
                results.push(data);
            }
        }

        return NextResponse.json({ success: true, seeded: results.length, results });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
