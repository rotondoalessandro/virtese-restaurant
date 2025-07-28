import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 });
  }

  // Configura il tuo SMTP (Aruba, Gmail, ecc.)
  const transporter = nodemailer.createTransport({
    host: 'smtps.aruba.it',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Virtese Restaurant" <${process.env.SMTP_USER}>`,
      to: 'info@virtese.com', // la tua email di ricezione
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
