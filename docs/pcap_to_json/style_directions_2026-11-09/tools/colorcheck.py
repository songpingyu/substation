"""Token checks for the style directions: WCAG contrast, CVD simulation, CIEDE2000.

usage: python3 colorcheck.py X.css [--json out.json] [--min-text 4.5]
Parses the :root{} (light) and :root[data-theme="dark"]{} blocks, resolves var()/color-mix(),
and reports contrast pairs and pairwise colour distances (normal + protan/deutan/tritan).
"""
import json
import math
import re
import sys

# ---------------------------------------------------------------- colour basics
def hex2rgba(h):
    h = h.strip().lstrip('#')
    if len(h) in (3, 4):
        h = ''.join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
    return (r, g, b, a)


def to_hex(c):
    return '#' + ''.join('%02x' % round(max(0, min(1, v)) * 255) for v in c[:3])


def over(fg, bg):
    a = fg[3]
    return tuple(fg[i] * a + bg[i] * (1 - a) for i in range(3)) + (1.0,)


def lin(v):
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


def delin(v):
    v = max(0.0, min(1.0, v))
    return 12.92 * v if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055


def lum(c):
    return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])


def contrast(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


# Machado, Oliveira & Fernandes 2009, severity 1.0 (linear RGB)
CVD = {
    'protan': [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    'deutan': [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    'tritan': [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
}


def simulate(c, kind):
    if kind == 'normal':
        return c
    m = CVD[kind]
    l = [lin(v) for v in c[:3]]
    o = [sum(m[i][j] * l[j] for j in range(3)) for i in range(3)]
    return tuple(delin(v) for v in o) + (1.0,)


def to_lab(c):
    r, g, b = (lin(v) for v in c[:3])
    x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
    y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / 1.0
    z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 216 / 24389 else (24389 / 27 * t + 16) / 116
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def de2000(c1, c2):
    L1, a1, b1 = to_lab(c1)
    L2, a2, b2 = to_lab(c2)
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2)
    Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360
    h2p = math.degrees(math.atan2(b2, a2p)) % 360
    dLp, dCp = L2 - L1, C2p - C1p
    if C1p * C2p == 0:
        dhp = 0
    elif abs(h2p - h1p) <= 180:
        dhp = h2p - h1p
    elif h2p - h1p > 180:
        dhp = h2p - h1p - 360
    else:
        dhp = h2p - h1p + 360
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp / 2))
    Lbp, Cbp = (L1 + L2) / 2, (C1p + C2p) / 2
    if C1p * C2p == 0:
        hbp = h1p + h2p
    elif abs(h1p - h2p) <= 180:
        hbp = (h1p + h2p) / 2
    elif h1p + h2p < 360:
        hbp = (h1p + h2p + 360) / 2
    else:
        hbp = (h1p + h2p - 360) / 2
    T = 1 - 0.17 * math.cos(math.radians(hbp - 30)) + 0.24 * math.cos(math.radians(2 * hbp)) + 0.32 * math.cos(math.radians(3 * hbp + 6)) - 0.20 * math.cos(math.radians(4 * hbp - 63))
    dth = 30 * math.exp(-(((hbp - 275) / 25) ** 2))
    Rc = 2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
    Sl = 1 + 0.015 * (Lbp - 50) ** 2 / math.sqrt(20 + (Lbp - 50) ** 2)
    Sc = 1 + 0.045 * Cbp
    Sh = 1 + 0.015 * Cbp * T
    Rt = -math.sin(math.radians(2 * dth)) * Rc
    return math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh))


# ---------------------------------------------------------------- CSS parsing
def blocks(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out = {}
    for sel, body in re.findall(r'(:root(?:\[data-theme="?dark"?\])?)\s*\{([^}]*)\}', css):
        key = 'dark' if 'dark' in sel else 'light'
        d = out.setdefault(key, {})
        for name, val in re.findall(r'(--[\w-]+)\s*:\s*([^;]+);?', body):
            d[name] = val.strip()
    return out


def resolve(vars_, name, depth=0):
    v = vars_[name]
    for _ in range(10):
        m = re.search(r'var\((--[\w-]+)(?:\s*,\s*([^()]*))?\)', v)
        if not m:
            break
        rep = vars_.get(m.group(1), m.group(2) or '')
        v = v[:m.start()] + rep + v[m.end():]
    return v


def parse_color(v, vars_=None):
    v = v.strip()
    if v.startswith('#'):
        return hex2rgba(v)
    if v == 'transparent':
        return (0, 0, 0, 0)
    m = re.match(r'color-mix\(in srgb,\s*(.+?)\s+(\d+(?:\.\d+)?)%\s*,\s*(.+)\)$', v)
    if m:
        a = parse_color(m.group(1))
        p = float(m.group(2)) / 100
        b = parse_color(m.group(3))
        # premultiplied mix as in CSS Color 5
        aa = a[3] * p + b[3] * (1 - p)
        if aa == 0:
            return (0, 0, 0, 0)
        rgb = tuple((a[i] * a[3] * p + b[i] * b[3] * (1 - p)) / aa for i in range(3))
        return rgb + (aa,)
    m = re.match(r'rgba?\(([^)]+)\)', v)
    if m:
        p = [float(x) for x in re.split(r'[ ,/]+', m.group(1)) if x]
        return (p[0] / 255, p[1] / 255, p[2] / 255, p[3] if len(p) > 3 else 1)
    raise ValueError('cannot parse colour: ' + v)


def palette(css_text):
    b = blocks(css_text)
    res = {}
    for theme in ('light', 'dark'):
        vars_ = dict(b.get('light', {}))
        if theme == 'dark':
            vars_.update(b.get('dark', {}))
        cols = {}
        for k in vars_:
            try:
                cols[k] = parse_color(resolve(vars_, k))
            except Exception:
                pass
        res[theme] = cols
    return res


# ---------------------------------------------------------------- checks
TEXT = ['--text', '--muted', '--dim']
SURF = ['--bg', '--topbar', '--panel', '--surface', '--surface2', '--input', '--hover', '--nav-hover', '--nav-active', '--sel-bg']
STATUS = ['--ok', '--warn', '--err', '--info', '--vio', '--accent']
KINDS = ['--k-req', '--k-resp', '--k-err', '--k-rpt']
CHART = ['--ch-req', '--ch-resp', '--ch-rpt']
SER = ['--ser-%d' % i for i in range(1, 7)]
TINTS = ['--rule-info', '--rule-ok', '--rule-warn', '--rule-err', '--rule-vio', '--rule-accent']


def solid(cols, name, base='--surface'):
    c = cols[name]
    if c[3] < 1:
        c = over(c, solid(cols, base) if base != name else (1, 1, 1, 1))
    return c


def check(css_text, min_text=4.5, min_status_text=4.5):
    pal = palette(css_text)
    report = {}
    for theme, cols in pal.items():
        r = {'contrast': {}, 'fail': [], 'distance': {}}
        surf = [s for s in SURF if s in cols]
        bgs = {s: solid(cols, s) for s in surf}
        # row tints / ctl / changed composited over list surface
        for t in TINTS + ['--ctl-bg', '--changed']:
            if t in cols:
                bgs[t] = solid(cols, t)
        def need(fg_name, targets, thr, label):
            fg = solid(cols, fg_name)
            worst = None
            for bn in targets:
                if bn not in bgs:
                    continue
                cr = contrast(fg, bgs[bn])
                r['contrast']['%s on %s' % (fg_name, bn)] = round(cr, 2)
                if worst is None or cr < worst[0]:
                    worst = (cr, bn)
                if cr < thr:
                    r['fail'].append('%s %s on %s = %.2f < %.1f' % (label, fg_name, bn, cr, thr))
            return worst
        allbg = list(bgs.keys())
        for t in TEXT:
            need(t, allbg, min_text, 'text')
        listbg = ['--surface', '--panel', '--surface2', '--bg', '--topbar', '--hover', '--sel-bg']
        for s in STATUS + [k for k in KINDS if k in cols]:
            need(s, listbg, min_status_text, 'status-as-text')
        need('--focus', ['--bg', '--topbar', '--panel', '--surface', '--input', '--sel-bg'], 3.0, 'focus')
        for c in CHART:
            need(c, ['--surface'], 3.0, 'chart')
        for c in SER:
            need(c, ['--surface'], 3.0, 'series')
        for k in KINDS:
            if k in cols:
                need(k, ['--surface', '--sel-bg', '--hover'] + TINTS, 3.0, 'kind-bar')
        # pairwise distances
        groups = {
            'kinds': [k for k in KINDS if k in cols],
            'status': ['--ok', '--warn', '--err', '--info'],
            'chart': CHART,
            'series': SER,
            'tints': [t for t in TINTS if t in cols],
            'tints+states': [t for t in TINTS + ['--ctl-bg', '--sel-bg', '--hover', '--changed'] if t in cols],
        }
        for g, names in groups.items():
            out = {}
            for sim in ('normal', 'protan', 'deutan', 'tritan'):
                cs = {n: simulate(solid(cols, n), sim) for n in names}
                best = None
                for i in range(len(names)):
                    for j in range(i + 1, len(names)):
                        d = de2000(cs[names[i]], cs[names[j]])
                        if best is None or d < best[0]:
                            best = (d, names[i], names[j])
                out[sim] = (round(best[0], 1), best[1], best[2]) if best else None
            r['distance'][g] = out
        r['solid'] = {k: to_hex(solid(cols, k)) for k in cols}
        report[theme] = r
    return report


if __name__ == '__main__':
    path = sys.argv[1]
    min_text = 4.5
    if '--min-text' in sys.argv:
        min_text = float(sys.argv[sys.argv.index('--min-text') + 1])
    css = open(path).read()
    rep = check(css, min_text=min_text, min_status_text=min_text)
    for theme, r in rep.items():
        print('==', theme)
        print(' FAIL (%d):' % len(r['fail']))
        for f in r['fail']:
            print('   ', f)
        for g, d in r['distance'].items():
            print('  %-13s' % g, '  '.join('%s %s' % (k, v[0] if v else '-') for k, v in d.items()), '  worst:', d['normal'][1:] if d['normal'] else '')
    if '--json' in sys.argv:
        json.dump(rep, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=1)
