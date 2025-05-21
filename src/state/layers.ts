import { SHOW_ALL_LAYERS_EVENT } from "@/constants/events";
import { eventBus } from "./eventBus";
import { Tile } from "@/objects/map/tile";

let currentLayerIndex = 0;
let visibleLayersIndices = [0];
let showAllLayers = true;
type MapLayer = {
  name: string;
  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;
  tiles: (Tile | null)[][];
};

const layers: Record<string, MapLayer> = {};

function createLayer(name: string, width: number, height: number): MapLayer {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const tiles = Array.from({ length: height }, () => Array(width).fill(null));

  if (!ctx) throw new Error("Failed to get canvas context");
  return { name, canvas, ctx, tiles };
}

function setCurrentLayer(index: number): void {
  currentLayerIndex = index;
  eventBus.publish("layerChanged", undefined); // Notify listeners that the layer has changed
}

function setVisibleLayers(indexes: number[]): void {
  visibleLayersIndices = indexes;
  eventBus.publish("visibleLayersChanged", undefined); // Notify listeners that the layers have changed
}

function toggleShowAllLayers(value: boolean): void {
  console.log("Toggling showAllLayers to", value);
  showAllLayers = value;
  eventBus.publish(SHOW_ALL_LAYERS_EVENT, undefined); // Notify listeners that the showAllLayers flag has been toggled
}

type LayerRenderCache = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

const layerRenderCache: LayerRenderCache[] = [];

export {
  createLayer,
  setCurrentLayer,
  setVisibleLayers,
  toggleShowAllLayers,
  currentLayerIndex,
  visibleLayersIndices,
  showAllLayers,
  layers,
  MapLayer,
};
