'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {

  return (
    <div className="font-sans bg-black text-white min-h-screen">
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
          <Image
            src="/logo.png"
            alt="Logo Virtese"
            width={400}
            height={400}
            className="drop-shadow-xl"
          />
        </div>
      </header>

      {/* Sezione Storia */}
      <section className="bg-[#f5efe6] text-black py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Testo */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">La nostra storia</h2>
            <p className="text-lg leading-relaxed mb-6">
              Virtese nasce da una lunga tradizione familiare. I nostri nonni, pescatori appassionati e cuochi generosi, 
              ci hanno trasmesso l&apos;amore per il mare e per i suoi sapori autentici. Oggi, continuiamo quel viaggio 
              offrendo piatti che raccontano storie di famiglia, di onde e di stagioni passate sul molo.
            </p>
            <Link
              href="/menu"
              className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
            >
              Scopri il nostro Menu →
            </Link>
          </div>

          {/* Immagine piatto */}
          <div className="flex justify-center">
            <Image
              src="/plate.jpg" // assicurati che questa immagine sia in /public
              alt="Piatto di mare"
              width={600}
              height={400}
              className="rounded-xl shadow-lg object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
