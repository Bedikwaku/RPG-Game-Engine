import { mapState } from "@/state/mapState";
import { eventBus } from "@/state/eventBus";
import { Tile } from "@/objects/map/tile";
import { TILE_SIZE } from "@/constants";
import { loadTileset, TilesetObject } from "@/objects/map/tileset";
import { selectedTile, selectedTileArea } from "@/state/selectedTile";

export interface MapData {
  width: number;
  height: number;
  layers: string[];
  tiles: (Tile | null)[][][]; // [z][y][x]
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let currentLayerIndex = 0;
let showAllLayers = false;

// Temporary interaction state
let startTile: { x: number; y: number } | null = null;
let currentTile: { x: number; y: number } | null = null;
let isSelecting = false;

export async function initializeMap(
  canvasEl: HTMLCanvasElement,
  mapId: string
  // layerIndex: number,
  // showAll: boolean,
) {
  canvas = canvasEl;
  ctx = canvas.getContext("2d")!;
  // currentLayerIndex = layerIndex;
  showAllLayers = true; // showAll;

  const mapData = await loadOrCreateMap(mapId);
  mapState.setMapData(mapData);
  console.log("Map data set successfully:", mapData);
  setupCanvas(canvas, ctx, mapData.width, mapData.height);
  canvas.width = mapData.width * TILE_SIZE;
  canvas.height = mapData.height * TILE_SIZE;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderTiles(mapData);

  setupSubscriptions();
  setupClickHandler(canvas, ctx, mapId, mapData);
}

async function loadOrCreateMap(mapId: string): Promise<MapData> {
  const mapJson = localStorage.getItem(`map_${mapId}`);
  if (mapJson) {
    const mapData: MapData = JSON.parse(mapJson);
    console.log("Map loaded from local storage:", mapId);
    return mapData;
  } else {
    const defaultMap = createDefaultMap();
    console.log("No map found, generating default map.");
    return defaultMap;
  }
}

function setupCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  canvas.width = width * TILE_SIZE;
  canvas.height = height * TILE_SIZE;
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
  const defaultLayers = Array.from(
    { length: depth },
    (_, i) => `Layer ${i + 1}`
  );
  defaultTiles[0][0][0] = {
    tilesetId: 1,
    tileIndex: [0, 0],
  }; // Set the first tile as a placeholder
  return {
    width: width,
    height: height,
    layers: defaultLayers,
    tiles: defaultTiles,
  };
}

function setupSubscriptions() {
  eventBus.subscribe("layerChanged", (newLayer: number) => {
    currentLayerIndex = newLayer;
    renderTiles(mapState.getMapData());
  });

  eventBus.subscribe("showAllLayersToggled", (value: boolean) => {
    showAllLayers = value;
    renderTiles(mapState.getMapData());
  });

  eventBus.subscribe("tileUpdated", () => {
    renderTiles(mapState.getMapData());
  });

  eventBus.subscribe("mapUpdated", (mapData: MapData) => {
    renderTiles(mapData);
  });
}

async function batchDrawTiles(
  ctx: CanvasRenderingContext2D,
  updates: { tile: Tile | null; x: number; y: number }[]
): Promise<void> {
  const tilesetCache = new Map<
    number,
    Awaited<ReturnType<typeof loadTileset>>
  >();

  for (const { tile, x, y } of updates) {
    if (!tile) {
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
    if (!tileImage) continue;
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

    const isRightClick = event.button === 2;
    const z = currentLayerIndex;

    const minX = Math.min(startTile.x, currentTile.x);
    const minY = Math.min(startTile.y, currentTile.y);
    const maxX = Math.max(startTile.x, currentTile.x);
    const maxY = Math.max(startTile.y, currentTile.y);

    if (!isRightClick && !selectedTileArea.every((v) => v === 0)) {
      await applyTileStamp(ctx, mapData, z, minX, minY);
    } else {
      const updates: { tile: Tile | null; x: number; y: number }[] = [];

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          console.log("MAPDATA", mapData);
          if (
            x >= 0 &&
            x < mapData.width &&
            y >= 0 &&
            y < mapData.height &&
            z >= 0 &&
            z < mapData.layers.length
          ) {
            if (isRightClick) {
              mapData.tiles[z][y][x] = null;
              updates.push({ tile: null, x, y });
            } else {
              const newTile: Tile = {
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

    mapState.saveCurrentMap(mapId);
    clearOverlay();
    isSelecting = false;
    startTile = null;
    currentTile = null;
  });

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
}

async function applyTileStamp(
  ctx: CanvasRenderingContext2D,
  mapData: MapData,
  z: number,
  startX: number,
  startY: number
) {
  const [rowStart, colStart, rowEnd, colEnd] = selectedTileArea;

  if (!selectedTileArea.every((v) => v === 0)) {
    const tileset = await loadTileset(selectedTile.tilesetId);

    for (let dy = 0; dy <= rowEnd - rowStart; dy++) {
      for (let dx = 0; dx <= colEnd - colStart; dx++) {
        const targetX = startX + dx;
        const targetY = startY + dy;

        if (
          targetX >= 0 &&
          targetX < mapData.width &&
          targetY >= 0 &&
          targetY < mapData.height &&
          z >= 0 &&
          z < mapData.layers.length
        ) {
          const tileIndex: [number, number] = [rowStart + dy, colStart + dx];
          const tile: Tile = {
            tilesetId: selectedTile.tilesetId,
            tileIndex,
          };

          mapData.tiles[z][targetY][targetX] = tile;
          await drawTile(ctx, tile, targetX, targetY);
        }
      }
    }
  } else {
    mapData.tiles[z][startY][startX] = selectedTile;
    await drawTile(ctx, selectedTile, startX, startY);
  }
}

async function renderTiles(mapData: MapData) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const layersToRender = showAllLayers
    ? mapData.tiles
    : [mapData.tiles[currentLayerIndex]];

  for (let z = 0; z < layersToRender.length; z++) {
    const layer = layersToRender[z];
    for (let y = 0; y < mapData.height; y++) {
      for (let x = 0; x < mapData.width; x++) {
        const tile = layer[y][x];
        if (tile) {
          // Draw tile (this will need to be adjusted to render the tile's content)
          await drawTile(ctx, tile, x, y); // Assuming `drawTile` is a function that draws the tile
        } else {
          // Draw empty tile (optional, can be omitted if not needed)
          ctx.fillStyle = "#2b2b2b"; // Background color
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }
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
  tile: Tile,
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
