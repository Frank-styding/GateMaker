import { Entity, EventEmitter, RenderLayer } from "../core";
import type { NodeEntity } from "../Entities/NodeEntity";
import type { Wire } from "../Entities/Wire";
import type { ContextMenuOption } from "./ContextMenu";
import type { GridManager } from "./GridManager";
import type { ToolManager } from "./tools/ToolManager";

interface EventStruct {
  unLockTool: any;
  setContextMenu: ContextMenuOption[];
  openContextMenu: { x: number; y: number; wires: Wire[]; nodes: NodeEntity[] };
  closeContextMenu: any;
  [key: `on_context_${string}`]: { wires: Wire[]; nodes: NodeEntity[] };
}

interface ProviderStruct {
  display: RenderLayer;
  grid: GridManager;
  root: Entity;
  tools: ToolManager;
}

export const AppEvents = new EventEmitter<EventStruct, ProviderStruct>();
