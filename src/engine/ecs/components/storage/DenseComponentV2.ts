import { Component, ComponentData, Entity } from "@src/engine/core/types";

/*
 * DenseComponentV2.ts
 * This maps an entity to a dense array of data.
 * Use Case Example:
 * A map entity has a dense array of moisture values, where each index corresponds to a specific
 * plot within the region. By defining the moisture values in a dense array, we can efficiently we
 * can query the moisture array by the entity ID of the region. No need to map a component to
 * another component.
 */
export class DenseComponent<T extends ComponentData> implements Component<T> {
  private data: Map<Entity, T> = new Map();

  add(entity: Entity, data: T): void {
    throw new Error("Method not implemented.");
  }
  set(entity: Entity, data: T): void {
    throw new Error("Method not implemented.");
  }
  get(entity: Entity): T | undefined {
    throw new Error("Method not implemented.");
  }
  remove(entity: Entity): void {
    throw new Error("Method not implemented.");
  }
  has(entity: Entity): boolean {
    throw new Error("Method not implemented.");
  }
  forEach(callback: (entity: Entity, data: T, index: number) => void): void {
    throw new Error("Method not implemented.");
  }
}
