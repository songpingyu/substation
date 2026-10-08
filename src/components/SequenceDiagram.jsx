import { useId } from 'react';

/**
 * 以 SVG 手刻的時序圖 (取代 Mermaid sequenceDiagram)。
 *
 * participants: [{ id, label, sub? }]
 * steps: 依序排列的步驟，支援三種：
 *   { type: 'msg',  from, to, label, dashed?, tone? }   箭頭訊息；label 可用 \n 換行
 *   { type: 'note', over: id | [id, id], text }          便條；text 可用 \n 換行
 *   { type: 'loop', label, steps: [...] }                 迴圈或分組框
 * tone: 'client' (靛藍，預設用於由左向右)、'server' (綠，預設用於由右向左)、'neutral'、'danger'
 * dashed: true 代表虛線 (對應 Mermaid 的 -->>，常用於回應或非同步推送)
 */

const TONES = {
  client: '#818cf8',
  server: '#34d399',
  neutral: '#94a3b8',
  danger: '#f87171',
};

const BOX_W = 200;
const BOX_H = 44;
const COL_W = 280;
const PAD_X = 16;
const PAD_TOP = 10;
const LINE_H = 15;

function layoutSteps(steps, y0) {
  let y = y0;
  const items = [];
  for (const s of steps) {
    if (s.type === 'msg') {
      const lines = String(s.label ?? '').split('\n');
      const textTop = y + 8;
      const arrowY = textTop + lines.length * LINE_H + 4;
      items.push({ kind: 'msg', step: s, lines, textTop, arrowY });
      y = arrowY + 14;
    } else if (s.type === 'note') {
      const lines = String(s.text ?? '').split('\n');
      const h = lines.length * LINE_H + 14;
      items.push({ kind: 'note', step: s, lines, y: y + 6, h });
      y += h + 14;
    } else if (s.type === 'loop') {
      const top = y + 6;
      const inner = layoutSteps(s.steps || [], top + 26);
      const h = inner.y - top + 8;
      items.push({ kind: 'loop', step: s, y: top, h });
      items.push(...inner.items);
      y = top + h + 10;
    }
  }
  return { items, y };
}

export default function SequenceDiagram({ participants, steps, title, className = '', minWidth = 440 }) {
  const uid = useId().replace(/:/g, '');
  const n = participants.length;
  const xOf = (id) => {
    const i = participants.findIndex((p) => p.id === id);
    return PAD_X + BOX_W / 2 + Math.max(i, 0) * COL_W;
  };
  const width = PAD_X * 2 + BOX_W + COL_W * (n - 1);
  const { items, y: yEnd } = layoutSteps(steps, PAD_TOP + BOX_H + 10);
  const height = yEnd + 16;
  const loops = items.filter((i) => i.kind === 'loop');
  const rest = items.filter((i) => i.kind !== 'loop');
  const leftX = PAD_X + 6;
  const rightX = width - PAD_X - 6;

  return (
    <figure className={`rounded-xl border border-slate-800 bg-slate-950/70 p-3 md:p-4 ${className}`}>
      {title && <figcaption className="text-xs font-bold text-slate-400 mb-2 tracking-wide">{title}</figcaption>}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ minWidth, maxWidth: width * 1.15 }}
          className="h-auto mx-auto block"
          role="img"
          aria-label={title || 'sequence diagram'}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          <defs>
            {Object.entries(TONES).map(([k, c]) => (
              <marker
                key={k}
                id={`${uid}-arrow-${k}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill={c} />
              </marker>
            ))}
          </defs>

          {loops.map((l, i) => {
            const label = String(l.step.label ?? '');
            const labelW = Math.min(rightX - leftX, 16 + label.length * 8);
            return (
              <g key={`loop-${i}`}>
                <rect
                  x={leftX}
                  y={l.y}
                  width={rightX - leftX}
                  height={l.h}
                  rx="8"
                  fill="rgba(30,41,59,0.35)"
                  stroke="#475569"
                  strokeDasharray="5 4"
                />
                <rect x={leftX} y={l.y} width={labelW} height="20" rx="6" fill="#1e293b" stroke="#475569" />
                <text x={leftX + 8} y={l.y + 14} fontSize="11" fontWeight="700" fill="#cbd5e1">
                  {label}
                </text>
              </g>
            );
          })}

          {participants.map((p) => {
            const x = xOf(p.id);
            return (
              <g key={p.id}>
                <line x1={x} y1={PAD_TOP + BOX_H} x2={x} y2={height - 8} stroke="#334155" strokeDasharray="4 4" />
                <rect x={x - BOX_W / 2} y={PAD_TOP} width={BOX_W} height={BOX_H} rx="8" fill="#0f172a" stroke="#475569" />
                <text
                  x={x}
                  y={PAD_TOP + (p.sub ? 18 : 27)}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="#e2e8f0"
                >
                  {p.label}
                </text>
                {p.sub && (
                  <text x={x} y={PAD_TOP + 34} textAnchor="middle" fontSize="10" fill="#94a3b8">
                    {p.sub}
                  </text>
                )}
              </g>
            );
          })}

          {rest.map((it, i) => {
            if (it.kind === 'msg') {
              const s = it.step;
              const x1 = xOf(s.from);
              const x2 = xOf(s.to);
              const dir = x2 >= x1 ? 1 : -1;
              const tone = s.tone && TONES[s.tone] ? s.tone : dir > 0 ? 'client' : 'server';
              const color = TONES[tone];
              const cx = (x1 + x2) / 2;
              return (
                <g key={i}>
                  <text x={cx} y={it.textTop + 11} textAnchor="middle" fontSize="12" fill="#e2e8f0">
                    {it.lines.map((ln, li) => (
                      <tspan key={li} x={cx} dy={li === 0 ? 0 : LINE_H}>
                        {ln}
                      </tspan>
                    ))}
                  </text>
                  <line
                    x1={x1}
                    y1={it.arrowY}
                    x2={x2 - dir * 6}
                    y2={it.arrowY}
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray={s.dashed ? '6 4' : undefined}
                    markerEnd={`url(#${uid}-arrow-${tone})`}
                  />
                </g>
              );
            }
            if (it.kind === 'note') {
              const s = it.step;
              const over = Array.isArray(s.over) ? s.over : [s.over];
              const xs = over.map(xOf);
              const xa = Math.min(...xs);
              const xb = Math.max(...xs);
              const w = over.length > 1 ? xb - xa + BOX_W * 0.6 : BOX_W * 1.1;
              const x = (xa + xb) / 2 - w / 2;
              const cx = x + w / 2;
              return (
                <g key={i}>
                  <rect x={x} y={it.y} width={w} height={it.h} rx="6" fill="rgba(245,158,11,0.10)" stroke="rgba(245,158,11,0.45)" />
                  <text x={cx} y={it.y + 15} textAnchor="middle" fontSize="11.5" fill="#fcd34d">
                    {it.lines.map((ln, li) => (
                      <tspan key={li} x={cx} dy={li === 0 ? 0 : LINE_H}>
                        {ln}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </figure>
  );
}
