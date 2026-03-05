import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { Satellite } from "../../types";
import { usePercentages } from "../../hooks/useApi";
import { CHART_COLORS } from "../../utils/colorMaps";

interface Props {
  satellite: Satellite;
  selectedYear: number;
}

export default function LandCoverTimeSeries({ satellite, selectedYear }: Props) {
  const { data, loading, error } = usePercentages(satellite);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Loading chart data...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm">
        {error}
      </div>
    );
  }
  if (!data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        No data available. Make sure GeoTIFF files are in the data directory.
      </div>
    );
  }

  const classNames = Object.keys(data.data[0]).filter((k) => k !== "year");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="year"
          stroke="#94a3b8"
          tick={{ fontSize: 11 }}
          type="number"
          domain={["dataMin", "dataMax"]}
        />
        <YAxis
          stroke="#94a3b8"
          tick={{ fontSize: 11 }}
          unit="%"
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "6px",
            fontSize: 12,
          }}
          labelStyle={{ color: "#e2e8f0" }}
          itemStyle={{ color: "#e2e8f0" }}
          formatter={(value: number) => `${value.toFixed(2)}%`}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#e2e8f0" }} />
        <ReferenceLine
          x={selectedYear}
          stroke="#ffffff"
          strokeDasharray="4 4"
          strokeWidth={1.5}
        />
        {classNames.map((name) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={CHART_COLORS[name] || "#8884d8"}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
