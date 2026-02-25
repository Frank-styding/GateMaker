import { type Entity, Vector2D } from "../core";
import { NodeEntity } from "../Entities/NodeEntity";
import type { Wire } from "../Entities/Wire";
import { fastFloor, hashPos } from "./utils";

export class GridManager {
  memory: Map<number, Entity[]> = new Map();
  wireMemory: Map<number, Set<Wire>> = new Map();
  static CELL_SIZE = 50;
  static get CELL_SIZE_INV() {
    return 1 / this.CELL_SIZE;
  }

  // Spatial hash function (low collision)

  registerEntity(e: NodeEntity) {
    const inv = GridManager.CELL_SIZE_INV;
    const baseCol = fastFloor(e.pos.x * inv);
    const baseRow = fastFloor(e.pos.y * inv);

    const startCol =
      baseCol -
      (e.config.colSpan % 2 == 0
        ? e.config.colSpan / 2
        : (e.config.colSpan - 1) / 2);
    const startRow =
      baseRow -
      (e.config.rowSpan % 2 == 0
        ? e.config.rowSpan / 2
        : (e.config.rowSpan - 1) / 2);

    if (e._lastCol === baseCol && e._lastRow === baseRow) return;

    this.unregisterEntity(e);

    e._cells.length = 0;
    e._lastCol = baseCol;
    e._lastRow = baseRow;

    for (let i = 0; i < e.config.colSpan; i++) {
      for (let j = 0; j < e.config.rowSpan; j++) {
        const col = startCol + i;
        const row = startRow + j;
        const key = hashPos(col, row);

        let cell = this.memory.get(key);
        if (!cell) {
          cell = [];
          this.memory.set(key, cell);
        }

        cell.push(e);
        e._cells.push(key);
      }
    }
  }
  unregisterEntity(e: NodeEntity) {
    for (const key of e._cells) {
      const cell = this.memory.get(key);
      if (!cell) continue;

      const idx = cell.indexOf(e);
      if (idx !== -1) cell.splice(idx, 1);

      if (cell.length === 0) this.memory.delete(key);
    }
    e._cells.length = 0;
  }

  public getCellCost(col: number, row: number, currentWire?: Wire): number {
    if (!this.isWalkable(col, row)) return Infinity;

    let cost = 10; // BASE_COST

    // Padding suave: +5 de costo por estar tocando el perímetro de un nodo
    const paddingDirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [dx, dy] of paddingDirs) {
      if (!this.isWalkable(col + dx, row + dy)) {
        cost += 5;
        break; // Solo multar una vez
      }
    }

    // Costo por cruzar otro cable
    const key = hashPos(col, row);
    const wiresInCell = this.wireMemory.get(key);
    if (wiresInCell && wiresInCell.size > 0) {
      if (
        !currentWire ||
        !wiresInCell.has(currentWire) ||
        wiresInCell.size > 1
      ) {
        cost += 50;
      }
    }

    return cost;
  }

  updateEntity(e: NodeEntity) {
    this.registerEntity(e);
  }

  queryPoint(x: number, y: number): Entity[] {
    const inv = GridManager.CELL_SIZE_INV;
    const col = fastFloor(x * inv);
    const row = fastFloor(y * inv);
    const key = hashPos(col, row);
    return this.memory.get(key) ?? [];
  }

  queryRect(x: number, y: number, w: number, h: number): Entity[] {
    const inv = GridManager.CELL_SIZE_INV;

    const minCol = fastFloor(x * inv);
    const minRow = fastFloor(y * inv);
    const maxCol = fastFloor((x + w) * inv);
    const maxRow = fastFloor((y + h) * inv);

    const result = new Set<Entity>();

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const cell = this.memory.get(hashPos(col, row));
        if (!cell) continue;
        for (const e of cell) result.add(e);
      }
    }

    return [...result];
  }

  public isOccupied(e: NodeEntity): boolean {
    const inv = GridManager.CELL_SIZE_INV;
    const baseCol = fastFloor(e.pos.x * inv);
    const baseRow = fastFloor(e.pos.y * inv);

    const halfCol = (e.config.colSpan - 1) >> 1;
    const halfRow = (e.config.rowSpan - 1) >> 1;

    for (let i = -halfCol; i <= halfCol; i++) {
      for (let j = -halfRow; j <= halfRow; j++) {
        const col = baseCol + i;
        const row = baseRow + j;
        const key = hashPos(col, row);

        const cell = this.memory.get(key);
        if (!cell) continue;

        // Si hay otra entidad distinta
        for (const other of cell) {
          if (other !== e) return true;
        }
      }
    }

    return false;
  }
  registerWirePath(wire: Wire, path: Vector2D[]) {
    this.unregisterWire(wire); // Limpiar el rastro anterior primero

    for (const p of path) {
      const { x: col, y: row } = this.worldToGrid(p);
      const key = hashPos(col, row);

      let cellWires = this.wireMemory.get(key);
      if (!cellWires) {
        cellWires = new Set();
        this.wireMemory.set(key, cellWires);
      }
      cellWires.add(wire);

      // Guardamos las claves en el cable para poder borrarlo rápido después
      wire._cells = wire._cells || [];
      wire._cells.push(key);
    }
  }

  unregisterWire(wire: Wire) {
    if (!wire._cells) return;
    for (const key of wire._cells) {
      const cellWires = this.wireMemory.get(key);
      if (cellWires) {
        cellWires.delete(wire);
        if (cellWires.size === 0) this.wireMemory.delete(key);
      }
    }
    wire._cells.length = 0;
  }

  public isWalkable(col: number, row: number): boolean {
    const key = hashPos(col, row);
    const cell = this.memory.get(key);
    return !cell || cell.length === 0;
  }

  public worldToGrid(p: Vector2D) {
    const inv = GridManager.CELL_SIZE_INV;
    return {
      x: fastFloor(p.x * inv),
      y: fastFloor(p.y * inv),
    };
  }

  public gridToWorld(x: number, y: number) {
    const s = GridManager.CELL_SIZE;
    return new Vector2D(x * s + s / 2, y * s + s / 2);
  }

  static snap(p: Vector2D) {
    const s = this.CELL_SIZE;
    const inv = this.CELL_SIZE_INV;

    const gx = fastFloor(p.x * inv);
    const gy = fastFloor(p.y * inv);

    p.x = gx * s;
    p.y = gy * s;
  }

  static snapNearest(p: Vector2D) {
    const s = this.CELL_SIZE;
    p.x = Math.round(p.x / s) * s;
    p.y = Math.round(p.y / s) * s;
  }

  static snapCenter(p: Vector2D) {
    const s = this.CELL_SIZE;
    p.x = (Math.floor(p.x / s) + 0.5) * s;
    p.y = (Math.floor(p.y / s) + 0.5) * s;
  }

  public recalcWiresOptimized(wires: Wire[], grid: GridManager) {
    for (const wire of wires) {
      grid.unregisterWire(wire);
    }

    // 2. Ordenamos los cables de menor a mayor distancia
    wires.sort((a, b) => {
      const posA1 = a.startNode.getConnectorPos(a.startPin);
      const posA2 = a.endNode.getConnectorPos(a.endPin);

      const posB1 = b.startNode.getConnectorPos(b.startPin);
      const posB2 = b.endNode.getConnectorPos(b.endPin);

      // Fallback de seguridad por si algún pin no existe
      if (!posA1 || !posA2 || !posB1 || !posB2) return 0;

      // Distancia Manhattan (más rápida de calcular que la Euclidiana)
      const distA = Math.abs(posA1.x - posA2.x) + Math.abs(posA1.y - posA2.y);
      const distB = Math.abs(posB1.x - posB2.x) + Math.abs(posB1.y - posB2.y);

      if (distA < distB) return -1;
      if (distA > distB) return 1;

      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    });

    for (const wire of wires) {
      wire.recalc();
      wire.forceLayoutUpdate();
    }
  }
}
