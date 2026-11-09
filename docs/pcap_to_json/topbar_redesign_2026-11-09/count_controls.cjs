// count visible controls in the top chrome / bottom toolbar of a rendered state
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const fs = require('fs'); const path = require('path');
(async () => {
  const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await chromium.launch(); const out = {};
  for (const job of cfg.jobs) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(pathToFileURL(path.join(cfg.root, cfg.snapshot)).href);
    for (const c of job.css) await p.addStyleTag({ url: pathToFileURL(path.join(cfg.root, c)).href });
    if (job.pre) await p.evaluate(job.pre);
    await p.evaluate(async () => { await document.fonts.ready; });
    out[job.id] = await p.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.display !== 'none' && cs.visibility !== 'hidden' && !e.closest('.sr-only'); };
      const bordered = (e) => { const cs = getComputedStyle(e); return parseFloat(cs.borderTopWidth) > 0 && cs.borderTopColor !== 'rgba(0, 0, 0, 0)' && cs.borderTopStyle !== 'none'; };
      const zone = (sel) => {
        const roots = [...document.querySelectorAll(sel)].filter(vis);
        const ctl = roots.flatMap((r) => [...r.querySelectorAll('button, input:not(.sr-only), .fbox, .counts, .qcount, .pill, .ststat, .fname, .segc')]).filter(vis)
          .filter((e) => !e.closest('.fbox') || e.classList.contains('fbox') ? true : false)
          .filter((e) => !e.closest('.segc') || e.classList.contains('segc'));
        return { controls: ctl.length, bordered: ctl.filter(bordered).length };
      };
      const top = zone('header.topbar, section.filterbar');
      const bottom = zone('footer.statusbar');
      const hdr = document.querySelector('.vlist .hdr').getBoundingClientRect().top;
      return { top, bottom, hdrY: hdr };
    });
    await p.close();
  }
  await b.close(); console.log(JSON.stringify(out));
})();
