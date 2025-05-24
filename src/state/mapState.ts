import { eventBus } from "./eventBus";
import { Tile } from "@/objects/map/tile";
import { MapLayer } from "./layers";

export interface MapData {
  id: string;
  width: number;
  height: number;
  layers: MapLayer[];
}
export enum MapStateEvents {
  MAP_UPDATED = "mapUpdated",
}
export const MAP_UPDATED_EVENT = "mapUpdated";

let currentMapData: MapData | null = null;

function setMapData(newData: MapData) {
  currentMapData = newData;
  eventBus.publish(MapStateEvents.MAP_UPDATED, currentMapData);
}

function getMapData(): MapData {
  if (!currentMapData) throw new Error("Map data is not initialized");
  return currentMapData;
}

function updateTile(x: number, y: number, z: number, tile: Tile | null) {
  if (!currentMapData) return;
  currentMapData.layers[z].tiles[y][x] = tile;
  eventBus.publish(MapStateEvents.MAP_UPDATED, { x, y, z, tile });
}

function saveCurrentMap(mapId: string) {
  if (!currentMapData) return;
  const mapJson = JSON.stringify(currentMapData);
  localStorage.setItem(`map_${mapId}`, mapJson);
  console.log("Map saved:", mapId);
}

function loadMap(mapId: string): MapData | null {
  const mapJson = localStorage.getItem(`map_${mapId}`);
  eventBus.publish(MapStateEvents.MAP_UPDATED, currentMapData);
  if (mapJson) {
    const mapData: MapData = JSON.parse(mapJson);
    setMapData(mapData);
    return mapData;
  }
  return null;
}

export const MapState = {
  setMapData,
  getMapData,
  updateTile,
  saveCurrentMap,
  loadMap,
};
