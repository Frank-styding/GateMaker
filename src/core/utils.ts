export function uuid() {
  return crypto.randomUUID();
}

export function createImageFromCanvas(
  width: number,
  height: number,
  callback: (ctx: CanvasRenderingContext2D) => void,
) {
  const temp = document.createElement("canvas");
  const ctx = temp.getContext("2d")!;
  temp.width = width;
  temp.height = height;
  callback(ctx);
  const img = new Image(width, height);
  img.src = temp.toDataURL();
  return img;
}
