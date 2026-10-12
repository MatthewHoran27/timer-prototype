"use client";

import { useEffect, useRef } from "react";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

export default function OverlayEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "#111827";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    context.strokeStyle = "#4b5563";
    context.lineWidth = 2;
    context.strokeRect(20, 20, CANVAS_WIDTH - 40, CANVAS_HEIGHT - 40);

    context.fillStyle = "#f9fafb";
    context.font = "600 36px sans-serif";
    context.fillText("Stream Overlay Preview", 40, 70);

    context.font = "500 24px sans-serif";
    context.fillText("Timer: 0.00", 40, 130);
  }, []);

  return (
    <main className="overlay-page">
      <h1>Overlay Editor</h1>
      <p>Starting point for HTML5 canvas stream overlay composition.</p>

      <canvas
        ref={canvasRef}
        className="overlay-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
    </main>
  );
}
