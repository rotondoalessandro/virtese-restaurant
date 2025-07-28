'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContattiPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', email: '', message: '' });
      } else {
        throw new Error();
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5efe6] text-black min-h-screen pt-[150px] py-20 px-6 md:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contattaci</h1>
          <p className="text-lg md:text-xl">
            Per prenotazioni, eventi o richieste speciali, siamo a tua disposizione.
          </p>
        </motion.div>

        {/* Contatti diretti */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 text-center"
        >
          <div>
            <h2 className="text-xl font-semibold mb-2">Telefono</h2>
            <p><a href="tel:+393331234567" className="hover:underline">+39 333 123 4567</a></p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Email</h2>
            <p><a href="mailto:info@virtese.com" className="hover:underline">info@virtese.com</a></p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">WhatsApp</h2>
            <p><a href="https://wa.me/393331234567" target="_blank" rel="noopener noreferrer" className="hover:underline">Scrivici su WhatsApp</a></p>
          </div>
        </motion.div>

        {/* Form di contatto */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Invia un messaggio</h2>
          <form
            className="grid gap-6 max-w-xl mx-auto"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Nome"
              className="border border-gray-300 px-4 py-3 rounded-lg w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 px-4 py-3 rounded-lg w-full"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <textarea
              placeholder="Messaggio"
              className="border border-gray-300 px-4 py-3 rounded-lg w-full h-32 resize-none"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <button
              type="submit"
              className="bg-black text-white cursor-pointer px-6 py-3 rounded-full hover:bg-gray-800 transition"
              disabled={loading}
            >
              {loading ? 'Invio in corso…' : 'Invia messaggio →'}
            </button>
            {success && (
              <p className="text-green-600 font-medium text-center">Messaggio inviato con successo!</p>
            )}
            {error && (
              <p className="text-red-600 font-medium text-center">Errore durante l’invio. Riprova.</p>
            )}
          </form>
        </motion.div>

        {/* Mappa */}
        <motion.div
          className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2768.99690907176!2d14.208556187642966!3d40.81450737272891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sit!4v1750113619330!5m2!1sen!2sit"
            className="w-full h-full"
            allowFullScreen
            loading="lazy"
            style={{ border: 0 }}
          />
        </motion.div>
      </div>
    </div>
  );
}
