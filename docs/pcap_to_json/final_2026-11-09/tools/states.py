"""Build round-2 state pages from snapshot_main.html (same CSS / DOM skeleton, real class names).
Text and numbers are transcribed from the reference screenshots 03–09; the bytes of #64's value come from the snapshot.
Writes <render root>/docs/pcap_to_json/shots/style_input_2026-11-09/state_<name>.html
"""
import copy
import html
import json
import os
import sys
HERE = os.path.dirname(os.path.abspath(__file__))
PCAP = os.path.dirname(os.path.dirname(HERE))
TOOLS = os.path.join(PCAP, 'style_directions_2026-11-09', 'tools')
sys.path.insert(0, TOOLS)
from bs4 import BeautifulSoup
from build_css import R

SNAPDIR = os.path.join(R, 'docs', 'pcap_to_json', 'shots', 'style_input_2026-11-09')
SRC = open(os.path.join(SNAPDIR, 'snapshot_main.html'), encoding='utf-8').read()
E = lambda s: html.escape(s, quote=False)


def fresh():
    return BeautifulSoup(SRC, 'html.parser')


def frag(markup):
    return BeautifulSoup(markup, 'html.parser')


def save(soup, name):
    out = os.path.join(SNAPDIR, 'state_%s.html' % name)
    open(out, 'w', encoding='utf-8').write(str(soup))
    return out


def press_status(soup, label):
    for b in soup.select('footer.statusbar > button.tbtn'):
        if b.get_text(strip=True).startswith(label):
            b['aria-pressed'] = 'true'


TABS = [('品質', False), ('控制流程（詳情的流程列已涵蓋；整體視圖另案）', True), ('時間序列', False), ('比對', False)]


def bottom(on, *rows):
    tabs = ''.join('<button class="tab%s"%s>%s</button>' % (' on' if t == on else '', ' disabled' if dis else '', E(t)) for t, dis in TABS)
    return '<section class="bottom" aria-label="底部分頁"><div class="tabs" role="tablist">%s<span class="spacer"></span><button class="iconbtn sm">收合</button></div>%s</section>' % (tabs, ''.join(rows))


# ------------------------------------------------------------------ 06 bytes 檢視
HEX = '''
02 f0 80 01 00 01 00 61 82 01 92 30 82 01 8e 02
01 03 a0 82 01 87 a3 82 01 83 a0 82 01 7f a1 05
80 03 52 50 54 a0 82 01 74 8a 1f 46 44 31 31 5f
50 4d 43 43 4c 44 30 2f 4c 4c 4e 30 24 42 52 24
72 63 62 4d 65 61 73 46 6c 74 84 03 06 50 00 86
01 0c 84 03 04 c0 00 a2 81 9c a2 31 a2 12 a2 07
87 05 08 43 3d 3d a7 a2 07 87 05 08 c3 33 8d 69
a2 09 a2 07 87 05 08 43 3d 3d a7 85 01 00 84 03
03 00 04 91 08 6a e9 46 a8 cd c8 f4 17 a2 31 a2
12 a2 07 87 05 08 41 24 12 24 a2 07 87 05 08 42
da 7e d0 a2 09 a2 07 87 05 08 41 24 12 24 85 01
00 84 03 03 00 04 91 08 6a e9 46 a8 cd c8 f4 17
a2 31 a2 12 a2 07 87 05 08 00 00 00 00 a2 07 87
05 08 00 00 00 00 a2 09 a2 07 87 05 08 00 00 00
00 85 01 00 84 03 03 00 04 91 08 6a e9 46 a8 cd
c8 f4 17 85 01 00 a2 81 9c a2 31 a2 12 a2 07 87
05 08 41 43 3e 8d a2 07 87 05 08 00 00 00 00 a2
09 a2 07 87 05 08 41 43 3e 8d 85 01 00 84 03 03
00 04 91 08 6a e9 46 a8 c5 40 6c 17 a2 31 a2 12
a2 07 87 05 08 3e 9e 7a f5 a2 07 87 05 08 c3 33
1a d3 a2 09 a2 07 87 05 08 3e 9e 7a f5 85 01 00
84 03 03 00 04 91 08 6a e9 46 a8 c5 40 6c 17 a2
31 a2 12 a2 07 87 05 08 00 00 00 00 a2 07 87 05
08 00 00 00 00 a2 09 a2 07 87 05 08 00 00 00 00
'''.split()


def state_bytes():
    s = fresh()
    data = [int(x, 16) for x in HEX]
    # 自我檢查：0x5a 起 156 bytes 必須等於快照裡 #64 的值
    val = s.select_one('aside.detail .hexv').get_text(' ', strip=True).split()
    assert [int(x, 16) for x in val] == data[0x5a:0x5a + 156], 'value bytes mismatch'
    rows = []
    for r in range(0, len(data), 16):
        hx, asc = [], []
        for i in range(r, min(r + 16, len(data))):
            b = data[i]
            cls = 'b'
            if i < 0x16:
                cls += ' osi'
            elif 0x57 <= i <= 0x59:
                cls += ' selh'
            elif 0x5a <= i <= 0xf5:
                cls += ' sel'
            hx.append('<span class="%s">%02x</span>' % (cls, b))
            ch = E(chr(b)) if 0x20 <= b < 0x7f else '·'
            asc.append('<span class="sel">%s</span>' % ch if 0x57 <= i <= 0xf5 else ch)
        rows.append('<div class="hexrow"><span class="off">%08x</span><span class="hx">%s</span><span class="asc">%s</span></div>' % (r, ''.join(hx), ''.join(asc)))
    det = s.select_one('aside.detail')
    det.select('.dh-btns .iconbtn')[0]['aria-pressed'] = 'true'
    body = det.select_one('.detail-body')
    pairing = copy.copy(body.select_one('section.pairing'))
    body.clear()
    body.append(pairing)
    body.append(frag('''<div class="bytes"><div class="bytes-head">
      <span><b class="mono">frame 22</b>　<span class="mono">conn #0</span> <span class="muted mono">192.168.2.55:54644 → 192.168.2.11:102</span></span>
      <span><span class="mono">IED → client</span>　TPKT body <b>413</b> B · MMS @22 (391 B)</span>
      <button class="iconbtn sm">複製 Wireshark 篩選</button></div>
      <div class="bytes-body"><div class="hexdump mono">%s</div></div></div>''' % ''.join(rows)))
    return save(s, 'bytes')


# ------------------------------------------------------------------ 09 匯出對話框
def state_export():
    s = fresh()
    s.select_one('#app').append(frag('''<div class="modal-back"><div class="modal export" role="dialog" aria-label="匯出">
<h3>匯出 Ctrl+E</h3>
<div class="ex-grid">
 <fieldset><legend>範圍</legend>
  <label><input type="radio" name="ex-r" checked> 顯示中的 <b>1,656</b> 列（依篩選，擷取順序）</label>
  <label><input type="radio" name="ex-r"> 全部 <b>1,756</b> 列 <span class="muted">（與 CLI 輸出 byte-identical）</span></label>
  <label><input type="radio" name="ex-r"> 目前選取的列 #64</label>
  <label><input type="radio" name="ex-r"> 列號 <input class="ex-num mono" value="0"> ~ <input class="ex-num mono" value="1755"></label>
 </fieldset>
 <fieldset><legend>格式</legend>
  <label><input type="radio" name="ex-f" checked> JSON（CLI 預設，縮排）</label>
  <label><input type="radio" name="ex-f"> JSON（緊湊）</label>
  <label><input type="radio" name="ex-f"> simple-json（重放用，--simple-json）</label>
  <label><input type="radio" name="ex-f"> CSV（可見欄 + 列號 / epoch / 本機時間）</label>
  <label><input type="radio" name="ex-f"> HTML 報表（離線自足，可列印 / 存 PDF）</label>
 </fieldset>
 <fieldset><legend>選項</legend>
  <label><input type="checkbox"> 略過 unknown（--no-unknown）</label>
 </fieldset>
</div>
<div class="ex-file">檔名 <span class="mono">lab_brcb_report.filtered.json</span> · 1,656 列</div>
<div class="modal-foot"><button class="tbtn">複製成 Wireshark 篩選</button><button class="btn secondary ml">複製</button><button class="btn">下載 JSON</button><button class="tbtn">取消（Esc）</button></div>
</div></div>'''))
    return save(s, 'export')


# ------------------------------------------------------------------ 05 品質
Q_ROWS = [
 ('err', '✗ Error', '存取錯誤', 'data_access_error: TEMPORARILY_UNAVAILABLE', '6'),
 ('warn', '⚠ Warn', 'resolver', 'wire.source = unknown（Write 列：resolver 查不到，只算 Write 與具名列）', '2'),
 ('warn', '⚠ Warn', '型別', 'type_mismatch: resolver=BOOLEAN wire=', '1'),
 ('info', 'ℹ Note', 'resolver', 'No rule matched', '1,653'),
 ('info', 'ℹ Note', 'DataSet', 'DatSet inferred from RptID', '100'),
 ('info', 'ℹ Note', 'DataSet', 'member names from', '100'),
 ('info', 'ℹ Note', '傳輸', 'cotp_reassembled: 2 fragments', '59'),
]


def state_quality():
    s = fresh()
    press_status(s, '品質')
    rows = ''.join('<div class="q-row"><span class="q-sev %s">%s</span><span>%s</span><span class="q-sum mono">%s</span><span class="right mono">%s</span>'
                   '<span class="q-act"><button class="iconbtn sm">套用篩選</button><button class="iconbtn sm">跳第一筆</button></span></div>' % (c, E(a), E(g), E(t), n)
                   for c, a, g, t, n in Q_ROWS)
    panel = ('<div></div><div class="quality"><div class="q-bar"><span class="q-pill err">✗ Error <b>6</b></span><span class="q-pill warn">⚠ Warn <b>3</b></span>'
             '<span class="q-pill info">ℹ Note <b>1,959</b></span><label class="chkl"><input type="checkbox"> 只看目前篩選</label>'
             '<label class="chkl"><input type="checkbox" checked> 依摘要分組</label>'
             '<span class="hint ml">形狀 + 顏色雙編碼；「有 note 不一定是問題」；unknown 只算 Write 與具名列，Read 列天生無 resolver</span></div>'
             '<div class="q-table"><div class="q-row q-head"><span>嚴重度</span><span>群組</span><span>摘要</span><span class="right">筆數</span><span>動作</span></div>%s</div></div>') % rows
    s.select_one('footer.statusbar').insert_after(frag(bottom('品質', panel)))
    return save(s, 'quality')


# ------------------------------------------------------------------ 03/04 時間序列
TS = [('10:27:55.566', 1, '192.34823608398438', '#1'), ('10:27:55.598', 1, '192.34823608398438', '#4'),
      ('10:27:55.686', 1, '187.1692352294922', '#6'), ('10:27:55.686', 2, '77', '#8'),
      ('10:27:55.839', 1, '192.14108276367188', '#12'), ('10:27:55.930', 1, '188.82650756835938', '#15'),
      ('10:27:56.107', 2, '77', '#19'), ('10:27:56.288', 1, '192.03749084472656', '#21'),
      ('10:27:56.438', 1, '192.03749084472656', '#24'), ('10:27:56.438', 2, '77', '#25')]


def ts_svg(w=900, h=210):
    # 只畫參考截圖表格裡看得到的 10 個樣本（真實值）；正式畫面由 uPlot 依完整資料繪製
    secs = lambda t: int(t[6:8]) + int(t[9:]) / 1000
    xs = [secs(t) for t, *_ in TS]
    x0, x1, y0, y1 = 55.5, 56.5, 70, 200
    L, Rm, T, B = 56, 12, 10, 26
    X = lambda v: L + (v - x0) / (x1 - x0) * (w - L - Rm)
    Y = lambda v: T + (y1 - v) / (y1 - y0) * (h - T - B)
    g = []
    for v in range(80, 201, 20):
        g.append('<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="var(--bsoft)" stroke-width="1"/>' % (L, w - Rm, Y(v), Y(v)))
        g.append('<text x="%d" y="%.1f" text-anchor="end" font-size="11" fill="var(--muted)" font-family="var(--mono)">%d</text>' % (L - 8, Y(v) + 4, v))
    for i in range(0, 11, 2):
        v = x0 + i / 10
        g.append('<line y1="%d" y2="%d" x1="%.1f" x2="%.1f" stroke="var(--bsoft)" stroke-width="1"/>' % (T, h - B, X(v), X(v)))
        g.append('<text y="%d" x="%.1f" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="var(--mono)">10:27:%06.3f</text>' % (h - 8, X(v), v))
    for sid in (1, 2):
        pts = [(X(secs(t)), Y(float(val))) for t, s_, val, _ in TS if s_ == sid]
        g.append('<polyline fill="none" stroke="var(--ser-%d)" stroke-width="1.5" points="%s"/>' % (sid, ' '.join('%.1f,%.1f' % p for p in pts)))
        g += ['<circle cx="%.1f" cy="%.1f" r="3.2" fill="var(--surface)" stroke="var(--ser-%d)" stroke-width="1.5"/>' % (x, y, sid) for x, y in pts]
    return '<svg class="ts-svg" viewBox="0 0 %d %d" preserveAspectRatio="none" role="img" aria-label="時間序列（示意：只含表格裡看得到的 10 個樣本）" style="width:100%%;height:100%%;display:block">%s</svg>' % (w, h, ''.join(g))


def state_timeseries():
    s = fresh()
    press_status(s, '時間序列')
    chip = lambda sid, t: ('<span class="fchip" style="border-color:var(--ser-%d)"><i class="sw" style="background:var(--ser-%d)"></i><button class="fchip-text mono">%s</button>'
                           '<button class="fchip-x" aria-label="移除">×</button></span>' % (sid, sid, E(t)))
    bar = ('<div class="ts-bar"><span class="muted">path</span>%s%s<input class="ts-add mono" placeholder="加入 path 或 path · 葉…（最多 6 個）">'
           '<span class="ts-group"><span class="muted">系列</span><label class="chkl"><input type="checkbox" checked> Write 值</label>'
           '<label class="chkl"><input type="checkbox" checked> Read 回應</label><label class="chkl"><input type="checkbox" checked> report 值</label></span>'
           '<span class="ts-group ml"><button class="iconbtn sm" aria-pressed="true">表</button><button class="iconbtn sm">匯出 CSV</button><button class="iconbtn sm">複製 CSV</button></span></div>'
           ) % (chip(1, 'FD11_PMCCLD0/CSMSQI1.SeqA · c1.cVal.mag.f'), chip(2, 'FD11_PMCCLD0/FMMXU1.Hz · mag.f'))
    rows = ''.join('<button class="ts-row"><span class="mono">%s</span><i class="sw" style="background:var(--ser-%d)"></i><span>report 值</span><b class="mono">%s</b><span class="muted mono">%s</span></button>' % (t, sid, v, n)
                   for t, sid, v, n in TS)
    body = '<div class="ts-body with-table"><div class="ts-plot">%s</div><div class="ts-table">%s</div></div>' % (ts_svg(), rows)
    s.select_one('footer.statusbar').insert_after(frag(bottom('時間序列', bar, body)))
    return save(s, 'timeseries')


# ------------------------------------------------------------------ 07 空白頁＋解碼面板
def state_blank():
    s = fresh()
    top = s.select_one('header.topbar')
    for a in top.select('.anchor'):
        if not a.select_one('.decb'):
            a.decompose()
    fn = top.select_one('.fname')
    fn.clear(); fn['class'] = ['fname', 'none']; fn.append('尚未載入檔案'); del fn['title']
    dec = top.select_one('.decb')
    for k in dec.select('.k')[1:]:
        k.decompose()
    dec['aria-expanded'] = 'true'
    pill = top.select_one('.pill')
    pill.select_one('.t').string = '就緒：拖入 .pcap / .pcapng 或 CLI 產出的 .json'
    pill['title'] = '就緒'
    fb = s.select_one('section.filterbar')
    box = fb.select_one('.fbox')
    box.clear(); box['class'] = ['fbox', 'off']
    box.append(frag('<span class="muted" style="padding:0 8px;font-size:13px">載入檔案後才能篩選</span>'))
    cnt = fb.select_one('.counts'); cnt.clear(); cnt.append('尚未載入')
    for b in fb.select(':scope > button.tbtn'):
        if b.get_text(strip=True).startswith(('套用', '匯出')):
            b['disabled'] = ''
    s.select_one('section.overview').decompose()
    s.select_one('footer.statusbar').decompose()
    ws = s.select_one('main.workspace')
    ws.clear(); ws['class'] = ['workspace']
    ws.append(frag('''<div class="stage"><div class="dz">
<svg class="ic xl" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v7.5M5 7l3 3 3-3M3 12.5h10"></path></svg>
<div class="dz-row"><span class="dz-t"><b>拖入 .pcap / .pcapng</b></span><span>或</span><button class="btn">選擇檔案…</button></div>
<div>也可以丟 CLI 產出的 <span class="mono">.json</span>（含 <span class="mono">--responses</span>、<span class="mono">--simple-json</span>）；檔案不上傳，全部在瀏覽器內解碼</div>
<div class="dsum"><svg class="ic sm" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5"></circle><path d="M8 7.2v3.6M8 5.2v.1"></path></svg>會用這組解碼設定：<b class="mono">port 102</b> · 只有 client 的 Write（整段對話沒勾）· 沒有 DataSet 對照 <button class="link">改設定…</button></div>
</div></div>'''))
    s.select_one('#app').append(frag('''<div class="pop" id="decpop" role="dialog" aria-label="解碼設定">
<div class="pop-h">解碼設定 <span class="pop-sub">改了會重新解碼目前的 pcap</span><span class="spacer"></span><button class="tbtn ghost ib sm" aria-label="關閉">×</button></div>
<div class="pop-b">
 <div class="fld"><label class="lbl" for="dec-port">port</label><input class="inp mono" id="dec-port" value="102">
  <span class="hint">擷取檔裡 MMS 的 server port；多台 IED 用逗號，例 <span class="mono">102,112</span>。空白 = 102</span></div>
 <label class="chkl"><input type="checkbox"><span><b>整段對話</b>（Read 請求、IED 回應、報告）<span class="hint blk">不勾 = 只有 client 的 Write</span></span></label>
 <div class="fld"><span class="lbl">DataSet 對照</span><span class="filef"><button class="tbtn sm">選擇檔案…</button><span class="fn muted">沒有選</span></span>
  <span class="hint"><span class="mono">.json</span>，例 <span class="mono">lab_brcb_datasets.json</span>；空白 = 不給（擷取裡有瀏覽會自己學）</span></div>
</div>
<div class="pop-f"><span>還沒解碼</span><span class="spacer"></span><span>錯 port 時，列表位置的提示卡也能一鍵改</span></div>
</div>'''))
    return save(s, 'blank')


# ------------------------------------------------------------------ 08 比對（另一個檔：pair_ctlval_client.pcap）
CMP_ROWS = [
 (0, '17:07:11.831', 'request', 'FD11_PMCCLD0/GGIO1.IscSO1.stVal', 'ST'), (1, '17:07:11.832', 'response', 'FD11_PMCCLD0/GGIO1.IscSO1.stVal', 'ST'),
 (2, '17:07:11.956', 'request', 'FD11_PMCCLD0/GGIO1.IscSO1.ctlModel', 'CF'), (3, '17:07:11.956', 'response', 'FD11_PMCCLD0/GGIO1.IscSO1.ctlModel', 'CF'),
 (4, '17:07:11.956', 'request', 'FD11_PMCCLD0/GGIO1.Beh.stVal', 'ST'), (5, '17:07:11.957', 'response', 'FD11_PMCCLD0/GGIO1.Beh.stVal', 'ST'),
 (6, '17:07:11.957', 'request', 'FD11_PMCCLD0/GGIO1.Mod.stVal', 'ST'), (7, '17:07:11.958', 'response', 'FD11_PMCCLD0/GGIO1.Mod.stVal', 'ST'),
 (8, '17:07:11.958', 'request', 'FD11_PMCCLD0/GGIO1.IscSO1.ctlModel', 'CF'), (9, '17:07:11.958', 'response', 'FD11_PMCCLD0/GGIO1.IscSO1.ctlModel', 'CF'),
 (10, '17:07:11.959', 'response', 'FD11_PMCCLD0/GGIO1.IscSO1', 'CO'),
]
# 直方圖：從參考圖 08 的像素量回來的 52 格（每格 5 ms）；req / resp 筆數
CMP_BINS = {0: (1, 1), 24: (1, 1), 25: (4, 5), 50: (4, 5), 51: (1, 1)}


def state_compare():
    s = fresh()
    top = s.select_one('header.topbar')
    fn = top.select_one('.fname')
    fn['title'] = 'pair_ctlval_client.pcap'
    fn.select_one('.nm').string = 'pair_ctlval_client.pcap'
    fn.select_one('.sr-only').decompose()
    conn = [a for a in top.select('.anchor') if not a.select_one('.decb')][0].select_one('button')
    for t in conn.find_all(string=True):
        if '連線' in t:
            t.replace_with(t.replace('2 連線', '3 連線'))
    dec = top.select_one('.decb')
    dec.select_one('.v').string = 'port 10202'
    pill = top.select_one('.pill')
    pill.select_one('.t').string = 'B：24 筆；比對 相同 23 · 值不同 1 · 只有 A 0 · 只有 B 0'
    pill['title'] = pill.select_one('.t').string
    fb = s.select_one('section.filterbar')
    fb.select_one('.fchips').clear()
    ph = fb.select_one('.cm-placeholder')
    ph.string = '輸入條件，例 kind == report；Enter 套用、Tab 補全；空白 = 全部顯示'
    cnt = fb.select_one('.counts'); cnt.clear(); cnt.append(frag('顯示 <b>24</b> / 全部 <b>24</b>'))
    # 總覽
    ov = s.select_one('section.overview')
    ov.select_one('.trange').string = '2026-11-04 17:07:11.831 → 17:07:12.087'
    ov.select_one('.trange')['title'] = '2026-11-04 17:07:11.831 → 17:07:12.087'
    ov.select_one('.hh .muted').string = '共 256 ms'
    mx = 9.0
    g = []
    for i, (rq, rs) in sorted(CMP_BINS.items()):
        h1, h2 = rq / mx * 100, rs / mx * 100
        g.append('<g><rect class="ghost" height="%.3f" width="0.76" x="%.2f" y="%.3f"></rect><rect class="seg s-req" height="%.3f" width="0.76" x="%.2f" y="%.3f"></rect>'
                 '<rect class="seg s-resp" height="%.3f" width="0.76" x="%.2f" y="%.3f"></rect></g>' % (h1 + h2, i + .12, 100 - h1 - h2, h1, i + .12, 100 - h1, h2, i + .12, 100 - h1 - h2))
    svg = ov.select_one('svg.hist-svg')
    svg['viewbox'] = '0 0 52 100'
    svg['aria-label'] = '每格 5 ms 的列數直方圖，52 格'
    svg.clear(); svg.append(frag(''.join(g)))
    leg = ov.select_one('.hist-legend')
    leg.clear()
    leg.append(frag('<span><i class="sw s-req"></i>→ 請求 <b>11</b></span><span><i class="sw s-resp"></i>← 回應 <b>13</b></span><span><i class="sw s-rpt"></i>▤ 報告 <b>0</b></span><span class="hint ml">每格 5 ms · 拖曳 = 時間篩選</span>'))
    c = lambda cls, k, n: '<button class="cnt %s" aria-pressed="false"><span class="cnt-k">%s</span><span class="cnt-n">%s</span></button>' % (cls, E(k), n)
    ovc = ov.select_one('.ovcounts')
    ovc.clear()
    ovc.append(frag(
        '<div class="crow"><span class="clabel mono">kind</span>%s%s%s</div>' % (c('info', 'request', '11'), c('ok', 'response', '13'), c('warn', '⚡ 控制', '6')) +
        '<div class="crow"><span class="clabel mono">service</span>%s%s%s</div>' % (c('', 'Read', '18'), c('', 'Write', '4'), c('', 'GetVariableAccessAttributes', '2')) +
        '<div class="crow"><span class="clabel">品質（只算 Write）</span>%s<span class="clabel gap">配對</span>%s%s</div>' % (c('info', 'exact', '4'), c('', '請求無回應', '0'), c('', '回應無請求', '2')) +
        '<div class="crow"><span class="clabel">備註</span>%s<span class="cnt static"><span class="cnt-k">ABB 說明</span><span class="cnt-n">24</span></span>%s</div>' % (c('warn', '型別不符', '18'), c('', '有備註', '24'))))
    # 模型樹
    th = s.select_one('.tree-head .muted'); th.string = '全部'
    tree = s.select_one('.tree'); tree.clear()
    nodes = [(8, '▾', 'ld', 'FD11_PMCCLD0', '24'), (22, '▾', 'ln', 'GGIO1', '24'), (36, '▸', 'seg', 'Beh', '4'),
             (36, '▸', 'seg', 'IscSO1', '9'), (36, '▸', 'seg', 'Mod', '4'), (36, '▸', 'seg', 'SPCSO1', '7')]
    tree.append(frag(''.join('<div class="tnode %s" role="treeitem" style="padding-left: %dpx;"><span class="caret">%s</span><button class="tname mono">%s</button><span class="tcount">%s</span></div>' % (k, p, cz, E(n), cn)
                             for p, cz, k, n, cn in nodes)))
    # 列表
    vl = s.select_one('.vlist'); vl['aria-rowcount'] = '24'; vl['aria-activedescendant'] = ''
    body = s.select_one('.vlist .body'); body.clear()
    cols = '64px 124px 118px 360px 56px 104px 220px 150px'
    glyph = {'request': '→', 'response': '←'}
    for n, t, k, p, fc in CMP_ROWS:
        ctl = fc == 'CO'
        fct = '⚡ CO' if ctl else fc
        body.append(frag('<div class="row k-%s%s" role="row" id="c-%d" data-row="%d" style="grid-template-columns: %s; height: 32px; transform: translateY(%dpx);">'
                         '<div class="cell c-row mono right">%d</div><div class="cell c-ts mono">%s</div><div class="cell c-kind">%s %s</div>'
                         '<div class="cell c-path mono">%s</div><div class="cell c-fc">%s</div><div class="cell c-type"></div><div class="cell c-value mono"></div><div class="cell c-service"></div></div>'
                         % (k, ' ctl' if ctl else '', n, n, cols, n * 32, n, t, glyph[k], k, p, fct)))
    # 詳情：沒選
    det = s.select_one('aside.detail'); det.clear()
    det.append(frag('<div class="detail-empty">選一列（↑ ↓ 或點擊）看完整紀錄、配對與控制欄位</div>'))
    # 工具列
    sel = s.select_one('.sb-sel'); sel.clear(); sel.append('未選取')
    press_status(s, '比對')
    tag = lambda t, b=False: '<span class="ftag%s">%s</span>' % (' b' if b else '', t)
    bar = ('<div></div><div class="cmp"><div class="cmp-bar"><span class="muted">A</span><span class="mono">pair_ctlval_client.pcap</span>%s%s%s'
           '<span class="muted">B</span><span class="mono">pair_ctlval_ied.pcap</span>%s%s%s<button class="tbtn sm out">載入第二份（B）…</button>'
           '<span class="hint">B 用上面的 port / 整段對話設定解；proxy 錄的 .client / .ied 配對檔 port 不同時先改 port</span>'
           '<span class="ml">時間窗 <input class="ex-num mono" value="5"> s</span>'
           '<label class="chkl"><input type="checkbox" checked> 鍵合 invokeID</label><button class="iconbtn sm">重新比對</button>'
           '<label class="chkl"><input type="checkbox" checked> 只看差異</label><button class="iconbtn sm">匯出 CSV</button></div>'
           ) % (tag('pair'), tag('ctlval'), tag('client'), tag('pair', True), tag('ctlval', True), tag('ied', True))
    stats = ('<div class="cmp-stats"><table class="cmp-table"><colgroup><col><col class="v"><col class="v"></colgroup>'
             '<tr><th></th><th>A</th><th>B</th></tr>'
             '<tr><th>列數</th><td class="mono">24</td><td class="mono">24</td></tr>'
             '<tr><th>時間</th><td class="mono" style="white-space:normal">17:07:11.831 → 17:07:12.087</td><td class="mono" style="white-space:normal">17:07:11.831 → 17:07:12.087</td></tr>'
             '<tr><th class="mono">request</th><td class="mono">11</td><td class="mono">11</td></tr>'
             '<tr><th class="mono">response</th><td class="mono">13</td><td class="mono">13</td></tr>'
             '<tr><th class="mono">GetVariableAccessAttributes</th><td class="mono">2</td><td class="mono">2</td></tr></table></div>')
    rows = ('<div class="cmp-rows"><div class="cmp-row sel"><span class="err">≠ 值不同</span><span class="cmp-key mono">request · Write · FD11_PMCCLD0/GGIO1.IscSO1.Oper</span>'
            '<button class="ref mono">#11</button><span class="mono">#11</span><span class="right mono">0.5</span><span class="muted">value, decoded.ctlVal</span></div></div>')
    detail = ('<div class="cmp-detail"><div class="cmp-detail-head">鍵 <span class="mono">request · Write · FD11_PMCCLD0/GGIO1.IscSO1.Oper · 6</span> · Δt 0.5 ms</div>'
              '<table class="cmp-table"><tr><th></th><th>A #11</th><th>B #11</th></tr>'
              '<tr class="changed"><th>value</th><td class="mono">850107a20e85010389094d4d535f77…</td><td class="mono">850146a20e85010389…</td></tr>'
              '<tr><th>ok</th><td></td><td></td></tr><tr><th>error_code</th><td></td><td></td></tr>'
              '<tr><th>fc</th><td class="mono">CO</td><td class="mono">CO</td></tr><tr><th>type</th><td class="mono">STRUCTURE</td><td class="mono">STRUCTURE</td></tr></table></div>')
    panel = bar + '<div class="cmp-body">%s%s%s</div></div>' % (stats, rows, detail)
    s.select_one('footer.statusbar').insert_after(frag(bottom('比對', panel)))
    return save(s, 'compare')


if __name__ == '__main__':
    for f in (state_bytes, state_export, state_quality, state_timeseries, state_blank, state_compare):
        print(f())
