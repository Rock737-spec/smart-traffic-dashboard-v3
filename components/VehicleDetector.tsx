"use client";

import { useEffect, useRef, useState } from "react";

import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

type VehicleDetectorProps = {
  videoURL: string;
  onVehicleCountChange: (count: number) => void;
};

type Detection = cocoSsd.DetectedObject;

export default function VehicleDetector({
  videoURL,
  onVehicleCountChange,
}: VehicleDetectorProps) {
  // ============================================================
  // REFS
  // ============================================================
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);

  // Keep latest callback without putting it in useEffect deps.
  const onVehicleCountChangeRef = useRef(onVehicleCountChange);
  useEffect(() => {
    onVehicleCountChangeRef.current = onVehicleCountChange;
  }, [onVehicleCountChange]);

  // ============================================================
  // STATE
  // ============================================================
  const [modelReady, setModelReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);

  // ============================================================
  // VEHICLE CLASSES / WEIGHTS / THRESHOLDS
  // ============================================================
  const vehicleClasses = ["car", "motorcycle", "bus", "truck"];

  const vehicleWeights: Record<string, number> = {
    car: 1,
    motorcycle: 1,
    bus: 2,
    truck: 2,
  };

  const confidenceThresholds: Record<string, number> = {
    car: 0.2,
    motorcycle: 0.18,
    bus: 0.25,
    truck: 0.25,
  };

  // ============================================================
  // LOAD COCO-SSD
  // ============================================================
  useEffect(() => {
    mountedRef.current = true;

    const loadModel = async () => {
      try {
        setLoading(true);
        await tf.ready();

        const model = await cocoSsd.load({ base: "mobilenet_v2" });

        if (!mountedRef.current) return;

        modelRef.current = model;
        setModelReady(true);
        console.log("COCO-SSD MobileNet V2 loaded successfully");
      } catch (error) {
        console.error("Failed to load COCO-SSD:", error);
        if (mountedRef.current) setModelReady(false);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    loadModel();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ============================================================
  // CANVAS POSITION  — FIXED
  // ============================================================
  //
  // The video renders with `object-contain`. When its native
  // aspect ratio doesn't match the aspect ratio of the box it
  // sits in, the browser shrinks it to fit and adds letterbox /
  // pillarbox bars *inside* that box. The old code measured
  // `video.getBoundingClientRect()` and stretched the canvas
  // across the WHOLE box — bars included — while detection boxes
  // are computed against the native, bar-free frame. That
  // mismatch is what stretched/shifted boxes into the black bars
  // and made some of them look huge.
  //
  // Fix: compute the actual visible sub-rectangle inside the box
  // (the same math the browser uses for object-fit: contain) and
  // align the canvas to THAT rectangle instead of the full box.
  const updateCanvasPosition = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = videoContainerRef.current;

    if (
      !video ||
      !canvas ||
      !container ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();

    if (videoRect.width === 0 || videoRect.height === 0) {
      return;
    }

    const videoAspect = video.videoWidth / video.videoHeight;
    const boxAspect = videoRect.width / videoRect.height;

    let renderWidth = videoRect.width;
    let renderHeight = videoRect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (videoAspect > boxAspect) {
      // Video is relatively wider than its box -> bars top/bottom.
      renderHeight = videoRect.width / videoAspect;
      offsetY = (videoRect.height - renderHeight) / 2;
    } else {
      // Video is relatively narrower than its box -> bars left/right.
      renderWidth = videoRect.height * videoAspect;
      offsetX = (videoRect.width - renderWidth) / 2;
    }

    const left = videoRect.left - containerRect.left + offsetX;
    const top = videoRect.top - containerRect.top + offsetY;

    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    canvas.style.width = `${renderWidth}px`;
    canvas.style.height = `${renderHeight}px`;

    // Internal canvas resolution must match the video's native
    // resolution — that's the coordinate space the model returns
    // boxes in.
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  };

  // ============================================================
  // RESIZE OBSERVER
  // ============================================================
  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasPosition();
    });

    resizeObserver.observe(container);
    window.addEventListener("resize", updateCanvasPosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCanvasPosition);
    };
  }, []);

  // ============================================================
  // RESET WHEN VIDEO CHANGES
  // ============================================================
  useEffect(() => {
    setDetections([]);
    onVehicleCountChangeRef.current(0);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    lastDetectionTimeRef.current = 0;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [videoURL]);

  // ============================================================
  // DRAW DETECTIONS
  // ============================================================
  const drawDetections = (
    detectionsToDraw: Detection[],
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detectionsToDraw.forEach((detection) => {
      let [x, y, width, height] = detection.bbox;

      // Strict boundary clamp — prevents a box from being drawn
      // outside the video frame.
      x = Math.max(0, Math.min(x, canvas.width - 1));
      y = Math.max(0, Math.min(y, canvas.height - 1));
      width = Math.max(1, Math.min(width, canvas.width - x));
      height = Math.max(1, Math.min(height, canvas.height - y));

      if (width < 3 || height < 3) return;

      ctx.save();

      ctx.lineWidth = 4;
      ctx.strokeStyle = "#22d3ee";
      ctx.strokeRect(x, y, width, height);

      const label = `${detection.class.toUpperCase()} ${Math.round(
        detection.score * 100
      )}%`;

      const fontSize = Math.max(
        28,
        Math.min(38, Math.round(Math.min(width, height) * 0.2))
      );

      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      const paddingX = 12;
      const paddingY = 8;

      const textWidth = ctx.measureText(label).width;
      const labelWidth = textWidth + paddingX * 2;
      const labelHeight = fontSize + paddingY * 2;

      let labelX = x;
      let labelY = y - labelHeight - 6;

      if (labelY < 0) labelY = y;

      if (labelX + labelWidth > canvas.width) {
        labelX = canvas.width - labelWidth;
      }
      if (labelX < 0) labelX = 0;

      if (labelY + labelHeight > canvas.height) {
        labelY = canvas.height - labelHeight;
      }
      if (labelY < 0) labelY = 0;

      ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
      ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, labelX + paddingX, labelY + labelHeight / 2);

      ctx.restore();
    });
  };

  // ============================================================
  // VEHICLE DETECTION
  // ============================================================
  const detectVehicles = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const model = modelRef.current;

    if (
      !video ||
      !canvas ||
      !model ||
      !modelReady ||
      video.paused ||
      video.ended ||
      video.readyState < 2
    ) {
      return;
    }

    updateCanvasPosition();

    const now = performance.now();
    if (now - lastDetectionTimeRef.current < 200) {
      animationFrameRef.current = requestAnimationFrame(detectVehicles);
      return;
    }
    lastDetectionTimeRef.current = now;

    try {
      const predictions = await model.detect(video, 40, 0.18);

      const vehicleDetections = predictions.filter((prediction) => {
        if (!vehicleClasses.includes(prediction.class)) return false;

        const threshold = confidenceThresholds[prediction.class] ?? 0.25;
        if (prediction.score < threshold) return false;

        return true;
      });

      // NEW: reject boxes that are implausibly large for this
      // camera angle — a strong signal of a bad detection or a
      // leftover alignment artifact.
      const maxWidthRatio = 0.6;
      const maxHeightRatio = 0.6;

      const usableDetections = vehicleDetections.filter((detection) => {
        const [, , width, height] = detection.bbox;

        const area = width * height;
        const aspectRatio = width / Math.max(height, 1);

        if (
          width > video.videoWidth * maxWidthRatio ||
          height > video.videoHeight * maxHeightRatio
        ) {
          return false;
        }

        if (detection.class === "motorcycle") {
          if (area < 45) return false;
          if (aspectRatio > 3.5) return false;
          return true;
        }

        if (detection.class === "car") {
          if (area < 80) return false;
          if (aspectRatio > 6 || aspectRatio < 0.15) return false;
          return true;
        }

        if (detection.class === "bus") {
          if (area < 180) return false;
          return true;
        }

        if (detection.class === "truck") {
          if (area < 150) return false;
          return true;
        }

        return false;
      });

      drawDetections(usableDetections, video, canvas);
      setDetections(usableDetections);

      const weightedCount = usableDetections.reduce((total, detection) => {
        return total + (vehicleWeights[detection.class] ?? 1);
      }, 0);

      onVehicleCountChangeRef.current(weightedCount);
    } catch (error) {
      console.error("Vehicle detection error:", error);
    }

    if (
      videoRef.current &&
      !videoRef.current.paused &&
      !videoRef.current.ended
    ) {
      animationFrameRef.current = requestAnimationFrame(detectVehicles);
    }
  };

  // ============================================================
  // VIDEO EVENT HANDLERS
  // ============================================================
  const handleLoadedMetadata = () => {
    requestAnimationFrame(() => {
      updateCanvasPosition();
    });
  };

  const handlePlay = () => {
    if (!modelReady) {
      console.log("COCO-SSD model is still loading.");
      return;
    }

    updateCanvasPosition();

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    lastDetectionTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(detectVehicles);
  };

  const stopDetection = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleEnded = () => {
    stopDetection();
    setDetections([]);
    onVehicleCountChangeRef.current(0);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // ============================================================
  // CLEANUP
  // ============================================================
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // ============================================================
  // CURRENT WEIGHTED COUNT
  // ============================================================
  const displayedVehicleCount = detections.reduce(
    (total, detection) => total + (vehicleWeights[detection.class] ?? 1),
    0
  );

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="w-full">
      <div
        ref={videoContainerRef}
        className="relative w-full overflow-hidden rounded-xl border border-slate-700 bg-black"
      >
        <video
          ref={videoRef}
          src={videoURL}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={stopDetection}
          onEnded={handleEnded}
          className="block h-auto max-h-[80vh] min-h-[360px] w-full object-contain bg-black"
        />

        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute z-10"
          style={{ left: 0, top: 0 }}
        />

        <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-lg border border-black/50 bg-black/80 px-3 py-2 text-xs backdrop-blur-sm">
          {loading ? (
            <span className="text-yellow-300">LOADING AI MODEL...</span>
          ) : modelReady ? (
            <span className="text-green-400">● AI DETECTION ACTIVE</span>
          ) : (
            <span className="text-red-400">AI MODEL OFFLINE</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3">
        <div>
          <p className="text-xs text-slate-500">VEHICLES DETECTED</p>
          <p className="mt-1 text-2xl font-bold text-cyan-300">
            {displayedVehicleCount}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">ENGINE</p>
          <p className="mt-1 text-xs font-medium text-cyan-300">COCO-SSD</p>
        </div>
      </div>
    </div>
  );
}