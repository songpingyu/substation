// Render the static snapshot with optional direction CSS, collect layout + contrast metrics.
// usage: node render.js jobs.json
// jobs.json: { root, snapshot, jobs: [{ id, css: [relpath...], theme, w, h, out, metrics }] }
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const root = cfg.root;

async function fixRows(page) {
  return page.evaluate(() => {
    const vlist = document.querySelector('.vlist');
    const body = vlist.querySelector('.body');
    const rows = [...body.querySelectorAll(':scope > .row')];
    const ty = (r) => {
      const m = /translateY\((-?[\d.]+)px\)/.exec(r.getAttribute('style') || '');
      return m ? parseFloat(m[1]) : 0;
    };
    if (!rows.every((r) => r.dataset.ty0)) rows.forEach((r) => (r.dataset.ty0 = String(ty(r))));
    rows.sort((a, b) => parseFloat(a.dataset.ty0) - parseFloat(b.dataset.ty0));
    const R = parseFloat(getComputedStyle(vlist).getPropertyValue('--row-h')) || 32;
    const hdr = vlist.querySelector('.hdr');
    const visibleH = vlist.clientHeight - hdr.offsetHeight;
    const nFit = Math.floor(visibleH / R);
    const iSel = rows.findIndex((r) => r.id === 'r-64');
    const iTop = rows.findIndex((r) => parseFloat(r.dataset.ty0) === 0);
    let first = iTop;
    if (iSel - first + 1 > nFit) first = iSel - nFit + 1;
    // never leave blank space at the bottom when there are real rows above
    const avail = rows.length - first;
    if (avail < nFit + 1) first = Math.max(0, rows.length - (nFit + 1));
    rows.forEach((r, i) => {
      r.style.height = R + 'px';
      r.style.transform = `translateY(${(i - first) * R}px)`;
    });
    body.style.height = 1656 * R + 'px';
    const shown = rows.filter((r, i) => i >= first && (i - first) * R < visibleH).map((r) => +r.dataset.row);
    return { R, nFit, first: rows[first] && +rows[first].dataset.row, shownFrom: shown[0], shownTo: shown[shown.length - 1], total: rows.length };
  });
}

async function metrics(page) {
  return page.evaluate(() => {
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 };
    };
    const out = { vw: innerWidth, vh: innerHeight, boxes: {}, overflow: {}, truncated: [] };
    for (const s of ['.topbar', '.filterbar', '.overview', '.workspace', '.treepane', '.listwrap', '.detail', '.statusbar', '.vlist .hdr', '.vlist .row.sel', '.tree .tnode', '.detail-head']) {
      out.boxes[s] = rect(document.querySelector(s));
    }
    // overflow: bars must not clip or wrap at this width
    for (const s of ['.topbar', '.filterbar', '.statusbar', '.overview .ovcounts', '.detail-head', '.hist-legend', '.hh', '.tree-head']) {
      const el = document.querySelector(s);
      if (!el) continue;
      const br = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const padR = parseFloat(cs.paddingRight) || 0;
      const kids = [...el.children].filter((k) => getComputedStyle(k).display !== 'none' && !k.classList.contains('sr-only'));
      const clipped = kids
        .filter((k) => {
          const r = k.getBoundingClientRect();
          return r.width > 0 && (r.right > br.right - padR + 0.5 || r.bottom > br.bottom + 0.5 || r.top < br.top - 0.5);
        })
        .map((k) => (k.className || k.tagName) + ':' + (k.textContent || '').trim().slice(0, 24));
      const tops = kids.map((k) => k.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
      out.overflow[s] = {
        scrollOver: el.scrollWidth - el.clientWidth,
        clipped,
        lines: new Set(tops.map((r) => Math.round(r.top + r.height / 2))).size > 0 ? Math.max(...tops.map((r) => r.bottom)) - Math.min(...tops.map((r) => r.top)) <= br.height + 0.5 : true,
      };
    }
    // ellipsis-truncated texts in the chrome
    for (const el of document.querySelectorAll('.topbar *, .filterbar *, .statusbar *, .detail-head *, .crow *, .hist-legend *, .hh *')) {
      const cs = getComputedStyle(el);
      if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) out.truncated.push((el.className || el.tagName) + ': ' + el.textContent.trim().slice(0, 40));
    }
    const R = getComputedStyle(document.querySelector('.vlist')).getPropertyValue('--row-h');
    out.rowH = R.trim();
    out.fontUi = getComputedStyle(document.body).fontSize;
    out.fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight}`);
    out.fonts = [...new Set(out.fonts)];
    return out;
  });
}

// --- DOM contrast audit -------------------------------------------------
async function contrastAudit(page) {
  return page.evaluate(() => {
    function parse(c) {
      if (!c) return null;
      c = c.trim();
      let m = /^rgba?\(([^)]+)\)$/.exec(c);
      if (m) {
        const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return [p[0] / 255, p[1] / 255, p[2] / 255, p.length > 3 ? p[3] : 1];
      }
      m = /^color\(srgb ([^)]+)\)$/.exec(c);
      if (m) {
        const p = m[1].split(/[ /]+/).filter(Boolean).map(Number);
        return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
      }
      if (c === 'transparent') return [0, 0, 0, 0];
      return null;
    }
    const over = (fg, bg) => {
      const a = fg[3];
      return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
    };
    const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const L = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const ratio = (a, b) => {
      const la = L(a), lb = L(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };
    function effBg(el) {
      const layers = [];
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const cs = getComputedStyle(e);
        const bg = parse(cs.backgroundColor);
        if (bg && bg[3] > 0) {
          layers.push(bg);
          if (bg[3] >= 1) break;
        }
      }
      let c = [1, 1, 1, 1];
      if (!layers.length || layers[layers.length - 1][3] < 1) c = parse(getComputedStyle(document.body).backgroundColor) || c;
      for (let i = layers.length - 1; i >= 0; i--) c = over(layers[i], c);
      return c;
    }
    const res = [];
    const seen = new Set();
    const walker = document.createTreeWalker(document.querySelector('#app'), NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      if (el.closest('.sr-only')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden') continue;
      // hidden by a clipped ancestor (virtual rows above the list / below the fold)
      const vl = el.closest('.vlist');
      if (vl) {
        const vr = vl.getBoundingClientRect();
        if (r.bottom <= vr.top + 1 || r.top >= vr.bottom - 1) continue;
        const hd = vl.querySelector('.hdr').getBoundingClientRect();
        if (!el.closest('.hdr') && r.bottom <= hd.bottom + 1) continue;
      }
      let disabled = !!el.closest('[disabled],[aria-disabled=true]');
      let op = 1;
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
      const bg = effBg(el);
      let fg = parse(cs.color);
      if (!fg) continue;
      fg = [fg[0], fg[1], fg[2], fg[3] * op];
      const fgc = over(fg, bg);
      const cr = ratio(fgc, bg);
      const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10);
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const sel = (() => {
        const parts = [];
        for (let e = el; e && e.id !== 'app' && parts.length < 3; e = e.parentElement) parts.unshift(e.tagName.toLowerCase() + (e.classList.length ? '.' + [...e.classList].join('.') : ''));
        return parts.join(' > ');
      })();
      res.push({ sel, text: n.textContent.trim().slice(0, 30), cr: Math.round(cr * 100) / 100, large, disabled, placeholder: !!el.closest('.cm-placeholder'), size });
    }
    return res;
  });
}

(async () => {
  const browser = await chromium.launch();
  const summary = {};
  for (const job of cfg.jobs) {
    const ctx = await browser.newContext({ viewport: { width: job.w || 1440, height: job.h || 900 }, deviceScaleFactor: job.dpr || 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('requestfailed', (r) => errors.push('requestfailed ' + r.url()));
    page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
    await page.goto(pathToFileURL(path.join(root, job.snapshot || cfg.snapshot)).href);
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), job.theme || 'light');
    for (const c of job.css || []) await page.addStyleTag({ url: pathToFileURL(path.join(root, c)).href });
    if (job.density) await page.evaluate((d) => document.querySelector('.app').setAttribute('data-density', d), job.density);
    if (job.pre) await page.evaluate(job.pre);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(150);
    await page.evaluate(async () => { await document.fonts.ready; });
    const rows = await fixRows(page);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.evaluate(async () => { await document.fonts.ready; });
    if (job.post) { await page.evaluate(job.post); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); }
    const m = job.metrics === false ? null : await metrics(page);
    const audit = job.audit ? await contrastAudit(page) : null;
    if (job.out) {
      fs.mkdirSync(path.dirname(path.join(root, job.out)), { recursive: true });
      await page.screenshot({ path: path.join(root, job.out) });
    }
    summary[job.id] = { rows, metrics: m, errors, audit };
    await ctx.close();
    process.stderr.write(`done ${job.id}\n`);
  }
  await browser.close();
  fs.writeFileSync(cfg.summary || path.join(root, 'out', 'summary.json'), JSON.stringify(summary, null, 1));
})();
