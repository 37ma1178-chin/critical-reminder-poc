// Screenshot every view so a visual change can be checked before reporting it done.
//
//   npx http-server . -p 8080 -s &
//   NODE_PATH=$(npm root -g) node tools/screenshot.js out/
//
// Needs playwright (global install is fine) with its Chromium.
// Options via env:
//   BASE_URL      default http://127.0.0.1:8080
//   CHROME_PATH   explicit Chromium executable (e.g. a sandbox's /opt/pw-browsers/chromium)
//   THREE_LOCAL   path to a local node_modules/three/ to serve in place of the jsdelivr CDN
//                 (for sandboxes where the CDN is blocked; the pages themselves are unchanged)
//
// Writes <name>.png for each view plus topview.svg.txt (the generated SVG markup, so
// two runs can be diffed exactly) and errors.txt (page/console errors — must be empty).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || 'screenshots';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8080';
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-proxy-server'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  if (process.env.THREE_LOCAL) {
    await ctx.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', route => {
      const rel = route.request().url().split('three@0.128.0/')[1];
      route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(path.join(process.env.THREE_LOCAL, rel)) });
    });
  }
  const errors = [];
  const shoot = (p, name) => p.screenshot({ path: path.join(out, name + '.png') });

  const PARTIAL = '?layout=camper&modules=partition,kitchenette,fridge,toilet_cubicle,toilet_unit,tv,lounge_bench&tv=43';
  const captures = [
    { url: 'index.html', shots: async p => {
      await shoot(p, 'index-stock-cutaway');
      await p.click('[data-view="topdown"]'); await p.waitForTimeout(2500);
      await shoot(p, 'index-stock-roof-off');
      await p.click('[data-view="cutaway"]'); await p.waitForTimeout(2500);
      await p.click('[data-layout="lounge"]'); await p.waitForTimeout(300);
      await shoot(p, 'index-lounge-cutaway');
      await p.click('[data-layout="camper"]'); await p.waitForTimeout(300);
      await shoot(p, 'index-camper-cutaway');
      await p.selectOption('select[data-variant="tv"]', '43'); await p.waitForTimeout(300);
      await shoot(p, 'index-camper-tv43-cutaway');
      await p.click('[data-view="topdown"]'); await p.waitForTimeout(2500); // camera flies overhead (600 ms, but software GL is slow)
      await shoot(p, 'index-camper-roof-off');
      await p.click('[data-view="full"]'); await p.waitForTimeout(2500);
      await shoot(p, 'index-full-exterior');
    } },
    { url: 'index.html' + PARTIAL, shots: async p => {
      await p.click('[data-view="topdown"]'); await p.waitForTimeout(2500);
      await shoot(p, 'index-camper-partial-roof-off');
    } },
    { url: 'topview.html', shots: async p => {
      fs.writeFileSync(path.join(out, 'topview.svg.txt'), await p.evaluate(() => document.getElementById('drawing-frame').innerHTML));
      await shoot(p, 'topview');
    } },
    { url: 'topview.html?layout=camper', shots: async p => { await shoot(p, 'topview-camper'); } },
    { url: 'topview.html' + PARTIAL, shots: async p => { await shoot(p, 'topview-camper-partial'); } },
  ];
  for (const cap of captures) {
    const page = cap.url.split('?')[0];
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(`${cap.url}: ${e.message}`));
    p.on('console', m => {
      if (m.type() !== 'error' && m.type() !== 'warning') return;
      if (/GL Driver Message/.test(m.text())) return; // software-GL performance chatter, not a page problem
      errors.push(`${cap.url} console.${m.type()}: ${m.text()}`);
    });
    p.on('requestfailed', r => errors.push(`${cap.url} request failed: ${r.url()} ${(r.failure() || {}).errorText}`));
    const resp = await p.goto(`${BASE}/${cap.url}`, { waitUntil: 'networkidle' });
    if (!resp || resp.status() !== 200) errors.push(`${page}: HTTP ${resp && resp.status()}`);
    await p.waitForTimeout(1500);
    await cap.shots(p);
    await p.close();
  }
  fs.writeFileSync(path.join(out, 'errors.txt'), errors.join('\n'));
  console.log(errors.length ? 'PAGE ERRORS:\n' + errors.join('\n') : 'no page errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
