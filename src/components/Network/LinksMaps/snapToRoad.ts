export async function snapToRoad(lat: number, lon: number): Promise<[number, number]> {
    const url = `http://router.project-osrm.org/nearest/v1/driving/${lon},${lat}`;
    
    const response = await fetch(url);
    const data = await response.json();
  
    if (!data.waypoints || data.waypoints.length === 0) {
      throw new Error("No nearby road found.");
    }
  
    const snappedCoordinates = data.waypoints[0].location; // [longitude, latitude]
    return [snappedCoordinates[1], snappedCoordinates[0]]; // Đảo lại thành [lat, lon]
  }
  