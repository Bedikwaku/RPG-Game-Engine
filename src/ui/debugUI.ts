import { TILE_SIZE } from "@/constants";
import { currentLayerIndex } from "@/state/layers";
import { MapState } from "@/state/mapState";
import { viewOffset, viewport } from "@/state/viewportState";

let debugDiv: HTMLDivElement;
let lastFrame = performance.now();
let fps = 0;
let mouseX = 0;
let mouseY = 0;

export function renderDebugUI(container: HTMLElement) {
  debugDiv = document.createElement("div");
  debugDiv.style.fontFamily = "monospace";
  debugDiv.style.fontSize = "12px";
  debugDiv.style.color = "#ccc";
  debugDiv.style.background = "#222";
  debugDiv.style.padding = "8px";
  debugDiv.style.marginTop = "4px";

  document.addEventListener("mousemove", (e) => {
    const rect = (
      container.querySelector("canvas") as HTMLCanvasElement
    ).getBoundingClientRect();
    mouseX = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    mouseY = Math.floor((e.clientY - rect.top) / TILE_SIZE);
  });
  requestAnimationFrame(trackFPS);
  setInterval(updateDebugInfo, 250);

  container.appendChild(debugDiv);
  updateDebugInfo();

  // Periodically update info
  setInterval(updateDebugInfo, 250);
}

function trackFPS(now: number) {
  const delta = now - lastFrame;
  fps = Math.round(1000 / delta);
  lastFrame = now;
  requestAnimationFrame(trackFPS);
}

function updateDebugInfo() {
  const map = MapState.getMapData();

  debugDiv.innerHTML = `
    <strong>Debug Info</strong><br>
    View Offset: (${viewOffset.x}, ${viewOffset.y})<br>
    Viewport Size: ${viewport.width} x ${viewport.height}<br>
    Current Layer: ${currentLayerIndex}<br>
    Map Size: ${map.width} x ${map.height}<br>
    Mouse Position: ${mouseX}, ${mouseY}<br>
    FPS: ${fps}
  `;
}
