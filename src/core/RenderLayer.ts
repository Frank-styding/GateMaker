import type { MouseData } from "./MouseController";

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
    //this.createGridPattern();
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

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public setPattern(pattern: CanvasPattern) {
    this.pattern = pattern;
  }

  public initResize() {
    window.addEventListener("resize", () => {
      this.resize(innerWidth - 4, innerHeight - 4);
    });
  }

  public initDisplay(transform: boolean = true) {
    const dpr = window.devicePixelRatio || 1;
    if (transform) this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (transform) {
      const matrix = new DOMMatrix()
        .scale(dpr, dpr)
        .translate(this.panX, this.panY)
        .scale(this.zoom);
      this.ctx.setTransform(matrix);
    }
  }

  public drawGrid() {
    if (!this.pattern) return;
    const dpr = window.devicePixelRatio || 1;
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    const matrix = new DOMMatrix()
      .scale(dpr, dpr)
      .translate(this.panX, this.panY)
      .scale(this.zoom);
    this.pattern.setTransform(matrix);
    this.ctx.fillStyle = this.pattern;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  public screenToWorld(x: number, y: number): MouseData {
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (x / dpr - this.panX) / this.zoom,
      y: (y / dpr - this.panY) / this.zoom,
    };
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
    const mouseX = mouseEvent.x!;
    const mouseY = mouseEvent.y!;
    const worldBefore = this.screenToWorld(mouseX, mouseY);
    const newZoom = this.zoom * zoomFactor;
    if (this.minZoom < newZoom && newZoom < this.maxZoom) {
      this.zoom *= zoomFactor;
      this.panX = mouseX - worldBefore.x * this.zoom;
      this.panY = mouseY - worldBefore.y * this.zoom;
    }
  }

  public getContext() {
    return this.ctx;
  }

  public getCanvas() {
    return this.canvas;
  }
}
