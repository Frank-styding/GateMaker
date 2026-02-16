export type MouseData = {
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  delta?: number;
};

export type MouseEventType =
  | "click"
  | "down"
  | "move"
  | "up"
  | "drag"
  | "wheel";

export type MouseEventFunc = (pos: MouseData) => void;

type EventsCallbacks = {
  type: MouseEventType;
  func: MouseEventFunc;
}[];

export class MouseController {
  private callbacks: EventsCallbacks = [];
  private isDragging = false;
  private lastMouse: MouseData | null = null;

  constructor(private element: HTMLElement) {
    this.initEvents();
  }

  private getPos(e: MouseEvent) {
    const rect = this.element.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private initEvents() {
    this.element.addEventListener("click", (e) => {
      const pos = this.getPos(e);
      this.callbacks.filter((i) => i.type == "click").map((i) => i.func(pos));
    });

    this.element.addEventListener("pointerdown", (e) => {
      const pos = this.getPos(e);
      this.isDragging = true;
      this.lastMouse = pos;
      this.callbacks.filter((i) => i.type == "down").map((i) => i.func(pos));
    });

    this.element.addEventListener("pointerup", (e) => {
      const pos = this.getPos(e);
      this.isDragging = false;
      this.lastMouse = null;
      this.callbacks.filter((i) => i.type == "up").map((i) => i.func(pos));
    });

    this.element.addEventListener("pointermove", (e) => {
      const pos = this.getPos(e);
      if (this.isDragging && this.lastMouse) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.callbacks
          .filter((i) => i.type == "drag")
          .map((i) => i.func({ ...pos, dx, dy }));
        this.lastMouse = { x: e.clientX, y: e.clientY };
      } else {
        this.callbacks.filter((i) => i.type == "move").map((i) => i.func(pos));
      }
    });

    this.element.addEventListener("wheel", (e) => {
      const pos = { ...this.getPos(e), delta: e.deltaY };
      this.callbacks.filter((i) => i.type == "wheel").map((i) => i.func(pos));
    });
  }

  on(type: MouseEventType, func: MouseEventFunc) {
    this.callbacks.push({ type, func });
  }
}
