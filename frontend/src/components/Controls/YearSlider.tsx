import { useEffect, useRef, useState } from "react";

interface Props {
  years: number[];
  selectedYear: number;
  onChange: (year: number) => void;
}

export default function YearSlider({ years, selectedYear, onChange }: Props) {
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const yearRef = useRef(selectedYear);
  yearRef.current = selectedYear;

  const currentIdx = years.indexOf(selectedYear);

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      const idx = years.indexOf(yearRef.current);
      const next = idx < years.length - 1 ? idx + 1 : 0;
      onChange(years[next]);
    }, 1500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, years, onChange]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Year
        </label>
        <span className="text-lg font-bold text-white">{selectedYear}</span>
      </div>
      <input
        type="range"
        min={0}
        max={years.length - 1}
        value={currentIdx >= 0 ? currentIdx : 0}
        onChange={(e) => onChange(years[Number(e.target.value)])}
        className="w-full accent-blue-500"
      />
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>{years[0]}</span>
        <span>{years[years.length - 1]}</span>
      </div>
      <button
        onClick={() => setPlaying(!playing)}
        className="w-full mt-1 px-3 py-1 rounded text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
      >
        {playing ? "Pause" : "Play Animation"}
      </button>
    </div>
  );
}
