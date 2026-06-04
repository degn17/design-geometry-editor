import type { KonvaEventObject } from "konva/lib/Node";
import { Fragment, useRef } from "react";
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
  const vectorDragPointIdsRef = useRef(new Set<string>());

  return (
    <>
      {points.map((point) => {
        const isSelected = selectedId === point.id;
        const displacement = point.displacement?.enabled ? point.displacement : null;
        return (
          <Fragment key={point.id}>
            {displacement ? (
              <PointDisplacementView
                point={point}
                displacement={displacement}
                onSelect={() => onSelect(point.id)}
                onTargetMove={(targetX, targetY) =>
                  onDisplacement(point.id, createDisplacement(point, targetX, targetY))
                }
              />
            ) : null}
            <Group
              x={point.x}
              y={point.y}
              draggable
              onMouseDown={(event) => {
                event.cancelBubble = true;
              }}
              onDragStart={(event) => {
                onSelect(point.id);
                if (isVectorDrag(event)) {
                  vectorDragPointIdsRef.current.add(point.id);
                  resetDraggedPointPosition(event, point);
                }
              }}
              onDragMove={(event) => {
                if (isVectorDrag(event) || vectorDragPointIdsRef.current.has(point.id)) {
                  vectorDragPointIdsRef.current.add(point.id);
                  const target = getLocalPointerPosition(event) ?? {
                    x: event.target.x(),
                    y: event.target.y(),
                  };
                  onDisplacement(point.id, createDisplacement(point, target.x, target.y));
                  resetDraggedPointPosition(event, point);
                  return;
                }

                onMove(point.id, event.target.x(), event.target.y());
              }}
              onDragEnd={(event) => {
                if (isVectorDrag(event) || vectorDragPointIdsRef.current.has(point.id)) {
                  resetDraggedPointPosition(event, point);
                  vectorDragPointIdsRef.current.delete(point.id);
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
  onSelect,
  onTargetMove,
}: {
  point: DesignPoint;
  displacement: PointDisplacement;
  onSelect(): void;
  onTargetMove(targetX: number, targetY: number): void;
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
      <Group
        x={displacement.targetX}
        y={displacement.targetY}
        draggable
        onMouseDown={(event) => {
          event.cancelBubble = true;
          onSelect();
        }}
        onDragStart={(event) => {
          event.cancelBubble = true;
          onSelect();
        }}
        onDragMove={(event) => {
          event.cancelBubble = true;
          onTargetMove(event.target.x(), event.target.y());
        }}
        onDragEnd={(event) => {
          event.cancelBubble = true;
          onTargetMove(event.target.x(), event.target.y());
        }}
      >
        <Circle
          radius={7}
          fill="rgba(15, 23, 42, 0.25)"
          stroke="#fed7aa"
          strokeWidth={2}
          dash={[4, 4]}
        />
        <Text
          x={10}
          y={8}
          text="Vector Target"
          fontSize={12}
          fill="#fed7aa"
          opacity={0.85}
          listening={false}
        />
      </Group>
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

function getLocalPointerPosition(event: KonvaEventObject<DragEvent>) {
  const stage = event.target.getStage();
  const parent = event.target.getParent();
  const pointer = stage?.getPointerPosition();

  if (!parent || !pointer) {
    return null;
  }

  return parent.getAbsoluteTransform().copy().invert().point(pointer);
}

function resetDraggedPointPosition(event: KonvaEventObject<DragEvent>, point: DesignPoint) {
  event.target.position({ x: point.x, y: point.y });
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
