import type { Vector2D } from "./Vector";

export function mouseIsInsideCircle(
  center: Vector2D,
  p: Vector2D,
  radius: number,
) {
  return p.clone().subtract(center).length() < radius;
}
