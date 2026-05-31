import type { KonvaEventObject } from "konva/lib/Node";
import { Fragment } from "react";
import { Rect, Text } from "react-konva";
import type { DesignRegion } from "../../types/editor";

interface RegionLayerProps {
  regions: DesignRegion[];
  selectedId: string | null;
  onSelect(id: string): void;
  onResize(id: string, width: number, height: number): void;
}

const MIN_REGION_SIZE = 10;
const HANDLE_SIZE = 10;

function RegionLayer({ regions, selectedId, onSelect, onResize }: RegionLayerProps) {
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
            {isSelected ? (
              <Rect
                x={region.x + region.width - HANDLE_SIZE / 2}
                y={region.y + region.height - HANDLE_SIZE / 2}
                width={HANDLE_SIZE}
                height={HANDLE_SIZE}
                fill="#e0f2fe"
                stroke="#0284c7"
                strokeWidth={1}
                draggable
                onMouseDown={(event) => {
                  event.cancelBubble = true;
                }}
                onDragMove={(event) => {
                  event.cancelBubble = true;
                  const nextWidth = Math.max(
                    MIN_REGION_SIZE,
                    event.target.x() - region.x + HANDLE_SIZE / 2
                  );
                  const nextHeight = Math.max(
                    MIN_REGION_SIZE,
                    event.target.y() - region.y + HANDLE_SIZE / 2
                  );
                  onResize(region.id, nextWidth, nextHeight);
                }}
                onDragEnd={(event) => {
                  event.cancelBubble = true;
                  const nextWidth = Math.max(
                    MIN_REGION_SIZE,
                    event.target.x() - region.x + HANDLE_SIZE / 2
                  );
                  const nextHeight = Math.max(
                    MIN_REGION_SIZE,
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

export default RegionLayer;
