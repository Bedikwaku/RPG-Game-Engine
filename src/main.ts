import { World } from "@src/engine/core/World";
import { Entity } from "@src/engine/core/types";
import {
  AccelerationComponent,
  AccelerationComponentName,
  PositionComponent,
  PositionComponentName,
  VelocityComponent,
  VelocityComponentName,
} from "@src/engine/ecs/components";

const world = new World();
const entities = new Set<Entity>();

const addGameComponents = (world: World) => {
  world.registerComponent(PositionComponentName, PositionComponent);
  world.registerComponent(VelocityComponentName, VelocityComponent);
  world.registerComponent(AccelerationComponentName, AccelerationComponent);
};

const addMovementComponents = (world: World, entity: Entity) => {
  const position = world.getComponent(PositionComponentName);
  const velocity = world.getComponent(VelocityComponentName);
  const acceleration = world.getComponent(AccelerationComponentName);

  position.add(entity, { x: 0, y: 0 });
  velocity.add(entity, { x: 0, y: 0 });
  acceleration.add(entity, { x: 0, y: 0 });
};

const createPlayerEntity = (world: World, entities: Set<Entity>): Entity => {
  const playerEntity = world.createEntity(entities);
  addMovementComponents(world, playerEntity);

  return playerEntity;
};

console.log("Game world initialized:", world);
