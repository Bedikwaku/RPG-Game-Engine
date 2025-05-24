import { TILE_SIZE } from "@/constants";
import { Tile } from "@/objects/map/tile";
import { tilesetCache } from "@/state/cache";
import { currentLayerIndex } from "@/state/layers";
import { MapData, MapState } from "@/state/mapState";
import { selectedTile, selectedTileArea } from "@/state/selectedTile";
import { viewOffset } from "@/state/viewportState";
