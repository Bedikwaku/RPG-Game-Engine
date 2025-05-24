import { eventBus } from "./eventBus";

export enum LayerCanvasEvents {
  LAYER_CANVAS_ADDED = "LayerCanvasAdded",
  LAYER_CANVAS_REMOVED = "LayerCanvasRemoved",
  LAYER_CANVAS_UPDATED = "LayerCanvasUpdated",
}

let layerCanvases: HTMLCanvasElement[] = [];
function updateLayerCanvases(layers: HTMLCanvasElement[]) {
  layerCanvases = layers;
}
function getLayerCanvases(): HTMLCanvasElement[] {
  return layerCanvases;
}
function addToLayerCanvases(canvas: HTMLCanvasElement) {
  layerCanvases.push(canvas);
}
function removeFromLayerCanvasesByIndex(index: number) {
  if (index >= 0 && index < layerCanvases.length) {
    layerCanvases.splice(index, 1);
  }
}
function removeFromLayerCanvasesById(id: string) {
  const index = layerCanvases.findIndex((canvas) => canvas.id === id);
  let removedCanvas: HTMLCanvasElement | undefined;
  if (index !== -1) {
    removedCanvas = layerCanvases.splice(index, 1)[0];
  }
  eventBus.publish(LayerCanvasEvents.LAYER_CANVAS_REMOVED, removedCanvas);
}
function clearLayerCanvases() {
  layerCanvases = [];
}
function getLayerCanvasByIndex(index: number): HTMLCanvasElement | null {
  if (index >= 0 && index < layerCanvases.length) {
    return layerCanvases[index];
  }
  return null;
}

export const LayerCanvases = {
  updateLayerCanvases,
  getLayerCanvases,
  addToLayerCanvases,
  removeFromLayerCanvasesById,
  removeFromLayerCanvasesByIndex,
  clearLayerCanvases,
  getLayerCanvasByIndex,
};
// export default LayerCanvases;
