"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

import VehicleDetector from "./VehicleDetector";
import type { EmergencyStatus } from "@/types/traffic";

// ============================================================
// TYPES
// ============================================================

interface TrafficPoint {
  time: number;
  vehicles: number;
  predictedGreenTime: number;
}

interface EmergencyAccepted {
  time: number;
  acceptedAt: string;
  vehicles: number;
  predictedGreenTime: number;
  route?: string;
  eventId?: string;
}

interface AITrafficAnalysisProps {
  emergency: EmergencyStatus;
}

// ============================================================
// COMPONENT
// ============================================================

export default function AITrafficAnalysis({
  emergency,
}: AITrafficAnalysisProps) {
  // ============================================================
  // VIDEO STATE
  // ============================================================

  const [videoURL, setVideoURL] =
    useState<string | null>(null);

  const [isVideoPlaying, setIsVideoPlaying] =
    useState(false);

  const [videoEnded, setVideoEnded] =
    useState(false);

  const videoTimeRef = useRef(0);

  // ============================================================
  // VEHICLE STATE
  // ============================================================

  const [vehicleCount, setVehicleCount] =
    useState(0);

  const [stableVehicleCount, setStableVehicleCount] =
    useState(0);

  // ============================================================
  // AI GREEN TIME
  // ============================================================

  const [predictedGreenTime, setPredictedGreenTime] =
    useState(0);

  const currentPredictedGreenTimeRef =
    useRef(0);

  const lastNonZeroPredictionRef =
    useRef(0);

  // ============================================================
  // FINAL LOCKED AI VALUE
  // ============================================================

  const [finalLockedGreenTime, setFinalLockedGreenTime] =
    useState<number | null>(null);

  const finalLockedGreenTimeRef =
    useRef<number | null>(null);

  // ============================================================
  // TRAFFIC HISTORY
  // ============================================================

  const [trafficHistory, setTrafficHistory] =
    useState<TrafficPoint[]>([]);

  const recentVehicleCountsRef =
    useRef<number[]>([]);

  // ============================================================
  // EMERGENCY ACCEPTANCE
  // ============================================================

  const [emergencyAccepted, setEmergencyAccepted] =
    useState<EmergencyAccepted | null>(null);

  const emergencyAcceptedRef =
    useRef<EmergencyAccepted | null>(null);

  const previousEmergencyActiveRef =
    useRef(false);

  // ============================================================
  // CALCULATE AI GREEN TIME
  // ============================================================

  const calculateGreenTime = (
    vehicles: number
  ): number => {
    if (vehicles <= 0) {
      return 0;
    }

    if (vehicles <= 4) {
      return 10;
    }

    if (vehicles <= 10) {
      return 15;
    }

    const extraVehicles =
      vehicles - 10;

    const calculated =
      15 +
      Math.ceil(
        extraVehicles * 1.2
      );

    return Math.min(
      calculated,
      60
    );
  };

  // ============================================================
  // SEND CURRENT AI TIME TO FLASK
  // ============================================================

  const sendEmergencyTime = async (
    greenTime: number
  ) => {
    try {
      await fetch(
        "http://127.0.0.1:5000/ai-emergency-time",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            greenTime,
          }),
        }
      );
    } catch {
      // Flask may temporarily be unavailable.
      // Do not interrupt the AI dashboard.
    }
  };

  // ============================================================
  // VIDEO PLAY
  // ============================================================

  const handleVideoPlay = async () => {
    setIsVideoPlaying(true);
    setVideoEnded(false);

    try {
      await fetch(
        "http://127.0.0.1:5000/ai-video-start",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            time: 0,
          }),
        }
      );
    } catch {
      // No action needed if Flask is unavailable.
    }
  };

  // ============================================================
  // VIDEO PAUSE
  // ============================================================

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  // ============================================================
  // VIDEO END
  // ============================================================

  const handleVideoEnded = async () => {
    setIsVideoPlaying(false);
    setVideoEnded(true);

    // ----------------------------------------------------------
    // LOCK FINAL AI VALUE
    // ----------------------------------------------------------

    const finalValue =
      currentPredictedGreenTimeRef.current ||
      lastNonZeroPredictionRef.current ||
      0;

    finalLockedGreenTimeRef.current =
      finalValue;

    setFinalLockedGreenTime(
      finalValue
    );

    try {
      await fetch(
        "http://127.0.0.1:5000/ai-video-end",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            greenTime:
              finalValue,
            videoTime:
              videoTimeRef.current,
          }),
        }
      );
    } catch {
      // Flask unavailable.
      // Local final value remains locked.
    }
  };

  // ============================================================
  // VIDEO TIME
  // ============================================================

  const handleVideoTimeChange = (
    currentTime: number
  ) => {
    videoTimeRef.current =
      currentTime;
  };

  // ============================================================
  // VEHICLE COUNT
  // ============================================================

  const handleVehicleCountChange = (
    count: number
  ) => {
    const safeCount =
      Math.max(
        0,
        Math.round(count)
      );

    setVehicleCount(
      safeCount
    );

    // ----------------------------------------------------------
    // SMOOTH VEHICLE COUNT
    // ----------------------------------------------------------

    recentVehicleCountsRef.current.push(
      safeCount
    );

    if (
      recentVehicleCountsRef.current
        .length > 7
    ) {
      recentVehicleCountsRef.current.shift();
    }

    const values =
      recentVehicleCountsRef.current;

    const average =
      values.reduce(
        (
          sum,
          value
        ) =>
          sum + value,
        0
      ) /
      values.length;

    const stableCount =
      Math.max(
        0,
        Math.round(
          average
        )
      );

    setStableVehicleCount(
      stableCount
    );

    // ----------------------------------------------------------
    // CALCULATE AI GREEN TIME
    // ----------------------------------------------------------

    const newPrediction =
      calculateGreenTime(
        stableCount
      );

    currentPredictedGreenTimeRef.current =
      newPrediction;

    setPredictedGreenTime(
      newPrediction
    );

    if (
      newPrediction > 0
    ) {
      lastNonZeroPredictionRef.current =
        newPrediction;
    }

    // ----------------------------------------------------------
    // UPDATE GRAPH
    //
    // IMPORTANT:
    // Only ONE graph point is kept for each video timestamp.
    // This prevents Recharts from drawing overlapping/
    // zig-zagging duplicate lines.
    // ----------------------------------------------------------

    if (isVideoPlaying) {
      const currentTime =
        Number(
          videoTimeRef.current.toFixed(
            1
          )
        );

      setTrafficHistory(
        (previous) => {
          const newPoint: TrafficPoint = {
            time: currentTime,
            vehicles:
              stableCount,
            predictedGreenTime:
              newPrediction,
          };

          // ----------------------------------------------------
          // CHECK FOR EXISTING TIMESTAMP
          // ----------------------------------------------------

          const existingIndex =
            previous.findIndex(
              (point) =>
                point.time ===
                currentTime
            );

          let next: TrafficPoint[];

          if (
            existingIndex !== -1
          ) {
            // Replace the old point instead of adding
            // another point with the same X value.
            next = [
              ...previous,
            ];

            next[
              existingIndex
            ] = newPoint;
          } else {
            next = [
              ...previous,
              newPoint,
            ];
          }

          // ----------------------------------------------------
          // ALWAYS SORT BY VIDEO TIME
          // ----------------------------------------------------

          next.sort(
            (a, b) =>
              a.time - b.time
          );

          // ----------------------------------------------------
          // KEEP MAXIMUM 300 POINTS
          // ----------------------------------------------------

          if (
            next.length > 300
          ) {
            return next.slice(
              next.length - 300
            );
          }

          return next;
        }
      );
    }

    // ----------------------------------------------------------
    // SEND AI VALUE
    // ----------------------------------------------------------

    if (
      isVideoPlaying &&
      newPrediction > 0
    ) {
      sendEmergencyTime(
        newPrediction
      );
    }
  };

  // ============================================================
  // VIDEO UPLOAD
  // ============================================================

  const handleVideoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const url =
      URL.createObjectURL(
        file
      );

    setVideoURL(url);

    // ----------------------------------------------------------
    // RESET VIDEO
    // ----------------------------------------------------------

    setVideoEnded(false);
    setIsVideoPlaying(false);

    videoTimeRef.current =
      0;

    // ----------------------------------------------------------
    // RESET VEHICLES
    // ----------------------------------------------------------

    setVehicleCount(0);

    setStableVehicleCount(
      0
    );

    recentVehicleCountsRef.current =
      [];

    // ----------------------------------------------------------
    // RESET AI
    // ----------------------------------------------------------

    setPredictedGreenTime(
      0
    );

    currentPredictedGreenTimeRef.current =
      0;

    lastNonZeroPredictionRef.current =
      0;

    // ----------------------------------------------------------
    // RESET FINAL VALUE
    // ----------------------------------------------------------

    setFinalLockedGreenTime(
      null
    );

    finalLockedGreenTimeRef.current =
      null;

    // ----------------------------------------------------------
    // RESET GRAPH
    // ----------------------------------------------------------

    setTrafficHistory([]);

    // ----------------------------------------------------------
    // RESET EMERGENCY ACCEPTANCE
    // ----------------------------------------------------------

    setEmergencyAccepted(
      null
    );

    emergencyAcceptedRef.current =
      null;

    previousEmergencyActiveRef.current =
      false;
  };

  // ============================================================
  // EMERGENCY ACCEPTANCE
  //
  // Keep this because the graph should still mark the moment
  // the emergency becomes active.
  // ============================================================

  useEffect(() => {
    const wasActive =
      previousEmergencyActiveRef.current;

    const isActive =
      emergency.active;

    // ----------------------------------------------------------
    // FALSE -> TRUE
    // ----------------------------------------------------------

    if (
      !wasActive &&
      isActive
    ) {
      const now =
        new Date();

      const acceptedAt =
        now.toLocaleTimeString(
          "en-IN",
          {
            hour12: false,
          }
        );

      // Capture countdown immediately.
      const acceptedGreenTime =
        Number(
          emergency.countdown
        ) || 0;

      const acceptedVehicles =
        Math.max(
          0,
          Number.isFinite(
            vehicleCount
          )
            ? vehicleCount
            : stableVehicleCount
        );

      const acceptedVideoTime =
        Number(
          videoTimeRef.current.toFixed(
            1
          )
        );

      const snapshot: EmergencyAccepted =
        {
          time:
            acceptedVideoTime,

          acceptedAt:
            acceptedAt,

          vehicles:
            acceptedVehicles,

          predictedGreenTime:
            acceptedGreenTime,

          route:
            emergency.route,

          eventId:
            `${Date.now()}-${emergency.route}`,
        };

      emergencyAcceptedRef.current =
        snapshot;

      setEmergencyAccepted(
        snapshot
      );
    }

    previousEmergencyActiveRef.current =
      isActive;
  }, [
    emergency.active,
    emergency.route,
    emergency.countdown,
    vehicleCount,
    stableVehicleCount,
  ]);

  // ============================================================
  // DISPLAYED GREEN TIME
  // ============================================================

  const displayedGreenTime =
    videoEnded
      ? finalLockedGreenTime ??
        0
      : predictedGreenTime;

  // ============================================================
  // TOOLTIP FORMATTER
  // ============================================================

  const trafficTooltipFormatter = (
    value: unknown,
    name: unknown
  ): [string | number, string] => {
    const numericValue =
      typeof value === "number"
        ? value
        : Number(
            value ?? 0
          );

    const seriesName =
      String(
        name ?? ""
      );

    if (
      seriesName ===
      "vehicles"
    ) {
      return [
        numericValue,
        "Vehicles",
      ];
    }

    return [
      `${numericValue}s`,
      "AI Green Time",
    ];
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-2xl font-bold">
            AI Traffic Analysis
          </h2>

          <p className="text-sm opacity-70">
            Vehicle detection and adaptive emergency
            green-time prediction
          </p>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            isVideoPlaying
              ? "bg-green-500/20 text-green-400"
              : videoEnded
              ? "bg-blue-500/20 text-blue-400"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {isVideoPlaying
            ? "AI ANALYSIS RUNNING"
            : videoEnded
            ? "ANALYSIS COMPLETE"
            : "READY"}
        </div>

      </div>

      {/* ======================================================
          VIDEO
      ====================================================== */}

      <div className="rounded-xl border border-white/10 bg-black/20 p-5">

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>
            <h3 className="font-semibold">
              Traffic Video
            </h3>

            <p className="text-xs opacity-60">
              Upload a traffic video for AI analysis.
            </p>
          </div>

          <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">

            Upload Video

            <input
              type="file"
              accept="video/*"
              onChange={
                handleVideoUpload
              }
              className="hidden"
            />

          </label>

        </div>

        {videoURL ? (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black">

            <VehicleDetector
              videoURL={videoURL}
              onVehicleCountChange={
                handleVehicleCountChange
              }
              onVideoPlay={
                handleVideoPlay
              }
              onVideoPause={
                handleVideoPause
              }
              onVideoEnded={
                handleVideoEnded
              }
              onVideoTimeChange={
                handleVideoTimeChange
              }
            />

          </div>
        ) : (
          <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20">

            <div className="text-center">

              <div className="text-4xl">
                🎥
              </div>

              <p className="mt-2 text-sm opacity-70">
                Upload a traffic video to start AI
                analysis
              </p>

            </div>

          </div>
        )}

      </div>

      {/* ======================================================
          AI STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        {/* VEHICLES */}

        <div className="rounded-xl border border-white/10 bg-black/20 p-5">

          <p className="text-xs uppercase opacity-60">
            Current Vehicles
          </p>

          <p className="mt-2 text-3xl font-bold">
            {vehicleCount}
          </p>

        </div>

        {/* STABLE VEHICLES */}

        <div className="rounded-xl border border-white/10 bg-black/20 p-5">

          <p className="text-xs uppercase opacity-60">
            Smoothed Vehicles
          </p>

          <p className="mt-2 text-3xl font-bold">
            {stableVehicleCount}
          </p>

        </div>

        {/* GREEN TIME */}

        <div className="rounded-xl border border-white/10 bg-black/20 p-5">

          <p className="text-xs uppercase opacity-60">
            AI Green Time
          </p>

          <p className="mt-2 text-3xl font-bold">
            {displayedGreenTime}s
          </p>

          <p className="mt-1 text-xs opacity-60">
            {videoEnded
              ? "Final locked value"
              : "Current prediction"}
          </p>

        </div>

        {/* VIDEO TIME */}

        <div className="rounded-xl border border-white/10 bg-black/20 p-5">

          <p className="text-xs uppercase opacity-60">
            Video Position
          </p>

          <p className="mt-2 text-3xl font-bold">
            {videoTimeRef.current.toFixed(
              1
            )}
            s
          </p>

        </div>

      </div>

      {/* ======================================================
          GRAPH
      ====================================================== */}

      <div className="rounded-xl border border-white/10 bg-black/20 p-5">

        <div className="mb-5">

          <h3 className="font-semibold">
            Vehicle Count & AI Green-Time Analysis
          </h3>

          <p className="text-xs opacity-60">
            Vehicle count and AI green-time prediction
            throughout the video.
          </p>

        </div>

        <div className="h-[360px] w-full">

          {trafficHistory.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={trafficHistory}
                margin={{
                  top: 30,
                  right: 30,
                  left: 10,
                  bottom: 20,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.15}
                />

                <XAxis
                  dataKey="time"
                  type="number"
                  domain={[
                    "dataMin",
                    "dataMax",
                  ]}
                  tickFormatter={(
                    value
                  ) =>
                    `${value}s`
                  }
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip
                  formatter={
                    trafficTooltipFormatter
                  }
                  labelFormatter={(
                    value
                  ) =>
                    `Video Time: ${value}s`
                  }
                />

                {/* ==================================================
                    VEHICLE COUNT
                ================================================== */}

                <Line
                  type="monotone"
                  dataKey="vehicles"
                  strokeWidth={2}
                  dot={false}
                  name="vehicles"
                  isAnimationActive={false}
                  connectNulls
                />

                {/* ==================================================
                    AI GREEN TIME
                ================================================== */}

                <Line
                  type="monotone"
                  dataKey="predictedGreenTime"
                  strokeWidth={2}
                  dot={false}
                  name="predictedGreenTime"
                  isAnimationActive={false}
                  connectNulls
                />

                {/* ==================================================
                    EMERGENCY ACCEPTANCE MARKER

                    This remains because it is part of the graph
                    requirement, not the removed snapshot panel.
                ================================================== */}

                {emergencyAccepted && (
                  <ReferenceDot
                    x={
                      emergencyAccepted.time
                    }
                    y={
                      emergencyAccepted.vehicles
                    }
                    r={7}
                    label={{
                      value:
                        `ACCEPTED • ${emergencyAccepted.predictedGreenTime}s`,
                      position:
                        "top",
                    }}
                  />
                )}

              </LineChart>

            </ResponsiveContainer>

          ) : (

            <div className="flex h-full items-center justify-center rounded-xl bg-white/5 text-sm opacity-60">

              Start a video to generate the AI
              traffic graph.

            </div>

          )}

        </div>

      </div>

      {/* ======================================================
          FINAL AI DECISION
      ====================================================== */}

      <div className="rounded-xl border border-white/10 bg-black/20 p-5">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>

            <h3 className="font-semibold">
              AI Green-Time Decision
            </h3>

            <p className="text-xs opacity-60">
              The prediction changes while the video
              plays and becomes locked when the video ends.
            </p>

          </div>

          <div
            className={`rounded-lg px-5 py-3 text-center ${
              videoEnded
                ? "bg-blue-500/20"
                : "bg-green-500/20"
            }`}
          >

            <p className="text-xs opacity-60">
              {videoEnded
                ? "FINAL LOCKED"
                : "CURRENT"}
            </p>

            <p className="text-2xl font-bold">
              {displayedGreenTime}s
            </p>

          </div>

        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">

          <div className="rounded-lg bg-white/5 p-4">

            <p className="text-xs opacity-60">
              While Video Plays
            </p>

            <p className="mt-1 text-sm">
              AI continuously updates the predicted
              green duration from the detected vehicle
              count.
            </p>

          </div>

          <div className="rounded-lg bg-white/5 p-4">

            <p className="text-xs opacity-60">
              Emergency Request
            </p>

            <p className="mt-1 text-sm">
              The green-time value available when the
              emergency becomes active is captured for
              that emergency event.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}