import puppeteer from 'puppeteer';

export async function createDashboardPDF(data: any) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // ... HTML Content und PDF Generierung wie oben ...
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdfBuffer;
}