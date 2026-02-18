import { AssetsManager, BoxCollider, Entity, Vector2D } from "../core";

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

export class $$Node extends Entity {
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

  //public cell_w!: number;
  //public cell_h!: number;
  //public width!: number;
  //public height!: number;
  //public nodeWidth!: number;
  //public nodeHeight!: number;
  //public node_name!: string;
  //public connectors: NodeConnector[] = [];
  //private layer!: HTMLCanvasElement;

  private layerDirty = true;

  protected updateBounding(): void {
    this.bounding.width = this.width;
    this.bounding.height = this.height;
    this.bounding.pos = this.pos;
  }

  protected updateCollider(): void {}

  protected init(): void {
    this.colSpan = 3;
    this.rowSpan = 3;
    const cW = $$Node.CONNECTION_WIDTH;
    const cH = $$Node.CONNECTION_HEIGHT;
    const cellSize = $$Node.CELL_SIZE;
    this.nodeName = "AND";

    this.pos.x += this.colSpan % 2 == 1 ? cellSize / 2 : 0;
    this.pos.y += this.rowSpan % 2 == 1 ? cellSize / 2 : 0;

    this.nodeHeight = cellSize * this.rowSpan;
    this.nodeWidth = cellSize * this.colSpan;

    this.width = this.nodeWidth;
    this.height = this.nodeHeight;

    this.collider = new BoxCollider(this.width, this.height, this.pos);

    this.connectors = [
      { name: "CD", direction: "left", idx: 0 },
      { name: "B", direction: "right", idx: 0 },
      { name: "ABC", direction: "right", idx: 2 },
      { name: "AB", direction: "bottom", idx: 2 },
      { name: "AB", direction: "top", idx: 0 },
      { name: "AB", direction: "top", idx: 1 },
      { name: "AB", direction: "top", idx: 2 },
    ];

    this.layer = AssetsManager.registerAsset(this.nodeName, {
      width: this.width,
      height: this.height,
      builder: (ctx) => {
        const { width, height } = ctx.canvas;
        const offset = 0;

        ctx.fillStyle = "#ECECEC";
        ctx.fillRect(offset, offset, width - offset * 2, height - offset * 2);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(offset, offset, width - offset * 2, height - offset * 2);

        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(this.nodeName, width / 2, height / 2);

        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.textBaseline = "middle";

        /*         for (let i = 0; i < this.connectors.length; i++) {
          const connection = this.connectors[i];
          const pinPos = 2 + cellSize / 2 + connection.idx * cellSize;
          if (connection.direction == "left") {
            ctx.fillRect(0, pinPos, cW, cH);
            ctx.textAlign = "left";
            ctx.fillText(connection.name, offset + 4, pinPos + cH / 2);
          }

          if (connection.direction == "right") {
            ctx.fillRect(width - cW, pinPos, cW, cH);
            ctx.textAlign = "right";
            ctx.fillText(connection.name, width - offset - 4, pinPos + cH / 2);
          }
          if (connection.direction == "top") {
            ctx.fillRect(pinPos, 0, cH, cW);
            ctx.textAlign = "center";
            ctx.fillText(connection.name, pinPos + cH / 2, offset + 12);
          }
          if (connection.direction == "bottom") {
            ctx.fillRect(pinPos, height - cW - 1, cH, cW);
            ctx.textAlign = "center";
            ctx.fillText(connection.name, pinPos + cH / 2, height - offset - 8);
          }
        } */
      },
    }) as HTMLCanvasElement;
  }

  public isInsideConnection(p: Vector2D) {
    const v = p.subtract(this.pos);
    const v1 = v.abs();
    const cW = $$Node.CONNECTION_WIDTH;
    const cH = $$Node.CONNECTION_HEIGHT;
    const cellSize = $$Node.CELL_SIZE;

    const getIdx = (value: number, maxIdx: number) => {
      let idx = Math.floor(value / cH);
      if (idx % 2 == 0) return undefined;
      idx = (idx - 1) / 2;
      if (idx < 0 || idx >= maxIdx) return undefined;
      return idx;
    };
    let direction: NodeConnector["direction"] = "top";
    let idx: number = -1;
    const horizontal = this.nodeWidth / 2 < v1.x && v1.x < this.width / 2;
    const vertical = this.nodeHeight / 2 < v1.y && v1.y < this.height / 2;
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
    const x =
      direction == "top" || direction == "bottom"
        ? this.pos.x - this.width / 2 + (idx * 2 + 1) * cH + cH / 2
        : direction == "left"
        ? this.pos.x - this.width / 2 + cW / 2
        : this.pos.x + this.width / 2 - cW / 2;

    const y =
      direction == "left" || direction == "right"
        ? this.pos.y - this.height / 2 + (idx * 2 + 1) * cH + cH / 2
        : direction == "top"
        ? this.pos.y + this.height / 2 - cW / 2
        : this.pos.y - this.height / 2 + cW / 2;

    console.log(x, y);
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.drawImage(this.layer, 0, 0, 150, 150);
    ctx.restore();
  }
}
