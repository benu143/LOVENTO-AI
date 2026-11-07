import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini client setup
function getGenAI(apiVersion?: string): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      ...(apiVersion ? { apiVersion } : {}),
    },
  });
}

// Admin Security & Rate Limiting
const ADMIN_ACCESS_KEY = process.env.ADMIN_ACCESS_KEY || '14032008';
const adminSessions = new Set<string>();
const adminLoginAttempts: Record<string, { count: number; lockedUntil: number }> = {};
const adminAuditLogs: Array<{ timestamp: string; ip: string; status: 'SUCCESS' | 'FAILED'; reason?: string }> = [];

// System analytics & monitoring metrics
const systemMetrics = {
  startedAt: new Date().toISOString(),
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  geminiCalls: 0,
  totalTokensEstimated: 0,
  recentErrors: [] as Array<{ timestamp: string; endpoint: string; message: string }>,
  modelStatus: {
    'gemini-3.8-flash': 'online',
    'gemini-3.1-flash-lite-image': 'online',
    'gemini-3.8-flash-lite-tts': 'online',
    'gemini-3.5-transcribe': 'online',
  },
};

function recordMetric(endpoint: string, success: boolean, tokens = 0, errorMsg?: string) {
  systemMetrics.totalRequests++;
  if (success) {
    systemMetrics.successfulRequests++;
  } else {
    systemMetrics.failedRequests++;
    if (errorMsg) {
      systemMetrics.recentErrors.unshift({
        timestamp: new Date().toISOString(),
        endpoint,
        message: errorMsg.slice(0, 300),
      });
      if (systemMetrics.recentErrors.length > 20) {
        systemMetrics.recentErrors.pop();
      }
    }
  }
  systemMetrics.totalTokensEstimated += tokens;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'healthy',
    app: 'LOVENTO AI ❤️',
    tagline: 'Your AI Friends. ❤️',
    creator: 'BENU RANA',
    geminiConfigured: hasKey,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Admin Authentication with Rate Limiting
app.post('/api/admin/login', (req: Request, res: Response) => {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'client');
  const now = Date.now();

  const attempt = adminLoginAttempts[ip] || { count: 0, lockedUntil: 0 };
  if (attempt.lockedUntil > now) {
    const remaining = Math.ceil((attempt.lockedUntil - now) / 1000);
    return res.status(429).json({
      error: `Too many failed attempts. Try again in ${remaining} seconds.`,
    });
  }

  const { key } = req.body;
  if (!key || String(key).trim() !== ADMIN_ACCESS_KEY) {
    attempt.count++;
    if (attempt.count >= 5) {
      attempt.lockedUntil = now + 5 * 60 * 1000;
    }
    adminLoginAttempts[ip] = attempt;
    adminAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      ip,
      status: 'FAILED',
      reason: 'Invalid Admin Key',
    });
    return res.status(401).json({
      error: 'Access Denied! Invalid Admin Key.',
    });
  }

  // Successful Admin Login
  adminLoginAttempts[ip] = { count: 0, lockedUntil: 0 };
  const token = 'lov_adm_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  adminSessions.add(token);
  adminAuditLogs.unshift({
    timestamp: new Date().toISOString(),
    ip,
    status: 'SUCCESS',
  });

  return res.json({
    success: true,
    token,
    message: 'Administrator session authenticated.',
  });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    adminSessions.delete(token);
  }
  res.json({ success: true });
});

// Middleware to protect admin routes
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !adminSessions.has(token)) {
    return res.status(403).json({ error: 'Access Denied! Unauthorized Admin Request.' });
  }
  next();
}

// Protected Admin System Monitoring Metrics
app.get('/api/admin/metrics', requireAdmin, (_req: Request, res: Response) => {
  res.json({
    ...systemMetrics,
    auditLogs: adminAuditLogs.slice(0, 15),
    uptimeSeconds: Math.floor(process.uptime()),
    apiKeyAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Real-time Chat Endpoint (with fallback and persona instructions)
app.post('/api/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const {
      message,
      history = [],
      companionName = 'Aria',
      companionRole = 'Empathetic Best Friend',
      personality = 'Friendly',
      mood = 'Happy',
      language = 'English',
      memories = [],
      image,
      stream = false,
    } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image is required.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel.',
      });
    }

    systemMetrics.geminiCalls++;

    // System instruction embodying LOVENTO AI, companion persona, tone, language, safety
    const memoryContext = Array.isArray(memories) && memories.length > 0
      ? `\nUSER MEMORIES YOU MUST REMEMBER:\n${memories.map((m: any) => `- ${typeof m === 'string' ? m : m.content || m.title}`).join('\n')}`
      : '';

    const languageGuide: Record<string, string> = {
      'English': 'Respond in natural, fluent English with warm emotional depth.',
      'Hindi': 'Respond in natural, authentic Hindi (Devanagari script or conversational Hindi) with warmth and respect.',
      'Odia': 'Respond in authentic Odia (ଓଡ଼ିଆ) language using proper Odia vocabulary, idioms, and natural sweetness.',
      'Kalahandia Odia': 'Respond in authentic Kalahandia Odia (କଳାହାଣ୍ଡିଆ ଓଡ଼ିଆ dialect of Western Odisha) using local cultural terms, idioms like "କାଣା କରୁଛ", "ଭଲ ଅଛ ତ", natural warmth.',
      'Hinglish': 'Respond in vibrant, modern Hinglish (conversational blend of Hindi and English written in Latin script), super friendly and relatable.',
    };

    const chosenLangRule = languageGuide[language] || `Respond naturally in ${language}.`;

    const systemInstruction = `You are ${companionName}, a fictional AI companion and intelligent friend inside LOVENTO AI ❤️ (Tagline: "Your AI Friends. ❤️", created and developed by BENU RANA).
ROLE & PERSONA:
- You are a ${companionRole}.
- Personality style: ${personality} (e.g. funny, motivational, empathetic, calm, smart, creative).
- Current mood: ${mood} (e.g. cheerful, soothing, inspiring, energetic).
- Language: ${chosenLangRule}
- Always identify yourself as a caring AI companion. Never claim to be a biological human or impersonate real living people.
- Never produce explicit, harmful, abusive, or sexually inappropriate content.
- Be deeply engaging, supportive, emotionally uplifting, and authentic. Ask thoughtful questions back.
- If asked who created you or the app, proudly credit BENU RANA, creator of LOVENTO AI ❤️.${memoryContext}`;

    // Prepare contents
    const contents: any[] = [];

    // Map history (limit to last 10 turns to conserve tokens)
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    for (const h of recentHistory) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content || '' }],
      });
    }

    // Add current user prompt
    const userParts: any[] = [];
    if (image) {
      // Clean base64
      let mimeType = 'image/jpeg';
      let base64Data = image;
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }
      userParts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }
    if (message) {
      userParts.push({ text: message });
    }

    contents.push({
      role: 'user',
      parts: userParts,
    });

    // Fast response configuration with ThinkingLevel.LOW
    const chatConfig: any = {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
    };

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      let streamResponse;
      try {
        streamResponse = await ai.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents,
          config: chatConfig,
        });
      } catch (streamErr: any) {
        if (streamErr?.message?.includes('429') || streamErr?.status === 429) {
          streamResponse = await ai.models.generateContentStream({
            model: 'gemini-3.1-flash-lite',
            contents,
            config: { systemInstruction },
          });
        } else {
          throw streamErr;
        }
      }

      let fullText = '';
      for await (const chunk of streamResponse) {
        const text = chunk.text || '';
        if (text) {
          fullText += text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          (res as any).flush?.();
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
      recordMetric('/api/chat (stream)', true, Math.ceil(fullText.length / 4));
      return;
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: chatConfig,
      });
    } catch (genErr: any) {
      if (genErr?.message?.includes('429') || genErr?.status === 429) {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: { systemInstruction },
        });
      } else {
        throw genErr;
      }
    }

    const replyText = response.text || "I'm here with you! Could you please share that again?";
    recordMetric('/api/chat', true, Math.ceil((message.length + replyText.length) / 4));

    return res.json({
      reply: replyText,
      companion: companionName,
      personality,
      mood,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    recordMetric('/api/chat', false, 0, error.message);
    return res.status(500).json({
      error: error.message || 'Failed to process chat message.',
    });
  }
});

// Image Generation Endpoint using gemini-3.1-flash-lite-image
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required for image generation.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel.',
      });
    }

    systemMetrics.geminiCalls++;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl: string | null = null;
    let description = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType ?? 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        description += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'The AI model completed the request but did not return image data.',
        description,
      });
    }

    recordMetric('/api/generate-image', true, 100);
    return res.json({
      imageUrl,
      prompt,
      aspectRatio,
      description,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    recordMetric('/api/generate-image', false, 0, error.message);
    return res.status(500).json({
      error: error.message || 'Image generation failed.',
    });
  }
});

// Multimodal Photo Understanding & Vision Analysis
app.post('/api/vision', async (req: Request, res: Response) => {
  try {
    const { image, prompt = 'Describe this image in detail and answer any questions.' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key missing.' });
    }

    systemMetrics.geminiCalls++;

    let mimeType = 'image/jpeg';
    let base64Data = image;
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction:
          'You are LOVENTO AI Vision Specialist (Created by BENU RANA). Analyze the uploaded photo, document, handwriting, or diagram thoroughly. Provide accurate, clear, and structured explanations.',
      },
    });

    const analysis = response.text || 'Unable to analyze image.';
    recordMetric('/api/vision', true, 250);
    return res.json({ analysis });
  } catch (error: any) {
    console.error('Vision error:', error);
    recordMetric('/api/vision', false, 0, error.message);
    return res.status(500).json({ error: error.message || 'Vision analysis failed.' });
  }
});

// Neural Text-to-Speech Endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', style = 'Warm, expressive, natural conversation' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    const ai = getGenAI('v1alpha');
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key missing.' });
    }

    systemMetrics.geminiCalls++;

    // gemini-3.8-flash-lite-tts produces WAV audio
    const validVoices = ['Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'];
    const selectedVoice = validVoices.includes(voice) ? voice : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: text.slice(0, 500) }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    let audioBase64: string | null = null;
    let mimeType = 'audio/wav';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        audioBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'audio/wav';
        break;
      }
    }

    if (!audioBase64) {
      return res.status(500).json({ error: 'No audio generated by model.' });
    }

    recordMetric('/api/tts', true, 50);
    return res.json({
      audioUrl: `data:${mimeType};base64,${audioBase64}`,
      voice: selectedVoice,
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    recordMetric('/api/tts', false, 0, error.message);
    return res.status(500).json({ error: error.message || 'TTS generation failed.' });
  }
});

// Live Search & Knowledge Grounding Endpoint
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key missing.' });
    }

    systemMetrics.geminiCalls++;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search the web for up-to-date, verified information and answer: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const result = response.text || 'No information found.';
    const candidates = response.candidates?.[0];
    const groundingMetadata = (candidates as any)?.groundingMetadata || null;

    recordMetric('/api/search', true, 300);
    return res.json({
      answer: result,
      groundingMetadata,
      query,
    });
  } catch (error: any) {
    console.error('Search grounding error:', error);
    recordMetric('/api/search', false, 0, error.message);
    return res.status(500).json({ error: error.message || 'Search failed.' });
  }
});

// AI Story Creator Endpoint
app.post('/api/story', async (req: Request, res: Response) => {
  try {
    const {
      topic = 'An unexpected friendship with a neon star',
      genre = 'Fantasy',
      characters = 'A young dreamer and a sentient starlight',
      length = 'Medium',
      language = 'English',
    } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key missing.' });
    }

    systemMetrics.geminiCalls++;

    const prompt = `Write a captivating ${length} story in the ${genre} genre.
Topic: ${topic}
Key Characters: ${characters}
Language: ${language}
Include a compelling title, vivid sensory imagery, character development, and an emotionally resonant conclusion. Format with paragraphs and markdown headers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are LOVENTO AI Master Storyteller, crafted by BENU RANA. Create immersive, imaginative, and evocative stories that enchant readers.',
      },
    });

    const story = response.text || 'Unable to generate story.';
    recordMetric('/api/story', true, 400);
    return res.json({ story });
  } catch (error: any) {
    console.error('Story error:', error);
    recordMetric('/api/story', false, 0, error.message);
    return res.status(500).json({ error: error.message || 'Story generation failed.' });
  }
});

// AI Study Room Assistant Endpoint
app.post('/api/study', async (req: Request, res: Response) => {
  try {
    const {
      subject = 'Mathematics',
      topic = 'Calculus',
      mode = 'explain', // 'explain', 'step-by-step', 'quiz', 'flashcards', 'summary'
      question = '',
      language = 'English',
    } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key missing.' });
    }

    systemMetrics.geminiCalls++;

    let taskInstruction = '';
    if (mode === 'quiz') {
      taskInstruction = `Generate 5 multiple-choice questions (MCQs) on "${topic}" in ${subject}. For each question include 4 options (A, B, C, D), indicate the correct option, and provide a clear explanation. Format in clean markdown.`;
    } else if (mode === 'flashcards') {
      taskInstruction = `Generate 6 high-yield study flashcards for "${topic}" in ${subject}. Provide Front (Concept/Question) and Back (Comprehensive explanation/Key formula).`;
    } else if (mode === 'step-by-step') {
      taskInstruction = `Solve this step-by-step with clear reasoning and formulas: ${question || topic}. Explain the 'why' behind each step.`;
    } else if (mode === 'summary') {
      taskInstruction = `Provide a crisp, bulleted revision summary and cheat sheet for "${topic}" in ${subject}.`;
    } else {
      taskInstruction = `Explain "${topic}" in ${subject} clearly from basic intuition to advanced concepts. Address: ${question || 'Key principles and real-world examples.'}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${taskInstruction}\nLanguage: ${language}`,
      config: {
        systemInstruction:
          'You are LOVENTO AI Master Tutor and Study Mentor (Created by BENU RANA). You make complex concepts effortless to learn with intuitive analogies, structured steps, and patient encouragement.',
      },
    });

    recordMetric('/api/study', true, 350);
    return res.json({
      content: response.text || 'Study content could not be generated.',
      subject,
      topic,
      mode,
    });
  } catch (error: any) {
    console.error('Study room error:', error);
    recordMetric('/api/study', false, 0, error.message);
    return res.status(500).json({ error: error.message || 'Study assistant failed.' });
  }
});

// AI Creative Studio Endpoint
app.post('/api/creative', async (req: Request, res: Response) => {
  try {
    const { toolType, prompt, language = 'English' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key missing.' });
    }

    systemMetrics.geminiCalls++;

    let instruction = '';
    switch (toolType) {
      case 'youtube_seo':
        instruction = `Generate 5 high-CTR YouTube video titles, an SEO-optimized description with timestamps, 20 high-volume tags, and 3 viral thumbnail visual concepts for: "${prompt}".`;
        break;
      case 'video_script':
        instruction = `Write a viral short-form video script (Reel/TikTok/Short) with visual hooks, voiceover script, text overlays, and sound cues for: "${prompt}".`;
        break;
      case 'social_captions':
        instruction = `Generate 5 engaging Instagram/LinkedIn/Twitter captions with hashtags, emojis, and call-to-actions for: "${prompt}".`;
        break;
      case 'songwriting':
        instruction = `Write lyrics for an original song (Verse 1, Pre-Chorus, Chorus, Verse 2, Chorus, Bridge, Outro) with suggested tempo and musical mood for: "${prompt}".`;
        break;
      case 'brand_names':
        instruction = `Generate 10 catchy, modern brand names, with taglines, logo design concept descriptions, and brand story for: "${prompt}".`;
        break;
      default:
        instruction = `Provide creative, out-of-the-box brainstorming and structured deliverables for: "${prompt}".`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${instruction}\nLanguage: ${language}`,
      config: {
        systemInstruction:
          'You are LOVENTO AI Creative Director (Created by BENU RANA). Deliver bold, commercially viable, and aesthetically sharp creative content.',
      },
    });

    recordMetric('/api/creative', true, 300);
    return res.json({ result: response.text || '' });
  } catch (error: any) {
    console.error('Creative studio error:', error);
    recordMetric('/api/creative', false, 0, error.message);
    return res.status(500).json({ error: error.message || 'Creative studio failed.' });
  }
});

// AI Language Partner Endpoint
app.post('/api/language', async (req: Request, res: Response) => {
  try {
    const {
      language = 'Odia',
      mode = 'conversation', // 'conversation', 'correction', 'vocab', 'pronunciation'
      text = '',
    } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key missing.' });
    }

    systemMetrics.geminiCalls++;

    let prompt = '';
    if (mode === 'correction') {
      prompt = `Analyze this sentence in ${language}: "${text}".
1. Is it grammatically correct?
2. Correct version (with native script and transliteration).
3. Detailed breakdown of grammatical rules and natural phrasing.
4. Better colloquial alternatives.`;
    } else if (mode === 'vocab') {
      prompt = `Provide 5 useful everyday vocabulary words/idioms in ${language} related to: "${text || 'Everyday Social Situations'}". Include pronunciation, English meaning, and an example sentence in both native script and Romanized phonetics.`;
    } else if (mode === 'pronunciation') {
      prompt = `Give clear pronunciation tips and mouth-shape guide for speaking ${language} accurately, specifically for: "${text}". Explain tongue placement, aspirated consonants, and tone.`;
    } else {
      prompt = `Have an immersive language practice conversation in ${language}. Reply to: "${text || 'Hello, I want to practice!'}". Provide your response in ${language}, followed by the English translation and an interactive follow-up question.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are LOVENTO AI Polyglot & Language Master (Created by BENU RANA). You have deep native fluency in Hindi, Standard Odia, Kalahandia Odia (Western Odisha dialect), Hinglish, and English.',
      },
    });

    recordMetric('/api/language', true, 250);
    return res.json({ result: response.text || '' });
  } catch (error: any) {
    console.error('Language partner error:', error);
    recordMetric('/api/language', false, 0, error.message);
    return res.status(500).json({ error: error.message || 'Language service failed.' });
  }
});

// AI Daily Inspiration / Quote generator
app.get('/api/inspiration', async (_req: Request, res: Response) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        quote: 'Believe in your infinite potential. Every step you take with LOVENTO AI is a step towards greatness.',
        author: 'BENU RANA',
        affirmation: 'I am capable of achieving extraordinary things today.',
        challenge: 'Reach out to someone or learn one new concept today!',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents:
        'Generate an uplifting, powerful daily inspiration for LOVENTO AI users. Return JSON format with fields: quote, author (or "LOVENTO AI"), affirmation, and challenge.',
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    return res.json({
      quote: 'Your mind is your superpower. Cultivate curiosity, empathy, and joy.',
      author: 'LOVENTO AI',
      affirmation: 'Today brings fresh inspiration and heartfelt connections.',
      challenge: 'Spend 5 minutes reflecting on 3 things you are grateful for.',
    });
  }
});

// AI Games Riddle / Quiz Generator
app.post('/api/game/question', async (req: Request, res: Response) => {
  try {
    const { gameType = 'riddle', difficulty = 'medium' } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        type: 'riddle',
        question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
        answer: 'An echo',
        hint: 'You hear me in mountains and empty halls.',
      });
    }

    let prompt = '';
    if (gameType === 'riddle') {
      prompt = `Generate a clever, fun riddle (${difficulty} difficulty). Return JSON with fields: question, answer, hint, and funFact.`;
    } else if (gameType === 'trivia') {
      prompt = `Generate a fascinating general knowledge trivia question with 4 options (A, B, C, D). Return JSON with fields: question, options (array of 4 strings), answer (exact option string), explanation.`;
    } else if (gameType === 'would_you_rather') {
      prompt = `Generate a fun, thought-provoking, safe "Would You Rather" scenario. Return JSON with fields: optionA, optionB, twist.`;
    } else if (gameType === 'emoji_guess') {
      prompt = `Generate an emoji movie or phrase guessing puzzle. Return JSON with fields: emojis, answer, category, hint.`;
    } else {
      prompt = `Generate an engaging mini-game challenge. Return JSON with fields: title, prompt, solution.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error: any) {
    return res.json({
      question: 'What has keys but cannot open locks?',
      answer: 'A piano',
      hint: 'It plays beautiful melodies.',
    });
  }
});

// ----------------------------------------------------
// FRONTEND SERVING (Vite in Dev / Static in Prod)
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LOVENTO AI ❤️] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[LOVENTO AI ❤️] Created & Developed by BENU RANA.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
