import { Tile } from "@/objects/map/tile";
import { MapData } from "@/services/mapService";
import { eventBus } from "./eventBus";

export let currentLayerIndex = 0;
export let showAllLayers = true;
export let layers: Tile[][][] = [[]]; // 1 layer by default

export function removeLayer(index: number) {
  if (layers.length <= 1) return;
  layers.splice(index, 1);
  if (currentLayerIndex >= layers.length) currentLayerIndex = layers.length - 1;
}

export function addLayer(mapData: MapData, layerName?: string) {
  const newLayer = Array.from({ length: mapData.height }, () =>
    Array(mapData.width).fill(null)
  );
  mapData.tiles.push(newLayer);
  mapData.layers.push(layerName || `Layer ${mapData.layers.length + 1}`);
  currentLayerIndex = mapData.layers.length - 1;
}

export function setCurrentLayer(index: number): void {
  currentLayerIndex = index;
  eventBus.publish("layerChanged", undefined); // Notify listeners that the layer has changed
}

export function toggleShowAllLayers(value: boolean): void {
  showAllLayers = value;
  eventBus.publish("showAllLayersToggled", undefined); // Notify listeners that the showAllLayers flag has been toggled
}
