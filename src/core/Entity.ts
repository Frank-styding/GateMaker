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

  pos: Vector2D;

  constructor() {
    this.id = uuid();
    this.children = [];
    this.pos = new Vector2D();
    this.bounding = new AABB();
    this.dirtyLayout = true;
  }

  //public _isMouseInside(pos: Vector2D): boolean {
  //  if (!this.collider) return false;
  //  return this.collider.mouseIsInside(pos);
  //}

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
    return this;
  }
  protected onMouseDown(pos: Vector2D) {}
  protected onMouseUp(pos: Vector2D) {}
  protected onMouseClick(pos: Vector2D) {}
  protected onMouseMove(pos: Vector2D) {}
  protected start() {}
  protected update() {}
  protected updateCollider() {}
  protected draw(ctx: CanvasRenderingContext2D) {}
  protected updateBounding() {
    this.bounding = Entity.calcBounding(this);
  }

  public getChildren(): Entity[] {
    return this.children;
  }

  public markDirty(): void {
    this.dirtyLayout = true;
    this.parent?.markDirty();
  }

  public _draw(ctx: CanvasRenderingContext2D): void {
    const { pos, width, height } = this.bounding;
    ctx.strokeRect(pos.x - width / 2, pos.y - height / 2, width, height);
    this.draw(ctx);
  }

  public _update(): void {
    this.update();
  }

  public _updateLayout(): void {
    if (this.dirtyLayout) {
      this.updateCollider();
      this.updateBounding();
      this.dirtyLayout = false;
    }
  }

  public _start(): void {
    if (this.isStarted) return;
    this.start();
    this.isStarted = true;
  }

  static traveler(
    entity: Entity | Entity[],
    func?: (item: Entity) => void | boolean
  ) {
    const l: Entity[] = [];
    const l1: Entity[] = [];
    if (!Array.isArray(entity)) {
      l.push(entity);
    } else {
      l.push(...entity);
    }
    while (l.length > 0) {
      const item = l.shift();
      if (!item) continue;
      const value = func?.(item);
      if (value == false) continue;
      l1.push(item);
      item.children.forEach((sub) => l.push(sub));
    }
    return l1;
  }

  static calcBounding(entity: Entity) {
    const l = [...entity.children];
    let i = 0;
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;
    while (i < l.length) {
      const item = l[i++];
      const b = item.bounding;

      minX = Math.min(minX, b.left);
      minY = Math.min(minY, b.top);
      maxX = Math.max(maxX, b.right);
      maxY = Math.max(maxY, b.bottom);
      l.push(...item.children);
    }
    if (minX === Infinity) return new AABB(0, 0, entity.pos);
    return new AABB(
      maxX - minX,
      maxY - minY,
      new Vector2D((minX + maxX) / 2, (minY + maxY) / 2)
    );
  }
}
