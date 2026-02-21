import { MouseButton, type MouseData, type RenderLayer } from "../../core";
import type { Tool, ToolContext } from "./ToolManager";

export class CameraTool implements Tool {
  name: string = "camera";
  lock: boolean = false;
  display!: RenderLayer;
  init(ctx: ToolContext): void {
    this.display = ctx.display;
  }
  onDrag(e: MouseData): void {
    if (e.button !== MouseButton.MIDDLE) return;
    this.display.onDrag(e);
  }
  onWheel(e: MouseData): void {
    this.display.onZoom(e);
  }
}
