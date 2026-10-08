import { Rss } from 'lucide-react';
import ReportMechanism from './report/ReportMechanism.jsx';
import ReportDataSet from './report/ReportDataSet.jsx';

// 本頁章節跳轉清單。hash 格式為 #report/<section>，對應元素 id="report-<section>"
const JUMP_GROUPS = [
  {
    title: 'Report 機制',
    items: [
      ['positioning', '定位'],
      ['building-blocks', '三要件'],
      ['rcb', 'RCB 屬性'],
      ['trgops', 'TrgOps / OptFlds'],
      ['payload', 'Report 內容'],
      ['urcb-brcb', 'URCB vs BRCB'],
      ['instances', 'Instance'],
      ['sequence', '啟用流程'],
      ['wireshark', 'Wireshark'],
      ['read-vs-report', 'Read vs Report'],
    ],
  },
  {
    title: 'DataSet 與設計',
    items: [
      ['roles', '兩個角色'],
      ['grouping', '典型分組'],
      ['custom', '自訂 DataSet'],
      ['services', 'SCL Services'],
      ['design', '設計建議'],
      ['capability', '軟體端能否自訂'],
      ['redteam', '紅隊視角'],
      ['standards', '標準對照'],
    ],
  },
];

// ==========================================
// VIEW 3: MMS Report (Dark Theme)
// ==========================================
export default function ReportView() {
  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 p-8 md:p-10 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-4 tracking-tight">
          MMS Report 機制深度解析
        </h1>
        <p className="text-slate-400 text-base md:text-xl max-w-4xl mx-auto font-medium leading-relaxed">
          IEC 61850 的 server 主動推送：DataSet、Report Control Block (RCB)、觸發條件，以及 Read 輪詢與 Report 推送的差別
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-slate-800/80 border border-emerald-500/30 px-5 py-2 rounded-full backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Rss className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-slate-200 font-bold tracking-wide text-sm md:text-base">
            核心觀念：<span className="text-emerald-400">DataSet</span> 決定「送什麼」，
            <span className="text-emerald-400">RCB</span> 決定「何時送、怎麼送、送給誰」
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
                  href={`#report/${id}`}
                  className="text-xs font-bold px-2 py-1 rounded-md border border-slate-700 bg-slate-950 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className="max-w-[95rem] mx-auto px-4 md:px-8 mt-8 space-y-8">
        <ReportMechanism />
        <ReportDataSet />
      </div>
    </div>
  );
}
