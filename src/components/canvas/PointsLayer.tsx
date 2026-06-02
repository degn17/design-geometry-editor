import type { KonvaEventObject } from "konva/lib/Node";
import { Fragment } from "react";
import { Arrow, Circle, Group, Text } from "react-konva";
import type { DesignPoint, PointDisplacement } from "../../types/editor";

interface PointsLayerProps {
  points: DesignPoint[];
  selectedId: string | null;
  onSelect(id: string): void;
  onMove(id: string, x: number, y: number): void;
  onDisplacement(id: string, displacement: PointDisplacement): void;
  onPointClick(point: DesignPoint): void;
}

function PointsLayer({
  points,
  selectedId,
  onSelect,
  onMove,
  onDisplacement,
  onPointClick,
}: PointsLayerProps) {
  return (
    <>
      {points.map((point) => {
        const isSelected = selectedId === point.id;
        const displacement = point.displacement?.enabled ? point.displacement : null;
        return (
          <Fragment key={point.id}>
            {displacement ? <PointDisplacementView point={point} displacement={displacement} /> : null}
            <Group
              x={point.x}
              y={point.y}
              draggable
              onMouseDown={(event) => {
                event.cancelBubble = true;
              }}
              onDragStart={() => onSelect(point.id)}
              onDragMove={(event) => {
                if (isVectorDrag(event)) {
                  const targetX = event.target.x();
                  const targetY = event.target.y();
                  onDisplacement(point.id, createDisplacement(point, targetX, targetY));
                  event.target.position({ x: point.x, y: point.y });
                  return;
                }

                onMove(point.id, event.target.x(), event.target.y());
              }}
              onDragEnd={(event) => {
                if (isVectorDrag(event)) {
                  event.target.position({ x: point.x, y: point.y });
                  return;
                }

                onMove(point.id, event.target.x(), event.target.y());
              }}
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
          </Fragment>
        );
      })}
    </>
  );
}

function PointDisplacementView({
  point,
  displacement,
}: {
  point: DesignPoint;
  displacement: PointDisplacement;
}) {
  return (
    <>
      <Circle
        x={point.x}
        y={point.y}
        radius={displacement.influenceRadius}
        fill="rgba(249, 115, 22, 0.08)"
        stroke="rgba(251, 146, 60, 0.45)"
        strokeWidth={1}
        listening={false}
      />
      <Arrow
        points={[point.x, point.y, displacement.targetX, displacement.targetY]}
        stroke="#fb923c"
        fill="#fb923c"
        strokeWidth={3}
        dash={[8, 6]}
        pointerLength={10}
        pointerWidth={10}
        listening={false}
      />
      <Circle
        x={displacement.targetX}
        y={displacement.targetY}
        radius={6}
        fill="rgba(15, 23, 42, 0.65)"
        stroke="#fed7aa"
        strokeWidth={2}
        listening={false}
      />
      <Text
        x={(point.x + displacement.targetX) / 2 + 8}
        y={(point.y + displacement.targetY) / 2 - 18}
        text={`dx: ${Math.round(displacement.dx)}, dy: ${Math.round(displacement.dy)}`}
        fontSize={12}
        fill="#fed7aa"
        listening={false}
      />
    </>
  );
}

function createDisplacement(
  point: DesignPoint,
  targetX: number,
  targetY: number
): PointDisplacement {
  return {
    dx: targetX - point.x,
    dy: targetY - point.y,
    targetX,
    targetY,
    influenceRadius: point.displacement?.influenceRadius ?? 120,
    enabled: true,
  };
}

function isVectorDrag(event: KonvaEventObject<DragEvent>) {
  return event.evt.metaKey || event.evt.ctrlKey;
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
