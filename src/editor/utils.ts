export const fastFloor = (x: number) => (x >= 0 ? x | 0 : Math.floor(x));
export const hashPos = (x: number, y: number) =>
  ((x & 0xffff) << 16) | (y & 0xffff);
