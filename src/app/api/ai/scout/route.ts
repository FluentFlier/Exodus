import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

// Grant Scout Agent - Discovers and ingests new grants
// Can be triggered manually or via external cron service

const SAMPLE_GRANT_SOURCES = [
    {
        title: 'NIH R01 Research Project Grant',
        description: 'The R01 is the original and historically oldest grant mechanism used by NIH. The R01 provides support for health-related research and development based on the mission of the NIH.',
        funder: 'National Institutes of Health',
        deadline: '2025-06-01',
        amount_min: 250000,
        amount_max: 500000,
        eligibility_text: 'Principal Investigators must have a doctoral degree or equivalent. Must be affiliated with an accredited research institution. Project must align with NIH mission areas.',
        tags: ['biomedical', 'health', 'research', 'clinical'],
        source_url: 'https://grants.nih.gov/grants/guide/pa-files/PA-20-185.html',
    },
    {
        title: 'NSF CAREER Award',
        description: 'The Faculty Early Career Development (CAREER) Program offers the National Science Foundation most prestigious awards in support of early-career faculty who have the potential to serve as academic role models in research and education.',
        funder: 'National Science Foundation',
        deadline: '2025-07-15',
        amount_min: 400000,
        amount_max: 800000,
        eligibility_text: 'Untenured faculty member at a US institution. Must hold a doctoral degree. Must be engaged in research in an NSF-supported discipline.',
        tags: ['science', 'engineering', 'education', 'early-career'],
        source_url: 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503214',
    },
    {
        title: 'DOE Early Career Research Program',
        description: 'Support for exceptional researchers during their early career years when they are establishing their independent research programs.',
        funder: 'Department of Energy',
        deadline: '2025-05-01',
        amount_min: 150000,
        amount_max: 750000,
        eligibility_text: 'Untenured faculty or DOE national laboratory employee within 10 years of PhD. Research must fall within DOE Office of Science mission.',
        tags: ['energy', 'physics', 'chemistry', 'materials science'],
        source_url: 'https://science.osti.gov/early-career',
    },
    {
        title: 'Gates Foundation Global Health Grant',
        description: 'Supporting innovative approaches to reduce health inequities and solve critical global health challenges in infectious diseases, maternal and child health.',
        funder: 'Bill & Melinda Gates Foundation',
        deadline: '2025-08-31',
        amount_min: 100000,
        amount_max: 2000000,
        eligibility_text: 'Open to researchers at accredited institutions worldwide. Must address global health challenges affecting low and middle-income countries.',
        tags: ['global health', 'infectious disease', 'equity', 'international'],
        source_url: 'https://www.gatesfoundation.org/about/how-we-work/grants',
    },
    {
        title: 'Sloan Research Fellowship',
        description: 'Awarded to early-career scholars in recognition of distinguished performance and a unique potential to make substantial contributions to their field.',
        funder: 'Alfred P. Sloan Foundation',
        deadline: '2025-09-15',
        amount_min: 75000,
        amount_max: 75000,
        eligibility_text: 'Must hold a tenure-track position at a US or Canadian institution. Must be within 6 years of receiving PhD.',
        tags: ['chemistry', 'computer science', 'mathematics', 'physics', 'neuroscience'],
        source_url: 'https://sloan.org/fellowships',
    },
];

// POST - Run grant scout to discover and ingest new grants
export async function POST(request: Request) {
    try {
        // For production, this would use authentication
        // For now, we'll use the anon key for the scout
        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        });

        const results = {
            processed: 0,
            added: 0,
            updated: 0,
            errors: [] as string[],
        };

        for (const grant of SAMPLE_GRANT_SOURCES) {
            try {
                results.processed++;

                // Generate embedding for the grant
                const textToEmbed = `${grant.title} ${grant.description} ${grant.funder} ${grant.tags.join(' ')}`;

                const embeddingResponse = await insforge.ai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: textToEmbed,
                });

                if (!embeddingResponse.data) {
                    results.errors.push(`Failed to generate embedding for: ${grant.title}`);
                    continue;
                }

                const embedding = embeddingResponse.data[0].embedding;

                // Upsert the grant (update if exists based on title+funder)
                const { error } = await insforge
                    .from('grants')
                    .upsert({
                        title: grant.title,
                        description: grant.description,
                        funder: grant.funder,
                        deadline: grant.deadline,
                        amount_min: grant.amount_min,
                        amount_max: grant.amount_max,
                        eligibility_text: grant.eligibility_text,
                        tags: grant.tags,
                        source_url: grant.source_url,
                        embedding: JSON.stringify(embedding),
                        updated_at: new Date().toISOString(),
                    });

                if (error) {
                    results.errors.push(`Failed to upsert ${grant.title}: ${error.message}`);
                } else {
                    results.added++;
                }
            } catch (err: any) {
                results.errors.push(`Error processing ${grant.title}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Grant Scout completed. Processed ${results.processed}, added/updated ${results.added}.`,
            results,
        });
    } catch (error: any) {
        console.error('Grant Scout error:', error);
        return NextResponse.json(
            { error: 'Grant Scout failed', details: error.message },
            { status: 500 }
        );
    }
}

// GET - Check scout status and last run
export async function GET() {
    return NextResponse.json({
        agent: 'Grant Scout',
        description: 'Discovers and ingests new grants with AI-generated embeddings',
        status: 'ready',
        triggerEndpoint: 'POST /api/ai/scout',
        grantSources: SAMPLE_GRANT_SOURCES.length,
    });
}
