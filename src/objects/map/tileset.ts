import { TILE_SIZE } from "@/constants";

export type TilesetObject = {
  tilesetId: number; // ID of the tileset
  image: HTMLImageElement; // Image element for the tileset
  tileImage: HTMLCanvasElement[][]; // 2D array of tile images
  description?: string; // Description of the tileset
  cols: number; // Number of columns in the tileset
  rows: number; // Number of rows in the tileset
};

let discoveredTilesets: number[] = [];

async function discoverTilesets(): Promise<number[]> {
  // TODO: Replace with dynamic file listing if backend is introduced
  const tilesetIds = [1, 2, 3];
  console.log(`[TilesetLoader] Discovered tilesets: ${tilesetIds.join(", ")}`);
  discoveredTilesets = tilesetIds;
  return tilesetIds;
}

async function loadTileset(tilesetId: number): Promise<TilesetObject> {
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
      reject(new Error(`Failed to load tileset: ${tilesetId}.png`));
    };
  });
}

const tilesetCache: Record<string, TilesetObject> = {};

async function loadAndCacheAllTilesets(): Promise<void> {
  const promises = discoveredTilesets.map(async (tilesetId) => {
    if (tilesetCache[tilesetId]) {
      return Promise.resolve(tilesetCache[tilesetId]);
    } else {
      try {
        const tileset = await loadTileset(tilesetId);
        tilesetCache[tilesetId] = tileset;
        return tileset;
      } catch (error) {
        console.error(`Error loading tileset ${tilesetId}:`, error);
        // Remove tileID from discoveredTilesets if it fails to load
        const index = discoveredTilesets.indexOf(tilesetId);
        if (index > -1) {
          discoveredTilesets.splice(index, 1);
        }

        return null;
      }
    }
  });
  await Promise.all(promises);
}

export {
  loadAndCacheAllTilesets,
  discoverTilesets,
  tilesetCache,
  discoveredTilesets,
};
