/**
 * Gemeinsame Betriebseinstellungen. Liegt bewusst getrennt von auth.ts, damit
 * services/email.ts sie nutzen kann, ohne einen Zirkelbezug zu erzeugen
 * (auth.ts importiert email.ts).
 */

export const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

/**
 * "Läuft öffentlich" wird an der Basis-URL festgemacht und nicht allein an
 * NODE_ENV: die Variable wird zwar im Dockerfile gesetzt, ein Deployment ohne
 * sie soll aber nicht stillschweigend in den Entwicklungsmodus fallen.
 */
export const isProductionDeployment =
  baseURL.startsWith('https://') || process.env.NODE_ENV === 'production';

/** Accounts sind auf Dienstadressen der Hochschule beschränkt. */
export const ALLOWED_EMAIL_DOMAIN = '@hs-mainz.de';
