import cron from "node-cron";
import { runXmlImport } from "../jobs/xmlImport.js";

export function startScheduler() {

  cron.schedule("0 15 * * *", async () => {
    console.log("Täglicher Mensa-Import wird ausgeführt...");
    await runXmlImport();
  }, { timezone: "Europe/Berlin" });

  console.log("Scheduler gestartet — Import läuft täglich um 15:00 Uhr (Europe/Berlin)");
}
