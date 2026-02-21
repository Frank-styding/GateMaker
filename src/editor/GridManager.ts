import { type Entity, Vector2D } from "../core";
import { NodeEntity } from "../Entities/NodeEntity";
import { fastFloor } from "./utils";

export class GridManager {
  private memory: Map<number, Entity[]> = new Map();

  static CELL_SIZE = 50;
  static get CELL_SIZE_INV() {
    return 1 / this.CELL_SIZE;
  }

  // Spatial hash function (low collision)
  private hash(x: number, y: number) {
    return ((x & 0xffff) << 16) | (y & 0xffff);
  }

  registerEntity(e: NodeEntity) {
    const inv = GridManager.CELL_SIZE_INV;
    const baseCol = fastFloor(e.pos.x * inv);
    const baseRow = fastFloor(e.pos.y * inv);

    const startCol =
      baseCol - (e.colSpan % 2 == 0 ? e.colSpan / 2 : (e.colSpan - 1) / 2);

    const startRow =
      baseRow - (e.rowSpan % 2 == 0 ? e.rowSpan / 2 : (e.rowSpan - 1) / 2);

    if (e._lastCol === baseCol && e._lastRow === baseRow) return;

    this.unregisterEntity(e);

    e._cells.length = 0;
    e._lastCol = baseCol;
    e._lastRow = baseRow;

    for (let i = 0; i < e.colSpan; i++) {
      for (let j = 0; j < e.rowSpan; j++) {
        const col = startCol + i;
        const row = startRow + j;
        const key = this.hash(col, row);

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

      // cleanup empty cells
      if (cell.length === 0) this.memory.delete(key);
    }

    e._cells.length = 0;
  }

  updateEntity(e: NodeEntity) {
    this.registerEntity(e);
  }

  queryPoint(x: number, y: number): Entity[] {
    const inv = GridManager.CELL_SIZE_INV;
    const col = fastFloor(x * inv);
    const row = fastFloor(y * inv);
    const key = this.hash(col, row);

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
        const cell = this.memory.get(this.hash(col, row));
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

    const halfCol = (e.colSpan - 1) >> 1;
    const halfRow = (e.rowSpan - 1) >> 1;

    for (let i = -halfCol; i <= halfCol; i++) {
      for (let j = -halfRow; j <= halfRow; j++) {
        const col = baseCol + i;
        const row = baseRow + j;
        const key = this.hash(col, row);

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
}
