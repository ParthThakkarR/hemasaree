const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning' || msg.text().includes('Hydration')) {
      console.log(`[${msg.type()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.toString()}`);
  });

  await page.goto('http://localhost:3000/');
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
