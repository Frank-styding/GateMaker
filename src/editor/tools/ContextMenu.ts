import { type MouseData, type Entity, MouseButton } from "../../core";
import type { ContextMenu } from "../ContextMenu";
import type { SelectionTool } from "./SelectionTool";
import type { Tool, ToolContext, ToolManager } from "./ToolManager";

export class ContextMenuTool implements Tool {
  lock: boolean = false;
  name: string = "context_menu";
  tools!: ToolManager;
  contextMenu!: ContextMenu;

  init(ctx: ToolContext): void {
    this.tools = ctx.tools;
    this.contextMenu = ctx.contextMenu;
    this.contextMenu.addOption({ name: "Delete" });
    this.contextMenu.buildContextMenu();
  }

  onDown(e: MouseData, hits?: Entity): void {
    if (e.button != MouseButton.RIGHT) return;
    if (this.tools.prev?.name == "wire") return;
    const selection = this.tools.tools.get("selection") as SelectionTool;
    console.log(selection.selectedNodes, selection.selectedWires);
    console.log("open context menu");
  }
}
