import { MapData } from "@/services/mapService";
import { eventBus } from "./eventBus";
import { Tile } from "@/objects/map/tile";

let currentMapData: MapData | null = null;

function setMapData(newData: MapData) {
  currentMapData = newData;
  eventBus.publish("mapUpdated", currentMapData);
}

function getMapData(): MapData {
  if (!currentMapData) throw new Error("Map data is not initialized");
  return currentMapData;
}

function updateTile(x: number, y: number, z: number, tile: Tile | null) {
  if (!currentMapData) return;
  currentMapData.tiles[z][y][x] = tile;
  eventBus.publish("tileUpdated", { x, y, z, tile });
}

function saveCurrentMap(mapId: string) {
  if (!currentMapData) return;
  const mapJson = JSON.stringify(currentMapData);
  localStorage.setItem(`map_${mapId}`, mapJson);
  console.log("Map saved:", mapId);
}

export const MapState = {
  setMapData,
  getMapData,
  updateTile,
  saveCurrentMap,
};
