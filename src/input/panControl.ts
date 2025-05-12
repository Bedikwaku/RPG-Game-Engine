import { viewOffset } from "@/state/viewportState";

export function initializePanControls() {
  window.addEventListener("keydown", (e) => {
    let changed = false;

    switch (e.key) {
      case "ArrowUp":
      case "w":
        viewOffset.y = Math.max(0, viewOffset.y - 1);
        changed = true;
        break;
      case "ArrowDown":
      case "s":
        viewOffset.y += 1;
        changed = true;
        break;
      case "ArrowLeft":
      case "a":
        viewOffset.x = Math.max(0, viewOffset.x - 1);
        changed = true;
        break;
      case "ArrowRight":
      case "d":
        viewOffset.x += 1;
        changed = true;
        break;
    }
  });
}
