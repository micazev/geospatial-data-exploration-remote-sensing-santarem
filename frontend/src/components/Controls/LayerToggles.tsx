interface Props {
  showClassification: boolean;
  showBoundary: boolean;
  onToggleClassification: () => void;
  onToggleBoundary: () => void;
}

export default function LayerToggles({
  showClassification,
  showBoundary,
  onToggleClassification,
  onToggleBoundary,
}: Props) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        Layers
      </label>
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={showClassification}
            onChange={onToggleClassification}
            className="accent-blue-500"
          />
          Classification
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={showBoundary}
            onChange={onToggleBoundary}
            className="accent-blue-500"
          />
          Study Area Boundary
        </label>
      </div>
    </div>
  );
}
