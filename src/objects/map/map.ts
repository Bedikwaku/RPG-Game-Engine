/*
The map object defines the maps or scenes within  the game. Each map is a 3D array of tiles, where each tile can have different properties such as texture, type, and other attributes. The map object also includes methods for loading and saving maps, as well as generating default maps. The map is designed to be flexible and extensible, allowing for easy addition of new features or changes to existing ones.
The map object is used in conjunction with the tileset object, which defines the available textures and their properties. The map and tileset objects work together to create a rich and immersive game world, allowing for dynamic interactions and events based on the properties of the tiles and the player's actions.
*/

import { TileObject } from "./tile";

type MapObject = {
  width: number;
  height: number;
  depth: number;
  tiles: (TileObject | null)[][][]; // 3D array of TileProps
};

function createDefaultMap(): MapObject {
  console.log("Generating default map...");
  const width = 5;
  const height = 5;
  const depth = 3;
  const defaultMap: (TileObject | null)[][][] = Array.from(
    { length: depth },
    () => Array.from({ length: height }, () => Array(width).fill(null))
  );
  console.log(defaultMap);
  return {
    width: width,
    height: height,
    depth: depth,
    tiles: defaultMap,
  };
}

export { MapObject, createDefaultMap };
