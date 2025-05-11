export const TILE_SIZE = 32; // Size of each tile in pixels

export type TilesetObject = {
  tilesetId: number; // ID of the tileset
  image: HTMLImageElement; // Image element for the tileset
  tileImage: HTMLCanvasElement[][]; // 2D array of tile images
  description?: string; // Description of the tileset
  cols: number; // Number of columns in the tileset
  rows: number; // Number of rows in the tileset
};

export async function loadTileset(tilesetId: number): Promise<TilesetObject> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `/assets/tilesets/${tilesetId}.png`;

    img.onload = () => {
      const cols = Math.floor(img.width / TILE_SIZE);
      const rows = Math.floor(img.height / TILE_SIZE);
      const tileImages: HTMLCanvasElement[][] = [];

      for (let y = 0; y < rows; y++) {
        tileImages.push([]);
        for (let x = 0; x < cols; x++) {
          const tileCanvas = document.createElement("canvas");
          tileCanvas.width = TILE_SIZE;
          tileCanvas.height = TILE_SIZE;
          const tileCtx = tileCanvas.getContext("2d");

          if (tileCtx) {
            tileCtx.drawImage(
              img,
              x * TILE_SIZE,
              y * TILE_SIZE,
              TILE_SIZE,
              TILE_SIZE,
              0,
              0,
              TILE_SIZE,
              TILE_SIZE
            );

            tileImages[y].push(tileCanvas);
          }
        }
      }

      resolve({
        tilesetId: tilesetId,
        image: img,
        tileImage: tileImages,
        description: `Tileset ${tilesetId}`,
        cols: cols,
        rows: rows,
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load tileset: ${tilesetId}.bmp`));
    };
  });
}
