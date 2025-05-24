import { CANVAS_LAYER_GRID, TILE_SIZE } from "@/constants";
import { MapState } from "@/state/mapState";

const layerCanvases: HTMLCanvasElement[] = [];

export async function renderLayerCanvasManager(): Promise<void> {
  console.debug("Rendering Layer Canvas Manager");
  // const drawer = document.getElementById(CANVAS_LAYER_GRID);
  // create a div and append it to the body
  const canvasManager = document.createElement("div");
  canvasManager.id = CANVAS_LAYER_GRID;
  canvasManager.style.display = "grid";
  canvasManager.style.position = "absolute";
  canvasManager.style.top = "0";
  canvasManager.style.zIndex = "-1";
  document.body.appendChild(canvasManager);
  if (!canvasManager) {
    console.warn("[TilesetLoader] Drawer element not found");
    return;
  }

  const mapState = MapState.getMapData();
  if (!mapState) {
    console.error("Map state is not initialized.");
    return;
  }
  const layers = mapState.layers;
  console.log("Layers", layers);
  const width = mapState.width * TILE_SIZE;
  const height = mapState.height * TILE_SIZE;

  layers.forEach((_, layerIndex) => {
    const canvas = document.createElement("canvas");
    console.debug("Creating canvas for layer", layerIndex);
    canvas.width = width;
    canvas.height = height;
    canvas.id = `layerCanvas-${layerIndex}`;
    canvasManager.appendChild(canvas);
  });
  // canvasManager.style.display = "none";
}

export class LayerCanvasManager {
  private layerCanvases: HTMLCanvasElement[] = [];

  constructor() {
    this.initializeCanvases();
    // this.drawAllLayers();
  }

  private initializeCanvases() {
    const mapState = MapState.getMapData();
    if (!mapState) {
      console.error("Map state is not initialized.");
      return;
    }
    const layers = mapState.layers;
    const width = mapState.width * TILE_SIZE;
    const height = mapState.height * TILE_SIZE;

    this.layerCanvases = layers.map((_, layerIndex) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.pointerEvents = "none"; // Prevents interaction
      canvas.dataset.layerIndex = String(layerIndex);
      document.body.appendChild(canvas); // or append to a specific container
      return canvas;
    });
  }

  getCanvases(): HTMLCanvasElement[] {
    return this.layerCanvases;
  }

  getCanvas(layerIndex: number): HTMLCanvasElement | null {
    return this.layerCanvases[layerIndex] ?? null;
  }
}
