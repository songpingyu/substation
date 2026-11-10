"""docs/pcap_to_json/final_2026-11-09.md：定稿（方案 1 × D，淺色用 A 的灰）。"""
import json
import os
import re
import sys
HERE = os.path.dirname(os.path.abspath(__file__))
PCAP = os.path.dirname(os.path.dirname(HERE))
TOOLS = os.path.join(PCAP, 'style_directions_2026-11-09', 'tools')
sys.path.insert(0, TOOLS)
from build_css import R

OUT = sys.argv[1]
SH = 'shots/final_2026-11-09'
REF = 'shots/style_input_2026-11-09'
DIRN = 'final_2026-11-09'
AUD = json.load(open(os.path.join(R, 'final', 'audit_final.json')))
TC = json.load(open(os.path.join(R, 'final', 'token_check_F.json')))
css = open(os.path.join(R, 'directions', 'F.css'), encoding='utf-8').read().split('\n', 1)[1]
TOK = re.search(r'^(:root \{.*?^\}\n:root\[data-theme="dark"\] \{.*?^\}\n\.app\[data-density=dense\][^\n]*)', css, re.S | re.M).group(1)


def v(t, k):
    x = TC['summary'][t][k]
    return x[0] if isinstance(x, list) else x


STATES = [
 ('bytes', 'bytes 檢視', '06_detail_bytes_dark.png',
  'hex 0x000–0x17f 依參考圖逐字抄；其中 0x05a–0x0f5 這 156 bytes 由腳本比對快照裡 #64 的值，完全相同。0x000–0x015（COTP / session / presentation）灰字、選取的 TLV 標頭 `a2 81 9c` 強調、值本身淡強調，都照參考圖。TLV 樹在參考圖的可見範圍外，沒畫。'),
 ('blank', '空白頁＋解碼設定面板', '07_blank_decode_panel_light.png',
  '文字逐字照抄。方案 1 沒有獨立的「解碼」按鈕：沒載入檔案時，來源晶片顯示「尚未載入檔案 · port 102」，點了直接開原本的解碼設定面板（面板內容不變）。'),
 ('compare', '比對', '08_compare_light.png',
  '這張是另一個檔（pair_ctlval_client.pcap / pair_ctlval_ied.pcap）。頂部、計數、模型樹、列表 0–10、底部比對面板照參考圖逐字抄；直方圖從參考圖的像素量回 52 格（每格 5 ms）的筆數：第 0、24、51 格各 1 請求＋1 回應，第 25、50 格各 4＋5，加總 11 / 13 與圖例吻合。看不到的欄位（type、value、service）留空。'),
 ('export', '匯出對話框', '09_export_dialog_light.png', '文字逐字照抄。'),
 ('quality', '品質', '05_quality_light.png', '文字逐字照抄（注意原文是「只算 Write 與具名列」）。'),
 ('timeseries', '時間序列', '03_timeseries_light.png',
  '工具列與右側取樣表照參考圖（10 列真實值）。**圖表只畫了表格裡看得到的這 10 個樣本**，所以橫軸只有 1 秒；正式畫面是 uPlot 依完整 68 個樣本繪製，曲線形狀以實際為準，這張只用來看線色、格線、標記的樣式。'),
]

L = []
w = L.append
w('''# 定稿：方案 1 × 風格 D，淺色用 A 的灰（2026-11-09）

> 📘 **REFERENCE** ｜ **日期**：2026-11-09 ｜ **用途**：第二輪。使用者選了[頂部重設計](topbar_redesign_2026-11-09.md)的**方案 1**＋[風格第一輪](style_directions_2026-11-09.md)的**風格 D**（現代產品感），**淺色改用風格 A（控制室）的灰**，並補了參考圖 06–09。本文件是定稿的變數、跟現在 CSS 不一樣的地方（class 清單），以及展開到其他狀態的畫面。
> **怎麼做的**：主畫面同前兩輪，用 `snapshot_main.html` 的真實 DOM；其他狀態沒有快照，所以用 app 自己的 class 名稱照參考截圖把 DOM 重建、文字逐字照抄（每張的來源說明在 §4），再套定稿 CSS 用 headless Chromium 渲染。
> **還沒做**：著色規則、右鍵選單、快捷鍵對話框、拖放提示、port 錯誤卡——沒有參考，見 §6。

## §0 一頁看完 / Summary

| 淺色（A 的灰） | 深色（D） |
|---|---|
| ![定稿淺色](%(SH)s/F_main_light.png) | ![定稿深色](%(SH)s/F_main_dark.png) |

- **版面**＝方案 1：頂部兩列（列 1 選單＋來源晶片＋解析狀態＋指令；列 2 篩選），頂部 7 個控制項、只有篩選框有框；表頭起點 y = 190（現在 196）。
- **元件與字型**＝風格 D：三欄是浮在畫布上的卡片（12 px 圓角、淡陰影），chip / 計數 / kchip 是膠囊，Inter＋Geist Mono。
- **淺色**＝A 的灰：畫布 `#d3d6da`、卡片 `#e5e8ec`、頂部 `#c6c9cd`，文字也用 A 的深灰；D 的靛藍與語意色相保留，明度重新對灰底調過（例：強調色 `#5c55d5` → `#4a3fbd`）。**深色**＝D 原樣。
- **檢查**：變數配對 0 項不過；每個狀態渲染後逐段量文字對比，最低 %(amin).2f:1；1280 / 1440 / 1920 不折行、不截字；console 錯誤 0。

## §1 跟 D 原稿差在哪

- 淺色的表面、框線、文字全部換成 A 的灰；強調色、狀態色、kind 色、圖表色只保留 D 的色相與彩度，明度由腳本推到剛好過門檻（文字 4.5:1、圖表 3:1）。
- 篩選框在灰色列上改成淺色輸入底（`--input`）＋細框，一眼看得出是輸入框；「套用」是框內的實心小鈕，沒有東西可套用時變灰。
- 來源晶片是膠囊（半透明表面底，hover 浮起），對應 D「少框線、靠表面分層」。
- 為了對比改了兩處：bytes 檢視的強調位元組改成實心強調色＋白字（原本 3.08:1）；時間序列的 path chip 文字改用一般文字色，系列色只當框與色塊（原本 2.55:1）。

## §2 定稿變數 / Tokens

版面變數只寫在 `:root`（深淺共用）。新變數的用途同[風格第一輪 §1.1](style_directions_2026-11-09.md)，D 另有 `--shadow-xs`（按鈕、膠囊）與 `--shadow-card`（卡片）。

```css
%(TOK)s
```

![定稿色票（上淺下深）](%(SH)s/swatch_F.png)

## §3 跟目前 CSS 不一樣的地方 / Class list

套用順序：app.css → `_v2_layer.css` → `_v2_fixes.css` → `topbar_v3.css` → `F.css`。檔案在 [%(DIRN)s/css/](%(DIRN)s/css/)。

**3.1 版面變數化（`_v2_layer.css`，只套這層畫面不變）**：`.topbar` `.filterbar` `.overview` `.ovmini` `.statusbar` `.bottom` 的高度改讀 `--h-*`；`.tbtn` `.fbox` `.fchip` `.cnt` `.kchip` `.tnode` `.hist-plot` 的高度與圓角讀變數；`.workspace` 三欄讀 `--w-tree` / `--w-detail`；`.row.k-*` `.kchip.k-*` 讀 `--k-*`；`.row.ctl` 讀 `--ctl-bg`；`.row.rule-*` 讀 `--rule-*`；`.row.sel` 讀 `--sel-bg` / `--sel-edge`；`.cmp-detail tr.changed td` 讀 `--changed`；`.popover` `.menu` `.pop` 讀 `--r-lg` / `--shadow-pop`。

**3.2 共用修正（`_v2_fixes.css`）**：`.mono` `.cm-editor` `.vlist` 等關掉連字；`.hexv` 不在位元組中間斷行；`.hist-svg .seg` 疊段留 1 px 縫；`.hist-legend .hint.ml` 窄時截斷。

**3.3 頂部方案 1（`topbar_v3.css`）**
- 新增：`.qbtn`（無框屬性按鈕）、`.appbtn` / `.appbtn .logo`（選單鈕）、`.srcchip`（`.nm` 檔名、`.meta` 解碼摘要、`.st` 狀態點、`.nofile`）、`.ststat`（解析狀態）、`.kbtn`（指令面板入口）、`.qmenu`（篩選 ▾）、`.fbox .qapply`（框內套用）、`.qcount`（結果數）、`.vsep`。
- 選單與面板落地時沿用現有結構：App 選單、篩選 ▾、顯示 ▾ 用 `.menu` / `.mi` / `.mi-head` / `.mi-sep`；來源面板用 `.pop` / `.pop-h` / `.pop-b`。示意圖用的 `.demo-*` 不用落地。
- 拿掉（行為搬到選單或面板）：`.brand`、頂欄 `.tbtn.out`、`.fname`、頂欄兩個 `.anchor > .tbtn`（連線、`.decb`）、`.pill`、頂欄三個 `.tbtn.ib`、`.flabel`、篩選列的套用 / 最近 / 書籤 / 著色 / 匯出五個 `.tbtn`、工具列 `.segc`（改成「時間 ▾」）、密集 / 欄位 / 截圖三個 `.tbtn.sm`。

**3.4 風格（`F.css` 的元件段）**
- `body`：Inter（`cv11` `ss01`）。`.topbar` `.filterbar` `.statusbar`：無框，用 1 px 陰影線分隔。
- `.tbtn`：30 px、8 px 圓角、`--shadow-xs`；`.tbtn.out` 實心 `--accent-solid`（主要動作）；`.tbtn.ib` `.tbtn.ghost` 透明。
- `.fbox`：`--input` 底、細框、10 px 圓角；`.fbox .qapply` 實心小鈕，停用時灰。`.fchip`：膠囊、強調色 14%% 底、強調色字。`.srcchip`：膠囊、半透明表面底、hover 浮起。
- `.overview`：底色＝畫布；`.hist-plot` 小卡片；`.cnt` 20 px 膠囊＋`--shadow-xs`；`.cnt[aria-pressed=true]` 強調色淡底＋內框；`.cnt.static` 虛線框。
- `.workspace`：10 px 內距與間距；`.treepane` `.listwrap` `.detail` 變卡片（12 px 圓角、`--shadow-card`、無框）。
- `.tree-head` `.detail-head`：卡片表面＋細分隔；`.tnode` 內縮 6 px、6 px 圓角，`.tnode.cur` 靛藍淡底、名稱強調色。
- `.hcell` 去直線；`.hbtn` 500 字重；`.cell` 左右 10 px；`.row.sel` 靛藍淡底＋半透明內框；`.cell.active` 4 px 圓角框。
- `.kchip` 膠囊、依 kind 13%% 淡底（`.kchip.frame` 灰底）；`.pairing` 圓角說明卡；`.ftable` 去框線、列間細線。
- `.segc` 灰軌道＋白滑塊；`kbd` 無框灰底；`.row.rule-* .c-row::before` 規則名稱小圓標。
- `.hexrow .b.selh` 實心強調色＋白字；`.ts-bar .fchip` 系列色只當框與色塊。

## §4 各狀態 / States

| | 淺色 | 深色 |
|---|---|---|
| **1280 × 800**（頂欄、篩選列、工具列不折行，詳情沒被切） | ![1280 淺色](%(SH)s/F_1280_light.png) | ![1280 深色](%(SH)s/F_1280_dark.png) |
''' % dict(SH=SH, DIRN=DIRN, TOK=TOK, amin=min(x['min'] for x in AUD.values())))

for key, name, ref, note in STATES:
    w('### %s\n' % name)
    w('| 參考（現況） | 定稿淺色 | 定稿深色 |\n|---|---|---|\n| ![參考](%s/%s) | ![淺色](%s/F_%s_light.png) | ![深色](%s/F_%s_dark.png) |\n' % (REF, ref, SH, key, SH, key))
    w('- %s DOM 實測文字最低：淺色 %.2f:1、深色 %.2f:1。\n' % (note, AUD['F-%s-light' % key]['min'], AUD['F-%s-dark' % key]['min']))

w('''## §5 檢查 / Checks

| | 文字最低 | 狀態 / kind 當文字 | 焦點框 | 直方圖 | 時間序列 | 直方圖三色·色弱 ΔE | 6 種列底色 ΔE（一般） |
|---|---|---|---|---|---|---|---|
| 淺色 | %s | %s | %s | %s | %s | %s | %s |
| 深色 | %s | %s | %s | %s | %s | %s | %s |

- 門檻：文字 4.5、焦點框 / 圖表 3；變數配對 0 項不過（淺色留了 0.02 的餘量，避免轉成十六進位後剛好掉到 4.4999）。
- DOM 實測（渲染後逐段量文字對實際背景，停用控制項不算）：主畫面淺色 %.2f、深色 %.2f；各狀態見 §4。
- 1280 × 800、1440 × 900、1920 × 1080：頂欄、篩選列、工具列沒有折行、沒有元素被切、沒有字被截；所有渲染 console 錯誤 0。
- 6 種著色規則底色在色弱下仍靠 # 欄的文字標記（藍 / 綠 / 黃 / 紅 / 紫 / 強）區分，同第一輪。

## §6 還沒做的狀態 / Missing references

**著色規則、右鍵選單、快捷鍵對話框、拖放提示、port 錯誤卡**：快照裡沒有，也沒有參考截圖。這幾個畫面的文字和欄位我不想用猜的，請補這 5 張截圖（或用 `scripts/pcap_web_design_capture.py` 存成像 `snapshot_main.html` 一樣的靜態快照），我再照同樣做法展開。

## §7 落地清單 / Implementation

1. `tokens.css`：換成 §2 的兩段；`@media (prefers-color-scheme: dark)` 那段照深色段複製一份。
2. `app.css`：併入 `_v2_layer.css`（寫死的尺寸與色改讀變數）、`_v2_fixes.css`、`topbar_v3.css`、`F.css` 的元件段。
3. 頂部（方案 1）：新增選單鈕、來源晶片＋來源面板、篩選 ▾（書籤＋最近）、框內套用、顯示 ▾、指令面板（Ctrl+K）；拿掉的按鈕把行為搬過去，彈出層內容不變。每個功能的新位置見[頂部重設計 §6](topbar_redesign_2026-11-09.md)。
4. 程式：虛擬列表的列高讀 `--row-h`（30 / 密集 24），「密集」的提示字改成「列高 30 / 24 px」；path 預設欄寬 360 → 320；uPlot 線色讀 `--ser-1..6`，4–6 號虛線。
5. 測試：`tests/test_packge_to_json/test_webapp_tokens.py` 加入新變數的對比配對（`--k-*`、`--rule-*`、`--sel-bg`、`--ctl-bg`、`--changed`）。
6. 驗收照 N168 慣例：參考圖 01–09 與本文件的圖前後對照、console 0 錯、對比門檻照跑。

## §8 檔案 / Files

| 路徑 | 內容 |
|---|---|
| `%s/F_main_{light,dark}.png`、`F_1280_{light,dark}.png`、`F_1920_light.png` | 主畫面 |
| `%s/F_{bytes,blank,compare,export,quality,timeseries}_{light,dark}.png` | 各狀態 |
| `%s/swatch_F.png` | 色票 |
| `shots/final_2026-11-09/F_menu_{src,app,qmenu,disp,pal}_{light,dark}.png` | 頂部選單展開（定稿樣式，§9） |
| `%s/01_*.png` … `09_*.png` | 參考截圖（現況） |
| `%s/css/` | `F.css`（變數＋元件）、`topbar_v3.css`、`_v2_layer.css`、`_v2_fixes.css` |
| `%s/tools/` | `states.py`（照參考圖重建狀態）、`shoot_final.py`（渲染與檢查）、`shoot_final_menus.py`（頂部選單展開圖）、說明 |
| `%s/checks/` | `token_check_F.json`、`audit_final.json`、`render_log.txt` |
''' % (v('light', 'text'), v('light', 'status_text'), v('light', 'focus'), v('light', 'chart'), v('light', 'series'), v('light', 'cvd_chart'), v('light', 'tints_normal'),
       v('dark', 'text'), v('dark', 'status_text'), v('dark', 'focus'), v('dark', 'chart'), v('dark', 'series'), v('dark', 'cvd_chart'), v('dark', 'tints_normal'),
       AUD['F-main-light']['min'], AUD['F-main-dark']['min'], SH, SH, SH, REF, DIRN, DIRN, DIRN))

CANVAS_PAGES = [
    ('交接總覽', 'page-31d4f62b7494', '交接總覽、變數表、CSS 套用順序與 class 清單、功能搬家對照與快捷鍵、元件色票'),
    ('主畫面 1440', 'page-2e9cfe98992d', '目標淺 / 深；現況 01、02'),
    ('寬度 1280 / 1920', 'page-c318040d3362', '1280 淺 / 深、1920 淺'),
    ('頂部選單（方案 1）', 'page-3692d9df7020', '來源面板、App 選單、篩選 ▾、顯示 ▾、指令面板，各淺 / 深'),
    ('bytes 檢視', 'page-06e43bb52715', '目標淺 / 深；現況 06'),
    ('空白頁＋解碼面板', 'page-c8adb70cba97', '目標淺 / 深；現況 07'),
    ('比對', 'page-8d008970fb32', '目標淺 / 深；現況 08'),
    ('匯出對話框', 'page-9c360625c5e0', '目標淺 / 深；現況 09'),
    ('品質', 'page-fb278dc9b08b', '目標淺 / 深；現況 05'),
    ('時間序列', 'page-c0517a91f1d7', '目標淺 / 深；現況 03、04'),
]
MENUS = [('src', '來源面板'), ('app', 'App 選單'), ('qmenu', '篩選 ▾（書籤＋最近）'), ('disp', '顯示 ▾'), ('pal', '指令面板（Ctrl+K）')]
L.append('## §9 設計畫布 / Canvas')
L.append('')
L.append('交接用的設計畫布：<https://claude.ai/artifact/WQmPQJqUDCJxNV8vQF9Cuz>（私人；要給別人或另一個 Claude Code 工作階段看，先從畫布的 Share 分享）。'
         '第一張畫板「交接總覽」列出全部 41 張畫板的檔名與 `#artboard-…` 錨點，原始 CSS 也放在畫布附件裡。各頁的錨點（接在畫布網址後面）：')
L.append('')
L.append('| 頁面 | 錨點 | 內容 |')
L.append('|---|---|---|')
for name, anchor, what in CANVAS_PAGES:
    L.append('| %s | `#%s` | %s |' % (name, anchor, what))
L.append('')
L.append('**頂部選單（定稿樣式）**：[頂部重設計](topbar_redesign_2026-11-09.md)的展開圖是用現在的配色畫的，這裡用定稿 F 重畫（`%s/tools/shoot_final_menus.py`）；'
         '「顯示 ▾」的列高改讀 `--row-h`，所以顯示 30 / 24。' % DIRN)
L.append('')
L.append('| | 淺色 | 深色 |')
L.append('|---|---|---|')
for key, name in MENUS:
    L.append('| %s | ![%s 淺色](%s/F_menu_%s_light.png) | ![%s 深色](%s/F_menu_%s_dark.png) |' % (name, name, SH, key, name, SH, key))
L.append('')

open(OUT, 'w', encoding='utf-8').write('\n'.join(L))
print('wrote', OUT)
