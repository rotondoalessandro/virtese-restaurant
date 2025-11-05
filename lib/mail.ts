import nodemailer from "nodemailer";

export function createTransportFromEnv() {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT!);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export const mailer = createTransportFromEnv();

