#!/usr/bin/env bash
# 全部重跑：主畫面（含 1280 與 DOM 對比稽核）→ 色票 → 總覽 → 變數檢查 → 文件。
# 先跑 setup_render_root.sh 並 export STYLE_RENDER_ROOT。
set -euo pipefail
export PYTHONDONTWRITEBYTECODE=1
HERE="$(cd "$(dirname "$0")" && pwd)"
R="${STYLE_RENDER_ROOT:-$(dirname "$HERE")/render}"
cd "$HERE"
python3 -IB baseline.py
python3 -IB shoot.py A B C D E --1280 --audit > "$R/out/render_metrics.txt" 2>&1
python3 -IB audit_summary.py
python3 -IB swatches.py
python3 -IB overview.py
python3 -IB summarize.py > "$R/out/token_table.md"
if [ -n "${1:-}" ]; then python3 -IB make_doc.py "$1"; fi
echo done
