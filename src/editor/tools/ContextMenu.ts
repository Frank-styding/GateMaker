import { type MouseData, type Entity, MouseButton } from "../../core";
import type { NodeEntity } from "../../Entities/NodeEntity";
import type { Wire } from "../../Entities/Wire";
import type { ContextMenuOption } from "../ContextMenu";
import { AppEvents } from "../Events";
import type { SelectionTool } from "./SelectionTool";
import type { Tool, ToolManager } from "./ToolManager";

export class ContextMenuTool implements Tool {
  lock: boolean = false;
  name: string = "context_menu";
  tools!: ToolManager;

  init(): void {
    this.tools = AppEvents.get("tools")!;
  }

  getOptions(wires: Wire[], nodes: NodeEntity[]) {
    const options: ContextMenuOption[] = [];
    if (wires.length > 0 && nodes.length == 0) {
      options.push({ name: "Edit", id: "edit_wire" });
    }

    if (wires.length > 0 || nodes.length > 0) {
      options.push({ name: "Copy", id: "copy" });
      options.push({ name: "Delete", id: "delete", color: "red" });
    }
    return options;
  }

  onDown(e: MouseData): void {
    if (e.button != MouseButton.RIGHT) {
      AppEvents.emit("closeContextMenu");
      return;
    }
    if (this.tools.prev?.name == "wire") return;
    const selection = this.tools.tools.get("selection") as SelectionTool;
    const options = this.getOptions(
      selection.selectedWires,
      selection.selectedNodes,
    );
    if (options.length == 0) {
      AppEvents.emit("closeContextMenu");
      return;
    }

    AppEvents.emit("setContextMenu", options);
    AppEvents.emit("openContextMenu", {
      x: e.x,
      y: e.y,
      wires: selection.selectedWires,
      nodes: selection.selectedNodes,
    });
  }
}
