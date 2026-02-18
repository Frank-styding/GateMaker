export type IAsset = HTMLCanvasElement | HTMLImageElement | CanvasPattern;

type AssetConfig = {
  width?: number;
  height?: number;
  src?: string;
  image?: HTMLImageElement;
  pattern?: boolean;
  builder?: (ctx: CanvasRenderingContext2D) => void;
};

export class AssetsManager {
  private constructor() {}

  private static RECORD_ASSETS: Record<string, IAsset> = {};

  // Context global para patterns (puedes inyectar el tuyo)
  private static PATTERN_CTX: CanvasRenderingContext2D | null = null;

  static setPatternContext(ctx: CanvasRenderingContext2D) {
    this.PATTERN_CTX = ctx;
  }

  static addAsset(id: string, config: AssetConfig = {}) {
    if (this.RECORD_ASSETS[id]) return this.RECORD_ASSETS[id];

    const width = config.width || 100;
    const height = config.height || 100;

    // ================= CANVAS BUILDER =================
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

      // --------- PATTERN MODE ---------
      if (config.pattern) {
        if (!this.PATTERN_CTX) {
          throw new Error(
            "Pattern context not set. Use AssetsManager.setPatternContext(ctx)",
          );
        }

        const pattern = this.PATTERN_CTX.createPattern(canvas, "repeat")!;
        this.RECORD_ASSETS[id] = pattern;
        return pattern;
      }

      // normal canvas asset
      this.RECORD_ASSETS[id] = canvas;
      return canvas;
    }

    // ================= IMAGE SRC =================
    if (config.src) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = config.src;

      img.onload = () => {
        this.RECORD_ASSETS[id] = img;
      };

      img.onerror = (e) => {
        console.error(`Error cargando asset ${id}:`, e);
      };

      return img;
    }

    // ================= RAW IMAGE =================
    if (config.image) {
      this.RECORD_ASSETS[id] = config.image;
      return config.image;
    }
  }

  static get(id: string): IAsset | undefined {
    return this.RECORD_ASSETS[id];
  }
}
