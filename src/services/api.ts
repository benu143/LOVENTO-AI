// API Service for LOVENTO AI client communicating with server.ts backend

export async function checkServerHealth() {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (err) {
    return { status: 'offline', geminiConfigured: false };
  }
}

export async function sendChatMessage(params: {
  message?: string;
  image?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  companionName?: string;
  companionRole?: string;
  personality?: string;
  mood?: string;
  language?: string;
  memories?: Array<{ content: string }>;
}) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

export async function streamChatMessage(
  params: {
    message?: string;
    image?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    companionName?: string;
    companionRole?: string;
    personality?: string;
    mood?: string;
    language?: string;
    memories?: Array<{ content: string }>;
  },
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (err: any) => void,
  signal?: AbortSignal
) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, stream: true }),
      signal,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Stream failed with status ${res.status}`);
    }

    if (!res.body) {
      throw new Error('ReadableStream not supported by browser.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const raw = trimmed.replace('data: ', '').trim();
          if (raw === '[DONE]') {
            onComplete();
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch (e) {
            // Ignore parse errors on partial frames
          }
        }
      }
    }
    onComplete();
  } catch (err: any) {
    if (signal?.aborted || err?.name === 'AbortError') {
      onComplete();
      return;
    }
    onError(err);
  }
}

export async function generateAIImage(prompt: string, aspectRatio = '1:1') {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate image.');
  }

  return await res.json();
}

export async function analyzePhoto(image: string, prompt?: string) {
  const res = await fetch('/api/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, prompt }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Photo analysis failed.');
  }

  return await res.json();
}

export async function generateNeuralSpeech(text: string, voice = 'Kore') {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Speech generation failed.');
  }

  return await res.json();
}

export async function searchWebGrounded(query: string) {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Search failed.');
  }

  return await res.json();
}

export async function createAIStory(params: {
  topic: string;
  genre: string;
  characters: string;
  length: string;
  language: string;
}) {
  const res = await fetch('/api/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Story generation failed.');
  }

  return await res.json();
}

export async function getStudyAssistance(params: {
  subject: string;
  topic: string;
  mode: string;
  question?: string;
  language?: string;
}) {
  const res = await fetch('/api/study', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Study assistance failed.');
  }

  return await res.json();
}

export async function runCreativeStudio(toolType: string, prompt: string, language = 'English') {
  const res = await fetch('/api/creative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toolType, prompt, language }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Creative tool failed.');
  }

  return await res.json();
}

export async function getLanguagePractice(params: {
  language: string;
  mode: string;
  text?: string;
}) {
  const res = await fetch('/api/language', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Language partner failed.');
  }

  return await res.json();
}

export async function fetchDailyInspiration() {
  const res = await fetch('/api/inspiration');
  if (!res.ok) {
    return {
      quote: 'With determination and empathy, you can move mountains.',
      author: 'BENU RANA',
      affirmation: 'I am capable of greatness today.',
      challenge: 'Learn something new and smile often!',
    };
  }
  return await res.json();
}

export async function fetchGameQuestion(gameType: string, difficulty = 'medium') {
  const res = await fetch('/api/game/question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameType, difficulty }),
  });

  if (!res.ok) {
    throw new Error('Game question failed.');
  }

  return await res.json();
}

export async function fetchAdminMetrics(token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch('/api/admin/metrics', { headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Admin metrics unavailable.');
  }
  return await res.json();
}

export async function adminLogin(key: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Access Denied! Invalid Admin Key.' };
    }
    return { success: true, token: data.token };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during admin authentication.' };
  }
}

export async function adminLogout(token?: string): Promise<void> {
  if (!token) return;
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    // Ignore network error on logout
  }
}
