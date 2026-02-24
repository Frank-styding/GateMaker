import type { Vector2D } from "../Vector";

export function mosueInsidePath(p: Vector2D, path: Vector2D[], height: number) {
  const r = height * 0.5;
  const r2 = r * r;

  const px = p.x;
  const py = p.y;

  for (let i = 0; i < path.length - 1; i++) {
    const ax = path[i].x;
    const ay = path[i].y;
    const bx = path[i + 1].x;
    const by = path[i + 1].y;
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;
    const c1 = wx * vx + wy * vy;
    const c2 = vx * vx + vy * vy;
    let t = c1 / c2;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    const projx = ax + t * vx;
    const projy = ay + t * vy;
    const dx = px - projx;
    const dy = py - projy;
    if (dx * dx + dy * dy <= r2) return true;
  }

  return false;
}
