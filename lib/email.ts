import nodemailer from "nodemailer";
import { buildIcs } from "@/lib/ics"; // 👈 nuovo import ICS helper

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

// ----------------------------------------
// 📩 CONFIRMATION EMAIL + ICS ATTACHMENT
// ----------------------------------------
export async function sendBookingConfirmation(
  to: string,
  details: {
    name: string;
    dateTime: Date;
    partySize: number;
    area?: string | null;
    manageToken: string;
  }
) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const manageUrl = new URL(`/book/manage?token=${details.manageToken}`, base).toString();

  const formatted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(details.dateTime);

  const areaText = details.area ? ` in our <b>${details.area.toLowerCase()}</b> area` : "";

  // HTML email body
  const html = `
  <div style="font-family:Arial,sans-serif;padding:24px;background:#fafafa;color:#222">
    <h2 style="color:#111">🍷 Your reservation at Virtese Restaurant</h2>
    <p>Dear <b>${details.name}</b>,</p>
    <p>Your table has been reserved for <b>${formatted}</b>${areaText} for <b>${details.partySize}</b> guests.</p>
    <p>You can manage or cancel your booking anytime:</p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0">
      <tr>
        <td align="center" bgcolor="#111" style="border-radius:6px">
          <a href="${manageUrl}" target="_blank"
             style="font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ffffff;text-decoration:none;padding:10px 20px;display:inline-block">
            Manage Reservation
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:#666">If the button doesn’t work, copy & paste this link:<br>
      <a href="${manageUrl}" target="_blank" style="color:#111">${manageUrl}</a>
    </p>

    <p>Warm regards,<br/>The Virtese Restaurant Team</p>
  </div>
  `;

  // 🔧 ICS file for Calendar apps
  const ics = buildIcs({
    uid: `virtese-${details.manageToken}`,
    dtStart: details.dateTime,
    durationMin: 90,
    summary: "Virtese Restaurant – Table Reservation",
    location: "Virtese Restaurant, 123 High Street, London",
    description: `Table for ${details.partySize} guests${areaText ? ` (${details.area})` : ""}. Manage or cancel: ${manageUrl}`,
  });

  // Diagnostic log
  console.log("[email] Sent booking confirmation to:", to);
  console.log("[email] Manage URL:", manageUrl);

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: "Your table at Virtese Restaurant is confirmed",
    html,
    attachments: [
      {
        filename: "virtese-reservation.ics",
        content: ics,
        contentType: "text/calendar; method=PUBLISH",
      },
    ],
  });
}

// ----------------------------------------
// 📥 ADMIN NOTIFICATION
// ----------------------------------------
export async function sendAdminNotification(
  to: string,
  summary: {
    name: string;
    email: string;
    dateTime: Date;
    partySize: number;
    area?: string | null;
    notes?: string | null;
  }
) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(summary.dateTime);

  const html = `
  <div style="font-family:Arial,sans-serif;padding:20px;background:#fff;color:#000">
    <h2>📥 New Booking Received</h2>
    <p><b>${summary.name}</b> (${summary.email})</p>
    <p><b>${formatted}</b> — ${summary.partySize} people ${
    summary.area ? `(${summary.area})` : ""
  }</p>
    ${summary.notes ? `<p>Notes: ${summary.notes}</p>` : ""}
  </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: `New booking – ${formatted}`,
    html,
  });
}

export async function sendWaitlistNotification(to: string, details: {
  name: string
  dateISO: string
  partySize: number
  area?: string | null
  suggestions: { time: string; area?: string }[] // fino a 3 orari
  baseUrl?: string
}) {
  const base = details.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const dateStr = new Intl.DateTimeFormat("en-GB", { dateStyle: "full" }).format(new Date(`${details.dateISO}T00:00:00`))

  const list = details.suggestions.map(s => {
    const href = new URL(`/book?date=${details.dateISO}&party=${details.partySize}${s.area?`&area=${s.area}`:''}`, base).toString()
    return `<li><a href="${href}" target="_blank" style="color:#111">${s.time}${s.area?` (${s.area})`:''}</a></li>`
  }).join("")

  const html = `
  <div style="font-family:Arial,sans-serif;padding:20px;background:#fff;color:#000">
    <h2>✨ A table might be available</h2>
    <p>Hi <b>${details.name}</b>, you’re on the waitlist for <b>${dateStr}</b> — ${details.partySize} guests${details.area?` (${details.area})`:''}.</p>
    ${details.suggestions.length ? `<p>Try these times:</p><ul>${list}</ul>` : `<p>Try searching again — new times may have opened.</p>`}
    <p><a href="${new URL(`/book?date=${details.dateISO}&party=${details.partySize}${details.area?`&area=${details.area}`:''}`, base).toString()}" target="_blank" style="color:#111">Open booking page</a></p>
    <p style="font-size:12px;color:#666">Availability is not guaranteed and can go quickly.</p>
  </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: "Waitlist update — a table may be available",
    html,
  })
}
