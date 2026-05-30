import type { KonvaEventObject } from "konva/lib/Node";
import { Circle, Group, Text } from "react-konva";
import type { DesignPoint } from "../../types/editor";

interface PointsLayerProps {
  points: DesignPoint[];
  selectedId: string | null;
  onSelect(id: string): void;
  onMove(id: string, x: number, y: number): void;
  onPointClick(point: DesignPoint): void;
}

function PointsLayer({
  points,
  selectedId,
  onSelect,
  onMove,
  onPointClick,
}: PointsLayerProps) {
  return (
    <>
      {points.map((point) => {
        const isSelected = selectedId === point.id;
        return (
          <Group
            key={point.id}
            x={point.x}
            y={point.y}
            draggable
            onMouseDown={(event) => {
              event.cancelBubble = true;
            }}
            onDragStart={() => onSelect(point.id)}
            onDragMove={(event) => onMove(point.id, event.target.x(), event.target.y())}
          >
            <Circle
              name="annotation-point"
              radius={isSelected ? 6 : 5}
              fill={isSelected ? "#f8fafc" : "#38bdf8"}
              stroke={isSelected ? "#0ea5e9" : "#082f49"}
              strokeWidth={2}
              onClick={(event) => handlePointClick(event, point, onSelect, onPointClick)}
              onTap={(event) => handlePointClick(event, point, onSelect, onPointClick)}
            />
            <Text
              x={8}
              y={-18}
              text={point.name}
              fontSize={12}
              fill="#e0f2fe"
              listening={false}
            />
          </Group>
        );
      })}
    </>
  );
}

function handlePointClick(
  event: KonvaEventObject<Event>,
  point: DesignPoint,
  onSelect: (id: string) => void,
  onPointClick: (point: DesignPoint) => void
) {
  event.cancelBubble = true;
  onSelect(point.id);
  onPointClick(point);
}

export default PointsLayer;
