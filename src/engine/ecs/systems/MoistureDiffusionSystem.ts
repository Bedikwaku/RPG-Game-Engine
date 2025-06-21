import { System, WorldLike } from "@src/engine/core/types";
import {
  MoistureComponentName,
  MoistureData,
} from "@src/engine/ecs/components/Moisture";
import { PartitionedDenseComponent } from "@src/engine/ecs/components/storage/PartitionedDenseComponents";
import { MAP_WIDTH } from "@src/engine/utils/constants";

export class MoistureDiffusionSystem implements System {
  update(world: WorldLike, dt: number, activeMapEntity = -1): void {
    const alpha = 0.1; // Diffusion rate
    if (dt <= 0) return; // No time step, no update
    const moisturePartitionedComponent = world.getComponent<MoistureData>(
      MoistureComponentName
    ) as PartitionedDenseComponent<MoistureData>;
    const moistureComponents =
      moisturePartitionedComponent.getPartition(activeMapEntity);
    if (!moistureComponents) {
      console.warn("No moisture components found for the active map.");
      return;
    }
    const size = moistureComponents.getSize();
    const next = new Int16Array(size);

    const width = MAP_WIDTH;

    const moistureData = moistureComponents.getDenseArray() as Int16Array;
    for (let i = 0; i < size; i++) {
      let total = 0;
      let count = 0;
      // Left
      if (i % width !== 0) {
        total += moistureData[i - 1];
        count++;
      }
      // Right
      if (i % width !== width - 1) {
        total += moistureData[i + 1];
        count++;
      }
      // Up
      if (i >= width) {
        total += moistureData[i - width];
        count++;
      }
      // Down
      if (i < size - width) {
        total += moistureData[i + width];
        count++;
      }

      const average = total / count;
      const current = moistureData[i];
      const diffused = current + alpha * (average - current);
      next[i] = Math.round(diffused);
    }

    moistureData.set(next);
  }
  displayMoistureLevels(world: WorldLike, mapId: number): void {
    const MoistureComponentArchetype = world.getComponent<MoistureData>(
      MoistureComponentName
    ) as PartitionedDenseComponent<MoistureData>;
    let output = "";
    MoistureComponentArchetype.forEachPartition(
      mapId,
      (entity, data, index) => {
        if (index % MAP_WIDTH === 0 && index !== 0) {
          output += "\n"; // New line for each row
        }
        output += `{x: ${index % MAP_WIDTH}, y: ${Math.floor(index / MAP_WIDTH)} - ${data.value} } `;
      }
    );
    console.log(output);
  }
}
