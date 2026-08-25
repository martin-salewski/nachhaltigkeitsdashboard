# Deployment auf den Server

Schritt-für-Schritt-Anleitung für ein **frisches Deployment**. Die Reihenfolge ist an zwei Stellen bindend, beide sind unten markiert.

Stand: 25.08.2026, nach der Umstellung auf Better Auth.

---

## Voraussetzungen

- **Linux-Server mit root-Zugriff** (VPS oder eigene Maschine), Docker und Docker Compose
- Eine Domain, die auf den Server zeigt (A-Record gesetzt, DNS propagiert)
- Ports 80 und 443 von außen erreichbar
- SMTP-Zugangsdaten der Hochschule
- Zugangsdaten für Siemens BuildingX

> **Ein LAMP-Stack oder klassisches Webhosting reicht nicht.** Das Dashboard ist
> eine Node.js-Anwendung mit eigenem Serverprozess, keine PHP-Anwendung. Dateien
> per SFTP hochzuladen genügt nicht — es gibt keinen Build- und keinen
> Laufzeitschritt, den Apache oder PHP übernehmen könnten. Nötig sind ein
> Node-Prozess (bzw. Docker) und die Möglichkeit, ihn dauerhaft laufen zu lassen.

---

## 1. Repository holen

```bash
git clone git@gitlab.rlp.net:smart_building_reallabor/sustainability-dashboard.git
cd sustainability-dashboard
git checkout feature-ozan-frontend      # bis der Merge Request durch ist
```

Per Git, nicht per SFTP: das Image wird auf dem Server gebaut, und `git pull` ist
später der Update-Weg.

---

## 2. Konfiguration anlegen

```bash
cp .env.example .env
chmod 600 .env          # enthält SMTP-Passwort, BuildingX-Secret, Session-Schlüssel
nano .env
```

### Die vier Zeilen, die schweigend schiefgehen

```ini
DB_FILE_NAME=file:/data/local.db
```

**Muss auf `/data` zeigen.** Das ist der Mountpoint des Docker-Volumes `db_data`.
Ein relativer Pfad schreibt in die Schreibschicht des Containers — bei jedem
`docker compose up --build` wären alle Accounts und Daten weg.

```ini
BETTER_AUTH_URL=https://dashboard.hs-mainz.de
```

Die folgenreichste Zeile. Daran hängen **zwei** Schutzmechanismen:

- beginnt sie mit `https://`, gehen Session-Cookies mit `Secure` raus
- fehlt `SMTP_HOST`, bricht der Mailversand ab, statt Reset-Tokens ins Log zu schreiben

Bleibt sie auf `localhost`, sind beide still deaktiviert.

```ini
APP_URL=https://dashboard.hs-mainz.de
```

Ziel der Einladungs- und Reset-Links in den E-Mails.

```ini
CORS_ORIGINS=https://dashboard.hs-mainz.de
```

Dient zugleich als `trustedOrigins` für Better Auth — Anmeldeversuche von fremden
Herkünften werden abgewiesen. Das ist der CSRF-Schutz. Kommagetrennt, ohne
Leerzeichen.

### Session-Schlüssel neu erzeugen

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Nicht den Entwicklungswert übernehmen. Ein späterer Wechsel macht alle
bestehenden Sessions ungültig — mehr passiert nicht.

### E-Mail

```ini
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@hs-mainz.de
```

Ohne `SMTP_HOST` können keine Einladungen zugestellt werden, und der Server
verweigert den Versand bewusst mit einem Fehler.

---

## 3. nginx anpassen

In `nginx/nginx.conf` stehen vier Platzhalter:

```
Zeile 21   server_name DEINE_DOMAIN;
Zeile 35   server_name DEINE_DOMAIN;
Zeile 37   ssl_certificate     /etc/letsencrypt/live/DEINE_DOMAIN/fullchain.pem;
Zeile 38   ssl_certificate_key /etc/letsencrypt/live/DEINE_DOMAIN/privkey.pem;
```

```bash
sed -i 's/DEINE_DOMAIN/dashboard.hs-mainz.de/g' nginx/nginx.conf
grep -n DEINE_DOMAIN nginx/nginx.conf     # muss leer sein
```

### Subnetz prüfen

```
geo $is_internal {
    default           0;
    127.0.0.1         1;
    10.200.32.0/21    1;  # VLAN Beschäftigte HS-Mainz
}
```

Diese Regel schützt `/login`, `/admin` und `/api/auth/sign-in`. **Stimmt das
Subnetz nicht, sperrst du dich selbst vom Login aus** — du bekommst dann 403
statt der Anmeldeseite. Im Zweifel vorab beim Rechenzentrum erfragen.

---

## 4. Zertifikat holen

Hier gibt es ein Henne-Ei-Problem: nginx startet nicht, solange
`ssl_certificate` auf eine nicht existierende Datei zeigt — certbot braucht aber
ein laufendes nginx für die ACME-Challenge.

Einmalig im Standalone-Modus lösen:

```bash
docker compose run --rm --service-ports certbot certonly \
  --standalone \
  -d dashboard.hs-mainz.de \
  --agree-tos -m ozan.yaman@hs-mainz.de
```

Danach übernimmt der certbot-Container die Erneuerung automatisch (Prüfung alle
12 Stunden).

---

## 5. Falls die Datenbank bereits Alt-Accounts enthält

**Nur relevant, wenn auf dem Server schon eine `local.db` mit der alten
`users`-Tabelle liegt.** Bei einem komplett frischen Server: überspringen.

Migration `0003` löscht die alte `users`-Tabelle **automatisch beim
Serverstart**. Wer vorher nicht übernommen wurde, ist danach weg.

```bash
docker compose build backend
docker compose run --rm backend node dist/src/scripts/migrate-legacy-users.js
```

Das Skript ist idempotent und meldet sich sauber ab, wenn keine alte Tabelle
existiert. Jeder übernommene Account bekommt eine Einladungsmail, weil Passwörter
nicht migrierbar sind — die alten Hashes sind bcrypt, Better Auth nutzt scrypt.

---

## 6. Starten

```bash
docker compose up -d --build
docker compose logs -f backend
```

Erwartete Ausgabe:

```
[migrate] Migrations angewendet aus /app/dist/drizzle
Server is running on http://localhost:3000
[BuildingX] Raum-Sensor-Mapping wird aufgebaut...
Scheduler gestartet — Mensa-Import täglich 15:00, BuildingX alle 10 Minuten
```

---

## 7. Ersten Admin anlegen

**Ohne diesen Schritt kommt niemand in die Anwendung.** Selbstregistrierung ist
deaktiviert und die Admin-Endpunkte verlangen eine bestehende Admin-Session.

```bash
docker compose exec -e ADMIN_PASSWORD='<starkes Passwort, min. 12 Zeichen>' backend \
  node dist/src/scripts/create-admin.js ozan.yaman@hs-mainz.de "Ozan Yaman"
```

Das Passwort kommt über die Umgebungsvariable, damit es nicht in der
Shell-Historie und nicht in der Prozessliste steht.

Ohne `ADMIN_PASSWORD` wird eines erzeugt und **einmalig ausgegeben** — dann steht
es allerdings im Container-Log.

Das Skript weigert sich, wenn bereits ein Admin existiert. Alle weiteren Accounts
entstehen über die Oberfläche unter `/admin`, damit Einladungsmail und
Rollenvergabe den normalen Weg nehmen.

---

## 8. Prüfen

1. `https://dashboard.hs-mainz.de` — Dashboard lädt (öffentlich)
2. `https://dashboard.hs-mainz.de/login` — **aus dem internen Netz**, sonst 403
3. Anmelden mit dem Admin-Account
4. `/admin` → Tab **Benutzer** → eine Kollegin einladen; das testet SMTP mit
5. Abmelden, `/admin` neu laden → muss auf `/login` weiterleiten

### Cookie kontrollieren

Entwicklertools → Application → Cookies. Das Session-Cookie muss `Secure` **und**
`HttpOnly` gesetzt haben. Fehlt `Secure`, steht `BETTER_AUTH_URL` noch auf
`http://`.

---

## Betrieb

### Logs

```bash
docker compose logs -f backend
docker compose logs -f nginx
```

### Datenbank sichern

```bash
docker compose exec backend sqlite3 /data/local.db ".backup /data/backup.db"
docker compose cp backend:/data/backup.db ./backup-$(date +%F).db
```

Ein regelmäßiges Backup ist wichtiger als eine Kopie des Codes — der Code liegt
in Git, die Daten nur hier.

### n8n

Erreichbar auf `127.0.0.1:5678`, also nur lokal auf dem Server. Zugriff per
SSH-Tunnel:

```bash
ssh -L 5678:127.0.0.1:5678 user@server
# dann im Browser: http://localhost:5678
```

### Aktualisieren

```bash
git pull
docker compose up -d --build
```

Migrationen laufen beim Start automatisch. Vorher ein Backup ziehen.

---

## Wenn etwas nicht geht

**403 statt Login-Seite** — du bist nicht im internen VLAN, oder das Subnetz in
`nginx/nginx.conf` stimmt nicht.

**`table sensor_data already exists`** — behoben seit Commit `94f0a98`
(Migration `0001` ist dort idempotent gemacht worden). Tritt es trotzdem auf,
wurde ein älterer Stand ausgecheckt.

**Einladungen kommen nicht an** — mit leerem `SMTP_HOST` bricht der Versand
absichtlich ab. In den Backend-Logs steht dann
`SMTP_HOST ist nicht gesetzt — Mailversand nicht konfiguriert.`

**Nach dem Login sofort wieder ausgeloggt** — Cookie hat kein `Secure`, obwohl
über HTTPS ausgeliefert. `BETTER_AUTH_URL` prüfen.

**Anmeldung schlägt mit 403 fehl, Passwort ist aber richtig** — die Origin steht
nicht in `CORS_ORIGINS`. Mit und ohne `www` prüfen.

**Daten nach einem Rebuild verschwunden** — `DB_FILE_NAME` zeigt nicht auf
`/data`. Siehe Schritt 2.

---

## Was nicht getestet ist

Migrationskette und der Bootstrap des ersten Admins sind gegen eine leere
SQLite-Datenbank geprüft. Das Docker-Setup, nginx und certbot sind **gelesen,
aber nie ausgeführt** worden — dieses Deployment lief noch nie scharf. Mit
Reibung ist am ehesten bei Schritt 4 (Zertifikat) zu rechnen.
