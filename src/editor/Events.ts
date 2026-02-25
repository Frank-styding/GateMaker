import { Entity, EventEmitter, RenderLayer } from "../core";
import type { NodeEntity } from "../Entities/NodeEntity";
import type { Wire } from "../Entities/wire/Wire";
import type { ContextMenuOption } from "./ContextMenu";
import type { GridManager } from "./GridManager";
import type { ToolManager } from "./tools/ToolManager";

interface EventStruct {
  //* tools
  unLockTool: any;
  resetTool: any;
  changeTool: { name: string };
  //*  context menu
  [key: `on_context_${string}`]: {
    wires: Wire[];
    nodes: NodeEntity[];
    x: number;
    y: number;
  };
  setContextMenu: ContextMenuOption[];
  openContextMenu: { x: number; y: number; wires: Wire[]; nodes: NodeEntity[] };
  closeContextMenu: any;
  openNodeCatalog: { x: number; y: number };
  closeNodeCatalog: any;
  //* app events
  loadNodes: any;
  addEntity: { node: Entity };
}

interface ProviderStruct {
  display: RenderLayer;
  grid: GridManager;
  root: Entity;
  tools: ToolManager;
}

export const AppEvents = new EventEmitter<EventStruct, ProviderStruct>();
