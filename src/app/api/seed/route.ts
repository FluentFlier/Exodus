import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { Database } from '@/lib/database.types';

// Sample Grants Data
const SAMPLE_GRANTS = [
    {
        title: 'NIH R01: Research Project Grant',
        description: 'Supports discrete, specified, circumscribed projects to be performed by an investigator(s) in an area representing the investigator\'s specific interest and competencies.',
        funder: 'NIH',
        amount_min: 250000,
        amount_max: 500000,
        deadline: '2026-10-05T17:00:00Z',
        eligibility_text: 'Independent investigators at any career stage. Institutions of Higher Education.',
        tags: ['Health', 'Biomedical', 'Research'],
    },
    {
        title: 'NSF CAREER: Faculty Early Career Development Program',
        description: 'Foundation-wide activity that offers the National Science Foundation\'s most prestigious awards in support of early-career faculty.',
        funder: 'NSF',
        amount_min: 400000,
        amount_max: 600000,
        deadline: '2026-07-26T17:00:00Z',
        eligibility_text: 'Assistant Professors (tenure-track) who have not yet received a CAREER award.',
        tags: ['STEM', 'Early Career', 'Education'],
    },
    {
        title: 'DOE Office of Science: Advanced Scientific Computing Research',
        description: 'Research in applied mathematics, computer science, and high-performance computing to advance scientific discovery.',
        funder: 'DOE',
        amount_min: 150000,
        amount_max: 1000000,
        deadline: '2026-05-15T17:00:00Z',
        eligibility_text: 'Universities, National Labs, Industry.',
        tags: ['Computing', 'Energy', 'Math'],
    },
    {
        title: 'Simons Foundation: Targeted Grants in MPS',
        description: 'Grants in Mathematics and Physical Sciences for high-risk projects of exceptional promise.',
        funder: 'Simons Foundation',
        amount_min: 100000,
        amount_max: 800000,
        deadline: '2026-06-30T17:00:00Z',
        eligibility_text: 'Established researchers in mathematics and physical sciences.',
        tags: ['Mathematics', 'Physics', 'High Risk'],
    },
    {
        title: 'Gates Foundation: Grand Challenges Explorations',
        description: 'Foster innovation in global health and development research.',
        funder: 'Bill & Melinda Gates Foundation',
        amount_min: 100000,
        amount_max: 100000,
        deadline: '2026-11-01T17:00:00Z',
        eligibility_text: 'Anyone can apply. No preliminary data required.',
        tags: ['Global Health', 'Development', 'Innovation'],
    },
];

export async function GET() {
    try {
        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        });

        const results = [];

        for (const grant of SAMPLE_GRANTS) {
            // Generate Embedding
            const textToEmbed = `${grant.title} ${grant.description} ${grant.eligibility_text} Tags: ${grant.tags.join(', ')}`;

            console.log(`Embedding: ${grant.title}`);

            const embeddingResponse = await insforge.ai.embeddings.create({
                model: 'text-embedding-3-small',
                input: textToEmbed,
            });

            const embedding = embeddingResponse.data[0].embedding;

            // Insert Grant
            const { data, error } = await insforge
                .from('grants')
                .upsert({
                    title: grant.title,
                    description: grant.description,
                    funder: grant.funder,
                    amount_min: grant.amount_min,
                    amount_max: grant.amount_max,
                    deadline: grant.deadline,
                    eligibility_text: grant.eligibility_text,
                    tags: grant.tags,
                    embedding: embedding as any,
                })
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
