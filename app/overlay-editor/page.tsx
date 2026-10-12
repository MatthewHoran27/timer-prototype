"use client";

import { useEffect, useRef, useState } from "react";
import {
  startCameraFeed,
  stopCameraFeed,
  type CameraStatus,
} from "@/services/camera-feed-service";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const HANDLE_SIZE = 14;
const MIN_CAMERA_WIDTH = 160;
const MIN_CAMERA_HEIGHT = 90;
const MIN_TIMER_WIDTH = 180;
const MIN_TIMER_HEIGHT = 80;

type OverlayElement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type LayerName = "camera" | "timer";

type Interaction = {
  pointerId: number;
  layer: LayerName;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  startRect: OverlayElement;
};

export default function OverlayEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const cameraStatusRef = useRef<CameraStatus>("idle");
  const cameraRectRef = useRef<OverlayElement>({ x: 40, y: 120, width: 720, height: 405 });
  const timerRectRef = useRef<OverlayElement>({ x: 880, y: 40, width: 320, height: 120 });

  const [cameraRect, setCameraRect] = useState<OverlayElement>(cameraRectRef.current);
  const [timerRect, setTimerRect] = useState<OverlayElement>(timerRectRef.current);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const getPointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const getResizeHandleRect = (element: OverlayElement) => ({
    x: element.x + element.width - HANDLE_SIZE,
    y: element.y + element.height - HANDLE_SIZE,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
  });

  const isInsideRect = (x: number, y: number, element: OverlayElement) => {
    return x >= element.x && x <= element.x + element.width && y >= element.y && y <= element.y + element.height;
  };

  const getLayerFromPoint = (x: number, y: number) => {
    const timerResizeHandle = getResizeHandleRect(timerRectRef.current);
    if (isInsideRect(x, y, timerResizeHandle)) {
      return { layer: "timer" as const, mode: "resize" as const };
    }

    if (isInsideRect(x, y, timerRectRef.current)) {
      return { layer: "timer" as const, mode: "move" as const };
    }

    const cameraResizeHandle = getResizeHandleRect(cameraRectRef.current);
    if (isInsideRect(x, y, cameraResizeHandle)) {
      return { layer: "camera" as const, mode: "resize" as const };
    }

    if (isInsideRect(x, y, cameraRectRef.current)) {
      return { layer: "camera" as const, mode: "move" as const };
    }

    return null;
  };

  const clampMoveRect = (element: OverlayElement) => {
    return {
      ...element,
      x: Math.max(0, Math.min(element.x, CANVAS_WIDTH - element.width)),
      y: Math.max(0, Math.min(element.y, CANVAS_HEIGHT - element.height)),
    };
  };

  const clampResizeRect = (layer: LayerName, element: OverlayElement) => {
    const minWidth = layer === "camera" ? MIN_CAMERA_WIDTH : MIN_TIMER_WIDTH;
    const minHeight = layer === "camera" ? MIN_CAMERA_HEIGHT : MIN_TIMER_HEIGHT;

    const width = Math.max(minWidth, Math.min(element.width, CANVAS_WIDTH - element.x));
    const height = Math.max(minHeight, Math.min(element.height, CANVAS_HEIGHT - element.y));

    return { ...element, width, height };
  };

  const updateLayerRect = (layer: LayerName, nextRect: OverlayElement) => {
    if (layer === "camera") {
      cameraRectRef.current = nextRect;
      setCameraRect(nextRect);
      return;
    }

    timerRectRef.current = nextRect;
    setTimerRect(nextRect);
  };

  const drawLayerSelection = (
    context: CanvasRenderingContext2D,
    element: OverlayElement,
    label: string,
    color: string,
  ) => {
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.strokeRect(element.x, element.y, element.width, element.height);

    const handle = getResizeHandleRect(element);
    context.fillStyle = color;
    context.fillRect(handle.x, handle.y, handle.width, handle.height);

    context.fillStyle = color;
    context.font = "500 20px sans-serif";
    context.fillText(label, element.x + 8, element.y - 10);
  };

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "#111827";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const video = videoRef.current;
    const cameraLayer = cameraRectRef.current;

    if (cameraStatusRef.current === "running" && video) {
      context.drawImage(video, cameraLayer.x, cameraLayer.y, cameraLayer.width, cameraLayer.height);
    } else {
      context.fillStyle = "#1f2937";
      context.fillRect(cameraLayer.x, cameraLayer.y, cameraLayer.width, cameraLayer.height);
      context.fillStyle = "#e5e7eb";
      context.font = "500 24px sans-serif";
      context.fillText("Camera feed", cameraLayer.x + 16, cameraLayer.y + 40);
      context.font = "400 18px sans-serif";
      context.fillText("off", cameraLayer.x + 16, cameraLayer.y + 68);
    }

    const timerLayer = timerRectRef.current;
    context.fillStyle = "rgba(17, 24, 39, 0.62)";
    context.fillRect(timerLayer.x, timerLayer.y, timerLayer.width, timerLayer.height);
    context.fillStyle = "#f9fafb";
    context.font = "600 32px sans-serif";
    context.fillText("Timer: 0.00", timerLayer.x + 20, timerLayer.y + 64);

    drawLayerSelection(context, cameraLayer, "Camera", "#60a5fa");
    drawLayerSelection(context, timerLayer, "Timer", "#fbbf24");
  };

  const stopLoop = () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const startLoop = () => {
    if (animationFrameRef.current !== null) return;

    const renderFrame = () => {
      drawScene();
      animationFrameRef.current = window.requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = window.requestAnimationFrame(renderFrame);
  };

  const handleStartCamera = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      setErrorMessage("");
      setCameraStatus("starting");
      streamRef.current = await startCameraFeed(video);
      setCameraStatus("running");
    } catch {
      setCameraStatus("error");
      setErrorMessage("Could not start camera feed. Check browser camera permission.");
    }
  };

  const handleStopCamera = () => {
    stopCameraFeed(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus("idle");
  };

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPointerPosition(event);
    if (!point) return;

    const hitLayer = getLayerFromPoint(point.x, point.y);
    if (!hitLayer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const startRect = hitLayer.layer === "camera" ? cameraRectRef.current : timerRectRef.current;

    interactionRef.current = {
      pointerId: event.pointerId,
      layer: hitLayer.layer,
      mode: hitLayer.mode,
      startX: point.x,
      startY: point.y,
      startRect,
    };

    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = hitLayer.mode === "resize" ? "nwse-resize" : "grabbing";
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getPointerPosition(event);
    if (!point) return;

    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) {
      const hoverLayer = getLayerFromPoint(point.x, point.y);
      if (!hoverLayer) {
        canvas.style.cursor = "default";
      } else {
        canvas.style.cursor = hoverLayer.mode === "resize" ? "nwse-resize" : "grab";
      }
      return;
    }

    const deltaX = point.x - interaction.startX;
    const deltaY = point.y - interaction.startY;

    if (interaction.mode === "move") {
      const movedRect = clampMoveRect({
        ...interaction.startRect,
        x: interaction.startRect.x + deltaX,
        y: interaction.startRect.y + deltaY,
      });

      updateLayerRect(interaction.layer, movedRect);
      return;
    }

    const resizedRect = clampResizeRect(interaction.layer, {
      ...interaction.startRect,
      width: interaction.startRect.width + deltaX,
      height: interaction.startRect.height + deltaY,
    });

    updateLayerRect(interaction.layer, resizedRect);
  };

  const handleCanvasPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (interactionRef.current && interactionRef.current.pointerId === event.pointerId) {
      interactionRef.current = null;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      canvas.style.cursor = "default";
    }
  };

  useEffect(() => {
    cameraRectRef.current = cameraRect;
  }, [cameraRect]);

  useEffect(() => {
    timerRectRef.current = timerRect;
  }, [timerRect]);

  useEffect(() => {
    cameraStatusRef.current = cameraStatus;
  }, [cameraStatus]);

  useEffect(() => {
    startLoop();

    return () => {
      stopCameraFeed(streamRef.current);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      stopLoop();
    };
  }, []);

  return (
    <main className="overlay-page">
      <h1>Overlay Editor</h1>
      <p>Starting point for HTML5 canvas stream overlay composition with camera feed.</p>

      <div className="overlay-controls">
        <button type="button" onClick={handleStartCamera} disabled={cameraStatus === "starting" || cameraStatus === "running"}>
          Start camera
        </button>
        <button type="button" onClick={handleStopCamera} disabled={cameraStatus !== "running"}>
          Stop camera
        </button>
        <span className="overlay-status">Status: {cameraStatus}</span>
      </div>

      <p className="overlay-help">Drag inside Camera or Timer to move. Drag bottom-right handle to resize.</p>

      {errorMessage ? <p className="overlay-error">{errorMessage}</p> : null}

      <video ref={videoRef} className="overlay-video" muted playsInline />

      <canvas
        ref={canvasRef}
        className="overlay-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
      />
    </main>
  );
}
