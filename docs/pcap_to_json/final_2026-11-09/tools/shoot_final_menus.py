"""Render plan-1 top-chrome menus opened, in the final style F (light + dark)."""
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
TB = open(os.path.join(PCAP, 'topbar_redesign_2026-11-09', 'topbar_v3.js'), encoding='utf-8').read()
css = css_list('F')
css = css[:-1] + ['tbcss/topbar_v3.css'] + css[-1:]
PRE = '(() => { %s;\n%s\n; window.__tb3.restructure(1, {tokenHeights: true}); })()' % (CFG['F']['pre'], TB)
SNAP = 'docs/pcap_to_json/shots/style_input_2026-11-09/'
jobs = []
for o in ('src', 'app', 'qmenu', 'disp', 'pal'):
    for t in ('light', 'dark'):
        jobs.append(dict(id='F-menu-%s-%s' % (o, t), css=css, theme=t, out='final/F_menu_%s_%s.png' % (o, t), pre=PRE,
                         post='(() => { window.__tb3.demo(1, %s); })()' % json.dumps(o), audit=True))
cfg = dict(root=R, snapshot=SNAP + 'snapshot_main.html', summary=os.path.join(R, 'final', 'summary_menus.json'), jobs=jobs)
jp = os.path.join(R, 'final', 'jobs_menus.json')
json.dump(cfg, open(jp, 'w'))
subprocess.run(['node', os.path.join(TOOLS, 'render.cjs'), jp], check=True, capture_output=True)
s = json.load(open(cfg['summary']))
for jid, v in s.items():
    line = '%-20s' % jid
    if v.get('audit'):
        au = [x for x in v['audit'] if not x['disabled']]
        mn = min(au, key=lambda x: x['cr'])
        line += ' text min %.2f (%s | %s)' % (mn['cr'], mn['sel'][-40:], mn['text'][:16])
    print(line, '| errors', v['errors'][:2] if v['errors'] else 0)
