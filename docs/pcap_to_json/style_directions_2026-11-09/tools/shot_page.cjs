// node shot_page.cjs <html> <out.png> [selector] [dpr]
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
(async () => {
  const [html, out, sel = '.wrap', dpr = '1'] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2800, height: 900 }, deviceScaleFactor: +dpr });
  await p.goto(pathToFileURL(html).href);
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
  await (await p.$(sel)).screenshot({ path: out });
  await b.close();
})();
