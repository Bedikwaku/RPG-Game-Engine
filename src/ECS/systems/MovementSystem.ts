import {
  AccelerationComponentName,
  AccelerationData,
} from "../components/Acceleration";
import { PositionComponentName, PositionData } from "../components/Position";
import { VelocityData } from "../components/Velocity";
import { System, WorldLike, ComponentData } from "../core/types";

export class MovementSystem implements System {
  update(world: WorldLike, dt: number): void {
    const position = world.getComponent<PositionData>(PositionComponentName);
    const velocity = world.getComponent<VelocityData>(PositionComponentName);
    const acceleration = world.getComponent<AccelerationData>(
      AccelerationComponentName
    );

    for (let i = 0; i < dt; i++) {
      velocity.forEach((entity, vel) => {
        const pos = position.get(entity);
        if (!pos) return;

        pos.x += vel.x * dt;
        pos.y += vel.y * dt;

        position.add(entity, pos); // update in place
      });
    }
  }
}
