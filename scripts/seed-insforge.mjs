import { readFile } from 'fs/promises';
import path from 'path';
import { createClient } from '@insforge/sdk';

const loadEnv = async () => {
  const filePath = path.join(process.cwd(), '.env');
  const raw = await readFile(filePath, 'utf8');
  const env = {};

  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    env[key] = rest.join('=').trim();
  });

  return env;
};

const SAMPLE_GRANTS = [
  {
    title: 'NIH R01: Research Project Grant',
    description:
      "Supports discrete, specified, circumscribed projects to be performed by an investigator(s) in an area representing the investigator's specific interest and competencies.",
    funder: 'NIH',
    amount_min: 250000,
    amount_max: 500000,
    deadline: '2026-10-05T17:00:00Z',
    eligibility_text: 'Independent investigators at any career stage. Institutions of Higher Education.',
    tags: ['Health', 'Biomedical', 'Research'],
  },
  {
    title: 'NSF CAREER: Faculty Early Career Development Program',
    description:
      "Foundation-wide activity that offers the National Science Foundation's most prestigious awards in support of early-career faculty.",
    funder: 'NSF',
    amount_min: 400000,
    amount_max: 600000,
    deadline: '2026-07-26T17:00:00Z',
    eligibility_text: 'Assistant Professors (tenure-track) who have not yet received a CAREER award.',
    tags: ['STEM', 'Early Career', 'Education'],
  },
  {
    title: 'DOE Office of Science: Advanced Scientific Computing Research',
    description:
      'Research in applied mathematics, computer science, and high-performance computing to advance scientific discovery.',
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

const institutions = [
  { name: 'Arizona State University', perPage: 12 },
  { name: 'Stanford University', perPage: 10 },
  { name: 'Massachusetts Institute of Technology', perPage: 10 },
  { name: 'University of Michigan', perPage: 10 },
  { name: 'University of California, Berkeley', perPage: 10 },
];

const fetchOpenAlexInstitution = async (name) => {
  const url = `https://api.openalex.org/institutions?search=${encodeURIComponent(name)}&per-page=1`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data?.results?.[0] || null;
};

const fetchOpenAlexAuthors = async (institutionId, perPage) => {
  const url = `https://api.openalex.org/authors?filter=last_known_institutions.id:${institutionId}&per-page=${perPage}&sort=cited_by_count:desc`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data?.results || [];
};

const seedGrants = async (client, embeddingModel) => {
  let added = 0;
  for (const grant of SAMPLE_GRANTS) {
    const input = `${grant.title} ${grant.description} ${grant.eligibility_text} Tags: ${grant.tags.join(', ')}`;
    const embeddingResponse = await client.ai.embeddings.create({
      model: embeddingModel,
      input,
    });

    if (!embeddingResponse.data) continue;

    const embedding = embeddingResponse.data[0].embedding;
    const sourceIdentifier = `seed:${grant.title}`;

    await client.database.from('grants').upsert({
      title: grant.title,
      description: grant.description,
      funder: grant.funder,
      amount_min: grant.amount_min,
      amount_max: grant.amount_max,
      deadline: grant.deadline,
      eligibility_text: grant.eligibility_text,
      tags: grant.tags,
      source_name: 'Seed',
      source_identifier: sourceIdentifier,
      embedding,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    added += 1;
  }
  return added;
};

const seedCollaborators = async (client) => {
  const results = [];
  let loggedError = false;

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
      const { data: existing } = await client.database
        .from('collaborator_directory')
        .select('id')
        .eq('external_id', externalId)
        .maybeSingle();

      if (existing?.id) {
        skipped += 1;
        continue;
      }

      const concepts = (author.x_concepts || []).slice(0, 4).map((c) => c.display_name);
      const headline = concepts.length ? `Expertise in ${concepts.join(', ')}` : null;
      const bio = `OpenAlex profile: ${author.works_count || 0} works, ${author.cited_by_count || 0} citations.`;

      const { error } = await client.database.from('collaborator_directory').insert({
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
        if (!loggedError) {
          console.error('Collaborator insert error:', error?.message || error);
          loggedError = true;
        }
      } else {
        added += 1;
      }
    }

    results.push({ institution: inst.name, added, skipped });
  }

  return results;
};

const main = async () => {
  const env = await loadEnv();
  const baseUrl = env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  const anonKey = env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  const embeddingModel = env.INSFORGE_EMBEDDING_MODEL || 'openai/text-embedding-3-small';

  if (!baseUrl || !anonKey) {
    console.error('Missing NEXT_PUBLIC_INSFORGE_BASE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY in .env');
    process.exit(1);
  }

  const client = createClient({ baseUrl, anonKey });

  console.log('Seeding grants...');
  const grantsAdded = await seedGrants(client, embeddingModel);
  console.log(`Seeded ${grantsAdded} grants.`);

  console.log('Seeding collaborators...');
  const collaboratorsResults = await seedCollaborators(client);
  console.log('Collaborator seed results:', collaboratorsResults);
};

main().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
