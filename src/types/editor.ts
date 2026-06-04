export type EditorTool =
  | "select"
  | "point"
  | "axis"
  | "region"
  | "lock"
  | "transform"
  | "compare";

export interface DesignPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  type:
    | "generic"
    | "frontWheelCenter"
    | "rearWheelCenter"
    | "frontEnd"
    | "rearEnd"
    | "roofTop"
    | "custom";
  displacement?: PointDisplacement;
}

export interface PointDisplacement {
  dx: number;
  dy: number;
  targetX: number;
  targetY: number;
  influenceRadius: number;
  enabled: boolean;
}

export interface DesignAxis {
  id: string;
  name: string;
  startPointId: string;
  endPointId: string;
  currentLength: number;
  targetLength?: number;
  changePercent?: number;
  direction: "horizontal" | "vertical" | "free";
  anchorMode: "startFixed" | "endFixed" | "center";
}

export interface DesignRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "influence" | "cabin" | "bodyCenter" | "front" | "rear" | "custom";
}

export interface LockedRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type:
    | "wheel"
    | "frontWheel"
    | "rearWheel"
    | "lamp"
    | "logo"
    | "background"
    | "custom";
}

export interface TransformOperation {
  id: string;
  axisId: string;
  influenceRegionId?: string;
  lockedRegionIds: string[];
  mode: "stretchAxis" | "compressAxis";
  changePercent: number;
  createdAt: number;
}

export interface EditorState {
  imageUrl: string | null;
  imageWidth: number;
  imageHeight: number;
  activeTool: EditorTool;
  selectedId: string | null;
  points: DesignPoint[];
  axes: DesignAxis[];
  regions: DesignRegion[];
  lockedRegions: LockedRegion[];
  operations: TransformOperation[];
  transformedImageUrl: string | null;
  showCompare: boolean;
}

export interface BasicStretchInput {
  image: HTMLImageElement;
  influenceRegion: DesignRegion;
  lockedRegions: LockedRegion[];
  changePercent: number;
  direction: "horizontal" | "vertical";
}

export interface BasicStretchResult {
  dataUrl: string;
  width: number;
  height: number;
}

export interface VectorWarpPoint {
  x: number;
  y: number;
  dx: number;
  dy: number;
  influenceRadius: number;
}

export interface VectorWarpInput {
  image: HTMLImageElement;
  points: VectorWarpPoint[];
}

export interface VectorWarpResult {
  dataUrl: string;
  width: number;
  height: number;
}
