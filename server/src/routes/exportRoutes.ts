import { Hono } from 'hono';
import { createDashboardPDF } from '../jobs/pdfService.js';
import type { DashboardExportData } from '../shared/types.js';

// Wir erstellen eine Hono-Instanz als Router
const router = new Hono();

router.post('/export-pdf', async (c) => {
  try {
    // In Hono holt man den JSON-Body asynchron
    const data = await c.req.json<DashboardExportData>();

    // Validierung
    if (!data || !data.tableData || data.tableData.length === 0) {
      return c.json({ error: "Keine Daten vorhanden" }, 400);
    }

    // PDF generieren (dein Service bleibt gleich, er muss nur einen Buffer/Uint8Array liefern)
    const pdfBuffer = await createDashboardPDF(data);

    // In Hono senden wir die Datei mit c.body() zurück
    return c.body(pdfBuffer, 200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Export_${data.date.replace(/\s/g, '_')}.pdf"`,
    });

  } catch (error) {
    console.error("PDF Export Fehler:", error);
    return c.json({ error: "Interner Fehler beim PDF-Export" }, 500);
  }
});

export default router;