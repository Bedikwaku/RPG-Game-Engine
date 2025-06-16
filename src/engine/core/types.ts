export type Entity = number;

export type Primitive = string | number | boolean | bigint | symbol;

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Float16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

// Interface for raw component data (used as type constraint).
export interface ComponentData {
  // Marker interface – extend with real fields in concrete components
  [key: string]: any;
}

// Interface for a Component store.
// Generic storage: sparse, packed, etc.
export interface Component<T extends ComponentData = any> {
  add(entity: Entity, data: T): void;
  set(entity: Entity, data: T): void;
  get(entity: Entity): T | undefined;
  remove(entity: Entity): void;
  has(entity: Entity): boolean;
  forEach(callback: (entity: Entity, data: T, index: number) => void): void;
}

// Base interface for systems that operate on the ECS world.
export interface System {
  update(world: WorldLike, dt: number): void;
}

// Define the shape of the World that systems expect (decouples systems from concrete implementation).
export interface WorldLike {
  getComponent<T extends ComponentData>(name: string): Component<T>;
  createEntity(entities: Set<Entity>): Entity;
  destroyEntity(entities: Set<Entity>, entity: Entity): void;
}
