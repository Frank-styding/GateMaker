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

  _mouseIsInside(pos: Vector2D): boolean {
    if (!this.collider) return false;
    const value = this.collider.mouseIsInside(pos);
    if (value) this.mouseIsInside(pos);
    return value;
  }

  addChild(entity: Entity) {
    entity.parent = this;
    this.children.push(entity);
    return this;
  }
  protected mouseIsInside(pos: Vector2D): boolean {
    return false;
  }
  protected start() {}
  protected update() {}
  protected updateCollider() {}
  protected draw(ctx: CanvasRenderingContext2D) {}
  protected updateBounding() {
    this.bounding = Entity.calcBounding(this);
  }

  getChildren() {
    return this.children;
  }

  markDirty() {
    this.dirtyLayout = true;
    this.parent?.markDirty();
  }

  _draw(ctx: CanvasRenderingContext2D) {
    const { pos, width, height } = this.bounding;
    ctx.strokeRect(pos.x - width / 2, pos.y - height / 2, width, height);
    this.draw(ctx);
  }

  _update() {
    this.update();
  }

  _updateLayout() {
    if (this.dirtyLayout) {
      this.updateCollider();
      this.updateBounding();
      this.dirtyLayout = false;
    }
  }

  _start() {
    if (this.isStarted) return;
    this.start();
    this.isStarted = true;
  }

  static traveler(
    entity: Entity | Entity[],
    func?: (item: Entity) => void | boolean,
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
      l1.push(item);
      if (value != false) {
        item.children.forEach((sub) => l.push(sub));
      }
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
      new Vector2D((minX + maxX) / 2, (minY + maxY) / 2),
    );
  }
}
