import { Vector2D } from "../core";
import { NodeEntity } from "../Entities/NodeEntity";
import { Wire } from "../Entities/Wire";

export class WireTool {
  current: {
    wire: Wire;
    startNode: NodeEntity;
    startName: string;
  } | null = null;

  start(node: NodeEntity, name: string, pos: Vector2D) {
    const wire = new Wire([pos, pos.clone()]);
    this.current = { wire, startNode: node, startName: name };
  }

  addPos(pos: Vector2D) {
    this.current?.wire.path.push(pos);
  }

  finish(node: NodeEntity, name: string, pos: Vector2D, root: any) {
    if (!this.current) return;

    const { wire, startNode, startName } = this.current;

    startNode.setWirePos(startName, wire.path[0], wire);
    const lastPos = wire.path[wire.path.length - 1];
    lastPos.set(pos);
    node.setWirePos(name, lastPos, wire);
    root.addChild(wire);
    this.current = null;
  }
}
