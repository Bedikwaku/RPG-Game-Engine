import { Component, ComponentData, Entity } from "@src/engine/core/types";

export class SparseComponent<T extends number> implements Component<T> {
  /*
   * A sparse component uses a Map to store data for each entity.
   * This is useful for components that have a variable number of properties
   * or when the data structure is not fixed.
   * It is less memory efficient than packed components,
   * but allows for more flexibility in the data structure.
   */
  private data: Map<Entity, T> = new Map();
  add(entity: Entity, data: T): void {
    if (this.data.has(entity)) {
      throw new Error(`Entity ${entity} already has data in this component.`);
    }
    this.data.set(entity, data);
  }
  set(entity: Entity, data: T): void {
    if (!this.data.has(entity)) {
      throw new Error(`Entity ${entity} does not exist in this component.`);
    }
    this.data.set(entity, data);
  }
  get(entity: Entity): T | undefined {
    const value = this.data.get(entity);
    if (value === undefined) {
      throw new Error(`Entity ${entity} does not exist in this component.`);
    }
    return value;
  }
  remove(entity: Entity): void {
    if (!this.data.has(entity)) {
      throw new Error(`Entity ${entity} does not exist in this component.`);
    }
    this.data.delete(entity);
  }
  has(entity: Entity): boolean {
    return this.data.has(entity);
  }
  forEach(callback: (entity: Entity, data: T, index: number) => void): void {
    let index = 0;
    for (const [entity, data] of this.data.entries()) {
      callback(entity, data, index++);
    }
  }
}
