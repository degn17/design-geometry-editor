import type { KonvaEventObject } from "konva/lib/Node";
import type { DragEvent } from "react";
import { useMemo, useRef, useState, useEffect } from "react";
import { Group, Layer, Rect, Stage } from "react-konva";
import { useEditorStore } from "../store/editorStore";
import type { DesignPoint, EditorTool } from "../types/editor";
import { getDistance, normalizeRect, type PointLike, type RectLike } from "../utils/geometry";
import { createId } from "../utils/ids";
import { readImageFile } from "../utils/imageUpload";
import CompareView from "./CompareView";
import AnnotationLayer from "./canvas/AnnotationLayer";
import BaseImageLayer from "./canvas/BaseImageLayer";

function CanvasStage() {
  const {
    activeTool,
    imageUrl,
    imageWidth,
    imageHeight,
    points,
    axes,
    regions,
    lockedRegions,
    transformedImageUrl,
    showCompare,
    setShowCompare,
    addPoint,
    addAxis,
    addRegion,
    addLockedRegion,
    setSelectedId,
    setImage,
  } = useEditorStore((state) => ({
    activeTool: state.activeTool,
    imageUrl: state.imageUrl,
    imageWidth: state.imageWidth,
    imageHeight: state.imageHeight,
    points: state.points,
    axes: state.axes,
    regions: state.regions,
    lockedRegions: state.lockedRegions,
    transformedImageUrl: state.transformedImageUrl,
    showCompare: state.showCompare,
    setShowCompare: state.setShowCompare,
    addPoint: state.addPoint,
    addAxis: state.addAxis,
    addRegion: state.addRegion,
    addLockedRegion: state.addLockedRegion,
    setSelectedId: state.setSelectedId,
    setImage: state.setImage,
  }));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [draftRect, setDraftRect] = useState<RectLike | null>(null);
  const [dragStart, setDragStart] = useState<PointLike | null>(null);
  const [isFileDragActive, setIsFileDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingAxisStartId, setPendingAxisStartId] = useState<string | null>(null);
  const [axisMessage, setAxisMessage] = useState<string | null>(null);
  const [beforeAfterPercent, setBeforeAfterPercent] = useState(100);
  const displayImageUrl = showCompare && transformedImageUrl ? transformedImageUrl : imageUrl;
  const showBeforeAfter =
    Boolean(imageUrl && transformedImageUrl && showCompare) && beforeAfterPercent < 100;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setStageSize({
        width: Math.max(320, entry.contentRect.width),
        height: Math.max(320, entry.contentRect.height),
      });
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  const viewport = useMemo(
    () => getImageViewport(stageSize.width, stageSize.height, imageWidth, imageHeight),
    [imageHeight, imageWidth, stageSize.height, stageSize.width]
  );

  useEffect(() => {
    if (activeTool !== "axis") {
      setPendingAxisStartId(null);
      setAxisMessage(null);
      return;
    }

    setAxisMessage((currentMessage) =>
      currentMessage === "起点和终点不能相同" ? currentMessage : null
    );
  }, [activeTool]);

  const axisPrompt =
    activeTool === "axis"
      ? axisMessage ?? (pendingAxisStartId ? "请选择轴线终点" : "请选择轴线起点")
      : null;

  async function handleDroppedFile(file: File) {
    try {
      const image = await readImageFile(file);
      setImage(image.dataUrl, image.width, image.height);
      setUploadError(null);
      setBeforeAfterPercent(100);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload image.");
    }
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (hasFileDrop(event)) {
      setIsFileDragActive(true);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (hasFileDrop(event)) {
      event.dataTransfer.dropEffect = "copy";
      setIsFileDragActive(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) {
      return;
    }

    setIsFileDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsFileDragActive(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      void handleDroppedFile(file);
    }
  }

  return (
    <section className="flex min-w-0 flex-col bg-neutral-900">
      <div className="flex h-12 items-center justify-between border-b border-neutral-800 px-4">
        <div>
          <h1 className="text-sm font-semibold text-neutral-100">Design Geometry Editor</h1>
          <p className="text-xs text-neutral-500">MVP v0.1 local prototype</p>
        </div>
        <div className="flex items-center gap-3">
          {axisPrompt ? (
            <span className="rounded-md border border-sky-500/50 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-100">
              {axisPrompt}
            </span>
          ) : null}
          <CompareView />
          <span className="text-xs text-neutral-500">
            {imageUrl ? `${imageWidth} x ${imageHeight}px` : "No image loaded"}
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-neutral-950"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!displayImageUrl || imageWidth === 0 || imageHeight === 0 ? (
          <div
            className={`absolute inset-6 flex flex-col items-center justify-center rounded-md border border-dashed px-6 text-center transition ${
              isFileDragActive
                ? "border-sky-300 bg-sky-500/10 text-sky-100"
                : "border-neutral-700 bg-neutral-900/40 text-neutral-400"
            }`}
          >
            <p className="text-base font-semibold text-neutral-100">
              {isFileDragActive ? "Release to upload image" : "Drop image here"}
            </p>
            <p className="mt-2 text-sm">or click Upload Image</p>
            <p className="mt-1 text-xs text-neutral-500">Supported: JPG, PNG, WebP</p>
            {uploadError ? (
              <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {uploadError}
              </p>
            ) : null}
          </div>
        ) : (
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={(event) => {
              const imagePoint = getImagePoint(event, viewport, imageWidth, imageHeight);
              if (!imagePoint) {
                return;
              }

              if (activeTool === "point") {
                addPoint({
                  id: createId("point"),
                  name: `Point ${points.length + 1}`,
                  x: imagePoint.x,
                  y: imagePoint.y,
                  type: "generic",
                });
                return;
              }

              if (activeTool === "region" || activeTool === "lock") {
                setDragStart(imagePoint);
                setDraftRect({ x: imagePoint.x, y: imagePoint.y, width: 0, height: 0 });
                return;
              }

              if (activeTool === "select") {
                setSelectedId(null);
              }
            }}
            onMouseMove={(event) => {
              if (!dragStart || (activeTool !== "region" && activeTool !== "lock")) {
                return;
              }

              const imagePoint = getImagePoint(event, viewport, imageWidth, imageHeight);
              if (imagePoint) {
                setDraftRect(normalizeRect(dragStart, imagePoint));
              }
            }}
            onMouseUp={() => {
              if (!draftRect || (activeTool !== "region" && activeTool !== "lock")) {
                return;
              }

              if (draftRect.width >= 8 && draftRect.height >= 8) {
                if (activeTool === "region") {
                  addRegion({
                    id: createId("region"),
                    name: `Region ${regions.length + 1}`,
                    x: draftRect.x,
                    y: draftRect.y,
                    width: draftRect.width,
                    height: draftRect.height,
                    type: "influence",
                  });
                } else {
                  addLockedRegion({
                    id: createId("lock"),
                    name: `Lock ${lockedRegions.length + 1}`,
                    x: draftRect.x,
                    y: draftRect.y,
                    width: draftRect.width,
                    height: draftRect.height,
                    type: "custom",
                  });
                }
              }

              setDraftRect(null);
              setDragStart(null);
            }}
          >
            <Layer>
              <Group x={viewport.x} y={viewport.y} scaleX={viewport.scale} scaleY={viewport.scale}>
                {showBeforeAfter && imageUrl && transformedImageUrl ? (
                  <>
                    <BaseImageLayer imageUrl={imageUrl} width={imageWidth} height={imageHeight} />
                    <Group
                      clipX={0}
                      clipY={0}
                      clipWidth={imageWidth * (beforeAfterPercent / 100)}
                      clipHeight={imageHeight}
                    >
                      <BaseImageLayer
                        imageUrl={transformedImageUrl}
                        width={imageWidth}
                        height={imageHeight}
                      />
                    </Group>
                    <Rect
                      x={imageWidth * (beforeAfterPercent / 100) - 1}
                      y={0}
                      width={2}
                      height={imageHeight}
                      fill="#f8fafc"
                      opacity={0.9}
                      listening={false}
                    />
                  </>
                ) : (
                  <BaseImageLayer
                    imageUrl={displayImageUrl}
                    width={imageWidth}
                    height={imageHeight}
                  />
                )}
                <AnnotationLayer
                  onPointClick={(point) =>
                    handlePointClickForAxis(
                      point,
                      activeTool,
                      pendingAxisStartId,
                      points,
                      axes.length,
                      setPendingAxisStartId,
                      setAxisMessage,
                      addAxis
                    )
                  }
                />
                {draftRect ? (
                  <Rect
                    x={draftRect.x}
                    y={draftRect.y}
                    width={draftRect.width}
                    height={draftRect.height}
                    fill={
                      activeTool === "lock"
                        ? "rgba(249, 115, 22, 0.18)"
                        : "rgba(14, 165, 233, 0.18)"
                    }
                    stroke={activeTool === "lock" ? "#fb923c" : "#38bdf8"}
                    strokeWidth={2}
                    dash={[8, 5]}
                    listening={false}
                  />
                ) : null}
              </Group>
            </Layer>
          </Stage>
        )}
        {displayImageUrl && isFileDragActive ? (
          <div className="pointer-events-none absolute inset-6 flex flex-col items-center justify-center rounded-md border border-dashed border-sky-300 bg-sky-500/15 text-center text-sky-100 shadow-[0_0_0_999px_rgba(10,10,10,0.35)]">
            <p className="text-base font-semibold">Release to upload image</p>
            <p className="mt-2 text-sm text-sky-100/80">Current image will be replaced</p>
          </div>
        ) : null}
        {displayImageUrl && uploadError && !isFileDragActive ? (
          <div className="absolute left-4 top-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100 shadow-lg">
            {uploadError}
          </div>
        ) : null}
        {imageUrl && transformedImageUrl ? (
          <div className="absolute bottom-4 left-1/2 flex w-[min(520px,calc(100%-48px))] -translate-x-1/2 items-center gap-3 rounded-md border border-neutral-700 bg-neutral-950/90 px-4 py-3 shadow-lg backdrop-blur">
            <span className="text-xs font-medium text-neutral-400">Before</span>
            <input
              className="h-2 flex-1 accent-sky-400"
              type="range"
              min="0"
              max="100"
              value={beforeAfterPercent}
              onChange={(event) => {
                setBeforeAfterPercent(Number(event.target.value));
                setShowCompare(true);
              }}
            />
            <span className="text-xs font-medium text-neutral-400">After</span>
            <span className="w-9 text-right text-xs text-neutral-500">
              {beforeAfterPercent}%
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function hasFileDrop(event: DragEvent<HTMLDivElement>) {
  return Array.from(event.dataTransfer.types).includes("Files");
}

function getImageViewport(
  stageWidth: number,
  stageHeight: number,
  imageWidth: number,
  imageHeight: number
) {
  if (imageWidth === 0 || imageHeight === 0) {
    return { x: 0, y: 0, scale: 1 };
  }

  const scale = Math.min((stageWidth * 0.92) / imageWidth, (stageHeight * 0.9) / imageHeight);
  const safeScale = Math.max(0.05, Math.min(scale, 2));

  return {
    x: (stageWidth - imageWidth * safeScale) / 2,
    y: (stageHeight - imageHeight * safeScale) / 2,
    scale: safeScale,
  };
}

function getImagePoint(
  event: KonvaEventObject<MouseEvent>,
  viewport: { x: number; y: number; scale: number },
  imageWidth: number,
  imageHeight: number
): PointLike | null {
  const stage = event.target.getStage();
  const pointer = stage?.getPointerPosition();

  if (!pointer) {
    return null;
  }

  const x = (pointer.x - viewport.x) / viewport.scale;
  const y = (pointer.y - viewport.y) / viewport.scale;

  if (x < 0 || y < 0 || x > imageWidth || y > imageHeight) {
    return null;
  }

  return {
    x: Math.max(0, Math.min(imageWidth, x)),
    y: Math.max(0, Math.min(imageHeight, y)),
  };
}

function handlePointClickForAxis(
  point: DesignPoint,
  activeTool: EditorTool,
  pendingAxisStartId: string | null,
  points: DesignPoint[],
  axisCount: number,
  setPendingAxisStartId: (id: string | null) => void,
  setAxisMessage: (message: string | null) => void,
  addAxis: ReturnType<typeof useEditorStore.getState>["addAxis"]
) {
  if (activeTool !== "axis") {
    return;
  }

  if (!pendingAxisStartId) {
    setPendingAxisStartId(point.id);
    setAxisMessage(null);
    return;
  }

  if (pendingAxisStartId === point.id) {
    setAxisMessage("起点和终点不能相同");
    return;
  }

  const startPoint = points.find((candidate) => candidate.id === pendingAxisStartId);
  if (!startPoint) {
    setPendingAxisStartId(point.id);
    setAxisMessage(null);
    return;
  }

  addAxis({
    id: createId("axis"),
    name: `Axis ${axisCount + 1}`,
    startPointId: startPoint.id,
    endPointId: point.id,
    currentLength: getDistance(startPoint, point),
    direction: "horizontal",
    anchorMode: "startFixed",
  });
  setPendingAxisStartId(null);
  setAxisMessage(null);
}

export default CanvasStage;
