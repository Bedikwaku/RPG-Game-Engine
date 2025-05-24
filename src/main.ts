import { renderDrawer } from "./ui/drawer";
import { initializeMap } from "./services/mapService";
import { renderDebugUI } from "./ui/debugUI";
import {
  discoverTilesets,
  loadAndCacheAllTilesets,
} from "./objects/map/tileset";
import { initializeCanvasLayer } from "./ui/layerCanvas";
import { CANVAS_LAYER_GRID } from "./constants";
import { renderLayerCanvasManager } from "./ui/layerCanvasManager";
import { CanvasManager } from "./services/canvasManager";
import { initializeRendererService } from "./services/rendererService";
import { initializeClickHandler } from "./input/clickControl";

// Canvas setup
const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
// Check if the canvas context is available
if (!ctx) {
  throw new Error("Canvas context is not available.");
}

// Initialize the map
async function initializeMapAndLayers(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  await discoverTilesets();
  await loadAndCacheAllTilesets();
  await initializeMap("0");
  renderLayerCanvasManager();
  renderDrawer();
  renderDebugUI(canvas.parentElement!);
  const canvasLayersGrid = document.createElement("div");
  canvasLayersGrid.id = CANVAS_LAYER_GRID;
  canvasLayersGrid.style.display = "grid";
  document.body.appendChild(canvasLayersGrid);
  const canvasManager = new CanvasManager(canvasLayersGrid);
  initializeRendererService(canvas);
  initializeClickHandler(canvas);
  // await initializeCanvasLayer(canvasLayersGrid);
}

initializeMapAndLayers(canvas, ctx)
  .then(() => {
    console.log("Map and layers initialized successfully.");
  })
  .catch((error) => {
    console.error("Error initializing map and layers:", error);
  });
//
