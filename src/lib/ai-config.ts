const llmModel = process.env.INSFORGE_LLM_MODEL || 'openai/gpt-4o-mini';
const embeddingModel = process.env.INSFORGE_EMBEDDING_MODEL || 'openai/text-embedding-3-small';

if (!llmModel) {
  throw new Error('Missing INSFORGE_LLM_MODEL environment variable');
}

if (!embeddingModel) {
  throw new Error('Missing INSFORGE_EMBEDDING_MODEL environment variable');
}

export const INSFORGE_LLM_MODEL = llmModel;
export const INSFORGE_EMBEDDING_MODEL = embeddingModel;
