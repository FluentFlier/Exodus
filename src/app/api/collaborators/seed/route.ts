import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

type InstitutionSeed = {
  name: string;
  perPage: number;
};

const institutions: InstitutionSeed[] = [
  { name: 'Arizona State University', perPage: 12 },
  { name: 'Stanford University', perPage: 10 },
  { name: 'Massachusetts Institute of Technology', perPage: 10 },
  { name: 'University of Michigan', perPage: 10 },
  { name: 'University of California, Berkeley', perPage: 10 },
];

const fetchOpenAlexInstitution = async (name: string) => {
  const url = `https://api.openalex.org/institutions?search=${encodeURIComponent(name)}&per-page=1`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data?.results?.[0] || null;
};

const fetchOpenAlexAuthors = async (institutionId: string, perPage: number) => {
  const url = `https://api.openalex.org/authors?filter=last_known_institutions.id:${institutionId}&per-page=${perPage}&sort=cited_by_count:desc`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data?.results || [];
};

export async function POST(request: Request) {
  try {
    const { token } = await auth();
    const apiKey = process.env.INGEST_API_KEY;
    const headerKey = request.headers.get('x-api-key');

    if (!token && (!apiKey || headerKey !== apiKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    });

    const results: { institution: string; added: number; skipped: number }[] = [];

    for (const inst of institutions) {
      const instRecord = await fetchOpenAlexInstitution(inst.name);
      if (!instRecord?.id) {
        results.push({ institution: inst.name, added: 0, skipped: 0 });
        continue;
      }

      const authors = await fetchOpenAlexAuthors(instRecord.id, inst.perPage);

      let added = 0;
      let skipped = 0;

      for (const author of authors) {
        const externalId = author.id;
        const { data: existing } = await insforge.database
          .from('collaborator_directory')
          .select('id')
          .eq('external_id', externalId)
          .maybeSingle();

        if (existing?.id) {
          skipped += 1;
          continue;
        }

        const concepts = (author.x_concepts || []).slice(0, 4).map((c: any) => c.display_name);
        const headline = concepts.length ? `Expertise in ${concepts.join(', ')}` : null;
        const bio = `OpenAlex profile: ${author.works_count || 0} works, ${author.cited_by_count || 0} citations.`;

        const { error } = await insforge.database.from('collaborator_directory').insert({
          full_name: author.display_name,
          institution: instRecord.display_name,
          headline,
          bio,
          tags: concepts,
          methods: [],
          collab_roles: ['domain-expert'],
          availability: 'medium',
          source: 'OpenAlex',
          source_url: author.id,
          external_id: externalId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          skipped += 1;
        } else {
          added += 1;
        }
      }

      results.push({ institution: inst.name, added, skipped });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Collaborator seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
