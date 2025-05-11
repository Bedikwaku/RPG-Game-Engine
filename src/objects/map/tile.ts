export type Tile = {
  tilesetId: number;
  tileIndex: [number, number]; // [row, column] in the tileset
  eventId?: string;
  blocked?: boolean;
};
