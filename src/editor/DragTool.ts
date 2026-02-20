import { Entity, Vector2D } from "../core";

export class DragTool {
  drag(items: Entity[], delta: Vector2D) {
    items.forEach((e) => {
      e.pos.add(delta);
      e.markDirty();
    });
  }
}
