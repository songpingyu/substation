"""Build swatch.html (colour-meaning sheet) from the real snapshot DOM.
Every row / chip / histogram on the sheet is a clone of real snapshot markup; only the state classes differ.
"""
import copy
import os
import re
from bs4 import BeautifulSoup

SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 渲染工作目錄（見 setup_render_root.sh）；預設是 tools/ 上一層的 render/
RROOT = os.environ.get('STYLE_RENDER_ROOT') or os.path.join(SP, 'render')
SNAPDIR = os.path.join(RROOT, 'docs', 'pcap_to_json', 'shots', 'style_input_2026-11-09')
src = open(os.path.join(SNAPDIR, 'snapshot_main.html'), encoding='utf-8').read()
soup = BeautifulSoup(src, 'html.parser')
style = soup.find('style')

rows = {r.get('id'): r for r in soup.select('.vlist .body > .row')}
hdr = soup.select_one('.vlist .hdr')
hist_plot = soup.select_one('.hist-plot')
hist_legend = soup.select_one('.hist-legend')
fchip = soup.select_one('.fchip')
kchip = soup.select_one('.kchip.k-report')
segc = soup.select_one('.segc')

COLS = '64px 124px 118px 300px 56px'


def row(rid, classes, label=None):
    r = copy.copy(rows[rid])
    r['class'] = ['row'] + classes
    r['style'] = 'grid-template-columns:%s; height:var(--row-h); position:relative; transform:none;' % COLS
    # keep only the first five cells (#, 時間, kind, path, fc)
    for c in r.find_all('div', class_='cell')[5:]:
        c.decompose()
    html = str(r)
    if label:
        html = '<div class="sw-row"><span class="sw-lab">%s</span>%s</div>' % (label, html)
    return html


def kchip_of(kind):
    k = copy.copy(kchip)
    k['class'] = ['kchip', 'k-' + kind]
    k.string = kind
    return str(k)


sheet_css = """
html,body{height:auto;overflow:visible}
body{background:var(--bg);padding:14px 16px 16px;margin:0}
.sheet{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);gap:14px 18px;width:1408px}
.sec{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:10px 12px 12px;min-width:0}
.sec h2{margin:0 0 8px;font:700 13px/1.3 var(--sans);color:var(--text);display:flex;gap:10px;align-items:baseline}
.sec h2 small{font-weight:400;color:var(--muted);font-size:12px}
.chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.list{position:relative;border:1px solid var(--bsoft);background:var(--surface);font-size:var(--font-dense);overflow:hidden}
.list .row{position:relative !important;width:100% !important}
.sw-row{display:grid;grid-template-columns:96px minmax(0,1fr);align-items:center}
.sw-lab{font-size:12px;color:var(--muted);padding-right:8px;text-align:right;white-space:nowrap}
.lines{display:grid;grid-template-columns:repeat(3, minmax(0,1fr));gap:6px 14px}
.line{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);white-space:nowrap}
.line svg{width:96px;height:14px;flex:none}
.hp{height:var(--h-hist);}
.states{display:grid;grid-template-columns:auto 1fr;gap:8px 12px;align-items:center;font-size:12px}
.states > span{color:var(--muted);text-align:right;white-space:nowrap}
.cmpdemo{border-collapse:collapse;font-size:12.5px}
.cmpdemo td{padding:3px 10px;border-bottom:1px solid var(--bsoft)}
.note{font-size:11.5px;color:var(--muted);margin-top:6px}
"""

ser = ''.join(
    '<div class="line"><svg viewBox="0 0 120 14"><line x1="2" y1="7" x2="118" y2="7" stroke="var(--ser-%d)" stroke-width="2" %s/>'
    '<circle cx="60" cy="7" r="3" fill="var(--ser-%d)"/></svg>--ser-%d%s</div>' % (i, 'stroke-dasharray="7 4"' if i > 3 else '', i, i, ' 虛線' if i > 3 else '')
    for i in range(1, 7))

body = f"""
<div id="app"><div class="app" data-density="normal" style="height:auto;display:block">
<div class="sheet">
 <section class="sec">
  <h2>紀錄種類 <small>列左邊條 / kchip；列表裡另有符號＋文字</small></h2>
  <div class="chips" style="margin-bottom:8px">{''.join(kchip_of(k) for k in ['request','write','response','error','reject','report','report_header'])}</div>
  <div class="list">
   {row('r-36', ['k-request'], 'k-request')}
   {row('r-38', ['k-response'], 'k-response')}
   {row('r-39', ['k-error'], 'k-error')}
   {row('r-40', ['k-report'], 'k-report')}
   {row('r-42', ['k-report', 'ctl'], '.row.ctl')}
  </div>
  <div class="note">樣本是快照裡的真實列，只換了 kind / 狀態 class（看顏色用，不代表那一列真的是 request）。</div>
 </section>
 <section class="sec">
  <h2>直方圖三系列 <small>快照裡的同一張圖；灰 = 全部，彩色 = 篩選後</small></h2>
  {str(hist_plot).replace('class="hist-plot"', 'class="hist-plot hp"')}
  <div style="margin-top:4px">{str(hist_legend)}</div>
  <h2 style="margin-top:12px">時間序列 6 條線 <small>樣式示意（非資料）；4–6 用虛線</small></h2>
  <div class="lines">{ser}</div>
 </section>
 <section class="sec">
  <h2>著色規則 6 種列底色 <small>藍 / 綠 / 黃 / 紅 / 紫 / 強調色；# 欄的字是色弱用的文字標記</small></h2>
  <div class="list">
   {row('r-36', ['k-report', 'rule-info'], 'rule-info')}
   {row('r-38', ['k-report', 'rule-ok'], 'rule-ok')}
   {row('r-39', ['k-report', 'rule-warn'], 'rule-warn')}
   {row('r-40', ['k-report', 'rule-err'], 'rule-err')}
   {row('r-42', ['k-report', 'rule-vio'], 'rule-vio')}
   {row('r-43', ['k-report', 'rule-accent'], 'rule-accent')}
   {row('r-44', ['k-report'], '（無規則）')}
  </div>
 </section>
 <section class="sec">
  <h2>狀態與互動 <small>文字取自品質分頁與詳情</small></h2>
  <div class="states">
   <span>狀態</span><div class="chips"><span class="q-pill err">✗ Error 6</span><span class="q-pill warn">⚠ Warn 3</span><span class="q-pill info">ℹ Note 1,959</span><span class="ok">✓ ok</span><span class="pill ok" style="max-width:none"><i class="dot"></i><span class="t">解出 1,756 筆（2,862 ms）</span></span></div>
   <span>計數藥丸</span><div class="chips"><button class="cnt info" aria-pressed="false"><span class="cnt-k">exact</span><span class="cnt-n">2</span></button><button class="cnt warn" aria-pressed="false"><span class="cnt-k">unknown</span><span class="cnt-n">2</span></button><button class="cnt err" aria-pressed="false"><span class="cnt-k">.cnt.err</span></button><button class="cnt" aria-pressed="true"><span class="cnt-k">Write</span><span class="cnt-n">4</span></button></div>
   <span>篩選 chip</span><div class="chips"><div class="fchips" style="height:auto">{str(fchip)}</div></div>
   <span>選取 / 滑過</span><div class="list" style="width:100%">{row('r-64', ['k-report', 'sel'])}{row('r-65', ['k-report', 'hoverdemo'])}</div>
   <span>焦點框</span><div class="chips"><button class="tbtn focusdemo">匯出…</button>{str(segc)}</div>
   <span>比對：被改過</span><div><table class="cmpdemo cmp-detail"><tr class="changed"><td>tr.changed td</td><td class="mono">--changed</td></tr><tr><td>未改</td><td class="mono">--surface</td></tr></table></div>
  </div>
 </section>
</div></div></div>
"""

head = '<!doctype html><html lang="zh-Hant" data-theme="light"><head><meta charset="utf-8"><title>swatch</title>%s<style>%s</style></head>' % (str(style), sheet_css)
out = head + '<body>' + body + '</body></html>'
open(os.path.join(SNAPDIR, 'swatch.html'), 'w', encoding='utf-8').write(out)
print('ok', len(out))
