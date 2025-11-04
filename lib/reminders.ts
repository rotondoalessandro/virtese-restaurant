import { buildIcs } from "@/lib/ics";
import nodemailer from "nodemailer";
import type { Booking, Customer } from "@prisma/client";

type BookingWithCustomer = Booking & {
  customer: Customer | null;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
});

export async function sendReminderEmail(booking: BookingWithCustomer) {
  const customer = booking.customer;
  if (!customer?.email) return;

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const manageUrl = new URL(
    `/book/manage?token=${booking.manageToken ?? ""}`,
    base
  ).toString();

  const formatted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(booking.dateTime);

  const ics = buildIcs({
    uid: `booking-${booking.id}`,
    dtStart: booking.dateTime,
    durationMin: 90, // oppure leggi Rule se vuoi essere dinamico
    summary: "Virtese Restaurant — Reservation Reminder",
    location: "Virtese, 123 High Street, London",
    description: `Reminder for your table at ${formatted}. Manage: ${manageUrl}`,
  });

  const html = `
    <div style="font-family:Arial,sans-serif">
      <h2>Reminder — your reservation is coming up</h2>
      <p>Hi ${customer.name ?? "Guest"}, this is a reminder for <b>${formatted}</b> (${booking.partySize} guests).</p>
      <p>You can manage your reservation here: <a href="${manageUrl}">${manageUrl}</a></p>
      <p>We look forward to seeing you!</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to: customer.email,
    subject: "Reminder: your reservation at Virtese",
    html,
    attachments: [
      {
        filename: "virtese-reminder.ics",
        content: ics,
        contentType: "text/calendar; method=PUBLISH",
      },
    ],
  });
}
