import { chromium } from 'playwright-core';
const EXECUTABLE = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true, args: ['--enable-gpu', '--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
try { await page.locator('button:has-text("SKIP INTRO")').click({ timeout: 1500 }); } catch {}
await page.waitForTimeout(1500);

// Hero — top (wordmark over frame 001)
await page.screenshot({ path: '/tmp/ryu-hero-1440.png' });

// Hero — mid scrub (product rotating)
await page.evaluate(() => window.scrollTo(0, document.getElementById('hero').offsetTop + 900));
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/ryu-hero-scrub-1440.png' });

// Product showcase
await page.locator('#product-showcase').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/ryu-showcase-1440.png' });

// Macro / manifesto
await page.locator('#spec-section').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/ryu-spec-1440.png' });

// Benchmarks
await page.locator('#benchmark-section').scrollIntoViewIfNeeded().catch(async () => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7));
});
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/ryu-bench-1440.png' });

// Mobile hero (video fallback)
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/ryu-hero-390.png' });

// Mobile showcase
await page.locator('#product-showcase').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/ryu-showcase-390.png' });

await browser.close();
console.log('done');
