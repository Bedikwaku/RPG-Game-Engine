import {
  Entity,
  Component,
  ComponentData,
  TypedArray,
  Primitive,
} from "../core/types";
import { primitiveToNumber } from "../core/utils";

export class DenseComponent<T extends ComponentData> implements Component<T> {
  // A dense component, also known as a sparseset, utilizes dense array to store data in a
  // contiguous block of memory.
  private denseArray: TypedArray;
  private sparseToDenseMapping: Map<Entity, number> = new Map();
  private denseToSparseMapping: Entity[] = [];
  private _dimensionality: number;
  private keys: (keyof T)[];

  constructor(
    initialCapacity: number = 1024,
    bytesPerEntity: 1 | 2 | 4 | 8,
    keys: (keyof T)[]
  ) {
    this._dimensionality = keys ? keys.length : 1;
    this.keys = keys;
    if (initialCapacity <= 0) {
      throw new Error("Initial capacity must be greater than 0");
    }

    switch (bytesPerEntity) {
      case 1:
        this.denseArray = new Uint8Array(
          initialCapacity * this._dimensionality
        );
        break;
      case 2:
        this.denseArray = new Float16Array(
          initialCapacity * this._dimensionality
        );
        break;
      case 4:
        this.denseArray = new Float32Array(
          initialCapacity * this._dimensionality
        );
        break;
      case 8:
        this.denseArray = new Float64Array(
          initialCapacity * this._dimensionality
        );
      default:
        throw new Error("Invalid bytes per entity. Must be 1, 2, 4, or 8.");
        break;
    }
  }

  get dimensionality(): number {
    return this._dimensionality;
  }

  add(entity: Entity, data: T): void {
    // convert data to array if it's a single object
    const flattenedData = Object.values(data).flatMap((val): Primitive => {
      if (typeof val === "object") {
        throw new Error(
          `Data for entity ${entity} contains nested objects, which are not supported.`
        );
      }
      return val;
    });

    if (entity in this.sparseToDenseMapping) {
      throw new Error(`Entity ${entity} already exists in this store.`);
    }
    if (flattenedData.length !== this._dimensionality) {
      console.debug(`Data:`, flattenedData);
      throw new Error(
        `Data length ${flattenedData.length} does not match dimensionality ${this._dimensionality}.`
      );
    }
    // Store the data in the dense array
    const denseIndex = this.denseToSparseMapping.length;
    for (let i = 0; i < this._dimensionality; i++) {
      this.denseArray[denseIndex * this._dimensionality + i] =
        primitiveToNumber(flattenedData[i]);
    }
    // Update mappings
    this.denseToSparseMapping[denseIndex] = entity;
    this.sparseToDenseMapping.set(entity, denseIndex);
  }

  set(entity: Entity, data: T): void {
    const denseIndex = this.sparseToDenseMapping.get(entity);
    if (denseIndex === undefined) {
      this.add(entity, data);
      return;
    }
    // convert data to array if it's a single object
    const flattenedData = Object.values(data).flatMap((val): Primitive => {
      if (typeof val === "object") {
        throw new Error(
          `Data for entity ${entity} contains nested objects, which are not supported.`
        );
      }
      return val;
    });
    if (flattenedData.length !== this._dimensionality) {
      console.debug(`Data:`, flattenedData);
      throw new Error(
        `Data length ${flattenedData.length} does not match dimensionality ${this._dimensionality}.`
      );
    }
    // Store the data in the dense array
    for (let i = 0; i < this._dimensionality; i++) {
      this.denseArray[denseIndex * this._dimensionality + i] =
        primitiveToNumber(flattenedData[i]);
    }
  }

  get(entity: Entity): T | undefined {
    const denseIndex = this.sparseToDenseMapping.get(entity);
    if (denseIndex === undefined) {
      return undefined;
    }

    const start = denseIndex * this._dimensionality;

    const result: Partial<T> = {};

    for (let i = 0; i < this._dimensionality; i++) {
      const key = this.keys[i];
      result[key] = this.denseArray[start + i] as T[keyof T];
    }

    return result as T;
  }

  remove(entity: Entity): void {
    const denseIndex = this.sparseToDenseMapping.get(entity);
    if (denseIndex === undefined) {
      throw new Error(`Entity ${entity} does not exist in this store.`);
    }
    const lastIndex = this.denseToSparseMapping.length - this._dimensionality;
    if (denseIndex !== lastIndex) {
      // Swap with last
      // Ensure type compatibility for .set()
      const srcStart = lastIndex;
      const srcEnd = srcStart + this._dimensionality;
      const destStart = denseIndex;

      if (
        this.denseArray instanceof Float64Array ||
        this.denseArray instanceof BigInt64Array ||
        this.denseArray instanceof BigUint64Array
      ) {
        // For BigInt-based arrays, copy manually to avoid type errors
        for (let i = 0; i < this._dimensionality; i++) {
          (this.denseArray as any)[destStart + i] = (this.denseArray as any)[
            srcStart + i
          ];
        }
      } else {
        // Move data from end of dense array to the denseIndex
        this.denseArray.set(
          this.denseArray.subarray(srcStart, srcEnd),
          destStart
        );
      }
      // Update mapping frpm end of dense array to denseIndex
      this.sparseToDenseMapping.set(
        this.denseToSparseMapping[srcStart],
        destStart
      );
      // Update denseToSparseMapping
      this.denseToSparseMapping[denseIndex] =
        this.denseToSparseMapping[lastIndex];

      // Remove last entity
      this.denseToSparseMapping.pop();
      this.sparseToDenseMapping.delete(entity);
    }
  }

  has(entity: Entity): boolean {
    return this.sparseToDenseMapping.has(entity);
  }

  forEach(callback: (entity: Entity, data: T, index: number) => void): void {
    for (let i = 0; i < this.denseToSparseMapping.length; i++) {
      const entity = this.denseToSparseMapping[i];
      const data: ComponentData = {};
      Object.keys(data).forEach((key, index) => {
        if (index < this._dimensionality) {
          data[key] = this.denseArray[i * this._dimensionality + index];
        } else {
          throw new Error(
            `Data for entity ${entity} exceeds dimensionality ${this._dimensionality}.`
          );
        }
      });
      callback(entity, data as T, i);
    }
  }
}
