import { useCallback, useEffect, useState } from "react";
import type { Satellite } from "./types";
import { useYears } from "./hooks/useApi";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import MapView from "./components/Map/MapView";
import LandCoverTimeSeries from "./components/Charts/LandCoverTimeSeries";

const DEFAULT_LANDSAT_YEARS = [
  2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2014, 2015,
  2016, 2017, 2018, 2019, 2020, 2021,
];
const DEFAULT_SENTINEL_YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022];

export default function App() {
  const [satellite, setSatellite] = useState<Satellite>("landsat");
  const [selectedYear, setSelectedYear] = useState(2021);
  const [showClassification, setShowClassification] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);

  const { data: yearsData } = useYears(satellite);

  const years =
    yearsData && yearsData.available_years.length > 0
      ? yearsData.available_years
      : satellite === "landsat"
        ? DEFAULT_LANDSAT_YEARS
        : DEFAULT_SENTINEL_YEARS;

  // Reset year when switching satellites if current year is not available
  useEffect(() => {
    if (!years.includes(selectedYear)) {
      setSelectedYear(years[years.length - 1]);
    }
  }, [satellite, years, selectedYear]);

  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          satellite={satellite}
          onSatelliteChange={setSatellite}
          years={years}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          showClassification={showClassification}
          showBoundary={showBoundary}
          onToggleClassification={() => setShowClassification((v) => !v)}
          onToggleBoundary={() => setShowBoundary((v) => !v)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <MapView
              satellite={satellite}
              year={selectedYear}
              showClassification={showClassification}
              showBoundary={showBoundary}
            />
          </div>
          <div className="h-56 bg-slate-800 border-t border-slate-700 p-2">
            <LandCoverTimeSeries
              satellite={satellite}
              selectedYear={selectedYear}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
