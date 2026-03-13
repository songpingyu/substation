import React from 'react';
import { 
  ShieldAlert, ShieldCheck, Sliders, Activity, Cpu, 
  Zap, Power, Network, BookOpen, Layers, HardDrive, 
  Radio, Info, ArrowDownUp, SplitSquareVertical,
  Cloud, Server, Monitor
} from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')] opacity-10 pointer-events-none"></div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
            全景智慧變電站深度架構圖
          </h1>
          <p className="text-blue-200 text-lg md:text-xl font-medium relative z-10 flex items-center justify-center gap-2">
            <Layers className="w-6 h-6" />
            IEC 61850 全層級網路拓撲 (Control Center to Process Level)
          </p>
        </div>

        {/* Legend Section */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap justify-center gap-6 text-sm font-semibold">
          <div className="flex items-center gap-2"><div className="w-6 h-1 bg-sky-500 rounded"></div> DNP3 (遠動通訊)</div>
          <div className="flex items-center gap-2"><div className="w-6 h-1 bg-blue-500 rounded"></div> MMS (報告與控制)</div>
          <div className="flex items-center gap-2"><div className="w-6 h-1 bg-red-500 rounded"></div> GOOSE (跳脫與狀態)</div>
          <div className="flex items-center gap-2"><div className="w-6 h-1 bg-orange-500 border-b-2 border-dotted border-white rounded"></div> SMV / SV (取樣數據)</div>
          <div className="flex items-center gap-2"><div className="w-6 h-1 bg-slate-800 rounded"></div> 硬體實體接線</div>
        </div>

        {/* Diagram Section */}
        <div className="p-8 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <div className="min-w-[1024px] flex flex-col items-center">

            {/* --- Layer 3: Control Center Level --- */}
            <div className="w-full flex flex-col items-center mb-2 relative">
              <div className="w-full max-w-5xl border-2 border-sky-200 bg-sky-50/50 rounded-xl p-6 relative pt-10 shadow-sm">
                <span className="absolute -top-3 left-6 bg-sky-100 text-sky-800 px-4 py-1 rounded-full text-sm font-bold border border-sky-300 shadow-sm flex items-center gap-2">
                  <Cloud className="w-4 h-4" /> 控制中心層 Control Center Level (廣域調度)
                </span>
                
                <div className="flex justify-center items-start gap-4">
                  <DeviceCard 
                    icon={<Cloud className="w-8 h-8 text-sky-600" />} 
                    title="EMS 調度中心" 
                    subtitle="廣域 SCADA 系統" 
                    color="sky"
                  />
                </div>
              </div>
            </div>

            {/* Connection Control Center to Station Level */}
            <div className="flex justify-center w-full max-w-4xl mt-0 mb-2">
              <ConnectionLine height="h-16" label="DNP3 / IEC 104 (遠動數據)" color="bg-sky-500" textColor="text-sky-800" textSide="right" />
            </div>

            {/* --- Layer 2.5: Station Level --- */}
            <div className="w-full flex flex-col items-center mb-4 relative">
              <div className="w-full max-w-5xl border-2 border-slate-300 bg-white rounded-xl p-6 relative pt-10 shadow-sm">
                <span className="absolute -top-3 left-6 bg-slate-200 text-slate-800 px-4 py-1 rounded-full text-sm font-bold border border-slate-400 shadow-sm flex items-center gap-2">
                  <Server className="w-4 h-4" /> 變電站層 Station Level (站內監控與通訊橋樑)
                </span>
                
                <div className="flex justify-around items-start gap-4 px-16 md:px-32">
                  <DeviceCard 
                    icon={<Server className="w-8 h-8 text-slate-600" />} 
                    title="通訊閘道器" 
                    subtitle="Gateway (MMS Client / DNP3 Server)" 
                    color="slate"
                  />
                  <DeviceCard 
                    icon={<Monitor className="w-8 h-8 text-slate-600" />} 
                    title="區域 SCADA 主機" 
                    subtitle="Local HMI (MMS Client)" 
                    color="slate"
                  />
                </div>
              </div>
            </div>

            {/* Connections from Station Level to Station Bus */}
            <div className="flex justify-around w-full max-w-3xl mt-0 mb-2">
              <ConnectionLine height="h-12" label="MMS Client 請求" color="bg-blue-500" textColor="text-blue-800" textSide="left" />
              <ConnectionLine height="h-12" label="MMS Client 請求" color="bg-blue-500" textColor="text-blue-800" textSide="right" />
            </div>
            
            {/* STATION BUS */}
            <div className="w-full max-w-5xl mb-2">
              <BusBar name="站控層網路 Station Bus (MMS & Station GOOSE)" color="from-blue-600 to-indigo-600" shadow="shadow-blue-300" />
            </div>

            {/* Connections from Station Bus to Bay Level */}
            <div className="flex justify-around w-full max-w-4xl mt-0 mb-2">
              <ConnectionLine height="h-12" label="MMS (Reports) & GOOSE" color="bg-blue-500" textColor="text-blue-800" textSide="left" />
              <ConnectionLine height="h-12" label="MMS (Reports) & GOOSE" color="bg-blue-500" textColor="text-blue-800" textSide="right" />
              <ConnectionLine height="h-12" label="MMS (Reports/Control)" color="bg-blue-500" textColor="text-blue-800" textSide="right" />
            </div>

            {/* --- Layer 2: Bay Level --- */}
            <div className="w-full flex flex-col items-center mb-4 relative">
              <div className="w-full max-w-5xl border-2 border-indigo-200 bg-indigo-50/50 rounded-xl p-6 relative pt-10">
                <span className="absolute -top-3 left-6 bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm font-bold border border-indigo-300 shadow-sm flex items-center gap-2">
                  <HardDrive className="w-4 h-4" /> 間隔層 Bay Level (保護與控制邏輯)
                </span>
                
                <div className="flex justify-around items-start gap-4">
                  <DeviceCard 
                    icon={<ShieldAlert className="w-8 h-8 text-indigo-600" />} 
                    title="主保護電驛" 
                    subtitle="Main Protection IED" 
                    color="indigo"
                    nodes={["PDIF (87 差動保護)", "PTOC (50/51 過流保護)"]}
                  />
                  <DeviceCard 
                    icon={<ShieldCheck className="w-8 h-8 text-indigo-600" />} 
                    title="後備保護電驛" 
                    subtitle="Backup Protection IED" 
                    color="indigo"
                    nodes={["PTOC (50/51 後備過流)", "PTUV (27 欠壓保護)"]}
                  />
                  <DeviceCard 
                    icon={<Sliders className="w-8 h-8 text-emerald-600" />} 
                    title="間隔控制器" 
                    subtitle="Bay Control Unit (BCU)" 
                    color="emerald"
                    nodes={["CSWI (開關控制)", "MMXU (量測運算)"]}
                  />
                </div>
              </div>
            </div>

            {/* Connections from Bay Level to Process Bus */}
            <div className="flex justify-around w-full max-w-4xl mt-0 mb-2">
              <div className="flex gap-4">
                <ConnectionLine height="h-16" label="SV 訂閱" color="bg-orange-500 border-l-2 border-dashed border-white" textColor="text-orange-700" textSide="left" />
                <ConnectionLine height="h-16" label="GOOSE 發布(跳脫)" color="bg-red-500" textColor="text-red-700" textSide="right" />
              </div>
              <div className="flex gap-4">
                <ConnectionLine height="h-16" label="SV 訂閱" color="bg-orange-500 border-l-2 border-dashed border-white" textColor="text-orange-700" textSide="left" />
                <ConnectionLine height="h-16" label="GOOSE 發布(跳脫)" color="bg-red-500" textColor="text-red-700" textSide="right" />
              </div>
              <div className="flex gap-4">
                <ConnectionLine height="h-16" label="SV 訂閱" color="bg-orange-500 border-l-2 border-dashed border-white" textColor="text-orange-700" textSide="left" />
                <ConnectionLine height="h-16" label="GOOSE (控制/狀態)" color="bg-red-500" textColor="text-red-700" textSide="right" />
              </div>
            </div>

            {/* PROCESS BUS */}
            <div className="w-full max-w-5xl mb-2">
              <BusBar name="過程層網路 Process Bus (SV & Process GOOSE)" color="from-orange-500 to-red-600" shadow="shadow-red-300" />
            </div>

            {/* Connections from Process Bus to Process Level */}
            <div className="flex justify-around w-full max-w-4xl mt-0 mb-2">
              <ConnectionLine height="h-12" label="SV 發布 (80點/週)" color="bg-orange-500 border-l-2 border-dashed border-white" textColor="text-orange-700" textSide="left" />
              <ConnectionLine height="h-12" label="GOOSE 訂閱/發布" color="bg-red-500" textColor="text-red-700" textSide="right" />
              <ConnectionLine height="h-12" label="GOOSE 訂閱/發布" color="bg-red-500" textColor="text-red-700" textSide="right" />
            </div>

            {/* --- Layer 1: Process Level --- */}
            <div className="w-full flex flex-col items-center mb-4 relative">
              <div className="w-full max-w-5xl border-2 border-orange-200 bg-orange-50/50 rounded-xl p-6 relative pt-10">
                <span className="absolute -top-3 left-6 bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-sm font-bold border border-orange-300 shadow-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" /> 過程層 Process Level (數位化與硬體執行)
                </span>

                <div className="flex justify-around items-start gap-4">
                  <DeviceCard 
                    icon={<Activity className="w-8 h-8 text-orange-600" />} 
                    title="合併單元" 
                    subtitle="Merging Unit (MU)" 
                    color="orange"
                    nodes={["TCTR (比流器節點)", "TVTR (比壓器節點)"]}
                  />
                  <DeviceCard 
                    icon={<Cpu className="w-8 h-8 text-red-600" />} 
                    title="斷路器智慧終端" 
                    subtitle="Breaker IT" 
                    color="red"
                    nodes={["XCBR (斷路器節點)"]}
                  />
                  <DeviceCard 
                    icon={<SplitSquareVertical className="w-8 h-8 text-rose-600" />} 
                    title="隔離開關智慧終端" 
                    subtitle="Disconnector IT" 
                    color="red"
                    nodes={["XSWI (開關節點)"]}
                  />
                </div>
              </div>
            </div>

            {/* Hardwired Connections */}
            <div className="flex justify-around w-full max-w-4xl mt-0 mb-2 relative">
              <div className="flex gap-4">
                <ConnectionLine height="h-12" label="類比電壓/電流" color="bg-slate-800" textColor="text-slate-800" textSide="left" dashed />
              </div>
              <div className="flex gap-4">
                <ConnectionLine height="h-12" label="跳脫線圈接點 (Trip)" color="bg-slate-800" textColor="text-slate-800" textSide="right" dashed />
              </div>
              <div className="flex gap-4">
                <ConnectionLine height="h-12" label="馬達操作接點" color="bg-slate-800" textColor="text-slate-800" textSide="right" dashed />
              </div>
            </div>

            {/* --- Primary Equipment Level --- */}
            <div className="w-full flex flex-col items-center relative">
              <div className="w-full max-w-5xl border-2 border-slate-300 bg-white rounded-xl p-6 relative pt-10 shadow-inner">
                <span className="absolute -top-3 left-6 bg-slate-200 text-slate-800 px-4 py-1 rounded-full text-sm font-bold border border-slate-400 shadow-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 一次設備 Primary Equipment (高壓實體設備)
                </span>

                <div className="flex justify-around items-center gap-4">
                  <PrimaryDevice icon={<Zap />} title="比流器 / 比壓器" subtitle="CT / PT" color="slate" />
                  <PrimaryDevice icon={<Power />} title="斷路器" subtitle="Circuit Breaker (CB)" color="slate" />
                  <PrimaryDevice icon={<ArrowDownUp />} title="隔離開關" subtitle="Disconnector (DS)" color="slate" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- Glossary Section --- */}
        <div className="p-8 md:p-10 bg-white">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-slate-800 border-b-4 border-indigo-500 pb-4 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-indigo-600" />
            圖解專有名詞與核心概念介紹
          </h2>
          
          <div className="space-y-8">
            
            {/* Category 1: Levels */}
            <div>
              <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2 bg-indigo-50 p-2 rounded-lg">
                <Layers className="w-5 h-5 text-indigo-600" /> 系統層級 (System Levels)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                <GlossaryItem term="IEC 61850" desc="國際電工委員會制定的變電站通訊網路與系統全球標準，推動變電站自動化設備的互操作性。" />
                <GlossaryItem term="Control Center Level (控制中心層)" desc="遠端的廣域調度中心 (EMS)，負責監控並管理多個變電站與跨區域的電網運行狀態。" />
                <GlossaryItem term="Station Level (變電站層)" desc="負責全站的數據彙整、區域人機介面 (HMI) 監控，並透過 Gateway 將數據上送至遠端調度中心。" />
                <GlossaryItem term="Bay Level (間隔層)" desc="負責單一設備「間隔」(如輸電線路) 的保護與控制。此層設備具備自主運算能力，如保護電驛與控制器。" />
                <GlossaryItem term="Process Level (過程層)" desc="最接近高壓現場的層級。負責將高壓設備的類比訊號轉為數位訊號，並接收數位指令轉為硬體接點動作。" />
              </div>
            </div>

            {/* Category 2: Hardware & Devices */}
            <div>
              <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
                <HardDrive className="w-5 h-5 text-orange-600" /> 設備與硬體 (Devices & Hardware)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                <GlossaryItem term="EMS (Energy Management System)" desc="能源管理系統。通常位於控制中心層，用於大規模電力系統的即時監控、控制及發電優化。" />
                <GlossaryItem term="Gateway (通訊閘道器)" desc="變電站的對外橋樑。它在站內作為 MMS Client 收集各 IED 數據，對外則轉為 DNP3 協議提供給 EMS。" />
                <GlossaryItem term="IED (Intelligent Electronic Device)" desc="智慧電子設備。具備微處理器的設備總稱，能執行保護邏輯判斷與網路通訊。保護電驛即是 IED。" />
                <GlossaryItem term="BCU (Bay Control Unit)" desc="間隔控制器。一種專注於「控制與量測」的 IED，負責採集該間隔的電表數據並提供開關操作介面。" />
                <GlossaryItem term="MU (Merging Unit)" desc="合併單元。位於過程層，將 CT/PT 送來的類比波形，以極高頻率轉換成數位化數據 (SV) 發布到網路上。" />
                <GlossaryItem term="IT (Intelligent Terminal)" desc="智慧終端。接收網路上的 GOOSE 跳脫指令，並驅動硬體繼電器去觸發斷路器等一次設備。" />
                <GlossaryItem term="CT / PT (VT)" desc="比流器與比壓器。將幾萬伏特、幾千安培的高壓大電流，降壓/降流為設備可讀取的安全類比訊號。" />
                <GlossaryItem term="CB / DS" desc="斷路器能在故障發生時切斷大電流；隔離開關則在無電流狀態下切斷電路，形成明顯的安全隔離斷點。" />
                <GlossaryItem term="ANSI 50/51 / 87 (保護電驛代碼)" desc="IEEE/ANSI 定義的設備代碼。50/51 為瞬間/延時過電流保護 (對應 PTOC)；87 為差動保護 (對應 PDIF)；27 為欠壓保護 (對應 PTUV)。" />
                <GlossaryItem term="HMI (Human Machine Interface)" desc="人機介面。提供運轉人員圖形化的操作畫面，用來監控變電站設備狀態、警報並執行遠端/近端控制。" />
              </div>
            </div>

            {/* Category 3: Protocols & Networks */}
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2 bg-red-50 p-2 rounded-lg">
                <Network className="w-5 h-5 text-red-600" /> 網路與通訊協定 (Networks & Protocols)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                <GlossaryItem term="DNP3 / IEC 60870-5-104" desc="廣域網 (WAN) 遠動通訊標準，負責將變電站資訊上送至控制中心，具備優秀的斷線暫存與補傳能力。" />
                <GlossaryItem term="Station Bus (站控層網路)" desc="連接變電站層與間隔層的乙太網路。主要傳輸大容量但即時性要求中等的 MMS 數據，以及間隔間的 GOOSE 閉鎖訊號。" />
                <GlossaryItem term="Process Bus (過程層網路)" desc="連接間隔層與過程層的網路。頻寬要求極高，專門傳輸不間斷的 SV 數位波形與要求極低延遲 (<3ms) 的 GOOSE 跳脫指令。" />
                <GlossaryItem term="MMS (Manufacturing Message Spec.)" desc="主從式架構 (Client-Server) 通訊協定。建立在 TCP/IP 上，負責傳遞設備狀態、事件順序紀錄與控制指令。" />
                <GlossaryItem term="BRCB / URCB" desc="緩衝型 / 非緩衝型報告控制區塊。MMS 中用來定義資料主動上報機制，BRCB 能在斷線時暫存關鍵事件避免遺失。" />
                <GlossaryItem term="GOOSE" desc="繞過 TCP/IP 直達 MAC 層的群播協定。專為取代傳統銅線接點而生，確保保護跳脫、閉鎖等致命訊號能在幾毫秒內送達。" />
                <GlossaryItem term="SV / SMV (Sampled Measured Values)" desc="取樣測量值。MAC 層群播協定，MU 依照標準每秒發布數千個數位波形數據包，供保護電驛或電表訂閱分析。" />
                <GlossaryItem term="Logical Nodes (邏輯節點)" desc="IEC 61850 將設備功能模組化。如 PTOC 直接對應 ANSI 50/51 過流保護，使不同廠牌設備具備統一的資料模型。" />
              </div>
            </div>

          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-900 text-slate-400 text-sm text-center py-6 border-t-4 border-indigo-500">
          設計參考：IEC 61850 全數位化變電站系統標準架構 (Full Topology)
        </div>
      </div>
    </div>
  );
}

// --- Reusable UI Components ---

function DeviceCard({ icon, title, subtitle, color, nodes = [] }) {
  const colorMap = {
    sky: "bg-white border-sky-300 text-sky-900 shadow-sky-100",
    slate: "bg-white border-slate-300 text-slate-800 shadow-slate-200",
    indigo: "bg-white border-indigo-300 text-indigo-900 shadow-indigo-100",
    emerald: "bg-white border-emerald-300 text-emerald-900 shadow-emerald-100",
    orange: "bg-white border-orange-300 text-orange-900 shadow-orange-100",
    red: "bg-white border-red-300 text-red-900 shadow-red-100",
  };

  const headerBgMap = {
    sky: "bg-sky-50",
    slate: "bg-slate-50",
    indigo: "bg-indigo-50",
    emerald: "bg-emerald-50",
    orange: "bg-orange-50",
    red: "bg-red-50",
  }

  return (
    <div className={`flex flex-col items-center w-64 rounded-xl border-2 shadow-lg transition-transform hover:-translate-y-1 overflow-hidden ${colorMap[color]}`}>
      <div className={`w-full flex flex-col items-center justify-center p-4 ${headerBgMap[color]} border-b border-${color}-200`}>
        <div className="mb-2 bg-white p-3 rounded-full shadow-sm">
          {icon}
        </div>
        <h3 className="font-extrabold text-center leading-tight text-lg">{title}</h3>
        <p className="text-xs mt-1 opacity-80 font-bold text-center tracking-wide">{subtitle}</p>
      </div>
      
      {/* Logical Nodes Section */}
      {nodes.length > 0 && (
        <div className="w-full p-3 bg-white flex-1 flex flex-col justify-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3" /> 核心邏輯節點 (LNs)
          </p>
          <div className="flex flex-col gap-1.5">
            {nodes.map((node, idx) => (
              <span key={idx} className={`text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-center`}>
                {node}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PrimaryDevice({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center bg-slate-50 border-2 border-slate-300 p-6 rounded-full w-40 h-40 justify-center shadow-lg shadow-slate-200 transition-transform hover:scale-105">
      <div className="text-slate-600 mb-2 w-12 h-12 flex items-center justify-center">
        {React.cloneElement(icon, { className: "w-10 h-10" })}
      </div>
      <span className="text-sm font-extrabold text-slate-800 text-center leading-tight">{title}</span>
      <span className="text-xs font-semibold text-slate-500 text-center mt-1">{subtitle}</span>
    </div>
  );
}

function BusBar({ name, color, shadow }) {
  return (
    <div className="w-full relative my-2 flex items-center justify-center">
      <div className={`absolute w-[95%] h-5 bg-gradient-to-r ${color} rounded-full shadow-[0_0_20px_rgba(0,0,0,0.15)] ${shadow} opacity-90`}></div>
      <div className="relative z-10 bg-white px-6 py-1.5 rounded-full border-2 border-slate-200 text-sm font-black tracking-widest text-slate-800 shadow-sm flex items-center gap-2">
        <Radio className="w-4 h-4 text-slate-500" />
        {name}
      </div>
    </div>
  );
}

function ConnectionLine({ height, label, color, textColor, textSide = "right", dashed = false }) {
  const lineStyle = dashed ? `border-l-4 border-dashed border-slate-800 bg-transparent` : color;
  const arrowBorder = dashed ? `border-slate-800` : color.replace('bg-', 'border-').split(' ')[0];

  return (
    <div className={`flex items-center justify-center relative ${height} w-16`}>
      {/* Vertical Line */}
      <div className={`w-1.5 h-full ${lineStyle} rounded-full z-0`}></div>
      {/* Label */}
      {label && (
        <div className={`absolute ${textSide === 'right' ? 'left-4' : 'right-4'} whitespace-nowrap text-xs font-bold ${textColor} bg-white/90 px-2 py-1 rounded backdrop-blur-sm border border-slate-200 shadow-sm z-10`}>
          {label}
        </div>
      )}
      {/* Arrows */}
      <div className={`absolute -bottom-1 w-3.5 h-3.5 rotate-45 border-b-4 border-r-4 ${arrowBorder} z-0 bg-white`}></div>
      <div className={`absolute -top-1 w-3.5 h-3.5 -rotate-135 border-b-4 border-r-4 ${arrowBorder} z-0 bg-white`}></div>
    </div>
  );
}

function GlossaryItem({ term, desc }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="text-base font-extrabold text-slate-800 mb-1 border-b border-slate-100 pb-1">{term}</h4>
      <p className="text-sm text-slate-600 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}