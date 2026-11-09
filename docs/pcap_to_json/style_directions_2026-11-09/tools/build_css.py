"""Generate directions/<X>.css = tokens (light + dark) + components; also jobs json for rendering.
usage: python3 -I build_css.py [A B ...]
"""
import json
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from palettes import palette

SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 渲染工作目錄（見 setup_render_root.sh）；預設是 tools/ 上一層的 render/
RROOT = os.environ.get('STYLE_RENDER_ROOT') or os.path.join(SP, 'render')
R = RROOT
D = os.path.join(R, 'directions')

CJK_SANS = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif'
CJK_MONO = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", ui-monospace, monospace'
CJK_SERIF = '"Noto Serif TC", "PingFang TC", "Microsoft JhengHei", serif'

CFG = {
 'A': dict(
    name='A 控制室（ISA-101 高效能 HMI）',
    fonts={'--sans': '"B612", ' + CJK_SANS, '--mono': '"Red Hat Mono", ' + CJK_MONO},
    fontcss=['b612/400.css', 'b612/700.css', 'red-hat-mono/400.css', 'red-hat-mono/500.css', 'red-hat-mono/700.css'],
    layout={'--font-ui': '14px', '--font-dense': '13px', '--row-h': '30px',
            '--h-top': '44px', '--h-filter': '40px', '--h-ov': '110px', '--h-ovmini': '28px', '--h-status': '32px', '--h-bottom': '300px',
            '--h-ctl': '28px', '--h-ctl-sm': '24px', '--h-chip': '22px', '--h-node': '26px', '--h-hist': '54px',
            '--w-tree': '16%', '--w-tree-min': '200px', '--w-detail': '34%', '--w-detail-min': '340px',
            '--r': '3px', '--r-sm': '2px', '--r-lg': '4px', '--u': '4px', '--kind-bar': '4px', '--font-chrome': '13px', '--font-small': '12px'},
    extra={'light': {'--shadow-pop': '0 2px 0 #0000001f'}, 'dark': {'--shadow-pop': '0 2px 0 #00000066'}},
    dense={'--row-h': '24px', '--font-dense': '12.5px'},
 ),
 'B': dict(
    name='B 高密度分析工作站（IDE / Wireshark 感）',
    fonts={'--sans': '"Iosevka Aile", ' + CJK_SANS, '--mono': '"Iosevka", ' + CJK_MONO},
    fontcss=['iosevka-aile/400.css', 'iosevka-aile/500.css', 'iosevka-aile/600.css', 'iosevka-aile/700.css',
             'iosevka/400.css', 'iosevka/500.css', 'iosevka/600.css', 'iosevka/700.css'],
    layout={'--font-ui': '12.5px', '--font-dense': '12.5px', '--row-h': '22px',
            '--h-top': '34px', '--h-filter': '32px', '--h-ov': '86px', '--h-ovmini': '22px', '--h-status': '26px', '--h-bottom': '280px',
            '--h-ctl': '24px', '--h-ctl-sm': '20px', '--h-chip': '18px', '--h-node': '20px', '--h-hist': '44px',
            '--w-tree': '14%', '--w-tree-min': '180px', '--w-detail': '30%', '--w-detail-min': '320px',
            '--r': '2px', '--r-sm': '2px', '--r-lg': '3px', '--u': '3px', '--kind-bar': '2px', '--font-chrome': '12px', '--font-small': '11.5px'},
    extra={'light': {'--shadow-pop': '0 4px 14px #0000002e'}, 'dark': {'--shadow-pop': '0 4px 14px #00000080'}},
    dense={'--row-h': '18px', '--font-dense': '12px'},
    pre="(() => { const c = '52px 100px 92px 236px 40px 96px 260px 150px'; document.querySelectorAll('.vlist .hdr, .vlist .row').forEach(e => e.style.gridTemplateColumns = c); document.querySelectorAll('.vlist .hdr, .vlist .body').forEach(e => e.style.width = '1026px'); })()",
 ),
 'C': dict(
    name='C 技術報告（文件感，淺色優先）',
    pre="(() => { const c = '64px 124px 118px 320px 56px 104px 220px 150px'; document.querySelectorAll('.vlist .hdr, .vlist .row').forEach(e => e.style.gridTemplateColumns = c); document.querySelectorAll('.vlist .hdr, .vlist .body').forEach(e => e.style.width = '1156px'); })()",
    fonts={'--sans': '"Source Sans 3", ' + CJK_SANS, '--mono': '"Source Code Pro", ' + CJK_MONO, '--serif': '"Source Serif 4", ' + CJK_SERIF},
    fontcss=['source-sans-3/400.css', 'source-sans-3/600.css', 'source-sans-3/700.css', 'source-code-pro/400.css', 'source-code-pro/500.css',
             'source-code-pro/600.css', 'source-serif-4/600.css', 'source-serif-4/700.css'],
    fontcss_cjk=['noto-serif-tc/700.css'],
    layout={'--font-ui': '14px', '--font-dense': '13.5px', '--row-h': '30px',
            '--h-top': '48px', '--h-filter': '40px', '--h-ov': '108px', '--h-ovmini': '28px', '--h-status': '32px', '--h-bottom': '320px',
            '--h-ctl': '28px', '--h-ctl-sm': '24px', '--h-chip': '22px', '--h-node': '26px', '--h-hist': '52px',
            '--w-tree': '16%', '--w-tree-min': '200px', '--w-detail': '36%', '--w-detail-min': '360px',
            '--r': '3px', '--r-sm': '2px', '--r-lg': '4px', '--u': '4px', '--kind-bar': '0px', '--font-chrome': '13.5px', '--font-small': '12.5px'},
    extra={'light': {'--shadow-pop': '0 1px 0 #00000014, 0 6px 18px #0000001f'}, 'dark': {'--shadow-pop': '0 1px 0 #0000004d, 0 6px 18px #00000066'}},
    dense={'--row-h': '24px', '--font-dense': '13px'},
 ),
 'D': dict(
    name='D 現代產品感',
    pre="(() => { const c = '64px 124px 118px 320px 56px 104px 220px 150px'; document.querySelectorAll('.vlist .hdr, .vlist .row').forEach(e => e.style.gridTemplateColumns = c); document.querySelectorAll('.vlist .hdr, .vlist .body').forEach(e => e.style.width = '1156px'); })()",
    fonts={'--sans': '"Inter", ' + CJK_SANS, '--mono': '"Geist Mono", ' + CJK_MONO},
    fontcss=['inter/400.css', 'inter/500.css', 'inter/600.css', 'inter/700.css', 'geist-mono/400.css', 'geist-mono/500.css', 'geist-mono/600.css'],
    layout={'--font-ui': '13.5px', '--font-dense': '13px', '--row-h': '30px',
            '--h-top': '46px', '--h-filter': '42px', '--h-ov': '100px', '--h-ovmini': '30px', '--h-status': '38px', '--h-bottom': '300px',
            '--h-ctl': '30px', '--h-ctl-sm': '26px', '--h-chip': '22px', '--h-node': '28px', '--h-hist': '50px',
            '--w-tree': '17%', '--w-tree-min': '200px', '--w-detail': '33%', '--w-detail-min': '340px',
            '--r': '8px', '--r-sm': '6px', '--r-lg': '12px', '--u': '4px', '--kind-bar': '3px', '--font-chrome': '13px', '--font-small': '12px'},
    extra={'light': {'--shadow-xs': '0 1px 2px #1018280d', '--shadow-card': '0 1px 2px #1018280f, 0 1px 3px #1018281a',
                     '--shadow-pop': '0 4px 6px -2px #10182808, 0 12px 16px -4px #10182814'},
           'dark': {'--shadow-xs': '0 1px 2px #00000066', '--shadow-card': '0 0 0 1px #ffffff0d, 0 1px 3px #00000080',
                    '--shadow-pop': '0 0 0 1px #ffffff14, 0 12px 24px #000000b3'}},
    dense={'--row-h': '24px', '--font-dense': '12.5px'},
 ),
 'E': dict(
    name='E 高對比（戶外 / 投影 / 低視力）',
    pre="(() => { const c = '64px 124px 118px 320px 56px 104px 220px 150px'; document.querySelectorAll('.vlist .hdr, .vlist .row').forEach(e => e.style.gridTemplateColumns = c); document.querySelectorAll('.vlist .hdr, .vlist .body').forEach(e => e.style.width = '1156px'); })()",
    fonts={'--sans': '"Atkinson Hyperlegible Next", ' + CJK_SANS, '--mono': '"Atkinson Hyperlegible Mono", ' + CJK_MONO},
    fontcss=['atkinson-hyperlegible-next/400.css', 'atkinson-hyperlegible-next/600.css', 'atkinson-hyperlegible-next/700.css', 'atkinson-hyperlegible-next/800.css',
             'atkinson-hyperlegible-mono/400.css', 'atkinson-hyperlegible-mono/600.css', 'atkinson-hyperlegible-mono/700.css', 'atkinson-hyperlegible-mono/800.css'],
    layout={'--font-ui': '15px', '--font-dense': '14px', '--row-h': '36px',
            '--h-top': '52px', '--h-filter': '48px', '--h-ov': '124px', '--h-ovmini': '36px', '--h-status': '44px', '--h-bottom': '320px',
            '--h-ctl': '36px', '--h-ctl-sm': '32px', '--h-chip': '26px', '--h-node': '32px', '--h-hist': '58px',
            '--w-tree': '18%', '--w-tree-min': '210px', '--w-detail': '34%', '--w-detail-min': '360px',
            '--r': '4px', '--r-sm': '3px', '--r-lg': '6px', '--u': '4px', '--kind-bar': '6px', '--font-chrome': '14px', '--font-small': '13px'},
    extra={'light': {'--focus-halo': '#ffffff', '--shadow-pop': '0 0 0 2px #000000'},
           'dark': {'--focus-halo': '#000000', '--shadow-pop': '0 0 0 2px #ffffff'}},
    dense={'--row-h': '30px', '--font-dense': '13.5px'},
 ),
 'F': dict(
    name='F 定稿：方案 1 × D，淺色用 A 的灰',
    fonts={'--sans': '"Inter", ' + CJK_SANS, '--mono': '"Geist Mono", ' + CJK_MONO},
    fontcss=['inter/400.css', 'inter/500.css', 'inter/600.css', 'inter/700.css', 'geist-mono/400.css', 'geist-mono/500.css', 'geist-mono/600.css'],
    layout={'--font-ui': '13.5px', '--font-dense': '13px', '--row-h': '30px',
            '--h-top': '40px', '--h-filter': '42px', '--h-ov': '100px', '--h-ovmini': '30px', '--h-status': '38px', '--h-bottom': '300px',
            '--h-ctl': '30px', '--h-ctl-sm': '26px', '--h-chip': '22px', '--h-node': '28px', '--h-hist': '50px',
            '--w-tree': '17%', '--w-tree-min': '200px', '--w-detail': '33%', '--w-detail-min': '340px',
            '--r': '8px', '--r-sm': '6px', '--r-lg': '12px', '--u': '4px', '--kind-bar': '3px', '--font-chrome': '13px', '--font-small': '12px'},
    extra={'light': {'--shadow-xs': '0 1px 2px #10182814', '--shadow-card': '0 1px 2px #1018281a, 0 1px 3px #10182824',
                     '--shadow-pop': '0 4px 6px -2px #1018280f, 0 12px 20px -4px #1018282e'},
           'dark': {'--shadow-xs': '0 1px 2px #00000066', '--shadow-card': '0 0 0 1px #ffffff0d, 0 1px 3px #00000080',
                    '--shadow-pop': '0 0 0 1px #ffffff14, 0 12px 24px #000000b3'}},
    dense={'--row-h': '24px', '--font-dense': '12.5px'},
    pre="(() => { const c = '64px 124px 118px 320px 56px 104px 220px 150px'; document.querySelectorAll('.vlist .hdr, .vlist .row').forEach(e => e.style.gridTemplateColumns = c); document.querySelectorAll('.vlist .hdr, .vlist .body').forEach(e => e.style.width = '1156px'); })()",
 ),
}

ORDER = [
 ('表面', ['bg', 'topbar', 'panel', 'surface', 'surface2', 'input', 'border', 'bsoft', 'hover', 'nav-hover', 'nav-active']),
 ('文字', ['text', 'muted', 'dim', 'faint']),
 ('強調 / 焦點', ['accent', 'accent-solid', 'accent-ink', 'focus']),
 ('狀態', ['ok', 'warn', 'err', 'info', 'vio']),
 ('圖表', ['ch-req', 'ch-resp', 'ch-rpt', 'ch-ghost', 'ser-1', 'ser-2', 'ser-3', 'ser-4', 'ser-5', 'ser-6']),
 ('新增：紀錄種類', ['k-req', 'k-resp', 'k-err', 'k-rpt']),
 ('新增：列底色', ['ctl-bg', 'rule-info', 'rule-ok', 'rule-warn', 'rule-err', 'rule-vio', 'rule-accent', 'sel-bg', 'sel-edge', 'changed']),
 ('新增：方向專用', ['alarm', 'alarm-ink', 'caution', 'caution-ink']),
]


def block(sel, pal, cfg, theme):
    lines = [sel + ' {']
    if theme == 'light':
        lines.append('  /* 字型 */')
        for k, v in cfg['fonts'].items():
            lines.append('  %s: %s;' % (k, v))
        lines.append('  /* 尺寸與版面（深淺共用） */')
        lay = list(cfg['layout'].items())
        for i in range(0, len(lay), 4):
            lines.append('  ' + ' '.join('%s: %s;' % kv for kv in lay[i:i + 4]))
    for title, names in ORDER:
        names = [n for n in names if n in pal]
        if not names:
            continue
        lines.append('  /* %s */' % title)
        for i in range(0, len(names), 4):
            lines.append('  ' + ' '.join('--%s: %s;' % (n, pal[n]) for n in names[i:i + 4]))
    for k, v in cfg.get('extra', {}).get(theme, {}).items():
        lines.append('  %s: %s;' % (k, v))
    lines.append('}')
    return '\n'.join(lines)


def build(key):
    cfg = CFG[key]
    pal = palette(key)
    comp = open(os.path.join(D, 'src', key + '.components.css'), encoding='utf-8').read()
    css = ['/* %s — 由 tools/build_css.py 產生；元件樣式在 src/%s.components.css */' % (cfg['name'], key),
           block(':root', pal['light'], cfg, 'light'),
           block(':root[data-theme="dark"]', pal['dark'], cfg, 'dark')]
    if cfg.get('dense'):
        css.append('.app[data-density=dense] { ' + ' '.join('%s: %s;' % kv for kv in cfg['dense'].items()) + ' }')
    css.append(comp)
    out = os.path.join(D, key + '.css')
    open(out, 'w', encoding='utf-8').write('\n'.join(css) + '\n')
    return out


def css_list(key):
    cfg = CFG[key]
    base = ['noto-sans-tc/400.css', 'noto-sans-tc/500.css', 'noto-sans-tc/700.css'] + cfg.get('fontcss_cjk', [])
    return ['fontsource/' + f for f in base + cfg['fontcss']] + ['directions/_v2_layer.css', 'directions/_v2_fixes.css', 'directions/%s.css' % key]


if __name__ == '__main__':
    keys = sys.argv[1:] or list(CFG)
    for k in keys:
        print(build(k))
