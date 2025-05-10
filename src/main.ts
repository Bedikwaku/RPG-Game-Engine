import { renderDrawer } from "./ui/drawer";
import { initializeMap } from "./services/mapService";

// Canvas setup
const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
// Check if the canvas context is available
if (!ctx) {
  throw new Error("Canvas context is not available.");
}

if (!ctx) {
  console.error("Canvas context is not available.");
}

// Initialize the map
await renderDrawer();
initializeMap({
  canvas: canvas,
  ctx: ctx,
  mapId: "0",
  viewportWidth: 25,
  viewportHeight: 25,
});
