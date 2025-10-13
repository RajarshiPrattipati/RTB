const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Taking screenshot of HOME screen...');
  await page.screenshot({ path: 'screenshot-home.png', fullPage: true });

  console.log('Clicking HERO button...');
  await page.click('button[title="Hero"]');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Taking screenshot of HERO screen...');
  await page.screenshot({ path: 'screenshot-hero.png', fullPage: true });

  console.log('Clicking SHOP button...');
  await page.click('button[title="Shop"]');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Taking screenshot of SHOP screen...');
  await page.screenshot({ path: 'screenshot-shop.png', fullPage: true });

  console.log('Clicking HOME button...');
  await page.click('button[title="Home"]');
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Taking final screenshot to verify HOME navigation...');
  await page.screenshot({ path: 'screenshot-home-return.png', fullPage: true });

  await browser.close();
  console.log('\n✅ All screenshots saved!');
  console.log('- screenshot-home.png');
  console.log('- screenshot-hero.png');
  console.log('- screenshot-shop.png');
  console.log('- screenshot-home-return.png');
})();
