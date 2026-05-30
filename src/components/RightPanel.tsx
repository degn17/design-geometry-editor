import { useEffect, useMemo, useState } from "react";
import { useEditorStore } from "../store/editorStore";
import type { DesignAxis, DesignPoint, DesignRegion, LockedRegion } from "../types/editor";
import { createId } from "../utils/ids";

function RightPanel() {
  const {
    imageUrl,
    imageWidth,
    imageHeight,
    points,
    axes,
    regions,
    lockedRegions,
    selectedId,
    transformedImageUrl,
    updateAxis,
    applyTransform,
  } = useEditorStore((state) => ({
    imageUrl: state.imageUrl,
    imageWidth: state.imageWidth,
    imageHeight: state.imageHeight,
    points: state.points,
    axes: state.axes,
    regions: state.regions,
    lockedRegions: state.lockedRegions,
    selectedId: state.selectedId,
    transformedImageUrl: state.transformedImageUrl,
    updateAxis: state.updateAxis,
    applyTransform: state.applyTransform,
  }));
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedLockedIds, setSelectedLockedIds] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedObject = useMemo(
    () => findSelectedObject(selectedId, points, axes, regions, lockedRegions),
    [axes, lockedRegions, points, regions, selectedId]
  );

  useEffect(() => {
    if (regions.length > 0 && !regions.some((region) => region.id === selectedRegionId)) {
      setSelectedRegionId(regions[0].id);
    }
  }, [regions, selectedRegionId]);

  return (
    <aside className="h-full overflow-y-auto border-l border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-neutral-100">Inspector</h2>
        <p className="text-xs text-neutral-500">
          {selectedId ? `Selected: ${selectedId}` : "No object selected"}
        </p>
      </div>

      <section className="space-y-3 rounded-md border border-neutral-800 bg-neutral-900 p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Project Status
        </h3>
        <StatusRow label="Image size" value={`${imageWidth} x ${imageHeight}`} />
        <StatusRow label="Points" value={points.length.toString()} />
        <StatusRow label="Axes" value={axes.length.toString()} />
        <StatusRow label="Regions" value={regions.length.toString()} />
        <StatusRow label="Locked" value={lockedRegions.length.toString()} />
        <StatusRow label="Transform" value={transformedImageUrl ? "Ready" : "None"} />
      </section>

      <section className="mt-4 rounded-md border border-neutral-800 bg-neutral-900 p-3">
        {selectedObject?.kind === "axis" ? (
          <AxisInspector
            axis={selectedObject.value}
            regions={regions}
            lockedRegions={lockedRegions}
            selectedRegionId={selectedRegionId}
            selectedLockedIds={selectedLockedIds}
            isApplying={isApplying}
            canApply={Boolean(imageUrl && selectedRegionId)}
            onRegionChange={setSelectedRegionId}
            onLockedChange={setSelectedLockedIds}
            onAxisChange={(patch) => updateAxis(selectedObject.value.id, patch)}
            onApply={async () => {
              setIsApplying(true);
              setMessage(null);
              try {
                await applyTransform({
                  id: createId("operation"),
                  axisId: selectedObject.value.id,
                  influenceRegionId: selectedRegionId,
                  lockedRegionIds: selectedLockedIds,
                  mode:
                    (selectedObject.value.changePercent ?? 0) >= 0
                      ? "stretchAxis"
                      : "compressAxis",
                  changePercent: selectedObject.value.changePercent ?? 0,
                  createdAt: Date.now(),
                });
                setMessage("Transform generated.");
              } finally {
                setIsApplying(false);
              }
            }}
          />
        ) : selectedObject ? (
          <ObjectInspector selectedObject={selectedObject} />
        ) : (
          <p className="text-sm text-neutral-500">
            Select an axis to enter transform parameters. Select points, regions, or locks to
            inspect their properties.
          </p>
        )}
        {message ? <p className="mt-3 text-xs text-emerald-300">{message}</p> : null}
      </section>
    </aside>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-100">{value}</span>
    </div>
  );
}

function AxisInspector({
  axis,
  regions,
  lockedRegions,
  selectedRegionId,
  selectedLockedIds,
  isApplying,
  canApply,
  onRegionChange,
  onLockedChange,
  onAxisChange,
  onApply,
}: {
  axis: DesignAxis;
  regions: DesignRegion[];
  lockedRegions: LockedRegion[];
  selectedRegionId: string;
  selectedLockedIds: string[];
  isApplying: boolean;
  canApply: boolean;
  onRegionChange(id: string): void;
  onLockedChange(ids: string[]): void;
  onAxisChange(patch: Partial<DesignAxis>): void;
  onApply(): Promise<void>;
}) {
  const changePercent = axis.changePercent ?? 0;
  const targetLength = axis.targetLength ?? "";

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Axis Parameters
      </h3>
      <ReadOnlyField label="Axis name" value={axis.name} />
      <ReadOnlyField label="Current length" value={`${Math.round(axis.currentLength)} px`} />

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-400">Change percent</span>
        <input
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-sky-400"
          type="number"
          value={changePercent}
          onChange={(event) =>
            onAxisChange({
              changePercent: Number(event.target.value),
              targetLength: undefined,
            })
          }
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-400">Target length</span>
        <input
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-sky-400"
          type="number"
          value={targetLength}
          placeholder="Optional"
          onChange={(event) => {
            const nextTarget = Number(event.target.value);
            if (!event.target.value || axis.currentLength === 0) {
              onAxisChange({ targetLength: undefined });
              return;
            }
            onAxisChange({
              targetLength: nextTarget,
              changePercent: ((nextTarget - axis.currentLength) / axis.currentLength) * 100,
            });
          }}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-400">Direction</span>
        <select
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-sky-400"
          value={axis.direction}
          onChange={(event) =>
            onAxisChange({ direction: event.target.value as DesignAxis["direction"] })
          }
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
          <option value="free">Free</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-400">Anchor mode</span>
        <select
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-sky-400"
          value={axis.anchorMode}
          onChange={(event) =>
            onAxisChange({ anchorMode: event.target.value as DesignAxis["anchorMode"] })
          }
        >
          <option value="startFixed">Start fixed</option>
          <option value="endFixed">End fixed</option>
          <option value="center">Center</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-400">Influence region</span>
        <select
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-sky-400"
          value={selectedRegionId}
          onChange={(event) => onRegionChange(event.target.value)}
        >
          {regions.length === 0 ? <option value="">Draw a region first</option> : null}
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <span className="block text-sm text-neutral-400">Locked regions</span>
        {lockedRegions.length === 0 ? (
          <p className="text-xs text-neutral-500">No locked regions drawn.</p>
        ) : (
          lockedRegions.map((region) => (
            <label key={region.id} className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={selectedLockedIds.includes(region.id)}
                onChange={(event) => {
                  if (event.target.checked) {
                    onLockedChange([...selectedLockedIds, region.id]);
                    return;
                  }
                  onLockedChange(selectedLockedIds.filter((id) => id !== region.id));
                }}
              />
              {region.name}
            </label>
          ))
        )}
      </div>

      <button
        type="button"
        className="w-full rounded-md border border-sky-400 bg-sky-500/15 px-3 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canApply || isApplying}
        onClick={() => {
          void onApply();
        }}
      >
        {isApplying ? "Applying..." : "Apply Transform"}
      </button>
    </div>
  );
}

function ObjectInspector({
  selectedObject,
}: {
  selectedObject:
    | { kind: "point"; value: DesignPoint }
    | { kind: "region"; value: DesignRegion }
    | { kind: "lock"; value: LockedRegion };
}) {
  const value = selectedObject.value;
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {selectedObject.kind} Properties
      </h3>
      <ReadOnlyField label="Name" value={value.name} />
      <ReadOnlyField label="X" value={Math.round(value.x).toString()} />
      <ReadOnlyField label="Y" value={Math.round(value.y).toString()} />
      {"width" in value ? <ReadOnlyField label="Width" value={Math.round(value.width).toString()} /> : null}
      {"height" in value ? (
        <ReadOnlyField label="Height" value={Math.round(value.height).toString()} />
      ) : null}
      <ReadOnlyField label="Type" value={value.type} />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-neutral-950 px-3 py-2 text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="text-right font-medium text-neutral-100">{value}</span>
    </div>
  );
}

function findSelectedObject(
  selectedId: string | null,
  points: DesignPoint[],
  axes: DesignAxis[],
  regions: DesignRegion[],
  lockedRegions: LockedRegion[]
) {
  if (!selectedId) {
    return null;
  }

  const axis = axes.find((candidate) => candidate.id === selectedId);
  if (axis) {
    return { kind: "axis" as const, value: axis };
  }

  const point = points.find((candidate) => candidate.id === selectedId);
  if (point) {
    return { kind: "point" as const, value: point };
  }

  const region = regions.find((candidate) => candidate.id === selectedId);
  if (region) {
    return { kind: "region" as const, value: region };
  }

  const lockedRegion = lockedRegions.find((candidate) => candidate.id === selectedId);
  if (lockedRegion) {
    return { kind: "lock" as const, value: lockedRegion };
  }

  return null;
}

export default RightPanel;
