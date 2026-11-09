"""Assemble docs/pcap_to_json/topbar_redesign_2026-11-09.md (research text comes from tb_research.md)."""
import json
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'style_directions_2026-11-09', 'tools'))
from build_css import R
from tb_mapping import ROWS, SHORTCUTS

OUT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
RESEARCH = open(os.path.join(HERE, 'tb_research.md'), encoding='utf-8').read().strip()
FB = json.load(open(os.path.join(R, 'tb', 'fbox_widths.json')))
CC = json.load(open(os.path.join(R, 'tb', 'control_counts.json')))
SH = 'shots/topbar_redesign_2026-11-09'


def fb(k):
    return ' / '.join('{:,}'.format(FB['%s@%d' % (k, w)]) for w in (1280, 1440, 1920))


doc = '''# 頂部重設計：研究與三個方案（2026-11-09）

> 📘 **REFERENCE** ｜ **日期**：2026-11-09 ｜ **用途**：使用者回饋「頂欄屬性按鈕太多很雜」。研究同類 web 工具怎麼安排頂部，重新設計頂欄＋篩選列；底部工具列順帶整理，因為有幾個功能要搬過去。
> **怎麼做的**：跟[風格第一輪](style_directions_2026-11-09.md)一樣，拿 `snapshot_main.html` 的真實 DOM，用腳本把**現有的元素搬到新位置**（不重畫、不編資料），用**現在的配色**渲染，只比版面；任何風格方向（A–E）都能套，附一張套 B 的示意。
> **沒有砍功能**：每個控制項與快捷鍵搬到哪裡見 §6；解碼面板、連線表、最近、書籤、著色規則、欄位、匯出這些彈出層的內容都不變，只換入口。

## §0 結論 / Summary

![現況與三個方案的頂部對照](%(SH)s/compare_top.png)

| | 現況 | 方案 1 兩列（推薦） | 方案 2 單列 | 方案 3 方案 1＋總覽瘦身 |
|---|---|---|---|---|
| 頂部可見控制項（有框的） | %(c0)d（%(b0)d） | %(c1)d（%(b1)d） | %(c2)d（%(b2)d） | %(c3)d（%(b3)d） |
| 表頭起點 y（1440 × 900） | 196 | 194 | 160（多 36 px） | 146（多 50 px） |
| 篩選框寬度 px（1280 / 1440 / 1920） | %(f0)s | %(f1)s | %(f2)s | %(f3)s |
| 1280 / 1920 寬折行或被切 | 無 | 無 | 無 | 無 |

**建議：先做方案 1。** 它直接解決「屬性按鈕太多」：檔名、連線、解碼、解析狀態這 4 個描述**同一個檔案**的按鈕併成一個「來源」晶片；品牌、開啟檔案、快捷鍵、主題、版本併成一個選單；篩選列只剩查詢本身，篩選框反而比現在寬 293 px。頂部從 %(c0)d 個控制項（%(b0)d 個有框）變成 %(c1)d 個（只有篩選框有框），表頭位置不變。
**要更多列再做方案 3**：上面同方案 1，把總覽帶的 18 個計數藥丸移到左欄「統計」分頁（Kibana / Datadog 的 facet 做法），總覽只留一條直方圖，表頭再上移 48 px。方案 2 省垂直空間，但篩選框比現在窄，寫長條件時吃虧，只建議當備案。

## §1 現況哪裡雜 / Diagnosis

![現況](%(SH)s/current_light.png)

- **15 個控制項、13 個有框，大小和框都一樣**：沒有主次，眼睛找不到「這頁的主角是篩選」。
- **頂欄混了五種東西**：識別（工具名）、檔案動作（開啟檔案）、**這個檔案的屬性**（檔名、2 連線、解碼 port 102 · 整段對話 · DataSet、解出 1,756 筆）、應用程式設定（快捷鍵、主題、版本）。其中「屬性」佔了 4 個按鈕，但它們描述的是同一個東西。
- **篩選列也混了三種**：查詢（套用、最近、書籤）、檢視（著色）、輸出（匯出）。
- **底部工具列也擠**：時間格式用 4 個按鈕，密集、欄位、截圖各一個，跟 3 個面板分頁排在一起。

## §2 研究：同類工具怎麼放 / Research

%(RESEARCH)s

## §3 方案 1：兩列，每列只做一件事（推薦）

| 淺色 | 深色 |
|---|---|
| ![方案 1 淺色](%(SH)s/P1_light.png) | ![方案 1 深色](%(SH)s/P1_dark.png) |

- **列 1「我在看什麼」（40 px）**：`MMS pcap 分析 ▾`（選單：開啟檔案、快捷鍵、主題、版本）｜來源晶片 `lab_brcb_report.pcap · port 102 · 整段對話 · DataSet · 2 連線 ▾`｜右側解析狀態「● 解出 1,756 筆（2,862 ms）」與「指令 Ctrl K」。除了晶片 hover 時，這一列沒有框。
- **列 2「我在問什麼」（42 px）**：`篩選 ▾`（書籤＋最近合成一個選單）｜整列寬的條件框（chip、編輯器、✓、×、框內的「套用 Enter」）｜「顯示 1,656 / 全部 1,756」。
- **底部工具列**：已選、跳到 #、`時間 本機 ▾`、`顯示 ▾`（列高、欄位、著色規則、截圖模式）｜靠右：匯出…、品質、時間序列、比對。
- 錯誤時（port 錯）：來源晶片變紅，現有的錯誤卡照舊出現在主畫面；解碼中：右側狀態改成進度。

**打開的樣子**（內容都是快照裡的真實值；解碼面板、連線表等原有彈出層不重畫，只畫新的入口）

| 來源面板 | 選單 |
|---|---|
| ![來源面板](%(SH)s/P1_open_src.png) | ![選單](%(SH)s/P1_open_app.png) |
| **篩選 ▾（書籤＋最近）** | **顯示 ▾** |
| ![篩選選單](%(SH)s/P1_open_qmenu.png) | ![顯示選單](%(SH)s/P1_open_disp.png) |

![指令面板（Ctrl+K）](%(SH)s/P1_open_pal.png)

指令面板（新增）是「收進選單也找得到」的保險：所有功能都列在裡面、可以打字找，旁邊標快捷鍵。Ctrl+K 若跟編輯器衝突，可改 Ctrl+Shift+P。

## §4 方案 2：單列指令列

| 淺色 | 深色 |
|---|---|
| ![方案 2 淺色](%(SH)s/P2_light.png) | ![方案 2 深色](%(SH)s/P2_dark.png) |

- 一列 48 px：`MMS ▾`｜來源晶片（檔名＋port＋狀態點）｜`篩選 ▾`＋條件框｜`1,656 / 1,756 列`｜指令圖示。
- 表頭上移到 y = 160（多 36 px，1440 × 900 多 1–2 列）。
- 代價：篩選框 %(f2)s px，比現在窄；條件一多，chip 要在框內橫向捲。整段對話、DataSet、連線數收進來源面板，不在畫面上。

## §5 方案 3：方案 1 ＋ 總覽改成直方圖帶、計數移到左欄

| 淺色（模型樹分頁） | 深色（模型樹分頁） |
|---|---|
| ![方案 3 淺色](%(SH)s/P3_light.png) | ![方案 3 深色](%(SH)s/P3_dark.png) |
| **淺色（統計分頁）** | **深色（統計分頁）** |
| ![方案 3 統計 淺色](%(SH)s/P3_facets_light.png) | ![方案 3 統計 深色](%(SH)s/P3_facets_dark.png) |

- 頂部兩列同方案 1；總覽帶 112 → 64 px：時間範圍、直方圖、圖例（2 × 2）、`⚠ 警告 3`（unknown 2＋型別不符 1，點了開「統計」分頁）、收合。
- 左欄樹頭變成「模型樹｜統計」分頁；「統計」是原本 18 個計數藥丸改成直排清單，每列有比例條，點了一樣加篩選（Kibana Discover 的欄位清單、Datadog 的 facet 面板都是這種放法）。
- 表頭 y = 146，比現在多 50 px；篩選框寬度同方案 1。
- 代價：kind / service 的計數平常要切到「統計」才看得到；只有警告數留在直方圖帶上。

## §6 每個功能搬到哪裡 / Mapping

| 功能 | 現在 | 方案 1 | 方案 2 | 方案 3 |
|---|---|---|---|---|
%(MAP)s

**快捷鍵**：原有的全部不變——%(KEYS)s；新增 `Ctrl+K` 指令面板。

## §7 檢查 / Checks

- 1280 × 800、1440 × 900、1920 × 1080 三種寬度，三個方案的頂欄、篩選列、工具列都不折行、沒有元素被切、檔名不被截（腳本逐一量子元素邊界與 `text-overflow`）；console 錯誤 0。
- 對比：搬動不改配色；DOM 實測最低值跟現況一樣（淺色 `#63` 連結 4.04、深色 `.fid` 3.77），這兩個是現有配色的問題，套任一風格方向就會修掉（見風格第一輪 §1.3）。新加的元件（來源晶片、選單、工具列項目）都用既有變數，沒有新的低對比組合。
- 套其他風格也成立：下面是方案 1 套風格 B（深色）。

![方案 1 套風格 B 深色](%(SH)s/P1_B_dark.png)

## §8 落地要動的地方 / Implementation

1. **頂欄**：新增 `.appbtn`（選單）、`.srcchip`（來源晶片＋來源面板）、`.ststat`（解析狀態）、`.kbtn`（指令面板入口）；拿掉 `.brand`、`.tbtn.out`、`.fname`、兩個 `.anchor` 按鈕、`.pill`、三個 `.tbtn.ib`——它們的行為搬到選單與來源面板，原本的解碼面板與連線表彈出層照用。
2. **篩選列**：`.flabel`＋「最近」＋「書籤」→ 一個 `.qmenu`（「篩選 ▾」，選單分「書籤」「最近」兩段，清單資料不變）；「套用」搬進 `.fbox` 右側（`.qapply`）；「著色」「匯出」移出。
3. **底部工具列**：`.segc` → `時間 本機 ▾`；「密集」「欄位」「截圖」→「顯示 ▾」彈出層；「匯出…」移到右側；品質 / 時間序列 / 比對靠右。
4. **指令面板**（新增）：清單＋輸入即篩＋方向鍵，項目就是 §6 的功能與快捷鍵。
5. **方案 3 另外**：`.overview` 改直方圖帶；`.ovcounts` 的內容改畫在左欄「統計」分頁（點擊行為不變）；樹頭改分頁。
6. 樣式在 [topbar_redesign_2026-11-09/topbar_v3.css](topbar_redesign_2026-11-09/topbar_v3.css)，只用 tokens 變數；版面搬動的參考實作在 `topbar_v3.js`（在快照上跑，示意用，不是正式程式）。

## §9 檔案 / Files

| 路徑 | 內容 |
|---|---|
| `%(SH)s/compare_top.png` | 現況與三個方案的頂部、底部工具列對照 |
| `%(SH)s/P{1,2,3}_{light,dark}.png` | 主畫面 1440 × 900 |
| `%(SH)s/P{1,2,3}_{1280,1920}.png` | 1280 × 800、1920 × 1080 檢查 |
| `%(SH)s/P1_open_{src,app,qmenu,disp,pal}.png`、`P1_open_src_dark.png` | 方案 1 打開的選單 / 面板 |
| `%(SH)s/P3_facets_{light,dark}.png` | 方案 3 的「統計」分頁 |
| `%(SH)s/P1_B_{light,dark}.png` | 方案 1 套風格 B |
| `topbar_redesign_2026-11-09/` | `topbar_v3.css`、`topbar_v3.js`、量測結果（`fbox_widths.json`、`control_counts.json`） |
'''

mp = '\n'.join('| %s | %s | %s | %s | %s |' % r for r in ROWS)
keys = '、'.join('`%s` %s' % k for k in SHORTCUTS if '新增' not in k[0])
vals = dict(SH=SH, RESEARCH=RESEARCH, MAP=mp, KEYS=keys,
            c0=CC['現況']['top']['controls'], b0=CC['現況']['top']['bordered'],
            c1=CC['P1']['top']['controls'], b1=CC['P1']['top']['bordered'],
            c2=CC['P2']['top']['controls'], b2=CC['P2']['top']['bordered'],
            c3=CC['P3']['top']['controls'], b3=CC['P3']['top']['bordered'],
            f0=fb('現況'), f1=fb('P1'), f2=fb('P2'), f3=fb('P3'))
open(OUT, 'w', encoding='utf-8').write(doc % vals)
print('wrote', OUT)
