import { Entity, LineCollider, Vector2D } from "../core";
import { GridManager } from "../editor/GridManager";
import { WireRouter } from "../editor/WireRouter";
import type { NodeEntity } from "./NodeEntity";

export class Wire extends Entity {
  static LINE_HEIGHT: number = 14;

  public startNode!: NodeEntity;
  public endNode!: NodeEntity;
  public startPin!: string;
  public endPin!: string;
  public dirty = true;
  public startPos: Vector2D;
  public endPos: Vector2D;
  public path: Vector2D[];
  constructor() {
    super();
    this.path = [];
    this.layerIdx = 0;
    this.startPos = new Vector2D();
    this.endPos = new Vector2D();
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
  }

  public endWire(node: NodeEntity, name: string, pos: Vector2D) {
    this.endNode = node;
    this.endPin = name;
    this.endPos.set(pos);

    this.endNode.setWirePos(this.endPin, this);
    this.startNode.setWirePos(this.startPin, this);
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
    if (this.path.length > 0) {
      for (let i = 0; i < this.path.length; i++) {
        const p = this.path[i];
        if (i == 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
    } else {
      ctx.moveTo(this.startPos.x, this.startPos.y);
      ctx.lineTo(this.endPos.x, this.endPos.y);
    }
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

  recalc(grid: GridManager) {
    const a = this.startNode.getConnectorPos(this.startPin)!;
    const b = this.endNode.getConnectorPos(this.endPin)!;
    let path = WireRouter.route(grid, a as Vector2D, b as Vector2D);
    path = [a as Vector2D, ...path, b as Vector2D];
    path = WireRouter.simplifyPath(path);
    this.path.length = 0;
    for (const i of path) this.path.push(i);
    this.markDirty();
  }
}
