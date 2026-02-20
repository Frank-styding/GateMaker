export type MouseData = {
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  sdX?: number;
  sdY?: number;
  delta?: number;
  button: number;
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

export enum MOUSE_BUTTONS {
  LEFT = 1,
  MIDDLE = 4,
  RIGHT = 2,
}
export class MouseController {
  private callbacks: EventsCallbacks = [];

  private isDragging = false;
  private lastMouse: { x: number; y: number } | null = null;
  private dragStart: { x: number; y: number } | null = null;

  constructor(private element: HTMLElement) {
    this.initEvents();
  }

  private getPos(e: MouseEvent) {
    const rect = this.element.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private initEvents() {
    // CLICK
    this.element.addEventListener("click", (e) => {
      const pos = this.getPos(e);
      this.emit("click", { ...pos, button: 0 });
    });

    // DOWN
    this.element.addEventListener("pointerdown", (e) => {
      const pos = this.getPos(e);

      this.isDragging = true;
      this.lastMouse = pos;
      this.dragStart = pos;

      this.element.setPointerCapture(e.pointerId);
      this.emit("down", { ...pos, button: e.buttons });
    });

    // UP
    this.element.addEventListener("pointerup", (e) => {
      const pos = this.getPos(e);

      this.isDragging = false;
      this.lastMouse = null;
      this.dragStart = null;

      this.element.releasePointerCapture(e.pointerId);
      this.emit("up", { ...pos, button: e.buttons });
    });

    // MOVE / DRAG
    this.element.addEventListener("pointermove", (e) => {
      const pos = this.getPos(e);

      if (this.isDragging && this.lastMouse && this.dragStart) {
        const dx = pos.x - this.lastMouse.x;
        const dy = pos.y - this.lastMouse.y;

        const sdX = pos.x - this.dragStart.x;
        const sdY = pos.y - this.dragStart.y;

        this.emit("drag", { ...pos, dx, dy, sdX, sdY, button: e.buttons });

        this.lastMouse = pos;
      } else {
        this.emit("move", { ...pos, button: e.buttons });
      }
    });

    // WHEEL
    this.element.addEventListener("wheel", (e) => {
      e.preventDefault();
      const pos = { ...this.getPos(e), delta: e.deltaY };
      this.emit("wheel", { ...pos, button: e.buttons });
    });

    // * block events
    this.element.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    this.element.addEventListener("dragstart", (e) => e.preventDefault());
    this.element.addEventListener("selectstart", (e) => e.preventDefault());
  }

  private emit(type: MouseEventType, pos: MouseData) {
    this.callbacks.filter((c) => c.type === type).forEach((c) => c.func(pos));
  }

  on(type: MouseEventType, func: MouseEventFunc) {
    this.callbacks.push({ type, func });
  }
}
