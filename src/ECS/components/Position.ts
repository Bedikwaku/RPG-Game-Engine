import { DenseComponent } from "../storage/DenseComponent";

export interface PositionData {
  x: number;
  y: number;
}

const PositionDataTemplate: PositionData = {
  x: 0,
  y: 0,
};

export const PositionComponentName = "position";

export const PositionComponent = new DenseComponent<PositionData>(
  255,
  4,
  Object.keys(PositionDataTemplate) as (keyof PositionData)[]
);

// export class PositionComponent implements Component<PositionData> {
//   private buffer = new Float32Array(1024); // max 512 entities
//   private entities: Entity[] = [];
//   private sparse: Map<Entity, number> = new Map();
//   private count = 0;

//   add(entity: Entity, data: PositionData): void {
//     const index = this.count++;
//     this.buffer[index * 2] = data.x;
//     this.buffer[index * 2 + 1] = data.y;
//     this.entities[index] = entity;
//     this.sparse.set(entity, index);
//   }

//   get(entity: Entity): PositionData | undefined {
//     const index = this.sparse.get(entity);
//     if (index === undefined) return undefined;
//     return {
//       x: this.buffer[index * 2],
//       y: this.buffer[index * 2 + 1],
//     };
//   }

//   remove(entity: Entity): void {
//     const index = this.sparse.get(entity);
//     if (index === undefined) return;
//     const last = this.count - 1;

//     if (index !== last) {
//       // swap with last
//       this.buffer[index * 2] = this.buffer[last * 2];
//       this.buffer[index * 2 + 1] = this.buffer[last * 2 + 1];
//       this.entities[index] = this.entities[last];
//       this.sparse.set(this.entities[index], index);
//     }

//     this.sparse.delete(entity);
//     this.count--;
//   }

//   forEach(
//     callback: (entity: Entity, data: PositionData, index: number) => void
//   ): void {
//     for (let i = 0; i < this.count; i++) {
//       const entity = this.entities[i];
//       callback(
//         entity,
//         {
//           x: this.buffer[i * 2],
//           y: this.buffer[i * 2 + 1],
//         },
//         i
//       );
//     }
//   }
// }
