import type { MouseData } from "./MouseController";

interface RenderLayerProps {
  fullScreen?: boolean;
  custom?: { width: number; height: number };
}
export class RenderLayer {
  //* canvas
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private width!: number;
  private height!: number;

  //* transform

  private panX: number = 0;
  private panY: number = 0;
  private zoom: number = 1;

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

  public initResize() {
    window.addEventListener("resize", () => {
      this.resize(innerWidth - 4, innerHeight - 4);
    });
  }

  public initDisplay(transform: boolean = true) {
    const dpr = window.devicePixelRatio || 1;
    if (transform) this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (transform)
      this.ctx.setTransform(
        new DOMMatrix()
          .scale(dpr, dpr)
          .translate(this.panX, this.panY)
          .scale(this.zoom)
      );
  }

  public screenToWorld(x: number, y: number): MouseData {
    return {
      x: (x - this.panX) / this.zoom,
      y: (y - this.panY) / this.zoom,
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
    this.zoom *= zoomFactor;
    this.panX = mouseX - worldBefore.x * this.zoom;
    this.panY = mouseY - worldBefore.y * this.zoom;
  }

  public getContext() {
    return this.ctx;
  }

  public getCanvas() {
    return this.canvas;
  }
}
