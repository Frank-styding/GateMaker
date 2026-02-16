import { Display } from "./Display";
import { Entity } from "./Entity";
import { MouseController } from "./MouseController";
import { Vector2D } from "./Vector";

export class Engine {
  private display!: Display;
  private mouse!: MouseController;
  private root!: Entity;

  constructor() {
    this.display = new Display();
    this.mouse = new MouseController(this.display.getCanvas());
    this.root = new Entity(); // root
    this.initEvents();
  }

  protected initEvents() {
    this.mouse.on("drag", (e) => {
      this.display.onDrag(e);
    });

    this.mouse.on("wheel", (e) => {
      this.display.onZoom(e);
    });

    this.mouse.on("down", (e) => {
      const mousePos = this.display.screenToWorld(e.x, e.y);
      const p = new Vector2D(mousePos.x, mousePos.y);
      const hits: Entity[] = [];
      Entity.traveler(this.root.getChildren(), (e) => {
        if (e._mouseIsInside(p)) {
          hits.push(e);
          return true;
        } else {
          return false;
        }
      });
    });
  }

  public getRoot() {
    return this.root;
  }

  public getCanvas() {
    return this.display.getCanvas();
  }

  public start() {
    this.display.initResize();
    const ctx = this.display.getContext();

    const loop = () => {
      let l = Entity.traveler(this.root);
      l.map((item) => item._start());
      this.display.initDisplay();
      const rev = l.slice().reverse();
      rev.forEach((item) => item._updateLayout());
      l.forEach((item) => item._update());
      this.update();
      l.forEach((item) => item._draw(ctx));
      this.draw(ctx);
      requestAnimationFrame(loop);
    };
    loop();
  }

  protected update() {}
  protected draw(ctx: CanvasRenderingContext2D) {}
}
