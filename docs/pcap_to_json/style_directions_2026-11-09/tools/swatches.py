"""Render the colour-meaning sheet for current + A..E, light and dark, and stack light over dark."""
import json
import os
import subprocess
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_css import CFG, css_list, R
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run([sys.executable, '-IB', os.path.join(HERE, 'make_swatch.py')], check=True)
base = ['fontsource/noto-sans-tc/400.css', 'fontsource/noto-sans-tc/500.css', 'fontsource/noto-sans-tc/700.css', 'directions/_v2_layer.css']
jobs = []
for k in list(CFG) + ['cur']:
    for t in ('light', 'dark'):
        jobs.append(dict(id='%s-%s' % (k, t), css=base if k == 'cur' else css_list(k), theme=t, out='out/sw_%s_%s.png' % (k, t)))
cfg = dict(root=R, page='docs/pcap_to_json/shots/style_input_2026-11-09/swatch.html', jobs=jobs)
jp = os.path.join(R, 'out', 'jobs_sw.json')
json.dump(cfg, open(jp, 'w'))
r = subprocess.run(['node', os.path.join(HERE, 'render_swatch.cjs'), jp], capture_output=True, text=True, check=True)
res = json.loads(r.stdout)
for k in list(CFG) + ['cur']:
    a = Image.open(os.path.join(R, 'out', 'sw_%s_light.png' % k)).convert('RGB')
    b = Image.open(os.path.join(R, 'out', 'sw_%s_dark.png' % k)).convert('RGB')
    out = Image.new('RGB', (max(a.width, b.width), a.height + b.height + 10), (128, 128, 128))
    out.paste(a, (0, 0))
    out.paste(b, (0, a.height + 10))
    out.save(os.path.join(R, 'out', 'swatch_%s.png' % ('current' if k == 'cur' else k)), optimize=True)
bad = {k: v for k, v in res.items() if v['errors'] or not v['focusVisible']}
print('swatches ok' if not bad else bad)
