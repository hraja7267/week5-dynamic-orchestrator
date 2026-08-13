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
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  try {
    if (!apiKey) {
      throw new Error('AI service is not configured. Please configure the class API credential before running the agents.');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('AI request failed. Please check the API configuration and try again.');
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('AI request failed. Please check the API configuration and try again.');
    }

    const assistantContent = data?.choices?.[0]?.message?.content;
    if (typeof assistantContent !== 'string') {
      throw new Error('AI request failed. Please check the API configuration and try again.');
    }

    return assistantContent.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('AI request failed. Please check the API configuration and try again.');
  }
}
