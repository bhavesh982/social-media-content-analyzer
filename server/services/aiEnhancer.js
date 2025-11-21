const OpenAI = require('openai');

async function enhanceWithAI(text) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media content strategist. Improve content quality.',
        },
        {
          role: 'user',
          content: `Analyze and improve this content:\n\n${text}`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('AI Enhancer Error:', err);
    return null;
  }
}

module.exports = { enhanceWithAI };
import OpenAI from "openai";

export const enhanceWithAI = async (text) => {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert social media content strategist. Improve content quality.",
        },
        {
          role: "user",
          content: `Analyze and improve this content:\n\n${text}`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("AI Enhancer Error:", err);
    return null;
  }
};

export default { enhanceWithAI };
// services/aiEnhancer.js
// TODO: implement optional AI enhancement helpers

module.exports = {};
