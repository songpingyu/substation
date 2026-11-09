"""Summary table of token checks for current + A..E (computed from the CSS files)."""
import json
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from colorcheck import palette, contrast, de2000, simulate, over

SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 渲染工作目錄（見 setup_render_root.sh）；預設是 tools/ 上一層的 render/
RROOT = os.environ.get('STYLE_RENDER_ROOT') or os.path.join(SP, 'render')
D = os.path.join(RROOT, 'directions')
SURF = ['bg', 'topbar', 'panel', 'surface', 'surface2', 'input', 'hover', 'nav-hover', 'nav-active', 'sel-bg']
LIST = ['surface', 'panel', 'surface2', 'bg', 'topbar', 'hover', 'sel-bg']
TINT = ['rule-info', 'rule-ok', 'rule-warn', 'rule-err', 'rule-vio', 'rule-accent']


def solid(cols, n):
    c = cols['--' + n]
    if c[3] < 1:
        c = over(c, solid(cols, 'surface'))
    return c


def mind(cols, names, sims=('protan', 'deutan', 'tritan')):
    best = (999, '')
    for s in sims:
        cs = [simulate(solid(cols, n), s) for n in names]
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                d = de2000(cs[i], cs[j])
                if d < best[0]:
                    best = (d, '%s/%s %s' % (names[i], names[j], s[:3]))
    return round(best[0], 1), best[1]


def summary(css):
    pal = palette(css)
    out = {}
    for theme, cols in pal.items():
        bgs = [solid(cols, s) for s in SURF + TINT + ['ctl-bg'] if '--' + s in cols]
        lb = [solid(cols, s) for s in LIST if '--' + s in cols]
        r = {}
        r['text'] = round(min(contrast(solid(cols, t), b) for t in ['text', 'muted', 'dim'] for b in bgs), 2)
        r['status_text'] = round(min(contrast(solid(cols, t), b) for t in ['ok', 'warn', 'err', 'info', 'vio', 'accent', 'k-req', 'k-resp', 'k-err', 'k-rpt'] for b in lb), 2)
        r['focus'] = round(min(contrast(solid(cols, 'focus'), solid(cols, b)) for b in ['bg', 'topbar', 'panel', 'surface', 'input', 'sel-bg']), 2)
        r['chart'] = round(min(contrast(solid(cols, c), solid(cols, 'surface')) for c in ['ch-req', 'ch-resp', 'ch-rpt']), 2)
        r['series'] = round(min(contrast(solid(cols, 'ser-%d' % i), solid(cols, 'surface')) for i in range(1, 7)), 2)
        r['cvd_chart'] = mind(cols, ['ch-req', 'ch-resp', 'ch-rpt'])
        r['cvd_kinds'] = mind(cols, ['k-req', 'k-resp', 'k-err', 'k-rpt'])
        r['cvd_status'] = mind(cols, ['ok', 'warn', 'err', 'info'])
        r['cvd_ser_solid'] = mind(cols, ['ser-1', 'ser-2', 'ser-3'])
        r['cvd_ser_dash'] = mind(cols, ['ser-4', 'ser-5', 'ser-6'])
        r['cvd_ser_all'] = mind(cols, ['ser-%d' % i for i in range(1, 7)])
        r['tints_normal'] = mind(cols, TINT, sims=('normal',))
        r['cvd_tints'] = mind(cols, TINT)
        r['tint_vs_sel'] = mind(cols, TINT + ['sel-bg'], sims=('normal',))
        out[theme] = r
    return out


if __name__ == '__main__':
    res = {'current': summary(open(os.path.join(D, 'current_tokens.css')).read())}
    for k in 'ABCDE':
        res[k] = summary(open(os.path.join(D, k + '.css')).read())
    json.dump(res, open(os.path.join(RROOT, 'out', 'token_summary.json'), 'w'), ensure_ascii=False, indent=1)
    cols = ['text', 'status_text', 'focus', 'chart', 'series', 'cvd_chart', 'cvd_kinds', 'cvd_status', 'cvd_ser_solid', 'cvd_ser_dash', 'cvd_ser_all', 'tints_normal', 'cvd_tints', 'tint_vs_sel']
    print('| | ' + ' | '.join(cols) + ' |')
    for k, v in res.items():
        for t in ('light', 'dark'):
            r = v[t]
            print('| %s %s | ' % (k, t) + ' | '.join(str(r[c][0]) if isinstance(r[c], tuple) or isinstance(r[c], list) else str(r[c]) for c in cols) + ' |')
