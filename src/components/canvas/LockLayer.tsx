import type { KonvaEventObject } from "konva/lib/Node";
import { Fragment } from "react";
import { Rect, Text } from "react-konva";
import type { LockedRegion } from "../../types/editor";

interface LockLayerProps {
  lockedRegions: LockedRegion[];
  selectedId: string | null;
  onSelect(id: string): void;
}

function LockLayer({ lockedRegions, selectedId, onSelect }: LockLayerProps) {
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
              onMouseDown={(event) => {
                event.cancelBubble = true;
              }}
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
