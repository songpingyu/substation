"""OKLCH helpers for palette tuning."""
import math
import sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from colorcheck import contrast, hex2rgba, to_hex, lin, delin, de2000, simulate, over


def oklab_to_srgb(L, a, b):
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return r, g, bb


def srgb_to_oklab(c):
    r, g, b = (lin(v) for v in c[:3])
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = l ** (1 / 3), m ** (1 / 3), s ** (1 / 3)
    return (0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
            1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
            0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_)


def oklch(L, C, h):
    """OKLCH -> srgb tuple, chroma reduced until in gamut."""
    for _ in range(60):
        a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
        r, g, bb = oklab_to_srgb(L, a, b)
        if all(-1e-4 <= v <= 1 + 1e-4 for v in (r, g, bb)):
            return tuple(delin(v) for v in (r, g, bb)) + (1.0,)
        C *= 0.95
    return tuple(delin(max(0, min(1, v))) for v in (r, g, bb)) + (1.0,)


def hx(L, C, h):
    return to_hex(oklch(L, C, h))


def lch_of(hexs):
    L, a, b = srgb_to_oklab(hex2rgba(hexs))
    return round(L, 3), round(math.hypot(a, b), 3), round(math.degrees(math.atan2(b, a)) % 360, 1)


def fit(C, h, bgs, cr, dark_on_light=True, lo=0.05, hi=0.98):
    """Return the hex with the given chroma/hue whose contrast against every bg is >= cr,
    as close to the background as possible (lightest if dark_on_light)."""
    bgs = [hex2rgba(b) for b in bgs]
    steps = [lo + (hi - lo) * i / 400 for i in range(401)]
    cand = []
    for L in steps:
        c = oklch(L, C, h)
        if all(contrast(c, b) >= cr for b in bgs):
            cand.append((L, c))
    if not cand:
        return None
    L, c = (max(cand) if dark_on_light else min(cand))
    return to_hex(c)


def cr(a, b):
    return round(contrast(hex2rgba(a), hex2rgba(b)), 2)


def mix(fg, bg, p):
    f, b = hex2rgba(fg), hex2rgba(bg)
    return to_hex(tuple(f[i] * p + b[i] * (1 - p) for i in range(3)) + (1,))


def dist(a, b, sim='normal'):
    return round(de2000(simulate(hex2rgba(a), sim), simulate(hex2rgba(b), sim)), 1)


def table(names, cols):
    sims = ['normal', 'protan', 'deutan', 'tritan']
    worst = {s: (999, '') for s in sims}
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            for s in sims:
                d = dist(cols[i], cols[j], s)
                if d < worst[s][0]:
                    worst[s] = (d, names[i] + '/' + names[j])
    return worst
