import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';
import { INSFORGE_LLM_MODEL } from '@/lib/ai-config';
import { getCompletionContent, parseJsonSafe } from '@/lib/ai-helpers';
import { checkRateLimit } from '@/lib/rate-limit';

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const fetchUrlText = async (url: string) => {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Exodus-Profile-Analyzer' } });
    if (!response.ok) return null;
    const html = await response.text();
    return stripHtml(html).slice(0, 12000);
  } catch {
    return null;
  }
};

const fetchOpenAlexInstitution = async (name?: string) => {
  if (!name) return null;
  const url = `https://api.openalex.org/institutions?search=${encodeURIComponent(name)}&per-page=1`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data?.results?.[0] || null;
};

const fetchOpenAlexAuthor = async (name?: string, institution?: string) => {
  if (!name) return null;
  let filterQuery = '';
  if (institution) {
    const inst = await fetchOpenAlexInstitution(institution);
    if (inst?.id) {
      filterQuery = `&filter=last_known_institutions.id:${encodeURIComponent(inst.id)}`;
    }
  }
  const url = `https://api.openalex.org/authors?search=${encodeURIComponent(name)}${filterQuery}&per-page=1`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data?.results?.[0] || null;
};

const fetchOpenAlexWorks = async (authorId: string) => {
  const url = `https://api.openalex.org/works?filter=author.id:${authorId}&sort=cited_by_count:desc&per-page=5`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data?.results || [];
};

export async function POST(request: Request) {
  try {
    const { token } = await auth();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const rate = checkRateLimit(`profile-analyze:${clientKey}`, 6, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { profile, sources } = await request.json();

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      edgeFunctionToken: token,
    });

    const { data: { user } } = await insforge.auth.getUser(token);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const resolvedSources: string[] = Array.isArray(sources) ? sources.filter(Boolean) : [];
    const fetchedSnippets: string[] = [];

    const openAlexAuthor = await fetchOpenAlexAuthor(profile?.full_name, profile?.institution);
    const openAlexWorks = openAlexAuthor?.id ? await fetchOpenAlexWorks(openAlexAuthor.id) : [];
    const openAlexSummary = openAlexAuthor
      ? `OpenAlex author: ${openAlexAuthor.display_name}, ${openAlexAuthor.works_count} works, ${openAlexAuthor.cited_by_count} citations.`
      : '';
    const openAlexPapers = openAlexWorks
      .map((work: any) => `${work.display_name} (${work.publication_year || 'n/a'})`)
      .join('; ');

    for (const source of resolvedSources.slice(0, 4)) {
      const text = await fetchUrlText(source);
      if (text) fetchedSnippets.push(`Source: ${source}\n${text}`);
    }

    const prompt = `Analyze the following faculty profile context and return JSON ONLY.
Context fields:
- Name: ${profile?.full_name || ''}
- Institution: ${profile?.institution || ''}
- Headline: ${profile?.headline || ''}
- Bio: ${profile?.bio || ''}
- Tags: ${(profile?.tags || []).join(', ')}
- Methods: ${(profile?.methods || []).join(', ')}
- Focus areas: ${(profile?.focus_areas || []).join(', ')}
- Preferred funders: ${(profile?.preferred_funders || []).join(', ')}
- Career stage: ${profile?.career_stage || ''}
- Lab size: ${profile?.lab_size || ''}
- Recent papers: ${profile?.recent_papers || ''}
- Citations: ${profile?.citations || ''}

OpenAlex summary:
${openAlexSummary}
Top works: ${openAlexPapers}

External snippets:
${fetchedSnippets.join('\n\n')}

Return JSON with keys (use OpenAlex summary for citationsEstimate when available):
researchSummary, expertiseAreas (array), methods (array), suggestedTags (array), suggestedKeywords (array),
notablePapers (array), grantFit (array), collaborationAngles (array), risks (array), citationsEstimate (string),
recommendedDataToCollect (array).`;

    const response = await insforge.ai.chat.completions.create({
      model: INSFORGE_LLM_MODEL,
      messages: [
        { role: 'system', content: 'You are an academic research profiler. Respond in JSON only.' },
        { role: 'user', content: prompt },
      ],
    });

    const content = getCompletionContent(response);
    const analysis = parseJsonSafe(content, {
      researchSummary: '',
      expertiseAreas: [],
      methods: [],
      suggestedTags: [],
      suggestedKeywords: [],
      notablePapers: [],
      grantFit: [],
      collaborationAngles: [],
      risks: [],
      citationsEstimate: '',
      recommendedDataToCollect: [],
    });

    const { data: existing } = await insforge.database
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .maybeSingle();

    const preferences =
      existing?.preferences && typeof existing.preferences === 'object' ? existing.preferences : {};

    const mergedPreferences = {
      ...preferences,
      profile_analysis: analysis,
      profile_sources: resolvedSources,
      profile_snippets: fetchedSnippets,
    };

    await insforge.database
      .from('profiles')
      .update({
        preferences: mergedPreferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Profile analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
