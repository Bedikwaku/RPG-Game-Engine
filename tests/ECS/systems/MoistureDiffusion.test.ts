import { Entity } from "@src/engine/core/types";
import { World } from "@src/engine/core/World";
import { DenseComponent } from "@src/engine/ecs/components/storage/DenseComponent";
import { MoistureDiffusionSystem } from "@src/engine/ecs/systems/DiffusionSystem/MoistureDiffusionSystem";
import { MAP_HEIGHT, MAP_WIDTH } from "@src/engine/utils/constants";
import { createSeededPRNG } from "@src/engine/utils/utils";

const mapWidth = MAP_WIDTH;
const mapHeight = MAP_HEIGHT;
let world: World;
let entities: Set<Entity>;
let mapId: Entity;
let MoistureComponent: DenseComponent<Uint16Array>;
const MoistureComponentName = "MoistureComponent";

let prng: () => number;

function createMapPlots(
  mapEntity: number = -1,
  MoistureComponent: DenseComponent<Uint16Array>
): void {
  const newMoisture = new Uint16Array(mapWidth * mapHeight);
  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      newMoisture[x + y * mapWidth] = Math.round(prng() * 65535);
    }
  }
  MoistureComponent.add(mapEntity, newMoisture);
}

describe("Moisture Tests", () => {
  beforeEach(() => {
    prng = createSeededPRNG(12345);
    world = new World();
    entities = new Set<Entity>();
    mapId = world.createEntity(entities);

    MoistureComponent = new DenseComponent<Uint16Array>(
      mapWidth * mapHeight,
      2, // Using 2 bytes for Int16
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
