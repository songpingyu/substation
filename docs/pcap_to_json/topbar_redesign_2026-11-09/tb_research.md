看了 6 個封包 / 鑑識工具、5 個日誌與開發工具，加上 4 套設計系統的工具列規則。大多數讀的是官方文件（部分官網被這個環境的網路擋住，改讀它們放在 GitHub 的文件原始檔或程式碼，連結指向對應的公開頁）；只在搜尋摘要看到、沒讀到原文的標「未驗證」。

### 2.1 封包 / 鑑識工具

| 工具 | 篩選怎麼放 | 檔案、解碼、連線、設定放哪 | 計數與狀態 |
|---|---|---|---|
| **Wireshark**（使用者的參考）[文件](https://github.com/wireshark/wireshark/blob/master/doc/wsug_src/wsug_use.adoc) | 篩選工具列依序：書籤（存過的篩選）→ 輸入框 → 清除 → 套用 → 最近 → 「+」快捷篩選；在任何地方打字就開始寫篩選 | Decode As、Conversations、Capture File Properties、Coloring Rules、About 全在**選單**，不在工具列；主工具列可以整條藏起來 | **狀態列**：左邊 expert 等級圖示＋檔名，中間 Packets / Displayed（Marked、Dropped 有值才出現），右邊 profile |
| **Arkime** [說明頁](https://github.com/arkime/arkime/blob/main/viewer/vueapp/src/components/help/Help.vue)、[導覽列](https://github.com/arkime/arkime/blob/main/viewer/vueapp/src/components/utils/Navbar.vue) | 一列：運算式＋Search；旁邊「存成 View」與 Views 下拉；Actions 下拉做匯出 PCAP / CSV、加標籤 | 連線、歷史是獨立頁面；主題、快捷鍵在 Settings；「?」顯示快捷鍵 | 時間範圍與分頁在查詢列下方 |
| **Zui**（原 Brim）[README](https://github.com/brimdata/zui/blob/main/README.md)、[原始碼](https://github.com/brimdata/zui/tree/main/apps/superdb-desktop/src) | 「可釘選的查詢片段，讓搜尋框保持乾淨」：資料來源（pool）和時間範圍也做成 pin；工具列圖示放不下就收進「more」 | 側欄放 Pools、查詢庫、Sessions；歷史在右側面板 | 結果下方的 footer 放列數、總數 |
| **CloudShark**（未驗證）[profile](https://support.qacafe.com/cloudshark/user-guide/profiles)、[4.0](https://support.qacafe.com/cloudshark/release-notes/cloudshark-4-0-0/) | 篩選框旁一個「Filters」按鈕放存過的篩選 | 一個 Profile 一次帶 Decode As、協定偏好、存過的篩選、著色規則；File Info 彈窗放檔名、數量、大小、hash | 4.0 起狀態列放檔案統計與符合篩選的比例 |
| **Security Onion Hunt** [文件](https://github.com/Security-Onion-Solutions/securityonion-docs/blob/2.4/dashboards.rst) | 查詢列帶預設清單下拉，已套用的條件是框下方可移除的 bubble | 選項收在上方一個 Options 選單 | 時間選擇器在右上 |
| **Termshark** [使用手冊](https://github.com/gcla/termshark/blob/master/docs/UserGuide.md) | 紅 / 綠即時檢查＋Apply | Analysis 選單（檔案屬性、對話）；「:」指令列處理篩選歷史、主題、說明 | — |

### 2.2 日誌、觀測與開發工具

- **Kibana Discover 9.x**：上方 app 選單（New、Open、Share、Alert、Inspect、Save；Export 收在「… More」）；下一列是查詢列：data view 選擇器＋KQL 框（框左側一個 Query menu：存 / 載入查詢）＋時間＋Refresh；左側欄位清單點了看前 10 名的值與筆數；表格工具列的「Display options」收密度、列線、樣本數。[入門](https://www.elastic.co/docs/explore-analyze/discover/discover-get-started)、[篩選](https://www.elastic.co/docs/explore-analyze/query-filter/filtering)、[Document explorer](https://www.elastic.co/docs/explore-analyze/discover/document-explorer)
- **Grafana Explore**：工具列左上 data source 選擇器，右上時間＋Run query；查詢歷史是底部面板（History / Starred）；日誌的時間格式、換行、字級、下載放在結果旁一條可收合的控制列。[入門](https://grafana.com/docs/grafana/latest/visualizations/explore/get-started-with-explore/)、[查詢管理](https://grafana.com/docs/grafana/latest/visualizations/explore/query-management/)、[日誌](https://grafana.com/docs/grafana/latest/visualizations/explore/logs-integration/)
- **Datadog Log Explorer**：搜尋框的自動完成合併欄位值、最近 100 筆搜尋與 Saved Views；左側 facet 清單帶筆數；「Options」按鈕管每筆的高度與顯示；Saved Views 在左上。[搜尋](https://docs.datadoghq.com/logs/explorer/search/)、[facets](https://docs.datadoghq.com/logs/explorer/facets/)、[顯示](https://docs.datadoghq.com/logs/explorer/visualize/)
- **Chrome DevTools Network**：篩選列＝文字框＋Invert＋「More filters」（有數量徽章）＋類型 chip；不常用的 4 個勾選收進最右邊的齒輪；底部摘要列放「N / M requests」等數字。[參考](https://developer.chrome.com/docs/devtools/network/reference)
- **VS Code UX 準則**：狀態列「限制項目數」、用短文字標籤，整個工作區的放左邊、跟目前內容有關的放右邊；Command Palette 是「所有指令都找得到的地方」；次要動作收進「…」。[狀態列](https://code.visualstudio.com/api/ux-guidelines/status-bar)、[指令面板](https://code.visualstudio.com/api/ux-guidelines/command-palette)

### 2.3 設計系統給的數字

- **Fluent UI CommandBar**：一列「不要超過 5–7 個指令」，依重要性排，少用的進溢位選單；右側放狀態與檢視控制，最多 2–3 個。[文件](https://github.com/microsoft/fluentui/blob/master/packages/react-examples/src/react/CommandBar/docs/CommandBarOverview.md)
- **Material 3 頂部列**：窄螢幕最多 3 個動作、其他最多 5 個（Google 官方範例程式碼的註解；規範頁本身未讀到）。[範例](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/samples/src/main/java/androidx/compose/material3/samples/AppBarSamples.kt)
- **GitHub Primer**：放不下的按鈕收進「⋯」；圖示按鈕預設是 invisible（無框、無底）；分段控制 2–5 個文字選項，再多改下拉。[設計文件](https://github.com/primer/design/tree/main/content)
- **NN/g**（未驗證）：漸進揭露超過兩層就會變難用；圖示要保留文字標籤。[progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/)

### 2.4 歸納成六條規則，對到這次的設計

1. **篩選是主角：給它最寬的位置，而且全列只有它有框。** 上面每個查詢型工具都這樣排 → 方案 1 的列 2 整列給篩選框（比現在寬 293 px）。
2. **描述同一個東西的屬性，合成一個入口。** Kibana 的 data view、Grafana 的 data source、Zui 的 from pin、CloudShark 的 File Info / Profile → 「來源」晶片：檔名＋解碼＋連線＋解析狀態。
3. **不常改的設定與 App 層級功能進選單。** Wireshark 的 Decode As、Conversations、著色、About 都在選單；Arkime 的主題、快捷鍵在 Settings → 「MMS pcap 分析 ▾」：開啟檔案、快捷鍵、主題、版本。
4. **存過的與最近的查詢，掛在查詢框旁邊一個選單。** Wireshark 書籤鈕、Kibana Query menu、CloudShark Filters、Arkime Views → 「篩選 ▾」合併「最近」與「書籤」。
5. **檢視設定合成一個「顯示」。** Kibana Display options、Grafana 控制列、Datadog Options、DevTools 齒輪 → 底部「顯示 ▾」：列高、欄位、著色規則、截圖模式。時間格式有 4 個選項，照 Primer 分段控制的上限改成「時間 本機 ▾」。
6. **一列 5–7 個以內，其餘靠選單＋指令面板。** Fluent 5–7、Material 3–5、VS Code「限制項目數」＋Command Palette → 每列 3–4 個控制項，再加 Ctrl+K 指令面板，收進選單的功能用打字也找得到。

另外兩點：數字與狀態放在角落（Wireshark 狀態列、DevTools 摘要列、Zui footer）→ 結果數放在篩選列尾端、解析狀態在列 1 最右；計數清單放側欄（Kibana 欄位清單、Datadog facets）→ 方案 3 的「統計」分頁。
