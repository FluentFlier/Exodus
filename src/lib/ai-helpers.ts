export const getCompletionContent = (response: any) => {
  return (
    response?.choices?.[0]?.message?.content ||
    response?.data?.choices?.[0]?.message?.content ||
    ''
  );
};

export const extractJsonFromContent = (content: string) => {
  if (!content) return null;
  const fenced = content.match(/```json\n?([\s\S]*?)\n?```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1).trim();
  }

  return content.trim();
};

export const parseJsonSafe = <T>(content: string, fallback: T): T => {
  const jsonCandidate = extractJsonFromContent(content);
  if (!jsonCandidate) return fallback;

  try {
    return JSON.parse(jsonCandidate) as T;
  } catch {
    return fallback;
  }
};
