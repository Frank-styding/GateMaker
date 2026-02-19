import { RenderLayer } from "./RenderLayer";
import { Entity } from "./Entity";
import { MouseController } from "./MouseController";
import { Vector2D } from "./Vector";

export class Engine {
  protected display!: RenderLayer;
  protected mouse!: MouseController;
  protected root!: Entity;

  constructor() {
    this.display = new RenderLayer();
    this.mouse = new MouseController(this.display.getCanvas());
    this.root = new Entity();
  }
  protected init() {}
  protected initEvents() {}

  public getRoot() {
    return this.root;
  }

  public getCanvas() {
    return this.display.getCanvas();
  }
  private entities: Entity[] = [];

  public start() {
    this.init();
    this.initEvents();
    this.display.initResize();
    const ctx = this.display.getContext();

    const loop = () => {
      const view = this.display.getAABB();
      this.entities.length = 0;
      Entity.collect(this.root, this.entities, (e) =>
        view.collideAABB(e.getAABB()),
      );

      for (const e of this.entities) e._init();
      for (let i = this.entities.length - 1; i >= 0; i--) {
        this.entities[i]._updateLayout();
      }
      this.display.initDisplay();
      this.update();
      this.draw(ctx);
      for (const e of this.entities) e._update();
      for (const e of this.entities) {
        e._draw(ctx);
      }
      requestAnimationFrame(loop);
    };
    loop();
  }
  protected update() {}
  protected draw(ctx: CanvasRenderingContext2D) {}
}
