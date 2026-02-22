// WireRouter.ts
import { Vector2D } from "../core";
import { GridManager } from "./GridManager";
import { hashPos } from "./utils";

type Node = {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent?: Node;
};
class MinHeap<T> {
  arr: T[] = [];
  constructor(private cmp: (a: T, b: T) => number) {}

  push(v: T) {
    this.arr.push(v);
    this.arr.sort(this.cmp);
  }
  pop() {
    return this.arr.shift();
  }
  isEmpty() {
    return this.arr.length === 0;
  }
}

export class WireRouter {
  static heuristic(a: Node, b: Node) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  static route(grid: GridManager, a: Vector2D, b: Vector2D): Vector2D[] {
    const start = grid.worldToGrid(a);
    const end = grid.worldToGrid(b);

    const open = new MinHeap<Node>((a, b) => a.f - b.f);
    const closed = new Set<number>();
    const gScore = new Map<number, number>();

    const startKey = hashPos(start.x, start.y);
    gScore.set(startKey, 0);

    open.push({ ...start, g: 0, h: 0, f: 0 });

    const MAX_ITER = 5000; // watchdog
    let iter = 0;

    while (!open.isEmpty()) {
      if (++iter > MAX_ITER) {
        console.warn("A* aborted: too many iterations");
        return [];
      }

      const cur = open.pop()!;
      const curKey = hashPos(cur.x, cur.y);

      if (cur.x === end.x && cur.y === end.y) {
        const path: Vector2D[] = [];
        let c: Node | undefined = cur;
        while (c) {
          path.push(grid.gridToWorld(c.x, c.y));
          c = c.parent;
        }
        return path.reverse();
      }

      closed.add(curKey);

      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];

      for (const [dx, dy] of dirs) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        const key = hashPos(nx, ny);

        if (!grid.isWalkable(nx, ny)) continue;
        if (closed.has(key)) continue;

        const tentativeG = cur.g + 1;
        const oldG = gScore.get(key);

        if (oldG !== undefined && tentativeG >= oldG) continue;

        gScore.set(key, tentativeG);

        const h = this.heuristic({ x: nx, y: ny } as any, end as Node);
        open.push({
          x: nx,
          y: ny,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: cur,
        });
      }
    }

    return [];
  }
  static simplifyPath(points: Vector2D[]) {
    const out = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const a = points[i - 1];
      const b = points[i];
      const c = points[i + 1];

      if ((a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y))
        continue;

      out.push(b);
    }

    out.push(points.at(-1)!);
    return out;
  }
}
