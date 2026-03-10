import cron from "node-cron";
import { runXmlImport } from "../jobs/xmlImport.js";

export function startScheduler() {
  // Täglich um 06:00 Uhr (passt gut für Mittagsmenü)
  // Format: "Minute Stunde Tag Monat Wochentag"
  cron.schedule("0 6 * * *", async () => {
    console.log("⏰ Täglicher Mensa-Import wird ausgeführt...");
    await runXmlImport();
  });

  console.log("⏰ Scheduler gestartet — Import läuft täglich um 06:00 Uhr");
}
