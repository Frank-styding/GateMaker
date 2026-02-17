export type IAsset = HTMLCanvasElement | HTMLImageElement;

type AssetConfig = {
  width?: number;
  height?: number;
  src?: string;
  image?: HTMLImageElement;
  builder?: (ctx: CanvasRenderingContext2D) => void;
};

export class AssetsManager {
  private constructor() {}
  static RECORD_ASSETS: Record<string, IAsset> = {};
  static addAsset(id: string, config: AssetConfig = {}) {
    if (this.RECORD_ASSETS[id]) {
      return this.RECORD_ASSETS[id];
    }
    const width = config.width || 100;
    const height = config.height || 100;

    if (config.builder) {
      const dpr = window.devicePixelRatio || 1;
      const canvas = document.createElement("canvas");
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      config.builder(ctx);
      this.RECORD_ASSETS[id] = canvas;
      return canvas;
    }
    if (config.src) {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Importante para evitar errores de CORS en canvas
      img.src = config.src!;

      img.onload = () => {
        this.RECORD_ASSETS[id] = img;
      };

      img.onerror = (e) => {
        console.error(`Error cargando asset ${id}:`, e);
      };
    }
    if (config.image) {
      this.RECORD_ASSETS[id] = config.image;
      return config.image;
    }
  }
  static get(id: string): IAsset | undefined {
    return this.RECORD_ASSETS[id];
  }
}
