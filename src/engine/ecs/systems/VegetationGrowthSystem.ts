/* VegetationGrowthSystem.ts
 * This system manages the growth of vegetation in the game world.
 * It updates the growth state of plants based on time and environmental conditions.
 * It also handles the spawning of new plants when conditions are met.
 *
 * Read Only Components:
 * - Moisture: Represents the moisture level in the environment.
 * - Fertility: Represents the fertility level of the soil.
 * - Light: Represents the light level in the environment.
 *
 * Read/Write Components:
 * - Vegetation Cover: Enum (integer) representing the vegetation cover state.
 *   - 0: No vegetation
 *   - 1: Herbs (Grasses, small plants)
 *   - 2: Shrubs
 *   - 3: Trees
 * - Vegetation Age: Represents the age of the vegetation.
 * - Vegetation Health: Similar to health, but is attatched to the map plot.
 * - Time Since Major Disturbance: When vegetation health reaches 0, it is reset to 0.
 */

import { WorldLike, System } from "@src/engine/core/types";
import { MoistureComponentName } from "../components/Moisture";
import { DenseComponent } from "../components/storage/DenseComponent";
import { World } from "@src/engine/core/World";

export class VegetationGrowthSystem implements System {
  update(world: World, dt: number): void {
    // fetch the necessary components
    const moistureComponent = world.getComponent(
      MoistureComponentName
    ) as DenseComponent<Uint16Array>;
    const fertilityComponent = world.getComponent(
      "FertilityComponent"
    ) as DenseComponent<Uint16Array>;
    const lightComponent = world.getComponent(
      "LightComponent"
    ) as DenseComponent<Uint16Array>;
    const vegetationCoverComponent = world.getComponent(
      "VegetationCoverComponent"
    ) as DenseComponent<Uint8Array>;
    const vegetationAgeComponent = world.getComponent(
      "VegetationAgeComponent"
    ) as DenseComponent<Uint16Array>;
    const vegetationHealthComponent = world.getComponent(
      "VegetationHealthComponent"
    ) as DenseComponent<Uint16Array>;
    const timeSinceMajorDisturbanceComponent = world.getComponent(
      "TimeSinceMajorDisturbanceComponent"
    ) as DenseComponent<Uint16Array>;
    const mapId = world.getActiveMapEntity();
  }
}
