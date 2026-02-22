// WireRouter.ts
import { Vector2D } from "../core";
import type { Wire } from "../Entities/Wire";
import { GridManager } from "./GridManager";
import { hashPos } from "./utils";

type Node = {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  dx: number; // Dirección X actual
  dy: number; // Dirección Y actual
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

  static route(
    grid: GridManager,
    a: Vector2D,
    b: Vector2D,
    startDir?: Vector2D,
    endDir?: Vector2D,
    currentWire?: Wire,
  ): Vector2D[] {
    const start = grid.worldToGrid(a);
    const end = grid.worldToGrid(b);

    const open = new MinHeap<Node>((a, b) => a.f - b.f);
    const closed = new Set<number>();
    const gScore = new Map<number, number>();

    const startKey = hashPos(start.x, start.y);
    gScore.set(startKey, 0);

    // Iniciamos empujando en la dirección del stub para evitar que vuelva hacia atrás
    open.push({
      ...start,
      g: 0,
      h: 0,
      f: 0,
      dx: startDir?.x || 0,
      dy: startDir?.y || 0,
    });

    const MAX_ITER = 5000;
    let iter = 0;

    const TURN_PENALTY = 20; // Penalización media para evitar zig-zags, pero permitir maniobras

    while (!open.isEmpty()) {
      if (++iter > MAX_ITER) return [];

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
        // Evitar que el cable intente devolverse por donde vino
        if (cur.dx === -dx && cur.dy === -dy) continue;

        const nx = cur.x + dx;
        const ny = cur.y + dy;
        const key = hashPos(nx, ny);

        const cellCost = grid.getCellCost(nx, ny, currentWire);
        if (cellCost === Infinity) continue;
        if (closed.has(key)) continue;

        let movementCost = cellCost;

        // Penalización por giro simple (Ya no hay penalización extra de pin)
        if (cur.dx !== 0 || cur.dy !== 0) {
          if (cur.dx !== dx || cur.dy !== dy) {
            movementCost += TURN_PENALTY;
          }
        }

        const tentativeG = cur.g + movementCost;
        const oldG = gScore.get(key);

        if (oldG !== undefined && tentativeG >= oldG) continue;

        gScore.set(key, tentativeG);
        const h = this.heuristic(
          { x: nx, y: ny } as Node,
          { x: end.x, y: end.y } as Node,
        );

        open.push({
          x: nx,
          y: ny,
          g: tentativeG,
          h,
          f: tentativeG + h,
          dx,
          dy,
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
