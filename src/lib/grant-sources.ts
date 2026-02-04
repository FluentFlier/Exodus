import { readFile } from 'fs/promises';
import path from 'path';

let cachedSources: any[] | null = null;

export const loadGrantSources = async () => {
  if (cachedSources) return cachedSources;

  const filePath = path.join(process.cwd(), 'src', 'data', 'grant_sources.json');
  const raw = await readFile(filePath, 'utf8');
  cachedSources = JSON.parse(raw);
  return cachedSources;
};

const publicFunders = [
  { name: 'National Science Foundation', short: 'NSF' },
  { name: 'National Institutes of Health', short: 'NIH' },
  { name: 'Department of Energy', short: 'DOE' },
  { name: 'NASA', short: 'NASA' },
  { name: 'USDA NIFA', short: 'USDA' },
  { name: 'Centers for Disease Control and Prevention', short: 'CDC' },
  { name: 'Department of Defense', short: 'DOD' },
  { name: 'Environmental Protection Agency', short: 'EPA' },
  { name: 'National Endowment for the Humanities', short: 'NEH' },
  { name: 'Institute of Education Sciences', short: 'IES' },
];

const privateFunders = [
  { name: 'Simons Foundation', short: 'Simons' },
  { name: 'Gordon and Betty Moore Foundation', short: 'Moore' },
  { name: 'Alfred P. Sloan Foundation', short: 'Sloan' },
  { name: 'Bill & Melinda Gates Foundation', short: 'Gates' },
  { name: 'Howard Hughes Medical Institute', short: 'HHMI' },
  { name: 'Chan Zuckerberg Initiative', short: 'CZI' },
  { name: 'Packard Foundation', short: 'Packard' },
  { name: 'Wellcome Trust', short: 'Wellcome' },
  { name: 'Robert Wood Johnson Foundation', short: 'RWJF' },
  { name: 'Templeton Foundation', short: 'Templeton' },
];

const disciplines = [
  'Biomedical Sciences',
  'Neuroscience',
  'Climate & Sustainability',
  'Data Science',
  'AI & Machine Learning',
  'Materials Science',
  'Public Health',
  'Education Research',
  'Social & Behavioral Science',
  'Energy Systems',
  'Robotics & Automation',
  'Genomics',
];

const themes = [
  'translational impact',
  'community-engaged research',
  'equity-centered outcomes',
  'open science practices',
  'scalable methods',
  'interdisciplinary collaboration',
  'real-world deployment',
  'rigorous evaluation',
  'responsible innovation',
  'workforce development',
];

const tracks = [
  {
    title: 'Early Career Faculty Award',
    audience: 'early-career faculty and assistant professors',
    min: 200000,
    max: 600000,
    tags: ['early-career', 'faculty'],
  },
  {
    title: 'New Investigator Award',
    audience: 'new investigators within 10 years of their terminal degree',
    min: 150000,
    max: 450000,
    tags: ['early-career', 'new-investigator'],
  },
  {
    title: 'Postdoctoral Fellowship',
    audience: 'postdoctoral scholars within 5 years of their PhD',
    min: 50000,
    max: 120000,
    tags: ['postdoc', 'training'],
  },
  {
    title: 'Transition to Independence Award',
    audience: 'postdocs transitioning to independent faculty roles',
    min: 180000,
    max: 500000,
    tags: ['postdoc', 'faculty-transition'],
  },
  {
    title: 'Seed Research Grant',
    audience: 'early-career faculty building preliminary data',
    min: 75000,
    max: 200000,
    tags: ['seed', 'early-career'],
  },
  {
    title: 'Pilot Project Award',
    audience: 'early-career researchers launching new directions',
    min: 60000,
    max: 180000,
    tags: ['pilot', 'early-career'],
  },
  {
    title: 'Mentored Career Development Award',
    audience: 'postdoctoral fellows and junior faculty seeking mentorship',
    min: 120000,
    max: 300000,
    tags: ['mentored', 'career-development'],
  },
  {
    title: 'Interdisciplinary Collaboration Award',
    audience: 'early-career faculty leading cross-disciplinary teams',
    min: 200000,
    max: 700000,
    tags: ['collaboration', 'interdisciplinary'],
  },
  {
    title: 'Teaching & Research Integration Award',
    audience: 'early-career faculty integrating education and research',
    min: 100000,
    max: 250000,
    tags: ['education', 'faculty'],
  },
  {
    title: 'Methods Innovation Grant',
    audience: 'postdocs and early-career faculty developing new methods',
    min: 90000,
    max: 260000,
    tags: ['methods', 'innovation'],
  },
];

const pickByIndex = <T>(items: T[], index: number) => items[index % items.length];

export const buildMockGrants = (count = 300) => {
  const grants = [] as any[];
  const now = new Date();

  for (let i = 0; i < count; i += 1) {
    const isPublic = i % 3 !== 0;
    const funder = pickByIndex(isPublic ? publicFunders : privateFunders, i);
    const discipline = pickByIndex(disciplines, Math.floor(i / 2));
    const theme = pickByIndex(themes, i + 3);
    const track = pickByIndex(tracks, i + 5);

    const deadline = new Date(now.getTime());
    deadline.setDate(deadline.getDate() + 30 + (i % 18) * 12);
    deadline.setUTCHours(17, 0, 0, 0);

    const sourceIdentifier = `mock-${i + 1}`;
    const title = `${funder.short} ${track.title} in ${discipline}`;
    const description =
      `${track.title} supporting ${track.audience}. Focus areas include ${theme} with an emphasis on ${discipline.toLowerCase()}.`;

    grants.push({
      title,
      description,
      funder: funder.name,
      deadline: deadline.toISOString(),
      amount_min: track.min,
      amount_max: track.max,
      eligibility_text: `Eligible applicants: ${track.audience}. Applications should demonstrate a clear plan for ${theme} and measurable outcomes.`,
      tags: Array.from(
        new Set([
          discipline.split(' ')[0].toLowerCase(),
          ...track.tags,
          isPublic ? 'public' : 'private',
          'early-career',
        ])
      ),
      categories: [isPublic ? 'public' : 'private', 'early-career'],
      source_url: `https://example.org/mock-grants/${sourceIdentifier}`,
      source_name: 'Mock',
      source_identifier: sourceIdentifier,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }

  return grants;
};
