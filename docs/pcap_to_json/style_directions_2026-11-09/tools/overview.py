"""2x renders of current + A..E, then the overview grid (light row, dark row)."""
import json
import os
import shutil
import subprocess
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_css import CFG, css_list, R

HERE = os.path.dirname(os.path.abspath(__file__))
base = ['fontsource/noto-sans-tc/400.css', 'fontsource/noto-sans-tc/500.css', 'fontsource/noto-sans-tc/700.css']
jobs = []
for t in ('light', 'dark'):
    jobs.append(dict(id='cur-%s-2x' % t, css=base, theme=t, dpr=2, out='ov/x2_cur_%s.png' % t, metrics=False))
    for k in CFG:
        jobs.append(dict(id='%s-%s-2x' % (k, t), css=css_list(k), theme=t, dpr=2, out='ov/x2_%s_%s.png' % (k, t), metrics=False, pre=CFG[k].get('pre')))
cfg = dict(root=R, snapshot='docs/pcap_to_json/shots/style_input_2026-11-09/snapshot_main.html', summary=os.path.join(R, 'out', 'summary_x2.json'), jobs=jobs)
jp = os.path.join(R, 'out', 'jobs_x2.json')
json.dump(cfg, open(jp, 'w'))
subprocess.run(['node', os.path.join(HERE, 'render.cjs'), jp], check=True, capture_output=True)
cols = [
 ('cur', '現況', '參考：c686fd4', 'IBM Plex Sans / Mono · 列 32 · 表頭 y 196'),
 ('A', 'A 控制室', 'ISA-101：灰是常態，顏色只給異常', 'B612 / Red Hat Mono · 列 30 · 表頭 y 194'),
 ('B', 'B 高密度工作站', 'IDE / Wireshark 感，深色優先', 'Iosevka Aile / Iosevka · 列 22 · 表頭 y 152'),
 ('C', 'C 技術報告', '文件感，淺色優先、印出來好看', 'Source Serif / Sans / Code · 列 30 · 表頭 y 196'),
 ('D', 'D 現代產品感', '柔和表面、卡片、主要動作清楚', 'Inter / Geist Mono · 列 30 · 表頭 y 196'),
 ('E', 'E 高對比', '文字 7:1、粗焦點框、形狀＋文字標記', 'Atkinson Hyperlegible · 列 36 · 表頭 y 224（+28）'),
]
th = ''.join('<div class="h%s"><b>%s</b><span>%s</span><small>%s</small></div>' % (' cur' if k == 'cur' else '', n, t, m) for k, n, t, m in cols)
row = lambda theme: ''.join('<img src="ov/x2_%s_%s.png">' % (k, theme) for k, *_ in cols)
html = '''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<link rel="stylesheet" href="fontsource/noto-sans-tc/400.css"><link rel="stylesheet" href="fontsource/noto-sans-tc/700.css">
<style>
body{margin:0;background:#f3f4f6;font-family:"Noto Sans TC",sans-serif;color:#111}
.wrap{padding:20px 24px 24px;width:max-content}
h1{font-size:22px;margin:0 0 4px} .sub{color:#444;font-size:14px;margin:0 0 16px}
.grid{display:grid;grid-template-columns:44px repeat(6,420px);gap:10px 12px;align-items:start}
.h{display:flex;flex-direction:column;gap:2px;padding:0 2px 4px} .h b{font-size:17px} .h span{font-size:13px;color:#333} .h small{font-size:12px;color:#555}
.h.cur b{color:#555}
.lab{writing-mode:vertical-rl;font-size:14px;font-weight:700;color:#333;justify-self:center;align-self:center}
img{width:420px;height:262.5px;display:block;border:1px solid #c9ccd1;box-shadow:0 1px 2px #0000001a}
</style></head><body><div class="wrap">
<h1>MMS pcap 分析 · 工作台風格第一輪：五個方向</h1>
<p class="sub">1440 × 900 主畫面（篩選 kind != report_header、選了 #64 報告成員、詳情展開），由 snapshot_main.html 的真實 DOM 套各方向 CSS 渲染；上排淺色、下排深色。</p>
<div class="grid"><div></div>%s<div class="lab">淺色</div>%s<div class="lab">深色</div>%s</div>
</div></body></html>''' % (th, row('light'), row('dark'))
open(os.path.join(R, 'overview.html'), 'w', encoding='utf-8').write(html)
subprocess.run(['node', os.path.join(HERE, 'shot_page.cjs'), os.path.join(R, 'overview.html'), os.path.join(R, 'out', 'overview.png')], check=True)
print('overview ok')
