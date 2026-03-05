import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  GeoJSON,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Satellite } from "../../types";
import { classificationImageUrl, useBounds, useBoundary } from "../../hooks/useApi";

interface Props {
  satellite: Satellite;
  year: number;
  showClassification: boolean;
  showBoundary: boolean;
}

// Santarem approximate center
const CENTER: [number, number] = [-2.44, -54.72];
const ZOOM = 12;

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds);
  }, [bounds, map]);
  return null;
}

export default function MapView({
  satellite,
  year,
  showClassification,
  showBoundary,
}: Props) {
  const { data: boundsData } = useBounds(satellite, year);
  const { data: boundary } = useBoundary();

  const imageBounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!boundsData) return null;
    return boundsData.bounds as LatLngBoundsExpression;
  }, [boundsData]);

  const imageUrl = classificationImageUrl(satellite, year);

  return (
    <MapContainer
      center={CENTER}
      zoom={ZOOM}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showBoundary && boundary && (
        <GeoJSON
          key="boundary"
          data={boundary}
          style={{
            color: "#ff4444",
            weight: 2,
            fillOpacity: 0,
            dashArray: "5,5",
          }}
        />
      )}

      {showClassification && imageBounds && (
        <ImageOverlay
          key={`${satellite}-${year}`}
          url={imageUrl}
          bounds={imageBounds}
          opacity={0.85}
        />
      )}

      <FitBounds bounds={imageBounds} />
    </MapContainer>
  );
}
