async function enhanceWithAI(text) {
  console.log('[aiEnhancer] called — text length:', text ? text.length : 0);

  // Prefer Gemini/Generative Language API via GEMINI_API_KEY / GOOGLE_API_KEY
  let geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  // Fallback: if dotenv wasn't loaded into the process, try to read `.env` directly
  if (!geminiKey) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(__dirname, '..', '.env');
      if (fs.existsSync(envPath)) {
        const raw = fs.readFileSync(envPath, 'utf8');
        const m = raw.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m) || raw.match(/^GOOGLE_API_KEY\s*=\s*(.+)$/m);
        if (m && m[1]) {
          geminiKey = m[1].trim();
          console.log('[aiEnhancer] Loaded GEMINI/GOOGLE key from .env (partial):', geminiKey.slice(0, 8) + '...');
        }
      }
    } catch (e) {
      console.warn('[aiEnhancer] Could not read .env fallback for Gemini key:', e && e.message ? e.message : e);
    }
  }

  if (!geminiKey) {
    console.warn('[aiEnhancer] No GEMINI_API_KEY/GOOGLE_API_KEY configured; skipping AI enhancement');
    return null;
  }

  const geminiModel = process.env.GEMINI_MODEL || 'text-bison-001';
  console.log('[aiEnhancer] GEMINI key detected; routing request to Gemini API (model:', geminiModel + ')');

  // Use global fetch if available, otherwise try to require node-fetch
  let fetchFn = globalThis.fetch;
  if (!fetchFn) {
    try {
      fetchFn = require('node-fetch');
    } catch (e) {
      console.error('[aiEnhancer] fetch not available and node-fetch not installed');
      return null;
    }
  }

  const endpoint = process.env.GEMINI_ENDPOINT || `https://generativelanguage.googleapis.com/v1/models/${geminiModel}:generateText`;
  const body = {
    prompt: { text: `You are an expert social media content strategist. Improve content quality.\n\n${text}` },
    temperature: 0.6,
    maxOutputTokens: 500,
  };

  try {
    const start = Date.now();
    const res = await fetchFn(endpoint + `?key=${encodeURIComponent(geminiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const duration = Date.now() - start;
    console.log('[aiEnhancer] Gemini call completed in', duration, 'ms, status', res.status);
    const textBody = await res.text();
    let data = null;
    try {
      data = textBody ? JSON.parse(textBody) : null;
    } catch (e) {
      console.warn('[aiEnhancer] Could not parse Gemini response as JSON; logging raw text');
      console.log('[aiEnhancer] Gemini raw response text (truncated):', textBody ? textBody.substring(0, 2000) : '<empty>');
    }
    if (data) {
      try {
        console.log('[aiEnhancer] Gemini raw response (truncated):', JSON.stringify(data).substring(0, 2000));
      } catch (e) {}
    }
    if (res.status >= 400) {
      console.error('[aiEnhancer] Gemini returned HTTP', res.status, '- body (truncated):', textBody ? textBody.substring(0,2000) : '<empty>');
      return null;
    }

    // Parse common response shapes: Google generative API typically returns `candidates` with `content`
    let content = null;
    if (data && data.candidates && data.candidates.length && data.candidates[0].content) {
      content = data.candidates[0].content;
    } else if (data && data.output && Array.isArray(data.output) && data.output[0] && data.output[0].content) {
      content = data.output[0].content;
    } else if (data && data.result && data.result.output && data.result.output[0] && data.result.output[0].content) {
      content = data.result.output[0].content;
    }

    console.log('[aiEnhancer] Extracted content length:', content ? content.length : 0);
    return content || null;
  } catch (err) {
    console.error('[aiEnhancer] Error calling Gemini API:', err && err.message ? err.message : err);
    return null;
  }
}

// Gemini-only enhancer (CommonJS)
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

    // Normalize model ids array
    let modelIds = [];
    if (listJson) {
      // common shapes: {models:[{name:'models/gemini-1.5-flash',...}]} or {data:[{id:'gpt-...'}]}
      if (Array.isArray(listJson.models)) {
        modelIds = listJson.models.map(m => m.name || m.id || '').filter(Boolean);
      } else if (Array.isArray(listJson.data)) {
        modelIds = listJson.data.map(m => m.name || m.id || '').filter(Boolean);
      }
    }

    // If list failed, fall back to preferred list order
    const preferred = ['gemini-1.5-flash', 'gemini-pro-1.5', 'gemini-pro', 'gemini-1.0-pro'];
    let selectedModel = null;

    if (modelIds.length) {
      console.log('[aiEnhancer] Available models:', modelIds.slice(0,10));
      for (const pref of preferred) {
        const found = modelIds.find(id => id.toLowerCase().includes(pref));
        if (found) {
          selectedModel = found.includes('/') ? found.split('/').pop() : found;
          break;
        }
      }
      if (!selectedModel) {
        // try to pick any gemini model
        const any = modelIds.find(id => id.toLowerCase().includes('gemini'));
        if (any) selectedModel = any.includes('/') ? any.split('/').pop() : any;
      }
    } else {
      // no list available; assume gemini-1.5-flash by default
      selectedModel = 'gemini-1.5-flash';
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
            { text: 'You are a social media optimization expert. Improve this content:\n\n' + text },
          ],
        },
      ],
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
    return aiText;
  } catch (err) {
    console.error('[AI Enhancer Crash]', err && err.message ? err.message : err);
    return null;
  }
};
