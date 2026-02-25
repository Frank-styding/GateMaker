// WireRouter.ts
import { Vector2D } from "../../core";
import { GridManager } from "../../editor/GridManager";
import { hashPos } from "../../editor/utils";
import type { Wire } from "./Wire";

type Node = {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  dx: number;
  dy: number;
  parent?: Node;
};

// Binary Heap optimizado (siempre mantiene el mínimo en la raíz)
class BinaryHeap<T> {
  private heap: T[] = [];

  constructor(private compare: (a: T, b: T) => number) {}

  push(item: T) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0 && bottom) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number) {
    const element = this.heap[index];
    while (index > 0) {
      const parentIdx = (index - 1) >> 1;
      const parent = this.heap[parentIdx];
      if (this.compare(element, parent) >= 0) break;
      this.heap[parentIdx] = element;
      this.heap[index] = parent;
      index = parentIdx;
    }
  }

  private sinkDown(index: number) {
    const length = this.heap.length;
    const element = this.heap[index];
    while (true) {
      let leftChildIdx = (index << 1) + 1;
      let rightChildIdx = leftChildIdx + 1;
      let swap: number | null = null;
      let leftChild, rightChild;

      if (leftChildIdx < length) {
        leftChild = this.heap[leftChildIdx];
        if (this.compare(leftChild, element) < 0) {
          swap = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        rightChild = this.heap[rightChildIdx];
        if (
          this.compare(rightChild, swap === null ? element : leftChild!) < 0
        ) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
  }
}

export class WireRouter {
  // Factor 1.001 para romper empates y preferir caminos rectos
  private static heuristic(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number {
    return (Math.abs(x1 - x2) + Math.abs(y1 - y2)) * 1.001;
  }

  // Direcciones: derecha, izquierda, abajo, arriba (para evitar crear arrays en cada iteración)
  private static readonly DIRS = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  static route(
    grid: GridManager,
    a: Vector2D,
    b: Vector2D,
    startDir?: Vector2D,
    currentWire?: Wire,
  ): Vector2D[] {
    const start = grid.worldToGrid(a);
    const end = grid.worldToGrid(b);

    // Caso trivial
    if (start.x === end.x && start.y === end.y) {
      return [grid.gridToWorld(start.x, start.y)];
    }

    const open = new BinaryHeap<Node>((a, b) => a.f - b.f);
    const gScore = new Map<number, number>(); // Mejor g conocida

    const startKey = hashPos(start.x, start.y);
    const startH = this.heuristic(start.x, start.y, end.x, end.y);
    const startNode: Node = {
      x: start.x,
      y: start.y,
      g: 0,
      h: startH,
      f: startH,
      dx: startDir?.x || 0,
      dy: startDir?.y || 0,
    };
    open.push(startNode);
    gScore.set(startKey, 0);

    const MAX_ITER = 6000;
    let iter = 0;
    const TURN_PENALTY = 20;

    while (!open.isEmpty()) {
      if (++iter > MAX_ITER) return [];

      const cur = open.pop()!;
      const curKey = hashPos(cur.x, cur.y);

      // Si llegamos al destino, reconstruimos el camino
      if (cur.x === end.x && cur.y === end.y) {
        const path: Vector2D[] = [];
        let node: Node | undefined = cur;
        while (node) {
          path.unshift(grid.gridToWorld(node.x, node.y));
          node = node.parent;
        }
        return path;
      }

      // Explorar vecinos
      for (const [dx, dy] of WireRouter.DIRS) {
        // No retroceder
        if (cur.dx === -dx && cur.dy === -dy) continue;

        const nx = cur.x + dx;
        const ny = cur.y + dy;
        const nKey = hashPos(nx, ny);

        const cellCost = grid.getCellCost(nx, ny, currentWire);
        if (cellCost === Infinity) continue;

        // Penalización por giro
        let moveCost = cellCost;
        if (cur.dx !== 0 || cur.dy !== 0) {
          if (cur.dx !== dx || cur.dy !== dy) {
            moveCost += TURN_PENALTY;
          }
        }

        const tentativeG = cur.g + moveCost;
        const oldG = gScore.get(nKey);

        // Si ya tenemos un camino mejor, ignoramos
        if (oldG !== undefined && tentativeG >= oldG) continue;

        gScore.set(nKey, tentativeG);
        const h = this.heuristic(nx, ny, end.x, end.y);
        const f = tentativeG + h;

        open.push({
          x: nx,
          y: ny,
          g: tentativeG,
          h,
          f,
          dx,
          dy,
          parent: cur,
        });
      }
    }
    return [];
  }

  static simplifyPath(points: Vector2D[]): Vector2D[] {
    if (points.length <= 2) return points;
    const out: Vector2D[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const a = points[i - 1];
      const b = points[i];
      const c = points[i + 1];

      // Si están alineados horizontal o verticalmente, saltamos el punto intermedio
      if ((a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y)) {
        continue;
      }
      out.push(b);
    }
    out.push(points[points.length - 1]);
    return out;
  }
}
