import { LineString } from "ol/geom";
import { Feature } from "ol";
import { Style, Stroke } from "ol/style";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { fromLonLat } from "ol/proj";
import { fetchRoute } from "./fetchRoute";

export async function drawRoute(
  map: any,
  start: [number, number],
  end: [number, number]
): Promise<void> {
  const routeCoordinates = await fetchRoute(start, end);

  const routeFeature = new Feature({
    geometry: new LineString(routeCoordinates.map(([lon, lat]: [number, number]) => {
        return fromLonLat([lon, lat]);
    })),
  });

  routeFeature.setStyle(
    new Style({
      stroke: new Stroke({
        color: "blue",
        width: 3,
      }),
    })
  );

  const routeLayer = new VectorLayer({
    source: new VectorSource({
      features: [routeFeature],
    }),
  });

  map.addLayer(routeLayer);
}
