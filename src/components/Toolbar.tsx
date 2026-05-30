import type { EditorTool } from "../types/editor";
import { useEditorStore } from "../store/editorStore";
import ExportButton from "./ExportButton";
import ImageUploader from "./ImageUploader";

const tools: Array<{ id: EditorTool; label: string }> = [
  { id: "select", label: "Select" },
  { id: "point", label: "Point" },
  { id: "axis", label: "Axis" },
  { id: "region", label: "Region" },
  { id: "lock", label: "Lock" },
  { id: "transform", label: "Transform" },
  { id: "compare", label: "Compare" },
];

function Toolbar() {
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);

  return (
    <aside className="flex h-full flex-col border-r border-neutral-800 bg-neutral-950 p-3">
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Image
        </p>
        <ImageUploader />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Tools</p>
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                isActive
                  ? "border-sky-400 bg-sky-500/15 text-sky-100"
                  : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800"
              }`}
              onClick={() => setActiveTool(tool.id)}
            >
              {tool.label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto space-y-2 border-t border-neutral-800 pt-3">
        <ExportButton />
      </div>
    </aside>
  );
}

export default Toolbar;
