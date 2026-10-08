/**
 * 深色主題的章節卡片，樣式沿用資料模型分頁的 section。
 * title 為中文標題，en 為英文副標題，一起組成雙語標題。
 * id 供 URL hash 深連結使用 (例如 #report/rcb 對應 id="report-rcb")。
 */
export default function SectionCard({ id, icon, title, en, intro, children, className = '' }) {
  return (
    <section
      id={id}
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-8 shadow-2xl scroll-mt-24 ${className}`}
    >
      <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 mb-5 border-b border-slate-800 pb-4">
        {icon}
        <span>{title}</span>
        {en && <span className="text-sm md:text-base font-semibold text-slate-500 tracking-wide">{en}</span>}
      </h2>
      {intro && <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-5">{intro}</p>}
      {children}
    </section>
  );
}
