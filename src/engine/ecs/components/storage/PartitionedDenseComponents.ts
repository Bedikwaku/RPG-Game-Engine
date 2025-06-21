import { Component, ComponentData, Entity } from "@src/engine/core/types";
import { DenseComponent } from "./DenseComponent";

const GLOBAL_PARTITION = -1;

export class PartitionedDenseComponent<T extends ComponentData>
  implements Component<T>
{
  private partitions: Map<number, DenseComponent<T>> = new Map();
  private initialCapacity: number;
  private bytesPerEntity: 1 | 2 | 4 | 8;
  private keys: (keyof T)[];
  constructor(
    initialCapacity: number = 1024,
    bytesPerEntity: 1 | 2 | 4 | 8,
    keys: (keyof T)[],
    partitionKey: number = -1
  ) {
    this.initialCapacity = initialCapacity;
    this.bytesPerEntity = bytesPerEntity;
    this.keys = keys;
    this.partitions.set(
      partitionKey,
      new DenseComponent<T>(initialCapacity, bytesPerEntity, keys)
    );
  }

  add(entity: Entity, data: T, partition: number = GLOBAL_PARTITION): void {
    // We will use GLOBAL_PARTITION as a kind of global partition
    if (!this.partitions.has(partition)) {
      this.partitions.set(
        partition,
        new DenseComponent<T>(
          this.initialCapacity,
          this.bytesPerEntity,
          this.keys
        )
      );
    }
    const partitionedComponent = this.partitions.get(partition)!;
    partitionedComponent.add(entity, data);
  }

  set(entity: Entity, data: T, partition = GLOBAL_PARTITION): void {
    if (!this.partitions.has(partition)) {
      throw new Error(`Partition ${partition} does not exist.`);
    }
    const partitionedComponent = this.partitions.get(partition)!;
    partitionedComponent.set(entity, data);
  }
  get(entity: Entity, partition = GLOBAL_PARTITION): T | undefined {
    // For partition = GLOBAL_PARTITION, we will need to check all partitions
    if (partition === GLOBAL_PARTITION) {
      for (const [key, partitionedComponent] of this.partitions.entries()) {
        if (partitionedComponent.has(entity)) {
          return partitionedComponent.get(entity);
        }
      }
      return undefined;
    }
    if (!this.partitions.has(partition)) {
      throw new Error(`Partition ${partition} does not exist.`);
    }
    const partitionedComponent = this.partitions.get(partition)!;
    return partitionedComponent.get(entity);
  }
  remove(entity: Entity, partition = GLOBAL_PARTITION): void {
    if (partition === GLOBAL_PARTITION) {
      for (const [key, partitionedComponent] of this.partitions.entries()) {
        if (partitionedComponent.has(entity)) {
          partitionedComponent.remove(entity);
          return;
        }
      }
      throw new Error(`Entity ${entity} does not exist in any partition.`);
    }
    if (!this.partitions.has(partition)) {
      throw new Error(`Partition ${partition} does not exist.`);
    }
    const partitionedComponent = this.partitions.get(partition)!;
    if (!partitionedComponent.has(entity)) {
      throw new Error(
        `Entity ${entity} does not exist in partition ${partition}.`
      );
    }
    partitionedComponent.remove(entity);
  }
  has(entity: Entity, partition = GLOBAL_PARTITION): boolean {
    if (partition === GLOBAL_PARTITION) {
      for (const [key, partitionedComponent] of this.partitions.entries()) {
        if (partitionedComponent.has(entity)) {
          return true;
        }
      }
      return false;
    }
    const partitionedComponent = this.partitions.get(partition);
    if (!partitionedComponent) {
      return false;
    }
    return partitionedComponent.has(entity);
  }
  forEach(callback: (entity: Entity, data: T, index: number) => void): void {
    // Iterate over all partitions and call the callback for each entity
    for (const [
      partitionKey,
      partitionedComponent,
    ] of this.partitions.entries()) {
      partitionedComponent.forEach((entity, data, index) => {
        callback(entity, data, index);
      });
    }
  }
  forEachPartition(
    partition: number,
    callback: (entity: Entity, data: T, index: number) => void
  ): void {
    const component = this.partitions.get(partition);
    if (!component) {
      throw new Error(`Partition ${partition} does not exist.`);
    }
    component.forEach((entity: Entity, data: T, index: number) => {
      callback(entity, data, index);
    });
  }

  getPartition(partition: number): DenseComponent<T> | undefined {
    return this.partitions.get(partition);
  }
}
