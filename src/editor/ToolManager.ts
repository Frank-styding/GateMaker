export type Tool = "none" | "drag" | "wire" | "selection";

export class ToolManager {
  current: Tool = "none";
}
