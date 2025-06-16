import {
  PositionComponent,
  PositionComponentName,
} from "../components/Position";
import { System, WorldLike } from "../../core/types";

export class RenderSystem implements System {
  update(world: WorldLike, dt: number): void {
    console.warn("RenderSystem is not implemented yet.");
    // This system would typically handle rendering entities
    const positions = world.getComponent(PositionComponentName);
  }
}
