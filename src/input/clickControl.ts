import { TILE_SIZE } from "@/constants";
import { Tile } from "@/objects/map/tile";
import { dragSelectionManager } from "@/state/dragSelectionManager";
import { currentLayerIndex } from "@/state/layers";
import { MapState, MapData } from "@/state/mapState";
import {
  selectedTile,
  selectedTileArea,
  setSelectedTileArea,
} from "@/state/selectedTile";
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

// export function initializeTilesetClickHandler(canvas: HTMLCanvasElement): void {
//   const ctx = canvas.getContext("2d");
//   if (!ctx) {
//     console.error("Failed to get canvas context.");
//     return;
//   }
//   const mapData = MapState.getMapData();
//   const mapId = mapData.id ?? "0";
//   // setupTilesetClickHandler(canvas, mapId, mapData, tilesetId);
//   let isSelecting = false;
//   let startTile: { x: number; y: number } | null = null;
//   let currentTile: { x: number; y: number } | null = null;

//   const overlayCanvas = document.createElement("canvas");
//   overlayCanvas.width = canvas.width;
//   overlayCanvas.height = canvas.height;
//   overlayCanvas.style.position = "absolute";
//   overlayCanvas.style.top = canvas.offsetTop + "px";
//   overlayCanvas.style.left = canvas.offsetLeft + "px";
//   overlayCanvas.style.pointerEvents = "none";
//   canvas.parentElement?.appendChild(overlayCanvas);
//   const overlayCtx = overlayCanvas.getContext("2d");

//   function clearOverlay() {
//     overlayCtx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
//   }

//   function drawSelectionRect(
//     start: { x: number; y: number },
//     end: { x: number; y: number }
//   ) {
//     if (!overlayCtx) return;
//     clearOverlay();

//     const minX = Math.min(start.x, end.x) - viewOffset.x;
//     const minY = Math.min(start.y, end.y) - viewOffset.y;
//     const maxX = Math.max(start.x, end.x) - viewOffset.x;
//     const maxY = Math.max(start.y, end.y) - viewOffset.y;

//     console.debug(
//       `Drawing selection rect from (${minX}, ${minY}) to (${maxX}, ${maxY})`
//     );
//     overlayCtx.strokeStyle = "rgba(255, 255, 0, 0.8)";
//     overlayCtx.lineWidth = 2;
//     overlayCtx.strokeRect(
//       minX * TILE_SIZE,
//       minY * TILE_SIZE,
//       (maxX - minX + 1) * TILE_SIZE,
//       (maxY - minY + 1) * TILE_SIZE
//     );
//   }
//   canvas.addEventListener("mousedown", (event) => {
//     const rect = canvas.getBoundingClientRect();
//     const tileX = Math.floor((event.clientX - rect.left) / TILE_SIZE);
//     const tileY = Math.floor((event.clientY - rect.top) / TILE_SIZE).y;
//     startTile = { x: tileX, y: tileY };
//     currentTile = { ...startTile };
//     isSelecting = true;
//     console.log(`Mouse down at (${tileY}, ${tileX}, ${currentLayerIndex})`);
//   });

//   canvas.addEventListener("mouseenter", () => {
//     const area = dragSelectionManager.update(y, x);
//     if (area) {
//       setSelectedTileArea(area);
//       highlightTile(canvasTiles, area);
//     }
//   });

//   canvas.addEventListener("click", () => {
//     if (!dragSelectionManager["isDragging"]) {
//       selectedTileIndex = [y, x];
//       selectedTile.tilesetId = tilesetId;
//       selectedTile.tileIndex = [y, x];
//       resetSelectedTileArea();
//       drawSelectionRect(startTile, currentTile);
//       highlightTile(canvasTiles, selectedTileIndex);
//     }
//   });
// }

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

    const minX = Math.min(start.x, end.x) - viewOffset.x;
    const minY = Math.min(start.y, end.y) - viewOffset.y;
    const maxX = Math.max(start.x, end.x) - viewOffset.x;
    const maxY = Math.max(start.y, end.y) - viewOffset.y;

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

    const rect = canvas.getBoundingClientRect();
    const tileX =
      Math.floor((event.clientX - rect.left) / TILE_SIZE) + viewOffset.x;
    const tileY =
      Math.floor((event.clientY - rect.top) / TILE_SIZE) + viewOffset.y;

    console.log(`Mouse down at (${tileX}, ${tileY}, ${currentLayerIndex})`);

    startTile = { x: tileX, y: tileY };
    currentTile = { ...startTile };
    isSelecting = true;
    dragSelectionManager.start(tileY, tileX);
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!isSelecting || !startTile) return;

    const rect = canvas.getBoundingClientRect();
    const tileX =
      Math.floor((event.clientX - rect.left) / TILE_SIZE) + viewOffset.x;
    const tileY =
      Math.floor((event.clientY - rect.top) / TILE_SIZE) + viewOffset.y;
    currentTile = { x: tileX, y: tileY };

    drawSelectionRect(startTile, currentTile);
  });

  window.addEventListener("mouseup", async (event) => {
    if (!isSelecting || !startTile || !currentTile) return;

    isSelecting = false;
    const isRightClick = event.button === 2;
    const z = currentLayerIndex;

    const minX = Math.min(startTile.x, currentTile.x);
    const minY = Math.min(startTile.y, currentTile.y);
    const maxX = Math.max(startTile.x, currentTile.x);
    const maxY = Math.max(startTile.y, currentTile.y);
    console.debug(`minX: ${minX}, minY: ${minY}, maxX: ${maxX}, maxY: ${maxY}`);

    const updates: { tile: Tile | null; x: number; y: number }[] = [];

    for (
      let y = minY;
      y <= maxY;
      y = y + Math.abs(selectedTileArea[0] - selectedTileArea[2]) + 1
    ) {
      for (
        let x = minX;
        x <= maxX;
        x = x + Math.abs(selectedTileArea[1] - selectedTileArea[3]) + 1
      ) {
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
            console.log("Selected Tile Area:", selectedTileArea);
            if (
              selectedTileArea[0] != selectedTileArea[2] ||
              selectedTileArea[1] != selectedTileArea[3]
            ) {
              // If a tile area is selected, loop through the area
              for (
                let selectedY = selectedTileArea[0];
                selectedY <= selectedTileArea[2];
                selectedY++
              ) {
                for (
                  let selectedX = selectedTileArea[1];
                  selectedX <= selectedTileArea[3];
                  selectedX++
                ) {
                  // Use the top left of the selected tiles and paint the selected tiles using a 1:1 map
                  console.log("paintinf BATDCJ at", x, y, z);
                  console.log("Selected:", selectedX, selectedY);
                  const newTile: Tile = {
                    tilesetId: selectedTile.tilesetId,
                    tileIndex: [selectedY, selectedX],
                  };
                  MapState.updateTile(x, y, z, newTile);
                  updates.push({
                    tile: newTile,
                    x: minX + selectedX,
                    y: minY + selectedY,
                  });
                }
              }
            }
            console.log("Selected:", [...selectedTile.tileIndex]);

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
    }
    setSelectedTileArea([0, 0, 0, 0]);

    MapState.saveCurrentMap(mapId);
    clearOverlay();
    isSelecting = false;
    startTile = null;
    currentTile = null;
  });

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
}
