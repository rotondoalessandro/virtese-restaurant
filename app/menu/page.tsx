'use client';

import Image from 'next/image';

export default function MenuPage() {
  return (
    <div className="bg-[#f9f5ef] text-[#1e1e1e] font-newsreader min-h-screen pt-32 px-6 md:px-16 pb-20">
      {/* Logo */}
      <div className="text-center mb-12">
        <Image
          src="/logo-black.png"
          alt="Virtese Restaurant Logo"
          width={300}
          height={100}
          className="mx-auto"
        />
      </div>

      {/* Menu Section */}
      <div className="max-w-4xl mx-auto space-y-12">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-2xl md:text-3xl font-semibold border-b border-gray-400 pb-2 mb-4">
              {section.title}
            </h2>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item.name} className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="whitespace-nowrap">€{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const sections = [
  {
    title: 'Antipasti',
    items: [
      { name: 'Crudo di Mare', price: 22 },
      { name: 'Tartare di Tonno Rosso', price: 18 },
      { name: 'Polpo Croccante e Crema di Patate', price: 16 },
    ],
  },
  {
    title: 'Primi',
    items: [
      { name: 'Spaghetti alle Vongole Veraci', price: 20 },
      { name: 'Risotto al Limone e Gamberi', price: 22 },
      { name: 'Tagliolini all’Astice', price: 28 },
    ],
  },
  {
    title: 'Secondi',
    items: [
      { name: 'Branzino al Sale', price: 26 },
      { name: 'Frittura di Mare Mista', price: 24 },
      { name: 'Tonno Scottato con Sesamo', price: 25 },
    ],
  },
  {
    title: 'Dolci',
    items: [
      { name: 'Delizia al Limone', price: 9 },
      { name: 'Tiramisù della Casa', price: 8 },
      { name: 'Semifreddo al Pistacchio', price: 9 },
    ],
  },
  {
    title: 'Vini',
    items: [
      { name: 'Falanghina DOC', price: 24 },
      { name: 'Greco di Tufo', price: 28 },
      { name: 'Champagne Brut', price: 65 },
    ],
  },
  {
    title: 'Bibite',
    items: [
      { name: 'Acqua Naturale / Frizzante', price: 3 },
      { name: 'Soft Drink', price: 4 },
      { name: 'Caffè', price: 2 },
    ],
  },
];
