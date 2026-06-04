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
    setSelectedId,
    updateAxis,
    updatePoint,
    deletePoint,
    deleteAxis,
    deleteRegion,
    deleteLockedRegion,
    applyTransform,
    applyVectorWarpTransform,
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
    setSelectedId: state.setSelectedId,
    updateAxis: state.updateAxis,
    updatePoint: state.updatePoint,
    deletePoint: state.deletePoint,
    deleteAxis: state.deleteAxis,
    deleteRegion: state.deleteRegion,
    deleteLockedRegion: state.deleteLockedRegion,
    applyTransform: state.applyTransform,
    applyVectorWarpTransform: state.applyVectorWarpTransform,
  }));
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedLockedIds, setSelectedLockedIds] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplyingVectorWarp, setIsApplyingVectorWarp] = useState(false);
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!selectedObject || !isDeleteKey(event) || isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      if (selectedObject.kind === "point" && hasActiveDisplacement(selectedObject.value)) {
        updatePoint(selectedObject.value.id, { displacement: undefined });
        setMessage("Displacement cleared.");
        return;
      }

      deleteSelectedObject(selectedObject, {
        deletePoint,
        deleteAxis,
        deleteRegion,
        deleteLockedRegion,
      });
      setMessage("Selected object deleted.");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteAxis, deleteLockedRegion, deletePoint, deleteRegion, selectedObject, updatePoint]);

  const validationMessage =
    selectedObject?.kind === "axis"
      ? getTransformValidationMessage({
          hasImage: Boolean(imageUrl),
          hasAxis: true,
          hasRegions: regions.length > 0,
          selectedRegionId,
          changePercent: selectedObject.value.changePercent ?? 0,
        })
      : null;
  const vectorWarpValidationMessage =
    selectedObject?.kind === "point"
      ? getVectorWarpValidationMessage({
          hasImage: Boolean(imageUrl),
          hasActiveVectorPoint: hasActiveVectorWarpPoint(points),
        })
      : null;

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
            canApply={!validationMessage}
            validationMessage={validationMessage}
            onRegionChange={setSelectedRegionId}
            onLockedChange={setSelectedLockedIds}
            onAxisChange={(patch) => updateAxis(selectedObject.value.id, patch)}
            onApply={async () => {
              const nextValidationMessage = getTransformValidationMessage({
                hasImage: Boolean(imageUrl),
                hasAxis: true,
                hasRegions: regions.length > 0,
                selectedRegionId,
                changePercent: selectedObject.value.changePercent ?? 0,
              });

              if (nextValidationMessage) {
                setMessage(nextValidationMessage);
                return;
              }

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
          <ObjectInspector
            selectedObject={selectedObject}
            isApplyingVectorWarp={isApplyingVectorWarp}
            canApplyVectorWarp={!vectorWarpValidationMessage}
            vectorWarpValidationMessage={vectorWarpValidationMessage}
            onClearDisplacement={(id) => {
              updatePoint(id, { displacement: undefined });
              setMessage("Displacement cleared.");
            }}
            onApplyVectorWarp={async () => {
              const nextValidationMessage = getVectorWarpValidationMessage({
                hasImage: Boolean(imageUrl),
                hasActiveVectorPoint: hasActiveVectorWarpPoint(points),
              });

              if (nextValidationMessage) {
                setMessage(nextValidationMessage);
                return;
              }

              setIsApplyingVectorWarp(true);
              setMessage(null);
              try {
                await applyVectorWarpTransform();
                setMessage("Vector warp applied.");
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Unable to apply vector warp."
                );
              } finally {
                setIsApplyingVectorWarp(false);
              }
            }}
          />
        ) : (
          <p className="text-sm text-neutral-500">
            Select an axis to enter transform parameters. Select points, regions, or locks to
            inspect their properties.
          </p>
        )}
        {selectedObject ? (
          <button
            type="button"
            className="mt-4 w-full rounded-md border border-red-400/70 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
            onClick={() => {
              deleteSelectedObject(selectedObject, {
                deletePoint,
                deleteAxis,
                deleteRegion,
                deleteLockedRegion,
              });
              setMessage("Selected object deleted.");
            }}
          >
            Delete Selected
          </button>
        ) : null}
        {message ? <p className="mt-3 text-xs text-emerald-300">{message}</p> : null}
      </section>

      <ObjectList
        points={points}
        axes={axes}
        regions={regions}
        lockedRegions={lockedRegions}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
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
  validationMessage,
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
  validationMessage: string | null;
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
          value={axis.direction === "free" ? "horizontal" : axis.direction}
          onChange={(event) =>
            onAxisChange({ direction: event.target.value as DesignAxis["direction"] })
          }
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
        <span className="mt-1 block text-xs text-neutral-500">
          Free direction is not supported in this MVP.
        </span>
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
      {validationMessage ? <p className="text-xs text-amber-300">{validationMessage}</p> : null}
    </div>
  );
}

function ObjectInspector({
  selectedObject,
  isApplyingVectorWarp,
  canApplyVectorWarp,
  vectorWarpValidationMessage,
  onClearDisplacement,
  onApplyVectorWarp,
}: {
  selectedObject:
    | { kind: "point"; value: DesignPoint }
    | { kind: "region"; value: DesignRegion }
    | { kind: "lock"; value: LockedRegion };
  isApplyingVectorWarp: boolean;
  canApplyVectorWarp: boolean;
  vectorWarpValidationMessage: string | null;
  onClearDisplacement(id: string): void;
  onApplyVectorWarp(): Promise<void>;
}) {
  const value = selectedObject.value;
  const displacement =
    selectedObject.kind === "point" && selectedObject.value.displacement?.enabled
      ? selectedObject.value.displacement
      : null;

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
      {selectedObject.kind === "point" ? (
        <>
          <ReadOnlyField label="Displacement" value={displacement ? "Enabled" : "None"} />
          {displacement ? (
            <>
              <ReadOnlyField label="dx" value={Math.round(displacement.dx).toString()} />
              <ReadOnlyField label="dy" value={Math.round(displacement.dy).toString()} />
              <ReadOnlyField
                label="targetX"
                value={Math.round(displacement.targetX).toString()}
              />
              <ReadOnlyField
                label="targetY"
                value={Math.round(displacement.targetY).toString()}
              />
              <ReadOnlyField
                label="Influence radius"
                value={Math.round(displacement.influenceRadius).toString()}
              />
              <ReadOnlyField label="Enabled" value={displacement.enabled ? "true" : "false"} />
              <button
                type="button"
                className="w-full rounded-md border border-orange-300/70 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-100 transition hover:bg-orange-500/20"
                onClick={() => onClearDisplacement(value.id)}
              >
                Clear Displacement
              </button>
            </>
          ) : (
            <p className="text-xs text-amber-300">
              No active displacement point.
            </p>
          )}
          <button
            type="button"
            className="w-full rounded-md border border-emerald-400 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canApplyVectorWarp || isApplyingVectorWarp}
            onClick={() => {
              void onApplyVectorWarp();
            }}
          >
            {isApplyingVectorWarp ? "Applying..." : "Apply Vector Warp"}
          </button>
          {vectorWarpValidationMessage ? (
            <p className="text-xs text-amber-300">{vectorWarpValidationMessage}</p>
          ) : null}
        </>
      ) : null}
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

function ObjectList({
  points,
  axes,
  regions,
  lockedRegions,
  selectedId,
  onSelect,
}: {
  points: DesignPoint[];
  axes: DesignAxis[];
  regions: DesignRegion[];
  lockedRegions: LockedRegion[];
  selectedId: string | null;
  onSelect(id: string): void;
}) {
  return (
    <section className="mt-4 space-y-4 rounded-md border border-neutral-800 bg-neutral-900 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Object List
      </h3>
      <ObjectGroup
        title="Points"
        objects={points.map((point) => ({ id: point.id, name: point.name, type: point.type }))}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <ObjectGroup
        title="Axes"
        objects={axes.map((axis) => ({ id: axis.id, name: axis.name, type: axis.direction }))}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <ObjectGroup
        title="Regions"
        objects={regions.map((region) => ({ id: region.id, name: region.name, type: region.type }))}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <ObjectGroup
        title="Locked Regions"
        objects={lockedRegions.map((region) => ({
          id: region.id,
          name: region.name,
          type: region.type,
        }))}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </section>
  );
}

function ObjectGroup({
  title,
  objects,
  selectedId,
  onSelect,
}: {
  title: string;
  objects: Array<{ id: string; name: string; type: string }>;
  selectedId: string | null;
  onSelect(id: string): void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-300">{title}</span>
        <span className="text-neutral-500">{objects.length}</span>
      </div>
      {objects.length === 0 ? (
        <p className="rounded-md bg-neutral-950 px-3 py-2 text-xs text-neutral-500">None</p>
      ) : (
        <div className="space-y-1">
          {objects.map((object) => {
            const isSelected = selectedId === object.id;
            return (
              <button
                key={object.id}
                type="button"
                className={`w-full rounded-md border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-sky-400 bg-sky-500/15 text-sky-100"
                    : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-600"
                }`}
                onClick={() => onSelect(object.id)}
              >
                <span className="block truncate text-sm font-medium">{object.name}</span>
                <span className="block truncate text-xs text-neutral-500">{object.type}</span>
              </button>
            );
          })}
        </div>
      )}
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

type SelectedObject = NonNullable<ReturnType<typeof findSelectedObject>>;

function deleteSelectedObject(
  selectedObject: SelectedObject,
  actions: {
    deletePoint(id: string): void;
    deleteAxis(id: string): void;
    deleteRegion(id: string): void;
    deleteLockedRegion(id: string): void;
  }
) {
  if (selectedObject.kind === "point") {
    actions.deletePoint(selectedObject.value.id);
    return;
  }

  if (selectedObject.kind === "axis") {
    actions.deleteAxis(selectedObject.value.id);
    return;
  }

  if (selectedObject.kind === "region") {
    actions.deleteRegion(selectedObject.value.id);
    return;
  }

  actions.deleteLockedRegion(selectedObject.value.id);
}

function isDeleteKey(event: KeyboardEvent) {
  return event.key === "Delete" || event.key === "Backspace";
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

function getTransformValidationMessage({
  hasImage,
  hasAxis,
  hasRegions,
  selectedRegionId,
  changePercent,
}: {
  hasImage: boolean;
  hasAxis: boolean;
  hasRegions: boolean;
  selectedRegionId: string;
  changePercent: number;
}) {
  if (!hasImage) {
    return "Upload an image before applying a transform.";
  }

  if (!hasAxis) {
    return "Select an axis before applying a transform.";
  }

  if (!hasRegions) {
    return "Create an influence region before applying a transform.";
  }

  if (!selectedRegionId) {
    return "Select an influence region before applying a transform.";
  }

  if (!Number.isFinite(changePercent)) {
    return "Enter a valid change percent before applying a transform.";
  }

  return null;
}

function hasActiveVectorWarpPoint(points: DesignPoint[]) {
  return points.some(hasActiveDisplacement);
}

function hasActiveDisplacement(point: DesignPoint) {
  const displacement = point.displacement;
  if (!displacement?.enabled) {
    return false;
  }

  return (
    displacement.influenceRadius > 0 &&
    (displacement.dx !== 0 || displacement.dy !== 0)
  );
}

function getVectorWarpValidationMessage({
  hasImage,
  hasActiveVectorPoint,
}: {
  hasImage: boolean;
  hasActiveVectorPoint: boolean;
}) {
  if (!hasImage) {
    return "Upload an image before applying vector warp.";
  }

  if (!hasActiveVectorPoint) {
    return "No active displacement point.";
  }

  return null;
}

export default RightPanel;
