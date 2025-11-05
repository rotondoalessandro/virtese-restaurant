export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { requireSameOrigin } from '@/lib/http';
import { mailer } from '@/lib/mail';

export async function POST(req: NextRequest) {
  const chk = requireSameOrigin(req as unknown as Request);
  if (!chk.ok) return NextResponse.json({ error: 'Bad origin' }, { status: 400 });

  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 });
  }

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM!,
      to: 'info@virtese.com',
      subject: 'Nuovo messaggio dal sito',
      html: `
        <h2>Hai ricevuto un nuovo messaggio</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Errore invio email:', err);
    return NextResponse.json({ error: 'Errore invio email' }, { status: 500 });
  }
}
