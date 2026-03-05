import io
import os
from pathlib import Path

import geopandas as gpd
import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image

load_dotenv()

app = FastAPI(title="Santarem Remote Sensing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(os.getenv("DATA_DIR", "./data"))
SHAPEFILE_DIR = Path(__file__).parent.parent / "poligonos" / "shape santarem"

# Class definitions per satellite
LANDSAT_CLASSES = {0: "Water", 1: "Vegetation", 2: "Built Area"}
SENTINEL_CLASSES = {
    0: "Water",
    1: "Herbaceous Vegetation",
    2: "Built Area",
    3: "Exposed Soil",
    4: "Tree Vegetation",
}

# Color palettes (RGBA)
LANDSAT_COLORS = {
    0: (0, 0, 255, 200),      # Water - blue
    1: (0, 200, 0, 200),      # Vegetation - green
    2: (255, 255, 0, 200),    # Built Area - yellow
}
SENTINEL_COLORS = {
    0: (0, 0, 255, 200),      # Water - blue
    1: (144, 238, 144, 200),  # Herbaceous Vegetation - light green
    2: (255, 255, 0, 200),    # Built Area - yellow
    3: (255, 165, 0, 200),    # Exposed Soil - orange
    4: (0, 100, 0, 200),      # Tree Vegetation - dark green
}

LANDSAT_YEARS = [y for y in range(2002, 2022) if y not in (2012, 2013)]
SENTINEL_YEARS = list(range(2016, 2023))


def _get_tiff_path(satellite: str, year: int) -> Path:
    if satellite == "landsat":
        return DATA_DIR / "landsat" / f"Santarem_LandsatClassificacao_{year}.tif"
    elif satellite == "sentinel":
        return DATA_DIR / "sentinel" / f"Santarem_Sentinel2Classificacao_{year}.tif"
    raise ValueError(f"Unknown satellite: {satellite}")


def _validate_satellite(satellite: str):
    if satellite not in ("landsat", "sentinel"):
        raise HTTPException(status_code=400, detail="Satellite must be 'landsat' or 'sentinel'")


def _validate_year(satellite: str, year: int):
    years = LANDSAT_YEARS if satellite == "landsat" else SENTINEL_YEARS
    if year not in years:
        raise HTTPException(status_code=404, detail=f"Year {year} not available for {satellite}")


def _read_classification(satellite: str, year: int):
    path = _get_tiff_path(satellite, year)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"GeoTIFF not found: {path.name}")
    with rasterio.open(path) as src:
        data = src.read(1)
        bounds = src.bounds
        crs = src.crs
        transform = src.transform
    return data, bounds, crs, transform


def _calculate_percentages(data: np.ndarray) -> dict:
    unique, counts = np.unique(data, return_counts=True)
    total = data.size
    return {int(k): round(float(v / total * 100), 4) for k, v in zip(unique, counts)}


def _reproject_bounds(bounds, src_crs):
    """Reproject bounds to EPSG:4326 for Leaflet."""
    from pyproj import Transformer
    if str(src_crs) == "EPSG:4326":
        return [[bounds.bottom, bounds.left], [bounds.top, bounds.right]]
    transformer = Transformer.from_crs(src_crs, "EPSG:4326", always_xy=True)
    min_lon, min_lat = transformer.transform(bounds.left, bounds.bottom)
    max_lon, max_lat = transformer.transform(bounds.right, bounds.top)
    return [[min_lat, min_lon], [max_lat, max_lon]]


# --- API Endpoints ---


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/years/{satellite}")
def get_years(satellite: str):
    _validate_satellite(satellite)
    years = LANDSAT_YEARS if satellite == "landsat" else SENTINEL_YEARS
    available = [y for y in years if _get_tiff_path(satellite, y).exists()]
    return {
        "satellite": satellite,
        "all_years": years,
        "available_years": available,
    }


@app.get("/api/classes/{satellite}")
def get_classes(satellite: str):
    _validate_satellite(satellite)
    classes = LANDSAT_CLASSES if satellite == "landsat" else SENTINEL_CLASSES
    colors = LANDSAT_COLORS if satellite == "landsat" else SENTINEL_COLORS
    return {
        "satellite": satellite,
        "classes": {
            str(k): {
                "name": v,
                "color": f"rgba({colors[k][0]},{colors[k][1]},{colors[k][2]},{colors[k][3]/255:.2f})",
            }
            for k, v in classes.items()
        },
    }


@app.get("/api/percentages/{satellite}")
def get_percentages(satellite: str):
    """Return land cover percentages for all available years."""
    _validate_satellite(satellite)
    years = LANDSAT_YEARS if satellite == "landsat" else SENTINEL_YEARS
    classes = LANDSAT_CLASSES if satellite == "landsat" else SENTINEL_CLASSES
    results = []

    for year in years:
        path = _get_tiff_path(satellite, year)
        if not path.exists():
            continue
        data, _, _, _ = _read_classification(satellite, year)
        pcts = _calculate_percentages(data)
        row = {"year": year}
        for class_id, class_name in classes.items():
            row[class_name] = pcts.get(class_id, 0.0)
        results.append(row)

    return {"satellite": satellite, "data": results}


@app.get("/api/percentages/{satellite}/{year}")
def get_percentages_year(satellite: str, year: int):
    """Return land cover percentages for a single year."""
    _validate_satellite(satellite)
    _validate_year(satellite, year)
    data, _, _, _ = _read_classification(satellite, year)
    classes = LANDSAT_CLASSES if satellite == "landsat" else SENTINEL_CLASSES
    pcts = _calculate_percentages(data)
    result = {}
    for class_id, class_name in classes.items():
        result[class_name] = pcts.get(class_id, 0.0)
    return {"satellite": satellite, "year": year, "percentages": result}


@app.get("/api/classification/{satellite}/{year}/image")
def get_classification_image(satellite: str, year: int):
    """Return classified raster as a colored PNG with transparent background."""
    _validate_satellite(satellite)
    _validate_year(satellite, year)
    data, bounds, crs, _ = _read_classification(satellite, year)
    colors = LANDSAT_COLORS if satellite == "landsat" else SENTINEL_COLORS

    # Create RGBA image
    h, w = data.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    for class_id, color in colors.items():
        mask = data == class_id
        rgba[mask] = color

    img = Image.fromarray(rgba, "RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    buf.seek(0)

    leaflet_bounds = _reproject_bounds(bounds, crs)

    return StreamingResponse(
        buf,
        media_type="image/png",
        headers={
            "X-Bounds": str(leaflet_bounds),
            "Access-Control-Expose-Headers": "X-Bounds",
        },
    )


@app.get("/api/classification/{satellite}/{year}/bounds")
def get_classification_bounds(satellite: str, year: int):
    """Return the geographic bounds of a classified raster in EPSG:4326."""
    _validate_satellite(satellite)
    _validate_year(satellite, year)
    path = _get_tiff_path(satellite, year)
    if not path.exists():
        raise HTTPException(status_code=404, detail="GeoTIFF not found")
    with rasterio.open(path) as src:
        bounds = src.bounds
        crs = src.crs
    leaflet_bounds = _reproject_bounds(bounds, crs)
    return {"bounds": leaflet_bounds}


@app.get("/api/boundary")
def get_boundary():
    """Return the Santarem study area boundary as GeoJSON."""
    import json
    shp_path = SHAPEFILE_DIR / "santarem_aed.shp"
    if not shp_path.exists():
        raise HTTPException(status_code=404, detail="Shapefile not found")
    gdf = gpd.read_file(shp_path)
    if gdf.crs and gdf.crs != "EPSG:4326":
        gdf = gdf.to_crs("EPSG:4326")
    return JSONResponse(content=json.loads(gdf.to_json()))


@app.get("/api/ndvi/{satellite}/{year}")
def get_ndvi_stats(satellite: str, year: int):
    """Placeholder for NDVI statistics - requires raw band data."""
    raise HTTPException(
        status_code=501,
        detail="NDVI computation requires raw band data. Use GEE scripts for on-demand index calculation.",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
