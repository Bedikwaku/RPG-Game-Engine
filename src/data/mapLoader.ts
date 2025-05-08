import { createEmptyMap3D } from "../core/Map3D";

// Type to represent map data
type MapData = {
  width: number;
  height: number;
  depth: number;
  tiles: any[][][]; // 3D array of TileProps
};

// Load the map from a file or local storage
export async function loadMap(mapId: string): Promise<MapData> {
  try {
    // Attempt to load the map from local storage first (as mock server)
    const mapJson = localStorage.getItem(`map_${mapId}`);
    if (mapJson) {
      return JSON.parse(mapJson);
    }

    // Attempt to fetch map file from public assets (mock server)
    const response = await fetch(`/assets/maps/${mapId}.json`);
    if (response.ok) {
      return await response.json();
    }

    // If map not found, generate a default map
    return createDefaultMap();
  } catch (error) {
    console.error("Failed to load map:", error);
    return createDefaultMap(); // Return default map if error occurs
  }
}

// Generate a default 30x30x3 map
function createDefaultMap(): MapData {
  console.log("Generating default map...");
  const defaultMap = createEmptyMap3D(30, 30, 3, "grass"); // Default texture is 'grass'
  return {
    width: 30,
    height: 30,
    depth: 3,
    tiles: defaultMap,
  };
}

// Save the map to localStorage (mock server)
export function saveMap(mapId: string, mapData: MapData): void {
  try {
    const mapJson = JSON.stringify(mapData);
    localStorage.setItem(`map_${mapId}`, mapJson);
  } catch (error) {
    console.error("Failed to save map:", error);
  }
}
