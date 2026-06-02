import type { ChangeEvent } from "react";
import { useState } from "react";
import { useEditorStore } from "../store/editorStore";
import { readImageFile } from "../utils/imageUpload";

function ImageUploader() {
  const setImage = useEditorStore((state) => state.setImage);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const image = await readImageFile(file);
      setImage(image.dataUrl, image.width, image.height);
      setUploadError(null);
      event.target.value = "";
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload image.");
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block cursor-pointer rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-sm font-medium text-neutral-100 transition hover:border-sky-400 hover:bg-neutral-800">
        Upload Image
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
        />
      </label>
      {uploadError ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-100">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}

export default ImageUploader;
