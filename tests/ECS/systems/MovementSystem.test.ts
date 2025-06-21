import { expect } from "chai";
import sinon from "sinon";
import {
  PositionComponentName,
  VelocityComponentName,
  AccelerationComponentName,
  PositionComponent,
  VelocityComponent,
  AccelerationComponent,
} from "@src/engine/ecs/components";
import { Entity, WorldLike } from "@src/engine/core/types";
import { World } from "@src/engine/core/World";

describe("Game Init", () => {
  it("Creates entity with Position, Velocity, and Acceleration components", () => {
    const world = new World();
    const globalEntities = new Set<Entity>(); // Access the entities set

    world.registerComponent(PositionComponentName, PositionComponent);
    world.registerComponent(VelocityComponentName, VelocityComponent);
    world.registerComponent(AccelerationComponentName, AccelerationComponent);

    // Create an entity and add components
    const entity = world.createEntity(globalEntities);
    world.getComponent(PositionComponentName).add(entity, { x: 10, y: 0 });
    world.getComponent(VelocityComponentName).add(entity, { x: 0, y: 0 });
    world.getComponent(AccelerationComponentName).add(entity, { x: 0, y: 0 });

    expect(world.getComponent(PositionComponentName).get(entity)).to.deep.equal(
      { x: 10, y: 0 }
    );
    expect(world.getComponent(VelocityComponentName).get(entity)).to.deep.equal(
      { x: 0, y: 0 }
    );
    expect(
      world.getComponent(AccelerationComponentName).get(entity)
    ).to.deep.equal({ x: 0, y: 0 });
  });

  it("Updates velocity when acceleration is constant", () => {
    const world = new World();
    world.registerComponent(PositionComponentName, PositionComponent);
    world.registerComponent(VelocityComponentName, VelocityComponent);
    world.registerComponent(AccelerationComponentName, AccelerationComponent);
    const globalEntities = new Set<Entity>(); // Access the entities set
    const entity = world.createEntity(globalEntities);
    world.getComponent(PositionComponentName).add(entity, { x: 0, y: 0 });
    world.getComponent(VelocityComponentName).add(entity, { x: 1, y: 0 });
    world.getComponent(AccelerationComponentName).add(entity, { x: 0, y: 0 });

    const dt = 1000; // 1 second
    // world.addSystem
  });
});
