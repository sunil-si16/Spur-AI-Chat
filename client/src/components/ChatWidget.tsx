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

    // Construct API Base URL
    // If VITE_API_URL is set (e.g. "https://backend.com"), use it.
    // Otherwise, default to "" which implies relative path for proxy (e.g. "/api/...")
    let apiBase = import.meta.env.VITE_API_URL || '';
    if (apiBase && !apiBase.startsWith('http')) {
        apiBase = `https://${apiBase}`;
    }
    // Remove trailing slash
    apiBase = apiBase.replace(/\/$/, '');

    // Debug logging
    console.log('API config:', {
        raw: import.meta.env.VITE_API_URL,
        processed: apiBase,
        sessionId
    });

    useEffect(() => {
        if (sessionId) {
            // Note: Added /api prefix here
            fetch(`${apiBase}/api/chat/history/${sessionId}`)
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
            // Note: Added /api prefix here
            const res = await fetch(`${apiBase}/api/chat/message`, {
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
        <div className="flex flex-col h-[650px] w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden font-sans ring-1 ring-white/5">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-md p-6 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-white tracking-tight">Spur AI</h2>
                        <div className="flex items-center gap-2 text-indigo-200/80 text-xs font-medium">
                            <span className="uppercase tracking-wider">Online</span>
                            <span>•</span>
                            <span>Ready to help</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => { localStorage.clear(); setMessages([]); setSessionId(null); }}
                    className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    title="Clear Chat"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-gradient-to-b from-transparent to-black/20">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-4">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative w-20 h-20 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                <span className="text-4xl">👋</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-semibold text-white">Welcome to Spur Support</p>
                            <p className="text-sm text-indigo-200/60 max-w-xs mx-auto leading-relaxed">
                                I'm here to assist with shipping, returns, and product questions.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 mr-3 flex items-center justify-center text-[10px] text-white font-bold shadow-lg mt-1">AI</div>
                        )}
                        <div
                            className={`max-w-[85%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-lg backdrop-blur-md border ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-br-sm border-indigo-400/30'
                                    : 'bg-slate-800/80 text-indigo-50 rounded-bl-sm border-white/10'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start items-center gap-3 pl-1">
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 border border-white/10 flex-shrink-0 flex items-center justify-center text-[10px] text-white/50 font-bold">AI</div>
                        <div className="bg-slate-800/40 backdrop-blur-md rounded-full px-4 py-3 flex items-center gap-1.5 border border-white/5">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-5 bg-slate-900/60 backdrop-blur-xl border-t border-white/10">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white placeholder-white/30 shadow-inner text-[15px]"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:scale-95 disabled:cursor-not-allowed text-white rounded-full shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                        <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
