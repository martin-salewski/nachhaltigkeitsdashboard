# Nachhaltigkeitsdashboard — Hochschule Mainz

Dashboard zur Visualisierung von Nachhaltigkeits- und Gebäudedaten der Hochschule Mainz (Energie, Emissionen, Mensa, Luftqualität, Studierenden-/Personalstatistik etc.).

## Architektur

```
client/     React + Vite Frontend (Port 5173 im Dev-Betrieb, Port 80 im Docker-Build)
server/     Hono/Express Backend + SQLite (via Drizzle ORM), Port 3000
n8n/        Export des n8n-Workflows, der Jahresbericht-Daten importiert
```

Im Produktivbetrieb laufen `client`, `server` und ein `n8n`-Service per `docker-compose.yml` zusammen.

## Setup (lokal)

```bash
# Backend
cd server
npm install
npm run dev          # http://localhost:3000

# Frontend (separates Terminal)
cd client
npm install
npm run dev           # http://localhost:5173, proxied /api und /admin zu :3000
```

Benötigte Umgebungsvariablen liegen in `server/.env` (siehe `server/.env` lokal, nicht im Repo):

- `JWT_SECRET` — Signing-Key für Login-Tokens
- `DB_FILE_NAME` — Pfad zur SQLite-Datei (lokal z. B. `file:./local.db`)
- `APP_URL` / `CORS_ORIGINS` — erlaubte Frontend-Origin
- `BUILDINGX_CLIENT_ID` / `BUILDINGX_CLIENT_SECRET` / `BUILDINGX_PARTITION` — Zugang zur BuildingX-Sensor-API
- `SMTP_*` — Mailversand für Einladungen/Passwort-Reset

## Datenquellen

| Bereich | Quelle | Aktualisierung |
|---|---|---|
| Studierenden-/Personalstatistik (`student_demographics`, `staff_demographics`, `people_stats`) | n8n-Workflow liest den jährlichen Hochschulbericht (PDF) von hs-mainz.de und lässt ihn per Gemini AI auswerten | alle 6 Monate (Cron `0 0 1 */6 *`) |
| Mensa-Speiseplan & -Statistik (`mensa_menu`, `mensa_meal_stats`) | XML-Import (`server/src/jobs/xmlImport.ts`) | täglich 15:00 Uhr |
| Raumklima/Sensorik (`sensor_data`) | BuildingX-API (`server/src/jobs/buildingxFetcher.ts`) | alle 10 Minuten |
| Alles andere (Energie, Emissionen, Müll, Mobilität, Lernräume, Ziele) | `server/src/seed.ts` | einmalig, statische Demo-/Zufallsdaten |

## n8n-Workflow (Jahresbericht-Import)

Der Workflow liegt exportiert unter [`n8n/workflows/jahresbericht-import.json`](./n8n/workflows/jahresbericht-import.json) und kann in eine n8n-Instanz importiert werden (`n8n import:workflow --input=jahresbericht-import.json`).

**Ablauf:** Login am Dashboard → Hochschulbericht-Seite abrufen → PDF-Link finden & laden → Gemini AI extrahiert Studierenden-/Personal-/Gesamtzahlen → bestehende Werte für das jeweilige Jahr werden per API aktualisiert (bzw. für `people_stats` zuerst gelöscht und frisch eingefügt, da die Demo-Daten monatlich, der Bericht aber nur jährlich vorliegt).

**Benötigte Credentials (müssen nach Import manuell in n8n angelegt werden, sind nicht im Export enthalten):**

1. **Basic Auth** — Username `admin`, Passwort des Dashboard-Admin-Accounts. Wird vom „Login"-Node verwendet, um sich gegen `/api/login` zu authentifizieren (Backend akzeptiert dort sowohl JSON-Body als auch HTTP Basic Auth).
2. **Google Gemini (PaLM) API** — API-Key für die Dokumentenanalyse im „Analyze document"-Node.

Beide Credentials werden im Workflow nur per `id`/`name`-Referenz verknüpft — die eigentlichen Secrets liegen ausschließlich verschlüsselt in der n8n-eigenen Datenbank, niemals im exportierten JSON oder im Git-Repo.
