import { DenseComponent } from "./storage/DenseComponent";

export interface PositionData {
  x: number;
  y: number;
}

const PositionDataTemplate: PositionData = {
  x: 0,
  y: 0,
};

export const PositionComponentName = "PositionComponent";

export const PositionComponent = new DenseComponent<PositionData>(
  255,
  4,
  Object.keys(PositionDataTemplate) as (keyof PositionData)[]
);
