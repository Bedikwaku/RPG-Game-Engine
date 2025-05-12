type ViewOffsetListener = (x: number, y: number) => void;

let offset = { x: 0, y: 0 }; // actual view position (animated)
let targetOffset = { x: 0, y: 0 }; // where we want to scroll to
const listeners: ViewOffsetListener[] = [];

export const viewport = {
  x: 0,
  y: 0,
  width: 15,
  height: 15,
};

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
};

function notifyListeners() {
  for (const listener of listeners) {
    listener(offset.x, offset.y);
  }
}

export function subscribeToViewOffset(listener: ViewOffsetListener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  };
}

export const viewScale = 1;

// --- Smooth Scrolling Engine ---
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function updateSmoothOffset() {
  const speed = 0.2; // adjust for smoother or faster scrolling

  let changed = false;
  const newX = lerp(offset.x, targetOffset.x, speed);
  const newY = lerp(offset.y, targetOffset.y, speed);

  // use small epsilon to avoid floating point drift
  if (Math.abs(newX - offset.x) > 0.01 || Math.abs(newY - offset.y) > 0.01) {
    offset.x = newX;
    offset.y = newY;
    changed = true;
  } else {
    offset.x = targetOffset.x;
    offset.y = targetOffset.y;
  }

  if (changed) notifyListeners();

  requestAnimationFrame(updateSmoothOffset);
}

// Kick off the animation loop once at startup
updateSmoothOffset();
