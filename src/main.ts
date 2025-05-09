import { TileObject } from "objects/map/tile";
import { loadMap, MapData, saveMap, createDefaultMap } from "./data/mapLoader";
import { renderDrawer } from "./ui/drawer";
import { loadTileset, TILE_SIZE, TilesetObject } from "./objects/map/tileset";

// Canvas setup
const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const VIEWPORT_WIDTH = 50; // Set your desired viewport width in tiles
const VIEWPORT_HEIGHT = 50; // Set your desired viewport height in tiles
// Check if the canvas context is available

if (!ctx) {
  console.error("Canvas context is not available.");
}

// State variables
let map: (TileObject | null)[][][]; // 3D array of tiles
export let selectedTile = { tilesetId: 1, tileIndex: [0, 0] }; // Default selected tile (1st tile of tileset 1)
export let selectedZ = 0; // Default Z index

// // Load map on startup
async function initializeMap(mapId: string = "0") {
  let mapData: MapData;
  try {
    mapData = await loadMap(mapId); // Load map from localStorage or server
  } catch (error) {
    // log error and create default map
    console.error("Failed to load map:", error);
    console.log("Generating default map...");
    mapData = createDefaultMap(); // Generate default 30x30 map
    saveMap("0", mapData); // Save it to "localStorage"
  }

  // Draw the map on the canvas
  map = mapData.tiles; // Assign the tiles to the map variable
  console.log(
    `Map initialized with dimensions: ${mapData.width}x${mapData.height} and ${mapData.tiles.length} layers.`
  );
  drawMap(mapData);
}

// Draw the map
function drawMap(map: MapData) {
  if (!ctx) {
    console.error("Canvas context is not available.");
    return;
  }

  canvas.width = VIEWPORT_WIDTH * TILE_SIZE;
  canvas.height = VIEWPORT_HEIGHT * TILE_SIZE;
  console.log(`Canvas size set to ${canvas.width}x${canvas.height}`);
  console.log("Initializing canvas...");
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#2b2b2b"; // dark gray
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  console.log("Adding layered tiles...");
  // Iterate over the map and draw each tile
  for (let z = 0; z < map.tiles.length; z++) {
    console.log(`Layer ${z}:`);
    for (let y = 0; y < map.tiles[z].length; y++) {
      for (let x = 0; x < map.tiles[z][y].length; x++) {
        const tile = map.tiles[z][y][x];
        if (tile) {
          console.log(tile);
          // Render the tile (we assume you already have the tileset image loaded)
          drawTile(tile, x, y, z);
        } else {
          // Draw a placeholder for empty tiles (optional)
          ctx.fillStyle = "#000000"; // black
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          map.tiles[z][y][x] = {
            tileIndex: [0, 0],
            tilesetId: 1,
          };
        }
      }
    }
  }

  console.log("Map drawn successfully.");
}

// create tileset cache
const tilesetCache: { [key: number]: TilesetObject } = {};

// Draw individual tile at x, y, z coordinates
async function drawTile(tile: TileObject, x: number, y: number, z: number) {
  const tilesetId = tile.tilesetId;
  const tileIndex = tile.tileIndex;
  const tileset = await loadTileset(tilesetId);
  tilesetCache[tilesetId] = tileset; // Cache the tileset
  console.log(tileset);
  console.log(tile);
  const tileImage = tileset.tileImage[tileIndex[0]][tileIndex[1]];

  const screenX = x * TILE_SIZE;
  const screenY = y * TILE_SIZE;

  console.log(`Drawing tile at (${x}, ${y}, ${z}) to (${screenX}, ${screenY})`);
  if (!tileImage) {
    console.warn(`Missing tileImage for tile at (${x}, ${y}, ${z})`);
    return;
  }

  ctx?.drawImage(tileImage, screenX, screenY);
}

canvas.addEventListener("click", onCanvasClick);

function onCanvasClick(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();

  // Get mouse position relative to canvas
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Convert to tile coordinates
  const tileX = Math.floor(mouseX / TILE_SIZE);
  const tileY = Math.floor(mouseY / TILE_SIZE);
  const tileZ = selectedZ;

  console.log(`Clicked tile at (${tileX}, ${tileY}, ${tileZ})`);

  // Check bounds
  if (
    tileZ < 0 ||
    tileZ >= map.length ||
    tileY < 0 ||
    tileY >= map[0].length ||
    tileX < 0 ||
    tileX >= map[0][0].length
  ) {
    console.warn("Click out of bounds");
    return;
  }

  // Update the tile in the map
  map[tileZ][tileY][tileX] = {
    tilesetId: selectedTile.tilesetId,
    tileIndex: [selectedTile.tileIndex[0], selectedTile.tileIndex[1]], // copy [row, col]
  };

  console.log(map[tileZ][tileY][tileX]);

  // Redraw just that tile (or whole map if preferred)
  drawTile(map[tileZ][tileY][tileX]!, tileX, tileY, tileZ);
}

// // Handle tile placement (when user clicks on the canvas)
// canvas.addEventListener("click", (event) => {
//   const x = Math.floor(event.offsetX / TILE_SIZE);
//   const y = Math.floor(event.offsetY / TILE_SIZE);
//   if (map[selectedZ][y] && map[selectedZ][y][x]) {
//     map[selectedZ][y][x] = selectedTile; // Place the selected tile on the map
//     saveMap("0", { width: 30, height: 30, depth: 3, tiles: map }); // Save to localStorage
//     // drawMap(mapData); // Redraw the map after placement
//   }
// });

// Initialize the map
await renderDrawer();
initializeMap();
