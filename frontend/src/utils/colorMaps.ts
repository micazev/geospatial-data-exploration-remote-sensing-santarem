export const LANDSAT_COLORS: Record<string, string> = {
  Water: "rgba(0, 0, 255, 0.78)",
  Vegetation: "rgba(0, 200, 0, 0.78)",
  "Built Area": "rgba(255, 255, 0, 0.78)",
};

export const SENTINEL_COLORS: Record<string, string> = {
  Water: "rgba(0, 0, 255, 0.78)",
  "Herbaceous Vegetation": "rgba(144, 238, 144, 0.78)",
  "Built Area": "rgba(255, 255, 0, 0.78)",
  "Exposed Soil": "rgba(255, 165, 0, 0.78)",
  "Tree Vegetation": "rgba(0, 100, 0, 0.78)",
};

export const CHART_COLORS: Record<string, string> = {
  Water: "#0000FF",
  Vegetation: "#00C800",
  "Built Area": "#FFD700",
  "Herbaceous Vegetation": "#90EE90",
  "Exposed Soil": "#FFA500",
  "Tree Vegetation": "#006400",
};

export function getColorsForSatellite(satellite: string): Record<string, string> {
  return satellite === "landsat" ? LANDSAT_COLORS : SENTINEL_COLORS;
}
