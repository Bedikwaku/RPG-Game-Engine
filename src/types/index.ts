export type TileProps = {
  textureId: string;
  blocked?: boolean;
  event?: string;
  [key: string]: any;
};

export type MapLayer = TileProps[][];
// export type Map3D = MapLayer[];

export interface Tile {
  tilesetId: number;
  tileIndex: number;
  blocking?: boolean;
  event?: string; // e.g. "openDoor", "startBattle", etc.
}

export interface Map3D {
  width: number;
  height: number;
  depth: number;
  tiles: (Tile | null)[][][]; // 3D array: [z][y][x]
}
