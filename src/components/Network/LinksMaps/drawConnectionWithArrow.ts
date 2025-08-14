import { LineString } from "ol/geom";
import { Feature } from "ol";
import { Style, Stroke } from "ol/style";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { fromLonLat } from "ol/proj";
import { fetchRoute } from "./fetchRoute";

export async function drawConnectionWithoutArrow(
  map: any,
  start: [number, number],
  end: [number, number],
  type: "Cáp ngầm" | "Cáp treo"
): Promise<number> {
  const routeResult = await fetchRoute(start, end);

  // Xác định kiểu đường nối
  const color = type === "Cáp ngầm" ? "blue" : "green";
  const lineDash = type === "Cáp ngầm" ? [5, 5] : [0]; // Nét đứt cho Cáp ngầm, liền cho Cáp treo

  // Vẽ đường nối
  const lineFeature = new Feature({
    geometry: new LineString(
      routeResult.coordinates.map(([lon, lat]) => fromLonLat([lon, lat]))
    ),
  });

  lineFeature.setStyle(
    new Style({
      stroke: new Stroke({
        color,
        width: 2,
        lineDash, // Kiểu đường nối
      }),
    })
  );

  const connectionLayer = new VectorLayer({
    source: new VectorSource({
      features: [lineFeature],
    }),
  });

  map.addLayer(connectionLayer);

  return routeResult.distance; // Trả về khoảng cách giữa 2 điểm
}
export async function drawConnectionWithState(
    map: any,
    start: [number, number],
    end: [number, number],
    type: "Cáp ngầm" | "Cáp treo",
    active: boolean // Trạng thái hoạt động của link
  ): Promise<number> {
    const routeResult = await fetchRoute(start, end);
  
    // Xác định kiểu đường nối
    const color = active ? (type === "Cáp ngầm" ? "blue" : "green") : "red";
    const lineDash = active ? (type === "Cáp ngầm" ? [5, 5] : [0]) : [0]; // Nét liền nếu không hoạt động
  
    // Vẽ đường nối
    const lineFeature = new Feature({
      geometry: new LineString(
        routeResult.coordinates.map(([lon, lat]) => fromLonLat([lon, lat]))
      ),
    });
  
    lineFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color,
          width: active ? 2 : 2, // Đường luôn giữ kích thước cố định
          lineDash, // Kiểu đường nối
        }),
      })
    );
  
    const connectionLayer = new VectorLayer({
      source: new VectorSource({
        features: [lineFeature],
      }),
    });
  
    map.addLayer(connectionLayer);
  
    return routeResult.distance; // Trả về khoảng cách giữa 2 điểm
  }