import { Tile } from "@/objects/map/tile";

export let selectedTile: Tile = { tilesetId: 1, tileIndex: [0, 0] }; // Default selected tile (1st tile of tileset 1)
export let selectedZ = 0; // Default Z index
export let selectedTileIndex: [number, number] = [0, 0];
export let selectedTileArea: [number, number, number, number] = [0, 0, 0, 0]; // [startRow, startCol, endRow, endCol]

export function resetSelectedTileArea() {
  selectedTileArea = [0, 0, 0, 0];
}
export function setSelectedTileArea(area: [number, number, number, number]) {
  selectedTileArea = area;
}

export function setSelectedZ(z: number) {
  selectedZ = z;
}
