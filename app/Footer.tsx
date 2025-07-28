'use client';

import Link from 'next/link';
import { FaInstagram, FaFacebook, FaTripadvisor } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#111] text-white py-12 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Info */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Virtese Restaurant</h3>
          <p>© 2025 Virtese. Tutti i diritti riservati.</p>
          <p>P.IVA 12345678901</p>
        </div>

        {/* Link utili */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Navigazione</h3>
          <ul className="space-y-1">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/menu">Menu</Link></li>
            <li><Link href="/contatti">Contatti</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Seguici</h3>
          <div className="flex justify-center md:justify-start gap-4 text-2xl">
            <Link href="https://instagram.com/virtese" target="_blank" aria-label="Instagram">
              <FaInstagram className="hover:text-gray-400 transition" />
            </Link>
            <Link href="https://facebook.com/virtese" target="_blank" aria-label="Facebook">
              <FaFacebook className="hover:text-gray-400 transition" />
            </Link>
            <Link href="https://tripadvisor.it/Restaurant_Review-g1234567-d1234567-Virtese.html" target="_blank" aria-label="Tripadvisor">
              <FaTripadvisor className="hover:text-gray-400 transition" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
