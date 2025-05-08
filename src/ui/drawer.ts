// src/ui/drawer.ts

// Constants
const TILE_SIZE = 32;

// Global State
let selectedTilesetId = 1;
let selectedTileIndex = 0;

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

  console.log(`[TilesetLoader] Loading tileset: ${tilesetId}`);
  grid.innerHTML = "";

  const img = new Image();
  img.src = `/assets/tilesets/${tilesetId}.bmp`;

  await new Promise<void>((resolve) => {
    img.onload = () => {
      console.log(
        `[TilesetLoader] Tileset ${tilesetId} loaded: ${img.width}x${img.height}`
      );
      resolve();
    };
    img.onerror = (err) => {
      console.error(
        `[TilesetLoader] Failed to load tileset ${tilesetId}.bmp`,
        err
      );
      resolve();
    };
  });

  const tilesPerRow = Math.floor(img.width / TILE_SIZE);
  const tilesPerCol = Math.floor(img.height / TILE_SIZE);
  const totalTiles = tilesPerRow * tilesPerCol;

  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${tilesPerRow}, ${TILE_SIZE}px)`;
  grid.style.overflowY = "auto";
  grid.style.maxHeight = "600px";
  grid.style.justifyItems = "stretch";

  console.log(`[TilesetLoader] Displaying ${totalTiles} tiles`);

  const canvasTiles: HTMLCanvasElement[] = [];

  for (let i = 0; i < totalTiles; i++) {
    const tileCanvas = document.createElement("canvas");
    tileCanvas.width = TILE_SIZE;
    tileCanvas.height = TILE_SIZE;
    // tileCanvas.style.border = "2px solid transparent";
    tileCanvas.style.cursor = "pointer";
    tileCanvas.style.margin = "0";
    tileCanvas.style.padding = "0";

    const ctx = tileCanvas.getContext("2d");
    if (ctx) {
      const sx = (i % tilesPerRow) * TILE_SIZE;
      const sy = Math.floor(i / tilesPerRow) * TILE_SIZE;
      ctx.drawImage(
        img,
        sx,
        sy,
        TILE_SIZE,
        TILE_SIZE,
        0,
        0,
        TILE_SIZE,
        TILE_SIZE
      );
    }

    tileCanvas.addEventListener("click", () => {
      console.log(`[TilesetLoader] Tile ${i} selected`);
      selectedTileIndex = i;
      highlightTile(canvasTiles, i);
    });

    canvasTiles.push(tileCanvas);
    grid.appendChild(tileCanvas);
  }

  highlightTile(canvasTiles, selectedTileIndex);
}

/**
 * Highlight the selected tile visually
 */
function highlightTile(
  tiles: HTMLCanvasElement[],
  selectedIndex: number
): void {
  tiles.forEach((tile, index) => {
    tile.style.border =
      index === selectedIndex ? "2px solid yellow" : "0px solid transparent";
  });
}

/**
 * Accessor used by other modules to retrieve the currently selected tile
 */
export function getSelectedTile(): { tilesetId: number; tileIndex: number } {
  return {
    tilesetId: selectedTilesetId,
    tileIndex: selectedTileIndex,
  };
}
