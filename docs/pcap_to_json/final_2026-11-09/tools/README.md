# 定稿的產圖腳本

共用的渲染工具在 `../../style_directions_2026-11-09/tools/`（先照那裡的 README 建渲染目錄並 `export STYLE_RENDER_ROOT`）。

```bash
python3 -IB shoot_final.py            # 建 F.css、重建各狀態頁、渲染主畫面與 6 個狀態（淺 / 深）並印檢查結果
python3 -IB make_final_doc.py ../../final_2026-11-09.md
```

- `states.py`：從 `snapshot_main.html` 出發，用 app 的 class 名稱照參考截圖 03–09 重建 bytes、空白頁＋解碼面板、比對、匯出、品質、時間序列六個狀態；文字逐字照抄，bytes 的 0x05a–0x0f5 會自動比對快照裡 #64 的值。
- `shoot_final.py`：套 `_v2_layer` → `_v2_fixes` → `topbar_v3` → `F` 並跑方案 1 的頂部重排，輸出到 `$STYLE_RENDER_ROOT/final/`。
- 顏色在 `../../style_directions_2026-11-09/tools/palettes.py` 的 `SPECS['F']`；元件在 `../../style_directions_2026-11-09/css/src/F.components.css`。
