const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    console.log(`[Browser ${type}]:`, text);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log('[Browser Error]:', error.message);
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  // Wait a bit for any async rendering
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get page content
  const html = await page.content();
  console.log('\n=== Page HTML Length ===');
  console.log(html.length, 'characters');

  // Check for root element
  const rootElement = await page.$('#root');
  console.log('\n=== Root Element Exists ===');
  console.log(!!rootElement);

  // Get root element content
  if (rootElement) {
    const rootHTML = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML : 'Root is empty';
    });
    console.log('\n=== Root Element Content (first 500 chars) ===');
    console.log(rootHTML.substring(0, 500));
  }

  // Check body background color
  const bodyStyle = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('\n=== Body Background Color ===');
  console.log(bodyStyle);

  // Take a screenshot
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  console.log('\n=== Screenshot saved to screenshot.png ===');

  // Get all console messages
  console.log('\n=== All Console Messages ===');
  consoleMessages.forEach(msg => {
    console.log(`[${msg.type}] ${msg.text}`);
  });

  await browser.close();
  console.log('\nBrowser closed.');
})();
