import { config } from '../config.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function generateContent(prompt, systemPrompt = '', retries = 3) {
  const apiKey = config.ai.apiKey;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada. Configúrala en variables de entorno.');
  }

  const baseURL = config.ai.baseURL || 'https://api.openai.com/v1/chat/completions';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(baseURL, {
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
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          console.log(`\n   ⚠️ Servidor ocupado o rate limit (Error ${response.status}). Reintentando en 10 segundos... (Intento ${attempt}/${retries})`);
          await delay(10000); // 10 seconds
          continue;
        }
        throw new Error(`Error API AI: ${response.status} - ${err}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (attempt === retries) throw error;
      console.log(`\n   ⚠️ Error de conexión: ${error.message}. Reintentando en 10 segundos... (Intento ${attempt}/${retries})`);
      await delay(10000);
    }
  }
}

function defaultSystemPrompt() {
  return `Eres un experto en tecnología y redacción SEO para marketing de afiliados.
Escribe en español neutro de Latinoamérica (es-MX).
Debes crear contenido útil, honesto y detallado que ayude a los lectores a tomar decisiones de compra.
Incluye siempre secciones de pros/cons, comparativa y recomendación final.
Usa un tono conversacional pero profesional.
OBLIGATORIO: Por cada producto que recomiendes, debes colocar EXACTAMENTE DOS enlaces juntos al final de la descripción del producto, con este formato exacto:
[Ver precio en Amazon](https://amzn.to/XXXXX)
[Ver en Mercado Libre](https://mercadolibre.com.mx/XXXXX)
NO incluyas advertencias sobre que eres IA o que los enlaces son de afiliado.`;
}
