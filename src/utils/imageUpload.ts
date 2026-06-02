import { loadImage } from "./imageTransform";

const supportedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const supportedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const unsupportedImageTypeMessage =
  "Unsupported file type. Please upload JPG, PNG, or WebP.";

export interface UploadedImageFile {
  dataUrl: string;
  width: number;
  height: number;
}

export async function readImageFile(file: File): Promise<UploadedImageFile> {
  if (!isSupportedImageFile(file)) {
    throw new Error(unsupportedImageTypeMessage);
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  return {
    dataUrl,
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
}

function isSupportedImageFile(file: File) {
  if (supportedMimeTypes.has(file.type)) {
    return true;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? supportedExtensions.has(extension) : false;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("File reader returned an unexpected result."));
    };
    reader.onerror = () => reject(new Error("Unable to read selected file."));
    reader.readAsDataURL(file);
  });
}
