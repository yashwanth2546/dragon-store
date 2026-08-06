import { chromium } from 'playwright-core';

const EXECUTABLE = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://localhost:5173/';

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
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') errors.push(`[${msg.type()}] ${msg.text()}`);
});
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

const heroState = () => page.evaluate(() => window.__dragonHero || null);
const stageOpacity = () => page.locator('#hero [data-overlay="stage"]').evaluate((el) => parseFloat(el.dataset.opacity ?? '1'));
const brandOpacity = () => page.locator('#hero [data-overlay="brand"]').evaluate((el) => parseFloat(el.dataset.opacity ?? '1'));

async function scrollToFraction(fraction) {
  const heroTop = await page.locator('#hero').evaluate((el) => el.offsetTop);
  const scrub = await page.evaluate(() => {
    const hero = document.getElementById('hero');
    return hero.getBoundingClientRect().height - window.innerHeight;
  });
  await page.evaluate((target) => window.scrollTo(0, target), heroTop + Math.round(fraction * scrub));
  await page.waitForTimeout(450);
}

async function canvasHash() {
  const canvas = page.locator('#hero canvas').first();
  const shot = await canvas.screenshot({ type: 'png' });
  let hash = 0;
  for (let i = 0; i < shot.length; i += 7) hash = (hash * 31 + shot[i]) % 999999937;
  return hash;
}

// --- Load & intro skip ---
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1200);

// --- Initial paint not blocked: canvas + wordmark render before first batch completes ---
const canvasEarly = await page.locator('#hero canvas').count();
const brandEarly = await page.locator('#hero [data-overlay="brand"]').isVisible().catch(() => false);
log('Initial paint unblocked (canvas + wordmark visible pre-ready)', canvasEarly === 1 && brandEarly, `canvas=${canvasEarly} brand=${brandEarly}`);

// --- Batched preload: ready gates on first batch (40) ---
const ready = await page.waitForFunction(() => window.__dragonHero && window.__dragonHero.ready === true, null, { timeout: 60000 }).catch(() => null);
if (ready) {
  const s = await heroState();
  log('First batch (40) gates scrub', s.loadedFirst === 40, `loadedFirst=${s.loadedFirst} totalLoaded=${s.loaded}/${s.total}`);
}
log('Batched preload completes (ready)', !!ready);

// --- Loading bar shown only for first batch, hidden after ---
const barGone = await page.evaluate(() => {
  const label = Array.from(document.querySelectorAll('#hero span')).find((s) => s.textContent.includes('Loading dragon sequence'));
  return !label;
});
log('Progress bar dismissed after first batch', barGone);

// --- Background load continues toward 240 ---
await page.waitForFunction(() => window.__dragonHero && window.__dragonHero.loaded >= 239, null, { timeout: 60000 });
log('Remaining frames finish in background', (await heroState()).loaded >= 239, `loaded=${(await heroState()).loaded}`);

// --- Scrub: frames advance with scroll ---
const hashTop = await canvasHash();
await scrollToFraction(0.5);
const stateMid = await heroState();
const hashMid = await canvasHash();
log('Scroll-scrub draws frames', hashTop !== hashMid, `frame=${stateMid.frame}`);
log('Frame index tracks progress (~p*240)', stateMid.frame >= 95 && stateMid.frame <= 150, `frame=${stateMid.frame} at p=${stateMid.progress?.toFixed(2)}`);

// --- Wordmark: top-left, dims to ~45% by p=0.15, holds, never 0 ---
await scrollToFraction(0.03);
const wTop = await brandOpacity();
await scrollToFraction(0.2);
const wDim = await brandOpacity();
await scrollToFraction(0.5);
const wMid = await brandOpacity();
await scrollToFraction(0.85);
const wLate = await brandOpacity();
await scrollToFraction(1.0);
const wEnd = await brandOpacity();
const closeTo = (v, t) => Math.abs(v - t) < 0.08;
log('Wordmark bright at p≈0.03', wTop > 0.85, `opacity=${wTop}`);
log('Wordmark dimmed to ~45% by p≈0.2', closeTo(wDim, 0.45), `opacity=${wDim}`);
log('Wordmark holds dim mid-scroll', closeTo(wMid, 0.45), `opacity=${wMid}`);
log('Wordmark holds dim late-scroll', closeTo(wLate, 0.45), `opacity=${wLate}`);
log('Wordmark never fades to 0 at exit', wEnd > 0.35, `opacity=${wEnd}`);

// --- Exit crossfade: stage fades out by p=1.0 ---
const stageEnd = await stageOpacity();
const stateEnd = await heroState();
log('Final macro-close-up frame reached (p=1.0)', stateEnd.frame === 239, `frame=${stateEnd.frame}`);
log('Stage crossfades out at pin release', stageEnd < 0.05, `stageOpacity=${stageEnd}`);

// --- Pin releases into product showcase ---
await page.evaluate(() => window.scrollTo(0, document.getElementById('product-showcase').offsetTop));
await page.waitForTimeout(900);
const showcaseVisible = await page.locator('#product-showcase').isVisible().catch(() => false);
log('Pin releases cleanly into product showcase', showcaseVisible);

// --- Screenshots 1440 ---
await page.evaluate(() => window.scrollTo(0, document.getElementById('hero').offsetTop));
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/dragon-hero-1440.png' });
await scrollToFraction(0.55);
await page.screenshot({ path: '/tmp/dragon-hero-scrub-1440.png' });
await scrollToFraction(1.0);
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/dragon-hero-exit-1440.png' });

// --- Mobile fallback 390: video plays, canvas hidden (still mounted for cleanup safety), static wordmark ---
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(900);
const videoCount = await page.locator('#hero video').count();
const videoVisible = await page.locator('#hero video').isVisible().catch(() => false);
const canvasVisible = await page.locator('#hero canvas').isVisible().catch(() => true);
log('Mobile fallback uses mp4 (canvas hidden)', videoCount === 1 && videoVisible && !canvasVisible, `video=${videoCount} visible=${videoVisible} canvasVisible=${canvasVisible}`);
const wmPosBefore = await page.locator('#hero > div:not([data-overlay]) span:has-text("Level")').first().evaluate((el) => {
  const r = el.closest('div').getBoundingClientRect();
  const s = document.getElementById('hero').getBoundingClientRect();
  return `${Math.round(r.left - s.left)},${Math.round(r.top - s.top)}`;
}).catch(() => 'n/a');
const wmOpacityBefore = await page.locator('#hero > div:not([data-overlay]) span:has-text("Level")').first().evaluate((el) => getComputedStyle(el.closest('div')).opacity).catch(() => 'n/a');
await page.evaluate(() => window.scrollBy(0, 300));
await page.waitForTimeout(600);
const wmPosAfter = await page.locator('#hero > div:not([data-overlay]) span:has-text("Level")').first().evaluate((el) => {
  const r = el.closest('div').getBoundingClientRect();
  const s = document.getElementById('hero').getBoundingClientRect();
  return `${Math.round(r.left - s.left)},${Math.round(r.top - s.top)}`;
}).catch(() => 'n/a');
const wmOpacityAfter = await page.locator('#hero > div:not([data-overlay]) span:has-text("Level")').first().evaluate((el) => getComputedStyle(el.closest('div')).opacity).catch(() => 'n/a');
log('Mobile wordmark static top-left', wmPosBefore !== 'n/a' && wmPosBefore === wmPosAfter && wmOpacityBefore === '1' && wmOpacityAfter === '1', `${wmPosBefore} -> ${wmPosAfter} opacity ${wmOpacityBefore}->${wmOpacityAfter}`);
await page.screenshot({ path: '/tmp/dragon-hero-390.png' });

// --- Console errors ---
const realErrors = errors.filter((e) => e.startsWith('[error]') || e.startsWith('[pageerror]'));
log('No console errors', realErrors.length === 0, realErrors.length ? realErrors.slice(0, 5).join(' | ') : '');

console.log('\n=== SUMMARY ===');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}\t${r.name}`);

await browser.close();
process.exit(realErrors.length === 0 && results.every((r) => r.ok) ? 0 : 1);
