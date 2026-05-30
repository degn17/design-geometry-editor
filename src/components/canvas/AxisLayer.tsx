import type { KonvaEventObject } from "konva/lib/Node";
import { Fragment, useMemo } from "react";
import { Line, Text } from "react-konva";
import type { DesignAxis, DesignPoint } from "../../types/editor";

interface AxisLayerProps {
  axes: DesignAxis[];
  points: DesignPoint[];
  selectedId: string | null;
  onSelect(id: string): void;
}

function AxisLayer({ axes, points, selectedId, onSelect }: AxisLayerProps) {
  const pointsById = useMemo(() => new Map(points.map((point) => [point.id, point])), [points]);

  return (
    <>
      {axes.map((axis) => {
        const start = pointsById.get(axis.startPointId);
        const end = pointsById.get(axis.endPointId);

        if (!start || !end) {
          return null;
        }

        const isSelected = selectedId === axis.id;
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        return (
          <Fragment key={axis.id}>
            <Line
              name="annotation-axis"
              points={[start.x, start.y, end.x, end.y]}
              stroke={isSelected ? "#f8fafc" : "#3b82f6"}
              strokeWidth={isSelected ? 4 : 3}
              hitStrokeWidth={12}
              onMouseDown={(event) => {
                event.cancelBubble = true;
              }}
              onClick={(event) => handleSelect(event, axis.id, onSelect)}
              onTap={(event) => handleSelect(event, axis.id, onSelect)}
            />
            <Text
              x={midX + 8}
              y={midY - 18}
              text={`${axis.name} ${Math.round(axis.currentLength)}px`}
              fontSize={12}
              fill={isSelected ? "#f8fafc" : "#bfdbfe"}
              listening={false}
            />
          </Fragment>
        );
      })}
    </>
  );
}

function handleSelect(
  event: KonvaEventObject<Event>,
  id: string,
  onSelect: (id: string) => void
) {
  event.cancelBubble = true;
  onSelect(id);
}

export default AxisLayer;
