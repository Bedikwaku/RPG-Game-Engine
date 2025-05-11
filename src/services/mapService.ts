import { TileObject } from "../objects/map/tile";
import { loadTileset, TILE_SIZE, TilesetObject } from "../objects/map/tileset";
import {
  selectedTile,
  selectedTileArea,
  selectedZ,
} from "../state/selectedTile";

// Type to represent map data
export type MapData = {
  width: number;
  height: number;
  depth: number;
  tiles: (TileObject | null)[][][]; // 3D array of TileProps
};

type InitMapParams = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mapId: string;
  viewportWidth: number;
  viewportHeight: number;
};

// Load map on startup
async function initializeMap({
  canvas,
  ctx,
  mapId,
  viewportWidth,
  viewportHeight,
  mapId: string = "0",
}: InitMapParams) {
  let mapData: MapData;
  try {
    mapData = await loadMap(mapId);
  } catch (error) {
    console.error("Failed to load map:", error);
    mapData = createDefaultMap(); // Generate default 30x30 map
    saveMap(mapId, mapData); // Save it to "localStorage"
  }
  console.log("Map loaded successfully:", mapData);
  setupCanvas(canvas, ctx, viewportWidth, viewportHeight);
  console.log("Canvas setup successfully:", canvas.width, canvas.height);
  await drawMap(canvas, ctx, mapData); // Draw the map on the canvas
  console.log("Map drawn successfully:", mapData);
  setupClickHandler(canvas, ctx, mapId, mapData);
}

// Load the map from a file or local storage
export async function loadMap(mapId: string): Promise<MapData> {
  // Attempt to load the map from local storage first (as mock server)
  const mapJson = localStorage.getItem(`map_${mapId}`);
  if (mapJson) {
    return JSON.parse(mapJson);
  }

  // Attempt to fetch map file from public assets (mock server)
  const response = await fetch(`/assets/maps/${mapId}.json`);
  if (response.ok) {
    return await response.json();
  }

  // If map not found, throw error
  throw Error("Map not found");
}

function setupCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  canvas.width = width * TILE_SIZE;
  canvas.height = height * TILE_SIZE;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

async function drawMap(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  mapData: MapData
): Promise<void> {
  const { tiles } = mapData;

  for (let z = 0; z < tiles.length; z++) {
    console.log(`Layer ${z}:`);
    for (let y = 0; y < tiles[z].length; y++) {
      for (let x = 0; x < tiles[z][y].length; x++) {
        const tile = tiles[z][y][x];
        if (tile) {
          // console.log(tile);
          await drawTile(ctx, tiles[z][y][x]!, x, y);
        } else {
          // Draw a placeholder for empty tiles (optional)
          ctx.fillStyle = "#000000"; // black
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          mapData.tiles[z][y][x] = {
            tileIndex: [0, 0],
            tilesetId: 1,
          };
        }
      }
    }
  }
  console.log("Map drawn successfully.");
}

const tilesetCache: Record<string, TilesetObject> = {};

async function loadAndCacheTileset(tilesetId: number): Promise<TilesetObject> {
  if (tilesetCache[tilesetId]) {
    console.log("Cache hit");
    return tilesetCache[tilesetId];
  }
  console.log("Cache miss");

  const tileset = await loadTileset(tilesetId); // expensive operation
  tilesetCache[tilesetId] = tileset;
  return tileset;
}

async function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileObject,
  x: number,
  y: number
): Promise<void> {
  const tileset = await loadAndCacheTileset(tile.tilesetId);
  // const tileset = await loadTileset(tile.tilesetId);
  const tileImage = tileset.tileImage[tile.tileIndex[0]][tile.tileIndex[1]];

  const screenX = x * TILE_SIZE;
  const screenY = y * TILE_SIZE;

  if (!tileImage) {
    console.warn(`Missing tile image for tile at (${x}, ${y})`);
    return;
  }

  ctx.drawImage(tileImage, screenX, screenY);
}

async function batchDrawTiles(
  ctx: CanvasRenderingContext2D,
  updates: { tile: TileObject | null; x: number; y: number }[]
): Promise<void> {
  const tilesetCache = new Map<number, TilesetObject>();

  for (const { tile, x, y } of updates) {
    if (!tile) {
      // Erase
      ctx.fillStyle = "#000000";
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      continue;
    }

    let tileset = tilesetCache.get(tile.tilesetId);
    if (!tileset) {
      tileset = await loadTileset(tile.tilesetId);
      tilesetCache.set(tile.tilesetId, tileset);
    }

    const tileImage = tileset.tileImage[tile.tileIndex[0]][tile.tileIndex[1]];
    if (!tileImage) {
      console.warn(`Missing tile image at index`, tile.tileIndex);
      continue;
    }

    ctx.drawImage(tileImage, x * TILE_SIZE, y * TILE_SIZE);
  }
}

function setupClickHandler(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
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
    if (!overlayCtx) return;
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
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

    overlayCtx.strokeStyle = "rgba(255, 255, 0, 0.8)";
    overlayCtx.lineWidth = 2;
    overlayCtx.strokeRect(
      minX * TILE_SIZE,
      minY * TILE_SIZE,
      (maxX - minX + 1) * TILE_SIZE,
      (maxY - minY + 1) * TILE_SIZE
    );
  }

  canvas.addEventListener("mousedown", (event: MouseEvent) => {
    if (event.button !== 0 && event.button !== 2) return;

    const rect = canvas.getBoundingClientRect();
    const tileX = Math.floor(event.clientX - rect.left);
    const tileY = Math.floor(event.clientY - rect.top);
    startTile = {
      x: Math.floor(tileX / TILE_SIZE),
      y: Math.floor(tileY / TILE_SIZE),
    };
    currentTile = { ...startTile };
    isSelecting = true;
  });

  canvas.addEventListener("mousemove", (event: MouseEvent) => {
    if (!isSelecting || !startTile) return;

    const rect = canvas.getBoundingClientRect();
    const tileX = Math.floor(event.clientX - rect.left);
    const tileY = Math.floor(event.clientY - rect.top);
    currentTile = {
      x: Math.floor(tileX / TILE_SIZE),
      y: Math.floor(tileY / TILE_SIZE),
    };

    drawSelectionRect(startTile, currentTile);
  });

  window.addEventListener("mouseup", async (event: MouseEvent) => {
    if (!isSelecting || !startTile || !currentTile) return;

    const isRightClick = event.button === 2;
    const z = selectedZ;

    const minX = Math.min(startTile.x, currentTile.x);
    const minY = Math.min(startTile.y, currentTile.y);

    if (!isRightClick && !selectedTileArea.every((value) => value === 0)) {
      // 🧩 Apply tile stamp
      await applyTileStamp(ctx, mapData, z, minX, minY);
    } else {
      // 🧱 Single-tile paint or erase
      const maxX = Math.max(startTile.x, currentTile.x);
      const maxY = Math.max(startTile.y, currentTile.y);

      const updates: { tile: TileObject | null; x: number; y: number }[] = [];

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (
            x >= 0 &&
            x < mapData.width &&
            y >= 0 &&
            y < mapData.height &&
            z >= 0 &&
            z < mapData.depth
          ) {
            if (isRightClick) {
              mapData.tiles[z][y][x] = null;
              updates.push({ tile: null, x, y });
            } else {
              const newTile: TileObject = {
                tilesetId: selectedTile.tilesetId,
                tileIndex: [...selectedTile.tileIndex],
              };
              mapData.tiles[z][y][x] = newTile;
              updates.push({ tile: newTile, x, y });
            }
          }
        }
      }

      await batchDrawTiles(ctx, updates);
    }

    saveMap(mapId, mapData); // Save it to "localStorage"

    clearOverlay();
    isSelecting = false;
    startTile = null;
    currentTile = null;
  });

  canvas.addEventListener("contextmenu", (event: MouseEvent) => {
    event.preventDefault();
  });
}

async function applyTileStamp(
  ctx: CanvasRenderingContext2D,
  mapData: MapData,
  z: number,
  startX: number,
  startY: number
) {
  if (!selectedTileArea.every((value) => value === 0)) {
    console.log("Applying tile stamp:", selectedTileArea);
    const [rowStart, colStart, rowEnd, colEnd] = selectedTileArea;
    const tileset = await loadTileset(selectedTile.tilesetId);

    for (let dy = 0; dy <= rowEnd - rowStart; dy++) {
      for (let dx = 0; dx <= colEnd - colStart; dx++) {
        const targetX = startX + dx;
        const targetY = startY + dy;

        if (
          targetX >= 0 &&
          targetX < mapData.width &&
          targetY >= 0 &&
          targetY < mapData.height
        ) {
          const tileIndex: [number, number] = [rowStart + dy, colStart + dx];
          const tile = {
            tilesetId: selectedTile.tilesetId,
            tileIndex,
          };

          mapData.tiles[z][targetY][targetX] = tile;
        }
      }
    }

    // Redraw affected area in one pass
    for (let dy = 0; dy <= rowEnd - rowStart; dy++) {
      for (let dx = 0; dx <= colEnd - colStart; dx++) {
        const targetX = startX + dx;
        const targetY = startY + dy;
        const tile = mapData.tiles[0][targetY][targetX];
        if (tile) {
          await drawTile(ctx, tile, targetX, targetY);
        }
      }
    }
  } else {
    // Fallback to single tile
    mapData.tiles[0][startY][startX] = selectedTile;
    await drawTile(ctx, selectedTile, startX, startY);
  }
}

// Generate a default 30x30x3 map
function createDefaultMap(): MapData {
  console.log("Generating default map...");
  const width = 30;
  const height = 30;
  const depth = 1;
  const defaultTiles = Array.from({ length: depth }, () =>
    Array.from({ length: height }, () => Array(width).fill(null))
  );
  defaultTiles[0][0][0] = {
    tilesetId: 1,
    tileIndex: [0, 0],
  }; // Set the first tile as a placeholder
  return {
    width: width,
    height: height,
    depth: depth,
    tiles: defaultTiles,
  };
}

// Save the map to localStorage (mock server)
function saveMap(mapId: string, mapData: MapData): void {
  try {
    const mapJson = JSON.stringify(mapData);
    localStorage.setItem(`map_${mapId}`, mapJson);
    console.log("Map saved successfully:", mapId);
  } catch (error) {
    console.error("Failed to save map:", error);
  }
}

export { initializeMap };
