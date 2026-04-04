export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { nombre, fecha, hora, ciudad } = req.body;

  if (!nombre || !fecha || !ciudad) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const systemPrompt = `Eres un experto en astrología infantil con enfoque en psicología del desarrollo y crianza consciente. Escribe dirigiéndote a la mamá o papá en segunda persona. Tono cálido y práctico. Responde ÚNICAMENTE con JSON puro sin markdown ni backticks con esta estructura exacta:
{"seccion1_titulo":"...","seccion1_cuerpo":"...","seccion1_tips_titulo":"Para acompañar su carácter:","seccion1_tips":["tip 1","tip 2"],"seccion2_titulo":"...","seccion2_cuerpo":"...","seccion2_tips_titulo":"Para nutrir su mundo emocional:","seccion2_tips":["tip 1","tip 2"],"seccion3_titulo":"...","seccion3_cuerpo":"...","seccion3_tips_titulo":"Para apoyar su aprendizaje:","seccion3_tips":["tip 1","tip 2"],"cierre":"..."}`;

  const userMsg = `Genera el Mapa Estelar para:\n- Nombre: ${nombre}\n- Fecha: ${fecha}\n- Hora: ${hora || 'no disponible'}\n- Ciudad: ${ciudad}, Colombia`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
       model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: 'Error de la API', detalle: data });

    const raw = (data.content || []).map(i => i.text || '').join('').trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const informe = JSON.parse(clean);

    return res.status(200).json(informe);
  } catch (err) {
    return res.status(500).json({ error: 'Error generando el informe', detalle: err.message });
  }
}
