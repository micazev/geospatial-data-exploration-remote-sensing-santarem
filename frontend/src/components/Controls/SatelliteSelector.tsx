import type { Satellite } from "../../types";

interface Props {
  satellite: Satellite;
  onChange: (s: Satellite) => void;
}

export default function SatelliteSelector({ satellite, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        Satellite
      </label>
      <div className="flex gap-2">
        {(["landsat", "sentinel"] as Satellite[]).map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              satellite === s
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {s === "landsat" ? "Landsat" : "Sentinel-2"}
          </button>
        ))}
      </div>
    </div>
  );
}
