import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { XMLParser } from 'fast-xml-parser';
import { auth } from '@insforge/nextjs/server';
import { INSFORGE_EMBEDDING_MODEL } from '@/lib/ai-config';
import { loadGrantSources } from '@/lib/grant-sources';
import { checkRateLimit } from '@/lib/rate-limit';
import { CURATED_GRANTS } from '@/data/mock-grant-data';

const parser = new XMLParser({ ignoreAttributes: false });

type GrantSource = {
  slug: string;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'manual';
  category?: string;
  funder?: string;
  api?: string;
};

const NSF_API = 'https://api.nsf.gov/services/v1/awards.json';

const SAMPLE_GRANTS = CURATED_GRANTS;

type RawGrant = {
  title: string;
  description: string | null;
  funder: string | null;
  deadline?: string | null;
  amount_min?: number | null;
  amount_max?: number | null;
  eligibility_text?: string | null;
  eligibility_json?: Record<string, unknown> | null;
  tags?: string[] | null;
  categories?: string[] | null;
  source_url?: string | null;
  source_name: string;
  source_identifier: string;
};

const stripHtml = (value?: string) =>
  value ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';

const parseRssItems = (xml: string, source: GrantSource): RawGrant[] => {
  const parsed = parser.parse(xml);
  const items = parsed?.rss?.channel?.item || [];
  const normalized = Array.isArray(items) ? items : [items];
  return normalized.map((item: any) => {
    const title = item.title?.trim() || 'Untitled Grant';
    const description = stripHtml(item.description || item['content:encoded'] || '');
    const link = item.link || item.guid || source.url;
    return {
      title,
      description,
      funder: source.funder || source.name,
      deadline: null,
      amount_min: null,
      amount_max: null,
      eligibility_text: null,
      tags: [],
      source_url: link,
      source_name: source.name,
      source_identifier: String(item.guid?.['#text'] || item.guid || link || title),
    };
  });
};

const fetchRssSource = async (source: GrantSource, limit: number) => {
  const response = await fetch(source.url);
  if (!response.ok) {
    throw new Error(`RSS fetch failed for ${source.name}`);
  }
  const xml = await response.text();
  return parseRssItems(xml, source).slice(0, limit);
};

const fetchNsfAwards = async (limit: number, source: GrantSource): Promise<RawGrant[]> => {
  const url = `${NSF_API}?offset=1&limit=${limit}&printFields=id,title,abstractText,awardAmount,startDate,endDate,piFirstName,piLastName,awardeeName`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('NSF API fetch failed');
  }
  const json = await response.json();
  const awards = json?.response?.award || [];
  const normalized = Array.isArray(awards) ? awards : [awards];
  return normalized.map((award: any) => ({
    title: award.title || 'NSF Award',
    description: award.abstractText || null,
    funder: source.funder || 'National Science Foundation',
    deadline: award.endDate || null,
    amount_min: award.awardAmount || null,
    amount_max: award.awardAmount || null,
    eligibility_text: null,
    tags: ['NSF', 'award'],
    source_url: `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${award.id}`,
    source_name: source.name,
    source_identifier: String(award.id),
  }));
};

const upsertGrant = async (insforge: any, grant: RawGrant) => {
  const { data: existing } = await insforge.database
    .from('grants')
    .select('id')
    .eq('source_identifier', grant.source_identifier)
    .eq('source_name', grant.source_name)
    .maybeSingle();

  const textToEmbed = `${grant.title} ${grant.description || ''} ${grant.funder || ''} ${grant.tags?.join(' ') || ''}`;
  const embeddingResponse = await insforge.ai.embeddings.create({
    model: INSFORGE_EMBEDDING_MODEL,
    input: textToEmbed,
  });

  if (!embeddingResponse.data) {
    throw new Error('Failed to generate embedding');
  }

  const embedding = embeddingResponse.data[0].embedding;

  const payload = {
    title: grant.title,
    description: grant.description,
    funder: grant.funder,
    deadline: grant.deadline,
    amount_min: grant.amount_min,
    amount_max: grant.amount_max,
    eligibility_text: grant.eligibility_text,
    tags: grant.tags,
    categories: grant.categories,
    eligibility_json: grant.eligibility_json,
    source_url: grant.source_url,
    source_name: grant.source_name,
    source_identifier: grant.source_identifier,
    embedding: embedding as any,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await insforge.database.from('grants').update(payload).eq('id', existing.id);
    if (error) throw error;
    return 'updated';
  }

  const { error } = await insforge.database.from('grants').insert({
    ...payload,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
  return 'added';
};

const ensureSourceRecord = async (insforge: any, source: GrantSource) => {
  const { data: existing } = await insforge.database
    .from('grant_sources')
    .select('id, name')
    .eq('url', source.url)
    .maybeSingle();

  if (existing?.id) return existing;

  const { data } = await insforge.database
    .from('grant_sources')
    .insert({ name: source.name, url: source.url, created_at: new Date().toISOString() })
    .select()
    .single();

  return data || null;
};

const createIngestionRun = async (insforge: any, sourceId: string) => {
  const { data } = await insforge.database
    .from('ingestion_runs')
    .insert({
      source_id: sourceId,
      status: 'running',
      summary: {},
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  return data || null;
};

const finalizeIngestionRun = async (insforge: any, runId: string, status: string, summary: any) => {
  await insforge.database
    .from('ingestion_runs')
    .update({
      status,
      summary,
      finished_at: new Date().toISOString(),
    })
    .eq('id', runId);
};

const ingestSource = async (insforge: any, source: GrantSource, perSourceLimit: number) => {
  const summary = {
    source: source.slug,
    name: source.name,
    processed: 0,
    added: 0,
    updated: 0,
    errors: [] as string[],
    status: 'completed',
  };

  let sourceRecord: any = null;
  let runRecord: any = null;

  try {
    sourceRecord = await ensureSourceRecord(insforge, source);
    if (sourceRecord?.id) {
      runRecord = await createIngestionRun(insforge, sourceRecord.id);
    }
  } catch (error: any) {
    summary.errors.push(error.message);
  }

  try {
    let grants: RawGrant[] = [];

    if (source.type === 'rss') {
      grants = await fetchRssSource(source, perSourceLimit);
    } else if (source.type === 'api' && source.api === 'nsf-awards') {
      grants = await fetchNsfAwards(perSourceLimit, source);
    } else {
      summary.status = 'skipped';
    }

    for (const grant of grants) {
      try {
        summary.processed += 1;
        const result = await upsertGrant(insforge, grant);
        if (result === 'added') summary.added += 1;
        if (result === 'updated') summary.updated += 1;
      } catch (error: any) {
        summary.errors.push(error.message);
      }
    }
  } catch (error: any) {
    summary.status = 'failed';
    summary.errors.push(error.message);
  }

  try {
    if (sourceRecord?.id) {
      await insforge.database
        .from('grant_sources')
        .update({ last_ingested_at: new Date().toISOString() })
        .eq('id', sourceRecord.id);
    }

    if (runRecord?.id) {
      await finalizeIngestionRun(insforge, runRecord.id, summary.status, summary);
    }
  } catch (error: any) {
    summary.errors.push(error.message);
  }

  return summary;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.INGEST_API_KEY;
    const headerKey = request.headers.get('x-api-key');
    const { token } = await auth();

    if (apiKey && headerKey !== apiKey && !token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!apiKey || headerKey !== apiKey) {
      const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
      const rate = checkRateLimit(`scout:${clientKey}`, 4, 60 * 1000);
      if (!rate.allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const limit = typeof body.limit === 'number' ? body.limit : 60;
    const sourcesFilter = Array.isArray(body.sources) ? body.sources : null;

    const grantSources = await loadGrantSources();
    const sources = (grantSources as GrantSource[]).filter((source) =>
      sourcesFilter ? sourcesFilter.includes(source.slug) : true
    );

    const perSourceLimit = Math.max(3, Math.ceil(limit / Math.max(1, sources.length)));

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    });

    const results = {
      processed: 0,
      added: 0,
      updated: 0,
      errors: [] as string[],
      sources: [] as any[],
    };

    const batchSize = 10;
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((source) => ingestSource(insforge, source, perSourceLimit))
      );

      for (const summary of batchResults) {
        results.sources.push(summary);
        results.processed += summary.processed;
        results.added += summary.added;
        results.updated += summary.updated;
        results.errors.push(...summary.errors);
      }
    }

    if (results.processed === 0) {
      for (const grant of SAMPLE_GRANTS) {
        try {
          const fallbackGrant: RawGrant = {
            ...grant,
            source_name: 'Sample',
            source_identifier: `${grant.title}-${grant.funder}`,
          };
          await upsertGrant(insforge, fallbackGrant);
          results.processed += 1;
        } catch (error: any) {
          results.errors.push(error.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Grant Scout completed. Processed ${results.processed}, added ${results.added}, updated ${results.updated}.`,
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

export async function GET() {
  return NextResponse.json({
    agent: 'Grant Scout',
    description: 'Aggregates grants from the configured sources list.',
    status: 'ready',
    triggerEndpoint: 'POST /api/ai/scout',
  });
}
