import { MapState } from "@/state/mapState";
import { eventBus } from "@/state/eventBus";
import { Tile } from "@/objects/map/tile";
import { TILE_SIZE, VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/constants";
import { tilesetCache } from "@/objects/map/tileset";
import { selectedTile, selectedTileArea } from "@/state/selectedTile";
import {
  subscribeToViewOffset,
  viewOffset,
  viewport,
} from "@/state/viewportState";
import { initializePanControls } from "@/input/panControl";
import {
  createLayer,
  currentLayerIndex,
  MapLayer,
  showAllLayers,
  visibleLayersIndices,
} from "@/state/layers";
import { SHOW_ALL_LAYERS_EVENT } from "@/constants/events";

export interface MapData {
  width: number;
  height: number;
  layers: MapLayer[];
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

export async function initializeMap(
  canvasEl: HTMLCanvasElement,
  mapId: string
) {
  canvas = canvasEl;
  ctx = canvas.getContext("2d")!;
  const mapData = await loadOrCreateMap(mapId);
  MapState.setMapData(mapData);
  console.log("Map data set successfully:", mapData);

  setupCanvas(canvas, ctx, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderTiles(ctx, mapData);

  initializePanControls();
  subscribeToViewOffset(() => {
    renderTiles(ctx, MapState.getMapData());
  });
  setupSubscriptions(ctx);
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

function createDefaultMap(): MapData {
  console.log("Generating default map...");
  const width = 30;
  const height = 30;
  const depth = 1;
  const defaultLayerName = "Layer 1";
  const defaultLayers: MapLayer[] = [
    createLayer(defaultLayerName, width, height),
  ];
  return {
    width,
    height,
    layers: defaultLayers,
  };
}

export function addLayerToMap(mapData: MapData, name: string): void {
  const { width, height } = mapData;

  const newTileLayer: (Tile | null)[][] = Array.from({ length: height }, () =>
    Array(width).fill(null)
  );

  const newLayer = createLayer(name, width, height);
  mapData.layers.push(newLayer);
}

// Removes the layer at the given index (if valid)
export function removeLayerFromMap(mapData: MapData, layerIndex: number): void {
  if (
    layerIndex < 0 ||
    layerIndex >= mapData.layers.length ||
    mapData.layers.length <= 1
  ) {
    console.warn("Invalid or last remaining layer. Cannot remove.");
    return;
  }

  // Remove from both data structures
  mapData.layers.splice(layerIndex, 1);
  mapData.layers.splice(layerIndex, 1);
}

function setupSubscriptions(ctx: CanvasRenderingContext2D) {
  eventBus.subscribe("layerChanged", (newLayer: number) => {
    // setCurrentLayer(newLayer);
  });

  eventBus.subscribe("visibleLayersChanged", (newVisibleLayers: number[]) => {
    clearCanvas(ctx);
    renderTiles(ctx, MapState.getMapData());
  });

  eventBus.subscribe(SHOW_ALL_LAYERS_EVENT, (value: boolean) => {
    renderTiles(ctx, MapState.getMapData());
  });

  eventBus.subscribe("tileUpdated", () => {
    renderTiles(ctx, MapState.getMapData());
  });

  eventBus.subscribe("mapUpdated", (mapData: MapData) => {
    renderTiles(ctx, mapData);
  });
}

async function batchDrawTiles(
  ctx: CanvasRenderingContext2D,
  updates: { tile: Tile | null; x: number; y: number }[]
): Promise<void> {
  for (const { tile, x, y } of updates) {
    const trueTileX = x - viewOffset.x;
    const trueTileY = y - viewOffset.y;
    if (!tile) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(
        trueTileX * TILE_SIZE,
        trueTileY * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
      continue;
    }
    const tileset = tilesetCache[tile.tilesetId];
    const tileImage = tileset.tileImage[tile.tileIndex[0]][tile.tileIndex[1]];
    if (!tileImage) continue;
    ctx.drawImage(
      tileImage,
      (x - viewOffset.x) * TILE_SIZE,
      (y - viewOffset.y) * TILE_SIZE
    );
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

    console.log(
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
    console.log(`minX: ${minX}, minY: ${minY}, maxX: ${maxX}, maxY: ${maxY}`);

    if (!isRightClick && !selectedTileArea.every((v) => v === 0)) {
      await applyTileStamp(ctx, mapData, z, minX, minY);
    } else {
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
              mapData.layers[z].tiles[y][x] = null;
              updates.push({ tile: null, x, y });
            } else {
              const newTile: Tile = {
                tilesetId: selectedTile.tilesetId,
                tileIndex: [...selectedTile.tileIndex],
              };
              mapData.layers[z].tiles[y][x] = newTile;
              updates.push({ tile: newTile, x, y });
              console.log(
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

      await batchDrawTiles(ctx, updates);
    }

    MapState.saveCurrentMap(mapId);
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

          mapData.layers[z].tiles[targetY][targetX] = tile;
          await drawTile(
            ctx,
            tile,
            (targetX + viewOffset.x) * TILE_SIZE,
            (targetY + viewOffset.y) * TILE_SIZE
          );
        }
      }
    }
  } else {
    mapData.layers[z].tiles[startY][startX] = selectedTile;
    await drawTile(ctx, selectedTile, startX, startY);
  }
}

async function renderTiles(ctx: CanvasRenderingContext2D, mapData: MapData) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const layersToRender = showAllLayers
    ? mapData.layers
    : visibleLayersIndices.map((index) => mapData.layers[index]);

  console.log(
    `Rendering tiles for layers: ${layersToRender.map((layer) => layer.name)}`
  );
  const { width: vw, height: vh } = viewport;
  const { x: ox, y: oy } = viewOffset.actual;

  const startX = Math.floor(ox);
  const startY = Math.floor(oy);
  const offsetX = ox - startX;
  const offsetY = oy - startY;
  const drawOffsetX = -offsetX * TILE_SIZE;
  const drawOffsetY = -offsetY * TILE_SIZE;

  const tilesToRenderX = vw + 1;
  const tilesToRenderY = vh + 1;
  const drawPromises: Promise<void>[] = [];
  for (let z = 0; z < mapData.layers.length; z++) {
    if (!showAllLayers && !visibleLayersIndices.includes(z)) {
      console.warn(`Layer ${z} is not visible and will not be rendered.`);
      continue;
    } else {
      console.log(`Rendering layer ${z} (${mapData.layers[z].name})`);
    }
    const layer = mapData.layers[z];
    for (let y = 0; y < tilesToRenderY; y++) {
      for (let x = 0; x < tilesToRenderX; x++) {
        const mapX = startX + x;
        const mapY = startY + y;
        if (mapY >= mapData.height || mapX >= mapData.width) continue;
        const tile = layer.tiles[mapY]?.[mapX];
        const screenX = x * TILE_SIZE + drawOffsetX;
        const screenY = y * TILE_SIZE + drawOffsetY;
        if (tile) {
          drawPromises.push(drawTile(ctx, tile, screenX, screenY));
        } else {
          if (z === 0) {
            ctx.fillStyle = "#2b2b2b";
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }
  }
  await Promise.all(drawPromises);
}

async function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  screenX: number,
  screenY: number
): Promise<void> {
  const tileset = tilesetCache[tile.tilesetId];
  const tileImage = tileset.tileImage[tile.tileIndex[0]][tile.tileIndex[1]];
  if (!tileImage) return;
  ctx.drawImage(
    tileImage,
    0,
    0,
    TILE_SIZE,
    TILE_SIZE,
    screenX,
    screenY,
    TILE_SIZE,
    TILE_SIZE
  );
}

async function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export async function drawAllLayers(layerCanvases: HTMLCanvasElement[]) {
  const mapState = MapState.getMapData();
  if (!mapState) {
    console.error("Map state is not initialized.");
    return;
  }

  const mapLayers = mapState.layers;

  for (let layerIndex = 0; layerIndex < layerCanvases.length; layerIndex++) {
    const canvas = layerCanvases[layerIndex];
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    const layer = mapLayers[layerIndex];

    for (let y = 0; y < layer.tiles.length; y++) {
      for (let x = 0; x < layer.tiles[y].length; x++) {
        const tile = layer.tiles[y][x];
        if (tile) {
          const screenX = x * TILE_SIZE;
          const screenY = y * TILE_SIZE;
          await drawTile(ctx, tile, screenX, screenY);
        } else {
          // Optional: fill empty tiles with a fallback color
          ctx.fillStyle = "#2b2b2b";
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }
}

// function renderMapLayer(ctx: CanvasRenderingContext2D, layer_index: Number,  )
