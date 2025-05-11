import { renderDrawer } from "./ui/drawer";
import { initializeMap } from "./services/mapService";

// Canvas setup
const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
// Check if the canvas context is available
if (!ctx) {
  throw new Error("Canvas context is not available.");
}

// Initialize the map
renderDrawer();
initializeMap(canvas, "0");
