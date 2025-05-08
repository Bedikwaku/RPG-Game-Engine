export type TileProps = {
  textureId: string;
  blocked?: boolean;
  event?: string;
  [key: string]: any;
};

export type MapLayer = TileProps[][];
export type Map3D = MapLayer[];
