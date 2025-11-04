// lib/slots.ts
import { addMinutes } from "date-fns";

export function buildDaySlots(dayStart: Date, openMins: number, closeMins: number, interval: number) {
  const out: { time: string; date: Date }[] = [];
  for (let t = openMins; t <= closeMins; t += interval) {
    const d = addMinutes(dayStart, t);
    out.push({ time: toHHMM(d), date: d });
  }
  return out;
}

function toHHMM(d: Date) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function hmToMinutes(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}
