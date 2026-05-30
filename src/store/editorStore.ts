import { create } from "zustand";
import type {
  DesignAxis,
  DesignPoint,
  DesignRegion,
  EditorState,
  EditorTool,
  LockedRegion,
  TransformOperation,
} from "../types/editor";
import { getDistance } from "../utils/geometry";
import { applyBasicStretch, loadImage } from "../utils/imageTransform";

interface EditorActions {
  setImage(imageUrl: string, width: number, height: number): void;
  setActiveTool(tool: EditorTool): void;
  addPoint(point: DesignPoint): void;
  updatePoint(id: string, patch: Partial<DesignPoint>): void;
  deletePoint(id: string): void;
  addAxis(axis: DesignAxis): void;
  updateAxis(id: string, patch: Partial<DesignAxis>): void;
  deleteAxis(id: string): void;
  addRegion(region: DesignRegion): void;
  updateRegion(id: string, patch: Partial<DesignRegion>): void;
  deleteRegion(id: string): void;
  addLockedRegion(region: LockedRegion): void;
  updateLockedRegion(id: string, patch: Partial<LockedRegion>): void;
  deleteLockedRegion(id: string): void;
  setSelectedId(id: string | null): void;
  applyTransform(operation: TransformOperation): Promise<void>;
  setTransformedImageUrl(url: string | null): void;
  setShowCompare(showCompare: boolean): void;
  resetEditor(): void;
}

export type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
  imageUrl: null,
  imageWidth: 0,
  imageHeight: 0,
  activeTool: "select",
  selectedId: null,
  points: [],
  axes: [],
  regions: [],
  lockedRegions: [],
  operations: [],
  transformedImageUrl: null,
  showCompare: false,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setImage: (imageUrl, width, height) =>
    set({
      imageUrl,
      imageWidth: width,
      imageHeight: height,
      selectedId: null,
      points: [],
      axes: [],
      regions: [],
      lockedRegions: [],
      operations: [],
      transformedImageUrl: null,
      showCompare: false,
    }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  addPoint: (point) =>
    set((state) => ({
      points: [...state.points, point],
      selectedId: point.id,
    })),

  updatePoint: (id, patch) =>
    set((state) => {
      const points = state.points.map((point) =>
        point.id === id ? { ...point, ...patch } : point
      );

      return {
        points,
        axes: recalculateAxisLengths(state.axes, points),
      };
    }),

  deletePoint: (id) =>
    set((state) => ({
      points: state.points.filter((point) => point.id !== id),
      axes: state.axes.filter(
        (axis) => axis.startPointId !== id && axis.endPointId !== id
      ),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  addAxis: (axis) =>
    set((state) => ({
      axes: [...state.axes, axis],
      selectedId: axis.id,
    })),

  updateAxis: (id, patch) =>
    set((state) => ({
      axes: state.axes.map((axis) => (axis.id === id ? { ...axis, ...patch } : axis)),
    })),

  deleteAxis: (id) =>
    set((state) => ({
      axes: state.axes.filter((axis) => axis.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  addRegion: (region) =>
    set((state) => ({
      regions: [...state.regions, region],
      selectedId: region.id,
    })),

  updateRegion: (id, patch) =>
    set((state) => ({
      regions: state.regions.map((region) =>
        region.id === id ? { ...region, ...patch } : region
      ),
    })),

  deleteRegion: (id) =>
    set((state) => ({
      regions: state.regions.filter((region) => region.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  addLockedRegion: (region) =>
    set((state) => ({
      lockedRegions: [...state.lockedRegions, region],
      selectedId: region.id,
    })),

  updateLockedRegion: (id, patch) =>
    set((state) => ({
      lockedRegions: state.lockedRegions.map((region) =>
        region.id === id ? { ...region, ...patch } : region
      ),
    })),

  deleteLockedRegion: (id) =>
    set((state) => ({
      lockedRegions: state.lockedRegions.filter((region) => region.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  setSelectedId: (id) => set({ selectedId: id }),

  applyTransform: async (operation) => {
    const state = get();
    const imageUrl = state.imageUrl;
    const axis = state.axes.find((candidate) => candidate.id === operation.axisId);
    const influenceRegion = state.regions.find(
      (region) => region.id === operation.influenceRegionId
    );

    if (!imageUrl || !axis || !influenceRegion) {
      return;
    }

    const image = await loadImage(imageUrl);
    const lockedRegions = state.lockedRegions.filter((region) =>
      operation.lockedRegionIds.includes(region.id)
    );
    const direction = axis.direction === "vertical" ? "vertical" : "horizontal";
    const result = await applyBasicStretch({
      image,
      influenceRegion,
      lockedRegions,
      changePercent: operation.changePercent,
      direction,
    });

    set((currentState) => ({
      operations: [...currentState.operations, operation],
      transformedImageUrl: result.dataUrl,
      showCompare: true,
      activeTool: "compare",
    }));
  },

  setTransformedImageUrl: (url) => set({ transformedImageUrl: url }),

  setShowCompare: (showCompare) => set({ showCompare }),

  resetEditor: () => set(initialState),
}));

function recalculateAxisLengths(
  axes: DesignAxis[],
  points: DesignPoint[]
): DesignAxis[] {
  return axes.map((axis) => {
    const start = points.find((point) => point.id === axis.startPointId);
    const end = points.find((point) => point.id === axis.endPointId);

    if (!start || !end) {
      return axis;
    }

    return {
      ...axis,
      currentLength: getDistance(start, end),
    };
  });
}
