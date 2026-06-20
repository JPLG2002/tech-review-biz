import { config } from '../config.js';

export async function generateContent(prompt, systemPrompt = '') {
  const apiKey = config.ai.apiKey;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada. Configúrala en variables de entorno.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.ai.model,
      messages: [
        { role: 'system', content: systemPrompt || defaultSystemPrompt() },
        { role: 'user', content: prompt },
      ],
      temperature: config.ai.temperature,
      max_tokens: config.ai.maxTokens,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Error API OpenAI: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function defaultSystemPrompt() {
  return `Eres un experto en tecnología y redacción SEO para marketing de afiliados.
Erescribe en español de México (es-MX).
Debes crear contenido útil, honesto y detallado que ayude a los lectores a tomar decisiones de compra.
Incluye siempre secciones de pros/cons, comparativa y recomendación final.
Usa un tono conversacional pero profesional.
Marca los productos con enlaces de afiliado usando formato: [producto](https://amzn.to/XXXXX)
NO incluyas advertencias sobre que eres IA o que los enlaces son de afiliado.`;
}
