import { TILE_SIZE, loadTileset } from "../objects/map/tileset";
import { selectedTile } from "../main"; // or wherever it’s declared

// Global State
let selectedTilesetId = 1;
let selectedTileIndex: [number, number] = [0, 0];

/**
 * Discover available tilesets (stubbed for now)
 */
async function discoverTilesets(): Promise<number[]> {
  // TODO: Replace with dynamic file listing if backend is introduced
  const tilesetIds = [1, 2, 3];
  console.log(`[TilesetLoader] Discovered tilesets: ${tilesetIds.join(", ")}`);
  return tilesetIds;
}

/**
 * Render the drawer with tileset controls
 */
export async function renderDrawer(): Promise<void> {
  const drawer = document.getElementById("drawer");
  if (!drawer) {
    console.warn("[TilesetLoader] Drawer element not found");
    return;
  }

  drawer.innerHTML = `
    <h2>Tileset</h2>
    <label for="tileset-select">Choose a tileset:</label>
    <select id="tileset-select"></select>
    <div id="tileset-grid" style="display: flex; flex-wrap: wrap; gap: 0px; margin-top: 10px;"></div>
  `;

  const select = document.getElementById("tileset-select") as HTMLSelectElement;
  const tilesetIds = await discoverTilesets();

  // Populate dropdown
  tilesetIds.forEach((id) => {
    const option = document.createElement("option");
    option.value = id.toString();
    option.textContent = `Tileset ${id}`;
    select.appendChild(option);
  });

  select.value = selectedTilesetId.toString();
  select.addEventListener("change", () => {
    selectedTilesetId = parseInt(select.value, 10);
    displayTileset(selectedTilesetId);
  });

  // Load initial tileset
  await displayTileset(selectedTilesetId);
}

/**
 * Load and display the tiles from the selected tileset
 */
async function displayTileset(tilesetId: number): Promise<void> {
  const grid = document.getElementById("tileset-grid");
  if (!grid) return;

  const tileset = await loadTileset(tilesetId);

  // const tilesPerRow = Math.floor(tileset.image.width / TILE_SIZE);
  // const tilesPerCol = Math.floor(img.height / TILE_SIZE);

  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${tileset.cols}, ${TILE_SIZE}px)`;
  grid.style.overflowY = "auto";
  grid.style.maxHeight = "600px";
  grid.style.justifyItems = "stretch";

  const totalTiles = tileset.rows * tileset.cols;
  console.log(`Total columns: ${tileset.cols}`);
  console.log(`Total rows: ${tileset.rows}`);
  console.log(`[TilesetLoader] Displaying ${totalTiles} tiles`);

  const canvasTiles: HTMLCanvasElement[][] = [];

  for (let i = 0; i < tileset.rows; i++) {
    canvasTiles.push([]);
    for (let j = 0; j < tileset.cols; j++) {
      const tileCanvas = document.createElement("canvas");
      console.debug(`[TilesetLoader] Creating canvas for tile ${i}, ${j}`);
      tileCanvas.width = TILE_SIZE;
      tileCanvas.height = TILE_SIZE;
      tileCanvas.style.border = "2px solid transparent";
      tileCanvas.style.cursor = "pointer";
      tileCanvas.style.margin = "0";
      tileCanvas.style.padding = "0";
      tileCanvas.style.border = "0px solid transparent";

      const ctx = tileCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(tileset.tileImage[i][j], 0, 0);
      }

      tileCanvas.addEventListener("click", () => {
        console.log(`[TilesetLoader] Tile (${i},${j}) selected`);
        selectedTileIndex = [i, j];
        selectedTile.tilesetId = tilesetId;
        selectedTile.tileIndex = [i, j];
        highlightTile(canvasTiles, selectedTileIndex);
      });

      canvasTiles[i].push(tileCanvas);
      grid.appendChild(tileCanvas);
    }
  }

  // highlightTile(canvasTiles, selectedTileIndex);
}

/**
 * Highlight the selected tile visually
 */
function highlightTile(
  tiles: HTMLCanvasElement[][],
  selectedIndex: [number, number]
): void {
  // To do: Make this more efficient by only updating the selected tile and removing previous highlights
  // tiles[selectedIndex[0]][selectedIndex[1]].style.border = "2px solid yellow";
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      tiles[y][x].style.border =
        y === selectedIndex[0] && x === selectedIndex[1]
          ? "2px solid yellow"
          : "0px solid transparent";
    }
  }
}

/**
 * Accessor used by other modules to retrieve the currently selected tile
 */
export function getSelectedTile(): {
  tilesetId: number;
  tileIndex: [number, number];
} {
  return {
    tilesetId: selectedTilesetId,
    tileIndex: selectedTileIndex,
  };
}
