import { TILE_SIZE } from "@/constants";
import { MapLayer } from "@/state/layers";
import { mapState } from "@/state/mapState";

function renderLayerCanvases() {}

async function initializeCanvasLayer(container: HTMLElement) {
  const map = mapState.getMapData();
  const layers = map.layers;
  const canvasLayers = layers.map((layer, index): MapLayer => {
    const canvas = document.createElement("canvas");
    canvas.id = `layerCanvas_${index}`;
    canvas.width = map.tiles[0][0].length * TILE_SIZE;
    canvas.height = map.tiles[0].length * TILE_SIZE;
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Store the layer's context for later use
    // layer.ctx = ctx;
    return {
      name: layer.name,
      canvas: canvas,
      ctx: ctx,
    };
  });
  return canvasLayers;
}

function getNumberOfLayers(): number {
  const mapData = mapState.getMapData();
  return mapData.layers.length;
}

export { renderLayerCanvases, initializeCanvasLayer, getNumberOfLayers };
