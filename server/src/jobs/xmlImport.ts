import { XMLParser } from "fast-xml-parser";
import { eq } from "drizzle-orm";
import { db } from '../drizzle/db.js'
import { mensaMenu } from "../drizzle/schema.js";

const XML_URL = "https://www.studierendenwerk-mainz.de/speiseplan/Speiseplan-HS.xml"; 

// "27.02.2026" → "2026-02-27"
function parseDate(raw: string): string {
  const [day, month, year] = raw.trim().split(".");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// "1.006,00" → 1006  |  "" → 0
function parseCo2(raw: string): number {
  if (!raw || raw.trim() === "") return 0;
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(cleaned));
}

// "   4.55" → 4.55
function parsePrice(raw: string): number {
  const parsed = parseFloat(raw?.trim() ?? "0");
  return isNaN(parsed) ? 0 : parsed;
}

// MENUEKENNZTEXT → 'vegan' | 'vegetarisch' | 'fleisch'
function parseCategory(kennz: string): string {
  const lower = (kennz ?? "").toLowerCase();
  if (lower.includes("vegan")) return "vegan";
  if (lower.includes("veggi")) return "vegetarisch";
  return "fleisch";
}

// Nur echte Hauptgerichte & Eintöpfe (kein TYP 700 = Backwaren-Lieferant etc.)
const RELEVANT_TYPES = new Set([102, 160, 161]);

export async function runXmlImport() {
  console.log(`[${new Date().toISOString()}] Mensa XML Import gestartet...`);

  try {
    // 1. XML herunterladen
    const response = await fetch(XML_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xmlText = await response.text();

    // 2. XML parsen
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    const parsed = parser.parse(xmlText);

    const rows = parsed?.DATAPACKET?.ROWDATA?.ROW ?? [];
    const data = Array.isArray(rows) ? rows : [rows];

    // 3. Irrelevante Zeilen rausfiltern und nach (date, name) deduplizieren
    // TYP 102 (Eintopf) erscheint für beide Standorte mit identischem Namen
    const seen = new Set<string>();
    const relevant = data.filter((row) => {
      if (!RELEVANT_TYPES.has(Number(row.TYP)) || !row.AUSGABETEXT?.trim()) return false;
      const key = `${row.DATUM}|${row.AUSGABETEXT.trim().replace(/\([^)]*\)/g, "").trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 4. Alle Einträge für die im XML vorhandenen Daten löschen
    const datesToDelete = [...new Set(relevant.map((row) => parseDate(row.DATUM)))];
    for (const date of datesToDelete) {
      await db.delete(mensaMenu).where(eq(mensaMenu.date, date));
    }
    console.log(`🗑️  Einträge für ${datesToDelete.length} Tage gelöscht: ${datesToDelete.join(", ")}`);

    // 5. Neue Einträge einfügen
    for (const row of relevant) {
      await db.insert(mensaMenu).values({
        date: parseDate(row.DATUM),
        name: row.AUSGABETEXT.trim().replace(/\([^)]*\)/g, "").trim(),
        category: parseCategory(row.MENUEKENNZTEXT),
        allergens: row.ZSNUMMERN?.trim() || null,
        priceStudent: parsePrice(row.STUDIERENDE),
        priceStaff: parsePrice(row.BEDIENSTETE),
        co2Grams: parseCo2(row.CO2WERT),
      });
    }

    console.log(`✅ ${relevant.length} Gerichte erfolgreich importiert`);
  } catch (err) {
    console.error("❌ Import fehlgeschlagen:", err);
    throw err;
  }
}
