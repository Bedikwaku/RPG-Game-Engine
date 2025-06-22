import { Entity } from "@src/engine/core/types";
import { World } from "@src/engine/core/World";
import { PartitionedDenseComponent } from "@src/engine/ecs/components/storage/PartitionedDenseComponents";
import { FertilityDiffusionSystem } from "@src/engine/ecs/systems/DiffusionSystem/FertilityDiffusionSystem";
import { MAP_HEIGHT, MAP_WIDTH } from "@src/engine/utils/constants";
import { createSeededPRNG } from "@src/engine/utils/utils";

const mapWidth = MAP_WIDTH;
const mapHeight = MAP_HEIGHT;
let world: World;
let entities: Set<Entity>;
let mapId: Entity;

interface FertilityData {
  value: number;
}

let FertilityComponent: PartitionedDenseComponent<FertilityData>;
const FertilityComponentName = "FertilityComponent";

let prng: () => number;

function createMapPlots(
  mapId: number = -1,
  fertilityComponent: PartitionedDenseComponent<FertilityData>
): void {
  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      const plot = world.createEntity(entities);
      fertilityComponent.add(
        plot,
        {
          value: Math.round(prng() * 65535), // Normalize to 0-65535
        },
        mapId
      );
    }
  }
}

describe("Fertility Tests", () => {
  beforeEach(() => {
    // reset PRNG
    prng = createSeededPRNG(12345);

    // reset world and entities
    world = new World();
    entities = new Set<Entity>();
    mapId = world.createEntity(entities);

    FertilityComponent = new PartitionedDenseComponent<FertilityData>(
      mapWidth * mapHeight,
      2, // Using 2 bytes for Int16
      ["value"],
      mapId
    );
    world.registerComponent(FertilityComponentName, FertilityComponent);
  });
  it("Create Entities", () => {
    createMapPlots(mapId, FertilityComponent);
    const fertilityDiffusionSystem = new FertilityDiffusionSystem(
      FertilityComponentName,
      MAP_WIDTH
    );
    fertilityDiffusionSystem.displayComponentLevels(world, mapId);
  });

  it("Fertility Diffusion", () => {
    createMapPlots(mapId, FertilityComponent);
    console.log("Initial fertility levels:");
    const system = new FertilityDiffusionSystem(
      FertilityComponentName,
      MAP_WIDTH
    );
    system.displayComponentLevels(world, mapId);
    const dt = 1; // Time step for diffusion
    system.update(world, dt, mapId);
    console.log("Fertility levels after diffusion:");
    system.displayComponentLevels(world, mapId);
  });
});
