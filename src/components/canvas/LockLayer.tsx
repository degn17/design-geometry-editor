import type { KonvaEventObject } from "konva/lib/Node";
import { Fragment } from "react";
import { Rect, Text } from "react-konva";
import type { LockedRegion } from "../../types/editor";

interface LockLayerProps {
  lockedRegions: LockedRegion[];
  selectedId: string | null;
  onSelect(id: string): void;
  onMove(id: string, x: number, y: number): void;
  onResize(id: string, width: number, height: number): void;
}

const MIN_LOCK_SIZE = 10;
const HANDLE_SIZE = 10;

function LockLayer({ lockedRegions, selectedId, onSelect, onMove, onResize }: LockLayerProps) {
  return (
    <>
      {lockedRegions.map((region) => {
        const isSelected = selectedId === region.id;
        return (
          <Fragment key={region.id}>
            <Rect
              name="annotation-lock"
              x={region.x}
              y={region.y}
              width={region.width}
              height={region.height}
              fill="rgba(249, 115, 22, 0.24)"
              stroke={isSelected ? "#f8fafc" : "#fb923c"}
              strokeWidth={isSelected ? 3 : 2}
              dash={[6, 5]}
              draggable
              onMouseDown={(event) => {
                event.cancelBubble = true;
              }}
              onDragStart={() => onSelect(region.id)}
              onDragMove={(event) => onMove(region.id, event.target.x(), event.target.y())}
              onDragEnd={(event) => onMove(region.id, event.target.x(), event.target.y())}
              onClick={(event) => handleSelect(event, region.id, onSelect)}
              onTap={(event) => handleSelect(event, region.id, onSelect)}
            />
            <Text
              x={region.x + 8}
              y={region.y + 8}
              text={`LOCK ${region.name}`}
              fontSize={12}
              fill="#ffedd5"
              listening={false}
            />
            {isSelected ? (
              <Rect
                x={region.x + region.width - HANDLE_SIZE / 2}
                y={region.y + region.height - HANDLE_SIZE / 2}
                width={HANDLE_SIZE}
                height={HANDLE_SIZE}
                fill="#ffedd5"
                stroke="#ea580c"
                strokeWidth={1}
                draggable
                onMouseDown={(event) => {
                  event.cancelBubble = true;
                }}
                onDragMove={(event) => {
                  event.cancelBubble = true;
                  const nextWidth = Math.max(
                    MIN_LOCK_SIZE,
                    event.target.x() - region.x + HANDLE_SIZE / 2
                  );
                  const nextHeight = Math.max(
                    MIN_LOCK_SIZE,
                    event.target.y() - region.y + HANDLE_SIZE / 2
                  );
                  onResize(region.id, nextWidth, nextHeight);
                }}
                onDragEnd={(event) => {
                  event.cancelBubble = true;
                  const nextWidth = Math.max(
                    MIN_LOCK_SIZE,
                    event.target.x() - region.x + HANDLE_SIZE / 2
                  );
                  const nextHeight = Math.max(
                    MIN_LOCK_SIZE,
                    event.target.y() - region.y + HANDLE_SIZE / 2
                  );
                  onResize(region.id, nextWidth, nextHeight);
                }}
              />
            ) : null}
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

export default LockLayer;
