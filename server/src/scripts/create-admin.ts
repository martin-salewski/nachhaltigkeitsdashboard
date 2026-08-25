/**
 * Legt den ersten Admin-Account an — der einzige Weg auf einen frischen Server.
 *
 * Selbstregistrierung ist deaktiviert und die Admin-Endpunkte verlangen eine
 * bestehende Admin-Session. Ohne diesen Bootstrap käme man in eine leere
 * Datenbank nicht hinein.
 *
 *   Im Container:  docker compose exec backend node dist/src/scripts/create-admin.js <email> "<Name>"
 *   Lokal:         npm run auth:create-admin -- <email> "<Name>"
 *
 * Das Passwort kommt aus ADMIN_PASSWORD; ohne die Variable wird eines erzeugt
 * und einmalig ausgegeben. Über die Umgebungsvariable landet es nicht in der
 * Shell-Historie und nicht in der Prozessliste.
 */
import 'dotenv/config';
import { randomBytes, randomUUID } from 'crypto';
import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db.js';
import { user, account } from '../drizzle/schema.js';
import { ALLOWED_EMAIL_DOMAIN } from '../config.js';

const [email, name] = process.argv.slice(2);
if (!email || !name) {
  console.error('Aufruf: create-admin <email> "<Name>"');
  process.exit(1);
}

if (!email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
  console.error(`Nur Adressen auf ${ALLOWED_EMAIL_DOMAIN} sind zugelassen.`);
  process.exit(1);
}

// Bootstrap heißt: genau einmal. Weitere Accounts entstehen über die Oberfläche,
// damit die Einladung per Mail und die Rollenvergabe den normalen Weg nehmen.
const [existingAdmin] = await db.select().from(user).where(eq(user.role, 'admin'));
if (existingAdmin) {
  console.error(`Es existiert bereits ein Admin (${existingAdmin.email}).`);
  console.error('Weitere Accounts bitte über /admin anlegen.');
  process.exit(1);
}

const [duplicate] = await db.select().from(user).where(eq(user.email, email));
if (duplicate) {
  console.error(`${email} existiert bereits.`);
  process.exit(1);
}

const generated = !process.env.ADMIN_PASSWORD;
const password = process.env.ADMIN_PASSWORD ?? randomBytes(12).toString('base64url');
if (password.length < 12) {
  console.error('ADMIN_PASSWORD muss mindestens 12 Zeichen haben.');
  process.exit(1);
}

const now = new Date();
const userId = randomUUID();

await db.insert(user).values({
  id: userId,
  name,
  email,
  emailVerified: false,
  createdAt: now,
  updatedAt: now,
  role: 'admin',
  banned: false,
});

await db.insert(account).values({
  id: randomUUID(),
  accountId: userId,
  providerId: 'credential',
  userId,
  password: await hashPassword(password),
  createdAt: now,
  updatedAt: now,
});

console.log(`Admin angelegt: ${email}`);
if (generated) {
  console.log(`Passwort: ${password}`);
  console.log('Einmalig notieren und nach der ersten Anmeldung ändern —');
  console.log('diese Zeile steht jetzt im Container-Log.');
}
process.exit(0);
