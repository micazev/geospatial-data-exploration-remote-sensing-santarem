import type { Satellite } from "../../types";
import SatelliteSelector from "../Controls/SatelliteSelector";
import YearSlider from "../Controls/YearSlider";
import LayerToggles from "../Controls/LayerToggles";
import Legend from "../Map/Legend";

interface Props {
  satellite: Satellite;
  onSatelliteChange: (s: Satellite) => void;
  years: number[];
  selectedYear: number;
  onYearChange: (y: number) => void;
  showClassification: boolean;
  showBoundary: boolean;
  onToggleClassification: () => void;
  onToggleBoundary: () => void;
}

export default function Sidebar({
  satellite,
  onSatelliteChange,
  years,
  selectedYear,
  onYearChange,
  showClassification,
  showBoundary,
  onToggleClassification,
  onToggleBoundary,
}: Props) {
  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col gap-5 overflow-y-auto">
      <SatelliteSelector satellite={satellite} onChange={onSatelliteChange} />
      <YearSlider
        years={years}
        selectedYear={selectedYear}
        onChange={onYearChange}
      />
      <LayerToggles
        showClassification={showClassification}
        showBoundary={showBoundary}
        onToggleClassification={onToggleClassification}
        onToggleBoundary={onToggleBoundary}
      />
      <Legend satellite={satellite} />
    </aside>
  );
}
