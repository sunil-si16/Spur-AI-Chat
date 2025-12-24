import express from 'express';
import { getOrCreateSession, addMessage, getSessionHistory } from '../services/chat';
import { generateReply } from '../services/llm';

const router = express.Router();

router.post('/message', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 1. Get or Create Session
        const session = await getOrCreateSession(sessionId);

        // 2. Persist User Message
        await addMessage(session.id, 'user', message);

        // 3. Get History for context
        const history = await getSessionHistory(session.id);
        const formattedHistory = history.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content
        })) as any[];

        // 4. Generate Reply
        const replyText = await generateReply(formattedHistory);

        // 5. Persist AI Message
        await addMessage(session.id, 'ai', replyText);

        res.json({ reply: replyText, sessionId: session.id });
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const history = await getSessionHistory(sessionId);
        res.json({ messages: history });
    } catch (error) {
        console.error('History endpoint error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
