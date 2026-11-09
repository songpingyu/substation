#!/usr/bin/env bash
# 建渲染工作目錄：快照放在跟 repo 一樣的相對位置（字型的相對路徑才對得上），字型用 npm 裝（全部 OFL）。
# 用法：tools/setup_render_root.sh [/tmp/style_render]，然後照最後一行 export。
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROUND="$(dirname "$HERE")"                 # docs/pcap_to_json/style_directions_2026-11-09
DOCS="$(dirname "$ROUND")"                 # docs/pcap_to_json
ROOT="${1:-/tmp/style_render}"
mkdir -p "$ROOT/docs/pcap_to_json/shots/style_input_2026-11-09" "$ROOT/packge_to_json/webapp/dist/fonts" "$ROOT/out" "$ROOT/ov"
cp "$DOCS/shots/style_input_2026-11-09/snapshot_main.html" "$ROOT/docs/pcap_to_json/shots/style_input_2026-11-09/"
ln -sfn "$ROUND/css" "$ROOT/directions"
cd "$ROOT"
[ -f package.json ] || npm init -y >/dev/null
npm install --no-audit --no-fund @ibm/plex-sans @ibm/plex-mono \
  @fontsource/noto-sans-tc @fontsource/noto-serif-tc @fontsource/b612 @fontsource/red-hat-mono \
  @fontsource/iosevka @fontsource/iosevka-aile @fontsource/source-sans-3 @fontsource/source-serif-4 @fontsource/source-code-pro \
  @fontsource/inter @fontsource/geist-mono @fontsource/atkinson-hyperlegible-next @fontsource/atkinson-hyperlegible-mono >/dev/null
cp node_modules/@ibm/plex-sans/fonts/complete/woff2/IBMPlexSans-{Regular,Medium,Bold}.woff2 \
   node_modules/@ibm/plex-mono/fonts/complete/woff2/IBMPlexMono-{Regular,Medium}.woff2 packge_to_json/webapp/dist/fonts/
ln -sfn "$ROOT/node_modules/@fontsource" "$ROOT/fontsource"
echo "export STYLE_RENDER_ROOT=$ROOT"
