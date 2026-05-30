import { useEditorStore } from "../store/editorStore";
import { downloadImage } from "../utils/exportCanvas";

function ExportButton() {
  const imageUrl = useEditorStore((state) => state.imageUrl);
  const transformedImageUrl = useEditorStore((state) => state.transformedImageUrl);
  const showCompare = useEditorStore((state) => state.showCompare);

  const exportUrl = showCompare && transformedImageUrl ? transformedImageUrl : imageUrl;
  const disabled = !exportUrl;

  return (
    <button
      type="button"
      className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-100 transition hover:border-emerald-400 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={() => {
        if (exportUrl) {
          downloadImage(exportUrl, "design-geometry-editor-export.png");
        }
      }}
    >
      Export PNG
    </button>
  );
}

export default ExportButton;
