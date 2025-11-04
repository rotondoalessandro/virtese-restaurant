export function buildIcs(opts: {
  uid: string;           // booking.id
  dtStart: Date;         // UTC ok, i client adattano TZ
  durationMin: number;   // es. 90
  summary: string;       // "Virtese Restaurant — Reservation"
  description?: string;
  location?: string;
}): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = pad(d.getUTCMonth() + 1);
    const da = pad(d.getUTCDate());
    const h = pad(d.getUTCHours());
    const mi = pad(d.getUTCMinutes());
    const s = pad(d.getUTCSeconds());
    return `${y}${m}${da}T${h}${mi}${s}Z`;
  };
  const dtStart = opts.dtStart;
  const dtEnd = new Date(dtStart.getTime() + opts.durationMin * 60_000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Virtese//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@virtese`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dtStart)}`,
    `DTEND:${fmt(dtEnd)}`,
    `SUMMARY:${escapeText(opts.summary)}`,
    opts.location ? `LOCATION:${escapeText(opts.location)}` : "",
    opts.description ? `DESCRIPTION:${escapeText(opts.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

function escapeText(s: string) {
  return s.replace(/\\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\r?\n/g, "\\n");
}
