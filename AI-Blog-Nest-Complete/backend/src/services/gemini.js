const { GoogleGenAI } = require("@google/genai");

function getAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function generateText(prompt) {
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    contents: prompt
  });

  return response.text || "No AI response was generated.";
}

async function generateBlogIdeas(topic) {
  return generateText(`
You are an AI assistant for AI Blog Nest.
Generate 5 useful blog ideas for this topic: ${topic}.
For each idea provide:
1. Title
2. Short description
3. Five tags
Use simple, clear English. Do not invent citations.
`);
}

async function improveContent(content) {
  return generateText(`
Improve the following blog content for grammar, clarity, readability,
accessibility and structure. Keep the author's original meaning.
Return only the improved content.

CONTENT:
${content}
`);
}

async function summarizeContent(content) {
  return generateText(`
Summarize the following blog content.
Keep the main points and important information.
Use simple and clear English.
Keep the summary concise.

CONTENT:
${content}
`);
}

async function chatbot(message) {
  return generateText(`
You are the AI Blog Nest assistant.
Help users with blogging, writing, accessibility, technology,
knowledge sharing and using this platform.
Be friendly, concise and useful.
Do not claim to perform actions that you cannot perform.

USER:
${message}
`);
}

module.exports = {
  generateBlogIdeas,
  improveContent,
  summarizeContent,
  chatbot
};