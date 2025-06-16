import { DenseComponent } from "./storage/DenseComponent";

export interface AccelerationData {
  x: number;
  y: number;
}

const AccelerationDataTemplate: AccelerationData = {
  x: 0,
  y: 0,
};

export const AccelerationComponentName = "Acceleration";

export const AccelerationComponent = new DenseComponent<AccelerationData>(
  255,
  4,
  Object.keys(AccelerationDataTemplate) as (keyof AccelerationData)[]
);
