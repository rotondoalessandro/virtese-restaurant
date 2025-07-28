'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react'; // usa un'icona moderna da lucide-react

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-md px-4 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo-2.png" alt="Logo Virtese" width={160} height={60} className="h-auto w-auto" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/menu" className="text-white text-lg font-medium hover:text-gray-300 transition">
            Menu
          </Link>
          <Link href="/contatti" className="text-white text-lg font-medium hover:text-gray-300 transition">
            Contatti
          </Link>
          <a
            href="https://instagram.com/wearevirtese" // ✅ Cambia con il tuo link reale
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 transition"
            aria-label="Instagram"
          >
            <Instagram size={24} />
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="text-white text-3xl focus:outline-none"
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-4 px-4 space-y-2">
          <Link
            href="/menu"
            onClick={() => setOpen(false)}
            className="block py-2 text-white text-lg font-medium hover:text-gray-300 transition"
          >
            Menu
          </Link>
          <Link
            href="/contatti"
            onClick={() => setOpen(false)}
            className="block py-2 text-white text-lg font-medium hover:text-gray-300 transition"
          >
            Contatti
          </Link>
          <a
            href="https://instagram.com/wearevirtese"
            target="_blank"
            rel="noopener noreferrer"
            className="block py-2 text-white text-lg font-medium hover:text-gray-300 transition"
          >
            Instagram
          </a>
        </div>
      )}
    </nav>
  );
}