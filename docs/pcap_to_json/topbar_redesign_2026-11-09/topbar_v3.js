// 頂部重設計 v3：把快照裡「現有的」元素搬到新位置（不重畫、不編資料）。
// restructure(P)：P = 1 兩列 / 2 單列 / 3 單列＋直方圖帶＋左欄統計
// demo(P, open)：在版面定好後打開一個選單 / 面板做示意（open = src | app | qmenu | disp | pal | facets）
window.__tb3 = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const svg = (d, cls = 'ic sm') => `<svg class="${cls}" viewBox="0 0 16 16" aria-hidden="true">${d}</svg>`;
  const I = {
    chev: svg('<path d="M4 6l4 4 4-4"></path>', 'ic xs chev'),
    book: svg('<path d="M4.5 2.5h7v11l-3.5-2.6-3.5 2.6z"></path>'),
    search: svg('<circle cx="7" cy="7" r="4.2"></circle><path d="M10.2 10.2l3.3 3.3"></path>'),
    sliders: svg('<path d="M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6"></path><circle cx="10" cy="4.5" r="1.5"></circle><circle cx="6" cy="11.5" r="1.5"></circle>'),
    clock: svg('<circle cx="8" cy="8" r="5.5"></circle><path d="M8 5v3.2l2 1.3"></path>'),
    star: svg('<path d="M8 2.6l1.6 3.4 3.7.4-2.8 2.5.8 3.6L8 10.7 4.7 12.5l.8-3.6-2.8-2.5 3.7-.4z"></path>'),
    up: svg('<path d="M8 12V4M4.5 7.5L8 4l3.5 3.5"></path>'),
    keyb: svg('<rect x="1.8" y="4" width="12.4" height="8" rx="1.5"></rect><path d="M4.5 6.5h1M7.5 6.5h1M10.5 6.5h1M5 9.5h6"></path>'),
    moon: svg('<path d="M12.5 10A5 5 0 016 3.5 5 5 0 1012.5 10z"></path>'),
    tag: svg('<path d="M2.5 2.5h5l6 6-5 5-6-6z"></path><circle cx="5.5" cy="5.5" r="1"></circle>'),
    file: svg('<path d="M4 1.8h5.3l2.9 2.9v9.5H4z"></path><path d="M9.2 1.8v3h3"></path>'),
    conn: svg('<path d="M2.5 5.5h10M10 3l2.5 2.5L10 8M13.5 10.5h-10M6 8l-2.5 2.5L6 13"></path>'),
    dec: svg('<path d="M2.5 4.5h7M12.5 4.5h1M2.5 11.5h1M6.5 11.5h7"></path><circle cx="11" cy="4.5" r="1.5"></circle><circle cx="5" cy="11.5" r="1.5"></circle>'),
    cols: svg('<rect x="2" y="3" width="12" height="10" rx="1"></rect><path d="M6 3v10M10 3v10"></path>'),
    paint: svg('<path d="M3 11.5c0-1.5 1.2-2.5 2.5-2.5S8 10 8 11.5 6.8 14 5.5 14H3z"></path><path d="M7 9.5l6-6.5"></path>'),
    cam: svg('<rect x="2" y="4.5" width="12" height="8.5" rx="1.5"></rect><circle cx="8" cy="8.7" r="2.3"></circle><path d="M6 4.5l1-1.8h2l1 1.8"></path>'),
    exp: svg('<path d="M8 2.5v7.5M5 7l3 3 3-3M3 12.5h10"></path>'),
    rows: svg('<path d="M2.5 4h11M2.5 8h11M2.5 12h11"></path>'),
  };
  const S = {};

  function collect() {
    const top = $('header.topbar'), fbar = $('section.filterbar'), sb = $('footer.statusbar');
    const anchors = $$('.anchor', top);
    const decA = anchors.find((x) => x.querySelector('.decb'));
    const connA = anchors.find((x) => !x.querySelector('.decb'));
    const fname = $('.fname', top);
    const fbtn = (t) => $$(':scope > button.tbtn', fbar).find((x) => x.textContent.trim().startsWith(t));
    const sbtn = (t) => sb && $$(':scope > button.tbtn', sb).find((x) => x.textContent.trim().startsWith(t));
    const decKs = decA ? $$('.k', decA) : [];
    Object.assign(S, {
      top, fbar, sb, fwrap: $('.filterwrap'),
      fileInput: $('#file'),
      noFile: fname.classList.contains('none'),
      fileName: ($('.nm', fname) || fname).textContent.trim(),
      size: ((fname.getAttribute('title') || '').split('·')[1] || '').trim(),
      conn: connA ? connA.textContent.trim() : '',
      decV: decA ? $('.v', decA).textContent.trim() : '',
      decRest: decKs[1] ? decKs[1].textContent.trim().replace(/^·\s*/, '') : '',
      decOpen: decA ? $('button', decA).getAttribute('aria-expanded') === 'true' : false,
      stat: $('.pill .t', top).textContent.trim(),
      statErr: $('.pill', top).classList.contains('err'),
      help: $$('.tbtn.ib', top)[0], theme: $$('.tbtn.ib', top)[1], ver: $$('.tbtn.ib', top)[2],
      openBtn: $('.tbtn.out', top),
      fbox: $('.fbox', fbar), apply: fbtn('套用'), recent: fbtn('最近'), bm: fbtn('書籤'),
      counts: $('.counts', fbar), color: fbtn('著色'), exportB: fbtn('匯出'),
      sbSel: sb && $('.sb-sel', sb), jumpLabel: sb && $('label', sb), jump: sb && $('input.jump', sb), jumpKbd: sb && $(':scope > kbd', sb),
      segc: sb && $('.segc', sb), dense: sbtn('密集'), cols: sbtn('欄位'),
      tabs: ['品質', '時間序列', '比對'].map(sbtn), shot: sbtn('截圖'),
    });
    S.version = S.ver.getAttribute('title');
    S.themeNow = document.documentElement.getAttribute('data-theme') === 'dark' ? '深色' : '淺色';
    const bs = $$('b', S.counts);
    S.shown = bs[0] ? bs[0].textContent : ''; S.total = bs[1] ? bs[1].textContent : '';
    S.countsText = S.counts.textContent.trim();
  }

  function appButton(P) {
    const full = P !== 2;
    const b = el('button', 'qbtn appbtn' + (full ? '' : ' icononly'), `<span class="logo">MMS</span>${full ? '<span>pcap 分析</span>' : ''}${I.chev}`);
    b.title = 'MMS pcap 分析 · 選單：開啟檔案、快捷鍵、主題、版本'; b.setAttribute('aria-label', b.title); b.id = 'tb-app';
    return b;
  }
  function sourceChip(P) {
    const full = P !== 2;
    const parts = full ? [`<b>${S.decV}</b>`, S.decRest, S.conn].filter(Boolean) : [`<b>${S.decV}</b>`];
    const meta = parts.join(' · ');
    const b = el('button', 'qbtn srcchip', `${I.file}<span class="nm">${S.fileName}</span><span class="meta">${meta}</span>${full ? '' : '<span class="st"></span>'}${I.chev}`);
    b.title = [S.fileName + (S.size ? ' · ' + S.size : ''), '解碼 ' + [S.decV, S.decRest].filter(Boolean).join(' · '), S.conn, S.stat].filter(Boolean).join('\n'); b.id = 'tb-src';
    if (S.noFile) b.classList.add('nofile');
    if (S.decOpen) b.setAttribute('aria-expanded', 'true');
    return b;
  }
  function queryMenu() {
    const b = el('button', 'qbtn qmenu', `${I.book}篩選${I.chev}`); b.id = 'tb-q';
    b.title = '書籤與最近用過的條件（原「最近」「書籤」兩個按鈕）';
    return b;
  }
  function cmdButton(P) {
    const b = el('button', 'qbtn kbtn' + (P === 2 ? ' icononly' : ''), P === 2 ? `${I.search}` : `${I.search}指令<kbd>Ctrl K</kbd>`); b.id = 'tb-k';
    b.title = '指令面板：所有功能都能用打字找到（Ctrl+K）';
    return b;
  }
  function moveApplyIntoBox() {
    S.apply.className = 'qapply'; S.apply.innerHTML = '套用<kbd>Enter</kbd>';
    S.fbox.appendChild(S.apply);
  }
  function countsEl(short) {
    if (!S.total) return el('span', 'qcount', S.countsText);
    const c = el('span', 'qcount', short ? `<b>${S.shown}</b> / ${S.total} 列` : `顯示 <b>${S.shown}</b> / 全部 <b>${S.total}</b>`);
    c.title = `顯示 ${S.shown} / 全部 ${S.total}`; return c;
  }
  function bottomBar() {
    const sb = S.sb;
    if (!sb) { if (S.exportB) S.exportB.style.display = 'none'; return; }
    const tf = el('button', 'qbtn', `<span class="muted">時間</span>${$('button[aria-pressed=true]', S.segc).textContent}${I.chev}`); tf.id = 'tb-time';
    tf.title = '時間格式：本機 / UTC / 相對首筆 / 相對上一列';
    const disp = el('button', 'qbtn', `${I.sliders}顯示${I.chev}`); disp.id = 'tb-disp';
    disp.title = '顯示選項：時間格式、列高（密集）、欄位、著色規則、截圖模式';
    const ex = S.exportB; ex.className = 'qbtn ml'; ex.innerHTML = `${I.exp}匯出…`; ex.id = 'tb-exp';
    const sep = () => el('span', 'sep');
    sb.innerHTML = '';
    sb.append(S.sbSel, sep(), S.jumpLabel, S.jump, S.jumpKbd, sep(), tf, disp, el('span', 'spacer'), ex, sep(), ...S.tabs);
  }

  function restructure(P, opts) {
    opts = opts || {};
    collect();
    const root = document.documentElement.style;
    const top = S.top;
    top.innerHTML = '';
    moveApplyIntoBox();
    if (P === 1 || P === 3) {
      if (!opts.tokenHeights) { root.setProperty('--h-top', '40px'); root.setProperty('--h-filter', '42px'); }
      const st = el('span', 'ststat' + (S.statErr ? ' err' : ''), `<span class="st"></span>${S.stat.replace(/(\d[\d,]*) 筆/, '<b>$1</b> 筆')}`);
      top.append(appButton(1), el('span', 'vsep'), sourceChip(1), el('span', 'spacer'), st, cmdButton(1), S.fileInput);
      S.fbar.innerHTML = '';
      S.fbar.append(queryMenu(), S.fbox, countsEl(false));
    } else {
      if (!opts.tokenHeights) root.setProperty('--h-top', '48px');
      top.classList.add('cmdbar');
      top.append(appButton(P), sourceChip(P), el('span', 'vsep'), queryMenu(), S.fbox, countsEl(true), cmdButton(P), S.fileInput);
      S.fwrap.style.display = 'none';
    }
    bottomBar();
    if (P === 3) overviewStrip();
  }

  function overviewStrip() {
    const ov = $('section.overview');
    const hh = $('.hh', ov), plot = $('.hist-plot', ov), leg = $('.hist-legend', ov), ovc = $('.ovcounts', ov), ovt = $('.ovt', ov);
    // 警告摘要：把 class 是 warn 的計數加起來（unknown、型別不符）
    const warns = $$('.cnt.warn', ovc).map((b) => [b.querySelector('.cnt-k').textContent, +b.querySelector('.cnt-n').textContent.replace(/,/g, '')]);
    const nWarn = warns.reduce((a, [, n]) => a + n, 0);
    const qw = el('button', 'qwarn', `⚠ 警告 <b>${nWarn}</b>`); qw.title = warns.map(([k, n]) => `${k} ${n}`).join('、') + '（點了開左欄「統計」）';
    ov.classList.add('strip'); ov.innerHTML = ''; ov.append(hh, plot, leg, qw, ovt);
    // 左欄：模型樹 / 統計 兩個分頁；統計 = 原總覽的計數，改成直排清單
    S.ovc = ovc;
    const head = $('.tree-head');
    const titleSpan = head.querySelector(':scope > span');
    const sub = head.querySelector('.muted');
    const tabs = el('div', 'ptabs', '<button class="ptab on" id="tab-tree">模型樹</button><button class="ptab" id="tab-fac">統計</button>');
    head.replaceChild(tabs, titleSpan);
    if (sub) sub.remove();
    const fac = el('div', 'facets'); fac.id = 'facets'; fac.style.display = 'none';
    let group = null;
    const total = +S.total.replace(/,/g, '');
    for (const crow of $$('.crow', ovc)) {
      for (const n of crow.children) {
        if (n.classList.contains('clabel')) {
          group = el('div', 'fg', `<h5><span>${n.textContent}</span></h5>`); group.title = n.getAttribute('title') || ''; fac.append(group);
        } else if (n.classList.contains('cnt')) {
          const k = n.querySelector('.cnt-k').textContent, v = n.querySelector('.cnt-n').textContent;
          const pct = Math.min(100, Math.round((+v.replace(/,/g, '') / total) * 100));
          const cls = ['info', 'ok', 'vio', 'warn', 'err'].find((c) => n.classList.contains(c)) || '';
          const r = el('div', 'fr ' + cls, `<span class="k">${k}</span><span class="bar"><i style="width:${pct}%"></i></span><span class="n">${v}</span>`);
          r.title = n.getAttribute('title') || '';
          group.append(r);
        }
      }
    }
    $('.treepane').append(fac);
  }

  function place(pop, anchor, where) {
    const r = anchor.getBoundingClientRect();
    document.body.append(pop);
    const w = pop.offsetWidth, h = pop.offsetHeight;
    let x = where === 'right' ? r.right - w : r.left;
    x = Math.max(8, Math.min(x, innerWidth - w - 8));
    const y = where === 'up' ? r.top - h - 6 : r.bottom + 6;
    pop.style.left = x + 'px'; pop.style.top = y + 'px';
    anchor.setAttribute('aria-expanded', 'true');
  }

  function demo(P, open) {
    if (!open || open === 'none') return;
    if (open === 'facets') {
      $('#tab-tree').classList.remove('on'); $('#tab-fac').classList.add('on');
      $('.tree').style.display = 'none'; $('#facets').style.display = 'flex';
      return;
    }
    if (open === 'src') {
      const p = el('div', 'demo-pop', `
        <div class="hd">${I.file}<span class="nm">${S.fileName}</span><span class="muted" style="margin-left:auto">${S.size}</span></div>
        <div class="kv"><span class="l">解析</span><span class="v"><span class="ok">✓</span> ${S.stat}</span><span></span></div>
        <div class="kv"><span class="l">解碼</span><span class="v"><span class="mono">${S.decV}</span> · ${S.decRest}</span><span class="lnk">設定…</span></div>
        <div class="kv"><span class="l">連線</span><span class="v">${S.conn}（TCP association）</span><span class="lnk">連線表…</span></div>
        <div class="sep"></div>
        <div class="it">${I.file}<span class="grow">開啟其他檔案…</span><span class="k">也可以直接拖進視窗</span></div>`);
      p.style.width = '440px';
      place(p, $('#tb-src'));
    }
    if (open === 'app') {
      const p = el('div', 'demo-pop', `
        <div class="it hl">${I.file}<span class="grow">開啟檔案…</span><span class="k">.pcap .pcapng .cap .json</span></div>
        <div class="sep"></div>
        <div class="it">${I.keyb}<span class="grow">快捷鍵</span><kbd>?</kbd></div>
        <div class="it">${I.moon}<span class="grow">主題</span><span class="seg2"><span class="${S.themeNow === '淺色' ? 'on' : ''}">淺色</span><span class="${S.themeNow === '深色' ? 'on' : ''}">深色</span></span></div>
        <div class="sep"></div>
        <div class="it">${I.tag}<span class="grow">版本資訊</span><span class="k mono">${S.version}</span></div>`);
      p.style.width = '330px';
      place(p, $('#tb-app'));
    }
    if (open === 'qmenu') {
      const p = el('div', 'demo-pop', `
        <div class="ph">書籤</div>
        <div class="it hl">${I.star}<span class="grow">把目前的篩選存成書籤…</span></div>
        <div class="note">（存過的書籤列在這裡，跟現在的「書籤」選單同一份）</div>
        <div class="sep"></div>
        <div class="ph">最近（這個瀏覽器）</div>
        <div class="note">（最近用過的條件列在這裡，跟現在的「最近」選單同一份）</div>`);
      p.style.width = '360px';
      place(p, $('#tb-q'));
    }
    if (open === 'disp') {
      const segBtns = $$('button', S.segc).map((b) => `<span class="${b.getAttribute('aria-pressed') === 'true' ? 'on' : ''}">${b.textContent}</span>`).join('');
      const p = el('div', 'demo-pop', `
        <div class="ph">顯示</div>
        <div class="it">${I.clock}<span class="grow">時間</span><span class="seg2">${segBtns}</span></div>
        <div class="it">${I.rows}<span class="grow">列高</span><span class="seg2"><span class="on">標準 32</span><span>密集 24</span></span></div>
        <div class="sep"></div>
        <div class="it">${I.cols}<span class="grow">欄位…</span></div>
        <div class="it">${I.paint}<span class="grow">著色規則…</span><span class="k">篩選 → 顏色</span></div>
        <div class="sep"></div>
        <div class="it">${I.cam}<span class="grow">截圖模式：只留列表</span><kbd>S</kbd></div>`);
      p.style.width = '380px';
      place(p, $('#tb-disp'), 'up');
    }
    if (open === 'pal') {
      document.body.append(el('div', 'demo-back'));
      const row = (ic, t, k, hl) => `<div class="demo-pop-row it${hl ? ' hl' : ''}" style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:6px">${ic}<span style="flex:1">${t}</span>${k ? `<kbd>${k}</kbd>` : ''}</div>`;
      const p = el('div', 'demo-pal', `
        <div class="in">${I.search}<span>輸入指令或功能名稱…</span></div>
        <div class="list">
          <div class="grp">檔案與來源</div>
          ${row(I.file, '開啟檔案…', '', true)}${row(I.dec, '解碼設定…（port、範圍、DataSet）', '')}${row(I.conn, '連線表（TCP association）', '')}
          <div class="grp">篩選與匯出</div>
          ${row(I.star, '書籤：把目前的篩選存起來', '')}${row(I.clock, '最近用過的條件', '')}${row(I.exp, '匯出…', 'Ctrl+E')}${row(I.search, '跳到列號…', 'Ctrl+G')}
          <div class="grp">檢視</div>
          ${row(I.paint, '著色規則…', '')}${row(I.cols, '欄位…', '')}${row(I.rows, '列高：密集 / 標準', '')}${row(I.clock, '時間：本機 / UTC / 相對首筆 / 相對上一列', '')}${row(I.cam, '截圖模式', 'S')}
          <div class="grp">面板與說明</div>
          ${row(I.up, '品質 / 時間序列 / 比對分頁', '1 · 3 · 4')}${row(I.keyb, '快捷鍵', '?')}${row(I.moon, '主題：切換淺色 / 深色', '')}
        </div>`);
      document.body.append(p);
    }
  }
  return { restructure, demo };
})();
