import { AlertTriangle } from 'lucide-react';

/**
 * 「未確認」標籤：標示由畫面或命名推論、尚未在 IED 上驗證的資訊。
 * 預設連到實測案例分頁的待驗證清單。
 */
export default function UnverifiedBadge({
  label = '未確認',
  title = '由畫面或命名推論，尚未在 IED 上驗證，詳見待驗證清單',
  href = '#lab/checklist',
  className = '',
}) {
  return (
    <a
      href={href}
      title={title}
      className={`inline-flex items-center gap-1 align-middle text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 whitespace-nowrap hover:bg-amber-500/20 transition-colors ${className}`}
    >
      <AlertTriangle className="w-3 h-3" />
      {label}
    </a>
  );
}
