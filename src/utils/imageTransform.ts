import type {
  BasicStretchInput,
  BasicStretchResult,
  LockedRegion,
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
