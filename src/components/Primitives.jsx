import { Info, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const CODE_TONES = {
  purple: 'text-purple-300',
  fuchsia: 'text-fuchsia-300',
  amber: 'text-amber-300',
  emerald: 'text-emerald-300',
  sky: 'text-sky-300',
  slate: 'text-slate-200',
};

/** 行內程式碼或物件路徑，例如 <Code>LD0/VMMXU1.PhV</Code> */
export function Code({ children, tone = 'purple', className = '' }) {
  return (
    <code
      className={`font-mono text-[0.85em] bg-slate-800 px-1 py-0.5 rounded break-words ${CODE_TONES[tone] || CODE_TONES.purple} ${className}`}
    >
      {children}
    </code>
  );
}

const FC_COLORS = {
  ST: 'text-green-400 border-green-500/30 bg-green-500/10',
  MX: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  CO: 'text-red-400 border-red-500/30 bg-red-500/10',
  SP: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  SG: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  CF: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  DC: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
  RP: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  BR: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  GO: 'text-red-300 border-red-400/30 bg-red-400/10',
};

/** Functional Constraint 小標籤，顏色與資料模型分頁一致 */
export function FcBadge({ fc, className = '' }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${FC_COLORS[fc] || FC_COLORS.DC} ${className}`}
    >
      {fc}
    </span>
  );
}

const PILL_TONES = {
  slate: 'text-slate-300 border-slate-600 bg-slate-800',
  indigo: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10',
  emerald: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
  amber: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  red: 'text-red-300 border-red-500/40 bg-red-500/10',
  sky: 'text-sky-300 border-sky-500/40 bg-sky-500/10',
  purple: 'text-purple-300 border-purple-500/40 bg-purple-500/10',
  rose: 'text-rose-300 border-rose-500/40 bg-rose-500/10',
};

/** 圓角小標籤，例如「已確認」「URCB」「推送」 */
export function Pill({ children, tone = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${PILL_TONES[tone] || PILL_TONES.slate} ${className}`}
    >
      {children}
    </span>
  );
}

/** 章節內的雙語小標題 (h3)，id 供深連結使用 */
export function SubHeading({ id, title, en, className = '' }) {
  return (
    <h3
      id={id}
      className={`scroll-mt-24 text-base md:text-lg font-bold text-slate-100 flex flex-wrap items-baseline gap-x-2 mt-8 mb-3 first:mt-0 ${className}`}
    >
      <span>{title}</span>
      {en && <span className="text-xs md:text-sm font-semibold text-slate-500">{en}</span>}
    </h3>
  );
}

const CALLOUT_TONES = {
  info: { box: 'bg-blue-500/10 border-blue-500/20', title: 'text-blue-300', Icon: Info, icon: 'text-blue-400' },
  warn: { box: 'bg-amber-500/10 border-amber-500/20', title: 'text-amber-300', Icon: AlertTriangle, icon: 'text-amber-400' },
  danger: { box: 'bg-red-500/10 border-red-500/30', title: 'text-red-300', Icon: ShieldAlert, icon: 'text-red-400' },
  ok: { box: 'bg-emerald-500/10 border-emerald-500/20', title: 'text-emerald-300', Icon: CheckCircle2, icon: 'text-emerald-400' },
};

/** 提示框：info (說明)、warn (注意)、danger (資安風險)、ok (驗證通過) */
export function Callout({ tone = 'info', title, children, className = '' }) {
  const t = CALLOUT_TONES[tone] || CALLOUT_TONES.info;
  const Icon = t.Icon;
  return (
    <div className={`flex items-start gap-3 border rounded-lg p-3 md:p-4 text-sm leading-relaxed ${t.box} ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${t.icon}`} />
      <div className="min-w-0 text-slate-300">
        {title && <p className={`font-bold mb-1 ${t.title}`}>{title}</p>}
        {children}
      </div>
    </div>
  );
}
