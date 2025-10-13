const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Collect all errors
  const errors = [];
  const warnings = [];
  const logs = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      errors.push(text);
    } else if (type === 'warning') {
      warnings.push(text);
    } else {
      logs.push(text);
    }
  });

  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });

  page.on('requestfailed', request => {
    errors.push(`FAILED REQUEST: ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('Navigating to http://localhost:3000...');

  try {
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
  } catch (e) {
    console.error('Navigation error:', e.message);
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check if React root is rendered
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return 'NO ROOT ELEMENT';
    if (!root.innerHTML || root.innerHTML.trim() === '') return 'ROOT IS EMPTY';
    return `ROOT HAS ${root.innerHTML.length} characters`;
  });

  console.log('\n=== ROOT STATUS ===');
  console.log(rootContent);

  console.log('\n=== ERRORS ===');
  if (errors.length === 0) {
    console.log('No errors');
  } else {
    errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }

  console.log('\n=== WARNINGS ===');
  if (warnings.length === 0) {
    console.log('No warnings');
  } else {
    warnings.forEach((warn, i) => console.log(`${i + 1}. ${warn}`));
  }

  console.log('\n=== IMPORTANT LOGS ===');
  logs.filter(log =>
    log.includes('error') ||
    log.includes('failed') ||
    log.includes('undefined') ||
    log.includes('null')
  ).forEach((log, i) => console.log(`${i + 1}. ${log}`));

  // Check React error boundaries
  const hasErrorBoundary = await page.evaluate(() => {
    return document.body.textContent.includes('Something went wrong') ||
           document.body.textContent.includes('Error') ||
           document.body.textContent.includes('failed');
  });

  console.log('\n=== ERROR BOUNDARY TRIGGERED ===');
  console.log(hasErrorBoundary ? 'YES' : 'NO');

  // Get actual visible text
  const visibleText = await page.evaluate(() => {
    return document.body.innerText.substring(0, 500);
  });

  console.log('\n=== VISIBLE TEXT (first 500 chars) ===');
  console.log(visibleText || '(empty)');

  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  console.log('\n✅ Screenshot saved as debug-screenshot.png');

  await browser.close();
})();
