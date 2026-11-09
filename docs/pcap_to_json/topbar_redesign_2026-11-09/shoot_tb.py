"""Render the top-chrome redesign proposals (P1/P2/P3) on the real snapshot DOM.
先照 ../style_directions_2026-11-09/tools/README.md 建好渲染目錄並 export STYLE_RENDER_ROOT。
usage: python3 -IB shoot_tb.py [main] [states] [B] [measure]   （不給參數 = main states B measure）"""
import json
import os
import subprocess
import sys
HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.join(os.path.dirname(HERE), 'style_directions_2026-11-09', 'tools')
sys.path.insert(0, TOOLS)
from build_css import R, css_list
import shutil
os.makedirs(os.path.join(R, 'tbcss'), exist_ok=True)
shutil.copy(os.path.join(HERE, 'topbar_v3.css'), os.path.join(R, 'tbcss', 'topbar_v3.css'))
SRC = open(os.path.join(HERE, 'topbar_v3.js'), encoding='utf-8').read()
BASE = ['fontsource/noto-sans-tc/400.css', 'fontsource/noto-sans-tc/500.css', 'fontsource/noto-sans-tc/700.css', 'directions/_v2_layer.css', 'tbcss/topbar_v3.css']


def pre(P):
    return '(() => { %s\n; window.__tb3.restructure(%d); })()' % (SRC, P)


def post(P, open_):
    return '(() => { window.__tb3.demo(%d, %s); })()' % (P, json.dumps(open_))


what = set(sys.argv[1:]) or {'main', 'states', 'B', 'measure'}
jobs = []
if 'main' in what:
    for P in (1, 2, 3):
        for t in ('light', 'dark'):
            jobs.append(dict(id='P%d-%s' % (P, t), css=BASE, theme=t, out='tb/P%d_%s.png' % (P, t), pre=pre(P), audit=True))
        jobs.append(dict(id='P%d-1280' % P, css=BASE, theme='light', w=1280, h=800, out='tb/P%d_1280.png' % P, pre=pre(P)))
        jobs.append(dict(id='P%d-1920' % P, css=BASE, theme='light', w=1920, h=1080, out='tb/P%d_1920.png' % P, pre=pre(P)))
if 'states' in what:
    for o in ('src', 'app', 'qmenu', 'disp', 'pal'):
        jobs.append(dict(id='P1-%s' % o, css=BASE, theme='light', out='tb/P1_open_%s.png' % o, pre=pre(1), post=post(1, o)))
    jobs.append(dict(id='P1-src-dark', css=BASE, theme='dark', out='tb/P1_open_src_dark.png', pre=pre(1), post=post(1, 'src')))
    for t in ('light', 'dark'):
        jobs.append(dict(id='P3-facets-%s' % t, css=BASE, theme=t, out='tb/P3_facets_%s.png' % t, pre=pre(3), post=post(3, 'facets')))
if 'B' in what:
    cssB = [c for c in css_list('B')] + ['tbcss/topbar_v3.css']
    for t in ('light', 'dark'):
        jobs.append(dict(id='P1B-%s' % t, css=cssB, theme=t, out='tb/P1_B_%s.png' % t, pre=pre(1)))
os.makedirs(os.path.join(R, 'tb'), exist_ok=True)
cfg = dict(root=R, snapshot='docs/pcap_to_json/shots/style_input_2026-11-09/snapshot_main.html', summary=os.path.join(R, 'tb', 'summary_tb.json'), jobs=jobs)
jp = os.path.join(R, 'tb', 'jobs_tb.json')
json.dump(cfg, open(jp, 'w'))
subprocess.run(['node', os.path.join(TOOLS, 'render.cjs'), jp], check=True)
s = json.load(open(cfg['summary']))
for jid, v in s.items():
    m = v['metrics']; b = m['boxes']
    fb = None
    print(jid, 'hdr.y=%s rows %s-%s' % (b['.vlist .hdr']['y'], v['rows']['shownFrom'], v['rows']['shownTo']), 'errors', v['errors'][:2])
    bad = {k: o for k, o in m['overflow'].items() if o['scrollOver'] > 0 or o['clipped'] or not o['lines']}
    if bad: print('   OVERFLOW', bad)
    tr = [t for t in m['truncated'] if not t.startswith('sr-only')]
    if tr: print('   truncated', tr)
    if v.get('audit'):
        au = [x for x in v['audit'] if not x['disabled']]
        mn = min(au, key=lambda x: x['cr'])
        print('   audit min %.2f %s | %s' % (mn['cr'], mn['sel'][-50:], mn['text']))

if 'measure' in what:
    jobs = [dict(id='現況', css=BASE[:4])] + [dict(id='P%d' % P, css=BASE, pre=pre(P)) for P in (1, 2, 3)]
    mc = dict(root=R, snapshot=cfg['snapshot'], jobs=jobs)
    for tool, out in (('measure_fbox.cjs', 'fbox_widths.json'), ('count_controls.cjs', 'control_counts.json')):
        jp = os.path.join(R, 'tb', 'jobs_m.json'); json.dump(mc, open(jp, 'w'))
        r = subprocess.run(['node', os.path.join(HERE, tool), jp], capture_output=True, text=True, check=True)
        res = json.loads(r.stdout); json.dump(res, open(os.path.join(R, 'tb', out), 'w'), ensure_ascii=False, indent=1); print(out, res)
