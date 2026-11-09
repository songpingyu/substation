"""Render directions: python3 -I shoot.py A [B ...] [--1280] [--audit]"""
import json
import os
import subprocess
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_css import CFG, build, css_list, R

keys = [a for a in sys.argv[1:] if not a.startswith('--')] or list(CFG)
jobs = []
for k in keys:
    build(k)
    pre = CFG[k].get('pre')
    for theme in ('light', 'dark'):
        jobs.append(dict(id='%s-%s' % (k, theme), css=css_list(k), theme=theme, out='out/%s_%s.png' % (k, theme),
                         audit='--audit' in sys.argv, pre=pre))
    if '--1280' in sys.argv:
        jobs.append(dict(id='%s-1280' % k, css=css_list(k), theme='light', w=1280, h=800, out='out/%s_1280.png' % k, pre=pre))
cfg = dict(root=R, snapshot='docs/pcap_to_json/shots/style_input_2026-11-09/snapshot_main.html',
           summary=os.path.join(R, 'out', 'summary_%s.json' % '_'.join(keys)), jobs=jobs)
jp = os.path.join(R, 'out', 'jobs_%s.json' % '_'.join(keys))
json.dump(cfg, open(jp, 'w'), ensure_ascii=False, indent=1)
subprocess.run(['node', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'render.cjs'), jp], check=True)
s = json.load(open(cfg['summary']))
for jid, v in s.items():
    m = v['metrics']
    b = m['boxes']
    print(jid, 'rows', v['rows'], 'errors', v['errors'][:3])
    print('   hdr.y=%s top=%s filter=%s ov=%s status=%s | tree/list/detail = %s/%s/%s | rowH=%s font=%s' % (
        b['.vlist .hdr']['y'], b['.topbar']['h'], b['.filterbar']['h'], b['.overview']['h'], b['.statusbar']['h'],
        b['.treepane']['w'], b['.listwrap']['w'], b['.detail']['w'], m['rowH'], m['fontUi']))
    bad = {k: o for k, o in m['overflow'].items() if o['scrollOver'] > 0 or o['clipped'] or not o['lines']}
    if bad:
        print('   OVERFLOW', bad)
    tr = [t for t in m['truncated'] if not t.startswith('sr-only')]
    if tr:
        print('   truncated', tr)
    print('   fonts', m['fonts'])
    if v.get('audit'):
        a = v['audit']
        thr = 7.0 if jid.startswith('E') else 4.5
        fails = [x for x in a if x['cr'] < (3.0 if x['large'] else thr) and not x['disabled']]
        print('   audit: %d text elements, min %.2f, fails %d' % (len(a), min(x['cr'] for x in a), len(fails)))
        for f in sorted(fails, key=lambda x: x['cr'])[:12]:
            print('     %.2f %s | %s%s' % (f['cr'], f['sel'][-70:], f['text'], ' (placeholder)' if f['placeholder'] else ''))
