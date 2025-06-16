'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const images = Array.from({ length: 8 }).map((_, i) => ({
  src: '/hero-restaurant.jpg', // 🔁 Cambia con le immagini vere
  alt: `Galleria ${i + 1}`,
}));

export default function LandingPage() {
  const [index, setIndex] = useState(-1);

  return (
    <div className="font-sans bg-black text-white min-h-screen overflow-x-hidden">
      {/* Hero */}
      <header className="relative h-screen w-full">
        <Image
          src="/hero-restaurant.jpg"
          alt="Virtese Restaurant sul mare"
          layout="fill"
          objectFit="cover"
          className="z-0"
          priority
        />
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 z-20 flex justify-center items-center">
          <motion.div
            className="drop-shadow-xl w-70 sm:w-80 md:w-90 lg:w-100 xl:w-100"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Image
              src="/logo.png"
              alt="Logo Virtese"
              width={800}
              height={800}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </div>
      </header>

      {/* Storia */}
      <section className="bg-[#f5efe6] text-black py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              La nostra storia
            </motion.h2>
            <motion.p
              className="text-lg leading-relaxed mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Virtese nasce da una lunga tradizione familiare. I nostri nonni, pescatori appassionati e cuochi generosi, 
              ci hanno trasmesso l&apos;amore per il mare e per i suoi sapori autentici.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link
                href="/menu"
                className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
              >
                Scopri il nostro Menu →
              </Link>
            </motion.div>
          </div>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image
              src="/plate.jpg"
              alt="Piatto di mare"
              width={600}
              height={400}
              className="rounded-xl shadow-lg object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Menu */}
      <section className="bg-white text-black py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Il nostro menu
          </motion.h2>
          <motion.p
            className="text-lg mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Scopri i piatti di mare preparati ogni giorno con ingredienti freschissimi.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image
              src="/hero-restaurant.jpg"
              alt="Menu"
              width={900}
              height={500}
              className="rounded-xl shadow-lg mx-auto object-cover"
            />
          </motion.div>
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link
              href="/menu"
              className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
            >
              Visualizza il Menu completo →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-[#f5efe6] text-black py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="w-full h-[300px] md:h-[400px]"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2768.99690907176!2d14.208556187642966!3d40.81450737272891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sit!4v1750113619330!5m2!1sen!2sit"
              className="w-full h-full rounded-xl shadow-lg"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
          <div>
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Dove siamo
            </motion.h2>
            <motion.p
              className="text-lg leading-relaxed mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Il nostro ristorante si affaccia direttamente sul mare, con una vista unica e un’atmosfera indimenticabile.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <a
                href="https://maps.app.goo.gl/6yYLofZ1ic21NWAq8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
              >
                Apri su Google Maps →
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Galleria con lightbox */}
      <section className="bg-white text-black py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Galleria</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIndex(i)}
                className="cursor-pointer"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={300}
                  className="rounded-xl object-cover"
                />
              </motion.div>
            ))}
          </div>
          <Lightbox
            open={index >= 0}
            close={() => setIndex(-1)}
            slides={images}
            index={index}
          />
        </div>
      </section>

      {/* Recensioni */}
      <section className="bg-[#f5efe6] text-black py-20 px-6 md:px-12 text-center">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Cosa dicono di noi</h2>
          <p className="italic mb-6">"Il miglior ristorante vista mare della zona, pesce freschissimo e staff super accogliente!"</p>
          <p className="font-semibold">– Recensione Google ⭐⭐⭐⭐⭐</p>
        </motion.div>
      </section>

      {/* Prenotazione */}
      <section className="bg-black text-white py-20 px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prenota un tavolo</h2>
          <p className="mb-6">Chiamaci o scrivici per riservare il tuo posto vista mare.</p>
          <a
            href="https://wa.me/393331234567"
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition"
            target="_blank"
          >
            Scrivici su WhatsApp →
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111] text-white py-12 px-6 text-center">
        <p className="mb-2">© 2025 Virtese Restaurant. Tutti i diritti riservati.</p>
        <div className="space-x-4">
          <Link href="/privacy">Privacy</Link>
          <span>|</span>
          <Link href="/contatti">Contatti</Link>
          <span>|</span>
          <Link href="https://instagram.com/virtese" target="_blank">Instagram</Link>
        </div>
      </footer>
    </div>
  );
}
