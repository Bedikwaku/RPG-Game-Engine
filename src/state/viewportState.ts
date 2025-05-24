import { eventBus } from "./eventBus";

let offset = { x: 0, y: 0 }; // actual view position (animated)
let targetOffset = { x: 0, y: 0 }; // where we want to scroll to

export const viewport = {
  x: 0,
  y: 0,
  width: 15,
  height: 15,
};

export enum ViewportEvents {
  VIEWPORT_MOVED = "ViewportMoved",
  VIEWPORT_RESIZED = "ViewportResized",
}

export const viewOffset = {
  get x() {
    return targetOffset.x;
  },
  set x(value: number) {
    targetOffset.x = value;
  },
  get y() {
    return targetOffset.y;
  },
  set y(value: number) {
    targetOffset.y = value;
  },
  set(x: number, y: number) {
    targetOffset.x = x;
    targetOffset.y = y;
  },
  get actual() {
    return { ...offset };
  },
  get target() {
    return { ...targetOffset };
  },
};

export const viewScale = 1;

// --- Smooth Scrolling Engine ---
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function updateSmoothOffset() {
  const speed = 0.2; // adjust for smoother or faster scrolling

  const newX = lerp(offset.x, targetOffset.x, speed);
  const newY = lerp(offset.y, targetOffset.y, speed);

  // use small epsilon to avoid floating point drift
  if (Math.abs(newX - offset.x) > 0.01 || Math.abs(newY - offset.y) > 0.01) {
    offset.x = newX;
    offset.y = newY;
    eventBus.publish("ViewportMoved", offset);
  } else {
    offset.x = targetOffset.x;
    offset.y = targetOffset.y;
  }

  requestAnimationFrame(updateSmoothOffset);
}

// Kick off the animation loop once at startup
updateSmoothOffset();
