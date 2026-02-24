import type { Vector2D } from "../Vector";

export function mouseInsideBox(
  center: Vector2D,
  p: Vector2D,
  halfW: number,
  halfH: number,
  angle: number = 0,
) {
  const v = p.clone().subtract(center).rotate(-angle);
  return -halfW <= v.x && v.x <= halfW && -halfH <= v.y && v.y <= halfH;
}
