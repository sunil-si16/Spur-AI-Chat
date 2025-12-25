/// <reference types="vite/client" />
import { useState, useEffect, useRef } from 'react';

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

    // Debug logging
    console.log('API config:', {
        raw: import.meta.env.VITE_API_URL,
        processed: apiUrl,
        sessionId
    });

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
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        try {
            const res = await fetch(`${apiUrl}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, sessionId }),
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();
            if (data.sessionId && !sessionId) {
                setSessionId(data.sessionId);
                localStorage.setItem('chat_session_id', data.sessionId);
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection failed. Please check your network or server URL.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[650px] w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-xl p-6 text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg tracking-tight">Spur AI</h2>
                        <div className="flex items-center gap-1.5 opacity-80">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                            <span className="text-xs font-medium">Always Online</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => { localStorage.clear(); setMessages([]); setSessionId(null); }}
                    className="text-white/50 hover:text-white transition-colors p-2"
                    title="Clear Chat"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-4 text-white/60">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-2 rotate-3 hover:rotate-6 transition-transform">
                            <span className="text-2xl">👋</span>
                        </div>
                        <p className="text-lg font-medium text-white/90">Welcome to Spur Support!</p>
                        <p className="text-sm max-w-xs leading-relaxed">I can help you with shipping details, return policies, or product info. Ask me anything!</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex-shrink-0 mr-3 flex items-center justify-center text-[10px] text-white font-bold shadow-md self-end mb-1">AI</div>
                        )}
                        <div
                            className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm backdrop-blur-md ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-sm shadow-blue-500/10'
                                : 'bg-white/90 text-slate-800 rounded-bl-sm border border-white/50 shadow-lg'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start items-center gap-2 pl-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold opacity-50">AI</div>
                        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2.5 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-5 bg-white/5 border-t border-white/10 backdrop-blur-2xl">
                <div className="relative flex items-center group">
                    <input
                        type="text"
                        className="w-full pl-5 pr-14 py-4 bg-white/10 border border-white/10 rounded-2xl focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all text-white placeholder-white/40 shadow-inner text-[15px]"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
