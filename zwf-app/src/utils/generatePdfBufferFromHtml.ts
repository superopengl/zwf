import * as puppeteer from 'puppeteer';

export async function generatePdfBufferFromHtml(html) {
  const browser = await puppeteer.launch({
    // executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: 'domcontentloaded'
  });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    }
  });
  await browser.close();
  return pdfBuffer;
}
