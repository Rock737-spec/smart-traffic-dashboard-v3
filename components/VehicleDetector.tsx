"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

type VehicleDetectorProps = {
  videoURL: string;

  onVehicleCountChange: (count: number) => void;

  onVideoPlay?: () => void;

  onVideoPause?: () => void;

  onVideoEnded?: () => void;

  /*
   * Sends the actual HTML5 video currentTime
   * to the parent.
   *
   * This is better than using performance.now()
   * because it follows the actual video timeline.
   */
  onVideoTimeChange?: (time: number) => void;
};

type Detection = {
  bbox: [number, number, number, number];
  class: string;
  score: number;
};

const VEHICLE_CLASSES = [
  "car",
  "motorcycle",
  "bus",
  "truck",
];

const VEHICLE_WEIGHTS: Record<string, number> = {
  car: 1,
  motorcycle: 1,
  bus: 2,
  truck: 2,
};

const CONFIDENCE_THRESHOLDS: Record<string, number> = {
  car: 0.2,
  motorcycle: 0.18,
  bus: 0.25,
  truck: 0.25,
};

export default function VehicleDetector({
  videoURL,
  onVehicleCountChange,
  onVideoPlay,
  onVideoPause,
  onVideoEnded,
  onVideoTimeChange,
}: VehicleDetectorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const videoContainerRef =
    useRef<HTMLDivElement | null>(null);

  const modelRef =
    useRef<cocoSsd.ObjectDetection | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const lastDetectionTimeRef =
    useRef(0);

  const mountedRef =
    useRef(true);

  const onVehicleCountChangeRef =
    useRef(onVehicleCountChange);

  const onVideoPlayRef =
    useRef(onVideoPlay);

  const onVideoPauseRef =
    useRef(onVideoPause);

  const onVideoEndedRef =
    useRef(onVideoEnded);

  const onVideoTimeChangeRef =
    useRef(onVideoTimeChange);

  const [modelReady, setModelReady] =
    useState(false);

  const [modelLoading, setModelLoading] =
    useState(true);

  const [detections, setDetections] =
    useState<Detection[]>([]);

  /*
   * ============================================================
   * KEEP CALLBACK REFERENCES UPDATED
   * ============================================================
   */

  useEffect(() => {
    onVehicleCountChangeRef.current =
      onVehicleCountChange;
  }, [onVehicleCountChange]);

  useEffect(() => {
    onVideoPlayRef.current =
      onVideoPlay;
  }, [onVideoPlay]);

  useEffect(() => {
    onVideoPauseRef.current =
      onVideoPause;
  }, [onVideoPause]);

  useEffect(() => {
    onVideoEndedRef.current =
      onVideoEnded;
  }, [onVideoEnded]);

  useEffect(() => {
    onVideoTimeChangeRef.current =
      onVideoTimeChange;
  }, [onVideoTimeChange]);

  /*
   * ============================================================
   * LOAD COCO-SSD MODEL
   * ============================================================
   */

  useEffect(() => {
    mountedRef.current = true;

    const loadModel = async () => {
      try {
        setModelLoading(true);

        const model = await cocoSsd.load({
          base: "mobilenet_v2",
        });

        if (!mountedRef.current) {
          return;
        }

        modelRef.current = model;

        setModelReady(true);
      } catch (error) {
        console.error(
          "Failed to load COCO-SSD model:",
          error
        );
      } finally {
        if (mountedRef.current) {
          setModelLoading(false);
        }
      }
    };

    loadModel();

    return () => {
      mountedRef.current = false;

      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }
    };
  }, []);

  /*
   * ============================================================
   * UPDATE CANVAS POSITION
   *
   * The canvas follows object-contain video rendering.
   * ============================================================
   */

  const updateCanvasPosition =
    useCallback(() => {
      const video = videoRef.current;

      const canvas = canvasRef.current;

      const container =
        videoContainerRef.current;

      if (
        !video ||
        !canvas ||
        !container
      ) {
        return;
      }

      const videoWidth =
        video.videoWidth;

      const videoHeight =
        video.videoHeight;

      if (
        !videoWidth ||
        !videoHeight
      ) {
        return;
      }

      const containerWidth =
        container.clientWidth;

      const containerHeight =
        container.clientHeight;

      if (
        containerWidth <= 0 ||
        containerHeight <= 0
      ) {
        return;
      }

      const videoAspect =
        videoWidth / videoHeight;

      const containerAspect =
        containerWidth / containerHeight;

      let displayedWidth =
        containerWidth;

      let displayedHeight =
        containerHeight;

      let offsetX = 0;

      let offsetY = 0;

      if (
        videoAspect >
        containerAspect
      ) {
        /*
         * Video is wider than container.
         */

        displayedWidth =
          containerWidth;

        displayedHeight =
          containerWidth /
          videoAspect;

        offsetY =
          (containerHeight -
            displayedHeight) /
          2;
      } else {
        /*
         * Video is taller than container.
         */

        displayedHeight =
          containerHeight;

        displayedWidth =
          containerHeight *
          videoAspect;

        offsetX =
          (containerWidth -
            displayedWidth) /
          2;
      }

      canvas.width =
        videoWidth;

      canvas.height =
        videoHeight;

      canvas.style.position =
        "absolute";

      canvas.style.width =
        `${displayedWidth}px`;

      canvas.style.height =
        `${displayedHeight}px`;

      canvas.style.left =
        `${offsetX}px`;

      canvas.style.top =
        `${offsetY}px`;
    }, []);

  /*
   * ============================================================
   * DRAW DETECTION BOXES
   * ============================================================
   */

  const drawDetections =
    useCallback(
      (items: Detection[]) => {
        const canvas =
          canvasRef.current;

        if (!canvas) {
          return;
        }

        const ctx =
          canvas.getContext("2d");

        if (!ctx) {
          return;
        }

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.lineWidth = 2;

        ctx.font =
          "14px Arial";

        items.forEach(
          (detection) => {
            const [
              x,
              y,
              width,
              height,
            ] =
              detection.bbox;

            ctx.strokeStyle =
              "#00ffff";

            ctx.strokeRect(
              x,
              y,
              width,
              height
            );

            const label =
              `${detection.class} ` +
              `${Math.round(
                detection.score * 100
              )}%`;

            const textWidth =
              ctx.measureText(
                label
              ).width;

            ctx.fillStyle =
              "rgba(0, 0, 0, 0.7)";

            ctx.fillRect(
              x,
              Math.max(
                0,
                y - 22
              ),
              textWidth + 8,
              22
            );

            ctx.fillStyle =
              "#00ffff";

            ctx.fillText(
              label,
              x + 4,
              Math.max(
                15,
                y - 6
              )
            );
          }
        );
      },
      []
    );

  /*
   * ============================================================
   * VEHICLE FILTERING
   * ============================================================
   */

  const filterVehicles =
    useCallback(
      (
        predictions: cocoSsd.DetectedObject[]
      ) => {
        const filtered: Detection[] =
          [];

        for (
          const prediction of predictions
        ) {
          const className =
            prediction.class;

          if (
            !VEHICLE_CLASSES.includes(
              className
            )
          ) {
            continue;
          }

          const threshold =
            CONFIDENCE_THRESHOLDS[
              className
            ] ?? 0.25;

          if (
            prediction.score <
            threshold
          ) {
            continue;
          }

          const [
            x,
            y,
            width,
            height,
          ] =
            prediction.bbox;

          const area =
            width * height;

          const aspect =
            height > 0
              ? width / height
              : 0;

          /*
           * Reject extremely large boxes.
           */

          if (
            width >
              0.6 * 320 ||
            height >
              0.6 * 240
          ) {
            continue;
          }

          /*
           * Motorcycle filtering.
           */

          if (
            className ===
            "motorcycle"
          ) {
            if (area < 45) {
              continue;
            }

            if (aspect > 3.5) {
              continue;
            }
          }

          /*
           * Car filtering.
           */

          if (
            className === "car"
          ) {
            if (area < 80) {
              continue;
            }

            if (aspect > 6) {
              continue;
            }

            if (aspect < 0.15) {
              continue;
            }
          }

          /*
           * Bus filtering.
           */

          if (
            className === "bus"
          ) {
            if (area < 180) {
              continue;
            }
          }

          /*
           * Truck filtering.
           */

          if (
            className === "truck"
          ) {
            if (area < 150) {
              continue;
            }
          }

          filtered.push({
            bbox:
              prediction.bbox as [
                number,
                number,
                number,
                number
              ],

            class: className,

            score:
              prediction.score,
          });
        }

        return filtered;
      },
      []
    );

  /*
   * ============================================================
   * CONTINUOUS VEHICLE DETECTION
   * ============================================================
   */

  const detectVehicles =
    useCallback(
      async (
        timestamp: number = 0
      ) => {
        const video =
          videoRef.current;

        const model =
          modelRef.current;

        if (
          !video ||
          !model ||
          !mountedRef.current
        ) {
          return;
        }

        /*
         * Always report the actual
         * video timeline.
         */

        onVideoTimeChangeRef.current?.(
          video.currentTime
        );

        /*
         * Stop when video is not playing.
         */

        if (
          video.paused ||
          video.ended ||
          video.readyState < 2
        ) {
          return;
        }

        /*
         * Detect approximately
         * every 200 ms.
         */

        if (
          timestamp -
            lastDetectionTimeRef.current <
          200
        ) {
          animationFrameRef.current =
            requestAnimationFrame(
              detectVehicles
            );

          return;
        }

        lastDetectionTimeRef.current =
          timestamp;

        try {
          const predictions =
            await model.detect(
              video,
              40,
              0.18
            );

          if (
            !mountedRef.current
          ) {
            return;
          }

          const vehicles =
            filterVehicles(
              predictions
            );

          setDetections(
            vehicles
          );

          drawDetections(
            vehicles
          );

          /*
           * Weighted vehicle count.
           */

          const weightedCount =
            vehicles.reduce(
              (
                total,
                vehicle
              ) =>
                total +
                (VEHICLE_WEIGHTS[
                  vehicle.class
                ] ?? 1),
              0
            );

          /*
           * Send live count.
           */

          onVehicleCountChangeRef.current(
            weightedCount
          );

          /*
           * Update actual video time.
           */

          onVideoTimeChangeRef.current?.(
            video.currentTime
          );
        } catch (error) {
          console.error(
            "Vehicle detection error:",
            error
          );
        }

        if (
          mountedRef.current &&
          videoRef.current &&
          !videoRef.current.paused &&
          !videoRef.current.ended
        ) {
          animationFrameRef.current =
            requestAnimationFrame(
              detectVehicles
            );
        }
      },
      [
        drawDetections,
        filterVehicles,
      ]
    );

  /*
   * ============================================================
   * VIDEO PLAY
   * ============================================================
   */

  const handlePlay = () => {
    if (!modelReady) {
      console.log(
        "COCO-SSD model is still loading."
      );

      return;
    }

    onVideoPlayRef.current?.();

    onVideoTimeChangeRef.current?.(
      videoRef.current?.currentTime ??
        0
    );

    updateCanvasPosition();

    if (
      animationFrameRef.current !==
      null
    ) {
      cancelAnimationFrame(
        animationFrameRef.current
      );
    }

    lastDetectionTimeRef.current =
      0;

    animationFrameRef.current =
      requestAnimationFrame(
        detectVehicles
      );
  };

  /*
   * ============================================================
   * VIDEO PAUSE
   * ============================================================
   */

  const stopDetection = () => {
    if (
      animationFrameRef.current !==
      null
    ) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current =
        null;
    }

    onVideoTimeChangeRef.current?.(
      videoRef.current?.currentTime ??
        0
    );

    onVideoPauseRef.current?.();
  };

  /*
   * ============================================================
   * VIDEO ENDED
   * ============================================================
   */

  const handleEnded = () => {
    const finalVideoTime =
      videoRef.current?.duration ??
      videoRef.current?.currentTime ??
      0;

    onVideoTimeChangeRef.current?.(
      finalVideoTime
    );

    stopDetection();

    setDetections([]);

    /*
     * Inform parent BEFORE
     * sending vehicle count = 0.
     *
     * This lets the parent lock
     * the final AI prediction.
     */

    onVideoEndedRef.current?.();

    /*
     * Now clear displayed
     * vehicle count.
     */

    onVehicleCountChangeRef.current(
      0
    );

    const canvas =
      canvasRef.current;

    const ctx =
      canvas?.getContext("2d");

    if (ctx && canvas) {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  };

  /*
   * ============================================================
   * UPDATE CANVAS ON RESIZE
   * ============================================================
   */

  useEffect(() => {
    const handleResize = () => {
      updateCanvasPosition();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [updateCanvasPosition]);

  /*
   * ============================================================
   * NEW VIDEO
   * ============================================================
   */

  useEffect(() => {
    stopDetection();

    setDetections([]);

    if (
      animationFrameRef.current !==
      null
    ) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current =
        null;
    }

    const canvas =
      canvasRef.current;

    const ctx =
      canvas?.getContext("2d");

    if (ctx && canvas) {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    onVideoTimeChangeRef.current?.(
      0
    );
  }, [videoURL]);

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="w-full">
      {/*
       * ========================================================
       * VIDEO CONTAINER
       *
       * IMPORTANT:
       * max height prevents the video from occupying
       * the entire screen.
       *
       * aspect-video keeps a clean 16:9 presentation.
       * ========================================================
       */}

      <div
        ref={videoContainerRef}
        className="
          relative
          mx-auto
          w-full
          max-w-full
          overflow-hidden
          rounded-xl
          border
          border-slate-800
          bg-black
          aspect-video
          max-h-[430px]
        "
      >
        <video
          ref={videoRef}
          src={videoURL}
          controls
          playsInline
          preload="metadata"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-contain
            bg-black
          "
          onLoadedMetadata={() => {
            updateCanvasPosition();

            onVideoTimeChangeRef.current?.(
              videoRef.current?.currentTime ??
                0
            );
          }}
          onPlay={handlePlay}
          onPause={stopDetection}
          onEnded={handleEnded}
          onTimeUpdate={() => {
            onVideoTimeChangeRef.current?.(
              videoRef.current?.currentTime ??
                0
            );
          }}
        />

        <canvas
          ref={canvasRef}
          className="
            pointer-events-none
            absolute
            inset-0
          "
        />
      </div>

      {/*
       * ========================================================
       * VEHICLE DETECTION / MODEL STATUS
       * ========================================================
       */}

      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400">
            Vehicle Detection
          </div>

          <div className="text-xl font-semibold">
            {detections.reduce(
              (total, vehicle) =>
                total +
                (VEHICLE_WEIGHTS[
                  vehicle.class
                ] ?? 1),
              0
            )}{" "}
            vehicles
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-400">
            AI Model
          </div>

          <div className="text-sm font-medium">
            {modelLoading
              ? "Loading..."
              : modelReady
              ? "COCO-SSD Ready"
              : "Unavailable"}
          </div>
        </div>
      </div>
    </div>
  );
}