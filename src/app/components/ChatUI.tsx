'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatUIProps {
    config: {
        vakinhoudelijk: string;
        vakdidactisch: string;
        pedagogisch: string;
    };
    isTest?: boolean;
    className?: string;
}

export default function ChatUI({ config, isTest = false, className = '' }: ChatUIProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChatStarted, setIsChatStarted] = useState(false);

    const handleStartChat = async () => {
        setIsLoading(true);
        setIsChatStarted(true);
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history: [], context: config })
            });
            if (!response.ok) throw new Error("Starten van de chat mislukt.");
            const data = await response.json();
            if (data.response) {
                setMessages([{ role: "bot", text: data.response }]);
            }
        } catch (error) {
            console.error("Fout bij het starten van de chat:", error);
            setMessages([{ role: "bot", text: "Sorry, ik kon niet correct opstarten." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!currentMessage.trim() || isLoading) return;

        const userMessage = currentMessage.trim();
        
        // Expliciet het type van het nieuwe bericht object definiëren
        const newUserMessage: Message = { role: 'user', text: userMessage };
        const newMessages = [...messages, newUserMessage];
        
        setMessages(newMessages);
        setCurrentMessage("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history: newMessages, context: config }),
            });
            if (!response.ok) throw new Error("Er is iets misgegaan.");
            const data = await response.json();
            setMessages([...newMessages, { role: "bot", text: data.response }]);
        } catch (error) {
            console.error("Fout bij het verzenden van bericht:", error);
            setMessages(prev => [...prev, { role: "bot", text: "Sorry, er is een fout opgetreden." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetChat = () => {
        setIsChatStarted(false);
        setMessages([]);
    };
    
    // Effect om de chat te resetten als de config verandert in de testomgeving
    useEffect(() => {
        if (isTest) {
            handleResetChat();
        }
    }, [config, isTest]);

    // Effect om de chat automatisch te starten voor studenten
    useEffect(() => {
        if (!isTest) {
            handleStartChat();
        }
    }, [isTest]);


    return (
        <div className={`bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden ${className}`}>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {isTest ? 'Live Testomgeving' : 'Chatbot'}
                </h2>
                {isTest && (
                    <button onClick={handleResetChat} className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 text-sm font-medium">
                        Reset Chat
                    </button>
                )}
            </div>

            {!isChatStarted ? (
                <div className="p-12 text-center h-[32rem] flex flex-col items-center justify-center">
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10m0-2s.657-1.343 2.657-3.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1014.12 11.88m-4.242 4.242L6 20l-4-4 3.879-3.879m0 0a3 3 0 004.242 0" /></svg>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">Start het gesprek</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                           {isTest ? 'Klik op de knop hieronder om de chatbot te activeren met de huidige instellingen.' : 'De chatbot wordt voor je gestart...'}
                        </p>
                    </div>
                    {isTest && (
                         <button onClick={handleStartChat} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-10 py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 text-xl font-semibold shadow-xl transition-all duration-200 transform hover:-translate-y-0.5" disabled={isLoading || !config.vakinhoudelijk || !config.vakdidactisch || !config.pedagogisch}>
                            {isLoading ? "Bezig..." : "Start de Testchat"}
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col h-[32rem]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 p-4 bg-white">
                        <form onSubmit={handleSubmit} className="flex space-x-3">
                            <input type="text" className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" placeholder="Stel je vraag aan de chatbot..." value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} disabled={isLoading} />
                            <button type="submit" className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all duration-200 shadow-lg" disabled={isLoading}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 