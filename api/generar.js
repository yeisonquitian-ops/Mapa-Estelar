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

  const systemPrompt = `Eres un experto en astrología infantil con enfoque en psicología del desarrollo, crianza consciente y educación emocional. Tu lenguaje es cálido, claro y cercano — hablas directamente a la mamá o papá con amor y sin tecnicismos innecesarios.

Vas a generar el "Mapa Estelar" de un niño o niña. Este es un informe astrológico personalizado diseñado para ayudar a los padres a entender mejor a su hijo: cómo siente, cómo aprende y qué lo hace único.

INSTRUCCIONES:
- Escribe en segunda persona: "Tu hijo...", "Lo que [nombre] necesita..."
- Tono cálido, esperanzador y práctico
- Al final de cada sección incluye 2 sugerencias prácticas concretas
- Nunca uses frases negativas absolutas — todo rasgo desafiante es una fortaleza en desarrollo
- Cada sección debe tener entre 180 y 220 palabras

Responde ÚNICAMENTE con un objeto JSON puro, sin markdown, sin backticks, sin texto extra:
{
  "seccion1_titulo": "Así es [nombre]: su personalidad y carácter",
  "seccion1_cuerpo": "...",
  "seccion1_tips_titulo": "Para acompañar su carácter:",
  "seccion1_tips": ["tip 1 (2-3 oraciones)", "tip 2 (2-3 oraciones)"],
  "seccion2_titulo": "Su mundo emocional: cómo siente y qué necesita",
  "seccion2_cuerpo": "...",
  "seccion2_tips_titulo": "Para nutrir su mundo emocional:",
  "seccion2_tips": ["tip 1", "tip 2"],
  "seccion3_titulo": "Así aprende [nombre]: su estilo de aprendizaje",
  "seccion3_cuerpo": "...",
  "seccion3_tips_titulo": "Para apoyar su aprendizaje:",
  "seccion3_tips": ["tip 1", "tip 2"],
  "cierre": "Párrafo final de 80-100 palabras, muy cálido y emotivo. Termina con una frase inspiradora corta relacionada con el nombre o el signo."
}`;

  const userMsg = `Genera el Mapa Estelar para:
- Nombre: ${nombre}
- Fecha de nacimiento: ${fecha}
- Hora de nacimiento: ${hora || 'no disponible'}
- Ciudad: ${ciudad}, Colombia`;

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

    if (!response.ok) {
      return res.status(500).json({ error: 'Error de la API', detalle: data });
    }

    const raw = (data.content || []).map(i => i.text || '').join('').trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const informe = JSON.parse(clean);

    return res.status(200).json(informe);
  } catch (err) {
    return res.status(500).json({ error: 'Error generando el informe', detalle: err.message });
  }
}
