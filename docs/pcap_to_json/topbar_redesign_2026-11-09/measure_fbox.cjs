const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const fs = require('fs'); const path = require('path');
(async () => {
  const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await chromium.launch(); const out = {};
  for (const job of cfg.jobs) for (const w of [1280, 1440, 1920]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(pathToFileURL(path.join(cfg.root, cfg.snapshot)).href);
    for (const c of job.css) await p.addStyleTag({ url: pathToFileURL(path.join(cfg.root, c)).href });
    if (job.pre) await p.evaluate(job.pre);
    await p.evaluate(async () => { await document.fonts.ready; });
    out[job.id + '@' + w] = await p.evaluate(() => Math.round(document.querySelector('.fbox').getBoundingClientRect().width));
    await p.close();
  }
  await b.close(); console.log(JSON.stringify(out));
})();
