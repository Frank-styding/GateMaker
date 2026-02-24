import { Entity, LineCollider, Vector2D } from "../core";
import { AppEvents } from "../editor/Events";
import { GridManager } from "../editor/GridManager";
import { WireRouter } from "../editor/WireRouter";
import type { NodeEntity } from "./NodeEntity";

function makeStub(pos: Vector2D, dir: Vector2D, distance: number) {
  return new Vector2D(pos.x + dir.x * distance, pos.y + dir.y * distance);
}

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

  protected updateCollider(): void {}
  protected render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = Wire.LINE_HEIGHT;
    ctx.lineJoin = "round";

    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (i == 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    if (!this.completed) ctx.lineTo(this.endPos.x, this.endPos.y);
    ctx.stroke();
    ctx.restore();
  }

  static adjustPos(p: Vector2D) {
    const cellSize = GridManager.CELL_SIZE;
    p.y = Math.floor(p.y / cellSize) * cellSize;
    p.x = Math.floor(p.x / cellSize) * cellSize;
    p.x += cellSize / 2;
    p.y += cellSize / 2;
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

    const userPoints: Vector2D[] = this.points.map((p) => p.clone());
    let fullPath: Vector2D[] = [];

    for (let i = 0; i < userPoints.length - 1; i++) {
      const from = userPoints[i];
      const to = userPoints[i + 1];

      // Dirección inicial solo en el primer tramo
      let startDir: Vector2D | undefined;
      if (i === 0) {
        startDir = new Vector2D(from.x > this.startNode.pos.x ? 1 : -1, 0);
      }

      // Dirección final solo en el último tramo
      let endDir: Vector2D | undefined;
      if (i === userPoints.length - 2) {
        endDir = new Vector2D(to.x < this.endNode.pos.x ? -1 : 1, 0);
      }

      const segment = WireRouter.route(grid, from, to, startDir, endDir, this);

      if (segment.length === 0) continue;

      // Evitar duplicar el punto de unión
      if (i > 0) segment.shift();

      fullPath.push(...segment);
    }

    if (fullPath.length === 0) {
      fullPath = userPoints;
    }
    grid.registerWirePath(this, fullPath);
    const simplified = WireRouter.simplifyPath(fullPath);
    this.path.length = 0;
    this.path.push(this.startPos);
    for (const p of simplified) this.path.push(p);
    this.path.push(this.endPos);
    this.markDirty();
  }
}
