// getSelectedTiles.ts
import { Rect } from "@/types/geometry";
import { Tile } from "@/objects/map/tile";
export function getSelectedTiles(
  tileGrid: Tile[][],
  selectionArea: Rect
): Tile[] {
  const tiles: Tile[] = [];

  const startX = Math.max(0, selectionArea.x);
  const startY = Math.max(0, selectionArea.y);
  const endX = Math.min(
    tileGrid[0].length,
    selectionArea.x + selectionArea.width
  );
  const endY = Math.min(
    tileGrid.length,
    selectionArea.y + selectionArea.height
  );

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      tiles.push(tileGrid[y][x]);
    }
  }

  return tiles;
}
