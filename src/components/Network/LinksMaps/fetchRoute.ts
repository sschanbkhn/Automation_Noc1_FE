export interface RouteResult {
    [x: string]: any;
    coordinates: [number, number][]; // Tọa độ đường đi
    distance: number; // Khoảng cách giữa hai điểm (mét)
  }
  
  export async function fetchRoute(
    start: [number, number],
    end: [number, number]
  ): Promise<RouteResult> {
    const url = `http://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
  
    const response = await fetch(url);
    const data = await response.json();
  
    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found");
    }
  
    const route = data.routes[0];
    return {
      coordinates: route.geometry.coordinates,
      distance: route.distance, // Tổng khoảng cách (mét)
    };
  }
  