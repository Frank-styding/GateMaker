import {
  type MouseData,
  type Entity,
  MouseButton,
  EventEmitter,
} from "../../core";
import type { SelectionTool } from "./SelectionTool";
import type { Tool, ToolContext, ToolManager } from "./ToolManager";

export class ContextMenuTool implements Tool {
  lock: boolean = false;
  name: string = "context_menu";
  tools!: ToolManager;
  events!: EventEmitter<Record<string, any>>;

  init(ctx: ToolContext): void {
    this.tools = ctx.tools;
    this.events = ctx.events;
    ctx.events.emit("setContextMenu", [
      { name: "Copy" },
      { name: "Paste" },
      { name: "Delete", color: "red" },
    ]);
  }

  onDown(e: MouseData, hits?: Entity): void {
    if (e.button != MouseButton.RIGHT) {
      this.events.emit("closeContextMenu");
      return;
    }
    if (this.tools.prev?.name == "wire") return;
    const selection = this.tools.tools.get("selection") as SelectionTool;
    this.events.emit("openContextMenu", {
      x: e.x,
      y: e.y,
      wires: selection.selectedWires,
      nodes: selection.selectedNodes,
    });
  }
}
