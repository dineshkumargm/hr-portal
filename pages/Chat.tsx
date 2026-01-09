
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../services/db';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm Agent Kai. I can help you analyze candidates, draft job descriptions, or answer questions about your current pipeline. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const [jobs, candidates] = await Promise.all([
                db.jobs.find(),
                db.candidates.find()
            ]);

            const context = `You are Agent Kai, an AI recruitment assistant. 
      Current stats: ${jobs.length} open jobs, ${candidates.length} candidates in pipeline.
      User asked: ${input}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: context,
                config: {
                    systemInstruction: "Keep responses helpful, professional, and concise. You have access to recruitment data."
                }
            });

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.text || "I'm sorry, I couldn't process that request.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "I encountered an error connecting to my core processing unit. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto py-4">
            <div className="flex items-center gap-4 mb-6 px-2">
                <div className="size-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold">K</div>
                <div>
                    <h2 className="text-xl font-bold text-text-main">Chat with Kai</h2>
                    <p className="text-xs text-text-tertiary">Your AI Recruitment Assistant</p>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`size-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-[10px] ${msg.role === 'user' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {msg.role === 'user' ? 'ME' : 'K'}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-blue-500 text-white rounded-tr-none shadow-sm'
                                    : 'bg-gray-50 text-text-main rounded-tl-none border border-gray-100'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] flex gap-3">
                                <div className="size-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center animate-pulse">K</div>
                                <div className="p-4 bg-gray-50 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
                                    <div className="size-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                    <div className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask anything about your pipeline..."
                            className="w-full h-14 pl-5 pr-24 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium outline-none"
                        />
                        <div className="absolute right-2 top-2 flex gap-2">
                            <button
                                type="button"
                                className="size-10 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                            </button>
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="h-10 px-4 bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10 flex items-center gap-2"
                            >
                                <span>Send</span>
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
