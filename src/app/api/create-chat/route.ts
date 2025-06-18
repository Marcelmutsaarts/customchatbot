import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
    try {
        const { vakinhoudelijk, vakdidactisch, pedagogisch } = await req.json();

        if (!vakinhoudelijk || !vakdidactisch || !pedagogisch) {
            return NextResponse.json({ error: "Alle drie de contextvelden zijn verplicht." }, { status: 400 });
        }

        const id = nanoid(10); // Genereer een unieke, korte ID

        // Sla de configuratie op in Vercel KV
        await kv.set(id, {
            vakinhoudelijk,
            vakdidactisch,
            pedagogisch
        });

        // Geef de nieuwe ID terug
        return NextResponse.json({ id: id });

    } catch (error) {
        console.error("Fout bij het maken van de chat link:", error);
        return NextResponse.json({ error: "Er is een interne fout opgetreden bij het opslaan van de chat." }, { status: 500 });
    }
} 