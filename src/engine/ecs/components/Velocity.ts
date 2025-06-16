import { DenseComponent } from "./storage/DenseComponent";

export interface VelocityData {
  x: number;
  y: number;
}

const VelocityDataTemplate: VelocityData = {
  x: 0,
  y: 0,
};

export const VelocityComponentName = "Velocity";

export const VelocityComponent = new DenseComponent<VelocityData>(
  255,
  4,
  Object.keys(VelocityDataTemplate) as (keyof VelocityData)[]
);
