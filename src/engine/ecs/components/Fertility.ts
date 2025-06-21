import { ComponentData } from "@src/engine/core/types";
import { PartitionedDenseComponent } from "./storage/PartitionedDenseComponents";
import { MAP_HEIGHT, MAP_WIDTH } from "@src/engine/utils/constants";

export interface FertilityData extends ComponentData {
  value: number;
}

export const fertilityDataDefault: FertilityData = {
  value: 0,
};

export const fertilityComponentName = "FertilityComponent";

export const fertilityComponent = new PartitionedDenseComponent<FertilityData>(
  MAP_WIDTH * MAP_HEIGHT,
  2, // Using 2 bytes for Int16
  ["value"]
);
