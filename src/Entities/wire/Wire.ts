// Wire.ts
import { Entity, LineCollider, Vector2D } from "../../core";
import { AppEvents } from "../../editor/Events";
import { GridManager } from "../../editor/GridManager";
import { WireRouter } from "./WireRouter";
import type { NodeEntity } from "../NodeEntity";
import { mouseInsideLine } from "../../core/colliders/mosueInsidePath";

export class Wire extends Entity {
  static LINE_HEIGHT: number = 12;

  public startNode!: NodeEntity;
  public endNode!: NodeEntity;
  public startPin!: string;
  public endPin!: string;
  public dirty = true;
  public startPos: Vector2D;
  public endPos: Vector2D;
  public path: Vector2D[];
  public points: Vector2D[];
  _cells: number[] = [];

  completed: boolean;
  constructor() {
    super();
    this.path = [];
    this.points = [];
    this.layerIdx = 0;
    this.startPos = new Vector2D();
    this.endPos = new Vector2D();
    this.completed = false;
  }

  protected init(): void {
    this.collider = new LineCollider(this.path, Wire.LINE_HEIGHT);
  }

  protected updateBounding(): void {
    if (this.path.length == 0) return;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let minY = Infinity;

    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (maxX < p.x) maxX = p.x;
      if (maxY < p.y) maxY = p.y;
      if (minX > p.x) minX = p.x;
      if (minY > p.y) minY = p.y;
    }
    const pad = Wire.LINE_HEIGHT / 2;
    this.bounding.width = maxX - minX + pad * 2;
    this.bounding.height = maxY - minY + pad * 2;
    this.bounding.pos.set((maxX + minX) / 2, (maxY + minY) / 2);
  }

  public translate(dx: number, dy: number) {
    for (let i = 1; i < this.points.length - 1; i++) {
      const p = this.points[i];
      p.x += dx;
      p.y += dy;
    }
    for (let i = 1; i < this.path.length - 1; i++) {
      const p = this.path[i];
      p.x += dx;
      p.y += dy;
    }
    const grid = AppEvents.get("grid") as GridManager;
    if (grid) {
      grid.unregisterWire(this);
      grid.registerWirePath(this, this.path);
    }
    this.markDirty();
  }

  public adjustPathToGrid() {
    for (let i = 1; i < this.points.length - 1; i++) {
      const p = this.points[i];
      Wire.adjustPosVector(p);
    }
    for (let i = 1; i < this.path.length - 1; i++) {
      const p = this.path[i];
      Wire.adjustPosVector(p);
    }
  }

  public startWire(node: NodeEntity, name: string, pos: Vector2D) {
    this.startNode = node;
    this.startPin = name;
    this.startPos.set(pos);
    this.endPos.set(pos);
    this.path.push(this.startPos);
    this.points.push(this.startPos);
  }

  public endWire(node: NodeEntity, name: string, pos: Vector2D) {
    this.endNode = node;
    this.endPin = name;
    this.endPos.set(pos);
    this.endNode.setWirePos(this.endPin, this, this.endPos);
    this.startNode.setWirePos(this.startPin, this, this.startPos);
    this.points.push(this.endPos);
    this.path.push(this.endPos);
    this.completed = true;
    this.recalc();
    this.points.length = 0;
  }

  public addPoint(pos: Vector2D) {
    GridManager.snap(pos);
    pos.x += GridManager.CELL_SIZE / 2;
    pos.y += GridManager.CELL_SIZE / 2;
    this.path.push(pos);
    this.points.push(pos);
  }

  public moveLastPoint(pos: Vector2D) {
    this.endPos.set(pos);
  }

  public updateLastSegments() {
    if (this.path.length <= 2) return;
    const a = this.path[this.path.length - 2];
    const b = this.path[1];

    if (this.endPos.y !== a.y) {
      a.y = this.endPos.y;
    }

    if (this.startPos.y != b.y) {
      b.y = this.startPos.y;
    }
  }

  public fixDiagonalSegments() {
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i];
      const b = this.path[i + 1];
      if (a.x === b.x || a.y === b.y) continue;
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      let p1: Vector2D;
      let p2: Vector2D;
      if (dx > dy) {
        p1 = new Vector2D(midX, a.y);
        p2 = new Vector2D(midX, b.y);
      } else {
        p1 = new Vector2D(a.x, midY);
        p2 = new Vector2D(b.x, midY);
      }
      this.path.splice(i + 1, 0, p1, p2);
      i += 2;
    }
  }

  public getSegment(pos: Vector2D) {
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i];
      const b = this.path[i + 1];
      if (mouseInsideLine(a, b, pos, Wire.LINE_HEIGHT)) {
        return i;
      }
    }
    return -1;
  }

  public moveSegment(idx: number, delta: Vector2D) {
    if (1 > idx || idx > this.path.length - 1) return;
    const a = this.path[idx];
    const b = this.path[idx + 1];

    if (a.x == b.x) {
      const d = new Vector2D(delta.x, 0);
      a.add(d);
      b.add(d);
    }

    if (a.y == b.y) {
      const d = new Vector2D(0, delta.y);
      a.add(d);
      b.add(d);
    }
    this.forceLayoutUpdate();
  }

  public adjustSegment(idx: number) {
    if (1 > idx || idx > this.path.length - 1) return;
    Wire.adjustPosVector(this.path[idx]);
    Wire.adjustPosVector(this.path[idx + 1]);
    this.forceLayoutUpdate();
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = Wire.LINE_HEIGHT;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "blue";

    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (i == 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    if (!this.completed) ctx.lineTo(this.endPos.x, this.endPos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = Wire.LINE_HEIGHT - 3;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#FFFFFF";
    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (i == 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    if (!this.completed) ctx.lineTo(this.endPos.x, this.endPos.y);

    ctx.stroke();
    ctx.restore();
  }

  public delete() {
    this.startNode.deleteWire(this.startPin);
    this.endNode.deleteWire(this.endPin);
    this.parent?.deleteChild(this);
    const grid = AppEvents.get("grid")!;
    grid.unregisterWire(this);
  }

  public getNodes() {
    return [this.startNode, this.endNode];
  }

  public recalc() {
    const grid = AppEvents.get("grid")!;
    grid.unregisterWire(this);
    if (this.points.length == 0) {
      this.points.push(this.startPos);
      this.points.push(this.endPos);
    }

    /*     const userPoints: Vector2D[] = this.points.map((p) => p); */
    let fullPath: Vector2D[] = [];

    for (let i = 0; i < this.points.length - 1; i++) {
      const from = this.points[i];
      const to = this.points[i + 1];

      // Dirección inicial solo en el primer tramo
      let startDir: Vector2D | undefined;
      if (i === 0) {
        startDir = new Vector2D(from.x > this.startNode.pos.x ? 1 : -1, 0);
      }

      // Dirección final solo en el último tramo
      let endDir: Vector2D | undefined;
      if (i === this.points.length - 2) {
        endDir = new Vector2D(to.x < this.endNode.pos.x ? -1 : 1, 0);
      }

      const segment = WireRouter.route(grid, from, to, startDir, this);

      if (segment.length === 0) continue;

      // Evitar duplicar el punto de unión
      if (i > 0) segment.shift();

      fullPath.push(...segment);
    }

    if (fullPath.length === 0) {
      fullPath = this.points;
    }
    grid.registerWirePath(this, fullPath);
    fullPath.unshift(this.startPos);
    fullPath.push(this.endPos);
    const simplified = WireRouter.simplifyPath(fullPath);
    this.path.length = 0;
    for (const p of simplified) this.path.push(p);
    this.markDirty();
  }

  static adjustPosVector(p: Vector2D) {
    const cellSize = GridManager.CELL_SIZE;
    p.y = Math.floor(p.y / cellSize) * cellSize;
    p.x = Math.floor(p.x / cellSize) * cellSize;
    p.x += cellSize / 2;
    p.y += cellSize / 2;
  }

  static adjustValue(x: number) {
    const cellSize = GridManager.CELL_SIZE;
    return Math.floor(x / cellSize) * cellSize + cellSize / 2;
  }
}
