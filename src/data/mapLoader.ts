import { TileObject } from "objects/map/tile";

// Type to represent map data
export type MapData = {
  width: number;
  height: number;
  depth: number;
  tiles: (TileObject | null)[][][]; // 3D array of TileProps
};

// Load the map from a file or local storage
export async function loadMap(mapId: string): Promise<MapData> {
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
}

export function generateTiles(
  width: number,
  height: number,
  depth: number
): TileObject[][][] {
  // generate null 3d array
  const tiles: TileObject[][][] = Array.from({ length: depth }, () =>
    Array.from({ length: height }, () => Array(width).fill(null))
  );
  tiles[0][0][0] = {
    tilesetId: 1,
    tileIndex: [0, 0],
  }; // Set the first tile as a placeholder
  return tiles;
}

// Generate a default 30x30x3 map
export function createDefaultMap(): MapData {
  console.log("Generating default map...");
  const defaultTiles = generateTiles(30, 30, 3);
  return {
    width: 30,
    height: 30,
    depth: 3,
    tiles: defaultTiles,
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
