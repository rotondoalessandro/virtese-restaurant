'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-md px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-white text-lg font-medium hover:text-gray-300 transition"
        >
          <Image src="/logo-2.png" alt="Logo Virtese" width={180} height={60} />
        </Link>
        {/* Desktop link */}
        <div className="hidden md:block">
          <Link
            href="/menu"
            className="text-white text-lg font-medium hover:text-gray-300 transition"
          >
            Menu
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button onClick={() => setOpen(!open)} className="text-white text-3xl focus:outline-none">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-4 px-4">
          <Link
            href="/menu"
            onClick={() => setOpen(false)}
            className="block py-2 text-white text-lg font-medium hover:text-gray-300 transition"
          >
            Menu
          </Link>
        </div>
      )}
    </nav>
  );
}