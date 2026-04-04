export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { nombre, fecha, hora, ciudad } = req.body;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('API Key presente:', !!apiKey);
  console.log('API Key inicio:', apiKey ? apiKey.substring(0, 15) : 'NO KEY');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        system: 'Eres un experto en astrología infantil. Responde solo con JSON puro.',
        messages: [{ role: 'user', content: `Datos: ${nombre}, ${fecha}, ${ciudad}` }]
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Respuesta:', JSON.stringify(data).substring(0, 500));

    return res.status(200).json({ status: response.status, data });
  } catch (err) {
    console.log('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
