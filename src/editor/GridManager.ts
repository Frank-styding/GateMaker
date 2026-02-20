import { Vector2D } from "../core";
import { NodeEntity } from "../Entities/NodeEntity";

export class GridManager {
  static snap(p: Vector2D) {
    const s = NodeEntity.CELL_SIZE;
    p.x = Math.floor(p.x / s) * s;
    p.y = Math.floor(p.y / s) * s;
  }
}
