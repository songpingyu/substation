import { useState } from 'react';
import {
  Compass,
  Boxes,
  Settings2,
  Zap,
  Package,
  GitCompare,
  Hash,
  ListOrdered,
  Radar,
  ArrowLeftRight,
  Database,
  Bell,
  ArrowRight,
  Lock,
  Unlock,
  MousePointerClick,
  Eye,
  Rss,
  RefreshCw,
  Send,
} from 'lucide-react';
import SectionCard from '../../components/SectionCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import SequenceDiagram from '../../components/SequenceDiagram.jsx';
import UnverifiedBadge from '../../components/UnverifiedBadge.jsx';
import { Code, FcBadge, Pill, SubHeading, Callout } from '../../components/Primitives.jsx';

// ==========================================
// 資料常數 (內容來源：docs/iedscout_mms_report_notes.md 第 3、4 節)
// ==========================================

// 3.1 層次 / 內容
const POSITIONING_ROWS = [
  [
    '抽象服務 (IEC 61850-7-2 ACSI)',
    <>
      Report control class：<Code>URCB</Code> (Unbuffered) 與 <Code>BRCB</Code> (Buffered)
    </>,
  ],
  [
    'MMS 服務 (IEC 61850-8-1)',
    <>
      client 用 <Code>Write</Code> 設定 RCB 屬性、<Code>Read</Code> 讀回；server 用 <Code>InformationReport</Code>{' '}
      (unconfirmed service，client 不回應) 推送
    </>,
  ],
  [
    '傳輸',
    <>
      既有的 MMS association (TCP 102，RFC 1006 / ISO transport)。Report 綁在該 association 上：連線斷了 URCB 的 report
      即消失，BRCB 則先緩衝
    </>,
  ],
  [
    '資料模型位置',
    <>
      RCB 掛在 LN 底下 (實務上幾乎都在 <Code>LLN0</Code>)，MMS 物件名稱形如{' '}
      <Code>FD11_PMCCLD0/LLN0$RP$rcbMeasFlt01</Code> (URCB) 或 <Code>$BR$</Code> (BRCB)。
      <span className="block mt-1 text-xs text-slate-500">
        本實驗訂閱的 <Code tone="slate">rcbMeasFlt01</Code> 位於 <Code tone="slate">RP</Code> 或{' '}
        <Code tone="slate">BR</Code> 尚未確認 <UnverifiedBadge label="RP 或 BR 未確認" />
      </span>
    </>,
  ],
];

// 3.1 與 GOOSE / SV 的差別 (只用筆記那一段的敘述)
const PROTOCOL_CARDS = [
  {
    key: 'report',
    name: 'MMS Report',
    model: 'client/server',
    transport: '走 TCP',
    use: '往上層監控系統送量測與狀態',
    box: 'border-emerald-500/40 bg-emerald-500/5',
    title: 'text-emerald-300',
  },
  {
    key: 'goose',
    name: 'GOOSE',
    model: 'publisher/subscriber',
    transport: 'Layer 2 multicast',
    use: 'IED 之間毫秒級的跳脫、連鎖',
    box: 'border-rose-500/30 bg-rose-500/5',
    title: 'text-rose-300',
  },
  {
    key: 'sv',
    name: 'SV (Sampled Values)',
    model: 'publisher/subscriber',
    transport: 'Layer 2 multicast',
    use: 'IED 之間毫秒級的取樣值',
    box: 'border-amber-500/30 bg-amber-500/5',
    title: 'text-amber-300',
  },
];

// 3.2 三個組成要件
const BUILDING_BLOCKS = [
  {
    key: 'dataset',
    icon: <Database className="w-5 h-5 text-emerald-400" />,
    title: 'DataSet',
    tagline: '決定「送什麼」',
    body: (
      <>
        一組 FCDA (單一屬性) 或 FCD (整個 DO) 的清單。可由 SCL 預先定義，或由 client 以 <Code>CreateDataSet</Code>{' '}
        動態建立 (若 IED 支援)。
      </>
    ),
    link: { href: '#report/grouping', label: '典型 DataSet 分組 (5.2)' },
    accent: 'bg-emerald-500',
  },
  {
    key: 'rcb',
    icon: <Settings2 className="w-5 h-5 text-teal-400" />,
    title: 'RCB (Report Control Block)',
    tagline: '決定「什麼時候送、怎麼送、送給誰」',
    body: <>報告控制區塊 (Report Control Block, RCB)，啟用與參數都在這裡設定 (屬性見 3.3)。</>,
    link: { href: '#report/rcb', label: 'RCB 屬性 (3.3)' },
    accent: 'bg-teal-500',
  },
  {
    key: 'trgops',
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    title: 'TrgOps 與 OptFlds',
    tagline: '觸發條件與夾帶欄位',
    body: <>TrgOps 決定什麼情況下送 report，OptFlds 決定 report 多帶哪些欄位 (見 3.4)。</>,
    link: { href: '#report/trgops', label: '觸發條件與夾帶欄位 (3.4)' },
    accent: 'bg-cyan-500',
  },
];

// 3.3 RCB 屬性 (u = URCB 適用，b = BRCB 適用)
const RCB_ROWS = [
  { name: 'RptID', type: 'VisString', desc: 'report 識別字串，report 內會帶，client 用來辨識來源 RCB', u: true, b: true },
  { name: 'RptEna', type: 'Boolean', desc: 'true 啟用、false 停用；啟用後多數屬性變唯讀', u: true, b: true },
  {
    name: 'DatSet',
    type: 'ObjRef',
    desc: (
      <>
        綁定的 DataSet，只能在 <Code>RptEna</Code>=false 時改
      </>
    ),
    u: true,
    b: true,
  },
  {
    name: 'ConfRev',
    type: 'Uint32',
    desc: 'DataSet 設定版本號，內容改過即增加；client 用來偵測設定是否被動過',
    u: true,
    b: true,
  },
  { name: 'OptFlds', type: 'Bitstring', desc: 'report 要夾帶哪些額外欄位', u: true, b: true },
  {
    name: 'BufTm',
    type: 'Uint32 (ms)',
    desc: '緩衝時間：第一個變化後再等 BufTm 毫秒，把期間內的變化合併成一個 report',
    u: true,
    b: true,
  },
  { name: 'SqNum', type: 'Uint16 / Uint8', desc: '序號，每送一個 report 加一；client 用來偵測漏包', u: true, b: true },
  { name: 'TrgOps', type: 'Bitstring', desc: '觸發條件', u: true, b: true },
  { name: 'IntgPd', type: 'Uint32 (ms)', desc: '完整性週期：每隔 IntgPd 毫秒全量送一次，0 = 關閉', u: true, b: true },
  {
    name: 'GI',
    type: 'Boolean',
    desc: '寫 true 要求一次性全量送出 (General Interrogation)，送完自動變回 false',
    u: true,
    b: true,
  },
  { name: 'Owner', type: 'Octet string', desc: '目前佔用此 RCB 的 client 位址 (Ed.2 新增)', u: true, b: true },
  { name: 'Resv', type: 'Boolean', desc: 'URCB 預約旗標，true 後其他 client 不能動此 instance', u: true, b: false },
  {
    name: 'ResvTms',
    type: 'Int16 (s)',
    desc: (
      <>
        BRCB 預約時間：斷線後保留幾秒給同一 client；-1 表示 SCL 以 <Code>ClientLN</Code> 預先綁定；0 表示未預約
      </>
    ),
    u: false,
    b: true,
  },
  { name: 'PurgeBuf', type: 'Boolean', desc: 'true 清空 BRCB 事件緩衝', u: false, b: true },
  {
    name: 'EntryID',
    type: 'Octet string (8)',
    desc: 'BRCB 每筆緩衝事件的識別碼；client 重連時寫入上次收到的 EntryID，server 從下一筆補送',
    u: false,
    b: true,
  },
  { name: 'TimeOfEntry', type: 'EntryTime', desc: '事件進入緩衝的時間', u: false, b: true },
];

const RCB_VIEW_OPTIONS = [
  { value: 'all', label: '全部', tone: 'emerald' },
  { value: 'urcb', label: 'URCB', tone: 'indigo', icon: <FcBadge fc="RP" /> },
  { value: 'brcb', label: 'BRCB', tone: 'rose', icon: <FcBadge fc="BR" /> },
];

const RCB_MODE_OPTIONS = [
  { value: 'dim', label: '淡化不適用的列', tone: 'teal' },
  { value: 'hide', label: '隱藏不適用的列', tone: 'teal' },
];

// 3.4 TrgOps
const TRGOPS_ROWS = [
  [
    <>
      <Code>dchg</Code> (data-change)
    </>,
    '值變化',
    <>
      <FcBadge fc="MX" /> 類比值的「變化」由 <FcBadge fc="CF" /> 的 <Code>db</Code> (deadband) 決定：<Code>db</Code> 為
      0..100000 對應量程 (<Code>rangeC</Code>) 的 0..100%，超過死區才算變化
    </>,
  ],
  [
    <>
      <Code>qchg</Code> (quality-change)
    </>,
    <>
      <Code>q</Code> 任一 bit 變化
    </>,
    '例如 validity 從 good 變 questionable',
  ],
  [
    <>
      <Code>dupd</Code> (data-update)
    </>,
    '值被更新 (即使數值相同)',
    '用於週期刷新的計算值',
  ],
  [
    <Code>integrity</Code>,
    '週期完整性',
    <>
      搭配 <Code>IntgPd</Code>
    </>,
  ],
  [<Code>gi</Code>, '允許 GI', '未開此 bit，client 寫 GI=true 會被拒'],
];

// 3.4 OptFlds
const OPTFLDS_ROWS = [
  [<Code>sequence-number</Code>, <Code tone="slate">SqNum</Code>],
  [
    <Code>report-time-stamp</Code>,
    <>
      <Code tone="slate">TimeOfEntry</Code> (MMS BinaryTime，自 1984-01-01 起算的毫秒)
    </>,
  ],
  [
    <Code>reason-for-inclusion</Code>,
    '每個成員各帶一個原因 bitstring：data-change / quality-change / data-update / integrity / general-interrogation',
  ],
  [
    <Code>data-set-name</Code>,
    <>
      <Code tone="slate">DatSet</Code> 參照
    </>,
  ],
  [
    <Code>data-reference</Code>,
    '每個成員的完整 object reference (沒帶時 client 需用 inclusion bitstring 對照 DataSet 順序)',
  ],
  [
    <Code>buffer-overflow</Code>,
    <>
      BRCB 緩衝曾溢位 (<Code tone="slate">BufOvfl</Code>=true)，代表有事件遺失
    </>,
  ],
  [
    <Code>entryID</Code>,
    <>
      BRCB 的 <Code tone="slate">EntryID</Code>
    </>,
  ],
  [<Code>conf-revision</Code>, <Code tone="slate">ConfRev</Code>],
  [
    <Code>segmentation</Code>,
    <>
      report 過大時分段，帶 <Code tone="slate">SubSeqNum</Code> 與 <Code tone="slate">MoreSegmentsFollow</Code>
    </>,
  ],
];

// 3.5 InformationReport 欄位順序 (大致)
const PAYLOAD_GROUPS = [
  {
    key: 'header',
    title: '報頭欄位',
    hint: '每個 report 一份；可選欄位是否出現由 OptFlds 決定',
    chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    num: 'bg-emerald-500/20 text-emerald-300',
    fields: [
      { name: 'RptID', optional: false, note: '辨識來源 RCB' },
      { name: 'OptFlds', optional: false, note: '宣告本 report 夾帶哪些欄位' },
      { name: 'SqNum', optional: true, note: 'OptFlds: sequence-number' },
      { name: 'TimeOfEntry', optional: true, note: 'OptFlds: report-time-stamp' },
      { name: 'DatSet', optional: true, note: 'OptFlds: data-set-name' },
      { name: 'BufOvfl', optional: true, note: 'OptFlds: buffer-overflow' },
      { name: 'EntryID', optional: true, note: 'OptFlds: entryID' },
      { name: 'ConfRev', optional: true, note: 'OptFlds: conf-revision' },
      { name: 'SubSeqNum / MoreSegmentsFollow', optional: true, note: 'OptFlds: segmentation' },
    ],
  },
  {
    key: 'inclusion',
    title: 'Inclusion bitstring',
    hint: 'DataSet 有幾個成員就幾個 bit，1 = 本次包含',
    chip: 'border-teal-500/40 bg-teal-500/10 text-teal-200',
    num: 'bg-teal-500/20 text-teal-300',
    fields: [{ name: 'Inclusion bitstring', optional: false, note: '成員數 = bit 數，1 = 本次包含' }],
  },
  {
    key: 'member',
    title: '每個被包含的成員',
    hint: '只有 inclusion bit 為 1 的成員才會出現在這一段',
    chip: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    num: 'bg-cyan-500/20 text-cyan-300',
    fields: [
      { name: 'data-reference', optional: true, note: '成員的完整 object reference' },
      { name: '值', optional: false, note: '成員的值' },
      { name: 'reason-for-inclusion', optional: true, note: '每個成員各帶一個原因 bitstring' },
    ],
  },
];

// 每個欄位在整段 report 中的流水號 (在模組載入時算好，render 期間不做累加)
const PAYLOAD_GROUPS_INDEXED = (() => {
  let offset = 0;
  return PAYLOAD_GROUPS.map((g) => {
    const start = offset;
    offset += g.fields.length;
    return { ...g, start };
  });
})();

// 3.6 URCB vs BRCB
const URCB_BRCB_COLUMNS = [
  '項目',
  {
    label: (
      <>
        URCB (Unbuffered, <Code>$RP$</Code>)
      </>
    ),
  },
  {
    label: (
      <>
        BRCB (Buffered, <Code>$BR$</Code>)
      </>
    ),
  },
];

const URCB_BRCB_ROWS = [
  ['斷線期間的事件', '丟棄', '存於 IED 緩衝區，重連後補送'],
  [
    '重連續傳',
    '無',
    <>
      client 寫入最後收到的 <Code>EntryID</Code>，server 從下一筆繼續；EntryID 不存在則從最舊開始
    </>,
  ],
  [
    '緩衝溢位通知',
    '無',
    <>
      <Code>BufOvfl</Code> 旗標
    </>,
  ],
  [
    '預約機制',
    <>
      <Code>Resv</Code> (布林)
    </>,
    <>
      <Code>ResvTms</Code> (秒)，可於 SCL 以 <Code>ClientLN</Code> 預先綁定
    </>,
  ],
  [
    '典型用途',
    <>
      量測值 (<FcBadge fc="MX" />)，掉一筆無妨
    </>,
    <>
      狀態與事件 (<FcBadge fc="ST" />)，不可漏，例如斷路器狀態、保護動作
    </>,
  ],
  [
    'SCL 元素',
    <Code>{'<ReportControl buffered="false">'}</Code>,
    <Code>{'<ReportControl buffered="true">'}</Code>,
  ],
];

// 3.7 Instance 示意 (01 為本實驗觀察到被 IEDScout 啟用的 instance)
const INSTANCES = [
  { id: '01', owner: 'IEDScout' },
  { id: '02', owner: null },
  { id: '03', owner: null },
  { id: '04', owner: null },
  { id: '05', owner: null },
];

// 3.8 啟用流程 (ui = IEDScout 按鈕對應)
const ENABLE_STEPS = [
  {
    step: 1,
    action: 'client 建立 TCP 102 連線並完成 MMS association',
    mms: 'Initiate-Request / Response',
    ui: [],
  },
  {
    step: 2,
    action: 'client 讀 RCB 看狀態 (是否被佔用、DatSet、ConfRev)',
    mms: (
      <>
        Read <Code>LLN0$RP$rcbMeasFlt01</Code>
      </>
    ),
    ui: [],
  },
  {
    step: 3,
    action: 'client 預約 instance',
    mms: (
      <>
        Write <Code>Resv</Code>=true (URCB) 或 <Code>ResvTms</Code> (BRCB)
      </>
    ),
    ui: ['Enable'],
  },
  {
    step: 4,
    action: '(可選) 改 DatSet、TrgOps、OptFlds、IntgPd、BufTm',
    mms: (
      <>
        Write 各屬性 (須在 <Code>RptEna</Code>=false 時)
      </>
    ),
    ui: ['Enable'],
  },
  {
    step: 5,
    action: '(BRCB 可選) 寫 EntryID 續傳，或 PurgeBuf 清緩衝',
    mms: 'Write',
    ui: [],
  },
  {
    step: 6,
    action: 'client 啟用',
    mms: (
      <>
        Write <Code>RptEna</Code>=true
      </>
    ),
    ui: ['Enable'],
  },
  {
    step: 7,
    action: '(通常) client 要一次全量',
    mms: (
      <>
        Write <Code>GI</Code>=true，server 回 reason=gi 的 report
      </>
    ),
    ui: ['Enable', 'GI'],
  },
  {
    step: 8,
    action: '之後 server 依 TrgOps 自發送 report',
    mms: (
      <>
        <Code>InformationReport</Code> (unconfirmed)
      </>
    ),
    ui: [],
  },
  {
    step: 9,
    action: 'client 結束',
    mms: (
      <>
        Write <Code>RptEna</Code>=false、釋放 Resv；或直接斷線 (BRCB 的 ResvTms 期間內 instance 仍保留)
      </>
    ),
    ui: [],
  },
];

const ENABLE_SEQ_PARTICIPANTS = [
  { id: 'C', label: 'Client', sub: 'IEDScout' },
  { id: 'S', label: 'IED server', sub: 'FD11_PMCCLD0/LLN0' },
];

const ENABLE_SEQ_STEPS = [
  { type: 'msg', from: 'C', to: 'S', label: '1. Initiate-Request\n(TCP 102 連線，建立 MMS association)' },
  { type: 'msg', from: 'S', to: 'C', label: 'Initiate-Response', dashed: true },
  { type: 'msg', from: 'C', to: 'S', label: '2. Read LLN0$RP$rcbMeasFlt01\n(是否被佔用、DatSet、ConfRev)' },
  { type: 'msg', from: 'S', to: 'C', label: 'Read response', dashed: true },
  { type: 'msg', from: 'C', to: 'S', label: '3. Write Resv = true (URCB)\n或 ResvTms (BRCB)' },
  { type: 'msg', from: 'S', to: 'C', label: 'Write response', dashed: true },
  {
    type: 'loop',
    label: '4. 可選 (須在 RptEna = false 時)',
    steps: [
      { type: 'msg', from: 'C', to: 'S', label: 'Write DatSet / TrgOps / OptFlds\n/ IntgPd / BufTm' },
      { type: 'msg', from: 'S', to: 'C', label: 'Write response', dashed: true },
    ],
  },
  {
    type: 'loop',
    label: '5. BRCB 可選',
    steps: [
      { type: 'msg', from: 'C', to: 'S', label: 'Write EntryID (續傳)\n或 PurgeBuf (清緩衝)' },
      { type: 'msg', from: 'S', to: 'C', label: 'Write response', dashed: true },
    ],
  },
  { type: 'msg', from: 'C', to: 'S', label: '6. Write RptEna = true' },
  { type: 'msg', from: 'S', to: 'C', label: 'Write response', dashed: true },
  { type: 'msg', from: 'C', to: 'S', label: '7. Write GI = true (通常)' },
  { type: 'msg', from: 'S', to: 'C', label: 'Write response', dashed: true },
  { type: 'msg', from: 'S', to: 'C', label: 'InformationReport (reason = gi)', dashed: true },
  { type: 'msg', from: 'S', to: 'C', label: '8. InformationReport (unconfirmed)\n之後依 TrgOps 自發送', dashed: true },
  { type: 'note', over: ['C', 'S'], text: 'InformationReport 為 unconfirmed service，client 不回應' },
  { type: 'msg', from: 'C', to: 'S', label: '9. Write RptEna = false、釋放 Resv\n或直接斷線' },
  { type: 'note', over: ['C', 'S'], text: 'BRCB 的 ResvTms 期間內 instance 仍保留' },
];

// 3.9 Wireshark
const WIRESHARK_ITEMS = [
  {
    key: 'write',
    icon: <Send className="w-4 h-4 text-teal-400" />,
    body: (
      <>
        過濾 <Code>mms</Code>：Write Request 的 variable 名稱會出現 <Code>...$RP$rcbMeasFlt01$RptEna</Code>{' '}
        等路徑，可看到 client 寫了哪些屬性與順序。
      </>
    ),
  },
  {
    key: 'report',
    icon: <Rss className="w-4 h-4 text-emerald-400" />,
    body: (
      <>
        過濾 <Code>mms.unconfirmedPDU</Code> 或 <Code>mms.informationReport</Code>：即 server 推送的 report，可展開看{' '}
        <Code>RptID</Code>、<Code>SqNum</Code>、inclusion bitstring 與值。
      </>
    ),
  },
  {
    key: 'sniffer',
    icon: <Eye className="w-4 h-4 text-cyan-400" />,
    body: <>IEDScout 的 Sniffer 分頁可見同樣內容，但 Wireshark 能看到原始 ASN.1 結構。</>,
  },
  {
    key: 'check',
    icon: <RefreshCw className="w-4 h-4 text-amber-400" />,
    body: (
      <>
        以 <Code>SqNum</Code> 連續性檢查漏包；以 <Code>ConfRev</Code> 檢查 DataSet 是否被改。
      </>
    ),
  },
];

// 4.1 差異表
const READ_VS_REPORT_ROWS = [
  ['誰發起', 'Client 每次都要問', 'Client 設定一次 RCB，之後 IED 自己送'],
  [
    'MMS 服務',
    <>
      <Code>Read</Code> (confirmed，有請求必有回應)
    </>,
    <>
      <Code>Write</Code> 設定 RCB + <Code>InformationReport</Code> (unconfirmed，IED 單向送)
    </>,
  ],
  ['流量特性', '固定：週期 × 成員數，值沒變也照送', '事件驅動：穩態幾乎零流量，可用 BufTm 合併'],
  ['偵測延遲', '最差一個輪詢週期', '觸發條件成立即送，通常毫秒級'],
  ['送的內容', 'Client 指定的物件', 'DataSet 中有變化的成員 (dchg/qchg)，GI 與 IntgPd 才全送'],
  [
    '附帶資訊',
    <>
      只有值本身 (<Code>q</Code>、<Code>t</Code> 需另讀)
    </>,
    '可帶 reason-for-inclusion、SqNum、TimeOfEntry、ConfRev',
  ],
  ['斷線行為', '下次 Read 失敗即知', 'URCB 斷線期間事件丟失；BRCB 緩衝並以 EntryID 續傳'],
  ['Server 負擔', '每次請求都要編碼回應', '需跑 deadband 與觸發判斷，但整體 CPU 與頻寬較低'],
  ['Client 數量限制', '受 association 數限制', '受 RCB instance 數限制'],
  ['設定依賴', '不需 IED 端預先設定', '需 SCL 有 DataSet 與 ReportControl，或 IED 支援動態建立'],
];

// 4.2 時序圖 (逐句對應筆記的兩段 Mermaid)
const POLL_SEQ_PARTICIPANTS = [
  { id: 'C', label: 'Client', sub: 'IEDScout / SCADA' },
  { id: 'S', label: 'IED server', sub: 'FD11_PMCC' },
];

const POLL_SEQ_STEPS = [
  {
    type: 'loop',
    label: '每 1 s (Polling)',
    steps: [
      { type: 'msg', from: 'C', to: 'S', label: 'Read request\n(例如 LD0/VMMXU1.PhV)' },
      { type: 'msg', from: 'S', to: 'C', label: 'Read response (值沒變也照送)', dashed: true },
    ],
  },
  { type: 'note', over: ['C', 'S'], text: 'Confirmed service，流量固定，延遲最差一個週期' },
];

const PUSH_SEQ_PARTICIPANTS = [
  { id: 'C', label: 'Client', sub: 'IEDScout / SCADA' },
  { id: 'S', label: 'IED server', sub: 'RCB + DataSet' },
];

const PUSH_SEQ_STEPS = [
  { type: 'msg', from: 'C', to: 'S', label: 'Write rcbMeasFlt01.Resv = true' },
  { type: 'msg', from: 'S', to: 'C', label: 'Write response', dashed: true },
  { type: 'msg', from: 'C', to: 'S', label: 'Write TrgOps / OptFlds / IntgPd (可選)' },
  { type: 'msg', from: 'S', to: 'C', label: 'Write response', dashed: true },
  { type: 'msg', from: 'C', to: 'S', label: 'Write RptEna = true' },
  { type: 'msg', from: 'S', to: 'C', label: 'Write response', dashed: true },
  { type: 'msg', from: 'C', to: 'S', label: 'Write GI = true' },
  { type: 'msg', from: 'S', to: 'C', label: 'Write response', dashed: true },
  { type: 'msg', from: 'S', to: 'C', label: 'InformationReport\n(reason = gi，全部成員)', dashed: true },
  { type: 'note', over: ['C', 'S'], text: '值沒變：沒有任何流量' },
  { type: 'msg', from: 'S', to: 'C', label: 'InformationReport\n(reason = dchg，只送變化成員)', dashed: true },
  { type: 'msg', from: 'S', to: 'C', label: 'InformationReport\n(reason = integrity，每 IntgPd ms 全送)', dashed: true },
  { type: 'note', over: ['C', 'S'], text: 'InformationReport 為 unconfirmed，client 不回 ACK' },
];

// 4.3 實務選擇 (三點)
const CHOICES = [
  {
    value: 'read',
    title: 'Read',
    scenario: '一次性、工程性操作',
    icon: <RefreshCw className="w-4 h-4" />,
    detail: (
      <>
        點某個 DO 看值、讀設定 (<FcBadge fc="CF" />)、讀描述 (<FcBadge fc="DC" />)、確認 RCB 屬性狀態。
      </>
    ),
    tone: 'indigo',
  },
  {
    value: 'report',
    title: 'Report',
    scenario: '持續監控',
    icon: <Rss className="w-4 h-4" />,
    detail: <>SCADA 需要的量測與狀態。</>,
    tone: 'emerald',
  },
  {
    value: 'mixed',
    title: '常混用',
    scenario: '實際連線時的常見做法',
    icon: <ArrowLeftRight className="w-4 h-4" />,
    detail: (
      <>
        先以 <Code>Read</Code> 讀 RCB 確認是否被佔用與 DatSet，再以 <Code>Write</Code> 啟用，之後只收 report，偶爾{' '}
        <Code>GI</Code> 強制同步。
      </>
    ),
    tone: 'teal',
  },
];

const CHOICE_TONES = {
  indigo: {
    on: 'border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_18px_rgba(99,102,241,0.15)]',
    title: 'text-indigo-300',
  },
  emerald: {
    on: 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.15)]',
    title: 'text-emerald-300',
  },
  teal: {
    on: 'border-teal-500/60 bg-teal-500/10 shadow-[0_0_18px_rgba(20,184,166,0.15)]',
    title: 'text-teal-300',
  },
};

// 4.4 對照 IEDScout 畫面 (三點)
const SCREEN_MAPPING = [
  {
    key: 'browser',
    icon: <RefreshCw className="w-5 h-5 text-indigo-400" />,
    title: 'Browser 分頁：Read 輪詢',
    body: (
      <>
        Browser 分頁的樹狀資料由 <Code>Read</Code> 取得，且 <Code>Polling: 1 s</Code> 持續輪詢更新該區。
      </>
    ),
    links: [{ href: '#lab/browser', label: '看實驗的 Browser 分頁' }],
  },
  {
    key: 'monitor',
    icon: <Rss className="w-5 h-5 text-emerald-400" />,
    title: 'Activity Monitor 卡片：report 推送',
    body: <>Activity Monitor 的卡片由 report 推送，右下角有訂閱圖示；更新時間點與 Read 週期無關。</>,
    links: [{ href: '#lab/monitor', label: '看實驗的 Activity Monitor' }],
  },
  {
    key: 'empty',
    icon: <Bell className="w-5 h-5 text-amber-400" />,
    title: '無值的卡片：沒有任何流量',
    body: (
      <>
        無值的卡片對應「值沒變：沒有任何流量」：訂閱後若 GI 沒拿到初值，或成員從未觸發 <Code>dchg</Code>，卡片即一直空著。
      </>
    ),
    links: [
      { href: '#lab/monitor', label: '看哪些卡片無值' },
      { href: '#report/payload', label: 'Report 內容結構 (3.5)' },
    ],
  },
];

// ==========================================
// 小型內部元件
// ==========================================

const TOGGLE_ON = {
  emerald: 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  teal: 'bg-teal-500/15 border-teal-500/60 text-teal-200 shadow-[0_0_12px_rgba(20,184,166,0.2)]',
  indigo: 'bg-indigo-500/15 border-indigo-500/60 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.2)]',
  rose: 'bg-rose-500/15 border-rose-500/60 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
};
const TOGGLE_OFF = 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200';

/** 可點選的按鈕群組 (單選)。options: [{ value, label, tone?, icon? }] */
function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      {label && <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">{label}</span>}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center gap-1.5 text-xs md:text-sm font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              on ? TOGGLE_ON[o.tone] || TOGGLE_ON.emerald : TOGGLE_OFF
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** URCB / BRCB 適用性記號 */
function Tick({ on }) {
  return on ? (
    <span className="text-emerald-400 font-black" aria-label="適用">
      ✓
    </span>
  ) : (
    <span className="text-slate-700" aria-label="不適用">
      ·
    </span>
  );
}

/** 有左側色條的小卡片 */
function AccentCard({ accent, children, className = '' }) {
  return (
    <div className={`bg-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden ${className}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${accent}`}></div>
      {children}
    </div>
  );
}

/** 跨章節連結 */
function JumpLink({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md hover:bg-emerald-500/20 transition-colors"
    >
      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
      {children}
    </a>
  );
}

// ==========================================
// 主元件：筆記第 3 節 (3.1 到 3.9) 與第 4 節 (4.1 到 4.4)
// ==========================================
export default function ReportMechanism() {
  const [rcbView, setRcbView] = useState('all');
  const [rcbMode, setRcbMode] = useState('dim');
  const [choice, setChoice] = useState(null);

  const rcbApplicable = (row) => rcbView === 'all' || (rcbView === 'urcb' ? row.u : row.b);
  const rcbRows = RCB_ROWS.filter((row) => rcbMode === 'dim' || rcbApplicable(row)).map((row) => {
    const dim = rcbApplicable(row) ? '' : 'opacity-30';
    return [
      <span className={dim}>
        <Code>{row.name}</Code>
      </span>,
      <span className={`font-mono text-xs text-slate-400 ${dim}`}>{row.type}</span>,
      <span className={dim}>{row.desc}</span>,
      <span className={dim}>
        <Tick on={row.u} />
      </span>,
      <span className={dim}>
        <Tick on={row.b} />
      </span>,
    ];
  });
  const rcbApplicableCount = RCB_ROWS.filter(rcbApplicable).length;

  return (
    <>
      {/* 3.1 定位 */}
      <SectionCard
        id="report-positioning"
        icon={<Compass className="text-emerald-500" />}
        title="定位"
        en="Positioning"
        intro="MMS Report 是 IEC 61850 中 server 主動推送 (push) 資料給 client 的機制。沒有它，client 只能用 MMS Read 輪詢 (polling)；有了它，client 設定好一個 Report Control Block (RCB) 並啟用後，IED 在觸發條件成立時 (值變化、品質變化、週期到期等) 把 DataSet 內容打包成 report 送出。"
      >
        <DataTable
          columns={[{ label: '層次', className: 'w-1/4' }, '內容']}
          rows={POSITIONING_ROWS}
          caption="MMS Report 在各層次的位置"
        />

        <SubHeading title="與 GOOSE / SV 的差別" en="Report vs GOOSE / SV" />
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          GOOSE 和 SV 是 Layer 2 multicast 的 publisher/subscriber，用於 IED 之間毫秒級的跳脫、連鎖、取樣值；Report 是
          client/server、走 TCP，用於往上層監控系統送量測與狀態。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROTOCOL_CARDS.map((c) => (
            <div key={c.key} className={`rounded-xl border p-4 ${c.box}`}>
              <h4 className={`font-black text-lg mb-3 ${c.title}`}>{c.name}</h4>
              <dl className="text-sm space-y-2">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">通訊模式</dt>
                  <dd className="text-slate-200 font-mono">{c.model}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">傳輸</dt>
                  <dd className="text-slate-200">{c.transport}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">用途</dt>
                  <dd className="text-slate-300">{c.use}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 3.2 三個組成要件 */}
      <SectionCard
        id="report-building-blocks"
        icon={<Boxes className="text-teal-500" />}
        title="三個組成要件"
        en="Building blocks"
        intro="一個能運作的 MMS Report 由三件事組成：送什麼 (DataSet)、何時送怎麼送送給誰 (RCB)、以及觸發條件與夾帶欄位 (TrgOps 與 OptFlds)。"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BUILDING_BLOCKS.map((b, i) => (
            <AccentCard key={b.key} accent={b.accent}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black text-slate-500">{i + 1}</span>
                {b.icon}
                <h4 className="font-bold text-slate-100">{b.title}</h4>
              </div>
              <p className="text-sm font-bold text-emerald-300 mb-2">{b.tagline}</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">{b.body}</p>
              <JumpLink href={b.link.href}>{b.link.label}</JumpLink>
            </AccentCard>
          ))}
        </div>
      </SectionCard>

      {/* 3.3 RCB 屬性 */}
      <SectionCard
        id="report-rcb"
        icon={<Settings2 className="text-emerald-500" />}
        title="RCB 屬性"
        en="RCB attributes"
        intro="RCB 的屬性以 MMS 變數的形式存在：client 用 Write 設定、用 Read 讀回 (見 3.1)。多數屬性 URCB 與 BRCB 共用，少數只屬於其中一種；點選下方按鈕可以只看你關心的那一種。"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <ToggleGroup label="顯示" options={RCB_VIEW_OPTIONS} value={rcbView} onChange={setRcbView} />
          <ToggleGroup label="不適用的列" options={RCB_MODE_OPTIONS} value={rcbMode} onChange={setRcbMode} />
        </div>
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5" />
          目前顯示：
          {rcbView === 'all' && <span className="text-slate-300 font-bold">全部 {RCB_ROWS.length} 個屬性</span>}
          {rcbView === 'urcb' && (
            <span className="text-indigo-300 font-bold">URCB 適用的 {rcbApplicableCount} 個屬性</span>
          )}
          {rcbView === 'brcb' && <span className="text-rose-300 font-bold">BRCB 適用的 {rcbApplicableCount} 個屬性</span>}
          {rcbView !== 'all' && rcbMode === 'dim' && <span>(不適用的列淡化顯示)</span>}
          {rcbView !== 'all' && rcbMode === 'hide' && <span>(不適用的列已隱藏)</span>}
        </p>
        <DataTable
          columns={[
            '屬性',
            '型別',
            '意義',
            { label: 'URCB', className: 'text-center', cellClassName: 'text-center' },
            { label: 'BRCB', className: 'text-center', cellClassName: 'text-center' },
          ]}
          rows={rcbRows}
          caption="RCB 屬性一覽 (✓ = 該類 RCB 具有此屬性)"
          dense
        />
      </SectionCard>

      {/* 3.4 觸發條件與夾帶欄位 */}
      <SectionCard
        id="report-trgops"
        icon={<Zap className="text-teal-500" />}
        title="觸發條件與夾帶欄位"
        en="TrgOps and OptFlds"
        intro="TrgOps 是一個 bitstring，決定哪些事件會讓 server 送出 report；OptFlds 也是 bitstring，決定 report 內除了值之外還要多帶哪些欄位。"
      >
        <SubHeading title="觸發條件" en="TrgOps bits" />
        <DataTable columns={['TrgOps bit', '意義', '備註']} rows={TRGOPS_ROWS} caption="TrgOps 的 5 個 bit" />

        <SubHeading title="夾帶欄位" en="OptFlds bits" />
        <DataTable columns={['OptFlds bit', 'report 內多帶的欄位']} rows={OPTFLDS_ROWS} caption="OptFlds 的 9 個 bit" />
      </SectionCard>

      {/* 3.5 Report 內容結構 */}
      <SectionCard
        id="report-payload"
        icon={<Package className="text-emerald-500" />}
        title="Report 內容結構"
        en="Report payload"
        intro="InformationReport 的內容依序大致為：RptID、OptFlds、(可選) SqNum、TimeOfEntry、DatSet、BufOvfl、EntryID、ConfRev、SubSeqNum / MoreSegmentsFollow，接著 Inclusion bitstring (DataSet 有幾個成員就幾個 bit，1 = 本次包含)，然後是被包含成員的 data-reference (可選)、值、reason-for-inclusion (可選)。"
      >
        <div className="space-y-4">
          {PAYLOAD_GROUPS_INDEXED.map((g) => (
            <div key={g.key} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                <h4 className="font-bold text-slate-100">{g.title}</h4>
                <span className="text-xs text-slate-500">{g.hint}</span>
              </div>
              <ol className="flex flex-wrap gap-2">
                {g.fields.map((f, fi) => {
                  return (
                    <li
                      key={f.name}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${g.chip} ${
                        f.optional ? 'border-dashed' : ''
                      }`}
                    >
                      <span
                        className={`shrink-0 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center ${g.num}`}
                      >
                        {g.start + fi + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-sm font-bold">{f.name}</span>
                          {f.optional ? <Pill tone="amber">可選</Pill> : <Pill tone="emerald">固定</Pill>}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">{f.note}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>

        <Callout tone="warn" title="重點：dchg 觸發的 report 不是整個 DataSet" className="mt-6">
          <p>
            <Code>dchg</Code> 觸發的 report 通常只含「有變化的成員」，不是整個 DataSet；只有 <Code>integrity</Code> 與{' '}
            <Code>GI</Code> 才全送。
          </p>
          <p className="mt-2">
            這解釋了為何訂閱後若沒有 GI，或成員從未變化，卡片會一直無值：inclusion bitstring 中該成員的 bit 一直是 0，
            report 裡根本沒有它的值。
          </p>
          <p className="mt-3 flex flex-wrap gap-2">
            <JumpLink href="#lab/monitor">看實驗中無值的卡片</JumpLink>
            <JumpLink href="#report/read-vs-report">Read vs Report (第 4 節)</JumpLink>
          </p>
        </Callout>
      </SectionCard>

      {/* 3.6 URCB vs BRCB */}
      <SectionCard
        id="report-urcb-brcb"
        icon={<GitCompare className="text-teal-500" />}
        title="URCB vs BRCB"
        en="Unbuffered vs Buffered"
        intro="兩種 RCB 的差別集中在「斷線期間的事件怎麼辦」：URCB 直接丟棄，BRCB 先緩衝、重連後補送。"
      >
        <DataTable columns={URCB_BRCB_COLUMNS} rows={URCB_BRCB_ROWS} caption="URCB 與 BRCB 的 6 項差異" />
      </SectionCard>

      {/* 3.7 Instance 概念 */}
      <SectionCard
        id="report-instances"
        icon={<Hash className="text-emerald-500" />}
        title="Instance 概念"
        en="Why the 01 suffix"
      >
        <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-5">
          SCL 的 <Code>{'<ReportControl name="rcbMeasFlt" max="5">'}</Code> 會在 IED 上展開為{' '}
          <Code>rcbMeasFlt01</Code> 到 <Code>rcbMeasFlt05</Code> 五個獨立 instance，
          <strong className="text-slate-100">同一時間一個 instance 只能被一個 client 佔用</strong> (透過{' '}
          <Code>Resv</Code> / <Code>ResvTms</Code> / <Code>Owner</Code>)。IED 最多同時服務幾個 report client，在 SCL
          階段即決定。
        </p>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="lg:w-72 shrink-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">SCL 寫法</div>
              <pre className="font-mono text-xs md:text-sm text-emerald-300 bg-slate-900 border border-slate-800 rounded-lg p-3 overflow-x-auto">
                {'<ReportControl name="rcbMeasFlt"\n               max="5">'}
              </pre>
              <div className="text-[11px] text-slate-500 mt-2">
                <Code tone="slate">name</Code> 接兩位數 index，展開為 01 到 05
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-600 shrink-0 hidden lg:block" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                IED 上的 5 個 instance (示意)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {INSTANCES.map((inst) => (
                  <div
                    key={inst.id}
                    className={`rounded-lg border p-3 text-center ${
                      inst.owner
                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_14px_rgba(16,185,129,0.15)]'
                        : 'border-slate-700 bg-slate-900/60'
                    }`}
                  >
                    {inst.owner ? (
                      <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    ) : (
                      <Unlock className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                    )}
                    <div className={`font-mono text-sm font-bold ${inst.owner ? 'text-emerald-200' : 'text-slate-300'}`}>
                      rcbMeasFlt{inst.id}
                    </div>
                    {inst.owner ? (
                      <div className="mt-1">
                        <Pill tone="emerald">被 {inst.owner} 佔用</Pill>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <Pill tone="slate">空閒</Pill>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                示意：本實驗的 Activity Monitor 標題列是 <Code tone="slate">rcbMeasFlt01</Code>，右上綠色 ✓ 代表訂閱啟用中
                (RptEna = true)，即 01 這個 instance 由 IEDScout 佔用；其餘 instance 可供其他 client 使用。實際 instance
                數以 IED 的 SCL 為準。
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 3.8 啟用流程 */}
      <SectionCard
        id="report-sequence"
        icon={<ListOrdered className="text-teal-500" />}
        title="啟用流程"
        en="End-to-end sequence"
      >
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          從建立連線到收到 report，client 與 IED 之間依序發生以下九個步驟。表中的 RCB 路徑以 URCB 的{' '}
          <Code>$RP$</Code> 為例；本實驗的 <Code>rcbMeasFlt01</Code> 是 URCB 或 BRCB 尚未確認{' '}
          <UnverifiedBadge label="RP 或 BR 未確認" />。
        </p>
        <DataTable
          columns={[
            { label: '步驟', className: 'text-center', cellClassName: 'text-center font-mono font-bold text-slate-200' },
            '動作',
            'MMS 層',
            'IEDScout 按鈕',
          ]}
          rows={ENABLE_STEPS.map((s) => [
            s.step,
            s.action,
            s.mms,
            <span className="flex flex-wrap gap-1">
              {s.ui.map((u) => (
                <Pill key={u} tone={u === 'GI' ? 'sky' : 'emerald'}>
                  {u}
                </Pill>
              ))}
            </span>,
          ])}
          caption="啟用流程九步驟"
        />

        <SubHeading title="時序圖" en="Sequence" />
        <SequenceDiagram
          title="Report 啟用流程：步驟 1 到 9 (虛線為 server 回應或 InformationReport 推送)"
          participants={ENABLE_SEQ_PARTICIPANTS}
          steps={ENABLE_SEQ_STEPS}
        />

        <Callout tone="info" title="IEDScout 的按鈕對應哪些步驟" className="mt-6">
          <p>
            IEDScout 按 <Pill tone="emerald">Enable</Pill> 時執行步驟 3、4、6、7 (預約 instance、寫入屬性、寫{' '}
            <Code>RptEna</Code>=true、寫 <Code>GI</Code>=true)；按 <Pill tone="sky">GI</Pill> 等於再寫一次{' '}
            <Code>GI</Code>=true。
          </p>
        </Callout>
      </SectionCard>

      {/* 3.9 用 Wireshark 驗證 */}
      <SectionCard
        id="report-wireshark"
        icon={<Radar className="text-emerald-500" />}
        title="用 Wireshark 驗證"
        en="Verifying on the wire"
        intro="上述流程都走同一條 TCP 102 連線，用 Wireshark 擷取即可逐一對照 client 寫了什麼、server 推了什麼。"
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WIRESHARK_ITEMS.map((item) => (
            <li
              key={item.key}
              className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300 leading-relaxed"
            >
              <span className="shrink-0 mt-0.5">{item.icon}</span>
              <span className="min-w-0">{item.body}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 4. Read vs Report */}
      <SectionCard
        id="report-read-vs-report"
        icon={<ArrowLeftRight className="text-teal-500" />}
        title="Read vs Report"
        en="Polling vs push"
        intro="同一個 IED、同一條 MMS 連線，可以用 Read 輪詢，也可以用 Report 推送。差別在誰發起、流量長什麼樣、以及斷線時會發生什麼。"
      >
        <SubHeading id="report-read-vs-report-table" title="差異表" en="Key differences" />
        <DataTable
          columns={['面向', 'MMS Read (輪詢)', 'MMS Report (推送)']}
          rows={READ_VS_REPORT_ROWS}
          caption="Read 與 Report 的 10 項差異"
        />

        <SubHeading id="report-read-vs-report-sequence" title="時序圖" en="Sequence diagrams" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <SequenceDiagram title="MMS Read 輪詢" participants={POLL_SEQ_PARTICIPANTS} steps={POLL_SEQ_STEPS} />
          <SequenceDiagram title="MMS Report 推送" participants={PUSH_SEQ_PARTICIPANTS} steps={PUSH_SEQ_STEPS} />
        </div>

        <SubHeading id="report-read-vs-report-choice" title="實務選擇" en="When to use which" />
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-bold text-slate-200">你的情境是？點選後標示對應的做法</span>
          </div>
          <ToggleGroup
            options={CHOICES.map((c) => ({ value: c.value, label: c.scenario, tone: c.tone, icon: c.icon }))}
            value={choice}
            onChange={(v) => setChoice(v === choice ? null : v)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHOICES.map((c) => {
            const on = choice === c.value;
            const t = CHOICE_TONES[c.tone];
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={on}
                onClick={() => setChoice(on ? null : c.value)}
                className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                  on ? `${t.on} scale-[1.02]` : 'border-slate-800 bg-slate-950 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`font-black text-lg ${on ? t.title : 'text-slate-200'}`}>{c.title}</span>
                  {on && <Pill tone={c.tone === 'indigo' ? 'indigo' : 'emerald'}>適合</Pill>}
                </div>
                <div className="text-xs font-bold text-slate-500 mb-2">{c.scenario}</div>
                <p className="text-sm text-slate-300 leading-relaxed">{c.detail}</p>
              </button>
            );
          })}
        </div>

        <SubHeading id="report-read-vs-report-screen" title="對照 IEDScout 畫面" en="Mapping to the IEDScout screen" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCREEN_MAPPING.map((m) => (
            <div key={m.key} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                {m.icon}
                <h4 className="font-bold text-slate-100 text-sm">{m.title}</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed flex-1">{m.body}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {m.links.map((l) => (
                  <JumpLink key={l.href + l.label} href={l.href}>
                    {l.label}
                  </JumpLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
