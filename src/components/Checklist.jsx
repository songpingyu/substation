import { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

function load(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(key, state) {
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* 私密視窗或儲存被封鎖時忽略 */
  }
}

/**
 * 待驗證清單 (checklist)。
 * items: [{ id, text }]，text 可為字串或 React 節點
 * storageKey: 指定後勾選狀態存在瀏覽器 localStorage (只在本機)
 */
export default function Checklist({ items, storageKey, note = '勾選狀態只存在這台瀏覽器' }) {
  const [done, setDone] = useState(() => (storageKey ? load(storageKey) : {}));
  const toggle = (id) =>
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (storageKey) save(storageKey, next);
      return next;
    });
  const count = items.filter((i) => done[i.id]).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
        <span>{note}</span>
        <span>
          {count} / {items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const checked = Boolean(done[item.id]);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={checked}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  checked
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-400'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                {checked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <span className={`text-sm leading-relaxed ${checked ? 'opacity-70' : ''}`}>{item.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
