export type Satellite = "landsat" | "sentinel";

export interface ClassInfo {
  name: string;
  color: string;
}

export interface ClassesResponse {
  satellite: Satellite;
  classes: Record<string, ClassInfo>;
}

export interface YearsResponse {
  satellite: Satellite;
  all_years: number[];
  available_years: number[];
}

export interface PercentageRow {
  year: number;
  [className: string]: number;
}

export interface PercentagesResponse {
  satellite: Satellite;
  data: PercentageRow[];
}

export interface BoundsResponse {
  bounds: [[number, number], [number, number]];
}
