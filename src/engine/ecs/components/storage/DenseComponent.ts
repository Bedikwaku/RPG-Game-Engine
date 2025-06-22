import { extend } from "@pixi/react";
import {
  Entity,
  Component,
  ComponentData,
  TypedArray,
  Primitive,
} from "@src/engine/core/types";
import { primitiveToNumber } from "@src/engine/utils/utils";

export class DenseComponent<T extends TypedArray> implements Component<T> {
  // A dense component, also known as a sparseset, utilizes dense array to store data in a
  // contiguous block of memory.
  private sparseToDenseMapping: Map<Entity, TypedArray> = new Map();
  private bytesPerValue: 1 | 2 | 4 | 8;
  private dimensionality: number;

  constructor(
    initialCapacity: number = 1024,
    bytesPerValue: 1 | 2 | 4 | 8,
    dimensionality: number = 1
  ) {
    this.dimensionality = dimensionality;
    if (initialCapacity <= 0) {
      throw new Error("Initial capacity must be greater than 0");
    }
    this.bytesPerValue = bytesPerValue;
  }

  private createArray(capacity: number, bytesPerValue: 1 | 2 | 4 | 8): T {
    switch (bytesPerValue) {
      case 1:
        return new Int8Array(capacity * this.dimensionality) as T;
      case 2:
        return new Int16Array(capacity * this.dimensionality) as T;
      case 4:
        return new Int32Array(capacity * this.dimensionality) as T;
      case 8:
        return new BigInt64Array(capacity * this.dimensionality) as T;
      default:
        throw new Error("Invalid bytes per value");
    }
  }

  add(entity: Entity, data: T): void {
    // convert data to array if it's a single object
    if (entity in this.sparseToDenseMapping) {
      throw new Error(`Entity ${entity} already exists in this store.`);
    }
    this.sparseToDenseMapping.set(entity, data);
  }

  set(entity: Entity, data: T): void {
    const denseIndex = this.sparseToDenseMapping.get(entity);
    if (denseIndex === undefined) {
      this.add(entity, data);
      return;
    }

    this.sparseToDenseMapping.set(entity, data);
  }

  get(entity: Entity): T | undefined {
    return this.sparseToDenseMapping.get(entity) as T | undefined;
  }

  remove(entity: Entity): void {
    const denseIndex = this.sparseToDenseMapping.delete(entity);
  }

  has(entity: Entity): boolean {
    return this.sparseToDenseMapping.has(entity);
  }

  forEach(callback: (entity: Entity, data: T, index: number) => void): void {
    let index = 0;
    for (const [entity, data] of this.sparseToDenseMapping.entries()) {
      callback(entity, data as T, index);
      index++;
    }
  }
}
