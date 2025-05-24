import { MapData, MapState } from "@/state/mapState";
import { eventBus } from "@/state/eventBus";
import { Tile } from "@/objects/map/tile";
import { TILE_SIZE, VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/constants";
import { selectedTile, selectedTileArea } from "@/state/selectedTile";
import { viewOffset, viewport } from "@/state/viewportState";
import { initializePanControls } from "@/input/panControl";
import {
  createLayer,
  currentLayerIndex,
  MapLayer,
  showAllLayers,
  visibleLayersIndices,
} from "@/state/layers";
import { SHOW_ALL_LAYERS_EVENT } from "@/constants/events";
import { tilesetCache } from "@/state/cache";
import { LayerCanvases } from "@/state/layerCanvases";

// let canvas: HTMLCanvasElement;
// let ctx: CanvasRenderingContext2D;

export async function initializeMap(
  // canvasEl: HTMLCanvasElement,
  mapId: string
) {
  const mapData = await loadOrCreateMap(mapId);
  MapState.setMapData(mapData);
  console.log("Map data set successfully:", mapData);

  LayerCanvases.getLayerCanvases().forEach((layerCanvas, i) => {
    // draw layer on the canvas
    const layerCtx = layerCanvas.getContext("2d");
    if (!layerCtx) {
      console.error("Failed to get layer canvas context.");
      return;
    }
    console.log(
      `initializeMap: Rendering layer ${i} (${mapData.layers[i].name}) on canvas ${layerCanvas.id}`
    );
    renderLayer(layerCanvas, mapData.layers[i]);
  });

  // renderTiles(ctx, mapData);

  initializePanControls();
  // setupSubscriptions(canvas);
  // setupClickHandler(canvas, ctx, mapId, mapData);
}

async function loadOrCreateMap(mapId: string): Promise<MapData> {
  const mapJson = localStorage.getItem(`map_${mapId}`);
  if (mapJson) {
    const mapData: MapData = JSON.parse(mapJson);
    console.debug("Map loaded from local storage:", mapId);
    return mapData;
  } else {
    const defaultMap = createDefaultMap();
    console.warn("No map found, generating default map.");
    return defaultMap;
  }
}

function createDefaultMap(id: string = "0"): MapData {
  console.log("Generating default map...");
  const width = 30;
  const height = 30;
  const defaultLayerName = "Layer 1";
  const defaultLayers: MapLayer[] = [
    createLayer(defaultLayerName, width, height),
  ];
  return {
    id,
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

async function renderBackground(
  backgroundCanvas: HTMLCanvasElement,
  layerCanvases: HTMLCanvasElement[]
) {
  /*
   * Each canvas is a layer, we assume the layers are
   * in the same order as the cannvases and
   * that the canvases have the most recent rendering
   * We get the viewport offset and the viewport size
   * We clear the canvas and draw directly from the layer canvases to the background canvas
   */
  const ctx = backgroundCanvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get canvas context.");
    return;
  }
  ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
  const { x: ox, y: oy } = viewOffset.actual;
  const { width: vw, height: vh } = viewport;
  const drawOffsetX = -ox * TILE_SIZE;
  const drawOffsetY = -oy * TILE_SIZE;
  const drawPromises: Promise<void>[] = layerCanvases.map(async (canvas, i) => {
    const layerCTX = canvas.getContext("2d");
    if (!layerCTX) {
      console.error("Failed to get canvas context.");
      return Promise.resolve();
    }
    ctx.drawImage(
      canvas,
      drawOffsetX,
      drawOffsetY,
      vw * TILE_SIZE,
      vh * TILE_SIZE,
      0,
      0,
      vw * TILE_SIZE,
      vh * TILE_SIZE
    );
    return Promise.resolve();
  });
}

async function renderLayer(canvas: HTMLCanvasElement, layer: MapLayer) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get canvas context.");
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < layer.tiles.length; y++) {
    for (let x = 0; x < layer.tiles[y].length; x++) {
      const tile = layer.tiles[y][x];
      if (tile) {
        // await drawTile(ctx, tile, x * TILE_SIZE, y * TILE_SIZE);
      }
    }
  }
}
