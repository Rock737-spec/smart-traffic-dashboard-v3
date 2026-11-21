"use client";

import { useEffect, useState } from "react";

const CAMERA_URL = "http://127.0.0.1:5000/video";
const SERVER_URL = "http://127.0.0.1:5000";

interface DetectionStatus {
  ambulanceDetected: boolean;
  confidence: number;
  permissionSeconds: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export default function AmbulanceCamera() {
  const [status, setStatus] = useState<DetectionStatus>({
    ambulanceDetected: false,
    confidence: 0,
    permissionSeconds: 0,
    boundingBox: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(
          `${SERVER_URL}/status?t=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setStatus(data);
      } catch {
        // OCR server unavailable
      }
    };

    checkStatus();

    const interval = setInterval(
      checkStatus,
      250
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const detected =
    status.ambulanceDetected &&
    status.permissionSeconds > 0;

  const boxStyle = {
    left: `${(status.boundingBox.x / 320) * 100}%`,
    top: `${(status.boundingBox.y / 240) * 100}%`,
    width: `${(status.boundingBox.width / 320) * 100}%`,
    height: `${(status.boundingBox.height / 240) * 100}%`,
  };

  return (
    <div className="w-full">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-4">

        <h2 className="text-2xl font-bold text-white">
          Ambulance Visual Verification
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          ESP32-CAM Live Feed + OCR Verification
        </p>

      </div>


      {/* ================================================= */}
      {/* CAMERA */}
      {/* ================================================= */}

      <div
        className="
          relative
          w-full
          max-w-2xl
          overflow-hidden
          rounded-xl
          border
          border-slate-700
          bg-black
        "
        style={{
          aspectRatio: "4 / 3",
          minHeight: "240px",
        }}
      >

        {/* =============================================== */}
        {/* PYTHON CAMERA STREAM */}
        {/* =============================================== */}

        <img
          src={CAMERA_URL}
          alt="ESP32-CAM Live Feed"
          className="
            absolute
            inset-0
            block
            h-full
            w-full
            object-contain
            bg-black
          "
          style={{
            display: "block",
          }}
        />


        {/* =============================================== */}
        {/* CAMERA LIVE */}
        {/* =============================================== */}

        <div
          className="
            absolute
            left-3
            top-3
            rounded-lg
            border
            border-cyan-500/30
            bg-black/80
            px-3
            py-2
            text-xs
            text-cyan-300
          "
        >
          ● CAMERA LIVE
        </div>


        {/* =============================================== */}
        {/* DETECTION STATUS */}
        {/* =============================================== */}

        <div
          className={`absolute right-3 top-3 rounded-lg border px-3 py-2 text-xs ${
            detected
              ? "border-green-500/40 bg-green-950/90 text-green-300"
              : "border-slate-500/40 bg-black/80 text-slate-300"
          }`}
        >
          {detected
            ? "● AMBULANCE DETECTED"
            : "● WAITING FOR AMBULANCE"}
        </div>


        {/* =============================================== */}
        {/* OCR BOUNDING BOX */}
        {/* =============================================== */}

        {detected &&
          status.boundingBox.width > 0 &&
          status.boundingBox.height > 0 && (
            <div
              className="
                absolute
                border-4
                border-green-400
              "
              style={boxStyle}
            >

              <div
                className="
                  absolute
                  -top-8
                  left-0
                  whitespace-nowrap
                  rounded
                  bg-green-400
                  px-2
                  py-1
                  text-xs
                  font-bold
                  text-black
                "
              >
                AMBULANCE
              </div>

            </div>
          )}


        {/* =============================================== */}
        {/* TIMER */}
        {/* =============================================== */}

        {detected && (
          <div
            className="
              absolute
              bottom-3
              right-3
              rounded-lg
              border
              border-yellow-500/40
              bg-black/85
              px-4
              py-2
            "
          >

            <p className="text-xs text-slate-400">
              VISUAL PERMISSION
            </p>

            <p className="text-2xl font-bold text-yellow-400">
              {status.permissionSeconds.toFixed(1)}s
            </p>

          </div>
        )}

      </div>


      {/* ================================================= */}
      {/* INFORMATION CARDS */}
      {/* ================================================= */}

      <div className="mt-4 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">

        {/* =============================================== */}
        {/* DETECTION CARD */}
        {/* =============================================== */}

        <div
          className={`rounded-xl border p-4 ${
            detected
              ? "border-green-500/30 bg-green-500/10"
              : "border-slate-700 bg-slate-900/60"
          }`}
        >

          <p className="text-xs uppercase tracking-wider text-slate-400">
            Detection
          </p>

          <p
            className={`mt-2 text-lg font-bold ${
              detected
                ? "text-green-400"
                : "text-slate-300"
            }`}
          >
            {detected
              ? "AMBULANCE"
              : "NOT DETECTED"}
          </p>

        </div>


        {/* =============================================== */}
        {/* OCR CONFIDENCE */}
        {/* =============================================== */}

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">

          <p className="text-xs uppercase tracking-wider text-slate-400">
            OCR Confidence
          </p>

          <p className="mt-2 text-lg font-bold text-cyan-400">
            {status.confidence.toFixed(1)}%
          </p>

        </div>


        {/* =============================================== */}
        {/* VISUAL PERMISSION */}
        {/* =============================================== */}

        <div
          className={`rounded-xl border p-4 ${
            detected
              ? "border-yellow-500/30 bg-yellow-500/10"
              : "border-slate-700 bg-slate-900/60"
          }`}
        >

          <p className="text-xs uppercase tracking-wider text-slate-400">
            Visual Permission
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              detected
                ? "text-yellow-400"
                : "text-slate-500"
            }`}
          >
            {status.permissionSeconds.toFixed(1)}s
          </p>

        </div>

      </div>

    </div>
  );
}