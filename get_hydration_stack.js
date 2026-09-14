const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const logs = [];

  // Inject before page loads to catch early hydration errors
  await page.evaluateOnNewDocument(() => {
    const originalError = console.error;
    console.error = function(...args) {
      // Send to puppeteer
      window.logHydrationError(args.join(' '));
      originalError.apply(console, args);
    };
  });

  await page.exposeFunction('logHydrationError', (text) => {
    if (text.includes('Hydration') || text.includes('Expected server HTML')) {
      logs.push(text);
    }
  });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Hydration') || text.includes('Expected server HTML')) {
      logs.push(text);
    }
  });

  await page.goto('http://localhost:3000/');
  await new Promise(r => setTimeout(r, 4000));
  
  // If overlay exists, click it and get the stack
  try {
    const stack = await page.evaluate(() => {
      const portal = document.querySelector('nextjs-portal');
      if (portal && portal.shadowRoot) {
        return portal.shadowRoot.innerHTML;
      }
      return null;
    });
    if (stack) {
       fs.writeFileSync('d:/hemasaree/overlay_html.txt', stack);
    }
  } catch(e) {}

  fs.writeFileSync('d:/hemasaree/hydration_logs.txt', logs.join('\n\n---\n\n'));
  console.log("Done");
  await browser.close();
})();
