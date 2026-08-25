/**
 * Einmalige Übernahme der Accounts aus der alten `users`-Tabelle nach Better Auth.
 *
 * Passwörter werden bewusst NICHT übernommen: die alten Hashes sind bcrypt,
 * Better Auth nutzt scrypt. Statt eigenen Krypto-Code einzuhängen bekommt jeder
 * Account ein zufälliges Wegwerf-Passwort und per Mail einen Link, um selbst
 * eines zu setzen — derselbe Weg wie bei einer normalen Einladung.
 *
 *   npm run auth:migrate-users
 *
 * Mehrfaches Ausführen ist unschädlich: bereits übernommene E-Mails werden
 * übersprungen.
 */
import 'dotenv/config';
import { randomBytes, randomUUID } from 'crypto';
import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db.js';
import { users, user, account } from '../drizzle/schema.js';
import { auth } from '../auth.js';

const legacyUsers = await db.select().from(users);
console.log(`[migrate-users] ${legacyUsers.length} Accounts in der alten Tabelle gefunden`);

let created = 0;
let skipped = 0;

for (const legacy of legacyUsers) {
  const [existing] = await db.select().from(user).where(eq(user.email, legacy.email));
  if (existing) {
    console.log(`  · ${legacy.email} — existiert bereits, übersprungen`);
    skipped++;
    continue;
  }

  const role = legacy.role === 'admin' ? 'admin' : 'mitarbeiterin';
  const now = new Date();
  const userId = randomUUID();

  await db.insert(user).values({
    id: userId,
    name: legacy.username,
    email: legacy.email,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    role,
    banned: false,
  });

  // Credential-Account mit unbekanntem Passwort — nötig, damit der
  // Reset-Flow von Better Auth greift.
  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: await hashPassword(randomBytes(32).toString('base64url')),
    createdAt: now,
    updatedAt: now,
  });

  const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
  await auth.api.requestPasswordReset({
    body: { email: legacy.email, redirectTo: `${appUrl}/accept-invite` },
  });

  console.log(`  ✓ ${legacy.email} (${role}) angelegt, Einladung verschickt`);
  created++;
}

console.log(`[migrate-users] fertig: ${created} angelegt, ${skipped} übersprungen`);
process.exit(0);
