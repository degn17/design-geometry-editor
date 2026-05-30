import { useEditorStore } from "../store/editorStore";

function CompareView() {
  const transformedImageUrl = useEditorStore((state) => state.transformedImageUrl);
  const showCompare = useEditorStore((state) => state.showCompare);
  const setShowCompare = useEditorStore((state) => state.setShowCompare);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={`rounded-md border px-3 py-1.5 text-xs transition ${
          !showCompare
            ? "border-neutral-500 bg-neutral-800 text-neutral-100"
            : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600"
        }`}
        onClick={() => setShowCompare(false)}
      >
        Original
      </button>
      <button
        type="button"
        className={`rounded-md border px-3 py-1.5 text-xs transition ${
          showCompare
            ? "border-sky-400 bg-sky-500/15 text-sky-100"
            : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600"
        }`}
        disabled={!transformedImageUrl}
        onClick={() => setShowCompare(true)}
      >
        Transformed
      </button>
    </div>
  );
}

export default CompareView;
