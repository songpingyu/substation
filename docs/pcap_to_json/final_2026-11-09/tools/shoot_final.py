"""Render the final design F (plan 1 × D, light uses A's grays): main screen + round-2 states.
usage: python3 -IB shoot_final.py [main] [states]"""
import json
import shutil
import os
import subprocess
import sys
HERE = os.path.dirname(os.path.abspath(__file__))
PCAP = os.path.dirname(os.path.dirname(HERE))
TOOLS = os.path.join(PCAP, 'style_directions_2026-11-09', 'tools')
sys.path.insert(0, TOOLS)
from build_css import CFG, R, build, css_list

build('F')
os.makedirs(os.path.join(R, 'tbcss'), exist_ok=True)
shutil.copy(os.path.join(PCAP, 'topbar_redesign_2026-11-09', 'topbar_v3.css'), os.path.join(R, 'tbcss', 'topbar_v3.css'))
subprocess.run([sys.executable, '-IB', os.path.join(HERE, 'states.py')], check=True, capture_output=True)
TB = open(os.path.join(PCAP, 'topbar_redesign_2026-11-09', 'topbar_v3.js'), encoding='utf-8').read()
css = css_list('F')
css = css[:-1] + ['tbcss/topbar_v3.css'] + css[-1:]
PRE = '(() => { %s;\n%s\n; window.__tb3.restructure(1, {tokenHeights: true}); })()' % (CFG['F']['pre'], TB)
POP = "(() => { const p = document.getElementById('decpop'), a = document.getElementById('tb-src'); if (!p || !a) return; const r = a.getBoundingClientRect(); Object.assign(p.style, {position: 'fixed', left: r.left + 'px', top: (r.bottom + 6) + 'px', zIndex: 90}); })()"
SNAP = 'docs/pcap_to_json/shots/style_input_2026-11-09/'
what = set(sys.argv[1:]) or {'main', 'states'}
jobs = []
if 'main' in what:
    for t in ('light', 'dark'):
        jobs.append(dict(id='F-main-%s' % t, css=css, theme=t, out='final/F_main_%s.png' % t, pre=PRE, audit=True))
        jobs.append(dict(id='F-1280-%s' % t, css=css, theme=t, w=1280, h=800, out='final/F_1280_%s.png' % t, pre=PRE))
    jobs.append(dict(id='F-1920-light', css=css, theme='light', w=1920, h=1080, out='final/F_1920_light.png', pre=PRE))
if 'states' in what:
    for st in ('bytes', 'blank', 'compare', 'export', 'quality', 'timeseries'):
        for t in ('light', 'dark'):
            jobs.append(dict(id='F-%s-%s' % (st, t), snapshot=SNAP + 'state_%s.html' % st, css=css, theme=t, out='final/F_%s_%s.png' % (st, t),
                             pre=PRE, post=POP if st == 'blank' else None, audit=True))
os.makedirs(os.path.join(R, 'final'), exist_ok=True)
cfg = dict(root=R, snapshot=SNAP + 'snapshot_main.html', summary=os.path.join(R, 'final', 'summary_final.json'), jobs=jobs)
jp = os.path.join(R, 'final', 'jobs_final.json')
json.dump(cfg, open(jp, 'w'))
subprocess.run(['node', os.path.join(TOOLS, 'render.cjs'), jp], check=True, capture_output=True)
s = json.load(open(cfg['summary']))
for jid, v in s.items():
    m = v['metrics']; b = m['boxes']
    bad = {k: o for k, o in m['overflow'].items() if o['scrollOver'] > 0 or o['clipped'] or not o['lines']}
    tr = [t for t in m['truncated'] if not t.startswith('sr-only')]
    line = '%-18s hdr.y=%s rows %s-%s' % (jid, (b['.vlist .hdr'] or {}).get('y'), v['rows'].get('shownFrom') if v['rows'] else '-', v['rows'].get('shownTo') if v['rows'] else '-')
    if v.get('audit'):
        au = [x for x in v['audit'] if not x['disabled']]
        mn = min(au, key=lambda x: x['cr'])
        line += ' | text min %.2f (%s | %s)' % (mn['cr'], mn['sel'][-40:], mn['text'][:16])
    print(line, '| errors', v['errors'][:2] if v['errors'] else 0, '| overflow', bad or '-', '| trunc', tr or '-')
