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

const FROM = process.env.SMTP_FROM ?? 'noreply@hs-mainz.de';

async function send(email: string, subject: string, text: string, html: string, devLabel: string, link: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`[DEV] ${devLabel} für ${email}: ${link}`);
    return;
  }
  await getTransporter().sendMail({ from: FROM, to: email, subject, text, html });
}

/**
 * Einladung: Better Auth legt den Account an, der Link setzt das erste Passwort.
 * `url` kommt fertig von Better Auth (enthält Token und callbackURL).
 */
export async function sendInviteLinkEmail(email: string, url: string) {
  await send(
    email,
    'Einladung zum Nachhaltigkeitsdashboard',
    `Hallo,\n\nSie wurden zum Nachhaltigkeitsdashboard der Hochschule Mainz eingeladen.\n\nBitte klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen:\n${url}\n\nDer Link ist 48 Stunden gültig.`,
    `<p>Hallo,</p><p>Sie wurden zum <strong>Nachhaltigkeitsdashboard der Hochschule Mainz</strong> eingeladen.</p><p>Bitte klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen:</p><p><a href="${url}">${url}</a></p><p>Der Link ist 48 Stunden gültig.</p>`,
    'Einladungslink',
    url,
  );
}

/** Passwort-Reset. `url` kommt fertig von Better Auth. */
export async function sendResetLinkEmail(email: string, url: string) {
  await send(
    email,
    'Passwort zurücksetzen – Nachhaltigkeitsdashboard',
    `Hallo,\n\nSie haben eine Passwortzurücksetzung angefordert.\n\nBitte klicken Sie auf den folgenden Link:\n${url}\n\nFalls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.`,
    `<p>Hallo,</p><p>Sie haben eine Passwortzurücksetzung angefordert.</p><p><a href="${url}">${url}</a></p><p>Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.</p>`,
    'Passwort-Reset-Link',
    url,
  );
}
