import {
  resetSelectedTileArea,
  selectedTile,
  selectedTileArea,
  setSelectedTileArea,
} from "../state/selectedTile";
import { TILE_SIZE, loadTileset } from "../objects/map/tileset";

// Global State
let selectedTilesetId = 1;
let selectedTileIndex: [number, number] = [0, 0];
// let selectedTileArea: [number, number, number, number] | null = null;

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
  console.log(`Displaying tileset ${tilesetId}`);
  const grid = document.getElementById("tileset-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const tileset = await loadTileset(tilesetId);

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
  let isDragging = false;
  let dragStart: [number, number] | null = null;

  for (let i = 0; i < tileset.rows; i++) {
    canvasTiles.push([]);
    for (let j = 0; j < tileset.cols; j++) {
      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = TILE_SIZE;
      tileCanvas.height = TILE_SIZE;
      tileCanvas.style.border = "2px solid transparent";
      tileCanvas.style.cursor = "pointer";
      tileCanvas.style.margin = "0";
      tileCanvas.style.padding = "0";

      const ctx = tileCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(tileset.tileImage[i][j], 0, 0);
      }

      tileCanvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        dragStart = [i, j];
        resetSelectedTileArea();
      });

      tileCanvas.addEventListener("mouseenter", () => {
        if (isDragging && dragStart) {
          const [startRow, startCol] = dragStart;
          const endRow = i;
          const endCol = j;
          setSelectedTileArea([
            Math.min(startRow, endRow),
            Math.min(startCol, endCol),
            Math.max(startRow, endRow),
            Math.max(startCol, endCol),
          ]);
          highlightTile(canvasTiles, selectedTileArea);
        }
      });

      tileCanvas.addEventListener("click", () => {
        if (!isDragging) {
          selectedTileIndex = [i, j];
          selectedTile.tilesetId = tilesetId;
          selectedTile.tileIndex = [i, j];
          resetSelectedTileArea();
          highlightTile(canvasTiles, selectedTileIndex);
        }
      });

      canvasTiles[i].push(tileCanvas);
      grid.appendChild(tileCanvas);
    }
  }

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      dragStart = null;
    }
  });

  highlightTile(canvasTiles, selectedTileIndex);
}

/**
 * Highlight the selected tile visually
 */
function highlightTile(
  canvasTiles: HTMLCanvasElement[][],
  selection: [number, number] | [number, number, number, number]
) {
  for (let i = 0; i < canvasTiles.length; i++) {
    for (let j = 0; j < canvasTiles[i].length; j++) {
      canvasTiles[i][j].style.border = "0px solid transparent";
    }
  }

  if (selection.length === 2) {
    const [i, j] = selection;
    canvasTiles[i][j].style.border = "2px solid yellow";
  } else {
    const [startRow, startCol, endRow, endCol] = selection;
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startCol; j <= endCol; j++) {
        canvasTiles[i][j].style.border = "2px solid yellow";
      }
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
