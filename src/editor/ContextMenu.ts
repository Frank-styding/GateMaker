import { EventEmitter } from "../core";
import type { NodeEntity } from "../Entities/NodeEntity";
import type { Wire } from "../Entities/Wire";

export type ContextMenuOption = {
  name: string;
  color?: string;
  icon?: string;
};

export class ContextMenu {
  element: HTMLDivElement;
  options: ContextMenuOption[] = [];
  events: EventEmitter<Record<string, any>>;
  wires: Wire[] = [];
  nodes: NodeEntity[] = [];

  constructor(events: EventEmitter<Record<string, any>>) {
    this.element = document.createElement("div");
    this.element.classList.add("context-menu");
    this.events = events;

    events.on("setContextMenu", (options) => {
      this.setOptions(options);
      this.buildContextMenu();
    });

    events.on("openContextMenu", ({ x, y, wires, nodes }) => {
      this.setPos(x, y);
      this.wires = wires;
      this.nodes = nodes;
      this.show();
    });

    events.on("closeContextMenu", () => {
      this.hide();
    });
  }

  setPos(x: number, y: number) {
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
    const option = document.createElement("div");
    option.classList.add("context-menu-option");
    option.style.color = optionData.color || "black";
    option.innerHTML = `
    <label>${optionData.name}</label>
    `;
    option.addEventListener("click", () => {
      this.events.emit(optionData.name, optionData);
    });
    return option;
  }

  buildContextMenu() {
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
