import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173';
const FROM = process.env.SMTP_FROM ?? 'noreply@hs-mainz.de';

export async function sendInviteEmail(email: string, token: string) {
  const link = `${APP_URL}/accept-invite?token=${token}`;

  if (!process.env.SMTP_HOST) {
    console.log(`[DEV] Einladungslink für ${email}: ${link}`);
    return;
  }

  await getTransporter().sendMail({
    from: FROM,
    to: email,
    subject: 'Einladung zum Nachhaltigkeitsdashboard',
    text: `Hallo,\n\nSie wurden zum Nachhaltigkeitsdashboard der Hochschule Mainz eingeladen.\n\nBitte klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen:\n${link}\n\nDer Link ist 48 Stunden gültig.`,
    html: `<p>Hallo,</p><p>Sie wurden zum <strong>Nachhaltigkeitsdashboard der Hochschule Mainz</strong> eingeladen.</p><p>Bitte klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen:</p><p><a href="${link}">${link}</a></p><p>Der Link ist 48 Stunden gültig.</p>`,
  });
}

export async function sendResetEmail(email: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`;

  if (!process.env.SMTP_HOST) {
    console.log(`[DEV] Passwort-Reset-Link für ${email}: ${link}`);
    return;
  }

  await getTransporter().sendMail({
    from: FROM,
    to: email,
    subject: 'Passwort zurücksetzen – Nachhaltigkeitsdashboard',
    text: `Hallo,\n\nSie haben eine Passwortzurücksetzung angefordert.\n\nBitte klicken Sie auf den folgenden Link:\n${link}\n\nDer Link ist 1 Stunde gültig. Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.`,
    html: `<p>Hallo,</p><p>Sie haben eine Passwortzurücksetzung angefordert.</p><p><a href="${link}">${link}</a></p><p>Der Link ist 1 Stunde gültig. Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.</p>`,
  });
}
