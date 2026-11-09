// node render_swatch.cjs jobs.json  — jobs: [{id, css:[...], theme, out}]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
(async () => {
  const browser = await chromium.launch();
  const res = {};
  for (const job of cfg.jobs) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: job.dpr || 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('requestfailed', (r) => errors.push('requestfailed ' + r.url()));
    await page.goto(pathToFileURL(path.join(cfg.root, cfg.page)).href);
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), job.theme);
    for (const c of job.css) await page.addStyleTag({ url: pathToFileURL(path.join(cfg.root, c)).href });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(120);
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.hover('.row.hoverdemo');
    await page.evaluate(() => document.querySelector('.focusdemo').focus({ focusVisible: true }));
    const fv = await page.evaluate(() => document.querySelector('.focusdemo').matches(':focus-visible'));
    const el = await page.$('.sheet');
    await el.screenshot({ path: path.join(cfg.root, job.out) });
    res[job.id] = { errors, focusVisible: fv };
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(res));
})();
