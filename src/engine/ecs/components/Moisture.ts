import { MAP_HEIGHT, MAP_WIDTH } from "@src/engine/utils/constants";
import { DenseComponent } from "./storage/DenseComponent";

// Int16. We quantize moisture to 16 bits and normalize it to 0-1 range
// This allows us to store moisture values with a precision of 1/65536

export const MoistureComponentName = "MoistureComponent";

export const MoistureComponent = new DenseComponent<Uint16Array>(
  MAP_WIDTH * MAP_HEIGHT,
  2 // Using 2 bytes for Int16
);
