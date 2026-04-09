import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Upload, Check, RefreshCw, Move } from "lucide-react";
import DiscardChangesModal from "../DiscardChangesModal"; // adjust path as needed

// ─────────────────────────────────────────────
//  Utility: draw canvas with transform
// ─────────────────────────────────────────────
function drawCanvas({ canvas, image, zoom, offset, rotation }) {
  if (!canvas || !image) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(zoom, zoom);
  ctx.translate(offset.x, offset.y);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  ctx.restore();

  // Circular clip overlay
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────────
//  Main AvatarEditorModal
// ─────────────────────────────────────────────
const AvatarEditorModal = ({ currentSrc, onClose, onSave }) => {
  // "upload" = pick-a-file screen, "edit" = editor screen
  const [step, setStep] = useState("upload");
  const [imageSrc, setImageSrc] = useState(null);
  const [loadedImage, setLoadedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draggingFile, setDraggingFile] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animFrameRef = useRef(null);
  // Stores the cover-zoom baseline so we can detect real changes vs reset state
  const initialStateRef = useRef({ zoom: 1, offset: { x: 0, y: 0 }, rotation: 0 });

  const CANVAS_SIZE = 320;

  // Load image whenever imageSrc changes — auto-fit to fill the circle
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.max(
        CANVAS_SIZE / img.naturalWidth,
        CANVAS_SIZE / img.naturalHeight
      );
      // Save initial state so reset and discard detection work correctly
      initialStateRef.current = { zoom: scale, offset: { x: 0, y: 0 }, rotation: 0 };
      setZoom(scale);
      setOffset({ x: 0, y: 0 });
      setRotation(0);
      setLoadedImage(img);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Clamp zoom: minimum is always "cover" so image never leaves the circle
  const getMinZoom = () => {
    if (!loadedImage) return 0.5;
    return Math.max(
      CANVAS_SIZE / loadedImage.naturalWidth,
      CANVAS_SIZE / loadedImage.naturalHeight
    );
  };

  // Render canvas
  useEffect(() => {
    if (!loadedImage || !canvasRef.current) return;
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      drawCanvas({ canvas: canvasRef.current, image: loadedImage, zoom, offset, rotation });
    });
  }, [loadedImage, zoom, offset, rotation]);

  // ── Clamp offset so image always covers the circle ──
  const clampOffset = useCallback((ox, oy, currentZoom, currentRotation) => {
    if (!loadedImage) return { x: ox, y: oy };

    // Half-dimensions of the image at current zoom (in image-space, before zoom applied by canvas)
    const rad = (currentRotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));

    // Rotated bounding box of the image at zoom=1 (image-space)
    const rw = (loadedImage.naturalWidth * cos + loadedImage.naturalHeight * sin) / 2;
    const rh = (loadedImage.naturalWidth * sin + loadedImage.naturalHeight * cos) / 2;

    // In image-space, the circle radius maps to CANVAS_SIZE / 2 / zoom
    const circleR = CANVAS_SIZE / 2 / currentZoom;

    const maxX = Math.max(0, rw - circleR);
    const maxY = Math.max(0, rh - circleR);

    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  }, [loadedImage]);

  // ── Pointer drag ──
  const getPoint = (e) => {
    const touch = e.touches?.[0];
    return { x: touch ? touch.clientX : e.clientX, y: touch ? touch.clientY : e.clientY };
  };

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(getPoint(e));
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!isDragging || !dragStart) return;
    e.preventDefault();
    const pt = getPoint(e);
    const dx = (pt.x - dragStart.x) / zoom;
    const dy = (pt.y - dragStart.y) / zoom;
    setOffset((prev) => {
      const next = { x: prev.x + dx, y: prev.y + dy };
      return clampOffset(next.x, next.y, zoom, rotation);
    });
    setDragStart(pt);
  }, [isDragging, dragStart, zoom, rotation, clampOffset]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // ── Wheel zoom ──
  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((z) => {
      const next = Math.min(4, Math.max(getMinZoom(), z - e.deltaY * 0.001));
      // Re-clamp offset at new zoom level
      setOffset((o) => clampOffset(o.x, o.y, next, rotation));
      return next;
    });
  }, [loadedImage, rotation, clampOffset]);

  // ── File upload / drag-drop ──
  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    // zoom/offset/rotation are reset inside the useEffect onload handler
    setStep("edit");
  };

  const handleFileChange = (e) => loadFile(e.target.files?.[0]);

  const onDragOver  = (e) => { e.preventDefault(); setDraggingFile(true); };
  const onDragLeave = ()  => setDraggingFile(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setDraggingFile(false);
    loadFile(e.dataTransfer.files?.[0]);
  };

  const handleReset = () => {
    const { zoom: z, offset: o, rotation: r } = initialStateRef.current;
    setZoom(z);
    setOffset(o);
    setRotation(r);
  };

  // True only if the user has made real changes from the initial loaded state
  const hasEdits = () => {
    if (step !== "edit") return false;
    const init = initialStateRef.current;
    return (
      Math.abs(zoom - init.zoom) > 0.001 ||
      Math.abs(offset.x - init.offset.x) > 0.001 ||
      Math.abs(offset.y - init.offset.y) > 0.001 ||
      rotation !== init.rotation
    );
  };

  // Only warn if there are actual edits beyond the initial loaded state
  const handleAttemptClose = () => {
    if (hasEdits()) setShowDiscard(true);
    else onClose();
  };

  // ── Save / export ──
  const handleSave = () => {
    if (!canvasRef.current) return;
    setSaving(true);
    setTimeout(() => {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSave(dataUrl);
      setSaving(false);
      onClose();
    }, 400);
  };

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={handleAttemptClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl"
        style={{ maxHeight: "calc(100dvh - 32px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Shared Header ── */}
        <div className="bg-gradient-to-r from-[#0060A9] to-[#00B4FA] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter">
              {step === "upload" ? "Upload Photo" : "Edit Photo"}
            </h2>
            <p className="text-blue-100 text-[10px] font-bold tracking-widest uppercase opacity-80">
              {step === "upload" ? "Choose an image to get started" : "Drag · Zoom · Rotate"}
            </p>
          </div>
          <button onClick={handleAttemptClose} className="p-2 rounded-full bg-black/10 hover:bg-white/20 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* ══════════════════════════════════════
            STEP 1 — Upload
        ══════════════════════════════════════ */}
        {step === "upload" && (
          <>
            <div className="px-6 py-8 flex flex-col items-center gap-5">
              {/* Drop zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed py-12 px-6 cursor-pointer transition-all duration-200
                  ${draggingFile
                    ? "border-[#0060A9] bg-blue-50 scale-[1.02]"
                    : "border-gray-200 bg-gray-50 hover:border-[#0060A9] hover:bg-blue-50/40"
                  }`}
              >
                <div className={`p-4 rounded-full transition-colors ${draggingFile ? "bg-blue-100" : "bg-gray-100"}`}>
                  <Upload size={28} className={draggingFile ? "text-[#0060A9]" : "text-gray-400"} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-gray-700 uppercase tracking-wide">
                    {draggingFile ? "Drop it!" : "Upload a Photo"}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium mt-1">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-[10px] text-gray-300 font-medium mt-0.5">
                    JPG, PNG, GIF, WEBP supported
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Or keep current — only shown when there's an existing avatar */}
              {currentSrc && (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <button
                    onClick={() => {
                      setImageSrc(currentSrc);
                      setStep("edit");
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                  >
                    <img
                      src={currentSrc}
                      alt="Current"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <div className="text-left">
                      <p className="text-[11px] font-black text-gray-600 uppercase tracking-wide">
                        Edit Current Photo
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">Crop or adjust your existing photo</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl text-[10px] font-black text-gray-500 uppercase hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════
            STEP 2 — Editor
        ══════════════════════════════════════ */}
        {step === "edit" && (
          <>
            <div className="flex flex-col items-center px-6 pt-6 pb-3 gap-4">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Move size={11} /> Drag to reposition · Scroll to zoom
              </p>

              {/* Circle canvas */}
              <div
                className="relative"
                style={{
                  width: CANVAS_SIZE,
                  height: CANVAS_SIZE,
                  cursor: isDragging ? "grabbing" : "grab",
                  userSelect: "none",
                }}
              >
                <div
                  className="absolute inset-0 rounded-full pointer-events-none z-10"
                  style={{
                    border: "2px dashed rgba(0,96,169,0.5)",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
                  }}
                />
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="rounded-full block"
                  onMouseDown={onPointerDown}
                  onMouseMove={onPointerMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={onPointerUp}
                  onTouchStart={onPointerDown}
                  onTouchMove={onPointerMove}
                  onTouchEnd={onPointerUp}
                  onWheel={onWheel}
                  style={{ touchAction: "none" }}
                />
              </div>

              {/* Zoom Slider */}
              <div className="w-full flex items-center gap-3 px-1">
                <button
                  onClick={() => {
                    const next = Math.max(getMinZoom(), zoom - 0.01);
                    setZoom(next);
                    setOffset((o) => clampOffset(o.x, o.y, next, rotation));
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors active:scale-90"
                  title="Zoom out 1%"
                >
                  <ZoomOut size={16} className="text-gray-400 shrink-0" />
                </button>
                <input
                  type="range" min={getMinZoom()} max={4} step={0.01} value={zoom}
                  onChange={(e) => {
                    const next = parseFloat(e.target.value);
                    setZoom(next);
                    setOffset((o) => clampOffset(o.x, o.y, next, rotation));
                  }}
                  className="flex-1 accent-[#0060A9]"
                />
                <button
                  onClick={() => {
                    const next = Math.min(4, zoom + 0.01);
                    setZoom(next);
                    setOffset((o) => clampOffset(o.x, o.y, next, rotation));
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors active:scale-90"
                  title="Zoom in 1%"
                >
                  <ZoomIn size={16} className="text-gray-400 shrink-0" />
                </button>
                <span className="text-[10px] font-black text-gray-400 w-10 text-right tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Rotation */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setRotation((r) => {
                    const next = r - 90;
                    setOffset((o) => clampOffset(o.x, o.y, zoom, next));
                    return next;
                  })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border-2 border-gray-100 text-[10px] font-black text-gray-500 uppercase hover:bg-gray-50 hover:border-gray-200 transition-all"
                >
                  <RotateCcw size={13} /> –90°
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border-2 border-gray-100 text-[10px] font-black text-gray-500 uppercase hover:bg-gray-50 hover:border-gray-200 transition-all"
                >
                  <RefreshCw size={13} /> Reset
                </button>
                <button
                  onClick={() => setRotation((r) => {
                    const next = r + 90;
                    setOffset((o) => clampOffset(o.x, o.y, zoom, next));
                    return next;
                  })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border-2 border-gray-100 text-[10px] font-black text-gray-500 uppercase hover:bg-gray-50 hover:border-gray-200 transition-all"
                >
                  <RotateCw size={13} /> +90°
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-3">
              {/* ← Back to upload */}
              <button
                onClick={() => { setStep("upload"); setImageSrc(null); setLoadedImage(null); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-blue-100 text-[10px] font-black text-[#0060A9] uppercase hover:bg-blue-50 transition-all"
              >
                <Upload size={13} /> Change
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleAttemptClose}
                  className="px-5 py-2.5 rounded-2xl text-[10px] font-black text-gray-500 uppercase hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black bg-[#0060A9] text-white hover:bg-[#00B4FA] shadow-lg shadow-blue-200 uppercase transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                  {saving ? "Saving…" : "Apply"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(
    <>
      {modal}
      {showDiscard && (
        <DiscardChangesModal
          onDiscard={() => { setShowDiscard(false); onClose(); }}
          onKeepEditing={() => setShowDiscard(false)}
        />
      )}
    </>,
    document.body
  );
};

export default AvatarEditorModal;