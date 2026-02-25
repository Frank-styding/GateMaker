import type { Vector2D } from "../Vector";

export function mouseInsideLine(
  a: Vector2D,
  b: Vector2D,
  p: Vector2D,
  height: number
) {
  const r = height * 0.5;
  const r2 = r * r;
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  const vx = bx - ax;
  const vy = by - ay;
  const wx = p.x - ax;
  const wy = p.y - ay;
  const c1 = wx * vx + wy * vy;
  const c2 = vx * vx + vy * vy;
  let t = c1 / c2;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const projx = ax + t * vx;
  const projy = ay + t * vy;
  const dx = p.x - projx;
  const dy = p.y - projy;
  return dx * dx + dy * dy <= r2;
}

export function mouseInsidePath(p: Vector2D, path: Vector2D[], height: number) {
  for (let i = 0; i < path.length - 1; i++) {
    if (mouseInsideLine(path[i], path[i + 1], p, height)) return true;
  }
  return false;
}
