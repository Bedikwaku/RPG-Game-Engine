import { Component, Entity } from "../core/types";

export const RenderableComponentName = "renderable";
export interface RenderableData {
  color: string;
  width: number;
  height: number;
}

export class RenderableComponent implements Component<RenderableData> {
  private buffer: RenderableData[] = [];
  private entities: Entity[] = [];
  private sparse: Map<Entity, number> = new Map();
  private count = 0;

  add(entity: Entity, data: RenderableData): void {
    if (this.sparse.has(entity)) return;
    this.buffer.push(data);
    this.entities.push(entity);
    this.sparse.set(entity, this.count++);
  }

  get(entity: Entity): RenderableData | undefined {
    const index = this.sparse.get(entity);
    return index !== undefined ? this.buffer[index] : undefined;
  }

  remove(entity: Entity): void {
    const index = this.sparse.get(entity);
    if (index === undefined) return;

    const lastIndex = --this.count;
    if (index !== lastIndex) {
      // Swap with last
      this.buffer[index] = this.buffer[lastIndex];
      this.entities[index] = this.entities[lastIndex];
      this.sparse.set(this.entities[index], index);
    }

    this.buffer.pop();
    this.entities.pop();
    this.sparse.delete(entity);
  }

  forEach(
    callback: (entity: Entity, data: RenderableData, index: number) => void
  ): void {
    for (let i = 0; i < this.count; i++) {
      callback(this.entities[i], this.buffer[i], i);
    }
  }
}
