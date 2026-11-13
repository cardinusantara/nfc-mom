"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, X, Check, Image as ImageIcon } from "lucide-react";

export interface PhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCrop: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export function PhotoCropModal({
  isOpen,
  imageSrc,
  onCrop,
  onCancel,
}: PhotoCropModalProps) {
  const VIEWPORT_SIZE = 300; // Interactive viewport size in px
  const OUTPUT_SIZE = 400; // Crisp export dimension in px

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isRoundMask, setIsRoundMask] = useState<boolean>(true);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Clamp pan so image does not expose blank areas
  const clampPan = useCallback(
    (nextPan: { x: number; y: number }, currentZoom: number, img: HTMLImageElement) => {
      const baseScale = Math.max(
        VIEWPORT_SIZE / img.naturalWidth,
        VIEWPORT_SIZE / img.naturalHeight
      );
      const currentW = img.naturalWidth * baseScale * currentZoom;
      const currentH = img.naturalHeight * baseScale * currentZoom;

      const maxPanX = Math.max(0, (currentW - VIEWPORT_SIZE) / 2);
      const maxPanY = Math.max(0, (currentH - VIEWPORT_SIZE) / 2);

      return {
        x: Math.min(maxPanX, Math.max(-maxPanX, nextPan.x)),
        y: Math.min(maxPanY, Math.max(-maxPanY, nextPan.y)),
      };
    },
    [VIEWPORT_SIZE]
  );

  // Redraw preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);

    // High DPI backing store
    const baseScale = Math.max(
      VIEWPORT_SIZE / image.naturalWidth,
      VIEWPORT_SIZE / image.naturalHeight
    );
    const drawW = image.naturalWidth * baseScale * zoom;
    const drawH = image.naturalHeight * baseScale * zoom;

    const clamped = clampPan(pan, zoom, image);

    ctx.save();
    ctx.translate(VIEWPORT_SIZE / 2 + clamped.x, VIEWPORT_SIZE / 2 + clamped.y);
    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [image, zoom, pan, clampPan, VIEWPORT_SIZE]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !image) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextPan = {
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    };
    setPan(clampPan(nextPan, zoom, image));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !image || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    const nextPan = {
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    };
    setPan(clampPan(nextPan, zoom, image));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => {
      const nextZoom = Math.min(3.0, Math.max(1.0, prev + delta));
      if (image) {
        setPan((prevPan) => clampPan(prevPan, nextZoom, image));
      }
      return nextZoom;
    });
  };

  // Zoom slider change
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = parseFloat(e.target.value);
    setZoom(nextZoom);
    if (image) {
      setPan((prevPan) => clampPan(prevPan, nextZoom, image));
    }
  };

  // Reset adjustments
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Generate crisp 400x400 JPEG output
  const handleConfirm = () => {
    if (!image) return;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = OUTPUT_SIZE;
    exportCanvas.height = OUTPUT_SIZE;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // Background white fill
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const scaleFactor = OUTPUT_SIZE / VIEWPORT_SIZE;
    const baseScale = Math.max(
      VIEWPORT_SIZE / image.naturalWidth,
      VIEWPORT_SIZE / image.naturalHeight
    );
    const drawW = image.naturalWidth * baseScale * zoom * scaleFactor;
    const drawH = image.naturalHeight * baseScale * zoom * scaleFactor;

    const clamped = clampPan(pan, zoom, image);
    const exportPanX = clamped.x * scaleFactor;
    const exportPanY = clamped.y * scaleFactor;

    ctx.save();
    ctx.translate(OUTPUT_SIZE / 2 + exportPanX, OUTPUT_SIZE / 2 + exportPanY);
    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const dataUrl = exportCanvas.toDataURL("image/jpeg", 0.88);
    onCrop(dataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D1627] text-white border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center">
        {/* Modal Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1E4FFF]/20 border border-[#1E4FFF]/40 flex items-center justify-center text-[#00C2D1]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sesuaikan Foto Profil</h2>
              <p className="text-[11px] text-white/60">Geser dan perbesar untuk bingkai 1:1</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Mask and Canvas Container */}
        <div
          onWheel={handleWheel}
          className="relative w-[300px] h-[300px] overflow-hidden rounded-2xl bg-black/60 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing border border-white/20 select-none touch-none"
        >
          <canvas
            ref={canvasRef}
            width={VIEWPORT_SIZE}
            height={VIEWPORT_SIZE}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="block"
          />

          {/* Viewport Cutout Mask Overlay */}
          <div
            className={`pointer-events-none absolute inset-0 ${
              isRoundMask
                ? "rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(3,7,18,0.65)]"
                : "border-2 border-white/80 shadow-[0_0_0_9999px_rgba(3,7,18,0.65)]"
            }`}
          />

          {/* Subtle Viewport Grid Lines */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
            <div className="border-r border-b border-white/50" />
            <div className="border-r border-b border-white/50" />
            <div className="border-b border-white/50" />
            <div className="border-r border-b border-white/50" />
            <div className="border-r border-b border-white/50" />
            <div className="border-b border-white/50" />
            <div className="border-r border-white/50" />
            <div className="border-r border-white/50" />
            <div />
          </div>
        </div>

        {/* Mask Toggle Pill */}
        <div className="flex items-center gap-2 mt-3 text-[11px] text-white/60">
          <span>Pratinjau bingkai:</span>
          <button
            type="button"
            onClick={() => setIsRoundMask(true)}
            className={`px-2 py-0.5 rounded-md transition ${
              isRoundMask
                ? "bg-[#1E4FFF] text-white font-bold"
                : "bg-white/10 hover:bg-white/15 text-white/70"
            }`}
          >
            Lingkaran
          </button>
          <button
            type="button"
            onClick={() => setIsRoundMask(false)}
            className={`px-2 py-0.5 rounded-md transition ${
              !isRoundMask
                ? "bg-[#1E4FFF] text-white font-bold"
                : "bg-white/10 hover:bg-white/15 text-white/70"
            }`}
          >
            Persegi
          </button>
        </div>

        {/* Zoom Slider and Controls */}
        <div className="w-full mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/70 px-1">
            <span className="flex items-center gap-1">
              <ZoomOut className="w-3.5 h-3.5" />
              <span>1.0x</span>
            </span>
            <span className="font-mono text-[11px] text-[#00C2D1] font-bold">
              {zoom.toFixed(2)}x
            </span>
            <span className="flex items-center gap-1">
              <span>3.0x</span>
              <ZoomIn className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.02"
              value={zoom}
              onChange={handleZoomChange}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#1E4FFF]"
            />
            <button
              type="button"
              onClick={handleReset}
              title="Reset Zoom & Posisi"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1E4FFF] to-[#00C2D1] hover:from-[#173ecc] hover:to-[#00a9b7] text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Gunakan Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
