import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, Sliders, Activity, Cpu, 
  Zap, Power, Network, BookOpen, Layers, HardDrive, 
  Radio, Info, ArrowDownUp, SplitSquareVertical,
  Cloud, Server, Monitor, 
  Database, Target, Terminal, Box, Tag, Key, AlertTriangle, Eye, ChevronRight
} from 'lucide-react';

// ==========================================
// Main Application Wrapper (Tab Navigation)
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('datamodel'); // 'topology' | 'datamodel'

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 shadow-lg px-4 md:px-8 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-indigo-400" />
          <span className="text-slate-100 font-bold text-lg tracking-wide">IEC 61850 Advanced Dashboard</span>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setActiveTab('topology')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              activeTab === 'topology' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Network className="w-4 h-4 inline-block mr-2 mb-0.5" />
            實體網路拓撲
          </button>
          <button 
            onClick={() => setActiveTab('datamodel')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              activeTab === 'datamodel' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Box className="w-4 h-4 inline-block mr-2 mb-0.5" />
            IED 資料模型 (Data Model)
          </button>
        </div>
      </div>

      {/* View Switcher */}
      {activeTab === 'topology' ? <TopologyView /> : <DataModelView />}
    </div>
  );
}

// ==========================================
// VIEW 2: Data Model Dashboard (Dark Theme)
// ==========================================
function DataModelView() {
  const [hoveredNode, setHoveredNode] = useState('IED');
  const [activeFC, setActiveFC] = useState('ST');

  const nodeDetails = {
    IED: { name: "IED (Intelligent Electronic Device)", zh: "智慧電子設備", desc: "最上層的實體裝置，整個資料樹的根節點。一台 IED 可包含多個存取點 (AP)。", ex: "ABB_REX640_1", intuition: "掛在變電站機櫃上、插著網路線的實體保護電驛鐵盒子。" },
    AP: { name: "AP (Access Point) / Server", zh: "存取點與伺服器", desc: "IED 對外的網路通訊端點，運行 MMS Server。透過不同的 AP，IED 可將不同的資料分別送往站控層 (Station Bus) 或過程層 (Process Bus)。", ex: "AccessPoint_1", intuition: "就像是設備的一張實體網卡或一個獨立的通訊服務器 API。" },
    LD: { name: "LD (Logical Device)", zh: "邏輯設備", desc: "將 IED 內的功能進行『虛擬分組』。每個 LD 下方必定包含 LLN0 (全局設定) 與 LPHD (硬體資訊) 兩個專屬節點。", ex: "LD0 (共用), ProtLD (保護)", intuition: "就像電腦裡的 C槽、D槽，用來把不同性質的功能 (保護、控制、量測) 分門別類。" },
    LN: { name: "LN (Logical Node)", zh: "邏輯節點", desc: "IEC 61850 的核心模組。由 4 個字母組成，首字母代表功能類別 (P=保護, M=量測, X=開關)。LLN0 是該 LD 的大腦。", ex: "XCBR (斷路器), PTOC (過流保護)", intuition: "軟體裡的一個『類別 (Class)』或『微服務』，專門負責一件具體工作。" },
    DO: { name: "DO (Data Object)", zh: "資料物件", desc: "邏輯節點下具體的資料群。每個 DO 都綁定一個 CDC (共用資料類別)，CDC 決定了它底下會有哪些標準屬性 (DA)。", ex: "Pos (位置), Str (啟動), Op (跳脫)", intuition: "物件導向裡的『物件變數』，它預載了一組固定格式的屬性。" },
    DA: { name: "DA (Data Attribute)", zh: "資料屬性", desc: "資料樹的最末端，真正攜帶數值的變數。包含 stVal (數值), q (品質), t (時間標籤) 或更複雜的 Oper (操作結構)。", ex: "stVal, q, t, ctlVal", intuition: "最終真正可以讀取 (Read) 或寫入 (Write) 的欄位。它的權限由 FC 決定！" },
    DS: { name: "DataSet", zh: "資料集", desc: "位於 LLN0 下，將分散在各個 LN/DO/DA 的重要資料『打包』成一個集合，方便一次性傳送。", ex: "DataSet_Events", intuition: "就像是準備要寄出的『包裹清單』，把要監控的變數都放進去。" },
    CB: { name: "Control Block", zh: "控制區塊", desc: "通訊引擎的發動機。定義 DataSet 中的資料要以什麼條件、什麼協定送出 (例如 URCB/BRCB 用於 MMS，GoCB 用於 GOOSE)。", ex: "BRCB1, GoCB01", intuition: "『包裹派遞規則』。告訴電驛：當數值改變時，請立刻用 GOOSE 廣播出去。" }
  };

  const fcDetails = {
    ST: { name: "Status Information", zh: "狀態資訊", type: "唯讀 (ReadOnly)", risk: "低", color: "text-green-400 bg-green-400/10 border-green-400/30", desc: "設備當前狀態。如開關開啟/閉合、保護是否作動。必帶 q (品質) 與 t (時間) 標籤。資安上只能監看。" },
    MX: { name: "Measurands", zh: "量測值", type: "唯讀 (ReadOnly)", risk: "低", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", desc: "類比量測數據。如電壓 11kV、實功 TotW。同樣帶有 q 與 t，屬於持續變動的監控數值。" },
    CO: { name: "Control", zh: "控制命令", type: "可寫入 (Write/Operate)", risk: "極高 (Critical)", color: "text-red-500 bg-red-500/10 border-red-500/30", desc: "對設備下達動作指令。包含 SBOw (Select) 與 Oper (Operate) 機制，需帶入 origin 與 ctlNum。紅隊首要關注目標！" },
    SP: { name: "Set Point", zh: "設定值", type: "可讀寫 (Read/Write)", risk: "高 (High)", color: "text-orange-400 bg-orange-400/10 border-orange-400/30", desc: "系統運行控制點與非保護類的單一設定值。可直接更改設備的控制目標與參數。" },
    SG: { name: "Setting Group", zh: "設定群組", type: "可讀寫 (Read/Write)", risk: "極高 (Critical)", color: "text-amber-400 bg-amber-400/10 border-amber-400/30", desc: "保護電驛專用的參數群組。修改 PTOC.StrVal.setMag.f (過流門檻) 屬於此類，寫入惡意數值會直接導致保護功能失效瞎盲！" },
    CF: { name: "Configuration", zh: "配置參數", type: "可讀寫 (Read/Write)", risk: "中高", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", desc: "改變節點的運作行為設定。例如修改 ctlModel 來降級控制安全性 (把 SBO 改為 direct-with-normal-security)。" }
  };

  // 安全防護：若 hoveredNode 不存在於 nodeDetails 中，預設顯示 IED
  const currentDetails = nodeDetails[hoveredNode] || nodeDetails['IED'];

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen pb-20">
      {/* 隱藏原生滾動條並美化左側樹狀圖的自定義樣式 */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 20px; }
      `}} />

      {/* 1. Hero 區 */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0iIzMzNDExNSIvPjwvc3ZnPg==')] opacity-20"></div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 mb-4 relative z-10 tracking-tight">
          IED 核心資料模型深度解析
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-4xl mx-auto relative z-10 font-medium leading-relaxed">
          完整呈現真實 ABB REX640 拓撲：包含 AP 伺服器、LLN0 系統大腦、DataSet 打包與 SBO 控制模型
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-slate-800/80 border border-purple-500/30 px-6 py-2 rounded-full relative z-10 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span className="text-slate-200 font-bold tracking-wide">
            核心觀念：<span className="text-purple-400">FC (Functional Constraint)</span> 是附著在 DA 上的橫向屬性，<span className="underline decoration-red-500/50 underline-offset-4">決定了該節點的資安讀寫權限</span>！
          </span>
        </div>
      </div>

      <div className="max-w-[95rem] mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* ========================================================= */}
        {/* 左側主幹：樹狀圖與互動展示 (7/12 width on large screens) */}
        {/* ========================================================= */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* 2. 核心架構總覽圖 (真實完整 ABB 架構) */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              <Layers className="text-indigo-500" /> 核心架構總覽圖 (完整真實拓撲)
            </h2>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* 樹狀結構視覺化 (Scrollable) */}
              <div className="flex-[3] w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 overflow-y-auto max-h-[700px] custom-scroll shadow-inner">
                <ComplexTreeNode type="IED" label="ABB_REX640_1" desc="實體保護與控制電驛" activeType={hoveredNode} onHover={setHoveredNode}>
                  <ComplexTreeNode type="AP" label="AccessPoint_1" desc="MMS 伺服器接入點" activeType={hoveredNode} onHover={setHoveredNode}>
                    
                    {/* --- LD0: System/Common --- */}
                    <ComplexTreeNode type="LD" label="LD0" desc="系統共用邏輯設備" activeType={hoveredNode} onHover={setHoveredNode}>
                      <ComplexTreeNode type="LN" label="LLN0" desc="邏輯設備大腦 (全局設定)" activeType={hoveredNode} onHover={setHoveredNode}>
                        <ComplexTreeNode type="DO" label="Mod" desc="運作模式" cdc="INC" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="stVal" desc="當前狀態" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="DA" label="ctlVal" desc="控制寫入" fc="CO" activeType={hoveredNode} onHover={setHoveredNode} />
                        </ComplexTreeNode>
                        <ComplexTreeNode type="DO" label="Health" desc="設備健康度" cdc="INS" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="stVal / q / t" desc="狀態, 品質, 時間" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                        </ComplexTreeNode>
                        {/* DataSets & CBs */}
                        <div className="mt-2 pt-2 border-t border-slate-800/50 border-dashed">
                          <ComplexTreeNode type="DS" label="DataSet_Events" desc="事件資料打包集" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="CB" label="URCB / BRCB" desc="報告控制區塊 (MMS 上送)" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="CB" label="GoCB" desc="GOOSE 廣播控制區塊" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="CB" label="SGCB" desc="設定群組控制區塊" activeType={hoveredNode} onHover={setHoveredNode} />
                        </div>
                      </ComplexTreeNode>
                      <ComplexTreeNode type="LN" label="LPHD1" desc="實體硬體裝置資訊" activeType={hoveredNode} onHover={setHoveredNode}>
                        <ComplexTreeNode type="DO" label="PhyNam" desc="設備實體銘牌" cdc="DPL" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="vendor" desc="廠牌名稱" fc="DC" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="DA" label="swRev / hwRev" desc="軟硬體版本" fc="DC" activeType={hoveredNode} onHover={setHoveredNode} />
                        </ComplexTreeNode>
                      </ComplexTreeNode>
                    </ComplexTreeNode>

                    {/* --- ProtLD: Protection --- */}
                    <ComplexTreeNode type="LD" label="ProtLD" desc="保護邏輯設備" activeType={hoveredNode} onHover={setHoveredNode}>
                      <ComplexTreeNode type="LN" label="LLN0" desc="保護區共用大腦" activeType={hoveredNode} onHover={setHoveredNode} />
                      <ComplexTreeNode type="LN" label="LPHD1" desc="保護區裝置資訊" activeType={hoveredNode} onHover={setHoveredNode} />
                      
                      {/* PIOC1 (50) */}
                      <ComplexTreeNode type="LN" label="PIOC1" desc="瞬時過電流保護 (50)" activeType={hoveredNode} onHover={setHoveredNode}>
                        <ComplexTreeNode type="DO" label="Str" desc="啟動狀態 (Pick-up)" cdc="ACD" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="general" desc="綜合啟動" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="DA" label="q / t" desc="品質與時間標籤" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                        </ComplexTreeNode>
                        <ComplexTreeNode type="DO" label="Op" desc="跳脫動作 (Trip)" cdc="ACT" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="general / q / t" desc="綜合跳脫與時標" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                        </ComplexTreeNode>
                        <ComplexTreeNode type="DO" label="StrVal" desc="瞬時啟動電流門檻" cdc="ASG" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="setMag.f" desc="門檻設定值 (浮點數)" fc="SG" activeType={hoveredNode} onHover={setHoveredNode} />
                        </ComplexTreeNode>
                      </ComplexTreeNode>

                      {/* PTOC1 (51) */}
                      <ComplexTreeNode type="LN" label="PTOC1" desc="延時過電流保護 (51)" activeType={hoveredNode} onHover={setHoveredNode}>
                        <ComplexTreeNode type="DO" label="Str" desc="啟動狀態 (Pick-up)" cdc="ACD" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="general" desc="綜合啟動" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="DA" label="q / t" desc="品質與時間標籤" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                        </ComplexTreeNode>
                        <ComplexTreeNode type="DO" label="Op" desc="跳脫動作 (Trip)" cdc="ACT" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="general / q / t" desc="綜合跳脫與時標" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                        </ComplexTreeNode>
                        <ComplexTreeNode type="DO" label="StrVal" desc="保護啟動電流門檻" cdc="ASG" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="setMag.f" desc="門檻設定值 (浮點數)" fc="SG" activeType={hoveredNode} onHover={setHoveredNode} />
                        </ComplexTreeNode>
                      </ComplexTreeNode>
                    </ComplexTreeNode>

                    {/* --- CtrlLD: Control --- */}
                    <ComplexTreeNode type="LD" label="CtrlLD" desc="控制邏輯設備" activeType={hoveredNode} onHover={setHoveredNode}>
                      <ComplexTreeNode type="LN" label="LLN0" desc="控制區共用大腦" activeType={hoveredNode} onHover={setHoveredNode} />
                      <ComplexTreeNode type="LN" label="XCBR1" desc="實體斷路器控制" activeType={hoveredNode} onHover={setHoveredNode}>
                        <ComplexTreeNode type="DO" label="Loc" desc="就地控制切換" cdc="SPS" activeType={hoveredNode} onHover={setHoveredNode} />
                        <ComplexTreeNode type="DO" label="BlkOpn" desc="閉鎖開關開啟" cdc="SPC" activeType={hoveredNode} onHover={setHoveredNode} />
                        <ComplexTreeNode type="DO" label="Pos" desc="開關實體位置" cdc="DPC" activeType={hoveredNode} onHover={setHoveredNode}>
                          <ComplexTreeNode type="DA" label="stVal" desc="當前實際位置(雙點)" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="DA" label="q / t" desc="品質與精確時間標籤" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="DA" label="ctlModel" desc="控制模型(如SBO)" fc="CF" activeType={hoveredNode} onHover={setHoveredNode} />
                          <ComplexTreeNode type="DA" label="Oper" desc="執行控制操作" fc="CO" activeType={hoveredNode} onHover={setHoveredNode}>
                            <ComplexTreeNode type="DA" label="ctlVal" desc="控制值 (開啟/閉合)" fc="CO" activeType={hoveredNode} onHover={setHoveredNode} />
                            <ComplexTreeNode type="DA" label="origin / ctlNum" desc="發起者與控制序號" fc="CO" activeType={hoveredNode} onHover={setHoveredNode} />
                          </ComplexTreeNode>
                        </ComplexTreeNode>
                      </ComplexTreeNode>
                      <ComplexTreeNode type="LN" label="CSWI1" desc="開關控制器 (含聯鎖)" activeType={hoveredNode} onHover={setHoveredNode}>
                         <ComplexTreeNode type="DO" label="Pos" desc="邏輯開關位置" cdc="DPC" activeType={hoveredNode} onHover={setHoveredNode}>
                           <ComplexTreeNode type="DA" label="stVal / q / t" desc="狀態、品質與時間" fc="ST" activeType={hoveredNode} onHover={setHoveredNode} />
                           <ComplexTreeNode type="DA" label="SBOw" desc="選擇前操作 (Select)" fc="CO" activeType={hoveredNode} onHover={setHoveredNode}>
                             <ComplexTreeNode type="DA" label="ctlVal / Check" desc="操作值與聯鎖檢查(Synchrocheck)" fc="CO" activeType={hoveredNode} onHover={setHoveredNode} />
                           </ComplexTreeNode>
                           <ComplexTreeNode type="DA" label="Oper" desc="執行操作 (Operate)" fc="CO" activeType={hoveredNode} onHover={setHoveredNode} />
                         </ComplexTreeNode>
                      </ComplexTreeNode>
                    </ComplexTreeNode>

                  </ComplexTreeNode>
                </ComplexTreeNode>
              </div>

              {/* 右側動態解說面板 (Sticky) */}
              <div className="flex-[2] w-full bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-inner sticky top-24">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">當前游標焦點</div>
                <h3 className={`text-3xl font-black mb-1 ${
                  hoveredNode === 'IED' ? 'text-blue-400' : 
                  hoveredNode === 'LD' ? 'text-teal-400' : 
                  hoveredNode === 'LN' ? 'text-orange-400' : 
                  hoveredNode === 'DO' ? 'text-purple-400' : 
                  hoveredNode === 'AP' ? 'text-cyan-400' : 
                  hoveredNode === 'DS' ? 'text-yellow-400' : 
                  hoveredNode === 'CB' ? 'text-rose-400' : 'text-fuchsia-400'
                }`}>
                  {currentDetails.name}
                </h3>
                <p className="text-slate-300 font-bold mb-4 text-lg">{currentDetails.zh}</p>
                
                <div className="space-y-4 text-sm">
                  <p className="text-slate-400 leading-relaxed text-base">{currentDetails.desc}</p>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1 text-xs font-bold">樹狀圖上的範例對應</span>
                    <span className="font-mono text-slate-200">{currentDetails.ex}</span>
                  </div>
                  <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-blue-300">
                    <Info className="w-5 h-5 shrink-0" />
                    <p><strong>工程直覺：</strong>{currentDetails.intuition}</p>
                  </div>
                  
                  {/* CDC Explanation Box for DO */}
                  {hoveredNode === 'DO' && (
                    <div className="mt-4 border-t border-slate-800 pt-3">
                      <span className="text-purple-400 font-bold text-xs mb-2 block flex items-center gap-1"><Tag className="w-3 h-3"/> CDC (Common Data Class) 常見類別</span>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div className="bg-slate-900 px-2 py-1 rounded"><strong>SPS</strong>: 單點狀態 (如 Loc)</div>
                        <div className="bg-slate-900 px-2 py-1 rounded"><strong>DPC</strong>: 雙點控制 (如 Pos)</div>
                        <div className="bg-slate-900 px-2 py-1 rounded"><strong>ACT</strong>: 保護跳脫 (如 Op)</div>
                        <div className="bg-slate-900 px-2 py-1 rounded"><strong>ASG</strong>: 類比設定 (如 StrVal)</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 4. 具體例子拆解區 */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              <Eye className="text-fuchsia-500" /> 具體路徑拆解 (實體案例)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 監看型例子 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> 監控型路徑 (唯讀觀察)
                </h3>
                <div className="font-mono text-sm space-y-2 relative z-10">
                  <PathItem level="IED" label="ABB_REX640" desc="實體電驛" color="blue" />
                  <PathItem level="LD" label="CtrlLD" desc="控制邏輯模組" color="teal" indent />
                  <PathItem level="LN" label="XCBR1" desc="斷路器節點" color="orange" indent2 />
                  <PathItem level="DO" label="Pos" desc="開關位置 (DPC)" color="purple" indent3 />
                  <div className="ml-12 mt-2 p-2 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-fuchsia-400 font-bold mr-2">stVal</span>
                      <span className="text-slate-400 text-xs">實際狀態值</span>
                    </div>
                    <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3" /> FC = ST
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-800">
                    💡 您讀取此路徑會得到 `1 (Closed)` 或 `0 (Open)`，同時會伴隨 `q` (品質) 確保數據可信，與 `t` (時標) 紀錄變更瞬間。
                  </p>
                </div>
              </div>

              {/* 控制型例子 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5" /> 控制型路徑 (SBO 兩段式高危寫入)
                </h3>
                <div className="font-mono text-sm space-y-2 relative z-10">
                  <PathItem level="IED" label="ABB_REX640" desc="實體電驛" color="blue" />
                  <PathItem level="LD" label="CtrlLD" desc="控制邏輯設備" color="teal" indent />
                  <PathItem level="LN" label="CSWI1" desc="開關控制器" color="orange" indent2 />
                  <PathItem level="DO" label="Pos" desc="邏輯位置 (DPC)" color="purple" indent3 />
                  <div className="ml-12 mt-2 p-2 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-fuchsia-400 font-bold mr-2">SBOw / Oper</span>
                      <span className="text-slate-400 text-xs">操作執行接點</span>
                    </div>
                    <span className="text-red-400 bg-red-400/10 border border-red-400/30 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3" /> FC = CO
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-800">
                    💡 駭客視角：不能直接改 stVal。必須先對 `SBOw` 送出選擇指令(含 Check 聯鎖檢查)，再對 `Oper` 送出執行指令，才能成功跳脫斷路器。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. LN 常見類型對照區 */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
             <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              <BookOpen className="text-orange-500" /> 滲透測試必背：LN (邏輯節點) 速查表
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <LNCard title="XCBR" desc="斷路器實體狀態與操作" target="Pos.stVal (看狀態), Pos.Oper (下指令)" type="control" />
              <LNCard title="CSWI" desc="開關控制器 (含聯鎖邏輯)" target="Pos.ctlVal (下指令會檢查聯鎖)" type="control" />
              <LNCard title="PTOC / PIOC" desc="延時(51)與瞬時(50)過流" target="StrVal (啟動電流門檻), Op (跳脫動作)" type="protect" />
              <LNCard title="PDIF" desc="差動保護" target="Op (跳脫), LinCap (線路容量設定)" type="protect" />
              <LNCard title="MMXU" desc="三相電力數值量測" target="A.phsA (A相電流), TotW (總實功)" type="monitor" />
              <LNCard title="LLN0" desc="設備共用大腦" target="Mod (運作模式), Loc (就地/遠方控制)" type="system" />
            </div>
          </section>

        </div>

        {/* ========================================================= */}
        {/* 右側邊欄：FC 專區與資安視角 (5/12 width on large screens) */}
        {/* ========================================================= */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* 5. FC 專區 */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Tag className="text-yellow-400" /> FC (Functional Constraint)
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              FC 賦予資料「靈魂」。同一個 <code className="text-purple-400 bg-slate-800 px-1 rounded">DO (Pos)</code> 底下，會有 FC=ST 的唯讀狀態，也會有 FC=CO 的控制節點。它們在目錄結構上同層，但讀寫權限完全不同。
            </p>

            <div className="space-y-3">
              {Object.keys(fcDetails).map(fc => (
                <div 
                  key={fc} 
                  onClick={() => setActiveFC(fc)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${activeFC === fc ? fcDetails[fc].color + ' shadow-lg scale-[1.02]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-lg">{fc}</span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-900/50 rounded-full">{fcDetails[fc].type}</span>
                  </div>
                  <div className={`text-sm font-bold mb-2 ${activeFC === fc ? '' : 'text-slate-400'}`}>{fcDetails[fc].zh}</div>
                  {activeFC === fc && (
                    <div className="text-xs mt-2 border-t border-current/20 pt-2 opacity-90 leading-relaxed">
                      {fcDetails[fc].desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 7. 資安視角區 */}
          <section className="bg-slate-950 border border-red-900/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(220,38,38,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Target className="w-32 h-32 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4 border-b border-red-900/50 pb-3 relative z-10">
              <Key className="w-5 h-5" /> 紅隊視角：寫入不等於控制
            </h2>
            
            <div className="space-y-4 text-sm relative z-10">
              <p className="text-slate-300">
                初學者常犯錯誤：看到 <code className="text-fuchsia-400 bg-slate-800 px-1">stVal</code> 是開關位置，就嘗試用 MMS Write 去改它。
              </p>
              
              <div className="bg-slate-900 p-3 rounded border-l-2 border-red-500">
                <p className="font-bold text-red-400 mb-1">❌ 篡改 ST / MX (Status/Measurands)</p>
                <p className="text-slate-400 text-xs">
                  會被 IED 拒絕 (Access Denied)。狀態是由硬體決定的，FC 規定此類別只允許 Read。
                </p>
              </div>

              <div className="bg-slate-900 p-3 rounded border-l-2 border-orange-500">
                <p className="font-bold text-orange-400 mb-1">⚠️ 篡改 SG / SP / CF (設定與配置)</p>
                <p className="text-slate-400 text-xs">
                  例如 <code className="text-amber-400 bg-slate-800 px-1">StrVal.setMag</code> (SG) 或 <code className="text-yellow-400 bg-slate-800 px-1">ctlModel</code> (CF)。修改成功不會馬上爆炸，但會破壞保護邏輯或降級安全性，埋下未爆彈。
                </p>
              </div>

              <div className="bg-slate-900 p-3 rounded border-l-2 border-rose-500 shadow-md shadow-red-900/20">
                <p className="font-bold text-rose-400 mb-1">💣 觸發 CO (Control)</p>
                <p className="text-slate-400 text-xs">
                  尋找 <code className="text-fuchsia-400 bg-slate-800 px-1">SBOw</code> 或 <code className="text-fuchsia-400 bg-slate-800 px-1">Oper</code> 節點。這必須搭配標準的 Select-Before-Operate (SBO) 兩段式指令，並傳入正確的 ctlNum，才能繞過 CSWI 的聯鎖檢查(Check)並觸發跳脫。
                </p>
              </div>
            </div>
          </section>

          {/* 8. 「一眼判讀」速查區 */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-100 mb-4 border-b border-slate-800 pb-3">
              ⚡ DA 特徵速查面版
            </h2>
            <div className="space-y-2 text-sm font-mono bg-slate-950 p-4 rounded-lg border border-slate-800">
              <LookupItem pattern="*.stVal" desc="唯讀狀態 / 告警" fc="ST" />
              <LookupItem pattern="*.q / *.t" desc="狀態的品質與時標" fc="ST" />
              <LookupItem pattern="*.mag.f" desc="唯讀量測數值 (浮點)" fc="MX" />
              <LookupItem pattern="*.ctlModel" desc="安全控制模型設定" fc="CF" />
              <LookupItem pattern="*.Oper / SBOw" desc="執行控制操作結構" fc="CO" />
              <LookupItem pattern="*.setMag.f" desc="保護門檻參數寫入" fc="SG" />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// Sub-components for Both Views
// ==========================================
function ComplexTreeNode({ type, label, desc, fc, cdc, children, onHover, activeType }) {
  const typeColors = {
    IED: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    AP:  "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    LD:  "text-teal-400 bg-teal-500/10 border-teal-500/30",
    LN:  "text-orange-400 bg-orange-500/10 border-orange-500/30",
    DO:  "text-purple-400 bg-purple-500/10 border-purple-500/30",
    DA:  "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
    DS:  "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    CB:  "text-rose-400 bg-rose-500/10 border-rose-500/30"
  };
  
  const fcColors = {
    ST: "text-green-400 border-green-500/30 bg-green-500/10",
    CO: "text-red-400 border-red-500/30 bg-red-500/10",
    SP: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    SG: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    CF: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    DC: "text-slate-400 border-slate-500/30 bg-slate-500/10"
  };

  const isActive = activeType === type;
  
  return (
    <div className="relative font-mono text-sm">
      <div 
        className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all border border-transparent
          ${isActive ? 'bg-slate-800 shadow-md ring-1 ring-slate-700' : 'hover:bg-slate-800/50'}
        `}
        onMouseEnter={() => onHover(type)}
      >
         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shadow-sm shrink-0 ${typeColors[type]}`}>
           {type}
         </span>
         <span className={`font-bold whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-300'}`}>{label}</span>
         
         {cdc && (
            <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 border border-purple-900/50 shadow-sm hidden sm:block shrink-0`}>
              CDC={cdc}
            </span>
         )}

         <span className="text-xs text-slate-500 hidden md:inline-block tracking-wide opacity-80 truncate ml-1">- {desc}</span>
         
         {fc && (
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 shadow-sm shrink-0 ${fcColors[fc] || fcColors.DC}`}>
              <Tag className="w-3 h-3 opacity-70" /> FC = {fc}
            </span>
         )}
      </div>
      
      {children && (
        <div className="ml-[11px] pl-4 border-l-2 border-slate-800 mt-1 mb-2 space-y-1 relative">
           {children}
        </div>
      )}
    </div>
  );
}

function PathItem({ level, label, desc, color, indent, indent2, indent3 }) {
  const margin = indent ? 'ml-4' : indent2 ? 'ml-8' : indent3 ? 'ml-12' : '';
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    teal: "text-teal-400 bg-teal-500/10 border-teal-500/30",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  };
  return (
    <div className={`${margin} flex items-center gap-2 mb-1`}>
      <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${colorClasses[color]}`}>{level}</span>
      <span className="text-slate-200 font-bold">{label}</span>
      <span className="text-slate-500 text-xs hidden sm:inline-block tracking-wide">({desc})</span>
    </div>
  );
}

function LookupItem({ pattern, desc, fc }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2 last:border-0 last:pb-0 pt-2 first:pt-0">
      <div className="flex items-center gap-2">
        <span className="text-fuchsia-400 font-bold bg-fuchsia-500/10 px-1.5 rounded">{pattern}</span>
        {fc && <span className="text-[9px] text-slate-400 border border-slate-700 px-1 rounded">{fc}</span>}
      </div>
      <span className="text-slate-400 text-xs font-bold text-right">{desc}</span>
    </div>
  );
}

function LNCard({ title, desc, target, type }) {
  const typeStyles = {
    control: "border-red-500/30 bg-red-500/5",
    protect: "border-orange-500/30 bg-orange-500/5",
    monitor: "border-emerald-500/30 bg-emerald-500/5",
    system: "border-blue-500/30 bg-blue-500/5",
  };
  return (
    <div className={`p-4 border rounded-xl shadow-lg transition-all hover:bg-slate-800 ${typeStyles[type]}`}>
      <h4 className="font-bold text-slate-200 text-lg mb-1">{title}</h4>
      <p className="text-xs text-slate-400 mb-3">{desc}</p>
      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
        <span className="text-[10px] text-slate-500 uppercase block mb-1 font-bold">高價值目標 DO.DA</span>
        <span className="text-xs font-mono text-fuchsia-300 font-bold">{target}</span>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 1: Topology (Light Theme)
// ==========================================
function TopologyView() {
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

// Topology Sub-components
function DeviceCard({ icon, title, subtitle, color, nodes = [] }) {
  const colorMap = {
    sky: "bg-white border-sky-300 text-sky-900 shadow-sky-100",
    slate: "bg-white border-slate-300 text-slate-800 shadow-slate-200",
    indigo: "bg-white border-indigo-300 text-indigo-900 shadow-indigo-100",
    emerald: "bg-white border-emerald-300 text-emerald-900 shadow-emerald-100",
    orange: "bg-white border-orange-300 text-orange-900 shadow-orange-100",
    red: "bg-white border-red-300 text-red-900 shadow-red-100",
  };
  const headerBgMap = { sky: "bg-sky-50", slate: "bg-slate-50", indigo: "bg-indigo-50", emerald: "bg-emerald-50", orange: "bg-orange-50", red: "bg-red-50" };

  return (
    <div className={`flex flex-col items-center w-64 rounded-xl border-2 shadow-lg transition-transform hover:-translate-y-1 overflow-hidden ${colorMap[color]}`}>
      <div className={`w-full flex flex-col items-center justify-center p-4 ${headerBgMap[color]} border-b border-${color}-200`}>
        <div className="mb-2 bg-white p-3 rounded-full shadow-sm">{icon}</div>
        <h3 className="font-extrabold text-center leading-tight text-lg">{title}</h3>
        <p className="text-xs mt-1 opacity-80 font-bold text-center tracking-wide">{subtitle}</p>
      </div>
      {nodes.length > 0 && (
        <div className="w-full p-3 bg-white flex-1 flex flex-col justify-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3" /> 核心邏輯節點 (LNs)
          </p>
          <div className="flex flex-col gap-1.5">
            {nodes.map((node, idx) => (
              <span key={idx} className={`text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-center`}>{node}</span>
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
      <div className="text-slate-600 mb-2 w-12 h-12 flex items-center justify-center">{React.cloneElement(icon, { className: "w-10 h-10" })}</div>
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
        <Radio className="w-4 h-4 text-slate-500" />{name}
      </div>
    </div>
  );
}

function ConnectionLine({ height, label, color, textColor, textSide = "right", dashed = false }) {
  const lineStyle = dashed ? `border-l-4 border-dashed border-slate-800 bg-transparent` : color;
  const arrowBorder = dashed ? `border-slate-800` : color.replace('bg-', 'border-').split(' ')[0];

  return (
    <div className={`flex items-center justify-center relative ${height} w-16`}>
      <div className={`w-1.5 h-full ${lineStyle} rounded-full z-0`}></div>
      {label && (
        <div className={`absolute ${textSide === 'right' ? 'left-4' : 'right-4'} whitespace-nowrap text-xs font-bold ${textColor} bg-white/90 px-2 py-1 rounded backdrop-blur-sm border border-slate-200 shadow-sm z-10`}>
          {label}
        </div>
      )}
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