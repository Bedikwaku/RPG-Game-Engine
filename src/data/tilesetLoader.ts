const TILE_SIZE = 32;

export type TileImage = {
  tilesetId: number;
  tileIndex: number;
  image: HTMLCanvasElement;
};

// export async function loadTileset(tilesetId: number): Promise<TileImage[]> {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.src = `/assets/tilesets/${tilesetId}.bmp`;

//     img.onload = () => {
//       const cols = Math.floor(img.width / TILE_SIZE);
//       const rows = Math.floor(img.height / TILE_SIZE);
//       const tiles: TileImage[] = [];

//       for (let y = 0; y < rows; y++) {
//         for (let x = 0; x < cols; x++) {
//           const tileCanvas = document.createElement("canvas");
//           tileCanvas.width = TILE_SIZE;
//           tileCanvas.height = TILE_SIZE;
//           const tileCtx = tileCanvas.getContext("2d");

//           if (tileCtx) {
//             tileCtx.drawImage(
//               img,
//               x * TILE_SIZE,
//               y * TILE_SIZE,
//               TILE_SIZE,
//               TILE_SIZE,
//               0,
//               0,
//               TILE_SIZE,
//               TILE_SIZE
//             );

//             tiles.push({
//               tilesetId,
//               tileIndex: y * cols + x,
//               image: tileCanvas,
//             });
//           }
//         }
//       }

//       resolve(tiles);
//     };

//     img.onerror = () => {
//       reject(new Error(`Failed to load tileset: ${tilesetId}.bmp`));
//     };
//   });
// }
