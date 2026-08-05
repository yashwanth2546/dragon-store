import { chromium } from 'playwright-core';
const EXEC = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: EXEC, headless: true });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
const { mkdirSync, writeFileSync } = await import('fs');
mkdirSync('public/product', { recursive: true });
const result = await page.evaluate(async (targets) => {
  const out = {};
  for (const t of targets) {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = `/hero-sequence/frame_${String(t.frame).padStart(4,'0')}.webp`; });
    const c = document.createElement('canvas'); c.width = t.w; c.height = t.h;
    const x = c.getContext('2d'); x.drawImage(img, t.crop[0], t.crop[1], t.crop[2], t.crop[3], 0, 0, t.w, t.h);
    out[t.name] = c.toDataURL('image/png');
  }
  return out;
}, [
  { name: 'sig-mouse.png', frame: 128, w: 780, h: 430, crop: [480, 150, 780, 430] },
  { name: 'macro-wheel.png', frame: 127, w: 720, h: 430, crop: [560, 260, 720, 430] },
]);
for (const [k, v] of Object.entries(result)) {
  writeFileSync(`public/product/${k}`, Buffer.from(v.split(',')[1], 'base64'));
  console.log('exported', k, v.length/1024, 'KB base64');
}
await browser.close();
