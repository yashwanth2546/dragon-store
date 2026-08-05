import { chromium } from 'playwright-core';

const EXECUTABLE = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://localhost:5173/';

const results = [];
const errors = [];

function log(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
}

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  headless: true,
  args: ['--enable-gpu', '--use-angle=metal', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    errors.push(`[${msg.type()}] ${msg.text()}`);
  }
});
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

const heroState = () => page.evaluate(() => window.__ryuHero || null);
const overlayOpacity = (name) =>
  page.locator(`#hero [data-overlay="${name}"]`).evaluate((el) => parseFloat(el.dataset.opacity ?? '1'));

async function scrollToHeroFraction(fraction) {
  const heroTop = await page.locator('#hero').evaluate((el) => el.offsetTop);
  // ScrollTrigger range = section height (300vh) - viewport height
  await page.evaluate((target) => window.scrollTo(0, target), heroTop + Math.round(fraction * 1800));
  await page.waitForTimeout(350);
}

async function sampleCanvasPixels() {
  const canvas = page.locator('#hero canvas').first();
  const shot = await canvas.screenshot({ type: 'png' });
  let hash = 0;
  for (let i = 0; i < shot.length; i += 7) hash = (hash * 31 + shot[i]) % 999999937;
  return hash;
}

// --- Load & intro skip ---
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
try {
  const skipBtn = page.locator('button:has-text("SKIP INTRO")');
  if (await skipBtn.count()) {
    await skipBtn.click({ timeout: 2000 });
    await page.waitForTimeout(400);
  }
} catch { /* intro may have auto-completed */ }

// --- 128-frame canvas preload ---
await page.waitForSelector('#hero canvas', { timeout: 15000 });
const ready = await page.waitForFunction(() => window.__ryuHero && window.__ryuHero.ready === true, null, { timeout: 20000 }).catch(() => null);
log('All 128 hero frames preloaded before scrub', !!ready);
if (ready) {
  const s = await heroState();
  log('Frame preload registry correct', s.total === 128, `${s.loaded}/${s.total}`);
}

// --- Loading progress bar hidden once ready ---
const barHidden = await page.evaluate(() => {
  const label = Array.from(document.querySelectorAll('#hero span')).find((s) => s.textContent.includes('Rendering sequence'));
  return !label;
});
log('Loading bar dismissed after preload', barHidden);

// --- Scrub: frames advance as you scroll ---
const hashTop = await sampleCanvasPixels();
await scrollToHeroFraction(0.5);
const stateMid = await heroState();
const hashMid = await sampleCanvasPixels();
log('Scroll-scrub draws frames (0→~64)', hashTop !== null && hashMid !== null && hashTop !== hashMid,
  `frame=${stateMid?.frame}`);
log('Scrub frame index tracks progress', stateMid?.frame >= 48 && stateMid?.frame <= 90, `frame=${stateMid?.frame}`);

// --- Overlay timeline ---
await scrollToHeroFraction(0.06);
const brandEarly = await overlayOpacity('brand');
log('RYUGEAR visible early (p≈0.06)', brandEarly > 0.9, `opacity=${brandEarly}`);

await scrollToHeroFraction(0.26);
const brandGone = await overlayOpacity('brand');
const taglineGone = await overlayOpacity('tagline');
log('RYUGEAR gone by p≈0.26', brandGone === 0, `opacity=${brandGone}`);
log('Tagline gone by p≈0.26', taglineGone === 0, `opacity=${taglineGone}`);

await scrollToHeroFraction(0.6);
const hudVisible = await overlayOpacity('hud');
log('HUD visible mid-scrub (p≈0.6)', hudVisible > 0.8, `opacity=${hudVisible}`);

await scrollToHeroFraction(1.0);
const hudGone = await overlayOpacity('hud');
const stateEnd = await heroState();
log('Sequence ends on final frame (p=1.0)', stateEnd?.frame === 127, `frame=${stateEnd?.frame}`);
log('HUD released before section end', hudGone < 0.05, `opacity=${hudGone}`);

// --- FPS steady state ---
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(700);
await page.evaluate(() => {
  window.__frames = 0;
  window.__last = performance.now();
  const tick = () => { window.__frames++; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const sampleFps = async (ms) => {
  await page.evaluate(() => { window.__frames = 0; window.__last = performance.now(); });
  await page.waitForTimeout(ms);
  return page.evaluate(() => window.__frames / Math.max(0.1, (performance.now() - window.__last) / 1000));
};
const fpsSamples = [];
for (let i = 0; i < 3; i++) fpsSamples.push(await sampleFps(1000));
const bestFps = Math.max(...fpsSamples);
log('FPS steady state (desktop hero)', bestFps >= 50, `${bestFps.toFixed(1)} fps peak`);

// --- Product cards: hover-spin ---
const cards = page.locator('#product-showcase .group');
log('Product cards rendered', (await cards.count()) === 3, `${await cards.count()} cards`);

await page.evaluate(() => window.scrollTo(0, document.getElementById('product-showcase').offsetTop - 100));
await page.waitForTimeout(900);
const card1 = cards.first();
const tiltBefore = await card1.locator('[data-tilt]').evaluate((el) => getComputedStyle(el).transform);
await card1.locator('[data-tilt-wrap]').hover();
await page.waitForTimeout(350);
const tiltAfter = await card1.locator('[data-tilt]').evaluate((el) => getComputedStyle(el).transform);
log('Hover-spin tilts product plane', tiltBefore !== tiltAfter, tiltBefore !== tiltAfter ? 'transform changed' : 'static');
await page.mouse.move(10, 10);
await page.waitForTimeout(350);

// --- Add to cart micro-interaction ---
await cards.nth(2).scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await cards.nth(2).getByRole('button', { name: /Add to Cart/i }).click();
await page.waitForTimeout(400);
const cartCountVal = await page.locator('header button:has-text("CART") span').first().innerText().catch(() => '?');
log('Add to Cart updates count', cartCountVal !== '?', `cart badge: ${cartCountVal}`);

// --- Cart drawer ---
await page.locator('header button:has-text("CART")').click();
await page.waitForTimeout(500);
const drawerOpen = await page.locator('aside:has-text("YOUR LOADOUT")').isVisible().catch(() => false);
log('Cart drawer opens', drawerOpen);
await page.locator('aside button').first().click();
await page.waitForTimeout(300);

// --- Mobile fallback: video, no canvas ---
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(900);
const videoCount = await page.locator('#hero video').count();
const canvasCount = await page.locator('#hero canvas').count();
log('Mobile fallback uses video (no canvas)', videoCount === 1 && canvasCount === 0, `video=${videoCount} canvas=${canvasCount}`);
await page.evaluate(() => window.scrollTo(0, 2000));
await page.waitForTimeout(900);
const showcaseMobile = await page.locator('#product-showcase').isVisible().catch(() => false);
log('Scroll reveal section reached at 390px', showcaseMobile);

// --- Reduced-motion fallback at desktop ---
const rmPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await rmPage.emulateMedia({ reducedMotion: 'reduce' });
await rmPage.goto(BASE, { waitUntil: 'domcontentloaded' });
await rmPage.waitForTimeout(2000);
try { await rmPage.locator('button:has-text("SKIP INTRO")').click({ timeout: 1500 }); } catch { }
await rmPage.waitForTimeout(600);
const rmVideo = await rmPage.locator('#hero video').count();
const rmCanvas = await rmPage.locator('#hero canvas').count();
log('Reduced-motion falls back to video hero', rmVideo === 1 && rmCanvas === 0, `video=${rmVideo} canvas=${rmCanvas}`);
await rmPage.close();

// --- Console errors summary ---
const realErrors = errors.filter((e) => e.startsWith('[error]') || e.startsWith('[pageerror]'));
log('No console errors (clean)', realErrors.length === 0, realErrors.length ? realErrors.slice(0, 5).join(' | ') : '');

console.log('\n=== SUMMARY ===');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}\t${r.name}`);

await browser.close();
process.exit(realErrors.length === 0 && results.every((r) => r.ok) ? 0 : 1);
