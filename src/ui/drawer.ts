import { SHOW_ALL_LAYERS, TILE_SIZE } from "@/constants";
import {
  resetSelectedTileArea,
  selectedTile,
  setSelectedTileArea,
} from "../state/selectedTile";
import { discoveredTilesets } from "@/objects/map/tileset";
import { dragSelectionManager } from "@/state/dragSelectionManager";
import {
  currentLayerIndex,
  setCurrentLayer,
  setVisibleLayers,
  toggleShowAllLayers,
} from "@/state/layers";
import { highlightTile } from "@/utils/highlightTile";
import { MapState } from "@/state/mapState";
import { addLayerToMap, removeLayerFromMap } from "@/services/mapService";
import { tilesetCache } from "@/state/cache";

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

    <button id="add-layer-btn" style="margin-left: 5px;">Add Layer</button>
    <button id="remove-layer-btn" style="margin-left: 5px;">Remove Layer</button>
    <label for="visible-layers-select" style="display:block; margin-top: 8px;">Visible Layers:</label>
    <select id="visible-layers-select" multiple size="4" style="width: 200px;"></select>


    <label style="margin-left: 10px;"><input type="checkbox" id="${SHOW_ALL_LAYERS}" checked /> Show all layers</label>

    <div id="tileset-grid" style="display: flex; flex-wrap: wrap; gap: 0px; margin-top: 10px;"></div>
  `;

  function refreshVisibleLayerSelect(): void {
    const mapData = MapState.getMapData();
    const select = document.getElementById(
      "visible-layers-select"
    ) as HTMLSelectElement;
    if (!mapData || !select) return;

    select.innerHTML = "";
    mapData.layers.forEach((layer, index) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = layer.name || `Layer ${index + 1}`;
      option.selected = true; // Default to showing all layers
      select.appendChild(option);
    });
  }

  function refreshLayerSelect(): void {
    const mapData = MapState.getMapData();
    const select = document.getElementById("layer-select") as HTMLSelectElement;
    if (!mapData || !select) return;

    select.innerHTML = "";
    mapData.layers.forEach((layer, index) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = layer.name || `Layer ${index + 1}`;
      select.appendChild(option);
    });

    // Select the current layer index (assumes you store it in state)
    const current = currentLayerIndex;
    select.value = current.toString();
  }

  const visibleLayerSelect = document.getElementById(
    "visible-layers-select"
  ) as HTMLSelectElement;
  function updateVisibleLayers() {
    const selectedIndices = Array.from(visibleLayerSelect.selectedOptions).map(
      (opt) => {
        return parseInt(opt.value, 10);
      }
    );
    console.log("Selected visible layers:", selectedIndices);
    setVisibleLayers(selectedIndices); // This updates your show logic
  }
  visibleLayerSelect.addEventListener("change", updateVisibleLayers);

  refreshVisibleLayerSelect();
  refreshLayerSelect();

  const select = document.getElementById("tileset-select") as HTMLSelectElement;
  const addLayerBtn = document.getElementById(
    "add-layer-btn"
  ) as HTMLButtonElement;
  const removeLayerBtn = document.getElementById(
    "remove-layer-btn"
  ) as HTMLButtonElement;
  const tilesetIds = discoveredTilesets;

  // Layer selection dropdown
  const layerSelect = document.getElementById(
    "layer-select"
  ) as HTMLSelectElement;
  layerSelect.addEventListener("change", () => {
    const selectedLayerIndex = parseInt(layerSelect.value, 10);
    console.log("Setting selected layer index to", selectedLayerIndex);
    setCurrentLayer(selectedLayerIndex); // Updates state and triggers renderTiles() automatically
  });

  // Show all layers checkbox
  const showAllLayersCheckbox = document.getElementById(SHOW_ALL_LAYERS);
  if (!showAllLayersCheckbox) {
    console.error("Show all layers checkbox not found");
  } else {
    showAllLayersCheckbox.addEventListener("change", () => {
      toggleShowAllLayers((showAllLayersCheckbox as HTMLInputElement).checked); // Updates state and triggers renderTiles() automatically
    });
  }
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

  addLayerBtn.addEventListener("click", () => {
    const mapData = MapState.getMapData();
    if (!mapData) return;

    const name = `Layer ${mapData.layers.length + 1}`;
    console.log(`Adding ${name} to mapData`);
    addLayerToMap(mapData, name);
    refreshVisibleLayerSelect();
    console.log(mapData);

    refreshLayerSelect();
  });

  removeLayerBtn.addEventListener("click", () => {
    const mapData = MapState.getMapData();
    if (!mapData) return;

    const layerSelect = document.getElementById(
      "layer-select"
    ) as HTMLSelectElement;
    const index = parseInt(layerSelect.value, 10);
    removeLayerFromMap(mapData, index);
    refreshLayerSelect();
  });

  // Load initial tileset
  await displayTileset(selectedTilesetId);
}

/**
 * Load and display the tiles from the selected tileset
 */
async function displayTileset(tilesetId: number): Promise<void> {
  console.debug(`Displaying tileset ${tilesetId}`);
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
  console.debug(`Total columns: ${tileset.cols}`);
  console.debug(`Total rows: ${tileset.rows}`);
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

function refreshLayerSelect(): void {
  const mapData = MapState.getMapData();
  const select = document.getElementById("layer-select") as HTMLSelectElement;
  if (!mapData || !select) return;

  select.innerHTML = ""; // Clear current options
  mapData.layers.forEach((layer, index) => {
    const option = document.createElement("option");
    option.value = index.toString();
    option.textContent = layer.name || `Layer ${index + 1}`;
    select.appendChild(option);
  });

  // Re-set to current layer if valid
  const current = mapData.layers.length - 1;
  setCurrentLayer(current);
  select.value = current.toString();
}
