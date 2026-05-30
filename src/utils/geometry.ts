export interface PointLike {
  x: number;
  y: number;
}

export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getDistance(a: PointLike, b: PointLike): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function normalizeRect(start: PointLike, end: PointLike): RectLike {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  return {
    x,
    y,
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

export function clampRectToBounds(rect: RectLike, width: number, height: number): RectLike {
  const x = Math.max(0, Math.min(rect.x, width));
  const y = Math.max(0, Math.min(rect.y, height));
  const right = Math.max(x, Math.min(rect.x + rect.width, width));
  const bottom = Math.max(y, Math.min(rect.y + rect.height, height));

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  };
}
