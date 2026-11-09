"""Render the current design (snapshot as-is) light / dark / 1280 with the DOM contrast audit, for comparison."""
import json
import os
import subprocess
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_css import R

HERE = os.path.dirname(os.path.abspath(__file__))
base = ['fontsource/noto-sans-tc/400.css', 'fontsource/noto-sans-tc/500.css', 'fontsource/noto-sans-tc/700.css']
cfg = dict(root=R, snapshot='docs/pcap_to_json/shots/style_input_2026-11-09/snapshot_main.html',
           summary=os.path.join(R, 'out', 'summary_base.json'),
           jobs=[dict(id='base-light', css=base, theme='light', out='out/base_light.png', audit=True),
                 dict(id='base-dark', css=base, theme='dark', out='out/base_dark.png', audit=True),
                 dict(id='base-1280', css=base, theme='light', w=1280, h=800, out='out/base_1280.png')])
jp = os.path.join(R, 'out', 'jobs_base.json')
json.dump(cfg, open(jp, 'w'))
subprocess.run(['node', os.path.join(HERE, 'render.cjs'), jp], check=True, capture_output=True)
print('baseline ok')
