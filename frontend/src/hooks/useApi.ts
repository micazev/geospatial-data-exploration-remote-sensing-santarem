import { useEffect, useState } from "react";
import type {
  Satellite,
  YearsResponse,
  PercentagesResponse,
  BoundsResponse,
} from "../types";

const API_BASE = "/api";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export function useYears(satellite: Satellite) {
  const [data, setData] = useState<YearsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchJson<YearsResponse>(`${API_BASE}/years/${satellite}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [satellite]);

  return { data, loading, error };
}

export function usePercentages(satellite: Satellite) {
  const [data, setData] = useState<PercentagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchJson<PercentagesResponse>(`${API_BASE}/percentages/${satellite}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [satellite]);

  return { data, loading, error };
}

export function useBounds(satellite: Satellite, year: number) {
  const [data, setData] = useState<BoundsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    fetchJson<BoundsResponse>(
      `${API_BASE}/classification/${satellite}/${year}/bounds`
    )
      .then(setData)
      .catch((e) => setError(e.message));
  }, [satellite, year]);

  return { data, error };
}

export function useBoundary() {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<GeoJSON.FeatureCollection>(`${API_BASE}/boundary`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function classificationImageUrl(satellite: Satellite, year: number) {
  return `${API_BASE}/classification/${satellite}/${year}/image`;
}
