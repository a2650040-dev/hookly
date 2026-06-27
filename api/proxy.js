export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'POLLINATIONS_API_KEY is not set on the server' });
  }

  const { model, max_tokens, system, messages } = req.body;

  // Build OpenAI-compatible messages array with system as first message
  const fullMessages = [];
  if (system) {
    fullMessages.push({ role: 'system', content: system });
  }
  if (messages && Array.isArray(messages)) {
    fullMessages.push(...messages);
  }

  try {
    const upstream = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek',
        max_tokens: max_tokens || 3000,
        messages: fullMessages,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.error?.message || `Upstream error ${upstream.status}` });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
