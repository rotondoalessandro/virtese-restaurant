'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { motion } from 'framer-motion';

const days = [
  { day: 'Lunedì', hours: '12:30–15:00\n19:30–23:00' },
  { day: 'Martedì', hours: '12:30–15:00\n9:30–23:00' },
  { day: 'Mercoledì', hours: '12:30–15:00\n19:30–23:00' },
  { day: 'Giovedì', hours: '12:30–15:00\n19:30–23:00' },
  { day: 'Venerdì', hours: '12:30–15:00\n9:30–23:30' },
  { day: 'Sabato', hours: '12:30–15:00\n19:30–23:30' },
  { day: 'Domenica', hours: '12:30–15:30\n19:00–22:30' },
];

export default function OpeningHoursSection() {
  return (
    <section className="bg-white text-black py-20 px-6 md:px-12">
      <motion.div
        className="max-w-5xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6">🕒 Orari di Apertura</h2>
        <p className="text-lg mb-8">Siamo aperti tutti i giorni per farti gustare il meglio del mare.</p>

        <Swiper
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 6 },
          }}
        >
          {days.map((d, i) => (
            <SwiperSlide key={i} className='mb-4'>
              <div className="bg-[#f5efe6] rounded-xl p-6 shadow-md h-full flex flex-col justify-center items-center">
                <p className="text-xl font-semibold mb-2">{d.day}</p>
                <p className="text-md whitespace-pre-line">{d.hours}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
}
