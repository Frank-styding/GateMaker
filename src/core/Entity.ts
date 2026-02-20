import { AABB } from "./AABB";
import { type Collider } from "./Collider";
import { uuid } from "./utils";
import { Vector2D } from "./Vector";

export class Entity {
  readonly id: string;
  protected children: Entity[];
  protected collider?: Collider;
  protected bounding: AABB;
  private dirtyLayout;
  private parent?: Entity;
  private isStarted = false;

  public layerIdx: number = 0;
  public debugMode = false;
  public pos: Vector2D;

  constructor() {
    this.id = uuid();
    this.children = [];
    this.pos = new Vector2D();
    this.bounding = new AABB();
    this.dirtyLayout = true;
  }

  public getCollider(): Collider | undefined {
    return this.collider;
  }
  public getAABB(): AABB {
    return this.bounding;
  }

  public _mouseUp(pos: Vector2D): void {
    this.onMouseUp(pos);
  }
  public _mouseDown(pos: Vector2D): void {
    this.onMouseDown(pos);
  }
  public _mouseMove(pos: Vector2D): void {
    this.onMouseMove(pos);
  }
  public _mouseClick(pos: Vector2D): void {
    this.onMouseClick(pos);
  }

  public addChild(entity: Entity): this {
    entity.parent = this;
    this.children.push(entity);
    this.markDirty();
    return this;
  }

  public removeChild(entity: Entity): this {
    const id = entity.id;
    this.children = this.children.filter((item) => item.id != id);
    return this;
  }

  protected onMouseDown(pos: Vector2D) {}
  protected onMouseUp(pos: Vector2D) {}
  protected onMouseClick(pos: Vector2D) {}
  protected onMouseMove(pos: Vector2D) {}
  protected init() {}
  protected update() {}
  protected updateCollider() {}
  protected render(ctx: CanvasRenderingContext2D) {}

  protected updateBounding() {
    this.bounding = Entity.calcBounding(this.children, this.pos);
  }

  public getChildren(): Entity[] {
    return this.children;
  }

  public markDirty(): void {
    if (this.dirtyLayout) return;
    this.dirtyLayout = true;
    this.parent?.markDirty();
  }

  public _render(ctx: CanvasRenderingContext2D): void {
    this.render(ctx);
    ctx.save();
    if (this.debugMode) {
      const { pos, width, height } = this.bounding;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "red"; // Color visible
      ctx.strokeRect(pos.x - width / 2, pos.y - height / 2, width, height);
      if (this.collider) {
        ctx.strokeStyle = "green";
        this.collider.draw(ctx);
      }
    }
    ctx.restore();
  }

  public _update(): void {
    this.update();
  }

  public _updateLayout(): void {
    if (this.dirtyLayout) {
      this.updateCollider();
      this.updateBounding();
      this.onDirty();
      this.dirtyLayout = false;
    }
  }
  protected onDirty() {}

  public _init(): void {
    if (this.isStarted) return;
    this.init();
    this.isStarted = true;
  }

  static collect(
    root: Entity,
    out: Entity[],
    func?: (item: Entity) => boolean,
  ) {
    const stack: Entity[] = [...root.getChildren()];

    while (stack.length) {
      const e = stack.pop()!;
      if (func != undefined) {
        if (!func(e)) {
          continue;
        }
      }
      out.push(e);

      const children = e.getChildren();
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]);
      }
    }
  }
  static calcBounding(children: Entity[], pos: Vector2D = new Vector2D()) {
    /*  const children = entity.children; */

    if (children.length === 0) {
      return new AABB(0, 0, /* entity. */ pos);
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < children.length; i++) {
      const b = children[i].bounding;
      if (b.left < minX) minX = b.left;
      if (b.top < minY) minY = b.top;
      if (b.right > maxX) maxX = b.right;
      if (b.bottom > maxY) maxY = b.bottom;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    return new AABB(
      width,
      height,
      new Vector2D(minX + width / 2, minY + height / 2),
    );
  }
}
