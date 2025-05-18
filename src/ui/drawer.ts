import { TILE_SIZE } from "@/constants";
import {
  resetSelectedTileArea,
  selectedTile,
  setSelectedTileArea,
} from "../state/selectedTile";
import { discoveredTilesets, tilesetCache } from "@/objects/map/tileset";
import { dragSelectionManager } from "@/state/dragSelectionManager";
import { setCurrentLayer, toggleShowAllLayers } from "@/state/layers";
import { highlightTile } from "@/utils/highlightTile";

// Global State
let selectedTilesetId = 1;
let selectedTileIndex: [number, number] = [0, 0];

const attachedListeners = {
  tilesheetSelect: false,
  tileCanvasEvents: false,
};

if (!attachedListeners.tileCanvasEvents) {
  document.addEventListener("mouseup", () => {
    dragSelectionManager.stop();
  });
  attachedListeners.tileCanvasEvents = true;
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
  <label for="layer-select" style="margin-left: 10px;">Layer:</label>
  <select id="layer-select"></select>
  <label><input type="checkbox" id="show-all-layers" checked /> Show all layers</label>
  <div id="tileset-grid" style="display: flex; flex-wrap: wrap; gap: 0px; margin-top: 10px;"></div>
`;

  const select = document.getElementById("tileset-select") as HTMLSelectElement;
  const tilesetIds = discoveredTilesets;

  // Layer selection dropdown
  const layerSelect = document.getElementById(
    "layer-select"
  ) as HTMLSelectElement;
  layerSelect.addEventListener("change", () => {
    const selectedLayerIndex = parseInt(layerSelect.value, 10);
    setCurrentLayer(selectedLayerIndex); // Updates state and triggers renderTiles() automatically
  });

  // Show all layers checkbox
  const showAllLayersCheckbox = document.getElementById(
    "show-all-layers"
  ) as HTMLInputElement;
  showAllLayersCheckbox.addEventListener("change", () => {
    toggleShowAllLayers(showAllLayersCheckbox.checked); // Updates state and triggers renderTiles() automatically
  });
  // Populate dropdown
  tilesetIds.forEach((id) => {
    const option = document.createElement("option");
    option.value = id.toString();
    option.textContent = `Tileset ${id}`;
    select.appendChild(option);
  });

  select.value = selectedTilesetId.toString();
  if (!attachedListeners.tilesheetSelect) {
    select.addEventListener("change", () => {
      selectedTilesetId = parseInt(select.value, 10);
      displayTileset(selectedTilesetId);
    });
    attachedListeners.tilesheetSelect = true;
  }

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

  const tileset = tilesetCache[tilesetId];

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

      tileCanvas.addEventListener("mousedown", () => {
        dragSelectionManager.start(i, j);
        resetSelectedTileArea();
      });

      tileCanvas.addEventListener("mouseenter", () => {
        const area = dragSelectionManager.update(i, j);
        if (area) {
          setSelectedTileArea(area);
          highlightTile(canvasTiles, area);
        }
      });

      tileCanvas.addEventListener("click", () => {
        if (!dragSelectionManager["isDragging"]) {
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

  highlightTile(canvasTiles, selectedTileIndex);
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
