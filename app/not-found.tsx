'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="bg-[#f5efe6] text-black min-h-screen flex flex-col items-center justify-center px-6 text-center font-sans">
      <motion.h1
        className="text-5xl md:text-7xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        404
      </motion.h1>
      <motion.p
        className="text-lg md:text-xl mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Oops! La pagina che cerchi non esiste.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
        >
          Torna alla home →
        </Link>
      </motion.div>
    </div>
  );
}