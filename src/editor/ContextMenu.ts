import { EventEmitter } from "../core";

export type ContextMenuOption = {
  name: string;
  color?: string;
  icon?: string;
};

export class ContextMenu {
  element: HTMLDivElement;
  options: ContextMenuOption[] = [];
  events: EventEmitter<Record<string, any>>;

  constructor() {
    this.element = document.createElement("div");
    this.element.classList.add("context-menu", "open");
    this.events = new EventEmitter();
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
