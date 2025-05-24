import { TILE_SIZE } from "@/constants";
import { MapState } from "@/state/mapState";
import { LayerCanvases, LayerCanvasEvents } from "@/state/layerCanvases";
import { eventBus } from "@/state/eventBus";

export class CanvasManager {
  private root: HTMLDivElement;

  constructor(root: HTMLDivElement) {
    root.style.position = "relative";
    root.style.display = "flex-wrap";
    root.style.flexDirection = "row";
    root.style.justifyContent = "center";
    root.style.alignItems = "center";
    root.style.width = "100%";
    root.style.height = "100%";
    root.style.overflow = "auto";
    this.root = root;
    const mapData = MapState.getMapData();
    root.style.minHeight = `${mapData.height * TILE_SIZE}px`;
    const layers = mapData?.layers ?? [];
    layers.forEach((layer) => {
      const canvas = this.createCanvas(layer.name);
      canvas.width = mapData.width * TILE_SIZE;
      canvas.height = mapData.height * TILE_SIZE;
      this.root.appendChild(canvas);
      LayerCanvases.addToLayerCanvases(canvas);
    });
    eventBus.subscribe(
      LayerCanvasEvents.LAYER_CANVAS_REMOVED,
      (canvas: HTMLCanvasElement) => {
        if (canvas) {
          this.root.removeChild(canvas);
        }
      }
    );
    eventBus.subscribe(
      LayerCanvasEvents.LAYER_CANVAS_ADDED,
      (canvas: HTMLCanvasElement) => {
        if (canvas) {
          this.root.appendChild(canvas);
        }
      }
    );
  }

  createCanvas(id?: string) {
    const canvas = document.createElement("canvas");
    canvas.id = id ?? `layer-canvas-${LayerCanvases.getLayerCanvases().length}`;
    canvas.width = this.root.clientWidth;
    canvas.height = this.root.clientHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none"; // Prevent mouse events on the canvas
    return canvas;
  }

  removeCanvas(id: string) {
    const canvas = LayerCanvases.removeFromLayerCanvasesById(id);
  }
}
