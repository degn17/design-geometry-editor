import type {
  BasicStretchInput,
  BasicStretchResult,
  LockedRegion,
  VectorWarpInput,
  VectorWarpPoint,
  VectorWarpResult,
} from "../types/editor";
import { clampRectToBounds, type RectLike } from "./geometry";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image."));
    image.src = src;
  });
}

export async function applyBasicStretch(
  input: BasicStretchInput
): Promise<BasicStretchResult> {
  const { image, influenceRegion, lockedRegions, changePercent, direction } = input;
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const region = clampRectToBounds(influenceRegion, sourceWidth, sourceHeight);

  if (region.width <= 1 || region.height <= 1) {
    return {
      dataUrl: image.src,
      width: sourceWidth,
      height: sourceHeight,
    };
  }

  const scale = Math.max(0.1, 1 + changePercent / 100);
  const isHorizontal = direction === "horizontal";
  const scaledRegionWidth = isHorizontal ? Math.max(1, region.width * scale) : region.width;
  const scaledRegionHeight = isHorizontal ? region.height : Math.max(1, region.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, sourceWidth, sourceHeight);

  if (isHorizontal) {
    drawHorizontalStretch(context, image, region, scaledRegionWidth);
  } else {
    drawVerticalStretch(context, image, region, scaledRegionHeight);
  }

  redrawLockedRegions(context, image, lockedRegions, sourceWidth, sourceHeight);

  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: sourceWidth,
    height: sourceHeight,
  };
}

export async function applyVectorWarp(input: VectorWarpInput): Promise<VectorWarpResult> {
  const { image } = input;
  const points = input.points.filter(isValidVectorWarpPoint);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (points.length === 0) {
    return {
      dataUrl: image.src,
      width: sourceWidth,
      height: sourceHeight,
    };
  }

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;
  const sourceContext = sourceCanvas.getContext("2d");
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sourceWidth;
  outputCanvas.height = sourceHeight;
  const outputContext = outputCanvas.getContext("2d");

  if (!sourceContext || !outputContext) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  sourceContext.drawImage(image, 0, 0, sourceWidth, sourceHeight);
  const sourceData = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight);
  const outputData = outputContext.createImageData(sourceWidth, sourceHeight);

  for (let y = 0; y < sourceHeight; y += 1) {
    for (let x = 0; x < sourceWidth; x += 1) {
      const offset = getVectorWarpOffset(x, y, points);
      const sourceX = clampNumber(x - offset.dx, 0, sourceWidth - 1);
      const sourceY = clampNumber(y - offset.dy, 0, sourceHeight - 1);
      writeBilinearSample(sourceData, outputData, x, y, sourceX, sourceY);
    }
  }

  outputContext.putImageData(outputData, 0, 0);

  return {
    dataUrl: outputCanvas.toDataURL("image/png"),
    width: sourceWidth,
    height: sourceHeight,
  };
}

function drawHorizontalStretch(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  region: RectLike,
  scaledRegionWidth: number
) {
  context.drawImage(
    image,
    region.x,
    region.y,
    region.width,
    region.height,
    region.x,
    region.y,
    scaledRegionWidth,
    region.height
  );
}

function drawVerticalStretch(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  region: RectLike,
  scaledRegionHeight: number
) {
  context.drawImage(
    image,
    region.x,
    region.y,
    region.width,
    region.height,
    region.x,
    region.y,
    region.width,
    scaledRegionHeight
  );
}

function redrawLockedRegions(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  lockedRegions: LockedRegion[],
  sourceWidth: number,
  sourceHeight: number
) {
  lockedRegions.forEach((lockedRegion) => {
    const region = clampRectToBounds(lockedRegion, sourceWidth, sourceHeight);
    if (region.width <= 1 || region.height <= 1) {
      return;
    }

    context.drawImage(
      image,
      region.x,
      region.y,
      region.width,
      region.height,
      region.x,
      region.y,
      region.width,
      region.height
    );
  });
}

function isValidVectorWarpPoint(point: VectorWarpPoint) {
  return (
    point.influenceRadius > 0 &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    Number.isFinite(point.dx) &&
    Number.isFinite(point.dy) &&
    Number.isFinite(point.influenceRadius) &&
    (point.dx !== 0 || point.dy !== 0)
  );
}

function getVectorWarpOffset(
  x: number,
  y: number,
  points: VectorWarpPoint[]
): { dx: number; dy: number } {
  return points.reduce(
    (offset, point) => {
      const distance = Math.hypot(x - point.x, y - point.y);
      if (distance >= point.influenceRadius) {
        return offset;
      }

      const t = distance / point.influenceRadius;
      const weight = (1 - t) * (1 - t);

      return {
        dx: offset.dx + point.dx * weight,
        dy: offset.dy + point.dy * weight,
      };
    },
    { dx: 0, dy: 0 }
  );
}

function writeBilinearSample(
  sourceData: ImageData,
  outputData: ImageData,
  outputX: number,
  outputY: number,
  sourceX: number,
  sourceY: number
) {
  const width = sourceData.width;
  const height = sourceData.height;
  const x0 = Math.floor(sourceX);
  const y0 = Math.floor(sourceY);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = sourceX - x0;
  const ty = sourceY - y0;
  const outputIndex = (outputY * width + outputX) * 4;

  for (let channel = 0; channel < 4; channel += 1) {
    const topLeft = sourceData.data[(y0 * width + x0) * 4 + channel];
    const topRight = sourceData.data[(y0 * width + x1) * 4 + channel];
    const bottomLeft = sourceData.data[(y1 * width + x0) * 4 + channel];
    const bottomRight = sourceData.data[(y1 * width + x1) * 4 + channel];
    const top = topLeft * (1 - tx) + topRight * tx;
    const bottom = bottomLeft * (1 - tx) + bottomRight * tx;

    outputData.data[outputIndex + channel] = top * (1 - ty) + bottom * ty;
  }
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
