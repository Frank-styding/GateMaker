import {
  MouseButton,
  RenderLayer,
  Vector2D,
  type Entity,
  type MouseData,
} from "../../core";
import { Wire } from "../../Entities/wire/Wire";
import { AppEvents } from "../Events";
import type { Tool } from "./ToolManager";

export class EditWireTool implements Tool {
  lock: boolean = true;
  name: string = "edit_wire";

  pos!: Vector2D;
  hit!: Wire;

  segmentIdx!: number;
  display!: RenderLayer;
  init(): void {
    this.display = AppEvents.get("display")!;
  }

  onDown(e: MouseData, hit?: Entity): void {
    const v = this.display.screenToWorldVector(e)!;
    const isWire = hit instanceof Wire;
    if (!isWire || (isWire && e.button == MouseButton.RIGHT)) {
      AppEvents.emit("changeTool", { name: "selection" });
      AppEvents.get("tools")?.current?.onDown?.(e, hit); //! for initialize the selection tool
      return;
    }
    this.hit = hit!;
    this.segmentIdx = hit.getSegment(v);
  }

  onDrag(e: MouseData): void {
    const we = this.display.screenToWorld(e);
    this.hit?.moveSegment(this.segmentIdx, new Vector2D(we.dx, we.dy));
  }

  onUp(e: MouseData): void {
    this.hit.adjustSegment(this.segmentIdx);
    const tool = AppEvents.get("tools")!;
    tool?.use("selection");
    tool?.current?.onDown?.(e, this.hit);
  }
}
