import { AssetsManager, BoxCollider, Entity, Vector2D } from "../core";
import type { Wire } from "./Wire";

export type NodeDirection = "left" | "top" | "right" | "bottom";

export type NodeConnector = {
  name: string;
  direction: NodeDirection;
  idx: number;
};

export interface NodeDefinition {
  name: string;
  cell_w: number;
  cell_h: number;
  connectors: NodeConnector[];
}

export class NodeEntity extends Entity {
  // Grid system
  static CELL_SIZE = 50;

  // Connector size
  static CONNECTION_WIDTH = this.CELL_SIZE / 2;
  static CONNECTION_HEIGHT = this.CELL_SIZE / 4;
  static PIN_MARGIN = 2;

  // Node data
  public colSpan!: number;
  public rowSpan!: number;
  public width!: number;
  public height!: number;
  public nodeWidth!: number;
  public nodeHeight!: number;
  public nodeName!: string;
  public connectors: NodeConnector[] = [];
  public layer!: HTMLCanvasElement;
  public showLabel: boolean = false;

  private wiresPos: Record<string, { pos: Vector2D; wire: Wire }[]> = {};

  constructor() {
    super();
    this.layerIdx = 1;
  }

  protected updateBounding(): void {
    this.bounding.width = this.width;
    this.bounding.height = this.height;
    this.bounding.pos = this.pos;
  }

  protected updateCollider(): void {}

  static adjustPos(node: NodeEntity) {
    const cellSize = NodeEntity.CELL_SIZE;
    node.pos.x += node.colSpan % 2 == 1 ? cellSize / 2 : 0;
    node.pos.y += node.rowSpan % 2 == 1 ? cellSize / 2 : 0;
  }

  protected init(): void {
    const cW = NodeEntity.CONNECTION_WIDTH;
    const cH = NodeEntity.CONNECTION_HEIGHT;
    const cellSize = NodeEntity.CELL_SIZE;

    this.pos.x += this.colSpan % 2 == 1 ? cellSize / 2 : 0;
    this.pos.y += this.rowSpan % 2 == 1 ? cellSize / 2 : 0;

    this.nodeHeight = cellSize * this.rowSpan;
    this.nodeWidth = cellSize * this.colSpan;

    this.width = this.nodeWidth + cH * 2;
    this.height = this.nodeHeight + cH * 2;

    this.collider = new BoxCollider(this.width, this.height, this.pos);

    this.layer = AssetsManager.registerAsset(this.nodeName, {
      width: this.width,
      height: this.height,
      builder: (ctx) => {
        const { width, height } = ctx.canvas;
        const offset = cH;

        ctx.fillStyle = "#ECECEC";
        ctx.fillRect(offset, offset, width - offset * 2, height - offset * 2);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(offset, offset, width - offset * 2, height - offset * 2);

        if (this.showLabel) {
          ctx.font = "24px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "black";
          ctx.fillText(this.nodeName, width / 2, height / 2);
        }

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textBaseline = "middle";

        for (let i = 0; i < this.connectors.length; i++) {
          const connection = this.connectors[i];
          const pinPos = cH * 2 + connection.idx * cellSize;
          if (connection.direction == "left") {
            ctx.fillRect(0, pinPos, cH, cW);
            ctx.textAlign = "left";
            ctx.fillText(connection.name, offset + 4, pinPos + cW / 2 + 2);
          }
          if (connection.direction == "right") {
            ctx.fillRect(width - cH, pinPos, cH, cW);
            ctx.textAlign = "right";
            ctx.fillText(
              connection.name,
              width - offset - 4,
              pinPos + cW / 2 + 2,
            );
          }
          if (connection.direction == "top") {
            ctx.fillRect(pinPos, 0, cW, cH);
            ctx.textAlign = "center";
            ctx.fillText(connection.name, pinPos + cW / 2, offset + 10);
          }
          if (connection.direction == "bottom") {
            ctx.fillRect(pinPos, height - cH - 1, cW, cH);
            ctx.textAlign = "center";
            ctx.fillText(connection.name, pinPos + cW / 2, height - offset - 8);
          }
        }
      },
    }) as HTMLCanvasElement;
  }

  public isInside(p: Vector2D) {
    const v = p.clone().subtract(this.pos);
    const v1 = v.abs();
    const cW = NodeEntity.CONNECTION_WIDTH;
    const cH = NodeEntity.CONNECTION_HEIGHT;
    const getIdx = (value: number, maxIdx: number) => {
      let idx = Math.floor(value / cW);
      if (idx % 2 == 0) return undefined;
      idx = (idx - 1) / 2;
      if (idx < 0 || idx >= maxIdx) return undefined;
      return idx;
    };
    let direction: NodeConnector["direction"] = "top";
    let idx: number = -1;
    const horizontal = this.nodeWidth / 2 < v1.x && v1.x < this.width / 2;
    const vertical = this.nodeHeight / 2 < v1.y && v1.y < this.height / 2;
    if (this.nodeWidth / 2 > v1.x && this.nodeHeight / 2 > v1.y) {
      return { type: "box", x: this.pos.x, y: this.pos.y };
    }

    if (!horizontal && !vertical) return undefined;

    if (vertical) {
      const a = getIdx(v.x + this.width / 2, this.colSpan);
      if (a == undefined) return;
      if (v.y < 0) direction = "top";
      else direction = "bottom";
      idx = a;
    }

    if (horizontal) {
      const a = getIdx(v.y + this.height / 2, this.rowSpan);
      if (a == undefined) return;
      if (v.x < 0) direction = "left";
      else direction = "right";
      idx = a;
    }

    const item = this.connectors.filter(
      (item) => item.idx == idx && item.direction == direction,
    )[0];
    if (!item) return undefined;

    const x =
      direction == "top" || direction == "bottom"
        ? this.pos.x - this.width / 2 + (idx * 2 + 1) * cW + cW / 2
        : direction == "left"
          ? this.pos.x - this.width / 2 + cH / 2
          : this.pos.x + this.width / 2 - cH / 2;

    const y =
      direction == "left" || direction == "right"
        ? this.pos.y - this.height / 2 + (idx * 2 + 1) * cW + cW / 2
        : direction == "top"
          ? this.pos.y + this.height / 2 - cH / 2
          : this.pos.y - this.height / 2 + cH / 2;

    return { type: "connector", x, y, name: item.name };
  }

  public getConnectoPos(name: string) {
    const value = this.connectors.find((item) => item.name == name);
    if (!value) return undefined;
    const { direction, idx } = value;
    const cW = NodeEntity.CONNECTION_WIDTH;
    const cH = NodeEntity.CONNECTION_HEIGHT;

    const x =
      direction == "top" || direction == "bottom"
        ? this.pos.x - this.width / 2 + (idx * 2 + 1) * cW + cW / 2
        : direction == "left"
          ? this.pos.x - this.width / 2 + cH / 2
          : this.pos.x + this.width / 2 - cH / 2;

    const y =
      direction == "left" || direction == "right"
        ? this.pos.y - this.height / 2 + (idx * 2 + 1) * cW + cW / 2
        : direction == "top"
          ? this.pos.y + this.height / 2 - cH / 2
          : this.pos.y - this.height / 2 + cH / 2;

    return { x, y };
  }

  public setWirePos(name: string, wirePos: Vector2D, wire: Wire) {
    this.wiresPos[name] ??= [];
    this.wiresPos[name].push({ pos: wirePos, wire: wire });
  }

  public onDirty(): void {
    for (const item in this.wiresPos) {
      const p = this.getConnectoPos(item);
      this.wiresPos[item].forEach((item) => {
        item.pos.set(p);
        item.wire.markDirty();
      });
    }
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.drawImage(
      this.layer,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    ctx.restore();
  }
}
