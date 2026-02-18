import { BoxCollider, RenderLayer, Entity, Vector2D } from "../core";

export class $$Square extends Entity {
  private active: boolean = false;
  private subRenderLayer: RenderLayer;
  constructor(
    public width: number,
    public height: number,
  ) {
    super();
    this.subRenderLayer = new RenderLayer({});
  }

  protected init(): void {
    this.collider = new BoxCollider(this.width, this.height, this.pos);
    this.subRenderLayer.resize(this.width, this.height);
    const ctx = this.subRenderLayer.getContext();
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, this.width, this.height);
  }

  protected updateBounding(): void {
    this.bounding.width = this.width;
    this.bounding.height = this.height;
    this.bounding.pos = this.pos;
  }

  protected updateCollider(): void {
    (this.collider as BoxCollider).updateData(
      this.width,
      this.height,
      this.pos,
    );
  }

  public getChildren(): Entity[] {
    return [];
  }

  protected onMouseDown(pos: Vector2D): void {
    if (this.active) return;
    this.active = true;
    const ctx = this.subRenderLayer.getContext();
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, this.width, this.height);
  }

  protected onMouseUp(pos: Vector2D): void {
    if (!this.active) return;
    const ctx = this.subRenderLayer.getContext();
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, this.width, this.height);
    this.active = false;
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.drawImage(
      this.subRenderLayer.getCanvas(),
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    ctx.restore();
  }
}
