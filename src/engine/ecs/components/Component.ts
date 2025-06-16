import { Entity } from "../core/types";

// Base interface for any component store (sparse, packed, etc.)
export interface Component<T> {
  add(entity: Entity, data: T): void;
  get(entity: Entity): T | undefined;
  remove(entity: Entity): void;
  has?(entity: Entity): boolean;
  forEach(callback: (entity: Entity, data: T, index: number) => void): void;
}
