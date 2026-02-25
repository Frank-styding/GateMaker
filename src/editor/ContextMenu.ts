import { $ } from "../core/Element";
import type { NodeEntity } from "../Entities/NodeEntity";
import type { Wire } from "../Entities/Wire";
import { AppEvents } from "./Events";

export type ContextMenuOption = {
  name: string;
  id: string;
  color?: string;
  icon?: string;
};

export class ContextMenu {
  element: HTMLDivElement;
  options: ContextMenuOption[] = [];
  wires: Wire[] = [];
  nodes: NodeEntity[] = [];
  x!: number;
  y!: number;

  constructor() {
    this.element = $("div", { className: ["context-menu"] });

    AppEvents.on("setContextMenu", (options) => {
      this.setOptions(options);
      this.buildContextMenu();
    });

    AppEvents.on("openContextMenu", ({ x, y, wires, nodes }) => {
      this.setPos(x, y);

      this.wires = wires;
      this.nodes = nodes;
      this.show();
    });

    AppEvents.on("closeContextMenu", () => this.hide());
  }

  setPos(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.element.style.top = y + "px";
    this.element.style.left = x + "px";
  }

  show() {
    this.element.classList.add("open");
  }

  hide() {
    this.element.classList.remove("open");
  }

  createOption(optionData: ContextMenuOption) {
    return $(
      "div",
      {
        className: ["context-menu-option"],
        style: { color: optionData.color || "black" },
        events: {
          click: () => {
            AppEvents.emit(`on_context_${optionData.id}`, {
              wires: this.wires,
              nodes: this.nodes,
              x: this.x,
              y: this.y,
            });
            AppEvents.emit("closeContextMenu");
          },
        },
      },
      [$("span", { innerHTML: optionData.name })],
    );
  }

  buildContextMenu() {
    this.element.innerHTML = "";
    this.options.forEach((item) => {
      this.element.appendChild(this.createOption(item));
    });
  }

  setOptions(options: ContextMenuOption[]) {
    this.options.length = 0;
    options.map((i) => this.options.push(i));
  }

  addOption(options: ContextMenuOption) {
    this.options.push(options);
  }

  getElement() {
    return this.element;
  }
}
