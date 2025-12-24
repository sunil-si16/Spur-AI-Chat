import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ override: true });

// Default to a mock if no key provided, or handle gracefully
const apiKey = process.env.OPENAI_API_KEY;
console.log("LLM Service - API Key:", apiKey ? apiKey.substring(0, 15) + "..." : "None");
console.log("LLM Service - BaseURL: https://openrouter.ai/api/v1");

const openai = apiKey ? new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Spur AI Chat',
    }
}) : null;

const SYSTEM_PROMPT = `
You are a helpful customer support agent for "Spur Mart", a fictional e-commerce store.
Your goal is to answer user questions clearly and concisely.

Domain Knowledge:
- Shipping Policy: We ship worldwide. US orders take 3-5 business days. International orders take 7-14 business days. Free shipping on orders over $50.
- Return Policy: You can return any item within 30 days of receipt for a full refund. Items must be unused and in original packaging.
- Support Hours: Mon-Fri, 9am - 5pm EST.
- About Spur: We are a "boring makes money" customer engagement platform powering this chat.

Guidelines:
- If you don't know the answer, politely say you don't have that information.
- Be friendly but professional.
- Keep answers short (under 3 sentences) unless detailed explanation is needed.
`;

export async function generateReply(conversationHistory: { role: 'user' | 'system' | 'assistant', content: string }[]) {
    if (!openai) {
        return "I am currently in demo mode (no API key configured). But I would tell you that Spur Mart is great!";
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo', // Cost effective
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...conversationHistory
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        return response.choices[0]?.message?.content || "I'm not sure how to respond to that.";
    } catch (error: any) {
        console.error("LLM API Error:", error);
        return "I'm having trouble connecting to my brain right now. Please try again later.";
    }
}
