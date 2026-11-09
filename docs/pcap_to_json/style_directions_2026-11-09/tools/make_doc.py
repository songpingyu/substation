"""Assemble docs/pcap_to_json/style_directions_2026-11-09.md from the generated CSS, configs and check results."""
import json
import os
import re
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_css import CFG

SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 渲染工作目錄（見 setup_render_root.sh）；預設是 tools/ 上一層的 render/
RROOT = os.environ.get('STYLE_RENDER_ROOT') or os.path.join(SP, 'render')
R = RROOT
OUT = sys.argv[1]
TOK = json.load(open(os.path.join(R, 'out', 'token_summary.json')))
AUD = json.load(open(os.path.join(R, 'out', 'audit_summary.json')))
SHOTS = 'shots/style_directions_2026-11-09'
DIR = 'style_directions_2026-11-09'


def token_blocks(key):
    css = open(os.path.join(R, 'directions', key + '.css'), encoding='utf-8').read()
    css = css.split('\n', 1)[1]  # drop header comment
    m = re.search(r'^(:root \{.*?^\}\n:root\[data-theme="dark"\] \{.*?^\}\n(?:\.app\[data-density=dense\][^\n]*\n)?)', css, re.S | re.M)
    return m.group(1).rstrip()


def L(key, name):
    return CFG[key]['layout'][name]


META = {
 'current': dict(rows=20, y=196, cols='259 / 720 / 461'),
 'A': dict(rows=21, y=194, cols='230 / 720 / 490'),
 'B': dict(rows=31, y=152, cols='202 / 806 / 432'),
 'C': dict(rows=21, y=196, cols='230 / 691 / 518'),
 'D': dict(rows=20, y=196, cols='241 / 690 / 469（卡片＋間距）'),
 'E': dict(rows=16, y=224, cols='259 / 691 / 490'),
}

FONTS = {
 'A': ('B612（Airbus × Intactile 為駕駛艙螢幕設計）＋ Red Hat Mono', 'OFL 1.1', 'latin＋latin-ext 5 個 woff2 共 79 KB'),
 'B': ('Iosevka Aile（介面）＋ Iosevka（資料），同一家族的比例 / 等寬兩版', 'OFL 1.1', '原檔 8 個 woff2 共 8.6 MB，要子集化；實測只留 Basic Latin、Latin-1、標點、箭頭、方塊符號 → 8 個共 127 KB'),
 'C': ('Source Serif 4（標題）＋ Source Sans 3（介面）＋ Source Code Pro（資料）；中文標題 Noto Serif TC', 'OFL 1.1', 'latin＋latin-ext 8 個 woff2 共 306 KB；Noto Serif TC 只給標題用，子集到標題用字'),
 'D': ('Inter（介面）＋ Geist Mono（資料）', 'OFL 1.1', 'latin＋latin-ext 7 個 woff2 共 285 KB'),
 'E': ('Atkinson Hyperlegible Next ＋ Atkinson Hyperlegible Mono（Braille Institute 為低視力讀者設計）', 'OFL 1.1', 'latin＋latin-ext 8 個 woff2 共 143 KB'),
}

TEXT = {}
TEXT['A'] = dict(
 title='A 控制室（ISA-101 高效能 HMI）',
 why=[
  '整個畫面是中性灰：淺色版的底是 `#d3d6da` 一帶的灰、不是白，深色版是炭灰、不是黑；一般資料用深灰字。沒有大片白底，長時間盯著、投影時眩光最少。',
  '顏色只留給「要處理的事」：型別不符、resolver `unknown` 這類警告變成琥珀色塊，錯誤 / 拒絕列與錯誤狀態用警報紅底白字；kind 色降成低彩度，只出現在列左邊條、kchip 和直方圖；「解出 1,756 筆」這種正常狀態不再是綠色。',
  '適合長時間監看、實驗室投影、在上萬列裡找異常——異常是畫面上唯一鮮豔的東西。不適合靠顏色快速分 request / response 的日常瀏覽（kind 色刻意調淡，要看符號和文字），也不適合直接截圖放進要彩色印刷的報告。',
  '跟現在差在：底色從白 / 藍灰改成灰階；狀態藥丸由綠變中性；總覽計數藥丸只有警告 / 錯誤會變色；選取列是深色框＋灰底，不是藍底；控制列（fc = CO）用斜紋，不是淡黃。',
 ],
 comps=[
  '`.topbar` 底線 2 px；`.tbtn` 灰底（`--surface2`）、3 px 圓角；`.tbtn.out`（開啟檔案…）淺底藍框粗體。',
  '`.pill.ok` 改中性灰字（只留小綠點）；`.pill.err`、`.decb.bad` 警報紅底白字。',
  '`.cnt.warn` 琥珀色塊並在 key 前加「⚠」；`.cnt.err` 紅底白字；`.cnt.info / .ok / .vio` 的 key 改中性灰。',
  '`.filterbar`、`.overview`、`.tree-head`、`.detail-head`、`.hdr` 都用 `--panel` 灰帶；`.hbtn`、`.clabel`、`.cnt-n`、`.counts b` 粗體。',
  '`.row.sel` 灰底＋ 2 px 深色框（`--sel-edge`）；`.row.ctl` 斜紋底（`--ctl-bg`），`.c-fc` 粗體；`.row.k-error / .k-reject` 整列淡紅、kind 粗體；kind 色條 4 px。',
  '`.detail .warn` 前加「⚠」並加粗（例：詳情「線路」的 `unknown`）；`.cmp-detail tr.changed td` 加左側深色標記。',
  '`.statusbar` 上框 2 px；`.segc button[aria-pressed=true]`、`.tbtn[aria-pressed=true]` 灰底深框。',
  'B612 Mono 試過但不用：它把 `:` `.` 排在字格左邊，`CSMSQI1.SeqA` 會看成 `CSMSQI1. SeqA`、時間變 `10: 27: 56. 832`。',
 ])
TEXT['B'] = dict(
 title='B 高密度分析工作站（IDE / Wireshark 感）',
 why=[
  '一切為了一次看更多：列高 32 → 22 px，頂部三條從 196 px 壓到 152 px，同樣 1440 × 900 可見列從 20 列變 31 列（+55%）；Iosevka 是窄的等寬字，path 欄省約 20% 寬，預設欄寬下列表直接看得到 type、value 兩欄，詳情也多看得到「備註」與「結構（decoded）」。',
  '介面也用等寬家族（Iosevka Aile / Iosevka），kind 欄像語法上色（request 藍、response 綠、report 洋紅、error 紅）；1 px 細線、2 px 圓角、沒有陰影；按鈕平時只有淡框，hover 才有底，像 IDE 工具列；模型樹有縮排導線。',
  '深色優先：中性石墨灰（不偏藍），選取是 IDE 藍；淺色版是 IDE 淺色主題，同樣密度。',
  '適合熟悉 Wireshark / IDE、長時間鍵盤操作、大量列瀏覽的人。不適合投影給不熟的人看、低視力（12.5 px 字、22 px 列），截圖貼報告時字偏小（可配合「截圖 S」）。',
  '跟現在差在：密度、字型、kind 文字上色、樹狀縮排導線、預設欄寬變窄。',
 ],
 comps=[
  '`.vlist`、`.tree`、`.detail`、`.ovcounts`、`.hist-legend`、`.statusbar`、`.counts` 改等寬字；`:focus-visible` 2 px 貼身外框。',
  '`.tbtn` 透明底＋淡框（`--bsoft`），hover 才有底；`.tbtn.ib` 無框；`.pill` 透明底、等寬字。',
  '`.fchip` 強調色 14% 底＋半透明框（像 IDE 搜尋 token）。',
  '`.overview` 86 px：`.hist-plot` 44 px、`.cnt` 18 px 高、2 px 圓角、透明底。',
  '`.row .c-kind` 依 kind 上色；`.row.sel` 1 px 強調色框；`.cell` 左右 6 px；kind 色條 2 px。',
  '`.tnode` 20 px，`.tnode.ln / .seg` 加 1 px 縮排導線；`.tree-head`、`.detail-head`、`.hdr` 用 `--topbar`。',
  '`.ftable th / td` 上下 1 px、12 px 字；`.statusbar` 26 px、`.segc button` 18 px、`kbd` 透明底細框。',
  '預設欄寬（JS）：`52px 100px 92px 236px 40px 96px 260px 150px`（現在 64 / 124 / 118 / 360 / 56 / 104 / 220 / 150）。',
 ])
TEXT['C'] = dict(
 title='C 技術報告（文件感，淺色優先）',
 why=[
  '像在讀排版好的技術文件：紙白底、黑字、細線分隔，表頭是上粗下細的三線表，沒有大色塊；標題（工具名、篩選、模型樹、#64、結構）用 Source Serif 4 / Noto Serif TC，介面 Source Sans 3，資料 Source Code Pro——同一個家族的三個成員。',
  'kind 不用左邊色條，改成 kind 欄文字套色（像印刷的套色），左邊留給選取列的 3 px 標記；總覽像報告裡的「圖 1 ＋摘要表」：直方圖坐在黑色基線上，計數是用細線隔開的表格欄。',
  '截圖貼進報告或印出來最好看（`@media print` 去掉底色、選取列只留黑邊）；詳情欄放寬到 36%，欄位表行距加大、點線分隔，讀長結構不累。深色版是暖色「夜讀」，不是為投影設計。',
  '不適合要最高密度或長時間監看的情境（列 30 px、留白多）。',
  '跟現在差在：字型、三線表、kind 改文字色、篩選框改成底線式輸入、總覽計數改表格式、詳情更寬。',
 ],
 comps=[
  '`.topbar .brand` 襯線 18 px；`.topbar` 底線是 1 px 黑線（報告頁首）；`.flabel`、`.tree-head` 標題、`.dh-id` 的 #64、`.detail h4` 用襯線。',
  '`.fbox` 去框，只留底線（填空式輸入）；`.fchip` 像文件裡的行內程式碼（淡灰底、2 px 圓角）。',
  '`.overview` 白底、底線黑；`.hist-plot` 無框、只有黑色基線；`.cnt` 無框無底，用左側細線分隔，像表格欄；`.clabel` 小一號灰字。',
  '`.hdr` 白底、下框 1.5 px 黑；`.hcell` 去掉直線；`.hbtn` 黑色粗體；`.row` kind 色條寬 0，`.row .c-kind` 依 kind 套色並加粗。',
  '`.row.sel` 淡藍底＋左側 3 px 標記；`.cell.active` 改底線；`.tnode.cur` 同樣用左側標記。',
  '`.pairing` 去底色，左側 3 px 報告色線；`.ftable th / td` 上下 5 px、點線分隔，巢狀表不畫線。',
  '`.segc button[aria-pressed=true]` 反白（黑底白字）；`.statusbar` 上框黑線。',
  '`path` 預設欄寬 360 → 320 px（JS；內容最長約 200 px），詳情放寬後 fc 欄才不會被切。',
 ])
TEXT['D'] = dict(
 title='D 現代產品感',
 why=[
  '柔和的表面層次：淡灰底上浮著三張圓角 12 px 的卡片（模型樹 / 列表 / 詳情），卡片間距 10 px，只用很淡的陰影分層，幾乎不用框線。',
  '主要動作清楚：「開啟檔案…」是唯一的實心靛藍按鈕；狀態是柔和色塊（「解出 1,756 筆」＝淡綠藥丸）；篩選列像搜尋框（圓角、灰底、聚焦變白），chip、計數、kchip 都是膠囊。',
  '密度只比現在低一點：列高 30 px（現在 32），表頭仍從 y = 196 開始，可見 20 列（同現在）；Inter 在 13.5 px 好讀，Geist Mono 數字等寬。',
  '適合新手、展示、對外場合；不適合要最大密度，或截圖要很樸素的報告（陰影和圓角在 A4 上顯得花）。',
  '跟現在差在：卡片化、實心主要按鈕、膠囊 chip / 計數、分段控制改成滑塊式、表格去掉直線。',
 ],
 comps=[
  '`.workspace` 加 10 px 內距與間距；`.treepane`、`.listwrap`、`.detail` 變卡片（12 px 圓角、`--shadow-card`、無框）。',
  '`.topbar`、`.filterbar` 白底，只用 1 px 陰影線分隔；`.tbtn` 30 px、8 px 圓角、`--shadow-xs`；`.tbtn.out` 實心 `--accent-solid`；`.tbtn.ib` 透明。',
  '`.fbox` 10 px 圓角灰底無框；`.fchip` 膠囊（強調色 14% 底、強調色字、無框）。',
  '`.overview` 與底色同色；`.hist-plot` 變小卡片；`.cnt` 20 px 膠囊、白底、`--shadow-xs`；`.cnt[aria-pressed=true]` 強調色淡底＋內框。',
  '`.hcell` 去掉直線；`.hbtn` 500 字重灰字；`.cell` 左右 10 px；`.row.sel` 靛藍淡底＋半透明內框；`.cell.active` 4 px 圓角框。',
  '`.tnode` 左右內縮 6 px、6 px 圓角，`.tnode.cur` 靛藍淡底、名稱強調色。',
  '`.kchip` 膠囊，依 kind 給 13% 淡底；`.pairing` 變成圓角說明卡；`.ftable` 去掉框線，只在列之間留細線。',
  '`.segc` 灰色軌道＋白色滑塊（`button[aria-pressed=true]`）；`.statusbar .jump` 灰底圓角；`kbd` 無框。',
  '`path` 預設欄寬 360 → 320 px（同 C）。',
 ])
TEXT['E'] = dict(
 title='E 高對比（戶外 / 投影 / 低視力）',
 why=[
  '所有文字對背景 ≥ 7:1（實際渲染量到的最低：淺色 8.9:1、深色 10.4:1；狀態 / kind 色當文字 ≥ 7.0:1）；淺色純白底黑字、深色純黑底白字，框線 2 px。',
  '焦點框 3 px ＋ 2 px 間隔＋外圈（淺色深藍、深色黃色）；按鈕 36 px、工具列按鈕 32 px、樹列 32 px、列表列 36 px，點擊範圍都 ≥ 32 px。',
  '色彩之外一定有形狀或文字：kchip 前加 → ← ▤ ✗；警告計數與詳情的警告加 ⚠；狀態藥丸加 ✓；選中的時間格式加 ●；著色規則列在 # 欄加「藍 / 綠 …」字；控制列加斜紋，fc 加底線；停用的「套用」改虛線框而不是半透明。',
  '代價：表頭起點 y = 224，比 196 低 28 px，可見列 20 → 16；換到的是 15 px 字、36 px 點擊範圍、AAA 對比。適合戶外、投影、低視力；不適合日常大量瀏覽——建議做成第三個主題，跟 A–D 任一並存。',
  '1280 寬時三條都不折行；只有直方圖圖例右邊的提示「每格 1 s · 拖曳 = 時間篩選」會用 … 截斷（不壓到旁邊的計數）。',
 ],
 comps=[
  '`:focus-visible` 3 px ＋ 2 px 間隔＋外圈 `--focus-halo`；`.fbox:focus-within` 同樣 3 px；`a`、`.link`、`.ref` 底線 2 px。',
  '`.tbtn` 2 px 框、600 字重；`.tbtn.out` 實心；`.tbtn:disabled` 改虛線框＋灰底（不再半透明）。',
  '`.pill` 2 px 框、粗體，`.dot` 換成 ✓ / … / ✗ 字；`.cnt` 2 px 框，`.cnt.warn` 加 ⚠、`.cnt.err` 加 ✗，`.cnt.static` 虛線框；`.q-pill` 2 px 框。',
  '`.treepane`、`.listwrap` 右框 2 px；`.hdr`、`.tree-head`、`.detail-head` 下框 2 px；`.hbtn` 800 字重黑字。',
  '`.row.sel` 3 px 黑（深色版白）框＋粗體；`.vlist:focus-visible .row.sel` 換成 3 px 焦點色框；kind 色條 6 px；`.cell.active` 3 px 底線。',
  '`.kchip` 2 px 框並加 kind 符號；`.detail .warn` 加 ⚠；`.segc button[aria-pressed=true]` 反白並加 ●；`kbd` 2 px 框。',
  '`.row.ctl` 斜紋＋ `.c-fc` 粗體底線；著色規則列在 `.c-row` 前加規則名稱方框。',
  '`path` 預設欄寬 360 → 320 px（同 C）。',
 ])


def layout_table():
    rows = [
     ('頂欄 / 篩選列 / 總覽帶（收合） / 工具列 / 底部分頁', lambda k: '%s / %s / %s（%s）/ %s / %s' % (L(k, '--h-top'), L(k, '--h-filter'), L(k, '--h-ov'), L(k, '--h-ovmini'), L(k, '--h-status'), L(k, '--h-bottom')), '44 / 40 / 112（28）/ 32 / 300'),
     ('表頭起點 y（1440 × 900）', lambda k: '%d%s' % (META[k]['y'], '' if META[k]['y'] <= 196 else '（+%d）' % (META[k]['y'] - 196)), '196'),
     ('三欄：樹 / 列表 / 詳情', lambda k: '%s（下限 %s）/ 其餘 / %s（下限 %s）' % (L(k, '--w-tree'), L(k, '--w-tree-min'), L(k, '--w-detail'), L(k, '--w-detail-min')), '18%（下限 200）/ 其餘 / 32%（下限 320）'),
     ('1440 寬實際 px', lambda k: META[k]['cols'], META['current']['cols']),
     ('列高（密集）/ 可見列', lambda k: '%s（%s）/ %d' % (L(k, '--row-h'), CFG[k]['dense']['--row-h'], META[k]['rows']), '32（24）/ 20'),
     ('字級：介面 / 列表 / 按鈕 / 小字', lambda k: '%s / %s / %s / %s' % (L(k, '--font-ui'), L(k, '--font-dense'), L(k, '--font-chrome'), L(k, '--font-small')), '14 / 13 / 13 / 12'),
     ('按鈕 / 小按鈕 / chip / 樹列', lambda k: '%s / %s / %s / %s' % (L(k, '--h-ctl'), L(k, '--h-ctl-sm'), L(k, '--h-chip'), L(k, '--h-node')), '30 / 24 / 22 / 26'),
     ('圓角：一般 / 小 / 浮出層', lambda k: '%s / %s / %s' % (L(k, '--r'), L(k, '--r-sm'), L(k, '--r-lg')), '6 / 4 / 10'),
     ('間距單位 / kind 色條', lambda k: '%s / %s' % (L(k, '--u'), L(k, '--kind-bar')), '4 / 3'),
    ]
    out = ['| | 現況 | ' + ' | '.join(TEXT[k]['title'].split('（')[0] for k in 'ABCDE') + ' |', '|---|---|' + '---|' * 5]
    for name, f, cur in rows:
        out.append('| %s | %s | %s |' % (name, cur, ' | '.join(f(k).replace('px', '') for k in 'ABCDE')))
    return '\n'.join(out)


def check_table():
    def g(k, t, key):
        v = TOK[k][t][key]
        return v[0] if isinstance(v, list) else v
    hdr = '| | 文字最低 | 狀態 / kind 當文字 | 焦點框 | 直方圖 | 時間序列 | 直方圖三色·色弱 ΔE | 時間序列實線組 / 虛線組·色弱 ΔE | 6 種列底色 ΔE（一般 / 色弱） | DOM 實測文字最低 |'
    out = [hdr, '|---|' + '---|' * 9]
    for k in ['current', 'A', 'B', 'C', 'D', 'E']:
        for t in ('light', 'dark'):
            name = ('現況' if k == 'current' else k) + (' 淺' if t == 'light' else ' 深')
            aid = ('base' if k == 'current' else k) + '-' + t
            out.append('| %s | %s | %s | %s | %s | %s | %s | %s / %s | %s / %s | %s |' % (
                name, g(k, t, 'text'), g(k, t, 'status_text'), g(k, t, 'focus'), g(k, t, 'chart'), g(k, t, 'series'),
                g(k, t, 'cvd_chart'), g(k, t, 'cvd_ser_solid'), g(k, t, 'cvd_ser_dash'), g(k, t, 'tints_normal'), g(k, t, 'cvd_tints'),
                AUD[aid]['min']))
    return '\n'.join(out)


doc = []
w = doc.append
w('''# pcap_to_json 工作台風格：第一輪五個方向（2026-11-09）

> 📘 **REFERENCE** ｜ **日期**：2026-11-09 ｜ **用途**：回應 [style_prompt_2026-11-09](style_prompt_2026-11-09.md) §1 的第一輪 prompt——五個淺色＋深色的風格方向（配色、字型、密度、元件樣式、排版），每個方向附主畫面、設計理由、完整變數、版面數字、元件差異。
> **怎麼做的**：不是手繪稿。每張圖都是 `snapshot_main.html`（c686fd4 的真實 DOM＋全部 CSS）套上該方向的 CSS，用 headless Chromium 1440 × 900、deviceScaleFactor 1 渲染；資料與文案全部來自快照，沒有編造。CSS、產圖與檢查腳本都在 [%s/](%s/)。
> **限制**：快照只有主畫面（附件 01 的狀態），所以這一輪只畫主畫面；其他狀態（bytes、解碼面板、比對、匯出…）留到第二輪，見 §9。
''' % (DIR, DIR))

w('''## §0 一頁看完 / Summary

![五個方向總覽：上排淺色、下排深色，最左是現況](%s/overview.png)

| 方向 | 一句話 | 適合 | 不適合 |
|---|---|---|---|
| **A 控制室** | ISA-101：灰是常態，顏色只給異常 | 長時間監看、投影、在上萬列裡找異常 | 靠顏色分 request / response 的日常瀏覽；彩色印刷報告 |
| **B 高密度工作站** | IDE / Wireshark 感，等寬為主，深色優先 | 熟 Wireshark、鍵盤操作、大量列（可見 31 列，+55%%） | 投影給外人、低視力；截圖字偏小 |
| **C 技術報告** | 排好版的技術文件，三線表、襯線標題 | 截圖貼報告、印出來、讀長結構 | 最高密度、長時間監看 |
| **D 現代產品感** | 卡片、柔和陰影、膠囊元件、實心主要按鈕 | 新手、展示、對外場合 | 最大密度；樸素的報告截圖 |
| **E 高對比** | 文字 ≥ 7:1、3 px 焦點框、≥ 32 px 點擊範圍、色彩外加形狀與文字 | 戶外、投影、低視力 | 日常大量瀏覽（可見列 16） |

**我的建議（給第二輪參考）**：主力用 **B**，把 A 的一條規則搬進來——「正常狀態不著色，只有警告 / 錯誤計數變色塊」；**E** 做成第三個主題（`data-theme="contrast"`），投影或戶外時切換。三者共用同一套變數（§1），多一個主題只是多一段 `:root[...]`。C 的 `@media print` 規則與 A / B / D / E 都相容，可以單獨拿來用。
''' % SHOTS)

w('''### 版面數字對照（px）

%s

- 頂部三條（頂欄＋篩選列＋總覽帶）合計：現況 196、A 194、B 152、C 196、D 188（＋卡片間距 8 → 表頭 196）、E 224。只有 E 比 196 低，低 28 px，換到的東西見 §6。
- **1280 寬**：五個方向的頂欄、篩選列、工具列都不折行、沒有元素被切（腳本量每個子元素是否超出、是否換到第二行；截圖 `X_1280.png`）。
''' % layout_table())

w('''## §1 五個方向共用的部分 / Shared

### 1.1 新增的變數（五個方向都定義同一組名字）

tokens.css 原有的名字全部保留、意思不變；新增的如下。`_v2_layer.css` 把 app.css 裡寫死的數字與 `color-mix()` 改成讀這些變數，**預設值就是現在的畫面**（只套這一層時，渲染結果與不套時逐像素相同，0.0000% 不同）。

| 變數 | 用途 |
|---|---|
| `--k-req` `--k-resp` `--k-err` `--k-rpt` | 紀錄種類色（列左邊條、kchip、錯誤列文字），跟狀態色 `--info/--ok/--err/--vio` 脫鉤；A 靠這個把 kind 調淡而警告維持鮮豔。 |
| `--ctl-bg` | 控制類列（fc = CO）的底色；原本是 `--warn` 12%。 |
| `--rule-info` … `--rule-accent` | 著色規則 6 種列底色（藍 / 綠 / 黃 / 紅 / 紫 / 強調色），直接給色，不再用 `color-mix` 推，才能逐一調到分得開。 |
| `--sel-bg` `--sel-edge` | 選取列的底色與框線色；原本與 `--nav-active` 共用，著色規則的「強調色」底跟選取列幾乎一樣。 |
| `--changed` | 比對裡被改過的欄位底色；原本是 `--err` 14%。 |
| `--shadow-pop` | 浮出層（popover / menu / pop）的陰影。 |
| `--h-top` `--h-filter` `--h-ov` `--h-ovmini` `--h-status` `--h-bottom` | 頂欄 / 篩選列 / 總覽帶（展開、收合）/ 工具列 / 底部分頁高度。 |
| `--h-ctl` `--h-ctl-sm` `--h-chip` `--h-node` `--h-hist` | 按鈕與篩選框、小按鈕、chip 與計數藥丸、模型樹列、直方圖繪圖區高度。 |
| `--w-tree` `--w-tree-min` `--w-detail` `--w-detail-min` | 三欄比例與下限。 |
| `--r` `--r-sm` `--r-lg` | 圓角：按鈕與輸入框 / chip 與 kchip / 浮出層。 |
| `--u` `--kind-bar` | 間距單位；列左邊 kind 色條寬。 |
| `--font-chrome` `--font-small` | 頂欄與篩選列按鈕字級；計數、chip、提示字級。 |
| `--serif`（C） | 標題用襯線字。 |
| `--alarm` `--alarm-ink` `--caution` `--caution-ink`（A） | 警報色塊（錯誤）與警示色塊（警告）的底色與字色。 |
| `--shadow-xs` `--shadow-card`（D） | 按鈕與膠囊的細陰影；卡片陰影。 |
| `--focus-halo`（E） | 焦點框外圈，讓 3 px 焦點框在任何底色上都看得到。 |

### 1.2 共用修正（`_v2_fixes.css`，跟風格無關）

- **等寬字不連字**：Iosevka、Geist Mono 預設會把 `!=` 畫成 `≠`、`==` 畫成一條長線；篩選語法與資料必須照原字顯示，所以在 `.mono`、`.cm-editor`、`.vlist` 等關掉 `calt` / `liga`。
- **hex 只在位元組之間換行**：`.hexv` 原本 `word-break: break-all`，詳情的值會把 `3d` 拆成 `3` / `d`（附件 01 就有）；改成 `word-break: normal; overflow-wrap: anywhere`。
- **直方圖疊段之間留 1 px 縫**：`.hist-svg .seg` 加底色描邊，請求 / 回應疊在一起時，色弱也看得出是兩段。
- **圖例在窄螢幕截斷**：`.hist-legend .hint.ml` 超出時用 …，不壓到右邊的計數（E 在 1280 寬才用到）。
- **著色規則的文字標記**：`.row.rule-*` 在 # 欄前加規則名稱（藍 / 綠 / 黃 / 紅 / 紫 / 強）。6 種淡底色在色弱模擬下彼此 ΔE 只有 0.5–1.9，光靠顏色分不開，所以五個方向都加，只是樣式不同。

### 1.3 現況檢查發現的問題（新方向都已處理）

| 問題 | 現況數字 | 方向 A–E |
|---|---|---|
| 直方圖「請求」藍與「報告」紫，綠色盲（deutan）幾乎看不出差別 | ΔE 2.0（淺）/ 1.6（深） | 6.1–18.1（拉開明度） |
| 6 種著色規則列底色彼此太像（淺色「藍」與「強調色」） | ΔE 2.9 | 8.9–12.7 |
| 時間序列線 ser-3 / 5 / 6 對白底不到 3:1 | 最低 2.17:1 | ≥ 3.0:1；4–6 號建議用虛線（uPlot `dash`） |
| 深色 `--dim`（`.fid` 欄位代號，如 `ts`、`frame`）對面板不到 4.5:1 | DOM 實測 3.77:1；對著色規則底 2.67:1 | ≥ 4.5:1（E ≥ 7:1） |
| 淺色 `#63` 連結（`.pairing` 的 `.ref`，強調色在面板上） | DOM 實測 4.04:1 | 各方向 DOM 實測全畫面最低（淺色）：A 5.7、B 4.5、C 5.5、D 4.9、E 8.9 |
| 狀態色當文字放在選取列 / hover 上（例：錯誤列被選取） | 最低 3.32:1 | ≥ 4.5:1（E ≥ 7:1） |

### 1.4 落地時要動到程式的地方（其餘只動 CSS）

1. **列高讀 `--row-h`**：虛擬列表若寫死 32 / 24，要改成讀計算後的 `--row-h`（密集切換也一樣）；「密集」按鈕的 title「列高 32 / 24 px」跟著改數字。
2. **預設欄寬**：B 用 `52 100 92 236 40 96 260 150`；C / D / E 只把 path 從 360 改 320。
3. **時間序列**：uPlot 的線色在繪圖時讀 `--ser-1..6`（換主題要重畫）；4–6 號加 `dash: [7, 4]`。
4. **直方圖**：現在就是 SVG＋class，換色不用改程式。
5. `tests/test_packge_to_json/test_webapp_tokens.py` 要把新變數加進對比門檻（§8 的表就是建議的配對）。
''')

order = 'ABCDE'
for i, k in enumerate(order, start=2):
    t = TEXT[k]
    fam, lic, size = FONTS[k]
    w('## §%d %s\n' % (i, t['title']))
    w('| 淺色 | 深色 |\n|---|---|\n| ![%s 淺色](%s/%s_light.png) | ![%s 深色](%s/%s_dark.png) |\n' % (k, SHOTS, k, k, SHOTS, k))
    w('**設計理由**\n')
    for s in t['why']:
        w('- ' + s)
    w('\n**字型**：%s（%s）。%s。中文一律後備 Noto Sans TC → PingFang TC → Microsoft JhengHei；介面字串固定，可以用 pyftsubset 只留介面用字（主畫面 241 字實測每個字重 51 KB）。\n' % (fam, lic, size))
    w('**跟現在不一樣的元件**（完整寫法在 [%s/css/%s.css](%s/css/%s.css)）\n' % (DIR, k, DIR, k))
    for s in t['comps']:
        w('- ' + s)
    w('\n**顏色的意思**（kind、狀態、直方圖、6 條時間序列線、6 種著色規則底色、選取 / 滑過 / 篩選 chip / 焦點框 / 比對被改；上半淺色、下半深色）\n')
    w('![%s 色票](%s/swatch_%s.png)\n' % (k, SHOTS, k))
    w('**完整變數**（版面變數只寫在 `:root`，深淺共用）\n')
    w('```css\n' + token_blocks(k) + '\n```\n')

w('''## §7 現況的色票（對照用）

![現況色票](%s/swatch_current.png)

## §8 驗證 / Checks

對比是 WCAG 2.x 對比比值；ΔE 是 CIEDE2000，色弱用 Machado 2009（嚴重度 1.0）模擬紅色盲、綠色盲、藍色盲，取三者中最差的一對。「DOM 實測」是把每張主畫面渲染後，逐一量畫面上每段可見文字對它實際背景（含半透明底色合成）的對比，停用的按鈕（「套用」）不算。

%s

讀法：
- 門檻：文字 ≥ 4.5（E ≥ 7）；狀態 / kind 色因為也拿來當文字（kchip、計數、`.warn`），這裡用 4.5（E 用 7）檢查，比 prompt 要求的 3:1 嚴；焦點框、直方圖、時間序列 ≥ 3。五個方向全部過；現況有 4 格不過（淺色文字、深色文字、淺色狀態當文字、淺色時間序列），DOM 實測兩個主題也都低於 4.5。
- 時間序列 6 條線不追求兩兩都分得開：1–3 號實線、4–6 號虛線，組內色弱 ΔE ≥ 7.9。
- 6 種著色規則底色是淡色，色弱下本來就分不開（0.5–1.9），所以加了 # 欄的文字標記（§1.2）。
- kind、狀態在色弱下有幾對偏近（kind 最低 1.9，E 淺色的 request / report），列表本身有符號＋文字（→ ← ▤ 與 kind 名稱），E 另在 kchip 加符號。
- console 錯誤：所有渲染 0 個。

## §9 第二輪要準備的 / For round 2

- 剩下 4 張附件（06 bytes、07 空白頁＋解碼面板、08 比對、09 匯出對話框）第二輪才用得到，屆時再給。
- 比截圖更好用的是**那些狀態的靜態快照**（跟 `snapshot_main.html` 同一個做法：DOM＋全部 CSS）：bytes 檢視、解碼面板、時間序列、品質、比對、匯出、著色規則、右鍵選單、快捷鍵、拖放提示、port 錯誤卡。有快照就能像這一輪一樣直接套 CSS 渲染真畫面，而不是照截圖重畫。`scripts/pcap_web_design_capture.py` 加幾個狀態應該就能產。
- 第二輪 prompt 照 [style_prompt_2026-11-09](style_prompt_2026-11-09.md) §2 填。

## §10 檔案 / Files

| 路徑 | 內容 |
|---|---|
| `%s/overview.png` | 總覽：現況＋五個方向，上排淺色、下排深色 |
| `%s/{A..E}_{light,dark}.png` | 主畫面 1440 × 900 |
| `%s/{A..E}_1280.png` | 1280 × 800 淺色，檢查頂欄 / 篩選列 / 工具列不折行 |
| `%s/swatch_{A..E,current}.png` | 色票（淺色在上、深色在下） |
| `%s/css/_v2_layer.css` | 共用層：寫死的數字 → 變數（預設 = 現況） |
| `%s/css/_v2_fixes.css` | 共用修正（§1.2） |
| `%s/css/{A..E}.css` | 各方向完整 CSS：`:root`、`:root[data-theme="dark"]`、元件樣式 |
| `%s/checks/` | 檢查結果：`token_summary.json`（變數配對）、`audit_summary.json`（DOM 實測）、`render_metrics.txt` |
| `%s/tools/` | 產圖與檢查腳本，見裡面的 README |
| `shots/style_input_2026-11-09/` | 這一輪的輸入：`snapshot_main.html`、`info.json` |

套用順序：app.css → `_v2_layer.css` → `_v2_fixes.css` → 方向 CSS。落地時把 v2 兩層併進 app.css、方向的兩段變數取代 tokens.css（`@media (prefers-color-scheme: dark)` 那段照深色段複製）。
''' % (SHOTS, check_table(), SHOTS, SHOTS, SHOTS, SHOTS, DIR, DIR, DIR, DIR, DIR))

open(OUT, 'w', encoding='utf-8').write('\n'.join(doc))
print('wrote', OUT, len('\n'.join(doc)))
