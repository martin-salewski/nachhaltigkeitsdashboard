import puppeteer from 'puppeteer';

export const generateDashboardPDF = async (data: any) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // HTML Template mit Tailwind via CDN
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print { .page-break { page-break-after: always; } }
        </style>
      </head>
      <body class="bg-white p-10">
        <h1 class="text-3xl font-bold text-blue-600">Dashboard Export</h1>
        <p class="text-gray-500 mb-8">Erstellt am: ${new Date().toLocaleDateString()}</p>
        
        <div class="grid grid-cols-2 gap-4">
          ${data.metrics.map((m: any) => `
            <div class="border p-4 rounded-lg shadow-sm">
              <div class="text-sm text-gray-500">${m.label}</div>
              <div class="text-2xl font-bold">${m.value}</div>
            </div>
          `).join('')}
        </div>
        
        <table class="w-full mt-10 border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2 text-left">Projekt</th>
              <th class="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.projects.map((p: any) => `
              <tr>
                <td class="border p-2">${p.name}</td>
                <td class="border p-2">${p.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true, // Wichtig für Tailwind-Hintergrundfarben!
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  });

  await browser.close();
  return pdfBuffer;
};