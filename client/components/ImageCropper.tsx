import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crop, X, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageDataUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );

  const loadImage = useCallback(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      setImageLoaded(true);

      // Center the crop
      const size = Math.min(img.width, img.height) * 0.8;
      setCrop({
        x: (img.width - size) / 2,
        y: (img.height - size) / 2,
        size,
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useState(() => {
    loadImage();
  });

  const drawImageToCanvas = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 300; // Output size
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Save context state
    ctx.save();

    // Apply zoom and rotation
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw the cropped image
    const sourceX = crop.x;
    const sourceY = crop.y;
    const sourceSize = crop.size;

    ctx.drawImage(
      originalImage,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      -size / 2 / zoom,
      -size / 2 / zoom,
      size / zoom,
      size / zoom,
    );

    // Restore context state
    ctx.restore();
  }, [originalImage, crop, zoom, rotation]);

  useState(() => {
    drawImageToCanvas();
  });

  const handleCropChange = (type: string, value: number) => {
    setCrop((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleCrop = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(dataUrl);
  };

  const resetCrop = () => {
    if (!originalImage) return;
    const size = Math.min(originalImage.width, originalImage.height) * 0.8;
    setCrop({
      x: (originalImage.width - size) / 2,
      y: (originalImage.height - size) / 2,
      size,
    });
    setZoom(1);
    setRotation(0);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Crop className="w-5 h-5 mr-2" />
            Crop Profile Image
          </DialogTitle>
          <DialogDescription>
            Adjust your image by moving the crop area, zooming, or rotating. The
            final image will be circular.
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Preview Area */}
          <div className="space-y-4">
            <div
              className="relative bg-gray-100 rounded-lg overflow-hidden"
              style={{ aspectRatio: "1" }}
            >
              {imageLoaded && originalImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={imageSrc}
                    alt="Original"
                    className="w-full h-full object-contain"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: "center",
                    }}
                  />

                  {/* Crop overlay */}
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20"
                    style={{
                      left: `${(crop.x / originalImage.width) * 100}%`,
                      top: `${(crop.y / originalImage.height) * 100}%`,
                      width: `${(crop.size / originalImage.width) * 100}%`,
                      height: `${(crop.size / originalImage.height) * 100}%`,
                    }}
                  >
                    {/* Crop handles */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600 text-center">
              Original Image Preview
            </div>
          </div>

          {/* Controls and Result */}
          <div className="space-y-6">
            {/* Result Preview */}
            <div className="space-y-3">
              <h4 className="font-medium">Preview</h4>
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                    style={{ display: imageLoaded ? "block" : "none" }}
                  />
                  {!imageLoaded && (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center">
                    <ZoomIn className="w-4 h-4 mr-1" />
                    Zoom
                  </label>
                  <span className="text-sm text-gray-500">
                    {zoom.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center">
                    <RotateCw className="w-4 h-4 mr-1" />
                    Rotation
                  </label>
                  <span className="text-sm text-gray-500">{rotation}°</span>
                </div>
                <Slider
                  value={[rotation]}
                  onValueChange={(value) => setRotation(value[0])}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>

              {originalImage && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position X</label>
                    <Slider
                      value={[crop.x]}
                      onValueChange={(value) => handleCropChange("x", value[0])}
                      min={0}
                      max={originalImage.width - crop.size}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position Y</label>
                    <Slider
                      value={[crop.y]}
                      onValueChange={(value) => handleCropChange("y", value[0])}
                      min={0}
                      max={originalImage.height - crop.size}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Crop Size</label>
                    <Slider
                      value={[crop.size]}
                      onValueChange={(value) =>
                        handleCropChange("size", value[0])
                      }
                      min={50}
                      max={Math.min(originalImage.width, originalImage.height)}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetCrop} className="flex-1">
                Reset
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCrop}
                disabled={!imageLoaded}
                className="flex-1"
              >
                <Crop className="w-4 h-4 mr-2" />
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
