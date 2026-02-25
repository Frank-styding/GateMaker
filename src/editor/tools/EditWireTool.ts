import { MouseButton, Vector2D, type Entity, type MouseData } from "../../core";
import { AppEvents } from "../Events";
import type { Tool } from "./ToolManager";

export class EditWireTool implements Tool {
  lock: boolean = false;
  name: string = "edit_wire";

  pos!: Vector2D;
  hit!: Entity;

  onDown(e: MouseData, hit?: Entity): void {
    /*     const isWire = hit instanceof Wire;
    if (!isWire || (isWire && e.button == MouseButton.RIGHT)) {
      AppEvents.emit("changeTool", { name: "selection" });
      AppEvents.get("tools")?.current?.onDown?.(e, hit); //! for initialize the selection tool
      return;
    }
    this.pos = new Vector2D(e);
    this.hit = hit;
    console.log(hit); */
  }

  onUp(e: MouseData): void {
    AppEvents.emit("changeTool", { name: "selection" });
    /*     if (e.x == this.pos.x && e.y == this.pos.y) {
      AppEvents.emit("changeTool", { name: "selection" });
      AppEvents.get("tools")?.current?.onDown?.(e, this.hit);
    } */
  }
}
