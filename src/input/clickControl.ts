import { TILE_SIZE } from "@/constants";
import { Tile } from "@/objects/map/tile";
import { batchDrawTiles } from "@/services/rendererService";
import { currentLayerIndex } from "@/state/layers";
import { MapState, MapData } from "@/state/mapState";
import { selectedTile } from "@/state/selectedTile";
import { viewOffset } from "@/state/viewportState";

export function initializeClickHandler(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get canvas context.");
    return;
  }
  const mapData = MapState.getMapData();
  const mapId = mapData.id ?? "0";
  setupClickHandler(canvas, mapId, mapData);
  console.log("Click handler initialized for map:", mapId);
}

function setupClickHandler(
  canvas: HTMLCanvasElement,
  mapId: string,
  mapData: MapData
): void {
  let isSelecting = false;
  let startTile: { x: number; y: number } | null = null;
  let currentTile: { x: number; y: number } | null = null;

  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = canvas.width;
  overlayCanvas.height = canvas.height;
  overlayCanvas.style.position = "absolute";
  overlayCanvas.style.top = canvas.offsetTop + "px";
  overlayCanvas.style.left = canvas.offsetLeft + "px";
  overlayCanvas.style.pointerEvents = "none";
  canvas.parentElement?.appendChild(overlayCanvas);
  const overlayCtx = overlayCanvas.getContext("2d");

  function clearOverlay() {
    overlayCtx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }

  function drawSelectionRect(
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) {
    if (!overlayCtx) return;
    clearOverlay();

    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxX = Math.max(start.x, end.x);
    const maxY = Math.max(start.y, end.y);

    console.debug(
      `Drawing selection rect from (${minX}, ${minY}) to (${maxX}, ${maxY})`
    );
    overlayCtx.strokeStyle = "rgba(255, 255, 0, 0.8)";
    overlayCtx.lineWidth = 2;
    overlayCtx.strokeRect(
      minX * TILE_SIZE,
      minY * TILE_SIZE,
      (maxX - minX + 1) * TILE_SIZE,
      (maxY - minY + 1) * TILE_SIZE
    );
  }

  canvas.addEventListener("mousedown", (event) => {
    if (event.button !== 0 && event.button !== 2) return;

    console.log(
      `Mouse down at (${Math.floor(event.clientX / TILE_SIZE)}, ${Math.floor(event.clientY / TILE_SIZE)}, ${currentLayerIndex})`
    );

    const rect = canvas.getBoundingClientRect();
    const tileX = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const tileY = Math.floor((event.clientY - rect.top) / TILE_SIZE);

    startTile = { x: tileX, y: tileY };
    currentTile = { ...startTile };
    isSelecting = true;
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!isSelecting || !startTile) return;

    const rect = canvas.getBoundingClientRect();
    const tileX = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const tileY = Math.floor((event.clientY - rect.top) / TILE_SIZE);
    currentTile = { x: tileX, y: tileY };

    drawSelectionRect(startTile, currentTile);
  });

  window.addEventListener("mouseup", async (event) => {
    if (!isSelecting || !startTile || !currentTile) return;

    isSelecting = false;
    const isRightClick = event.button === 2;
    const z = currentLayerIndex;

    const minX = Math.min(startTile.x, currentTile.x) + viewOffset.x;
    const minY = Math.min(startTile.y, currentTile.y) + viewOffset.y;
    const maxX = Math.max(startTile.x, currentTile.x) + viewOffset.x;
    const maxY = Math.max(startTile.y, currentTile.y) + viewOffset.y;
    console.debug(`minX: ${minX}, minY: ${minY}, maxX: ${maxX}, maxY: ${maxY}`);

    const updates: { tile: Tile | null; x: number; y: number }[] = [];

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (
          x >= 0 &&
          x < mapData.width &&
          y >= 0 &&
          y < mapData.height &&
          z >= 0 &&
          z < mapData.layers.length
        ) {
          if (isRightClick) {
            MapState.updateTile(x, y, z, null);
            updates.push({ tile: null, x, y });
          } else {
            const newTile: Tile = {
              tilesetId: selectedTile.tilesetId,
              tileIndex: [...selectedTile.tileIndex],
            };
            MapState.updateTile(x, y, z, newTile);
            updates.push({ tile: newTile, x, y });
            console.debug(
              `Tile updated at (${x}, ${y}) in layer ${z} with tilesetId ${newTile.tilesetId}`
            );
          }
        } else {
          console.warn(
            `Tile coordinates out of bounds: (${x}, ${y}) in layer ${z}`
          );
        }
      }
      // }

      // await batchDrawTiles(ctx, updates);
    }

    MapState.saveCurrentMap(mapId);
    clearOverlay();
    isSelecting = false;
    startTile = null;
    currentTile = null;
  });

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
}
