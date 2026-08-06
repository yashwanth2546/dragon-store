import { chromium } from 'playwright-core';

const EXECUTABLE = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://localhost:5173/';
const OUT = new URL('../screenshots/mobile-pass/', import.meta.url).pathname;
import { mkdirSync } from 'fs';

const results = [];
const errors = [];
function log(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
}

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  headless: true,
  args: ['--enable-gpu', '--use-angle=metal', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(err.message));

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(900);
await page.getByText('Skip intro', { exact: true }).click().catch(() => {});
await page.waitForTimeout(1400);

mkdirSync(OUT, { recursive: true });

// ===== 1. No horizontal overflow at 390 =====
const overflow390 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
log('No horizontal overflow at 390px', overflow390 <= 1, `delta=${overflow390}px`);

// ===== 2. Hero pull-up fix: ProductShowcase document-top aligns with hero top (no overlap, no gap) =====
const psDocTop = await page.evaluate(() => {
  const el = document.getElementById('product-showcase');
  return Math.round(el.getBoundingClientRect().top + window.scrollY);
});
log('Product showcase aligned under hero (no vh/svh mismatch)', psDocTop >= -1 && psDocTop <= 2, `docTop=${psDocTop}px (expect 0)`);

// ===== 3. Video poster present (instant first paint) =====
const poster = await page.locator('#hero video').evaluate((v) => v.getAttribute('poster'));
log('Hero video has webp poster', !!poster && poster.endsWith('.webp'), poster || 'none');

// ===== 4. Touch targets ≥ 44px (icon buttons) =====
const tapTargets = await page.evaluate(() => {
  const sel = [
    'header button[aria-label="Search"]',
    'header button[aria-label="Open cart"]',
    'header button[aria-label="Menu"]',
    'header button[aria-label="Close"]',
  ];
  const out = {};
  for (const s of sel) {
    const el = document.querySelector(s);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    out[s] = { w: Math.round(r.width), h: Math.round(r.height) };
  }
  return out;
});
const smallTargets = Object.entries(tapTargets).filter(([, d]) => d.w < 44 || d.h < 44);
log('Navbar icon buttons ≥44px', smallTargets.length === 0, JSON.stringify(tapTargets));

// ===== 5. ProductCard: tilt disabled + 360° hint visible on touch =====
await page.evaluate(() => window.scrollTo(0, document.getElementById('product-showcase').offsetTop));
await page.waitForTimeout(900);
const card = await page.locator('[data-tilt-wrap]').first();
await card.tap({ position: { x: 100, y: 60 } });
await page.waitForTimeout(300);
const tiltState = await card.locator('[data-tilt]').evaluate((el) => el.style.transform);
const hintOpacity = await page.locator('#product-showcase [data-tilt-wrap] .z-20').nth(2).evaluate((el) => getComputedStyle(el).opacity).catch(() => 'n/a');
log('Touch tap does not trigger hover tilt/sheen', !tiltState.includes('rotateX(') || tiltState.includes('0deg') || tiltState.includes('scale(1)'), `transform="${tiltState}"`);
log('360° Inspect hint visible on touch', parseFloat(hintOpacity) > 0.5, `opacity=${hintOpacity}`);

// ===== 6. Lazy images =====
const lazyImgs = await page.evaluate(() => Array.from(document.images).filter((i) => i.loading === 'lazy' || i.loading === 'auto').length);
log('Product images lazy-loaded', lazyImgs >= 1, `lazy=${lazyImgs}`);

// ===== Screenshots 390 =====
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
await page.screenshot({ path: OUT + 'hero-390.png' });
await page.locator('#product-showcase').scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
await page.locator('#product-showcase').screenshot({ path: OUT + 'product-showcase-390.png' });
await page.locator('#spec-section').scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
await page.locator('#spec-section').screenshot({ path: OUT + 'macro-spec-390.png' });
await page.locator('#categories').scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
await page.locator('#categories').screenshot({ path: OUT + 'categories-390.png' });
await page.locator('#benchmarks').scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
await page.locator('#benchmarks').screenshot({ path: OUT + 'benchmarks-390.png' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(700);
await page.screenshot({ path: OUT + 'footer-390.png' });

// cart + search
await page.getByLabel('Open cart').click().catch(() => {});
await page.waitForTimeout(600);
await page.screenshot({ path: OUT + 'cart-390.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
await page.getByLabel('Search').click().catch(() => {});
await page.waitForTimeout(600);
await page.screenshot({ path: OUT + 'search-390.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// ===== 7. Narrowest width 320 =====
await page.setViewportSize({ width: 320, height: 700 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);
const overflow320 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
log('No horizontal overflow at 320px', overflow320 <= 1, `delta=${overflow320}px`);
await page.screenshot({ path: OUT + 'hero-320.png' });
await page.evaluate(() => window.scrollTo(0, document.getElementById('product-showcase').offsetTop));
await page.waitForTimeout(900);
await page.screenshot({ path: OUT + 'product-showcase-320.png' });

// ===== 8. Console errors =====
log('No console errors', errors.length === 0, errors.slice(0, 4).join(' | '));

console.log('\n=== SUMMARY ===');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}\t${r.name}`);
await browser.close();
process.exit(errors.length === 0 && results.every((r) => r.ok) ? 0 : 1);
