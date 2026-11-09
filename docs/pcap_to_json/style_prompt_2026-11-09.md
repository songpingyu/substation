# pcap_to_json 工作台風格五個方向:給 Claude Design 的 prompt

> 📘 **REFERENCE** ｜ **日期**:2026-11-09 ｜ **用途**:請 Claude Design 為 `packge_to_json/webapp/`(web 分析工作台)出 **5 個淺色 + 深色的風格方向**(配色、字型、密度、元件樣式、排版);本文件是第一輪 prompt、第二輪範本與附件清單。設計稿回來後的落地另外記錄。
> **決定(2026-11-09 使用者)**:這一輪**不再以 [web_ui_style_0.1](../core/web_ui_style_0.1.md) 為設計限制**。那份 token 目前 proxy / mms_write / mms_fuzzer / pcap 四個網頁共用,選定新風格後 pcap 工作台會跟另外三個長得不一樣。prompt 只保留功能面的要求(§1「一定要守的」)。
> **上一輪**:頂部重設計(四層收成三層,列表起點 330 → 196 px)見 [topbar_inventory_2026-11-05](topbar_inventory_2026-11-05.md) §11。

## §0 怎麼用 / How to use

1. 在 Claude Design 開新專案,上傳 §3 的附件。
2. 貼 §1 的第一輪 prompt。想換方向就先改 prompt 裡的「建議的五個方向」。
3. 看完五個方向,把 §2 第二輪 prompt 的〔〕填好再貼。
4. 定稿後把設計稿連結交回來落地,照頂部重設計(N168)的慣例:截圖前後對照、console 0 錯、`tests/test_packge_to_json/test_webapp_tokens.py` 的對比門檻照跑。

## §1 第一輪 prompt / Round 1

```text
我要重新設計一個網頁工具的整體視覺風格。請給我 5 個風格明顯不同的方向，每個方向都要有淺色和深色兩版；配色、字型、密度、元件樣式和排版（窗格比例、間距、層次）都可以一起調。

## 這是什麼工具
「MMS pcap 分析」：在瀏覽器裡（完全離線）把變電站設備（IEC 61850 / MMS 協定）的封包擷取檔（.pcap）解成一列一列的紀錄來分析。使用者是做工控、變電站資安測試與驗證的工程師，熟悉 Wireshark；常一次看上千到十萬列、長時間盯著看，會截圖貼進測試報告，也會在實驗室投影給別人看。

常用流程：拖入 pcap → 用篩選語法縮小範圍 → 在列表上下移動 → 右邊看那一列的完整欄位、配對的請求 / 回應、原始 bytes → 開底部的時間序列看數值變化，或比對 proxy 錄的兩份檔。

## 目前的畫面（見附件）
由上到下：
1. 頂欄 44 px：工具名、開檔案、檔名、連線數、「解碼」設定鈕、狀態（解出幾筆或錯誤）、快捷鍵 ?、主題、版本。
2. 篩選列 40 px：篩選語法編輯器（已套用的條件以 chip 顯示在框內）、套用、最近、書籤、顯示 / 全部筆數、著色、匯出。
3. 總覽帶 112 px（可收成 28 px）：時間直方圖（請求 / 回應 / 報告三色，可拖曳選時間範圍）＋右側各類計數藥丸（kind、service、品質、配對、備註，點了就變成篩選條件）。
4. 工作區三欄：左「模型樹」（帶計數）、中間虛擬列表（#、時間、kind、path、fc、值…欄寬可調）、右「詳情」（欄位表、配對、bytes / TLV 樹、JSON）。
5. 工具列 32 px（整條視窗寬）：已選、排序、跳到 #、時間格式（本機 / UTC / 相對首筆 / 相對上一列）、密集、欄位、底部分頁鈕（品質 1 / 時間序列 3 / 比對 4）、截圖模式 S。
6. 底部分頁 300 px（開了才有）：品質、時間序列（折線圖＋取樣表）、比對；另有一個還沒啟用的「控制流程」分頁。
7. 浮出層：解碼設定面板、連線清單、最近 / 書籤選單、欄位選單、著色規則、匯出對話框、快捷鍵、版本資訊、右鍵選單、拖放提示、錯誤卡（port 錯時列出候選 port）。

## 不是限制的部分
目前的配色、字型、圓角、邊框、陰影、密度都不是限制，只是現況參考。每個方向都可以換掉全部顏色和字型、改窗格比例、改元件樣式。

## 一定要守的
1. 功能、資訊、按鈕、快捷鍵一個都不能少（上面列的都要找得到）。只改視覺與排版，不改功能。
2. 寬度 1280 / 1440 / 1920 都要能用：1280 時頂欄、篩選列、工具列不能折行。列表區（含表頭）目前從 y = 196 px 開始，盡量不要更低；某個方向刻意放寬的話，請寫出低了多少、換到什麼。
3. 可讀性：一般與次要文字對背景至少 4.5:1；狀態色、焦點框、圖表線對背景至少 3:1；淺色深色都要做到。
4. 顏色的意思要保留，而且彼此分得出來（色弱也要能分，必要時加形狀或文字）：
   - 紀錄種類：請求 / 寫入（request、write）、回應（response）、錯誤 / 拒絕（error、reject）、報告（report、report_header）；控制類的列（fc = CO）另有底色。
   - 狀態：成功、警告、錯誤、資訊。
   - 直方圖三個系列（請求 / 回應 / 報告）；時間序列最多 6 條線。
   - 著色規則：使用者可以替列上 6 種底色（目前叫藍 / 綠 / 黃 / 紅 / 紫 / 強調色），新配色也要有 6 種分得開的列底色。
   - 選取列、滑過列、篩選 chip、焦點框、比對裡被改過的欄位。
5. 機器資料（path、hex、數值、時間、ID）要對齊、好辨認（目前用等寬字）。介面文字以中文為主，英文只用在識別字；文案不用改。
6. 這是離線工具：字型要能放進專案自己帶（例如 woff2、授權允許內嵌），不能靠線上字型服務；中文要有合適的後備字型。

## 建議的五個方向（名稱和細節可以換更好的，但五個要明顯不同）
A. 控制室（參考 ISA-101 高效能人機介面）：大面積中性灰，平常的資料低調，鮮豔的顏色只留給異常（錯誤、拒絕、品質問題、被改的值）；適合長時間監看與投影。
B. 高密度分析工作站（IDE / Wireshark 感）：資訊密度最高、列高更小、等寬字為主、細分隔線、裝飾最少、鍵盤操作感強；深色優先，但淺色也要好用。
C. 技術報告（文件感、淺色優先）：像在讀排版好的技術文件，留白與層次清楚，截圖貼進報告或印出來好看；深色版是夜間閱讀。
D. 現代產品感：柔和的表面層次、少邊框多留白、適度圓角與陰影、主要動作清楚；資訊密度不能比現在低太多。
E. 高對比（戶外 / 投影 / 低視力）：文字對比 7:1 以上、粗焦點框、大一點的點擊範圍、色彩之外還有形狀或文字標記。

## 這一輪要交的
1. 一張總覽：五個方向的主畫面並排（淺色一排、深色一排），內容照截圖 01 的狀態（一個篩選條件、選了一列報告成員、詳情展開）。
2. 每個方向：
   - 主畫面 1440 × 900，淺色、深色各一張。
   - 3–5 句設計理由：適合什麼情境、不適合什麼、跟現在差在哪。
   - 完整的變數：淺色一段 `:root { … }`、深色一段 `:root[data-theme="dark"] { … }`，沿用 tokens.css 的變數名稱；需要新變數就加，並寫一句用途。
   - 版面數字：頂欄 / 篩選列 / 總覽帶 / 工具列 / 底部分頁的高度、三欄比例、列高、字級、圓角、間距單位。
   - 跟現在不一樣的元件樣式（用快照裡的 class 名稱描述，例如 `.row.sel`、`.fchip`、`.tbtn`、`.kchip`、`.pill`）。
3. 用附件裡的真實資料與文案，不要編造資料。

第二輪我會挑一到兩個方向，再請你展開到其他狀態。

## 附件
- 01_main_light.png / 02_main_dark.png：主畫面（篩選 `kind != report_header`，選了 #64 一列報告成員，它的值是結構）。
- 03_timeseries_light.png / 04_timeseries_dark.png：底部「時間序列」，兩個 path 的折線＋取樣表。
- 05_quality_light.png：底部「品質」。
- 06_detail_bytes_dark.png：詳情切到 bytes（hex dump＋TLV 樹）。
- 07_blank_decode_panel_light.png：還沒開檔的空白頁＋「解碼」設定面板。
- 08_compare_light.png：底部「比對」（proxy 錄的 client 端 / IED 端兩份檔，選了值不同的一列）。
- 09_export_dialog_light.png：匯出對話框。
- snapshot_main.html：主畫面的靜態快照，是實際執行後存下來的 DOM＋全部 CSS，沒有程式。`<html data-theme="light">` 改成 `dark` 就是深色；顏色全部是 CSS 變數，可以直接在上面改樣式。
- tokens.css：目前的顏色與字型變數（現況參考，不是限制）。
```

## §2 第二輪 prompt(挑完方向後)/ Round 2

```text
我選〔方向〕（〔要調整的地方，沒有就刪掉這句〕）。請把它展開到這些狀態，淺色深色都要：
空白頁、解碼設定面板、時間序列、品質、比對、bytes 檢視、匯出對話框、著色規則、右鍵選單、快捷鍵對話框、拖放提示、port 錯誤卡。
另外交一張 1280 × 800 的主畫面，確認頂欄、篩選列、工具列不折行、詳情欄沒有被切掉。
最後給定稿的 :root / :root[data-theme="dark"] 變數，以及跟目前 CSS 不一樣的地方的清單（用 class 名稱）。
```

## §3 附件 / Attachments

上傳這些(名稱要跟 prompt 裡的一致):

| 檔案 | 內容 |
|---|---|
| `01_main_light.png` / `02_main_dark.png` | 主畫面:篩選 `kind != report_header`、選了 #64(`CSMSQI1.SeqA` 報告成員,值是結構)、詳情展開 |
| `03_timeseries_light.png` / `04_timeseries_dark.png` | 底部「時間序列」:`CSMSQI1.SeqA` 與 `FMMXU1.Hz` 兩條線 + 取樣表 |
| `05_quality_light.png` | 底部「品質」 |
| `06_detail_bytes_dark.png` | 詳情切到 bytes(hex dump + TLV 樹) |
| `07_blank_decode_panel_light.png` | 空白頁 + 頂欄「解碼」面板 |
| `08_compare_light.png` | 底部「比對」:`pair_ctlval_client.pcap`(A)/ `pair_ctlval_ied.pcap`(B),選了值不同的那列 |
| `09_export_dialog_light.png` | 匯出對話框 |
| `snapshot_main.html` | 主畫面的靜態快照(DOM + 全部 CSS,不含程式;`data-theme` 切深淺) |
| `tokens.css` | = `packge_to_json/webapp/src/tokens.css` |

- **位置**:[shots/style_input_2026-11-09/](shots/style_input_2026-11-09/)(列表頂端空白修好後(N172)用 §4 的腳本拍的;`info.json` 記了 commit、資料與快照比對結果)。
- **不要給** `packge_to_json/webapp/dist/index.html`:那是空殼(一個 `<div id="app">` 加壓縮過的 JS),要跑 Pyodide 解完 pcap 才有畫面,設計端看不到任何東西。
- **不用給** web_ui_style_0.1、上一輪的盤點文件與設計稿:不是這一輪的限制,給了反而容易被拉回舊風格。
- Claude Design 不收 `.html` 的話,只給截圖和 `tokens.css` 就夠。

## §4 附件怎麼產生 / How the attachments are made

```bash
# repo 根目錄;dist 裡要有 pyodide / pysrc.zip / abb.json(先跑過一次 packge_to_json/webapp/serve.sh)
python3.13 scripts/pcap_web_design_capture.py docs/pcap_to_json/shots/style_input_2026-11-09
```

- **資料**:`lab_brcb_report.pcap` + 整段對話 + `lab_brcb_datasets.json`;篩選 `kind != report_header`;選 #62 之後第一個 `CSMSQI1.SeqA` 報告成員(#64)。比對用 `pair_ctlval_client.pcap` / `pair_ctlval_ied.pcap`(port 10202)。headless Chromium 1440 × 900、deviceScaleFactor 1。
- **靜態快照**:載入後 clone DOM;canvas 換成圖片;虛擬列表的列減掉捲動量,讓快照在捲動位置 0 就顯示同一批列;去掉 script;字型用相對路徑引用 `packge_to_json/webapp/dist/fonts/`。
- **CSS 要抄原始檔文字,不能用 CSSOM**:Chromium 會把「含 `var()` 的縮寫 + 同一條規則覆寫其中一個 longhand」(例:`kbd { border: 1px solid var(--border); border-bottom-width: 2px }`)序列化成空的 longhand,快照裡的框線就不見了。CodeMirror 的樣式是建構式樣式表(`adoptedStyleSheets`),只能走 CSSOM,它沒有這種寫法。
- **自我檢查**:腳本把快照重新渲染,跟實拍截圖逐像素比,結果寫進 `info.json`。2026-11-09(列表修正後重拍):淺色 0.35%、深色 0.10% 的像素不同,只差在列表的焦點框(快照裡沒有焦點);console 0 錯。

## §5 相關 / Related

- [topbar_inventory_2026-11-05](topbar_inventory_2026-11-05.md)(上一輪的輸入與 §11 落地)、[pcap_to_json_web_design_v0.1](pcap_to_json_web_design_v0.1.md) §5(視覺)
- `packge_to_json/webapp/src/tokens.css`、`packge_to_json/webapp/src/app.css`、`tests/test_packge_to_json/test_webapp_tokens.py`(對比門檻)
- `scripts/pcap_web_design_capture.py`(附件產生器)
