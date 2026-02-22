import { RenderLayer } from "./RenderLayer";
import { Entity } from "./Entity";
import { MouseController } from "./MouseController";

export class Engine {
  protected display!: RenderLayer;
  protected mouse!: MouseController;
  protected root!: Entity;

  private fps = 0;
  private frames = 0;
  private lastTime = performance.now();
  private fpsText = "FPS: 0";

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

    const loop = (time: number) => {
      this.entities.length = 0;
      this.getEntities();
      for (const e of this.entities) {
        if (e.isStarted) continue;
        e._init();
        this.onInitEntity(e);
      }
      for (let i = this.entities.length - 1; i >= 0; i--) {
        this.entities[i]._updateLayout();
      }
      this.display.initDisplay();

      this.frames++;
      if (time - this.lastTime >= 1000) {
        this.fps = this.frames;
        this.frames = 0;
        this.lastTime = time;
        this.fpsText = `FPS: ${this.fps}`;
      }

      this.update();
      this.render(ctx);
      for (const e of this.entities) e._update();
      for (const e of this.entities) e._render(ctx);
      this.renderAfter(ctx);
      this.drawFPS(ctx);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  private drawFPS(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = "14px monospace";
    ctx.fillStyle = "lime";
    ctx.textBaseline = "top";
    ctx.fillText(this.fpsText, 10, 10);
    ctx.restore();
  }
  protected getEntities() {
    const view = this.display.getAABB();
    Entity.collect(
      this.root,
      this.entities,
      (e) => view.collideAABB(e.getAABB()) && !e.hide,
    );
    this.entities.sort((a, b) => a.layerIdx - b.layerIdx);
  }
  protected onInitEntity(e: Entity) {}
  protected update() {}
  protected render(ctx: CanvasRenderingContext2D) {}
  protected renderAfter(ctx: CanvasRenderingContext2D) {}
}
