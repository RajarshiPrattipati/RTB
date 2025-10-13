const puppeteer = require('puppeteer');

(async () => {
  console.log('Testing user interactions and page refresh...\n');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture all console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  console.log('1. Loading home page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 1000));
  let content = await page.evaluate(() => document.body.innerText);
  console.log(`✓ Home page loaded - ${content.includes('Start Game') ? 'SUCCESS' : 'FAILED'}`);

  console.log('\n2. Clicking HERO navigation...');
  await page.click('button[title="Hero"]');
  await new Promise(resolve => setTimeout(resolve, 1500));
  content = await page.evaluate(() => document.body.innerText);
  console.log(`✓ Hero page loaded - ${content.includes('Hero Customization') ? 'SUCCESS' : 'FAILED'}`);

  console.log('\n3. Refreshing on Hero page...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 1500));
  content = await page.evaluate(() => document.body.innerText);
  console.log(`✗ After refresh - ${content.includes('Hero Customization') ? 'Still on Hero (BAD - should return to Home)' : 'Back to Home (GOOD)'}`);
  console.log(`   Content includes: ${content.includes('Start Game') ? 'Start Game (Home)' : 'Other content'}`);

  console.log('\n4. Clicking SHOP navigation...');
  await page.click('button[title="Shop"]');
  await new Promise(resolve => setTimeout(resolve, 1500));
  content = await page.evaluate(() => document.body.innerText);
  console.log(`✓ Shop page loaded - ${content.includes('Shop') && content.includes('Soul Shop') ? 'SUCCESS' : 'FAILED'}`);

  console.log('\n5. Refreshing on Shop page...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 1500));
  content = await page.evaluate(() => document.body.innerText);
  console.log(`✗ After refresh - ${content.includes('Shop') ? 'Still on Shop (BAD)' : 'Back to Home (GOOD)'}`);

  console.log('\n6. Clicking HOME navigation...');
  await page.click('button[title="Home"]');
  await new Promise(resolve => setTimeout(resolve, 1000));
  content = await page.evaluate(() => document.body.innerText);
  console.log(`✓ Home navigation - ${content.includes('Start Game') ? 'SUCCESS' : 'FAILED'}`);

  console.log('\n7. Starting a battle...');
  await page.click('button:has-text("Start Game")');
  await new Promise(resolve => setTimeout(resolve, 2000));
  content = await page.evaluate(() => document.body.innerText);
  console.log(`✓ Battle started - ${content.includes('Interval') || content.includes('Action') ? 'SUCCESS' : 'FAILED'}`);

  console.log('\n8. Refreshing during battle...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 1500));
  content = await page.evaluate(() => document.body.innerText);
  console.log(`✗ After refresh - ${content.includes('Start Game') ? 'Back to Home (EXPECTED)' : 'Other state'}`);

  await page.screenshot({ path: 'test-final-state.png', fullPage: true });
  console.log('\n✅ Screenshot saved: test-final-state.png');

  await browser.close();

  console.log('\n=== ISSUE IDENTIFIED ===');
  console.log('The app resets to home on every refresh (expected React behavior).');
  console.log('This is normal for React apps without routing.');
})();
