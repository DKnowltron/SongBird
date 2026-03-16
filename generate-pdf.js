const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, 'docs/production-plan.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.pdf({
    path: path.resolve(__dirname, 'docs/Storyteller-Production-Plan.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  console.log('PDF generated: docs/Storyteller-Production-Plan.pdf');
})();
