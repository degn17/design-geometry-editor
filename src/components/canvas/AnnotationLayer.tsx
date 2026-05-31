import type { DesignPoint } from "../../types/editor";
import AxisLayer from "./AxisLayer";
import LockLayer from "./LockLayer";
import PointsLayer from "./PointsLayer";
import RegionLayer from "./RegionLayer";
import { useEditorStore } from "../../store/editorStore";

interface AnnotationLayerProps {
  onPointClick(point: DesignPoint): void;
}

function AnnotationLayer({ onPointClick }: AnnotationLayerProps) {
  const {
    points,
    axes,
    regions,
    lockedRegions,
    selectedId,
    setSelectedId,
    updatePoint,
    updateRegion,
    updateLockedRegion,
  } = useEditorStore((state) => ({
    points: state.points,
    axes: state.axes,
    regions: state.regions,
    lockedRegions: state.lockedRegions,
    selectedId: state.selectedId,
    setSelectedId: state.setSelectedId,
    updatePoint: state.updatePoint,
    updateRegion: state.updateRegion,
    updateLockedRegion: state.updateLockedRegion,
  }));

  return (
    <>
      <RegionLayer
        regions={regions}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={(id, x, y) => updateRegion(id, { x, y })}
        onResize={(id, width, height) => updateRegion(id, { width, height })}
      />
      <LockLayer
        lockedRegions={lockedRegions}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={(id, x, y) => updateLockedRegion(id, { x, y })}
        onResize={(id, width, height) => updateLockedRegion(id, { width, height })}
      />
      <AxisLayer axes={axes} points={points} selectedId={selectedId} onSelect={setSelectedId} />
      <PointsLayer
        points={points}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={(id, x, y) => updatePoint(id, { x, y })}
        onPointClick={onPointClick}
      />
    </>
  );
}

export default AnnotationLayer;
