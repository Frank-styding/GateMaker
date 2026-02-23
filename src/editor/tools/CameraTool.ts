import { MouseButton, type MouseData, type RenderLayer } from "../../core";
import { AppEvents } from "../Events";
import type { Tool } from "./ToolManager";

export class CameraTool implements Tool {
  name: string = "camera";
  lock: boolean = false;
  display!: RenderLayer;

  init(): void {
    this.display = AppEvents.get("display")!;
  }

  onDrag(e: MouseData): void {
    if (e.button !== MouseButton.MIDDLE) return;
    const we = this.display.screenToWorld(e);
    this.display.onDrag(we);
  }

  onWheel(e: MouseData): void {
    this.display.onZoom(e);
  }
}
