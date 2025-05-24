import { TILE_SIZE, VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/constants";
import { Tile } from "@/objects/map/tile";
import { tilesetCache } from "@/state/cache";
import { eventBus } from "@/state/eventBus";
import { LayerCanvases } from "@/state/layerCanvases";
import { showAllLayers, visibleLayersIndices } from "@/state/layers";
import { MapData, MapState, MapStateEvents } from "@/state/mapState";
import { viewOffset, viewport, ViewportEvents } from "@/state/viewportState";

let rerenderMap = true;

export async function initializeRendererService(
  viewportCanvas: HTMLCanvasElement
) {
  const ctx = viewportCanvas.getContext("2d")!;
  if (!ctx) {
    throw new Error("Canvas context is not available.");
  }
  // Set up the canvas size and styles
  setupCanvas(viewportCanvas, ctx, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  ctx.clearRect(0, 0, viewportCanvas.width, viewportCanvas.height);
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(0, 0, viewportCanvas.width, viewportCanvas.height);
  // renderTiles(viewportCanvas, MapState.getMapData());
  eventBus.subscribe(MapStateEvents.MAP_UPDATED, (mapData: MapData) => {
    rerenderMap = true;
  });
  eventBus.subscribe(ViewportEvents.VIEWPORT_MOVED, () => {
    rerenderMap = true;
  });
  function renderLooop() {
    if (rerenderMap) {
      console.log("Rerendering map...");
      renderTiles(viewportCanvas, MapState.getMapData());
      rerenderMap = false;
    }
    requestAnimationFrame(renderLooop);
  }
  requestAnimationFrame(renderLooop);
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

async function renderTiles(canvas: HTMLCanvasElement, mapData: MapData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get canvas context.");
    return;
  }
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

export async function batchDrawTiles(
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

async function drawAllLayers() {
  const layerCanvases = LayerCanvases.getLayerCanvases();
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
