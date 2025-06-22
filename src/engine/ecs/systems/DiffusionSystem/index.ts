import {
  ComponentData,
  System,
  TypedArray,
  WorldLike,
} from "@src/engine/core/types";
import { MAP_WIDTH } from "@src/engine/utils/constants";
import { DenseComponent } from "../../components/storage/DenseComponent";

export abstract class DiffusionSystem<T extends TypedArray> implements System {
  // Generic diffusion system
  constructor(
    protected componentName: string,
    protected mapWidth: number = MAP_WIDTH
  ) {}

  update(world: WorldLike, dt: number, activeMapEntity = -1): void {
    const alpha = 0.1; // Diffusion rate
    if (dt <= 0) return; // No time step, no update
    const denseComponent = world.getComponent<T>(
      this.componentName
    ) as DenseComponent<T>;

    const width = MAP_WIDTH;

    const components = denseComponent.get(activeMapEntity)!;
    const size = components.length;
    const next = new Int16Array(size);
    const componentData = components as Uint16Array;
    for (let i = 0; i < size; i++) {
      let total = 0;
      let count = 0;
      // Left
      if (i % width !== 0) {
        total += componentData[i - 1];
        count++;
      }
      // Right
      if (i % width !== width - 1) {
        total += componentData[i + 1];
        count++;
      }
      // Up
      if (i >= width) {
        total += componentData[i - width];
        count++;
      }
      // Down
      if (i < size - width) {
        total += componentData[i + width];
        count++;
      }

      const average = total / count;
      const current = componentData[i];
      const diffused = current + alpha * (average - current);
      next[i] = Math.round(diffused);
    }

    componentData.set(next);
  }

  displayComponentLevels(world: WorldLike, mapId: number): void {
    const component = world.getComponent<T>(
      this.componentName
    ) as DenseComponent<T>;
    let output = "";
    const data = component.get(mapId);
    if (!data) {
      console.log("No data found for the specified map ID.");
      return;
    }

    for (let i = 0; i < data.length; i++) {
      output += `{x: ${i % MAP_WIDTH}, y: ${Math.floor(i / MAP_WIDTH)} - ${data[i]} } `;
      if ((i + 1) % MAP_WIDTH === 0) {
        output += "\n"; // New line after each row
      }
    }
    console.log(output);
  }
}
