import type { Satellite } from "../../types";
import { getColorsForSatellite } from "../../utils/colorMaps";

interface Props {
  satellite: Satellite;
}

export default function Legend({ satellite }: Props) {
  const colors = getColorsForSatellite(satellite);
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        Legend
      </label>
      <div className="space-y-1">
        {Object.entries(colors).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-sm border border-slate-600"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-slate-200">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
