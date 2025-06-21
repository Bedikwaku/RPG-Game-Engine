import { ComponentData, System, WorldLike } from "@src/engine/core/types";
import { MAP_WIDTH } from "@src/engine/utils/constants";
import { PartitionedDenseComponent } from "@src/engine/ecs/components/storage/PartitionedDenseComponents";

export abstract class DiffusionSystem<T extends ComponentData>
  implements System
{
  // Generic diffusion system
  constructor(
    protected componentName: string,
    protected mapWidth: number = MAP_WIDTH
  ) {}

  update(world: WorldLike, dt: number, activeMapEntity = -1): void {
    const alpha = 0.1; // Diffusion rate
    if (dt <= 0) return; // No time step, no update
    const partitionedComponent = world.getComponent<T>(
      this.componentName
    ) as PartitionedDenseComponent<T>;
    const components = partitionedComponent.getPartition(activeMapEntity);
    if (!components) {
      if (activeMapEntity == -1) {
        console.warn("No components found across any map.");
        return;
      }
      console.warn("No components found for the active map.");
      return;
    }
    const size = components.getSize();
    const next = new Int16Array(size);

    const width = MAP_WIDTH;

    const componentData = components.getDenseArray() as Int16Array;
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
    const componentArchetype = world.getComponent<T>(
      this.componentName
    ) as PartitionedDenseComponent<T>;
    let output = "";
    componentArchetype.forEachPartition(mapId, (entity, data, index) => {
      if (index % MAP_WIDTH === 0 && index !== 0) {
        output += "\n";
      }
      output += `{x: ${index % MAP_WIDTH}, y: ${Math.floor(index / MAP_WIDTH)} - ${data.value} } `;
    });
    console.log(output);
  }
}
