import { MAP_HEIGHT, MAP_WIDTH } from "@src/engine/utils/constants";
import { DenseComponent } from "./storage/DenseComponent";

export const fertilityComponentName = "FertilityComponent";

export const fertilityComponent = new DenseComponent<Uint16Array>(
  MAP_WIDTH * MAP_HEIGHT,
  2 // Using 2 bytes for Int16`
);
