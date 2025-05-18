export type CanvasLayer = "background" | "tiles" | "objects" | "overlay";

const canvasMap: Record<CanvasLayer, HTMLCanvasElement> = {
  background: document.getElementById("bg-layer") as HTMLCanvasElement,
  tiles: document.getElementById("tile-layer") as HTMLCanvasElement,
  objects: document.getElementById("object-layer") as HTMLCanvasElement,
  overlay: document.getElementById("overlay-layer") as HTMLCanvasElement,
};

export const getCtx = (layer: CanvasLayer): CanvasRenderingContext2D => {
  const ctx = canvasMap[layer].getContext("2d");
  if (!ctx) throw new Error(`No context for canvas layer: ${layer}`);
  return ctx;
};

export const clearLayer = (layer: CanvasLayer) => {
  const canvas = canvasMap[layer];
  const ctx = getCtx(layer);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
