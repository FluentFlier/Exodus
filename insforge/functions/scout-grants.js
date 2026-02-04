module.exports = async function (_request) {
  const baseUrl = Deno.env.get('APP_BASE_URL');
  const apiKey = Deno.env.get('INGEST_API_KEY');

  if (!baseUrl || !apiKey) {
    return new Response(
      JSON.stringify({
        error: 'Missing APP_BASE_URL or INGEST_API_KEY',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/ai/scout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ limit: 80 }),
  });

  const payload = await response.json().catch(() => ({ error: 'Invalid response' }));

  return new Response(
    JSON.stringify({
      ok: response.ok,
      status: response.status,
      payload,
    }),
    { status: response.ok ? 200 : 500, headers: { 'Content-Type': 'application/json' } }
  );
};
