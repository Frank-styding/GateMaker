import { AssetsManager } from "../core";

export function initGridPattern(ctx: CanvasRenderingContext2D, size = 50) {
  AssetsManager.setPatternContext(ctx);

  return AssetsManager.registerAsset("GRID", {
    width: size,
    height: size,
    pattern: true,
    builder: (ctx) => {
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#e0e0e0";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, size);
      ctx.moveTo(0, 0);
      ctx.lineTo(size, 0);
      ctx.stroke();
    },
  }) as CanvasPattern;
}
