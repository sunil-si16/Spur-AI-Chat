import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getOrCreateSession(sessionId?: string) {
    if (sessionId) {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });
        if (session) return session;
    }
    // Create new session
    return prisma.session.create({
        data: {},
        include: { messages: true } // Empty initially
    });
}

export async function addMessage(sessionId: string, sender: 'user' | 'ai', content: string) {
    return prisma.message.create({
        data: {
            sessionId,
            sender,
            content
        }
    });
}

export async function getSessionHistory(sessionId: string) {
    return prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' }
    });
}
