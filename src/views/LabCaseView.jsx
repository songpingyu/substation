import { Fragment, useId, useState } from 'react';
import {
  FlaskConical,
  Heading,
  LayoutGrid,
  SquareDashed,
  ListTree,
  Compass,
  Calculator,
  PanelLeft,
  ListChecks,
  Rss,
  Minus,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';
import DataTable from '../components/DataTable.jsx';
import UnverifiedBadge from '../components/UnverifiedBadge.jsx';
import Checklist from '../components/Checklist.jsx';
import { Code, FcBadge, Pill, SubHeading, Callout } from '../components/Primitives.jsx';

const LINK_CLASS = 'text-amber-300 underline decoration-amber-500/50 underline-offset-2 hover:text-amber-200';

// 本頁章節跳轉清單。hash 格式為 #lab/<section>，對應元素 id="lab-<section>"
const JUMP_GROUPS = [
  {
    title: '實驗紀錄',
    items: [
      ['setup', '實驗環境'],
      ['header', '標題列'],
      ['monitor', 'Activity Monitor'],
      ['tiles', '卡片構造'],
      ['members', '成員說明'],
      ['phasor', '相量圖'],
      ['sanity', '交叉驗證'],
      ['browser', 'Browser 分頁'],
    ],
  },
  {
    title: '待辦',
    items: [['checklist', '待驗證清單']],
  },
];

const RCB_REF = 'FD11_PMCCLD0/LLN0.rcbMeasFlt01';

function ConfirmedPill({ note }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Pill tone="emerald">
        <Check className="w-3 h-3" />
        已確認
      </Pill>
      {note && <span className="text-xs text-slate-400">{note}</span>}
    </span>
  );
}

// ==========================================
// 1. 實驗環境現況
// ==========================================
const SETUP_ROWS = [
  [
    '實驗用 client 軟體',
    <>
      OMICRON IEDScout (Browser 分頁 + Activity Monitor)；視窗右下顯示 <Code>CM350Q</Code>
    </>,
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <UnverifiedBadge />
      <span className="text-xs text-slate-400">
        <Code>CM350Q</Code> 推測為 OMICRON 硬體或授權識別
      </span>
    </span>,
  ],
  ['IED 名稱', <Code>FD11_PMCC</Code>, <ConfirmedPill note="(畫面)" />],
  ['IED IP', <Code>192.168.2.11</Code>, <ConfirmedPill note="(畫面)" />],
  ['Logical Device', <Code>LD0</Code>, <ConfirmedPill />],
  [
    '訂閱的 RCB',
    <Code>{RCB_REF}</Code>,
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <ConfirmedPill />
      <UnverifiedBadge />
      <span className="text-xs text-slate-400">是 URCB (Unbuffered, RP) 或 BRCB (Buffered, BR) 未確認</span>
    </span>,
  ],
  [
    '對應 DataSet',
    <>
      推測為 <Code>MeasFlt</Code>
    </>,
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <UnverifiedBadge />
      <span className="text-xs text-slate-400">
        由 RCB 名稱推斷，須讀 <Code>DatSet</Code> 屬性確認
      </span>
    </span>,
  ],
  [
    'IED 廠牌',
    <>
      命名風格 (<Code>CMMXU</Code>、<Code>VMMXU</Code>、<Code>PEMMXU</Code>、<Code>FMMXU</Code>、<Code>RESCMMXU</Code>、
      <Code>RESVMMXU</Code>、<Code>CSMSQI</Code>、<Code>VSMSQI</Code>、<Code>rcbMeasFlt</Code>) 疑似 ABB Relion 615/620 系列
    </>,
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <UnverifiedBadge />
      <span className="text-xs text-slate-400">
        請以 <strong>IED properties</strong> 或 ICD/CID 為準
      </span>
    </span>,
  ],
  ['Browser 分頁輪詢週期', <Code>Polling: 1 s</Code>, <ConfirmedPill />],
  [
    '觀察時間',
    <>
      2026-10-07 14:26:51.656 (取自 <Code>VMMXU1.PhV.phsA.t</Code>)
    </>,
    <ConfirmedPill />,
  ],
];

const VISIBLE_LNS = [
  'SFAIGGIO1',
  'SFLINF1',
  'SGBOGGIO1',
  'SGLINF1',
  'SMVLSVS1',
  'SPCGAPC1',
  'SPH1SCBR1',
  'SPH2SCBR1',
  'SPH3SCBR1',
  'SSCBR1',
  'SSIMG1',
  'SSOPM1',
  'TOFGAPC1',
  'TONGAPC1',
  'TONGAPC2',
  'UL1TVTR1',
  'UL2TVTR1',
  'UL3TVTR1',
  'VAVMMXU1',
  'VMMXU1',
];
// 畫面上的監視類 LN 名稱 (prefix S + LN class SCBR / SIMG / SOPM)；各以 instance 1 出現
const ED2_MONITOR_CLASSES = ['SSCBR', 'SSIMG', 'SSOPM'];
const ED2_MONITOR_LNS = new Set(ED2_MONITOR_CLASSES.map((cls) => `${cls}1`));

// ==========================================
// 2.1 標題列拆解 (可點選片段)
// ==========================================
const HEADER_SEGMENTS = [
  {
    id: 'ied',
    text: 'FD11_PMCC',
    label: 'IED name',
    detail: (
      <>
        IED name 接 Logical Device inst，串成 LDevice reference <Code>FD11_PMCCLD0</Code> (IEC 61850-7-2 object
        reference 格式 <Code>LDName/LNName.DO.DA</Code>)。這一段是 IED name 的部分。
      </>
    ),
  },
  {
    id: 'ld',
    text: 'LD0',
    label: 'Logical Device inst',
    detail: (
      <>
        IED name 接 Logical Device inst，串成 LDevice reference <Code>FD11_PMCCLD0</Code> (IEC 61850-7-2 object
        reference 格式 <Code>LDName/LNName.DO.DA</Code>)。這一段是 Logical Device inst 的部分。
      </>
    ),
  },
  {
    id: 'slash',
    text: '/',
    label: '分隔符號',
    detail: (
      <>
        object reference 格式 <Code>LDName/LNName.DO.DA</Code> 中的「/」：左邊是 LDevice reference{' '}
        <Code>FD11_PMCCLD0</Code>，右邊是 Logical Node 名稱 <Code>LLN0</Code>。
      </>
    ),
  },
  {
    id: 'lln0',
    text: 'LLN0',
    label: 'Logical Node Zero',
    detail: <>Logical Node Zero，每個 LD 必有；DataSet、RCB、GoCB 皆掛於此。</>,
  },
  {
    id: 'dot',
    text: '.',
    label: '分隔符號',
    detail: (
      <>
        object reference 格式 <Code>LDName/LNName.DO.DA</Code> 中，LN 名稱之後以「.」接下一層名稱；此處接的是 RCB
        名稱 <Code>rcbMeasFlt01</Code>。
      </>
    ),
  },
  {
    id: 'rcb',
    text: 'rcbMeasFlt01',
    label: 'RCB 名稱',
    detail: (
      <>
        RCB 名稱。<Code>R</Code> 圖示代表 Report Control Block (GOOSE 為 <Code>G</Code>)。<Code>MeasFlt</Code>{' '}
        推測為 Measurement Float <UnverifiedBadge />，對應同名浮點量測 DataSet；尾碼 <Code>01</Code> 為 instance index
        (SCL <Code>ReportControl max="n"</Code> 展開為 01..0n，每個 client 佔一個 instance)。Instance 概念詳見{' '}
        <a href="#report/instances" className={LINK_CLASS}>
          Report 分頁的 Instance 章節
        </a>
        。
      </>
    ),
  },
  {
    id: 'check',
    text: '✓',
    label: '右上綠色 ✓',
    detail: (
      <>
        訂閱啟用中 (<Code>RptEna</Code> = true)；X 為取消訂閱。<Code>RptEna</Code> 與其他 RCB 屬性見{' '}
        <a href="#report/rcb" className={LINK_CLASS}>
          Report 分頁的 RCB 屬性
        </a>
        。
      </>
    ),
  },
  {
    id: 'x',
    text: 'X',
    label: '右上 X',
    detail: (
      <>
        X 為取消訂閱；綠色 ✓ 則代表訂閱啟用中 (<Code>RptEna</Code> = true)。
      </>
    ),
  },
];

const HEADER_TABLE_ROWS = [
  [
    <>
      <Code>FD11_PMCC</Code> + <Code>LD0</Code>
    </>,
    <>
      IED name 接 Logical Device inst，串成 LDevice reference <Code>FD11_PMCCLD0</Code> (IEC 61850-7-2 object reference
      格式 <Code>LDName/LNName.DO.DA</Code>)
    </>,
  ],
  [<Code>LLN0</Code>, <>Logical Node Zero，每個 LD 必有；DataSet、RCB、GoCB 皆掛於此</>],
  [
    <Code>rcbMeasFlt01</Code>,
    <>
      RCB 名稱。<Code>R</Code> 圖示代表 Report Control Block (GOOSE 為 <Code>G</Code>)。<Code>MeasFlt</Code> 推測為
      Measurement Float <UnverifiedBadge />，對應同名浮點量測 DataSet；尾碼 <Code>01</Code> 為 instance index (SCL{' '}
      <Code>ReportControl max="n"</Code> 展開為 01..0n，每個 client 佔一個 instance)
    </>,
  ],
  [
    '右上綠色 ✓',
    <>
      訂閱啟用中 (<Code>RptEna</Code> = true)；X 為取消訂閱
    </>,
  ],
];

function RcbIcon({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded border border-indigo-500/50 bg-indigo-500/20 text-indigo-300 font-black text-xs shrink-0 ${className}`}
      role="img"
      title="R 圖示：Report Control Block (GOOSE 為 G)"
      aria-label="R 圖示：Report Control Block"
    >
      R
    </span>
  );
}

function EnabledCheck({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full border border-emerald-500/60 bg-emerald-500/20 shrink-0 ${className}`}
      role="img"
      title="綠色 ✓：訂閱啟用中 (RptEna = true)"
      aria-label="綠色 ✓：訂閱啟用中"
    >
      <Check className="w-4 h-4 text-emerald-400" />
    </span>
  );
}

const SEG_BASE = 'font-mono font-bold rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60';
const SEG_STATE = {
  active: 'border-amber-400 bg-amber-500/20 text-amber-200',
  idle: 'border-slate-700 bg-slate-900 text-slate-200 hover:border-amber-500/60 hover:text-amber-200',
};

function HeaderBreakdown() {
  const [picked, setPicked] = useState('rcb');
  const [hovered, setHovered] = useState(null);
  const currentId = hovered || picked;
  const current = HEADER_SEGMENTS.find((s) => s.id === currentId) || HEADER_SEGMENTS[0];
  const nameSegments = HEADER_SEGMENTS.filter((s) => s.id !== 'check' && s.id !== 'x');

  const segButton = (s, extra) => {
    const active = currentId === s.id;
    return (
      <button
        key={s.id}
        type="button"
        onClick={() => setPicked(s.id)}
        onMouseEnter={() => setHovered(s.id)}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered(s.id)}
        onBlur={() => setHovered(null)}
        aria-pressed={picked === s.id}
        title={s.label}
        className={`${SEG_BASE} ${active ? SEG_STATE.active : SEG_STATE.idle} ${extra}`}
      >
        {s.text}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400 leading-relaxed">
        下方重現 Activity Monitor 的標題列。點選 (或滑過) 任一片段，會在下面顯示該片段的意義；目前點選的片段以琥珀色標示。
      </p>
      <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 md:p-4 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="標題列片段">
            <RcbIcon className="mr-1" />
            {nameSegments.map((s) =>
              segButton(s, s.id === 'slash' || s.id === 'dot' ? 'px-1.5 py-1 text-base' : 'px-2 py-1 text-sm md:text-base'),
            )}
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="訂閱狀態">
            {HEADER_SEGMENTS.filter((s) => s.id === 'check' || s.id === 'x').map((s) => {
              const active = currentId === s.id;
              const tone =
                s.id === 'check'
                  ? active
                    ? 'border-emerald-400 bg-emerald-500/30 text-emerald-200'
                    : 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                  : active
                    ? 'border-rose-400 bg-rose-500/25 text-rose-200'
                    : 'border-slate-600 bg-slate-900 text-slate-400 hover:border-rose-400/60 hover:text-rose-300';
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setPicked(s.id)}
                  onMouseEnter={() => setHovered(s.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(s.id)}
                  onBlur={() => setHovered(null)}
                  aria-pressed={picked === s.id}
                  aria-label={s.label}
                  title={s.label}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${tone}`}
                >
                  {s.id === 'check' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">目前片段</div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
          <span className="font-mono text-lg md:text-xl font-black text-amber-300">{current.text}</span>
          <span className="text-sm font-bold text-slate-200">{current.label}</span>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed">{current.detail}</div>
      </div>
    </div>
  );
}

// ==========================================
// 1.2 / 2.4 相量圖 (VMMXU1.PhV)
// ==========================================
const PHASOR_FULL_SCALE = 20.0; // 外圈刻度 20.00 kV (自動刻度)
const PHASORS = [
  { id: 'phsA', mag: 12.537, ang: 0, angleText: '0°', color: '#fbbf24' },
  { id: 'phsB', mag: 12.537, ang: -119.917, angleText: '-119.917°', color: '#38bdf8' },
  { id: 'phsC', mag: 12.537, ang: 120.087, angleText: '+120.087°', color: '#34d399' },
];

// 2.4 相量圖的四點說明，依筆記原句
const PHASOR_NOTES = [
  <>
    外圈 <Code>20.00 kV</Code> 是自動刻度，不是額定值。
  </>,
  <>phsA-N 在 0°，phsC-N 約 +120°，phsB-N 約 -120°：正相序 ABC、三相平衡，角度誤差約 0.1°，為典型測試注入訊號。</>,
  <>IED 以 phsA 為角度基準 (0°)，其他相量皆為相對角。</>,
  <>
    此卡片與{' '}
    <a href="#lab/browser" className={LINK_CLASS}>
      Browser 分頁的 <Code>VMMXU1.PhV</Code>
    </a>{' '}
    是同一份資料：<Code>phsA.cVal.mag</Code>、<Code>phsA.cVal.ang</Code>、<Code>q</Code>、<Code>t</Code>、
    <Code>units</Code> (<FcBadge fc="CF" />)、<Code>d</Code> (<FcBadge fc="DC" />)。
  </>,
];

function PhasorDiagram({ size = 220, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const c = 100;
  const R = 74;
  const toXY = (mag, ang, extra = 0) => {
    const len = (mag / PHASOR_FULL_SCALE) * R + extra;
    const rad = (ang * Math.PI) / 180;
    // 角度逆時針為正：SVG 的 y 軸向下，所以 y 要用減號
    return { x: c + len * Math.cos(rad), y: c - len * Math.sin(rad) };
  };
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="VMMXU1.PhV 相量圖：外圈刻度 20.00 kV，phsA 12.537 kV 0°，phsB 12.537 kV -119.917°，phsC 12.537 kV +120.087°"
      className={`max-w-full h-auto ${className}`}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
    >
      <defs>
        {PHASORS.map((p) => (
          <marker
            key={p.id}
            id={`${uid}-${p.id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={p.color} />
          </marker>
        ))}
      </defs>
      <circle cx={c} cy={c} r={R} fill="rgba(15,23,42,0.6)" stroke="#475569" strokeWidth="1" />
      <circle cx={c} cy={c} r={R / 2} fill="none" stroke="#1e293b" strokeDasharray="3 3" />
      <line x1={c - R} y1={c} x2={c + R} y2={c} stroke="#1e293b" />
      <line x1={c} y1={c - R} x2={c} y2={c + R} stroke="#1e293b" />
      <text x={c + 2} y={c - R + 10} fontSize="8.5" fill="#94a3b8">
        20.00 kV
      </text>
      {PHASORS.map((p) => {
        const tip = toXY(p.mag, p.ang);
        const lab = toXY(p.mag, p.ang, 17);
        return (
          <g key={p.id}>
            <line
              x1={c}
              y1={c}
              x2={tip.x}
              y2={tip.y}
              stroke={p.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              markerEnd={`url(#${uid}-${p.id})`}
            />
            <text x={lab.x} y={lab.y - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={p.color}>
              {p.id}
            </text>
            <text x={lab.x} y={lab.y + 6} textAnchor="middle" fontSize="8" fill={p.color}>
              {p.angleText}
            </text>
          </g>
        );
      })}
      <circle cx={c} cy={c} r="2.5" fill="#e2e8f0" />
    </svg>
  );
}

// ==========================================
// 1.2 Activity Monitor 卡片資料
// ==========================================
const MONITOR_TILES = [
  { path: 'LD0/CSMSQI1.SeqA', values: null },
  { path: 'LD0/VSMSQI1.SeqV', values: null },
  { path: 'LD0/RESVMMXU1.PhV', values: null },
  { path: 'LD0/CMMXU1.A', values: ['32.006 A', '32.006 A', '32.006 A'] },
  { path: 'LD0/VMMXU1.PPV', values: ['21.717 kV', '21.717 kV', '21.717 kV'] },
  { path: 'LD0/PEMMXU1.TotW', values: ['-261.152 kW'] },
  { path: 'LD0/PEMMXU1.TotVAr', values: ['-1178.835 kVAr'] },
  { path: 'LD0/PEMMXU1.TotVA', values: ['1207.42 kVA'] },
  { path: 'LD0/PEMMXU1.TotPF', values: ['-0.216'] },
  { path: 'LD0/FMMXU1.Hz', values: ['59.961 Hz'], warn: true },
  { path: 'LD0/RESCMMXU1.A', values: null },
  { path: 'LD0/VMMXU1.PhV', phasor: true },
];

function MonitorTile({ tile }) {
  const noValue = !tile.values && !tile.phasor;
  const labelClass = tile.warn
    ? 'bg-yellow-400 text-slate-900 border-yellow-300'
    : 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-3 min-h-[11rem] ${
        tile.warn ? 'border-amber-500/50 bg-slate-950' : 'border-slate-800 bg-slate-950'
      }`}
    >
      <div className="flex items-center justify-between">
        <FcBadge fc="MX" />
        {tile.warn && (
          <span className="relative inline-flex items-center text-amber-300" title="⚠ 警告符號">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="sr-only">警告符號</span>
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-2 text-center">
        {tile.phasor && (
          <>
            <PhasorDiagram size={150} />
            <div className="font-mono text-xs text-slate-200 mt-1">12.537 kV</div>
            <div className="font-mono text-[10px] text-slate-500">∠0° / ∠-119.917° / ∠+120.087°</div>
          </>
        )}
        {noValue && (
          <>
            <Minus className="w-10 h-10 text-slate-600" aria-hidden="true" />
            <span className="text-[10px] text-slate-500 font-bold">無值 (短橫線)</span>
          </>
        )}
        {tile.values && (
          <div className={`font-mono font-bold text-slate-100 ${tile.values.length > 1 ? 'text-base' : 'text-xl'}`}>
            {tile.values.map((v, i) => (
              <div key={i}>{v}</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0 flex flex-wrap items-center gap-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${labelClass}`}>DO</span>
          <Code tone={tile.warn ? 'amber' : 'purple'}>{tile.path}</Code>
        </div>
        <span title="右下訂閱圖示：值來自 report 推送" className="shrink-0">
          <Rss className="w-4 h-4 text-amber-400" />
        </span>
      </div>
    </div>
  );
}

// ==========================================
// 2.2 卡片構造
// ==========================================
const TILE_ROWS = [
  [
    <span className="inline-flex items-center gap-1.5">
      左上 <FcBadge fc="MX" />
    </span>,
    <>
      功能約束 (Functional Constraint, FC) = MX，量測類比值 (measurands)。其他常見：<FcBadge fc="ST" /> 狀態、
      <FcBadge fc="CF" /> 設定、<FcBadge fc="DC" /> 描述
    </>,
  ],
  ['中央數值', <>該 DO 的量測值；三相 DO 列 3 個值 (phsA / phsB / phsC 或 phsAB / phsBC / phsCA)</>],
  [
    <>
      下方 <Code>DO</Code> 標籤 + 路徑
    </>,
    <>
      此 DataSet 成員是整個 Data Object (FCD)，不是單一屬性 (FCDA)；整個 DO 進 report 代表 <Code>mag</Code>、
      <Code>ang</Code>、<Code>q</Code>、<Code>t</Code> 一起送
    </>,
  ],
  [
    <span className="inline-flex items-center gap-1.5">
      右下小圖示 <Rss className="w-4 h-4 text-amber-400" />
    </span>,
    <>
      值來自 report 訂閱 (push)。沒有此圖示的卡片才會用底部 <Code>Polling</Code> 週期以 MMS Read 輪詢
    </>,
  ],
  [
    <span className="inline-flex items-center gap-1.5">
      紅色 <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-black text-xs">!</span>
    </span>,
    <>
      IEDScout 的 indication 標記：自上次清除後該值被 report 更新過 (或有需注意狀態)；ribbon 的{' '}
      <strong>Clear indications</strong> 可清除，本身不是錯誤
    </>,
  ],
  [
    <span className="inline-flex items-center gap-1.5">
      短橫線 <Minus className="w-4 h-4 text-slate-500" />
    </span>,
    <>尚未收到值，或 quality 無效，IEDScout 不顯示數字</>,
  ],
  [
    <span className="inline-flex items-center gap-1.5">
      卡片右上 <X className="w-4 h-4 text-slate-400" />
    </span>,
    <>只隱藏畫面上的卡片，IED 仍照送該成員，線上流量不變</>,
  ],
];

// ==========================================
// 2.3 成員逐一說明
// ==========================================
// LN 命名規則的拆解範例：RESVMMXU1 = RESV (prefix) + MMXU (LN class) + 1 (instance)
const LN_PARTS = [
  { label: 'prefix', value: 'RESV', box: 'border-sky-500/40 bg-sky-500/10 text-sky-300', text: 'text-sky-300' },
  { label: 'LN class', value: 'MMXU', box: 'border-amber-500/40 bg-amber-500/10 text-amber-300', text: 'text-amber-300' },
  { label: 'instance', value: '1', box: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', text: 'text-emerald-300' },
];

function LnSplit({ prefix, cls }) {
  return (
    <span className="font-mono text-xs whitespace-nowrap">
      <span className="text-sky-300">{prefix}</span>
      <span className="text-slate-500"> + </span>
      <span className="text-amber-300">{cls}</span>
    </span>
  );
}

const MEMBER_ROWS = [
  [
    <Code>LD0/CSMSQI1.SeqA</Code>,
    <LnSplit prefix="CS" cls="MSQI" />,
    <>電流序分量 (SEQ 型別：c1 正序、c2 負序、c3 零序)</>,
    <span className="text-slate-500">無值</span>,
  ],
  [
    <Code>LD0/VSMSQI1.SeqV</Code>,
    <LnSplit prefix="VS" cls="MSQI" />,
    <>電壓序分量</>,
    <span className="text-slate-500">無值</span>,
  ],
  [
    <Code>LD0/RESVMMXU1.PhV</Code>,
    <LnSplit prefix="RESV" cls="MMXU" />,
    <>殘餘電壓 (Residual voltage, U0 / 3U0)，通常來自獨立 U0 輸入或由三相計算</>,
    <span className="text-slate-500">無值</span>,
  ],
  [
    <Code>LD0/CMMXU1.A</Code>,
    <LnSplit prefix="C" cls="MMXU" />,
    <>三相電流 (WYE 型別：phsA/phsB/phsC)</>,
    <>32.006 A ×3，完全平衡</>,
  ],
  [
    <Code>LD0/VMMXU1.PPV</Code>,
    <LnSplit prefix="V" cls="MMXU" />,
    <>線電壓 (DELTA 型別：phsAB/phsBC/phsCA)</>,
    <>21.717 kV ×3</>,
  ],
  [
    <Code>LD0/PEMMXU1.TotW</Code>,
    <LnSplit prefix="PE" cls="MMXU" />,
    <>三相總有效功率</>,
    <>-261.152 kW，負號代表功率流向與 IED 設定的正方向相反 (取決於 CT 極性與方向參數)</>,
  ],
  [
    <Code>LD0/PEMMXU1.TotVAr</Code>,
    <LnSplit prefix="PE" cls="MMXU" />,
    <>三相總虛功率</>,
    <>-1178.835 kVAr</>,
  ],
  [
    <Code>LD0/PEMMXU1.TotVA</Code>,
    <LnSplit prefix="PE" cls="MMXU" />,
    <>三相總視在功率</>,
    <>1207.42 kVA (無方向性)</>,
  ],
  [
    <Code>LD0/PEMMXU1.TotPF</Code>,
    <LnSplit prefix="PE" cls="MMXU" />,
    <>總功率因數</>,
    <>
      -0.216；PF 正負號慣例依廠商 (有的與 TotW 同號，有的用正負表示 lagging/leading)，須查 IED 手冊{' '}
      <UnverifiedBadge label="須查手冊" />
    </>,
  ],
  [
    <Code>LD0/FMMXU1.Hz</Code>,
    <LnSplit prefix="F" cls="MMXU" />,
    <>系統頻率</>,
    <>
      59.961 Hz，帶{' '}
      <span className="relative inline-flex align-text-bottom">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span className="sr-only">警告符號</span>
      </span>{' '}
      (
      <a href="#lab/checklist" className={LINK_CLASS}>
        見第 6 節待驗證清單
      </a>
      )
    </>,
  ],
  [
    <Code>LD0/RESCMMXU1.A</Code>,
    <LnSplit prefix="RESC" cls="MMXU" />,
    <>殘餘電流 (Residual current, I0 / 3I0)</>,
    <span className="text-slate-500">無值</span>,
  ],
  [
    <>
      <Code>LD0/VMMXU1.PhV</Code> <span className="text-xs text-slate-500">(相量圖)</span>
    </>,
    <LnSplit prefix="V" cls="MMXU" />,
    <>相電壓 (WYE)，IEDScout 自動以 phasor 顯示</>,
    <>12.537 kV，0° / -119.917° / +120.087°</>,
  ],
];

// ==========================================
// 2.5 數值交叉驗證
// ==========================================
function OkResult({ children }) {
  return (
    <span className="inline-flex items-start gap-1.5 text-emerald-300 font-bold">
      <Check className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </span>
  );
}

const SANITY_ROWS = [
  ['相電壓 × √3 = 線電壓', <span className="font-mono">12.537 × 1.732 = 21.715 kV</span>, <OkResult>≈ 21.717 kV</OkResult>],
  [
    'S = √(P² + Q²)',
    <span className="font-mono">√(261.152² + 1178.835²) = 1207.4</span>,
    <OkResult>≈ TotVA 1207.42</OkResult>,
  ],
  ['PF = P / S', <span className="font-mono">261.152 / 1207.42 = 0.2163</span>, <OkResult>≈ abs(TotPF) 0.216</OkResult>],
  [
    'S = √3 × U × I',
    <span className="font-mono">1.732 × 21.717 kV × 32.006 A = 1204 kVA</span>,
    <OkResult>與 1207 差 0.3%，來自顯示位數與 IED 內部計算</OkResult>,
  ],
];

// ==========================================
// 1.3 Browser 分頁的 VMMXU1 屬性
// ==========================================
function BoolValue({ value }) {
  return value === 'true' ? (
    <span className="font-mono font-bold text-amber-300">true</span>
  ) : (
    <span className="font-mono text-slate-400">false</span>
  );
}

const BROWSER_ROWS = [
  ['Mod', '', 'on'],
  ['Beh', '', 'on'],
  ['PPV', 'MX', '21.717 kV ×3'],
  ['PhV.phsA.cVal.mag', 'MX', '12.537 kV'],
  ['PhV.phsA.cVal.ang', 'MX', '0°'],
  ['PhV.phsA.q', 'MX', 'good'],
  ['PhV.phsA.t', 'MX', '2026-10-07 14:26:51.656'],
  ['PhV.phsA.units', 'CF', 'kV'],
  ['PhV.d', 'DC', '"VMMXU1 Phase to ground vol..." (截斷)'],
  ['PhV.phsB', 'MX', '12.539 kV ∠-119.917°'],
  ['PhV.phsC', 'MX', '12.537 kV ∠120.087°'],
  ['Blk', '', 'false'],
  ['HiAlm', '', 'true'],
  ['HiWrn', '', 'true'],
  ['LoWrn', '', 'false'],
  ['LoAlm', '', 'false'],
  ['VMeasMod', '', '2'],
  ['NumPh', '', '1'],
].map(([attr, fc, value]) => [
  <Code>{attr}</Code>,
  fc ? <FcBadge fc={fc} /> : <span className="text-xs text-slate-600">未記錄</span>,
  value === 'true' || value === 'false' ? <BoolValue value={value} /> : <span className="font-mono">{value}</span>,
]);

// ==========================================
// 6. 待驗證清單
// ==========================================
const CHECKLIST_ITEMS = [
  {
    id: 'c1',
    text: (
      <>
        <Code>LD0/CSMSQI1.SeqA</Code>、<Code>VSMSQI1.SeqV</Code>、<Code>RESVMMXU1.PhV</Code>、<Code>RESCMMXU1.A</Code>{' '}
        四張卡片無值的原因：讀各成員的 <Code>q</Code> (例如 <Code>LD0/CSMSQI1.SeqA.c1.q</Code>) 看 validity；按{' '}
        <strong>GI</strong> 看是否補到值；確認殘餘量是否設定為獨立端子輸入而實驗室未接線
      </>
    ),
  },
  {
    id: 'c2',
    text: (
      <>
        <Code>LD0/FMMXU1.Hz</Code> 的 ⚠：讀 <Code>LD0/FMMXU1.Hz.q</Code> 看 validity 與 detailQual；確認 IED
        額定頻率設定與注入頻率 (59.961 Hz) 是否一致
      </>
    ),
  },
  {
    id: 'c3',
    text: (
      <>
        <Code>rcbMeasFlt01</Code> 位於 <Code>LLN0</Code> 的 <Code>RP</Code> (URCB) 或 <Code>BR</Code> (BRCB)
      </>
    ),
  },
  {
    id: 'c4',
    text: (
      <>
        讀 <Code>rcbMeasFlt01</Code> 的 <Code>RptID</Code>、<Code>DatSet</Code>、<Code>TrgOps</Code>、
        <Code>OptFlds</Code>、<Code>IntgPd</Code>、<Code>BufTm</Code>、<Code>ConfRev</Code>、<Code>Resv</Code>/
        <Code>ResvTms</Code>、<Code>Owner</Code>
      </>
    ),
  },
  {
    id: 'c5',
    text: (
      <>
        列出 <Code>LLN0</Code> 底下全部 RCB 與對應 DataSet，比較各組的 TrgOps / BufTm / IntgPd 預設值
      </>
    ),
  },
  {
    id: 'c6',
    text: (
      <>
        以 <strong>IED properties</strong> 或 CID 的 <Code>{'<Services>'}</Code> 確認 <Code>DynDataSet</Code> 支援與{' '}
        <Code>ReportSettings</Code> 各欄位 (Dyn / Conf / Fix)
      </>
    ),
  },
  {
    id: 'c7',
    text: (
      <>
        按 <strong>Add DataSet</strong> 實測動態 DataSet 是否可建立
      </>
    ),
  },
  {
    id: 'c8',
    text: <>確認 IED 廠牌型號與韌體版本 (目前僅由命名推測為 ABB Relion)</>,
  },
  {
    id: 'c9',
    text: (
      <>
        <Code>VMMXU1.HiAlm</Code> / <Code>HiWrn</Code> 的門檻值設定
      </>
    ),
  },
  {
    id: 'c10',
    text: (
      <>
        <Code>TotPF</Code> 正負號慣例 (查 IED 手冊)
      </>
    ),
  },
  {
    id: 'c11',
    text: (
      <>
        以 Wireshark 同時擷取 Browser polling 與 Activity Monitor 訂閱，對照 Read 成對出現與 InformationReport
        事件驅動的差異
      </>
    ),
  },
];

// ==========================================
// VIEW 4: IEDScout 實測案例 (Dark Theme)
// ==========================================
export default function LabCaseView() {
  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 p-8 md:p-10 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 mb-4 tracking-tight">
          IEDScout 實測案例：訂閱 FD11_PMCC 的 MMS Report
        </h1>
        <p className="text-slate-400 text-base md:text-xl max-w-4xl mx-auto font-medium leading-relaxed">
          2026-10-07 在實驗室以 OMICRON IEDScout 觀察 IED FD11_PMCC (192.168.2.11) 的紀錄：Browser 分頁看到的屬性、Activity
          Monitor 收到的 report 卡片，以及尚待在 IED 上驗證的事項
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-slate-800/80 border border-amber-500/30 px-5 py-2 rounded-full backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <FlaskConical className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-slate-200 font-bold tracking-wide text-sm md:text-base">
            核心觀念：<span className="text-amber-400">Browser 分頁</span>是 Read 輪詢，
            <span className="text-amber-400">Activity Monitor</span> 是 Report 推送
          </span>
        </div>
      </div>

      {/* 章節跳轉 */}
      <nav className="max-w-[95rem] mx-auto px-4 md:px-8 mt-6" aria-label="本頁章節">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 md:p-4 flex flex-col gap-3">
          {JUMP_GROUPS.map((g) => (
            <div key={g.title} className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 w-full sm:w-auto">{g.title}</span>
              {g.items.map(([id, label]) => (
                <a
                  key={id}
                  href={`#lab/${id}`}
                  className="text-xs font-bold px-2 py-1 rounded-md border border-slate-700 bg-slate-950 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className="max-w-[95rem] mx-auto px-4 md:px-8 mt-8 space-y-8">
        {/* 1. 實驗環境現況 */}
        <SectionCard
          id="lab-setup"
          icon={<FlaskConical className="text-amber-500" />}
          title="實驗環境現況"
          en="Lab setup snapshot"
          intro="觀察當下的 client、IED 與訂閱的報告控制區塊 (Report Control Block, RCB)。凡是從畫面或命名推論、尚未在 IED 上驗證的項目，狀態欄以「未確認」標示並連到待驗證清單。"
        >
          <DataTable
            columns={[{ label: '項目', className: 'md:w-40' }, '值', { label: '狀態', className: 'md:w-72' }]}
            rows={SETUP_ROWS}
            caption="實驗環境 (2026-10-07，IED FD11_PMCC @ 192.168.2.11)"
          />

          <SubHeading id="lab-ln-list" title="畫面可見的 LN 清單" en="Visible logical nodes, partial" />
          <div className="flex flex-wrap gap-1.5 mb-3">
            {VISIBLE_LNS.map((ln) => (
              <Pill key={ln} tone={ED2_MONITOR_LNS.has(ln) ? 'amber' : ln === 'VMMXU1' ? 'sky' : 'slate'} className="font-mono">
                {ln}
              </Pill>
            ))}
          </div>
          <ul className="text-sm text-slate-400 leading-relaxed list-disc pl-5 space-y-1">
            <li>清單為 Browser 分頁捲動視窗的一部分，非完整。</li>
            <li>
              {ED2_MONITOR_CLASSES.map((cls) => (
                <Pill key={cls} tone="amber" className="font-mono mr-1">
                  {cls}
                </Pill>
              ))}
              為 IEC 61850-7-4 Ed.2 的監視類 LN (LN class 為 SCBR、SIMG、SOPM，前面的 S 是 prefix)。
            </li>
            <li>
              <Pill tone="sky" className="font-mono">
                VMMXU1
              </Pill>{' '}
              是本頁{' '}
              <a href="#lab/browser" className={LINK_CLASS}>
                Browser 分頁屬性
              </a>{' '}
              所展開的 LN。
            </li>
          </ul>
        </SectionCard>

        {/* 2. 標題列拆解 */}
        <SectionCard
          id="lab-header"
          icon={<Heading className="text-orange-500" />}
          title="標題列"
          en="Header"
          intro="Activity Monitor 視窗標題列顯示的是被訂閱的 RCB 完整 object reference。把它拆成片段，就能對應回 IEC 61850 的命名規則。"
        >
          <HeaderBreakdown />
          <div className="mt-6">
            <DataTable
              columns={[{ label: '片段', className: 'md:w-48' }, '意義']}
              rows={HEADER_TABLE_ROWS}
              caption={`標題列 ${RCB_REF} 各片段的意義 (完整對照表)`}
            />
          </div>
        </SectionCard>

        {/* 3. Activity Monitor 畫面重現 */}
        <SectionCard
          id="lab-monitor"
          icon={<LayoutGrid className="text-amber-500" />}
          title="Activity Monitor 觀察到的值"
          en="Observed report values"
          intro="依觀察到的 12 個 DataSet 成員 (FC = MX) 重現卡片網格。每張卡片右下的訂閱圖示代表值由 report 推送而來，與 Browser 分頁的 Read 輪詢無關。"
        >
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
            {/* 標題列 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-800/80 px-3 md:px-4 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <RcbIcon />
                <span className="font-mono text-sm md:text-base font-bold text-slate-100 break-all">{RCB_REF}</span>
              </div>
              <EnabledCheck />
            </div>

            {/* 卡片網格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-3 md:p-4">
              {MONITOR_TILES.map((tile) => (
                <MonitorTile key={tile.path} tile={tile} />
              ))}
            </div>

            {/* 底部輪詢列 */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700 bg-slate-800/60 px-3 md:px-4 py-1.5 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Rss className="w-3.5 h-3.5 text-amber-400" /> 有此圖示的卡片由 report 推送
              </span>
              <span className="font-mono">Polling: 1 s</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Callout tone="warn" title="LD0/FMMXU1.Hz 卡片帶 ⚠ 警告符號">
              59.961 Hz，卡片帶 ⚠ 警告符號，標籤為黃底。原因尚待驗證，見{' '}
              <a href="#lab/checklist" className={LINK_CLASS}>
                待驗證清單
              </a>
              。
            </Callout>
            <Callout tone="info" title="四張卡片顯示短橫線">
              <Code>LD0/CSMSQI1.SeqA</Code>、<Code>LD0/VSMSQI1.SeqV</Code>、<Code>LD0/RESVMMXU1.PhV</Code>、
              <Code>LD0/RESCMMXU1.A</Code> 無值。短橫線的意義見下一節「卡片構造」，可能原因見{' '}
              <a href="#lab/checklist" className={LINK_CLASS}>
                待驗證清單
              </a>
              ；Read 與 Report 的差別見{' '}
              <a href="#report/read-vs-report" className={LINK_CLASS}>
                Report 分頁的 Read vs Report
              </a>
              。
            </Callout>
          </div>
        </SectionCard>

        {/* 4. 卡片構造 */}
        <SectionCard
          id="lab-tiles"
          icon={<SquareDashed className="text-orange-500" />}
          title="卡片構造"
          en="Tile anatomy"
          intro="每張 Activity Monitor 卡片上的元素各有意義，對應到 FC、DataSet 成員型態與 IEDScout 自己的指示標記。"
        >
          <DataTable columns={[{ label: '位置', className: 'md:w-44' }, '意義']} rows={TILE_ROWS} caption="卡片各部位的意義" />
        </SectionCard>

        {/* 5. 成員逐一說明 */}
        <SectionCard
          id="lab-members"
          icon={<ListTree className="text-amber-500" />}
          title="成員逐一說明"
          en="Member-by-member"
          intro="先看 LN 命名規則，再逐一解讀 12 個 DataSet 成員代表的量與目前的值。"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">LN 命名規則</div>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                <strong className="text-slate-100">prefix + LN class + instance</strong>，例如 <Code>RESVMMXU1</Code> =
              </p>
              <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                {LN_PARTS.map((part, i) => (
                  <Fragment key={part.label}>
                    {i > 0 && <span className="text-slate-500">+</span>}
                    <span className={`px-2 py-1 rounded-md border font-bold ${part.box}`}>{part.value}</span>
                  </Fragment>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {LN_PARTS.map((part) => (
                  <span key={part.label}>
                    <span className={`font-bold ${part.text}`}>{part.label}</span> {part.value}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">本頁出現的 LN class</div>
              <ul className="text-sm text-slate-300 leading-relaxed space-y-2">
                <li>
                  <Code tone="amber">MMXU</Code> = Measurement (三相量測)
                </li>
                <li>
                  <Code tone="amber">MSQI</Code> = Sequence and Imbalance (序分量與不平衡)
                </li>
                <li className="text-slate-400">兩者皆定義於 IEC 61850-7-4。</li>
              </ul>
            </div>
          </div>

          <DataTable
            columns={[{ label: '卡片', className: 'md:w-56' }, { label: 'LN 拆解', className: 'md:w-32' }, '代表意義', '目前值解讀']}
            rows={MEMBER_ROWS}
            caption="12 個 DataSet 成員 (FC = MX)"
          />
        </SectionCard>

        {/* 6. 相量圖 */}
        <SectionCard
          id="lab-phasor"
          icon={<Compass className="text-orange-500" />}
          title="相量圖"
          en="Phasor tile"
          intro="LD0/VMMXU1.PhV 是 WYE 型別的相電壓，IEDScout 自動以 phasor 顯示。本頁示意圖以 phsA 為 0°、逆時針為正角方向繪製，三條向量長度依 12.537 kV 對外圈 20.00 kV 的比例縮放。"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col items-center">
              <PhasorDiagram size={260} />
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-xs">
                {PHASORS.map((p) => (
                  <span key={p.id} className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-200">{p.id}</span>
                    <span className="text-slate-400">
                      {p.mag} kV ∠{p.angleText}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <ul className="lg:col-span-3 space-y-3 text-sm text-slate-300 leading-relaxed">
              {PHASOR_NOTES.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>

        {/* 7. 數值交叉驗證 */}
        <SectionCard
          id="lab-sanity"
          icon={<Calculator className="text-amber-500" />}
          title="數值交叉驗證"
          en="Sanity check"
          intro="用卡片上的數值互相驗算，確認各成員彼此一致，也順便看出注入訊號的性質。"
        >
          <DataTable
            columns={[{ label: '檢查', className: 'md:w-48' }, '計算', '結果']}
            rows={SANITY_ROWS}
            caption="以觀察值互相驗算"
          />
          <div className="mt-4">
            <Callout tone="info" title="功率角：atan2(Q, P)">
              <span className="font-mono">atan2(Q, P) = atan2(-1179, -261) ≈ -102.5°</span>
              ：注入電流與電壓相差約 100° 且方向反向，幾乎純虛功，應為刻意設定的測試注入而非真實負載。
            </Callout>
          </div>
        </SectionCard>

        {/* 8. Browser 分頁的 VMMXU1 屬性 */}
        <SectionCard
          id="lab-browser"
          icon={<PanelLeft className="text-orange-500" />}
          title="Browser 分頁的 VMMXU1 屬性"
          en="Left panel, VMMXU1"
          intro="Browser 分頁左側面板展開 VMMXU1 後看到的屬性與值。這一區的資料由 MMS Read 取得，並以 Polling: 1 s 持續輪詢更新。"
        >
          <DataTable
            columns={[{ label: '屬性', className: 'md:w-56' }, { label: 'FC', className: 'md:w-16' }, '值']}
            rows={BROWSER_ROWS}
            caption="Browser 分頁左側面板：VMMXU1 (Polling: 1 s)"
            dense
          />
          <div className="mt-4">
            <Callout tone="warn" title="HiAlm / HiWrn 同時為 true">
              <Code>HiAlm</Code> / <Code>HiWrn</Code> 同時為 true：21.717 kV 對 20 kV 約 108.6%，推測為過壓警告與警報門檻被觸發{' '}
              <UnverifiedBadge />。門檻值在 IED 參數中，尚未確認，列於{' '}
              <a href="#lab/checklist" className={LINK_CLASS}>
                待驗證清單
              </a>
              。
            </Callout>
          </div>
        </SectionCard>

        {/* 9. 待驗證清單 */}
        <SectionCard
          id="lab-checklist"
          icon={<ListChecks className="text-amber-500" />}
          title="待驗證清單"
          en="Open items / checklist"
        >
          <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-4">
            這些是尚未在 IED 上驗證的事項，站內所有「<UnverifiedBadge href="#lab/checklist" />」標籤都連到這裡。
          </p>
          <Checklist items={CHECKLIST_ITEMS} storageKey="lab-checklist-v1" />
        </SectionCard>
      </div>
    </div>
  );
}
