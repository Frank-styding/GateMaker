import { Vector2D } from "../Vector";

export interface Collider {
  mouseIsInside(pos: Vector2D): boolean;
  draw(ctx: CanvasRenderingContext2D): void;
}
