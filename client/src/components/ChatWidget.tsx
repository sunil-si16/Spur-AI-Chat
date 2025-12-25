import React, { useState, useEffect, useRef } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatWidget() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chat_session_id'));
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    let apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
        apiUrl = '/api';
    } else if (!apiUrl.startsWith('http')) {
        apiUrl = `https://${apiUrl}`;
    }

    useEffect(() => {
        if (sessionId) {
            fetch(`${apiUrl}/chat/history/${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.messages) {
                        setMessages(data.messages.map((m: any) => ({
                            role: m.sender === 'user' ? 'user' : 'assistant',
                            content: m.content
                        })));
                    }
                })
                .catch(err => console.error('Failed to load history:', err));
        }
    }, [sessionId]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setIsLoading(true);

        // Optimistic add (optional, but robust)
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        try {
            const res = await fetch(`${apiUrl}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMsg, sessionId }),
            });

            const data = await res.json();

            if (data.sessionId && !sessionId) {
                setSessionId(data.sessionId);
                localStorage.setItem('chat_session_id', data.sessionId);
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-md p-4 text-white font-semibold flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span>Spur Support Agent</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full border border-white/10">Online</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="text-center text-white/60 mt-10 text-sm">
                        <p>👋 Hi! Ask me anything about shipping, returns, or our products.</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm backdrop-blur-sm ${msg.role === 'user'
                                ? 'bg-purple-600/80 text-white rounded-br-none border border-purple-500/50'
                                : 'bg-white/80 text-gray-800 rounded-bl-none border border-white/50'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-xs text-white/80 animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2 backdrop-blur-md">
                <input
                    type="text"
                    className="flex-1 px-4 py-2 bg-white/20 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-sm text-white placeholder-white/50"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                />
                <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all shadow-lg hover:shadow-purple-500/30"
                >
                    <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
