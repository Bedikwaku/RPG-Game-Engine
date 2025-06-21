import { MoistureData } from "@src/engine/ecs/components/Moisture";
import { DiffusionSystem } from "./DiffusionSystem";

export class MoistureDiffusionSystem extends DiffusionSystem<MoistureData> {}
