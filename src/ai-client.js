import { config } from '../config.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function generateContent(prompt, systemPrompt = '', retries = 3) {
  const apiKey = config.ai.apiKey;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada. Configúrala en variables de entorno.');
  }

  const model = config.ai.model || 'gemini-1.5-flash';
  const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt || defaultSystemPrompt() }]
          },
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ],
          generationConfig: {
            temperature: config.ai.temperature,
            maxOutputTokens: config.ai.maxTokens,
          }
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
      return data.candidates[0].content.parts[0].text;
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
