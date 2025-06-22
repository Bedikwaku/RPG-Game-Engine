import { Entity } from "@src/engine/core/types";
import { World } from "@src/engine/core/World";
import { MoistureData } from "@src/engine/ecs/components/Moisture";
import { PartitionedDenseComponent } from "@src/engine/ecs/components/storage/PartitionedDenseComponents";
import { MoistureDiffusionSystem } from "@src/engine/ecs/systems/DiffusionSystem/MoistureDiffusionSystem";
import { MAP_HEIGHT, MAP_WIDTH } from "@src/engine/utils/constants";
import { createSeededPRNG } from "@src/engine/utils/utils";

const mapWidth = MAP_WIDTH;
const mapHeight = MAP_HEIGHT;
let world: World;
let entities: Set<Entity>;
let mapId: Entity;
let MoistureComponent: PartitionedDenseComponent<MoistureData>;
const MoistureComponentName = "MoistureComponent";

let prng: () => number;

function createMapPlots(
  mapEntity: number = -1,
  MoistureComponent: PartitionedDenseComponent<MoistureData>
): void {
  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      const plot = world.createEntity(entities);
      MoistureComponent.add(
        plot,
        {
          value: Math.round(prng() * 65535), // Normalize to 0-65535
        },
        mapId
      );
    }
  }
}

describe("Moisture Tests", () => {
  beforeEach(() => {
    prng = createSeededPRNG(12345);
    world = new World();
    entities = new Set<Entity>();
    mapId = world.createEntity(entities);

    MoistureComponent = new PartitionedDenseComponent<MoistureData>(
      mapWidth * mapHeight,
      2, // Using 2 bytes for Int16
      ["value"],
      mapId
    );
    world.registerComponent(MoistureComponentName, MoistureComponent);
  });
  it("Create Entities", () => {
    createMapPlots(mapId, MoistureComponent);
    const moistureDiffusionSystem = new MoistureDiffusionSystem(
      MoistureComponentName
    );
    moistureDiffusionSystem.displayComponentLevels(world, mapId);
  });

  it("Moisture Diffusion", () => {
    createMapPlots(mapId, MoistureComponent);
    console.log("Initial moisture levels:");
    const system = new MoistureDiffusionSystem(MoistureComponentName);
    system.displayComponentLevels(world, mapId);
    const dt = 1; // Time step for diffusion
    system.update(world, dt, mapId);
    console.log("Moisture levels after diffusion:");
    system.displayComponentLevels(world, mapId);
  });
});
