import { AABB } from "./AABB";
import type { MouseData } from "./MouseController";
import { Vector2D } from "./Vector";

interface RenderLayerProps {
  fullScreen?: boolean;
  custom?: { width: number; height: number };
}
export class RenderLayer {
  //* canvas
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  width!: number;
  height!: number;

  //* transform

  panX: number = 0;
  panY: number = 0;
  zoom: number = 1;
  minZoom: number = 0;
  maxZoom: number = 1;

  pattern: CanvasPattern | null = null;

  constructor(private props: RenderLayerProps = { fullScreen: true }) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    if (this.props.fullScreen) {
      this.resize(innerWidth - 4, innerHeight - 4);
    }
    if (this.props.custom) {
      this.width = this.props.custom.width;
      this.height = this.props.custom.height;
      this.resize(this.width, this.height);
    }
  }

  public setZoomLimits(min: number, max: number) {
    this.minZoom = min;
    this.maxZoom = max;
  }

  public resize(width: number, height: number) {
    const dpr = window.devicePixelRatio || 1;

    this.width = width;
    this.height = height;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";
  }

  public setPattern(pattern: CanvasPattern) {
    this.pattern = pattern;
  }

  public initResize() {
    window.addEventListener("resize", () => {
      this.resize(innerWidth - 4, innerHeight - 4);
    });
  }

  public initDisplay() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const matrix = new DOMMatrix()
      .translate(this.panX, this.panY)
      .scale(this.zoom);
    this.ctx.setTransform(matrix);
  }

  public drawGrid() {
    if (!this.pattern) return;
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    const matrix = new DOMMatrix()
      .translate(this.panX, this.panY)
      .scale(this.zoom);
    this.pattern.setTransform(matrix);
    this.ctx.fillStyle = this.pattern;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  public screenToWorld(
    p: Vector2D | { x: number; y: number },
    disablePan: boolean = false,
  ): Vector2D {
    return new Vector2D({
      x: (p.x - (disablePan ? 0 : this.panX)) / this.zoom,
      y: (p.y - (disablePan ? 0 : this.panY)) / this.zoom,
    });
  }

  public onDrag(mouseEvent: MouseData) {
    this.panX += mouseEvent.dx!;
    this.panY += mouseEvent.dy!;
  }

  public onZoom(mouseEvent: MouseData) {
    //* delta
    const zoomIntensity = 0.001;
    const delta = -mouseEvent.delta!;
    const zoomFactor = Math.exp(delta * zoomIntensity);
    //* update transform

    const worldBefore = this.screenToWorld(mouseEvent);
    const newZoom = this.zoom * zoomFactor;
    if (this.minZoom < newZoom && newZoom < this.maxZoom) {
      this.zoom *= zoomFactor;
      this.panX = mouseEvent.x - worldBefore.x * this.zoom;
      this.panY = mouseEvent.y - worldBefore.y * this.zoom;
    }
  }

  public getAABB() {
    const topLeft = this.screenToWorld({ x: 0, y: 0 });
    const bottomRight = this.screenToWorld({ x: this.width, y: this.height });

    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;

    return new AABB(
      width,
      height,
      new Vector2D(topLeft.x + width / 2, topLeft.y + height / 2),
    );
  }

  public getContext() {
    return this.ctx;
  }

  public getCanvas() {
    return this.canvas;
  }
}
