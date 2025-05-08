import { loadMap, saveMap } from "./data/mapLoader";
import { createEmptyMap3D } from "./core/Map3D";

// Canvas setup
const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
  console.error("Canvas context is not available.");
}

// Tile size constants
const TILE_SIZE = 32;

// State variables
let map: any[][][]; // 3D array of tiles
let selectedTile = { tilesetId: 1, tileIndex: 0 }; // Default selected tile (1st tile of tileset 1)
let selectedZ = 0; // Default Z index

// Load map on startup
async function initializeMap() {
  const mapData = await loadMap("0"); // Loading map 0

  // If map doesn't exist, generate a default one and save it
  if (!mapData.tiles) {
    const defaultMap = createDefaultMap(); // Generate default 30x30 map
    saveMap("0", defaultMap); // Save it to "localStorage"
    map = defaultMap.tiles;
  } else {
    map = mapData.tiles;
  }

  // Draw the map on the canvas
  drawMap();
}

// Generate a default 30x30x3 map
function createDefaultMap() {
  const defaultMap = createEmptyMap3D(30, 30, 3, "grass"); // Default texture is 'grass'
  return {
    width: 30,
    height: 30,
    depth: 3,
    tiles: defaultMap,
  };
}

// Draw the map
function drawMap() {
  if (!ctx) {
    console.error("Canvas context is not available.");
    return;
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Iterate over the map and draw each tile
  for (let z = 0; z < map.length; z++) {
    for (let y = 0; y < map[z].length; y++) {
      for (let x = 0; x < map[z][y].length; x++) {
        const tile = map[z][y][x];
        if (tile) {
          // Render the tile (we assume you already have the tileset image loaded)
          drawTile(tile, x, y, z);
        }
      }
    }
  }

  console.log("Map drawn successfully.");
}

// Draw individual tile at x, y, z coordinates
function drawTile(tile: any, x: number, y: number, z: number) {
  const img = new Image();
  img.src = `/assets/tilesets/${tile.tilesetId}.bmp`; // Assuming BMP tileset
  img.onload = () => {
    const tx = (tile.tileIndex % 10) * TILE_SIZE; // Assuming 10 tiles per row in tileset
    const ty = Math.floor(tile.tileIndex / 10) * TILE_SIZE; // Calculate y position in tileset
    ctx?.drawImage(
      img,
      tx,
      ty,
      TILE_SIZE,
      TILE_SIZE,
      x * TILE_SIZE,
      y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  };
}

// Handle tile placement (when user clicks on the canvas)
canvas.addEventListener("click", (event) => {
  const x = Math.floor(event.offsetX / TILE_SIZE);
  const y = Math.floor(event.offsetY / TILE_SIZE);
  if (map[selectedZ][y] && map[selectedZ][y][x]) {
    map[selectedZ][y][x] = selectedTile; // Place the selected tile on the map
    saveMap("0", { width: 30, height: 30, depth: 3, tiles: map }); // Save to localStorage
    drawMap(); // Redraw the map after placement
  }
});

// Initialize the map
initializeMap();
