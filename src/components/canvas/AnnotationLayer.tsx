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
  } = useEditorStore((state) => ({
    points: state.points,
    axes: state.axes,
    regions: state.regions,
    lockedRegions: state.lockedRegions,
    selectedId: state.selectedId,
    setSelectedId: state.setSelectedId,
    updatePoint: state.updatePoint,
  }));

  return (
    <>
      <RegionLayer regions={regions} selectedId={selectedId} onSelect={setSelectedId} />
      <LockLayer
        lockedRegions={lockedRegions}
        selectedId={selectedId}
        onSelect={setSelectedId}
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
