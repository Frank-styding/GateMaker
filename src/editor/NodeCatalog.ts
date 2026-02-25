import { $ } from "../core/Element";
import type { NodeEntity } from "../Entities/NodeEntity";
import { AppEvents } from "./Events";
import { GridManager } from "./GridManager";
import { NodeRecord } from "./NodeRecord";

export class NodeCatalog {
  private element: HTMLDivElement;
  private container!: HTMLDivElement;

  private nodes!: {
    node: typeof NodeEntity;
    img?: HTMLImageElement;
  }[];
  x!: number;
  y!: number;
  constructor() {
    this.element = this.buildCatalog();
    AppEvents.on("loadNodes", () => {
      this.nodes = NodeRecord.getNodes();
      this.loadItems();
    });
    AppEvents.on("closeNodeCatalog", () => {
      this.hide();
    });
    AppEvents.on("openNodeCatalog", ({ x, y }) => {
      this.open();
      this.setPos(x, y);
    });
  }

  setPos(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.element.style.top = y + "px";
    this.element.style.left = x + "px";
  }

  open() {
    this.element.classList.add("open");
  }

  hide() {
    this.element.classList.remove("open");
  }

  loadItems() {
    this.container.innerHTML = "";
    const size = 100;
    const onClick = (node: typeof NodeEntity) => {
      const item = new node();
      const v = AppEvents.get("display")!.screenToWorldVector({
        x: this.x,
        y: this.y,
      });
      item.pos.set(v);
      GridManager.snap(item.pos);
      AppEvents.emit("addEntity", { node: item });
      this.hide();
    };

    for (const node of this.nodes) {
      const { width, height } = node.img!;
      const scale = size / Math.max(width, height);
      node.img!.width *= scale;
      node.img!.height *= scale;

      this.container.appendChild(
        $(
          "div",
          { className: ["item"], events: { click: () => onClick(node.node) } },
          [
            $("div", { className: ["image-container"] }, [node.img!]),
            $("span", { innerHTML: node.node.CONFIG?.nodeName }),
          ],
        ),
      );
    }
  }

  buildCatalog() {
    this.container = $("div", { className: ["scroll"] }, []);

    const $container = $("div", { className: ["node-catalog"] }, [
      $("div", { className: ["header"] }, [$("input")]),
      $("div", { className: ["container"] }, [this.container]),
    ]);

    return $container;
  }

  getElement() {
    return this.element;
  }
}
