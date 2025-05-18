import { renderDrawer } from "./ui/drawer";
import { initializeMap } from "./services/mapService";
import { initializeDebugUI } from "./ui/debugUI";
import {
  discoverTilesets,
  loadAndCacheAllTilesets,
} from "./objects/map/tileset";
import { initializeCanvasLayer } from "./ui/layerCanvas";

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
  await initializeMap(canvas, "0");
  renderDrawer();
  initializeDebugUI(canvas.parentElement!);
  const canvasLayersGrid = document.createElement("div");
  canvasLayersGrid.id = "canvasLayersGrid";
  canvasLayersGrid.style.display = "grid";
  document.body.appendChild(canvasLayersGrid);
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
