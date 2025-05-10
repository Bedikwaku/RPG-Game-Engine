import { TileObject } from "../objects/map/tile";
import { loadTileset, TILE_SIZE } from "../objects/map/tileset";
import { selectedTile } from "../state/selectedTile";

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
  setupClickHandler(canvas, ctx, mapData);
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
          console.log(tile);
          drawTile(ctx, tiles[z][y][x]!, x, y);
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
async function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileObject,
  x: number,
  y: number
): Promise<void> {
  // const tileset = await loadAndCacheTileset(tile.tilesetId);
  const tileset = await loadTileset(tile.tilesetId);
  const tileImage = tileset.tileImage[tile.tileIndex[0]][tile.tileIndex[1]];

  const screenX = x * TILE_SIZE;
  const screenY = y * TILE_SIZE;

  if (!tileImage) {
    console.warn(`Missing tile image for tile at (${x}, ${y})`);
    return;
  }

  ctx.drawImage(tileImage, screenX, screenY);
}

function setupClickHandler(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  mapData: MapData
): void {
  canvas.addEventListener("click", (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();

    // Get mouse position relative to canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Convert to tile coordinates
    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);
    const tileZ = 0;

    console.log(`Clicked tile at (${tileX}, ${tileY}, ${tileZ})`);

    if (
      tileZ < 0 ||
      tileZ >= mapData.depth ||
      tileY < 0 ||
      tileY >= mapData.height ||
      tileX < 0 ||
      tileX >= mapData.width
    ) {
      console.warn("Click out of bounds");
      return;
    }

    mapData.tiles[tileZ][tileY][tileX] = selectedTile;
    drawTile(ctx, selectedTile, tileX, tileY);
  });
}

export function generateTiles(
  width: number,
  height: number,
  depth: number
): TileObject[][][] {
  // generate null 3d array
  const tiles: TileObject[][][] = Array.from({ length: depth }, () =>
    Array.from({ length: height }, () => Array(width).fill(null))
  );
  tiles[0][0][0] = {
    tilesetId: 1,
    tileIndex: [0, 0],
  }; // Set the first tile as a placeholder
  return tiles;
}

// Generate a default 30x30x3 map
export function createDefaultMap(): MapData {
  console.log("Generating default map...");
  const defaultTiles = generateTiles(30, 30, 3);
  return {
    width: 30,
    height: 30,
    depth: 3,
    tiles: defaultTiles,
  };
}

// Save the map to localStorage (mock server)
export function saveMap(mapId: string, mapData: MapData): void {
  try {
    const mapJson = JSON.stringify(mapData);
    localStorage.setItem(`map_${mapId}`, mapJson);
  } catch (error) {
    console.error("Failed to save map:", error);
  }
}

export { initializeMap };
