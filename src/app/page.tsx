'use client';

import React, { useState, useEffect } from 'react';
import ChatUI from './components/ChatUI'; // Gebruik de nieuwe ChatUI component
import { didactischeRollen, pedagogischeStijlen } from './prompts';

export default function Home() {
    const [vakinhoudelijk, setVakinhoudelijk] = useState('');
    const [vakdidactisch, setVakdidactisch] = useState(didactischeRollen[0].prompt);
    const [pedagogisch, setPedagogisch] = useState(pedagogischeStijlen[0].prompt);
    const [didactischeRol, setDidactischeRol] = useState(didactischeRollen[0].rol);
    const [pedagogischeStijl, setPedagogischeStijl] = useState(pedagogischeStijlen[0].stijl);
    
    const [shareableLink, setShareableLink] = useState('');
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [isTestMode, setIsTestMode] = useState(false);

    useEffect(() => {
        // Reset de testmodus als de configuratie verandert
        setIsTestMode(false);
        setShareableLink('');
    }, [vakinhoudelijk, vakdidactisch, pedagogisch]);

    const handleDidactischeRolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRol = didactischeRollen.find(r => r.rol === e.target.value);
        if (selectedRol) {
            setDidactischeRol(selectedRol.rol);
            setVakdidactisch(selectedRol.prompt);
        }
    };

    const handlePedagogischeStijlChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedStijl = pedagogischeStijlen.find(s => s.stijl === e.target.value);
        if (selectedStijl) {
            setPedagogischeStijl(selectedStijl.stijl);
            setPedagogisch(selectedStijl.prompt);
        }
    };

    const handleCreateShareableLink = async () => {
        setIsCreatingLink(true);
        setShareableLink('');
        try {
            const response = await fetch('/api/create-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vakinhoudelijk, vakdidactisch, pedagogisch }),
            });

            if (!response.ok) {
                throw new Error('Kon de link niet aanmaken');
            }

            const { id } = await response.json();
            const newLink = `${window.location.origin}/chat/${id}`;
            setShareableLink(newLink);
        } catch (error) {
            console.error(error);
            alert('Er is een fout opgetreden bij het aanmaken van de link.');
        } finally {
            setIsCreatingLink(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareableLink);
        alert('Link gekopieerd naar klembord!');
    };

    const startTestChat = () => {
        setIsTestMode(true);
    };

    return (
        <main className="min-h-screen bg-gray-50 text-gray-800">
            <div className="w-full bg-white shadow-md p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-purple-700">AI-leeromgeving voor Docenten</h1>
                <p className="text-sm text-gray-500">Ontwikkel de perfecte AI-assistent voor jouw studenten.</p>
            </div>

            <div className="container mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Linker kolom: Configuratie */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-6 border-b pb-4">1. Configureer de AI-assistent</h2>
                        
                        {/* Vakinhoudelijk */}
                        <div className="mb-6">
                            <label htmlFor="vakinhoudelijk" className="block text-lg font-medium text-gray-700 mb-2">Vakinhoudelijke focus</label>
                            <p className="text-sm text-gray-500 mb-3">Geef hier de kern van de leerstof op. Wat moet de student leren? Wees zo specifiek mogelijk.</p>
                            <textarea
                                id="vakinhoudelijk"
                                value={vakinhoudelijk}
                                onChange={(e) => setVakinhoudelijk(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                placeholder="Bijv. de stelling van Pythagoras, de oorzaken van de Franse Revolutie, of de werking van fotosynthese."
                                rows={4}
                            />
                        </div>

                        {/* Vakdidactisch */}
                        <div className="mb-6">
                            <label htmlFor="vakdidactisch" className="block text-lg font-medium text-gray-700 mb-2">Didactische rol</label>
                            <p className="text-sm text-gray-500 mb-3">Kies de rol die de AI moet aannemen om de student te begeleiden.</p>
                            <select
                                id="vakdidactisch"
                                value={didactischeRol}
                                onChange={handleDidactischeRolChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
                            >
                                {didactischeRollen.map(rol => (
                                    <option key={rol.rol} value={rol.rol}>{rol.rol}</option>
                                ))}
                            </select>
                        </div>

                        {/* Pedagogisch */}
                        <div className="mb-6">
                            <label htmlFor="pedagogisch" className="block text-lg font-medium text-gray-700 mb-2">Pedagogische stijl</label>
                            <p className="text-sm text-gray-500 mb-3">Selecteer de pedagogische aanpak van de AI.</p>
                            <select
                                id="pedagogisch"
                                value={pedagogischeStijl}
                                onChange={handlePedagogischeStijlChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
                            >
                                {pedagogischeStijlen.map(stijl => (
                                    <option key={stijl.stijl} value={stijl.stijl}>{stijl.stijl}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-xl font-semibold mb-4">2. Genereer & Deel</h3>
                            <p className="text-sm text-gray-500 mb-4">Klaar met de configuratie? Genereer een unieke link en deel deze met je studenten. Of test de chatbot eerst zelf.</p>
                            
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleCreateShareableLink}
                                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:bg-gray-400"
                                    disabled={!vakinhoudelijk || isCreatingLink}
                                >
                                    {isCreatingLink ? 'Link aanmaken...' : 'Maak deelbare link'}
                                </button>
                                <button
                                    onClick={startTestChat}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition disabled:bg-gray-400"
                                    disabled={!vakinhoudelijk}
                                >
                                    Test de Chatbot
                                </button>
                            </div>

                            {shareableLink && (
                                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <p className="font-semibold text-purple-800">Deel deze link met je studenten:</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <input
                                            type="text"
                                            value={shareableLink}
                                            readOnly
                                            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                                        />
                                        <button
                                            onClick={copyToClipboard}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                        >
                                            Kopieer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rechter kolom: Chat UI */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-6 border-b pb-4">Testomgeving</h2>
                        {isTestMode ? (
                            <ChatUI 
                                config={{ vakinhoudelijk, vakdidactisch, pedagogisch }}
                                isTest={true}
                            />
                        ) : (
                            <div className="text-center text-gray-500 mt-16">
                                <p className="mb-4">Klik op "Test de Chatbot" om een voorbeeld van de chat te starten.</p>
                                <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
} 