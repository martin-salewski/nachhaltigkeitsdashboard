import cron from "node-cron";
import { runXmlImport } from "../jobs/xmlImport.js";
import { fetchAndStoreSensorData } from "../jobs/buildingxFetcher.js";

export function startScheduler() {
  cron.schedule("0 15 * * *", async () => {
    console.log("Täglicher Mensa-Import wird ausgeführt...");
    await runXmlImport();
  }, { timezone: "Europe/Berlin" });

  cron.schedule("*/10 * * * *", async () => {
    console.log("[BuildingX] Sensordaten werden abgefragt...");
    await fetchAndStoreSensorData().catch(err => console.error('[BuildingX] Fehler:', err));
  });

  fetchAndStoreSensorData().catch(err => console.error('[BuildingX] Fehler beim Start:', err));

  console.log("Scheduler gestartet — Mensa-Import täglich 15:00, BuildingX alle 10 Minuten");
}
