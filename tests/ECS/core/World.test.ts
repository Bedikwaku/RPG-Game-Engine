import { expect } from "chai";
import sinon from "sinon";
import { Entity, WorldLike } from "@src/engine/core/types";
import { World } from "@src/engine/core/World";
import { DenseComponent } from "@src/engine/ecs/components/storage/DenseComponent";
import { interfaces } from "mocha";
import { SparseComponent } from "@src/engine/ecs/components/storage/SparseComponent";

interface DenseData {
  x: number;
  y: number;
}
const denseDataTemplate = {
  x: 0,
  y: 0,
};

describe("World init", () => {
  let world: World;
  let entities: Set<Entity>;

  beforeEach(() => {
    world = new World();
    entities = new Set<Entity>();
  });

  it("Initialising world object", () => {
    expect(world).to.be.instanceOf(World);
    expect(world.createEntity).to.be.a("function");
    expect(world.destroyEntity).to.be.a("function");
    expect(world.registerComponent).to.be.a("function");
    expect(world.getComponent).to.be.a("function");
  });

  it("Registering component", () => {
    const denseComponent = new DenseComponent<Uint16Array>(255, 2);
    world.registerComponent("Dense", denseComponent);
    expect(world.getComponent("Dense")).to.equal(denseComponent);
  });
});

describe("World entity management", () => {
  let world: World;
  let entities: Set<Entity>;
  beforeEach(() => {
    world = new World();
    entities = new Set<Entity>();
  });

  it("Create Case 1: Create first entity", () => {
    const denseComponent = new DenseComponent<Uint32Array>(255, 4);
    world.registerComponent("Dense", denseComponent);
    const entity = world.createEntity(entities);
    expect(entity).to.equal(0); // First entity should have ID 0
    expect(denseComponent.has(entity)).to.be.false;
  });

  it("Create Case 2: Create entity in recycled spot", () => {
    const sparseComponent = new SparseComponent<number>();
    world.registerComponent("Sparse", sparseComponent);
    world.createEntity(entities);
    world.createEntity(entities);
    world.createEntity(entities);
    world.destroyEntity(entities, 1); // Destroy second entity
    const newEntity = world.createEntity(entities);
    expect(newEntity).to.equal(1); // Should reuse ID 1
    expect(sparseComponent.has(newEntity)).to.be.true;
  });

  it("Delete Case 1: Destroy existing entity", () => {
    const sparseComponent = new SparseComponent<number>();
    world.registerComponent("Sparse", sparseComponent);
    const entity = world.createEntity(entities);
    expect(entities.has(entity)).to.be.true;
    world.destroyEntity(entities, entity);
    expect(entities.has(entity)).to.be.false;
    expect(sparseComponent.has(entity)).to.be.false;
  });
});
