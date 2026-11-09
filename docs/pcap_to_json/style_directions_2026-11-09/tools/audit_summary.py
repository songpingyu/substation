"""Collapse the DOM contrast audits into out/audit_summary.json (disabled controls excluded)."""
import glob
import json
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_css import R

res = {}
for f in [os.path.join(R, 'out', 'summary_base.json'), os.path.join(R, 'out', 'summary_A_B_C_D_E.json')]:
    for k, v in json.load(open(f)).items():
        if not v.get('audit'):
            continue
        au = [x for x in v['audit'] if not x['disabled']]
        mn = min(au, key=lambda x: x['cr'])
        res[k] = {'texts': len(au), 'min': mn['cr'], 'min_at': mn['sel'][-60:] + ' | ' + mn['text'], 'console_errors': v['errors']}
json.dump(res, open(os.path.join(R, 'out', 'audit_summary.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in res.items():
    print(k, v['texts'], v['min'], v['min_at'])
