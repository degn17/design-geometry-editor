import type { ChangeEvent } from "react";
import { loadImage } from "../utils/imageTransform";
import { useEditorStore } from "../store/editorStore";

function ImageUploader() {
  const setImage = useEditorStore((state) => state.setImage);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(dataUrl);
    setImage(dataUrl, image.naturalWidth || image.width, image.naturalHeight || image.height);
    event.target.value = "";
  }

  return (
    <label className="block cursor-pointer rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-sm font-medium text-neutral-100 transition hover:border-sky-400 hover:bg-neutral-800">
      Upload Image
      <input
        className="sr-only"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
      />
    </label>
  );
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

export default ImageUploader;
