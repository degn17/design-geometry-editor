import type { KonvaEventObject } from "konva/lib/Node";
import { Fragment } from "react";
import { Rect, Text } from "react-konva";
import type { DesignRegion } from "../../types/editor";

interface RegionLayerProps {
  regions: DesignRegion[];
  selectedId: string | null;
  onSelect(id: string): void;
}

function RegionLayer({ regions, selectedId, onSelect }: RegionLayerProps) {
  return (
    <>
      {regions.map((region) => {
        const isSelected = selectedId === region.id;
        return (
          <Fragment key={region.id}>
            <Rect
              name="annotation-region"
              x={region.x}
              y={region.y}
              width={region.width}
              height={region.height}
              fill="rgba(14, 165, 233, 0.22)"
              stroke={isSelected ? "#f8fafc" : "#38bdf8"}
              strokeWidth={isSelected ? 3 : 2}
              dash={[8, 5]}
              onMouseDown={(event) => {
                event.cancelBubble = true;
              }}
              onClick={(event) => handleSelect(event, region.id, onSelect)}
              onTap={(event) => handleSelect(event, region.id, onSelect)}
            />
            <Text
              x={region.x + 8}
              y={region.y + 8}
              text={region.name}
              fontSize={12}
              fill="#e0f2fe"
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

export default RegionLayer;
