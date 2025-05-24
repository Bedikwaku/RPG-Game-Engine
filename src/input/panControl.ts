import { TILE_SIZE } from "@/constants";
import { MapState } from "@/state/mapState";
import { viewport, viewOffset } from "@/state/viewportState";

// Pan speed (in pixels per second)
const PAN_SPEED = 1; // Adjust as needed

let panInterval: number | null = null;
let lastPanTimestamp = 0; // Track time for smooth panning
const panDirection = { x: 0, y: 0 }; // Store current pan direction

// We want to keep the pan controls dynamic
export function initializePanControls() {
  window.addEventListener("keydown", (e) => {
    if (e.repeat) return; // Prevent repeated keydown events from firing
    console.log("Key pressed:", e.key);
    switch (e.key) {
      case "ArrowUp":
      case "w":
        panDirection.y = -1;
        break;
      case "ArrowDown":
      case "s":
        panDirection.y = 1;
        break;
      case "ArrowLeft":
      case "a":
        panDirection.x = -1;
        break;
      case "ArrowRight":
      case "d":
        panDirection.x = 1;
        break;
    }

    // Start the pan interval if it's not already running
    if (!panInterval) {
      lastPanTimestamp = performance.now(); // Reset time tracking
      panInterval = requestAnimationFrame(panStep); // Start the panning loop
    }
  });

  window.addEventListener("keyup", (e) => {
    // Stop panning in the corresponding direction when the key is released
    switch (e.key) {
      case "ArrowUp":
      case "w":
        if (panDirection.y === -1) panDirection.y = 0;
        break;
      case "ArrowDown":
      case "s":
        if (panDirection.y === 1) panDirection.y = 0;
        break;
      case "ArrowLeft":
      case "a":
        if (panDirection.x === -1) panDirection.x = 0;
        break;
      case "ArrowRight":
      case "d":
        if (panDirection.x === 1) panDirection.x = 0;
        break;
    }

    // If no direction is active, snap to grid and stop the pan interval
    if (panDirection.x === 0 && panDirection.y === 0) {
      if (panInterval) {
        cancelAnimationFrame(panInterval);
        panInterval = null;
      }
      // Snap to nearest whole tile
      // viewOffset.x = Math.round(viewOffset.x);
      // viewOffset.y = Math.round(viewOffset.y);
    }
  });
}

// This function continuously updates the viewOffset based on time and pan direction
function panStep(timestamp: number) {
  const timeElapsed = (timestamp - lastPanTimestamp) / 1000; // Time in seconds
  const mapData = MapState.getMapData(); // Assuming you have a way to get the current map data
  lastPanTimestamp = timestamp;

  if (viewOffset.actual.x == viewOffset.target.x) {
    viewOffset.x += panDirection.x;
  }
  if (viewOffset.actual.y == viewOffset.target.y) {
    viewOffset.y += panDirection.y;
  }

  // Ensure the new offset is within map bounds (optional)
  const maxX = Math.max(
    0,
    mapData.width * TILE_SIZE - viewport.width * TILE_SIZE
  );
  const maxY = Math.max(
    0,
    mapData.height * TILE_SIZE - viewport.height * TILE_SIZE
  );

  viewOffset.x = Math.max(0, Math.min(viewOffset.x, maxX));
  viewOffset.y = Math.max(0, Math.min(viewOffset.y, maxY));

  // Continue the panning animation if there's still a direction
  if (panDirection.x !== 0 || panDirection.y !== 0) {
    panInterval = requestAnimationFrame(panStep);
  } else {
    // Snap to nearest whole tile
    viewOffset.x = Math.round(viewOffset.x);
    viewOffset.y = Math.round(viewOffset.y);
  }
}
