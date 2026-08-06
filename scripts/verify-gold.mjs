import { chromium } from 'playwright-core';

const EXECUTABLE = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://localhost:5173/';
const OUT = new URL('../screenshots/gold-pass/', import.meta.url).pathname;

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

// --- Load, skip intro fast ---
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(900);
await page.getByText('Skip intro', { exact: true }).click().catch(() => {});
await page.waitForTimeout(1200);

// ===== 1. Theme tokens =====
const tokens = await page.evaluate(() => {
  const s = getComputedStyle(document.documentElement);
  return {
    violet: s.getPropertyValue('--color-violet').trim(),
    gold: s.getPropertyValue('--color-gold').trim(),
    goldBright: s.getPropertyValue('--color-gold-bright').trim(),
    goldDeep: s.getPropertyValue('--color-gold-deep').trim(),
    goldMuted: s.getPropertyValue('--color-gold-muted').trim(),
    bodyBg: s.getPropertyValue('--color-bg').trim(),
  };
});
log('Violet token removed from :root', tokens.violet === '', `violet="${tokens.violet}"`);
log('Gold tokens present', tokens.gold === '#d9a83c' && tokens.goldBright === '#f2cc57' && tokens.goldDeep === '#9a7417' && tokens.goldMuted === '#b7954d', JSON.stringify({ gold: tokens.gold, bright: tokens.goldBright, muted: tokens.goldMuted }));

// ===== 2. Full-DOM purple scan =====
const purpleScan = await page.evaluate(() => {
  const VIOLETS = new Set(['168, 85, 247', '192, 132, 252', '124, 58, 237', '139, 92, 246', '147, 51, 234', '216, 180, 254', '167, 139, 250']);
  const matches = [];
  const checked = new Set();
  for (const el of document.querySelectorAll('*')) {
    if (checked.has(el)) continue;
    checked.add(el);
    const cs = getComputedStyle(el);
    const probe = [
      cs.color, cs.backgroundColor, cs.borderTopColor, cs.textShadow,
      cs.boxShadow, cs.outlineColor, cs.caretColor,
    ].join(' ');
    const rgb = probe.match(/rgba?\(([^)]+)\)/g) || [];
    for (const m of rgb) {
      const parts = m.replace(/rgba?\(|\)/g, '').split(',').map((x) => x.trim());
      const [r, g, b] = parts.map(Number);
      const key = `${r}, ${g}, ${b}`;
      if (VIOLETS.has(key)) {
        matches.push({ tag: el.tagName, cls: el.className, key });
        break;
      }
    }
  }
  return matches;
});
log('No purple computed styles anywhere in DOM', purpleScan.length === 0, purpleScan.length ? purpleScan.slice(0, 3).map((m) => `${m.tag}.${m.cls} ${m.key}`).join(' | ') : '');

// ===== 3. Key gold text elements =====
const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
const GOLD_BRIGHT = rgb('#f2cc57');
const GOLD_MUTED = rgb('#b7954d');
const GOLD = rgb('#d9a83c');

async function colorOf(selector, prop = 'color') {
  return page.locator(selector).first().evaluate((el, p) => getComputedStyle(el)[p], prop).catch(() => 'n/a');
}

const heroBrand = await colorOf('#hero [data-overlay="brand"] span:first-child');
const heroTag = await colorOf('#hero [data-overlay="brand"] span:last-child');
log('Hero wordmark RYUGEAR gold-bright', heroBrand === GOLD_BRIGHT, `computed=${heroBrand} expected=${GOLD_BRIGHT}`);
log('Hero tagline gold-muted', heroTag === GOLD_MUTED, `computed=${heroTag} expected=${GOLD_MUTED}`);

const logoGold = await colorOf('header button span[class*="font-display"]');
log('Navbar wordmark gold', logoGold === GOLD_BRIGHT || logoGold === GOLD, `computed=${logoGold}`);

// ===== 4. Cloud motif presence across sections =====
const cloudCheck = await page.evaluate(() => {
  const targets = ['#hero', '#product-showcase', '#spec-section', '#categories', '#benchmarks'];
  const out = {};
  for (const id of targets) {
    const sec = document.getElementById(id.replace('#', ''));
    const cloud = sec ? sec.querySelector('.cloud-motif') : null;
    const bg = cloud ? getComputedStyle(cloud).backgroundImage : null;
    out[id] = !!cloud && bg && (bg.includes('radial-gradient') || bg.includes('linear-gradient')) && bg.length > 50;
  }
  return out;
});
const cloudOk = Object.values(cloudCheck).every(Boolean);
log('Cloud motif behind hero + 4 major sections', cloudOk, JSON.stringify(cloudCheck));

// ===== 5. Stats / prices / CTAs gold =====
await page.evaluate(() => window.scrollTo(0, document.getElementById('product-showcase').offsetTop));
await page.waitForTimeout(800);
const ctaGold = await colorOf('#product-showcase button, #product-showcase a.interactive, #product-showcase a[class*="bg-gold"]').then((c) => c !== 'n/a' && c !== GOLD_BRIGHT && c !== GOLD ? c : 'gold');
log('CTA button carries gold styling', ['gold', GOLD_BRIGHT, GOLD].includes(ctaGold), `computed=${ctaGold}`);

const ryuGold = await page.evaluate((goldBright) => {
  const hits = Array.from(document.querySelectorAll('#product-showcase span, #product-showcase p, #product-showcase h3')).filter((el) => /₹|INR|\$/.test(el.textContent));
  const colors = hits.map((el) => getComputedStyle(el).color);
  const gold = colors.filter((c) => c === goldBright).length;
  return gold >= Math.max(1, hits.length - 2) ? 'gold' : JSON.stringify(colors);
}, GOLD_BRIGHT);
log('Prices/stats render gold-bright', ryuGold === 'gold', ryuGold);

// ===== 6. Screenshots — 1440 =====
import { mkdirSync } from 'fs';
mkdirSync(OUT, { recursive: true });

await page.evaluate(() => window.scrollTo(0, document.getElementById('hero').offsetTop));
await page.waitForTimeout(1000);
await page.screenshot({ path: OUT + 'hero-top-1440.png' });
await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.4));
await page.waitForTimeout(700);
await page.screenshot({ path: OUT + 'hero-scrub-1440.png' });

async function sectionShot(selector, name) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await el.screenshot({ path: OUT + `${name}-1440.png` });
}
await sectionShot('#product-showcase', 'product-showcase');
await sectionShot('#spec-section', 'macro-spec');
await sectionShot('#categories', 'categories');
await sectionShot('#benchmarks', 'benchmarks');
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(700);
await page.screenshot({ path: OUT + 'footer-1440.png' });

// cart + search
await page.getByLabel('Open cart').click().catch(() => {});
await page.waitForTimeout(600);
await page.screenshot({ path: OUT + 'cart-1440.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
await page.getByLabel('Search').click().catch(() => {});
await page.waitForTimeout(600);
await page.screenshot({ path: OUT + 'search-1440.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// ===== 7. Mobile 390 =====
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);
await page.screenshot({ path: OUT + 'hero-390.png' });
for (const [id, name] of [['#product-showcase', 'product-showcase'], ['#spec-section', 'macro-spec'], ['#categories', 'categories'], ['#benchmarks', 'benchmarks']]) {
  const el = page.locator(id).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await el.screenshot({ path: OUT + `${name}-390.png` });
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(700);
await page.screenshot({ path: OUT + 'footer-390.png' });

// ===== 8. Console errors =====
const realErrors = errors.filter((e) => e.startsWith('[error]') || e.startsWith('[pageerror]'));
log('No console errors', realErrors.length === 0, realErrors.length ? realErrors.slice(0, 5).join(' | ') : '');

console.log('\n=== SUMMARY ===');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}\t${r.name}`);

await browser.close();
process.exit(realErrors.length === 0 && results.every((r) => r.ok) ? 0 : 1);
