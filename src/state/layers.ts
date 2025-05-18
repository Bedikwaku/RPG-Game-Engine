import { eventBus } from "./eventBus";

let currentLayerIndex = 0;
let showAllLayers = true;
type MapLayer = {
  name: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

const layers: Record<string, MapLayer> = {};

function createLayer(name: string, width: number, height: number): MapLayer {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  return { name, canvas, ctx };
}

function setCurrentLayer(index: number): void {
  currentLayerIndex = index;
  eventBus.publish("layerChanged", undefined); // Notify listeners that the layer has changed
}

function toggleShowAllLayers(value: boolean): void {
  showAllLayers = value;
  eventBus.publish("showAllLayersToggled", undefined); // Notify listeners that the showAllLayers flag has been toggled
}

export {
  createLayer,
  setCurrentLayer,
  toggleShowAllLayers,
  currentLayerIndex,
  showAllLayers,
  layers,
  MapLayer,
};
