# 產圖與檢查腳本（工作台風格第一輪）

每張圖都是 `snapshot_main.html` 的真實 DOM 套方向 CSS 後，用 headless Chromium 渲染出來的。

**需要**：Node（`require('playwright')` 可用、有 Chromium）、Python 3.11+（Pillow、beautifulsoup4；量字型大小另需 fonttools＋brotli）、連得到 npm registry（字型全部從 npm 裝，都是 OFL）。

```bash
tools/setup_render_root.sh /tmp/style_render      # 建渲染工作目錄，最後一行印出要 export 的變數
export STYLE_RENDER_ROOT=/tmp/style_render
tools/run_all.sh ../style_directions_2026-11-09.md # 全部重跑並重寫文件；圖在 $STYLE_RENDER_ROOT/out/
```

圖要放回 `docs/pcap_to_json/shots/style_directions_2026-11-09/`（`{A..E}_{light,dark,1280}.png`、`swatch_*.png`、`overview.png`）。

| 檔 | 做什麼 |
|---|---|
| `palettes.py` | 五個方向的顏色（OKLCH＋角色 text / stext / gfx / focus），自動把明度推到剛好過對比門檻 |
| `build_css.py` | 字型、版面數字、`../css/src/*.components.css` → `../css/{A..E}.css` |
| `render.cjs` | 開快照、套 CSS、依 `--row-h` 重排虛擬列、量版面 / 溢出 / 截斷、逐段文字量對比、截圖 |
| `shoot.py` | A–E 的淺色、深色、1280 × 800（`--audit` 加 DOM 對比稽核） |
| `baseline.py` | 現況（不套方向 CSS）對照 |
| `make_swatch.py`、`render_swatch.cjs`、`swatches.py` | 色票圖：從快照複製真實的列 / chip / 直方圖，只換狀態 class |
| `overview.py`、`shot_page.cjs` | 總覽圖（2 倍渲染再縮） |
| `colorcheck.py`、`ok.py` | WCAG 對比、Machado 2009 色弱模擬、CIEDE2000、OKLCH |
| `summarize.py`、`audit_summary.py` | 檢查表（`../checks/`） |
| `make_doc.py` | 產生 `style_directions_2026-11-09.md` |

改顏色：改 `palettes.py` 的 `SPECS`；改元件：改 `../css/src/X.components.css`；改字型或版面數字：改 `build_css.py` 的 `CFG`。然後重跑 `run_all.sh`。
