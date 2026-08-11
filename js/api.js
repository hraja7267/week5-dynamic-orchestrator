// API helper module for Life Admin Copilot.
// This file handles communication with the AI API only.

export async function callAI(prompt) {
  const endpoint = (typeof window !== 'undefined' && window.VIBE_API_ENDPOINT)
    || 'https://vibe-proxy-gqv4.onrender.com/v1/chat/completions';

  const apiKey = (typeof window !== 'undefined' && window.VIBE_API_KEY) || null;

  const payload = {
    model: 'class-chat-model',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  try {
    if (!apiKey) {
      // Avoid embedding secrets in the client; require configuration.
      throw new Error('API key not configured. Set window.VIBE_API_KEY before calling callAI.');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || response.statusText;
      throw new Error(`AI API request failed: ${errorMessage}`);
    }

    const assistantContent = data?.choices?.[0]?.message?.content;
    if (typeof assistantContent !== 'string') {
      throw new Error('AI API response did not contain assistant content.');
    }

    return assistantContent.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`callAI failed: ${error.message}`);
    }
    throw new Error('callAI failed with an unknown error.');
  }
}
