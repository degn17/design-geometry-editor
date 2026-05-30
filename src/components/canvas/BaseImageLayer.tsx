import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";

interface BaseImageLayerProps {
  imageUrl: string;
  width: number;
  height: number;
}

function BaseImageLayer({ imageUrl, width, height }: BaseImageLayerProps) {
  const image = useLoadedImage(imageUrl);

  return <KonvaImage image={image ?? undefined} width={width} height={height} />;
}

function useLoadedImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextImage = new Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = src;

    return () => {
      nextImage.onload = null;
    };
  }, [src]);

  return image;
}

export default BaseImageLayer;
