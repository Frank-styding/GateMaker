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
  openNodeCatalog: { x: number; y: number };
  closeNodeCatalog: any;
  loadNodes: any;
  addEntity: { node: Entity };
  [key: `on_context_${string}`]: {
    wires: Wire[];
    nodes: NodeEntity[];
    x: number;
    y: number;
  };
}

interface ProviderStruct {
  display: RenderLayer;
  grid: GridManager;
  root: Entity;
  tools: ToolManager;
}

export const AppEvents = new EventEmitter<EventStruct, ProviderStruct>();
