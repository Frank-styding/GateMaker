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
    this.initEvents();
  }

  protected initEvents() {
    //this.mouse.on("drag", (e) => {
    //  this.display.onDrag(e);
    //});
    //
    //this.mouse.on("wheel", (e) => {
    //  this.display.onZoom(e);
    //});
    //let hits: Entity[];
    //
    //this.mouse.on("down", (e) => {
    //  const mousePos = this.display.screenToWorld(e.x, e.y);
    //  const p = new Vector2D(mousePos.x, mousePos.y);
    //
    //  hits = Entity.traveler(this.root.getChildren(), {
    //    func: (e) => e.getAABB().mouseIsInside(p),
    //  }).filter((item) => item.getCollider()?.mouseIsInside(p));
    //
    //  hits.map((item) => item._mouseDown(p));
    //});
    //
    //this.mouse.on("up", (e) => {
    //  const mousePos = this.display.screenToWorld(e.x, e.y);
    //  const p = new Vector2D(mousePos.x, mousePos.y);
    //  hits.map((item) => item._mouseUp(p));
    //});
    //
    //this.mouse.on("move", (e) => {
    //  const mousePos = this.display.screenToWorld(e.x, e.y);
    //  const p = new Vector2D(mousePos.x, mousePos.y);
    //  hits.map((item) => item._mouseMove(p));
    //});
    //this.mouse.on("click", (e) => {
    //  const mousePos = this.display.screenToWorld(e.x, e.y);
    //  const p = new Vector2D(mousePos.x, mousePos.y);
    //  Entity.traveler(this.root, {
    //    func: (e) => e.getAABB().mouseIsInside(p),
    //    reverse: true,
    //  }).map((item) => item._mouseClick(p));
    //});
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
