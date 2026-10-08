/**
 * 深色主題表格。
 * columns: 字串陣列，或 { label, className, cellClassName } 物件陣列
 *   短標籤欄可傳 cellClassName: 'whitespace-nowrap'，避免窄螢幕時被逐字換行
 * rows: 每列一個陣列，儲存格可以是字串或 React 節點
 * minWidth: 窄螢幕 (md 以下) 的表格最小寬度，超過容器時改由外層水平捲動，
 *   而不是把中文欄位壓成一個字一行。'auto' (預設) 依欄數決定：2 欄以下不設、3 欄 md、4 欄以上 lg；
 *   也可直接指定 'none' / 'sm' / 'md' / 'lg' / 'xl'。
 * 表頭不轉大寫，TrgOps、OptFlds、IEDScout 等大小寫敏感的名稱照原樣顯示。
 */
const MIN_WIDTHS = {
  none: '',
  sm: 'min-w-[28rem] md:min-w-0',
  md: 'min-w-[36rem] md:min-w-0',
  lg: 'min-w-[44rem] md:min-w-0',
  xl: 'min-w-[52rem] md:min-w-0',
};

function autoMinWidth(columnCount) {
  if (columnCount <= 2) return 'none';
  if (columnCount === 3) return 'md';
  return 'lg';
}

export default function DataTable({ columns, rows, caption, dense = false, minWidth = 'auto', className = '' }) {
  const cols = columns.map((c) => (typeof c === 'string' ? { label: c } : c));
  const minWidthKey = minWidth === 'auto' ? autoMinWidth(cols.length) : minWidth;
  const minWidthClass = MIN_WIDTHS[minWidthKey] ?? MIN_WIDTHS.none;
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 ${className}`}>
      <table className={`w-full ${minWidthClass} text-sm text-left border-collapse`}>
        {caption && (
          <caption className="caption-top text-left text-xs font-bold text-slate-500 px-4 py-2 border-b border-slate-800">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="bg-slate-900/80 text-xs tracking-wider text-slate-400">
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
