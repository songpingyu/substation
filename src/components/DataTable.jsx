/**
 * 深色主題表格。
 * columns: 字串陣列，或 { label, className, cellClassName } 物件陣列
 * rows: 每列一個陣列，儲存格可以是字串或 React 節點
 * 窄螢幕時可水平捲動。
 */
export default function DataTable({ columns, rows, caption, dense = false, className = '' }) {
  const cols = columns.map((c) => (typeof c === 'string' ? { label: c } : c));
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 ${className}`}>
      <table className="w-full text-sm text-left border-collapse">
        {caption && (
          <caption className="caption-top text-left text-xs font-bold text-slate-500 px-4 py-2 border-b border-slate-800">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
            {cols.map((c, i) => (
              <th
                key={i}
                scope="col"
                className={`px-3 md:px-4 py-2.5 font-bold border-b border-slate-800 whitespace-nowrap ${c.className || ''}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 transition-colors align-top"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-3 md:px-4 ${dense ? 'py-1.5' : 'py-2.5'} text-slate-300 leading-relaxed ${cols[ci]?.cellClassName || ''}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
