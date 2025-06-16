import { Entity } from "./types";

// Hook types for events
export interface EntityManagerHooks {
  onComponentAdded?: (entity: Entity, componentId: number) => void;
  onComponentRemoved?: (entity: Entity, componentId: number) => void;
}

export class EntityManager {
  private recycledEntities: Entity[] = [];

  private hooks: EntityManagerHooks;

  constructor(hooks: EntityManagerHooks = {}) {
    this.hooks = hooks;
  }

  /**
   * Create a new entity. Reuses IDs if possible.
   */
  addEntity(entities: Set<Entity>): Entity {
    let id: number;
    let available = false;
    while (!available && this.recycledEntities.length > 0) {
      id = this.recycledEntities.pop()!;
      available = entities.has(id) == false;
    }
    if (available) {
      entities.add(id!);
      return id!;
    } else {
      id = entities.size; // Start with the next available ID
      entities.add(id);
      return id;
    }
    throw new Error("No available entity ID found.");
  }

  /**
   * Destroy an entity and mark its ID for reuse.
   */
  destroy(Entities: Set<Entity>, entity: Entity): void {
    if (Entities.has(entity)) {
      Entities.delete(entity);
      this.recycledEntities.push(entity);
    }
  }
}
