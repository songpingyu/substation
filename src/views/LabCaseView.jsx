import SectionCard from '../components/SectionCard.jsx';

// 佔位：由後續步驟填入筆記第 1、2、6 節內容
export default function LabCaseView() {
  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen pb-20">
      <div className="max-w-[95rem] mx-auto px-4 md:px-8 mt-8">
        <SectionCard id="lab-setup" title="建置中" en="Work in progress">
          <p className="text-sm text-slate-400">IEDScout 實測案例內容建置中。</p>
        </SectionCard>
      </div>
    </div>
  );
}
