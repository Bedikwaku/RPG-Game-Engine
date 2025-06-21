import { Entity, Component, ComponentData, System, WorldLike } from "./types";
import { EntityManager } from "../ecs/EntityManager";
import { DenseComponent } from "@src/engine/ecs/components/storage/DenseComponent";
import { PartitionedDenseComponent } from "../ecs/components/storage/PartitionedDenseComponents";

export class World implements WorldLike {
  private em = new EntityManager();
  private components = new Map<string, Component<any>>();
  private systems: System[] = [];

  constructor(em: EntityManager = new EntityManager()) {
    this.em = em;
  }

  createEntity(entities: Set<Entity>): Entity {
    const entity = this.em.addEntity(entities);
    // add entity to all components
    for (const [componentName, component] of this.components.entries()) {
      // console.debug(`Initializing entity ${entity} in ${componentName} `);
      if (
        component instanceof DenseComponent ||
        component instanceof PartitionedDenseComponent
      ) {
        // SparsesetComponent doesn't create a new entry until component is attached to entity
        continue;
      } else {
        component.add(entity, undefined); // Add empty data for now
      }
    }
    return entity;
  }

  /**
   * Destroys an entity and removes it from all components.
   */
  destroyEntity(entities: Set<Entity>, entity: Entity): void {
    for (const component of this.components.values()) {
      component.remove(entity);
    }
    this.em.destroy(entities, entity);
  }

  /**
   * Register a component store under a name.
   */
  registerComponent<T extends ComponentData>(
    name: string,
    component: Component<T>
  ): void {
    if (this.components.has(name)) {
      throw new Error(`Component '${name}' already registered.`);
    }
    this.components.set(name, component);
  }

  /**
   * Access a registered component store by name.
   */
  getComponent<T extends ComponentData>(name: string): Component<T> {
    const comp = this.components.get(name);
    if (!comp) {
      throw new Error(`Component '${name}' not registered.`);
    }
    return comp;
  }

  /**
   * Add a system to be updated each frame.
   */
  addSystem(system: System): void {
    this.systems.push(system);
  }

  /**
   * Call update() on all systems.
   */
  update(dt: number): void {
    for (const system of this.systems) {
      system.update(this, dt);
    }
  }

  /**
   * Check if a component is registered.
   */
  hasComponent(name: string): boolean {
    return this.components.has(name);
  }
}
