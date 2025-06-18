import React, { Suspense } from 'react';
import { kv } from '@vercel/kv';
import ChatUI from '../../components/ChatUI';
import { notFound } from 'next/navigation';

interface ChatPageParams {
    params: {
        id: string;
    }
}

// Dit component toont een laad-indicator terwijl de data wordt opgehaald.
function ChatLoading() {
    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chatbot wordt geladen...</h2>
            <p className="text-gray-600">Een moment geduld, de configuratie wordt opgehaald.</p>
        </div>
    );
}

// Dit is de hoofdcomponent die de data ophaalt en de UI toont.
async function ChatComponent({ id }: { id: string }) {
    const config = await kv.get<{ vakinhoudelijk: string; vakdidactisch: string; pedagogisch: string; }>(id);

    if (!config) {
        return notFound();
    }

    return <ChatUI config={config} />;
}

export default async function ShareableChatPage({ params }: ChatPageParams) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
            <Suspense fallback={<ChatLoading />}>
                <ChatComponent id={params.id} />
            </Suspense>
        </div>
    );
} 