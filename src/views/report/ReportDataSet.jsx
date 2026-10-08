import { useState } from 'react';
import {
  Users,
  Layers,
  ListPlus,
  FileCode,
  Compass,
  SlidersHorizontal,
  Key,
  Target,
  BookOpen,
  Hash,
  Package,
  Cpu,
  Wrench,
  Lightbulb,
} from 'lucide-react';
import SectionCard from '../../components/SectionCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import UnverifiedBadge from '../../components/UnverifiedBadge.jsx';
import { Code, FcBadge, Pill, Callout } from '../../components/Primitives.jsx';

const LINK_CLASS = 'text-emerald-300 underline underline-offset-2 hover:text-emerald-200';

// ==========================================
// 5.1 兩個角色
// ==========================================
const ROLE_ROWS = [
  [
    <span className="font-bold text-slate-100">工程設計者 (engineering)</span>,
    <>
      定義 DataSet 成員、建幾個 RCB、每個 RCB 的 <Code>TrgOps</Code> / <Code>BufTm</Code> / <Code>IntgPd</Code> / max instance
    </>,
    <>廠商設定工具 (ABB 為 PCM600) 或 SCL 編輯器，寫進 CID 後下載至 IED</>,
    <Pill tone="indigo">變電站工程階段</Pill>,
  ],
  [
    <span className="font-bold text-slate-100">訂閱者 (client)</span>,
    <>
      讀 RCB、預約 instance、必要時微調 <Code>TrgOps</Code> / <Code>OptFlds</Code> / <Code>IntgPd</Code>、啟用、GI
    </>,
    <>IEDScout、SCADA gateway</>,
    <Pill tone="emerald">連線時</Pill>,
  ],
];

// ==========================================
// 5.2 典型分組 (廠商範例：ABB Relion 預設)
// ==========================================
const GROUP_ROWS = [
  [
    <Code>StatUrg</Code>,
    <>
      緊急狀態：保護動作、跳脫、斷路器位置 <FcBadge fc="ST" />
    </>,
    <Pill tone="rose">BRCB</Pill>,
    <>
      <Code>TrgOps</Code> = dchg + qchg，<Code>BufTm</Code> 很短
    </>,
  ],
  [
    <Code>StatNrml</Code>,
    <>
      一般狀態：警報、監視訊號 <FcBadge fc="ST" />
    </>,
    <Pill tone="rose">BRCB</Pill>,
    <>
      <Code>BufTm</Code> 可稍長
    </>,
  ],
  [
    <Code>StatIed</Code>,
    <>
      IED 自身狀態：自診斷、設定群組 <FcBadge fc="ST" />
    </>,
    <Pill tone="rose">BRCB</Pill>,
    <>變化少</>,
  ],
  [
    <Code>MeasFlt</Code>,
    <>
      浮點量測：電壓、電流、功率、頻率 <FcBadge fc="MX" />
    </>,
    <Pill tone="indigo">URCB</Pill>,
    <>
      <Code>TrgOps</Code> = dchg，靠 deadband 過濾，搭配 <Code>IntgPd</Code>
    </>,
  ],
  [
    <Code>MeasReg</Code>,
    <>
      計量、能量累計 <FcBadge fc="MX" />
    </>,
    <Pill tone="indigo">URCB</Pill>,
    <>
      多用 dupd 或 <Code>IntgPd</Code>
    </>,
  ],
];

// ==========================================
// 5.3 想看的值不在既有 DataSet 時
// ==========================================
const CUSTOM_ROWS = [
  [
    <span className="font-bold text-slate-100">1. 找既有 RCB 直接訂</span>,
    <>想看的 DO 已在某個 DataSet 內</>,
    <>最省事；可同時訂多個 RCB</>,
  ],
  [
    <span className="font-bold text-slate-100">2. 動態建 DataSet</span>,
    <>
      IED 支援 <Code>DynDataSet</Code>，且 URCB 的 <Code>DatSet</Code> 可寫
    </>,
    <>
      IEDScout 的 <strong className="text-slate-100">Add DataSet</strong>：挑 FCDA → 建 DataSet → 綁到空的 URCB instance →
      Enable。非持久性；BRCB 多半不允許改 <Code>DatSet</Code>
    </>,
  ],
  [
    <span className="font-bold text-slate-100">3. 改 CID 重新下載</span>,
    <>有廠商工具與工程權限</>,
    <>永久生效、SCADA 也能用，但等於改變電站工程設定</>,
  ],
];

// ==========================================
// 5.4 SCL Services 判讀
// ==========================================
const SERVICES_XML = `<Services>
  <DynDataSet max="20"/>
  <ConfDataSet max="20" maxAttributes="100"/>
  <ReportSettings cbName="Conf" datSet="Dyn" rptID="Dyn"
                  optFields="Dyn" bufTime="Dyn" trgOps="Dyn" intgPd="Dyn"/>
</Services>`;

// ==========================================
// 5.5 設計建議：四個限制
// ==========================================
const DESIGN_LIMITS = [
  {
    id: 'instances',
    icon: <Hash className="w-5 h-5 text-emerald-400" />,
    title: 'Instance 數固定',
    desc: (
      <>
        IED 最多同時服務幾個 report client，在 SCL 階段即決定，每個 client 佔一個 instance，名額用完就不能再訂閱 (見{' '}
        <a href="#report/instances" className={LINK_CLASS}>
          Instance 概念
        </a>
        )。
      </>
    ),
  },
  {
    id: 'pdu',
    icon: <Package className="w-5 h-5 text-emerald-400" />,
    title: 'DataSet 成員上限與 PDU 大小',
    desc: <>單一 DataSet 的成員數有上限，report 過大也受 PDU 大小限制，超過需分段 (segmentation)。</>,
  },
  {
    id: 'cpu',
    icon: <Cpu className="w-5 h-5 text-emerald-400" />,
    title: 'IED 觸發判斷負擔',
    desc: <>每一組 report 都要跑 deadband 與觸發判斷；deadband 太小會狂送。</>,
  },
  {
    id: 'maintain',
    icon: <Wrench className="w-5 h-5 text-emerald-400" />,
    title: '可維護性',
    desc: (
      <>
        每多一組就多一份 <Code>ConfRev</Code>、<Code>RptID</Code> 與 SCADA 點表要對應維護。
      </>
    ),
  },
];

// ==========================================
// 5.6 軟體端能否自訂觀察內容 (點選 IED 的能力，顯示軟體端能做的事)
// ==========================================
const CAPABILITY_OPTIONS = [
  {
    id: 'dyn',
    label: '支援 DynDataSet，且 datSet="Dyn"',
    verdict: '完全自訂',
    verdictTone: 'emerald',
    capability: (
      <>
        支援 <Code>DynDataSet</Code>，且 RCB <Code>datSet="Dyn"</Code>
      </>
    ),
    can: <>完全自訂：自選 DO / DA 組 DataSet，綁到空的 URCB instance，啟用</>,
    how: (
      <>
        <strong className="text-slate-100">Add DataSet</strong> → 勾選成員 → 指定 RCB → Enable；非持久
      </>
    ),
  },
  {
    id: 'params',
    label: '無動態 DataSet，但參數為 Dyn',
    verdict: '行為可調',
    verdictTone: 'amber',
    capability: (
      <>
        不支援動態 DataSet，但 <Code>trgOps</Code> / <Code>optFields</Code> / <Code>intgPd</Code> / <Code>bufTime</Code> 為{' '}
        <Code>Dyn</Code>
      </>
    ),
    can: <>內容不能改，行為可調</>,
    how: <>在 RCB 設定調參數再啟用</>,
  },
  {
    id: 'fixed',
    label: '全部 Conf / Fix',
    verdict: '原樣訂閱',
    verdictTone: 'slate',
    capability: (
      <>
        全部 <Code>Conf</Code> / <Code>Fix</Code>
      </>
    ),
    can: <>只能原樣訂閱現成 RCB</>,
    how: <>Enable、GI、Disable</>,
  },
];

const OPTION_BUTTON = {
  active: 'border-emerald-500/70 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  idle: 'border-slate-700 bg-slate-950 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300',
};

// ==========================================
// 7. 紅隊視角
// ==========================================
const REDTEAM_CARDS = [
  {
    id: 'no-auth',
    title: '純 MMS 沒有認證與授權',
    body: (
      <>
        純 IEC 61850-8-1 的 MMS 沒有認證與授權，能建立 association 就能讀寫 RCB；是否實作 IEC 62351-4 (TLS + ACSE 認證)
        決定了這些操作能否被任意 client 執行。
      </>
    ),
  },
  {
    id: 'exhaust',
    title: '佔滿 instance 造成合法 SCADA 無法訂閱',
    body: (
      <>
        佔滿所有 instance 的 <Code>Resv</Code> / <Code>ResvTms</Code>，合法 SCADA 即無法訂閱；只用標準服務即可做到。
      </>
    ),
  },
  {
    id: 'datset',
    title: 'RptEna=false 時可改 DatSet',
    body: (
      <>
        <Code>RptEna</Code>=false 時 <Code>DatSet</Code> 可寫，若 IED 支援動態 DataSet，可讓 report 改送其他內容；啟用中的 RCB
        應僅佔用者可改，但各家實作是否確實檢查 <Code>Owner</Code> 不一定。
      </>
    ),
  },
  {
    id: 'disconnect',
    title: 'URCB 斷線即丟，BRCB 緩衝有限',
    body: (
      <>
        URCB 斷線即丟、BRCB 緩衝有限且會 <Code>BufOvfl</Code>，決定了「打斷連線」對上層系統的實際影響範圍。
      </>
    ),
  },
];

// ==========================================
// 8. 標準對照
// ==========================================
const STANDARD_ROWS = [
  [
    <Code tone="sky">IEC 61850-7-2</Code>,
    <>ACSI：Report control class (URCB / BRCB)、DataSet、object reference 格式</>,
  ],
  [
    <Code tone="sky">IEC 61850-7-3</Code>,
    <>
      CDC：WYE、DELTA、CMV、SEQ、MV、Quality (<Code>q</Code>)、<Code>db</Code> / <Code>rangeC</Code> deadband
    </>,
  ],
  [
    <Code tone="sky">IEC 61850-7-4</Code>,
    <>LN class：LLN0、MMXU、MSQI、SSCBR、SSIMG、SSOPM；LN 命名 (prefix + class + instance)</>,
  ],
  [
    <Code tone="sky">IEC 61850-8-1</Code>,
    <>
      MMS 對應：RCB 以 <Code>$RP$</Code> / <Code>$BR$</Code> 命名、Write / Read / InformationReport、TimeOfEntry 編碼
    </>,
  ],
  [
    <Code tone="sky">IEC 61850-6</Code>,
    <>
      SCL：<Code>{'<DataSet>'}</Code>、<Code>{'<ReportControl buffered max>'}</Code>、<Code>{'<Services>'}</Code> (
      <Code>DynDataSet</Code>、<Code>ConfDataSet</Code>、<Code>ReportSettings</Code>)、<Code>ClientLN</Code>
    </>,
  ],
  [<Code tone="sky">IEC 62351-4</Code>, <>MMS / ACSE 的認證與 TLS 保護</>],
];

export default function ReportDataSet() {
  const [capabilityId, setCapabilityId] = useState(CAPABILITY_OPTIONS[0].id);
  const selected = CAPABILITY_OPTIONS.find((o) => o.id === capabilityId) || CAPABILITY_OPTIONS[0];

  return (
    <>
      {/* 5.1 兩個角色 */}
      <SectionCard
        id="report-roles"
        icon={<Users className="text-emerald-500" />}
        title="兩個角色"
        en="Two roles"
        intro="Report 的設定分兩個階段、由兩種角色完成：工程階段決定有哪些 DataSet 與 RCB，連線時 client 只負責啟用與微調。"
      >
        <DataTable
          columns={['角色', { label: '做什麼', cellClassName: 'min-w-56' }, { label: '工具', cellClassName: 'min-w-48' }, '時機']}
          rows={ROLE_ROWS}
        />
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          RCB 各屬性的意義見{' '}
          <a href="#report/rcb" className={LINK_CLASS}>
            RCB 屬性
          </a>
          ；instance 名額的概念見{' '}
          <a href="#report/instances" className={LINK_CLASS}>
            Instance
          </a>
          。
        </p>
        <Callout tone="info" title="對照實驗環境" className="mt-4">
          <Code>rcbMeasFlt01</Code> 是工程階段的成果，IEDScout 只是啟用它。
        </Callout>
      </SectionCard>

      {/* 5.2 典型分組 */}
      <SectionCard
        id="report-grouping"
        icon={<Layers className="text-teal-500" />}
        title="典型分組"
        en="Typical grouping"
        intro="工程階段通常不會替每個量測各開一組 report，而是依資料性質分成少數幾組。下表是廠商的範例分組 (以 ABB Relion 的預設為例)。"
      >
        <Callout tone="warn" title="這是廠商範例，不是實驗 IED 的實測結果" className="mb-4">
          下表取自 ABB Relion 的預設分組，用來說明分組邏輯。實驗 IED (<Code>FD11_PMCC</Code>) 的廠牌目前僅由 LN
          與 RCB 的命名風格推測為 ABB Relion <UnverifiedBadge />，實際分組請以 IED properties 或 ICD / CID 為準。
        </Callout>
        <DataTable
          columns={['群組', { label: '內容', cellClassName: 'min-w-56' }, 'RCB 類型', '典型參數']}
          rows={GROUP_ROWS}
          caption="ABB Relion 預設分組 (廠商範例)"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <p className="font-bold text-slate-100 mb-2">分組邏輯</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-bold text-emerald-300">同一組成員使用同一種觸發行為與可靠度等級。</span>
              狀態需要不漏，量測需要 deadband 降噪，參數互相衝突，所以分開。
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <p className="font-bold text-slate-100 mb-2">「很多 report」的真相</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              「很多 report」實際上是「<span className="font-bold text-emerald-300">少數幾組 × 每組幾個 client 名額</span>
              」：組數由資料性質決定，名額由 <Code>max</Code> instance 決定。
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          實驗中訂閱的 <Code>rcbMeasFlt01</Code> 由名稱推斷對應 <Code>MeasFlt</Code> 這一組浮點量測 DataSet <UnverifiedBadge />
          ，須讀 RCB 的 <Code>DatSet</Code> 屬性確認。
        </p>
      </SectionCard>

      {/* 5.3 想看的值不在既有 DataSet 時 */}
      <SectionCard
        id="report-custom"
        icon={<ListPlus className="text-emerald-500" />}
        title="想看的值不在既有 DataSet 時"
        en="Custom sets"
        intro="想觀察的 DO 不在任何現成 DataSet 內時，依 IED 能力與手上的權限，有三種做法。"
      >
        <DataTable columns={['做法', '前提', '優缺點']} rows={CUSTOM_ROWS} />
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          做法 2 是否可行，由 IED 在 SCL 的 <Code>{'<Services>'}</Code> 宣告決定，判讀方式見{' '}
          <a href="#report/services" className={LINK_CLASS}>
            SCL Services 判讀
          </a>
          。
        </p>
      </SectionCard>

      {/* 5.4 SCL Services 判讀 */}
      <SectionCard
        id="report-services"
        icon={<FileCode className="text-teal-500" />}
        title="SCL Services 判讀"
        en="Reading the Services section"
        intro={
          <>
            IED 的 ICD / CID 在 <Code>{'<Services>'}</Code> 區段宣告它支援哪些服務能力。下面是一個範例片段，以及判讀重點。
          </>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4">
          <pre className="text-xs md:text-sm leading-relaxed font-mono text-emerald-200">
            <code>{SERVICES_XML}</code>
          </pre>
        </div>
        <ul className="mt-5 space-y-3 text-sm text-slate-300 leading-relaxed">
          <li className="flex gap-3">
            <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              <Code>datSet="Dyn"</Code>：client 可改 RCB 的 <Code>DatSet</Code>；<Code>"Conf"</Code>：只能工程階段改；
              <Code>"Fix"</Code>：完全固定。
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              <Code>DynDataSet max</Code>：動態 DataSet 上限；<Code>ConfDataSet maxAttributes</Code>：單一 DataSet 成員上限。
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              在 IEDScout 以 <strong className="text-slate-100">Open SCL</strong> 載入 CID，或點{' '}
              <strong className="text-slate-100">IED properties</strong> 皆可見。
            </span>
          </li>
        </ul>
        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          這些宣告直接決定軟體端能自訂到什麼程度，可在{' '}
          <a href="#report/capability" className={LINK_CLASS}>
            軟體端能否自訂觀察內容
          </a>{' '}
          點選對應情境查看。
        </p>
      </SectionCard>

      {/* 5.5 設計建議 */}
      <SectionCard
        id="report-design"
        icon={<Compass className="text-emerald-500" />}
        title="設計建議"
        en="Design guidance"
        intro="不建議開很多 report，會被以下四個限制卡住。"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DESIGN_LIMITS.map((item) => (
            <div key={item.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-100 mb-1">{item.title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 md:p-5 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <p className="font-bold text-emerald-300">建議</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                依「<span className="text-slate-100 font-bold">資料性質 + 時效</span>」分 4 到 6 組，每組參數一致。
              </li>
              <li>臨時組合用動態 DataSet，用完即丟，不要為了一次性的觀察去改工程設定。</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* 5.6 軟體端能否自訂觀察內容 */}
      <SectionCard
        id="report-capability"
        icon={<SlidersHorizontal className="text-teal-500" />}
        title="軟體端能否自訂觀察內容"
        en="Can the client customize"
      >
        <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-5">
          <span className="font-bold text-emerald-300">可以，但由 IED 在 SCL <Code>{'<Services>'}</Code> 宣告的能力決定</span>
          ，client 軟體無法越過。點選下方 IED 的能力，查看軟體端能做的事與做法。
        </p>

        {/* 決定部分：用按鈕點選 IED 的能力 */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 md:p-5">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 mb-3">
            IED 的能力 (依 <Code>{'<Services>'}</Code> 宣告)
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="選擇 IED 的能力">
            {CAPABILITY_OPTIONS.map((opt) => {
              const active = opt.id === capabilityId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCapabilityId(opt.id)}
                  aria-pressed={active}
                  className={`text-xs md:text-sm font-bold px-3 py-2 rounded-lg border transition-colors ${
                    active ? OPTION_BUTTON.active : OPTION_BUTTON.idle
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 md:p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">IED 的能力</p>
              <p className="text-sm text-slate-300 leading-relaxed">{selected.capability}</p>
            </div>
            <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-3 md:p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                軟體端能做的事 <Pill tone={selected.verdictTone}>{selected.verdict}</Pill>
              </p>
              <p className="text-sm text-slate-200 leading-relaxed">{selected.can}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 md:p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">怎麼做</p>
              <p className="text-sm text-slate-300 leading-relaxed">{selected.how}</p>
            </div>
          </div>
        </div>

        <DataTable
          className="mt-5"
          columns={['IED 的能力', '軟體端能做的事', '怎麼做']}
          rows={CAPABILITY_OPTIONS.map((opt) => [opt.capability, opt.can, opt.how])}
          caption="完整對照表 (三種情況並列)"
        />

        <Callout tone="info" title="任何情況下都能做、但不算「自訂 report」的兩件事" className="mt-5">
          <ul className="list-disc pl-5 space-y-1">
            <li>卡片的 X 只隱藏畫面，IED 仍照送該成員。</li>
            <li>Browser 的 Read 輪詢可看任何 DO，但沒有 report 的附加資訊。</li>
          </ul>
        </Callout>
      </SectionCard>

      {/* 7. 紅隊視角 */}
      <SectionCard
        id="report-redteam"
        icon={<Key className="text-red-400" />}
        title="紅隊視角：Report 服務的攻擊面"
        en="Testing notes (red team view)"
        className="relative overflow-hidden bg-slate-950! border-red-900/50! shadow-[0_0_30px_rgba(220,38,38,0.1)]! [&>h2]:text-red-400 [&>h2]:border-red-900/50"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none" aria-hidden="true">
          <Target className="w-32 h-32 text-red-500" />
        </div>
        <div className="space-y-4 text-sm relative z-10">
          <p className="text-slate-300">
            Report 服務全靠 client 對 RCB 的 Write 來設定與啟用，以下四點是從這個機制直接推得的攻擊面。
          </p>
          {REDTEAM_CARDS.map((card) => (
            <div key={card.id} className="bg-slate-900 p-3 md:p-4 rounded border-l-2 border-red-500">
              <p className="font-bold text-red-400 mb-1">{card.title}</p>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{card.body}</p>
            </div>
          ))}
          <Callout tone="warn">本區供授權測試與防護設計參考。</Callout>
        </div>
      </SectionCard>

      {/* 8. 標準對照 */}
      <SectionCard
        id="report-standards"
        icon={<BookOpen className="text-emerald-500" />}
        title="標準對照"
        en="Standards references"
        intro="本頁提到的名詞與機制，分別定義在以下標準。"
      >
        <DataTable columns={[{ label: '標準', cellClassName: 'whitespace-nowrap' }, '相關內容']} rows={STANDARD_ROWS} />
      </SectionCard>
    </>
  );
}
