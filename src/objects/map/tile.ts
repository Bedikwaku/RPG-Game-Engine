export type TileObject = {
  tilesetId: number;
  tileIndex: [number, number]; // [row, column] in the tileset
  eventId?: string;
  blocked?: boolean;
};
