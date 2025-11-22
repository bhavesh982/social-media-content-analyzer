const STRUCTURED_PROMPT_TEMPLATE = `Analyze the attached social media text. Return the response strictly as a JSON object with the following schema (use double quotes, no Markdown, no prose):\n{
  "summary": "string",
  "sentiment": "string",
  "hashtags": ["string"],
  "key_points": ["string"],
  "engagement_prediction": 0
}\n- summary: short executive overview\n- sentiment: "Positive" | "Neutral" | "Negative" (or similar)\n- hashtags: 3-6 high-signal tags without the # symbol\n- key_points: actionable engagement improvement suggestions (bullet list)\n- engagement_prediction: integer 0-100 estimating campaign performance\nDo not include Markdown fences or commentary. Input content:\n`;

const STRUCTURED_RESPONSE_SCHEMA = {
  type: "object",
  required: [
    "summary",
    "sentiment",
    "hashtags",
    "key_points",
    "engagement_prediction",
  ],
  properties: {
    summary: { type: "string" },
    sentiment: { type: "string" },
    hashtags: {
      type: "array",
      items: { type: "string" },
      minItems: 0,
    },
    key_points: {
      type: "array",
      items: { type: "string" },
      minItems: 0,
    },
    engagement_prediction: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
  },
};
function extractJsonPayload(aiText) {
  if (!aiText || typeof aiText !== 'string') return null;
  const fenced = aiText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : aiText).trim();
  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.warn('[aiEnhancer] Structured JSON parse failed:', err.message);
  }
  return null;
}

function normalizeStructuredPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const stringify = (value, fallback = '') =>
    typeof value === 'string' ? value.trim() : fallback;

  const coerceStrings = (value) =>
    Array.isArray(value)
      ? value
          .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
          .filter(Boolean)
      : [];

  const cleanHashtags = coerceStrings(payload.hashtags).map((tag) =>
    tag.replace(/^#/,'').trim()
  );

  const numericPrediction = (() => {
    const raw = payload.engagement_prediction;
    const num = typeof raw === 'number' ? raw : parseFloat(raw);
    if (Number.isFinite(num)) {
      return Math.max(0, Math.min(100, Math.round(num)));
    }
    return null;
  })();

  const normalized = {
    summary: stringify(payload.summary),
    sentiment: stringify(payload.sentiment, 'Neutral'),
    hashtags: cleanHashtags,
    key_points: coerceStrings(payload.key_points),
    engagement_prediction: numericPrediction ?? 0,
  };

  return normalized;
}

module.exports.enhanceWithAI = async function (text) {
  try {
    // Prefer GEMINI_API_KEY or GOOGLE_API_KEY
    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // Fallback: try reading .env if process.env doesn't contain key
    if (!apiKey) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '..', '.env');
        if (fs.existsSync(envPath)) {
          const raw = fs.readFileSync(envPath, 'utf8');
          const m = raw.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m) || raw.match(/^GOOGLE_API_KEY\s*=\s*(.+)$/m);
          if (m && m[1]) apiKey = m[1].trim();
        }
      } catch (e) {
        // ignore
      }
    }

    if (!apiKey) {
      console.log('[aiEnhancer] Gemini key missing — skipping AI enhancement');
      return null;
    }

    // Ensure fetch is available
    let fetchFn = globalThis.fetch;
    if (!fetchFn) {
      try {
        fetchFn = require('node-fetch');
      } catch (e) {
        console.error('[aiEnhancer] fetch not available and node-fetch not installed');
        return null;
      }
    }

    // Step 1: List models available to this key and pick preferred Gemini model
    const listUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    console.log('[aiEnhancer] Listing available models for key');
    const listRes = await fetchFn(listUrl + `?key=${encodeURIComponent(apiKey)}`);
    const listText = await listRes.text();
    let listJson = null;
    try {
      listJson = listText ? JSON.parse(listText) : null;
    } catch (e) {
      console.warn('[aiEnhancer] Failed to parse ListModels response as JSON; raw:', listText ? listText.substring(0,2000) : '<empty>');
    }

    // Normalize model ids array and keep only models that can generate content
    const normalizedModels = [];
    const addModels = (entries) => {
      if (!Array.isArray(entries)) return;
      for (const entry of entries) {
        const id = (entry?.name || entry?.id || '').trim();
        if (!id) continue;
        const supportsContent = !Array.isArray(entry?.supportedGenerationMethods)
          || entry.supportedGenerationMethods.includes('generateContent');
        normalizedModels.push({ id, supportsContent });
      }
    };
    addModels(listJson?.models);
    addModels(listJson?.data);

    const candidateModels = normalizedModels.filter(m => m.supportsContent);
    const modelIds = candidateModels.map(m => m.id);

    const cleanModelId = (id) => (id && id.includes('/')) ? id.split('/').pop() : id;

    // If list failed, fall back to preferred list order
    const preferred = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-flash-latest',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-pro',
    ];
    let selectedModel = null;

    if (modelIds.length) {
      console.log('[aiEnhancer] Available models:', modelIds.slice(0,10));
      for (const pref of preferred) {
        const lowerPref = pref.toLowerCase();
        const found = modelIds.find(id => id.toLowerCase().includes(lowerPref));
        if (found) {
          selectedModel = cleanModelId(found);
          break;
        }
      }
      if (!selectedModel) {
        // try to pick any gemini model that can generate content
        const any = modelIds.find(id => id.toLowerCase().includes('gemini'));
        if (any) selectedModel = cleanModelId(any);
      }
    } else {
      // no list available; assume gemini-2.5-flash by default
      selectedModel = 'gemini-2.5-flash';
    }

    if (!selectedModel) {
      console.warn('[aiEnhancer] No Gemini model found for this key; skipping AI enhancement');
      return null;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`;
    const payload = {
      contents: [
        {
          parts: [
            { text: STRUCTURED_PROMPT_TEMPLATE + (text || '') },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseSchema: STRUCTURED_RESPONSE_SCHEMA,
      },
    };

    console.log('[aiEnhancer] Using model', selectedModel, 'endpoint', endpoint);
    const res = await fetchFn(endpoint + `?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const resultText = await res.text();
    let result = null;
    try {
      result = resultText ? JSON.parse(resultText) : null;
    } catch (e) {
      console.error('[aiEnhancer] Failed to parse Gemini response as JSON:', e && e.message);
      console.error('[aiEnhancer] Raw response:', resultText ? resultText.substring(0, 2000) : '<empty>');
      return null;
    }

    if (!res.ok) {
      console.error('[aiEnhancer] Gemini API error:', result);
      return null;
    }

    const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    console.log('[aiEnhancer] Got AI text length:', aiText ? aiText.length : 0);

    const structured = normalizeStructuredPayload(extractJsonPayload(aiText));
    if (structured) {
      console.log('[aiEnhancer] Parsed structured AI response');
    } else {
      console.warn('[aiEnhancer] Structured response missing; falling back to raw text');
    }

    return {
      raw: aiText,
      structured: structured || null,
    };
  } catch (err) {
    console.error('[AI Enhancer Crash]', err && err.message ? err.message : err);
    return null;
  }
};
