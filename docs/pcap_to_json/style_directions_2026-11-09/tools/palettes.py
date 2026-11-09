"""Palette definitions (OKLCH) for the five directions -> hex token values.

Chromatic tokens are given as (L_target, C, h, role); the lightness is then pushed just far enough
from the backgrounds to meet the role's contrast floor:
  text   >= T (4.5, E: 7) against every surface, tint and selection
  stext  >= T against the list/panel surfaces (status / kind colours used as text)
  gfx    >= 3 against --surface (chart bars, series lines, kind bars)
  focus  >= 3 against bg / topbar / panel / surface / input / sel-bg
  free   no constraint (fills, tints)
Run: python3 -I palettes.py [A B C D E]
"""
import sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from ok import hx, oklch, cr, table, dist
from colorcheck import contrast, hex2rgba, to_hex


def N(L, C=0.0, h=250):
    return hx(L, C, h)


SURF = ['bg', 'topbar', 'panel', 'surface', 'surface2', 'input', 'hover', 'nav-hover', 'nav-active', 'sel-bg']
LISTSURF = ['surface', 'panel', 'surface2', 'bg', 'topbar', 'hover', 'sel-bg']
TINT = ['rule-info', 'rule-ok', 'rule-warn', 'rule-err', 'rule-vio', 'rule-accent']


def push(Lt, C, h, bgs, thr, dark_theme):
    """Move L from the target away from the backgrounds until contrast >= thr with all of them."""
    bgs = [hex2rgba(b) for b in bgs]
    step = 0.0025
    L = Lt
    for _ in range(400):
        c = oklch(L, C, h)
        if all(contrast(c, b) >= thr for b in bgs):
            return to_hex(c)
        L = L + step if dark_theme else L - step
        if not 0 <= L <= 1:
            break
    return to_hex(oklch(max(0, min(1, L)), C, h))


def build(spec, dark_theme, T=4.5):
    """spec: name -> hex | float (neutral L) | (L, C, h) | (L, C, h, role)"""
    nh, nc = spec.pop('_neutral', (250, 0.0))
    out = {}
    # pass 1: neutrals / fills
    for k, v in spec.items():
        if isinstance(v, str):
            out[k] = v
        elif isinstance(v, (int, float)):
            out[k] = N(v, nc, nh)
        elif len(v) == 3:
            out[k] = hx(*v)
    # pass 2: role-constrained colours
    for k, v in spec.items():
        if isinstance(v, tuple) and len(v) == 4:
            L, C, h, role = v
            if role == 'text':
                bgs = [out[b] for b in SURF + TINT + ['ctl-bg', 'changed'] if b in out]
                out[k] = push(L, C, h, bgs, T, dark_theme)
            elif role == 'stext':
                bgs = [out[b] for b in LISTSURF if b in out]
                out[k] = push(L, C, h, bgs, T, dark_theme)
            elif role == 'gfx':
                out[k] = push(L, C, h, [out['surface']], 3.0, dark_theme)
            elif role == 'focus':
                bgs = [out[b] for b in ['bg', 'topbar', 'panel', 'surface', 'input', 'sel-bg']]
                out[k] = push(L, C, h, bgs, 3.0, dark_theme)
            else:
                out[k] = hx(L, C, h)
    return out


SPECS = {}

# ---------------------------------------------------------------- A 控制室 (ISA-101)
SPECS['A'] = {
 'light': {'_neutral': (250, .006),
    'bg': .875, 'topbar': .835, 'panel': .855, 'surface': .93, 'surface2': .885, 'input': (.97, .003, 250),
    'border': .64, 'bsoft': .82, 'hover': .895, 'nav-hover': .865, 'ch-ghost': .80,
    'nav-active': (.83, .028, 250), 'sel-bg': (.815, .012, 250), 'sel-edge': (.28, .02, 250),
    'ctl-bg': (.905, .03, 200), 'changed': (.87, .10, 85),
    'rule-info': (.91, .04, 215), 'rule-ok': (.925, .055, 145), 'rule-warn': (.945, .075, 95),
    'rule-err': (.875, .05, 20), 'rule-vio': (.87, .045, 310), 'rule-accent': (.865, .05, 255),
    'text': (.21, .008, 250, 'text'), 'muted': (.37, .01, 250, 'text'), 'dim': (.42, .012, 250, 'text'), 'faint': (.52, .012, 250, 'gfx'),
    'accent': (.46, .10, 252, 'stext'), 'accent-solid': (.42, .10, 252), 'accent-ink': '#ffffff',
    'ok': (.46, .06, 150, 'stext'), 'warn': (.53, .11, 78, 'stext'), 'err': (.40, .17, 20, 'stext'),
    'info': (.47, .06, 222, 'stext'), 'vio': (.46, .08, 312, 'stext'),
    'focus': (.52, .21, 262, 'focus'),
    'k-req': (.40, .07, 250, 'stext'), 'k-resp': (.50, .06, 190, 'stext'), 'k-err': (.40, .17, 20, 'stext'), 'k-rpt': (.46, .085, 335, 'stext'),
    'ch-req': (.40, .07, 250, 'gfx'), 'ch-resp': (.64, .07, 190, 'gfx'), 'ch-rpt': (.52, .09, 335, 'gfx'),
    'ser-1': (.45, .13, 255, 'gfx'), 'ser-2': (.60, .13, 55, 'gfx'), 'ser-3': (.56, .10, 185, 'gfx'),
    'ser-4': (.45, .13, 305, 'gfx'), 'ser-5': (.38, .01, 250, 'gfx'), 'ser-6': (.56, .16, 350, 'gfx'),
    'alarm': (.53, .20, 27), 'alarm-ink': '#ffffff', 'caution': (.83, .16, 85), 'caution-ink': (.18, .01, 250)},
 'dark': {'_neutral': (250, .006),
    'bg': .245, 'topbar': .29, 'panel': .275, 'surface': .265, 'surface2': .315, 'input': .215,
    'border': .47, 'bsoft': .335, 'hover': .31, 'nav-hover': .30, 'ch-ghost': .385,
    'nav-active': (.355, .03, 250), 'sel-bg': (.40, .012, 250), 'sel-edge': (.88, .015, 250),
    'ctl-bg': (.31, .03, 200), 'changed': (.40, .08, 82),
    'rule-info': (.33, .045, 215), 'rule-ok': (.335, .05, 145), 'rule-warn': (.35, .055, 95),
    'rule-err': (.32, .055, 20), 'rule-vio': (.315, .05, 310), 'rule-accent': (.325, .055, 255),
    'text': (.91, .006, 250, 'text'), 'muted': (.81, .008, 250, 'text'), 'dim': (.77, .01, 250, 'text'), 'faint': (.64, .01, 250, 'gfx'),
    'accent': (.77, .09, 250, 'stext'), 'accent-solid': (.55, .12, 252), 'accent-ink': '#ffffff',
    'ok': (.79, .07, 150, 'stext'), 'warn': (.85, .13, 82, 'stext'), 'err': (.75, .16, 25, 'stext'),
    'info': (.80, .06, 222, 'stext'), 'vio': (.79, .08, 312, 'stext'),
    'focus': (.80, .14, 250, 'focus'),
    'k-req': (.74, .07, 250, 'stext'), 'k-resp': (.83, .06, 190, 'stext'), 'k-err': (.75, .16, 25, 'stext'), 'k-rpt': (.79, .085, 335, 'stext'),
    'ch-req': (.60, .075, 250, 'gfx'), 'ch-resp': (.83, .07, 190, 'gfx'), 'ch-rpt': (.72, .09, 335, 'gfx'),
    'ser-1': (.72, .12, 255, 'gfx'), 'ser-2': (.78, .13, 60, 'gfx'), 'ser-3': (.78, .10, 185, 'gfx'),
    'ser-4': (.72, .12, 305, 'gfx'), 'ser-5': (.86, .01, 250, 'gfx'), 'ser-6': (.75, .14, 350, 'gfx'),
    'alarm': (.57, .20, 27), 'alarm-ink': '#ffffff', 'caution': (.83, .16, 85), 'caution-ink': (.18, .01, 250)},
}


# ---------------------------------------------------------------- B 高密度分析工作站 (IDE)
SPECS['B'] = {
 'light': {'_neutral': (265, .004),
    'bg': .955, 'topbar': .975, 'panel': .955, 'surface': 1.0, 'surface2': .935, 'input': 1.0,
    'border': .84, 'bsoft': .925, 'hover': .955, 'nav-hover': .945, 'ch-ghost': .89,
    'nav-active': (.915, .03, 255), 'sel-bg': (.895, .055, 255), 'sel-edge': (.56, .16, 258),
    'ctl-bg': (.955, .05, 85), 'changed': (.90, .07, 20),
    'rule-info': (.935, .05, 230), 'rule-ok': (.94, .06, 150), 'rule-warn': (.955, .08, 98),
    'rule-err': (.915, .055, 20), 'rule-vio': (.92, .05, 315), 'rule-accent': (.925, .06, 270),
    'text': (.22, .004, 265, 'text'), 'muted': (.42, .006, 265, 'text'), 'dim': (.47, .008, 265, 'text'), 'faint': (.60, .008, 265, 'gfx'),
    'accent': (.50, .17, 258, 'stext'), 'accent-solid': (.50, .17, 258), 'accent-ink': '#ffffff',
    'ok': (.52, .13, 150, 'stext'), 'warn': (.56, .12, 70, 'stext'), 'err': (.45, .19, 25, 'stext'),
    'info': (.52, .10, 220, 'stext'), 'vio': (.50, .17, 320, 'stext'),
    'focus': (.55, .19, 258, 'focus'),
    'k-req': (.46, .15, 255, 'stext'), 'k-resp': (.56, .13, 160, 'stext'), 'k-err': (.45, .19, 25, 'stext'), 'k-rpt': (.52, .18, 335, 'stext'),
    'ch-req': (.42, .14, 255, 'gfx'), 'ch-resp': (.66, .13, 160, 'gfx'), 'ch-rpt': (.64, .17, 340, 'gfx'),
    'ser-1': (.50, .15, 258, 'gfx'), 'ser-2': (.64, .16, 55, 'gfx'), 'ser-3': (.58, .11, 180, 'gfx'),
    'ser-4': (.50, .17, 320, 'gfx'), 'ser-5': (.60, .12, 95, 'gfx'), 'ser-6': (.42, .0, 265, 'gfx')},
 'dark': {'_neutral': (265, .006),
    'bg': .185, 'topbar': .215, 'panel': .225, 'surface': .2, 'surface2': .26, 'input': .17,
    'border': .33, 'bsoft': .26, 'hover': .25, 'nav-hover': .24, 'ch-ghost': .32,
    'nav-active': (.30, .035, 255), 'sel-bg': (.32, .07, 258), 'sel-edge': (.62, .14, 258),
    'ctl-bg': (.27, .04, 80), 'changed': (.32, .07, 22),
    'rule-info': (.285, .045, 230), 'rule-ok': (.29, .05, 150), 'rule-warn': (.31, .05, 95),
    'rule-err': (.28, .055, 22), 'rule-vio': (.275, .05, 315), 'rule-accent': (.28, .055, 270),
    'text': (.90, .004, 265, 'text'), 'muted': (.76, .006, 265, 'text'), 'dim': (.72, .008, 265, 'text'), 'faint': (.55, .008, 265, 'gfx'),
    'accent': (.74, .13, 255, 'stext'), 'accent-solid': (.55, .17, 258), 'accent-ink': '#ffffff',
    'ok': (.80, .14, 150, 'stext'), 'warn': (.84, .14, 82, 'stext'), 'err': (.72, .17, 25, 'stext'),
    'info': (.80, .10, 215, 'stext'), 'vio': (.76, .14, 320, 'stext'),
    'focus': (.76, .15, 255, 'focus'),
    'k-req': (.72, .13, 250, 'stext'), 'k-resp': (.83, .14, 160, 'stext'), 'k-err': (.72, .17, 25, 'stext'), 'k-rpt': (.84, .12, 340, 'stext'),
    'ch-req': (.58, .13, 252, 'gfx'), 'ch-resp': (.82, .14, 160, 'gfx'), 'ch-rpt': (.80, .14, 340, 'gfx'),
    'ser-1': (.72, .14, 252, 'gfx'), 'ser-2': (.80, .15, 60, 'gfx'), 'ser-3': (.78, .12, 180, 'gfx'),
    'ser-4': (.72, .16, 320, 'gfx'), 'ser-5': (.88, .15, 100, 'gfx'), 'ser-6': (.84, .0, 265, 'gfx')},
}

# ---------------------------------------------------------------- C 技術報告 (document)
SPECS['C'] = {
 'light': {'_neutral': (85, .006),
    'bg': .975, 'topbar': .99, 'panel': .97, 'surface': .99, 'surface2': .955, 'input': 1.0,
    'border': .80, 'bsoft': .91, 'hover': .96, 'nav-hover': .955, 'ch-ghost': .885,
    'nav-active': (.93, .02, 250), 'sel-bg': (.935, .035, 250), 'sel-edge': (.42, .12, 255),
    'ctl-bg': (.965, .035, 75), 'changed': (.91, .06, 25),
    'rule-info': (.935, .04, 215), 'rule-ok': (.945, .05, 145), 'rule-warn': (.96, .075, 98),
    'rule-err': (.92, .045, 25), 'rule-vio': (.92, .04, 315), 'rule-accent': (.93, .045, 260),
    'text': (.19, .006, 85, 'text'), 'muted': (.38, .008, 85, 'text'), 'dim': (.44, .01, 85, 'text'), 'faint': (.58, .01, 85, 'gfx'),
    'accent': (.42, .12, 258, 'stext'), 'accent-solid': (.40, .12, 258), 'accent-ink': '#ffffff',
    'ok': (.45, .10, 150, 'stext'), 'warn': (.52, .11, 70, 'stext'), 'err': (.45, .17, 27, 'stext'),
    'info': (.47, .08, 215, 'stext'), 'vio': (.45, .13, 315, 'stext'),
    'focus': (.48, .18, 258, 'focus'),
    'k-req': (.42, .12, 255, 'stext'), 'k-resp': (.50, .10, 160, 'stext'), 'k-err': (.45, .17, 27, 'stext'), 'k-rpt': (.46, .14, 330, 'stext'),
    'ch-req': (.42, .11, 255, 'gfx'), 'ch-resp': (.64, .10, 160, 'gfx'), 'ch-rpt': (.54, .14, 330, 'gfx'),
    'ser-1': (.45, .13, 258, 'gfx'), 'ser-2': (.58, .16, 40, 'gfx'), 'ser-3': (.55, .10, 160, 'gfx'),
    'ser-4': (.45, .14, 315, 'gfx'), 'ser-5': (.62, .12, 85, 'gfx'), 'ser-6': (.25, .005, 85, 'gfx')},
 'dark': {'_neutral': (75, .008),
    'bg': .20, 'topbar': .225, 'panel': .235, 'surface': .225, 'surface2': .26, 'input': .19,
    'border': .40, 'bsoft': .29, 'hover': .26, 'nav-hover': .255, 'ch-ghost': .34,
    'nav-active': (.30, .02, 250), 'sel-bg': (.31, .035, 250), 'sel-edge': (.78, .09, 250),
    'ctl-bg': (.27, .03, 75), 'changed': (.32, .06, 25),
    'rule-info': (.29, .035, 215), 'rule-ok': (.295, .04, 145), 'rule-warn': (.31, .045, 95),
    'rule-err': (.285, .045, 25), 'rule-vio': (.28, .04, 315), 'rule-accent': (.285, .04, 260),
    'text': (.90, .018, 85, 'text'), 'muted': (.79, .015, 85, 'text'), 'dim': (.74, .012, 85, 'text'), 'faint': (.58, .01, 85, 'gfx'),
    'accent': (.78, .09, 255, 'stext'), 'accent-solid': (.55, .11, 258), 'accent-ink': '#ffffff',
    'ok': (.79, .09, 150, 'stext'), 'warn': (.83, .11, 80, 'stext'), 'err': (.74, .13, 27, 'stext'),
    'info': (.80, .07, 215, 'stext'), 'vio': (.78, .10, 315, 'stext'),
    'focus': (.80, .12, 255, 'focus'),
    'k-req': (.76, .10, 255, 'stext'), 'k-resp': (.81, .09, 160, 'stext'), 'k-err': (.74, .13, 27, 'stext'), 'k-rpt': (.78, .11, 330, 'stext'),
    'ch-req': (.58, .10, 255, 'gfx'), 'ch-resp': (.80, .09, 160, 'gfx'), 'ch-rpt': (.78, .11, 335, 'gfx'),
    'ser-1': (.72, .11, 255, 'gfx'), 'ser-2': (.76, .13, 45, 'gfx'), 'ser-3': (.76, .09, 165, 'gfx'),
    'ser-4': (.72, .11, 315, 'gfx'), 'ser-5': (.84, .11, 90, 'gfx'), 'ser-6': (.88, .01, 85, 'gfx')},
}

# ---------------------------------------------------------------- D 現代產品感 (product)
SPECS['D'] = {
 'light': {'_neutral': (270, .006),
    'bg': .965, 'topbar': 1.0, 'panel': .985, 'surface': 1.0, 'surface2': .965, 'input': 1.0,
    'border': .905, 'bsoft': .945, 'hover': .97, 'nav-hover': .962, 'ch-ghost': .915,
    'nav-active': (.945, .025, 280), 'sel-bg': (.905, .065, 280), 'sel-edge': (.56, .19, 280),
    'ctl-bg': (.965, .045, 80), 'changed': (.925, .06, 15),
    'rule-info': (.945, .045, 230), 'rule-ok': (.95, .055, 160), 'rule-warn': (.965, .075, 95),
    'rule-err': (.93, .05, 15), 'rule-vio': (.93, .05, 320), 'rule-accent': (.935, .05, 280),
    'text': (.24, .012, 270, 'text'), 'muted': (.46, .014, 270, 'text'), 'dim': (.50, .016, 270, 'text'), 'faint': (.66, .012, 270, 'gfx'),
    'accent': (.53, .19, 280, 'stext'), 'accent-solid': (.53, .19, 280), 'accent-ink': '#ffffff',
    'ok': (.56, .13, 158, 'stext'), 'warn': (.60, .13, 68, 'stext'), 'err': (.55, .20, 20, 'stext'),
    'info': (.56, .11, 235, 'stext'), 'vio': (.54, .19, 320, 'stext'),
    'focus': (.58, .19, 280, 'focus'),
    'k-req': (.53, .15, 248, 'stext'), 'k-resp': (.58, .13, 165, 'stext'), 'k-err': (.55, .20, 20, 'stext'), 'k-rpt': (.55, .20, 330, 'stext'),
    'ch-req': (.50, .15, 250, 'gfx'), 'ch-resp': (.72, .14, 165, 'gfx'), 'ch-rpt': (.66, .18, 340, 'gfx'),
    'ser-1': (.56, .17, 255, 'gfx'), 'ser-2': (.68, .17, 50, 'gfx'), 'ser-3': (.64, .12, 175, 'gfx'),
    'ser-4': (.55, .21, 305, 'gfx'), 'ser-5': (.70, .15, 90, 'gfx'), 'ser-6': (.50, .02, 270, 'gfx')},
 'dark': {'_neutral': (270, .006),
    'bg': .17, 'topbar': .195, 'panel': .225, 'surface': .205, 'surface2': .255, 'input': .185,
    'border': .30, 'bsoft': .255, 'hover': .245, 'nav-hover': .24, 'ch-ghost': .31,
    'nav-active': (.30, .05, 280), 'sel-bg': (.32, .07, 280), 'sel-edge': (.70, .15, 280),
    'ctl-bg': (.265, .04, 75), 'changed': (.31, .07, 18),
    'rule-info': (.285, .045, 230), 'rule-ok': (.29, .05, 160), 'rule-warn': (.30, .05, 95),
    'rule-err': (.28, .055, 18), 'rule-vio': (.275, .055, 320), 'rule-accent': (.28, .06, 280),
    'text': (.94, .006, 270, 'text'), 'muted': (.78, .01, 270, 'text'), 'dim': (.74, .012, 270, 'text'), 'faint': (.55, .01, 270, 'gfx'),
    'accent': (.75, .14, 280, 'stext'), 'accent-solid': (.58, .19, 280), 'accent-ink': '#ffffff',
    'ok': (.80, .14, 160, 'stext'), 'warn': (.84, .14, 80, 'stext'), 'err': (.74, .16, 20, 'stext'),
    'info': (.80, .11, 230, 'stext'), 'vio': (.76, .15, 320, 'stext'),
    'focus': (.76, .15, 280, 'focus'),
    'k-req': (.76, .13, 248, 'stext'), 'k-resp': (.82, .14, 165, 'stext'), 'k-err': (.74, .16, 20, 'stext'), 'k-rpt': (.78, .15, 335, 'stext'),
    'ch-req': (.58, .15, 250, 'gfx'), 'ch-resp': (.82, .14, 165, 'gfx'), 'ch-rpt': (.80, .15, 340, 'gfx'),
    'ser-1': (.72, .15, 255, 'gfx'), 'ser-2': (.80, .15, 55, 'gfx'), 'ser-3': (.80, .12, 175, 'gfx'),
    'ser-4': (.72, .18, 310, 'gfx'), 'ser-5': (.88, .15, 95, 'gfx'), 'ser-6': (.84, .01, 270, 'gfx')},
}

# ---------------------------------------------------------------- E 高對比 (AAA)
SPECS['E'] = {
 'light': {'_neutral': (260, .0),
    'bg': 1.0, 'topbar': 1.0, 'panel': .955, 'surface': 1.0, 'surface2': .935, 'input': 1.0,
    'border': .30, 'bsoft': .62, 'hover': .935, 'nav-hover': .935, 'ch-ghost': .82,
    'nav-active': (.90, .04, 255), 'sel-bg': (.88, .06, 255), 'sel-edge': '#000000',
    'ctl-bg': (.94, .06, 85), 'changed': (.88, .08, 20),
    'rule-info': (.90, .06, 225), 'rule-ok': (.92, .08, 145), 'rule-warn': (.95, .10, 98),
    'rule-err': (.88, .07, 22), 'rule-vio': (.87, .065, 315), 'rule-accent': (.89, .07, 265),
    'text': '#000000', 'muted': (.24, .0, 260, 'text'), 'dim': (.28, .0, 260, 'text'), 'faint': (.45, .0, 260, 'gfx'),
    'accent': (.38, .19, 262, 'stext'), 'accent-solid': (.38, .19, 262), 'accent-ink': '#ffffff',
    'ok': (.40, .12, 150, 'stext'), 'warn': (.46, .10, 85, 'stext'), 'err': (.34, .15, 18, 'stext'),
    'info': (.40, .09, 225, 'stext'), 'vio': (.38, .16, 318, 'stext'),
    'focus': (.38, .19, 262, 'focus'),
    'k-req': (.34, .16, 258, 'stext'), 'k-resp': (.42, .12, 165, 'stext'), 'k-err': (.34, .15, 18, 'stext'), 'k-rpt': (.40, .17, 335, 'stext'),
    'ch-req': (.34, .15, 258, 'gfx'), 'ch-resp': (.62, .13, 160, 'gfx'), 'ch-rpt': (.56, .18, 340, 'gfx'),
    'ser-1': (.40, .17, 260, 'gfx'), 'ser-2': (.58, .17, 45, 'gfx'), 'ser-3': (.52, .11, 175, 'gfx'),
    'ser-4': (.42, .18, 320, 'gfx'), 'ser-5': (.56, .12, 90, 'gfx'), 'ser-6': (.20, .0, 260, 'gfx')},
 'dark': {'_neutral': (260, .0),
    'bg': 0.0, 'topbar': 0.0, 'panel': .20, 'surface': 0.0, 'surface2': .24, 'input': 0.0,
    'border': .85, 'bsoft': .55, 'hover': .23, 'nav-hover': .23, 'ch-ghost': .36,
    'nav-active': (.30, .06, 255), 'sel-bg': (.31, .08, 258), 'sel-edge': '#ffffff',
    'ctl-bg': (.24, .05, 80), 'changed': (.30, .09, 22),
    'rule-info': (.26, .06, 225), 'rule-ok': (.27, .06, 145), 'rule-warn': (.29, .06, 95),
    'rule-err': (.26, .07, 22), 'rule-vio': (.25, .07, 315), 'rule-accent': (.26, .07, 265),
    'text': '#ffffff', 'muted': (.93, .0, 260, 'text'), 'dim': (.90, .0, 260, 'text'), 'faint': (.70, .0, 260, 'gfx'),
    'accent': (.82, .11, 255, 'stext'), 'accent-solid': (.82, .11, 255), 'accent-ink': '#000000',
    'ok': (.86, .14, 150, 'stext'), 'warn': (.88, .15, 90, 'stext'), 'err': (.80, .13, 25, 'stext'),
    'info': (.86, .09, 220, 'stext'), 'vio': (.84, .11, 318, 'stext'),
    'focus': (.90, .18, 95, 'focus'),
    'k-req': (.80, .11, 250, 'stext'), 'k-resp': (.88, .14, 160, 'stext'), 'k-err': (.80, .13, 25, 'stext'), 'k-rpt': (.89, .09, 335, 'stext'),
    'ch-req': (.58, .15, 252, 'gfx'), 'ch-resp': (.88, .14, 160, 'gfx'), 'ch-rpt': (.82, .14, 340, 'gfx'),
    'ser-1': (.72, .14, 252, 'gfx'), 'ser-2': (.80, .16, 55, 'gfx'), 'ser-3': (.82, .12, 180, 'gfx'),
    'ser-4': (.74, .17, 320, 'gfx'), 'ser-5': (.90, .16, 100, 'gfx'), 'ser-6': (.96, .0, 260, 'gfx')},
}

THRESH = {'A': 4.5, 'B': 4.5, 'C': 4.5, 'D': 4.5, 'E': 7.0}


def palette(key):
    return {t: build(dict(SPECS[key][t]), t == 'dark', THRESH[key]) for t in ('light', 'dark')}


def report(key):
    T = THRESH[key]
    for theme, p in palette(key).items():
        print('==', key, theme)
        bgs = [p[k] for k in SURF if k in p] + [p[k] for k in TINT + ['ctl-bg', 'changed'] if k in p]
        line = []
        for t in ['text', 'muted', 'dim']:
            line.append('%s %s %.2f' % (t, p[t], min(cr(p[t], b) for b in bgs)))
        print('  ', ' | '.join(line))
        lb = [p[k] for k in LISTSURF]
        line = []
        for t in ['accent', 'ok', 'warn', 'err', 'info', 'vio', 'k-req', 'k-resp', 'k-err', 'k-rpt']:
            line.append('%s %s %.2f' % (t, p[t], min(cr(p[t], b) for b in lb)))
        print('  ', ' | '.join(line))
        line = ['focus %s %.2f' % (p['focus'], min(cr(p['focus'], p[b]) for b in ['bg', 'topbar', 'panel', 'surface', 'input', 'sel-bg']))]
        for t in ['ch-req', 'ch-resp', 'ch-rpt'] + ['ser-%d' % i for i in range(1, 7)]:
            line.append('%s %s %.2f' % (t, p[t], cr(p[t], p['surface'])))
        print('  ', ' | '.join(line))
        for t in ['alarm', 'caution']:
            if t in p:
                print('   %s %s ink %.2f' % (t, p[t], cr(p[t], p[t + '-ink'])))
        groups = {'kinds': ['k-req', 'k-resp', 'k-err', 'k-rpt'], 'status': ['ok', 'warn', 'err', 'info'],
                  'chart': ['ch-req', 'ch-resp', 'ch-rpt'], 'ser-solid': ['ser-1', 'ser-2', 'ser-3'],
                  'ser-dash': ['ser-4', 'ser-5', 'ser-6'], 'series': ['ser-%d' % i for i in range(1, 7)],
                  'tints': TINT, 'tints+st': TINT + ['ctl-bg', 'sel-bg', 'hover']}
        for g, names in groups.items():
            w = table(names, [p[n] for n in names])
            print('   %-9s' % g, '  '.join('%s %4.1f %-22s' % (s[:3], v[0], v[1]) for s, v in w.items()))


if __name__ == '__main__':
    for k in sys.argv[1:] or SPECS.keys():
        report(k)
