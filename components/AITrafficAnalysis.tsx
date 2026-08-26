"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import VehicleDetector from "@/components/VehicleDetector";

export default function AITrafficAnalysis() {
  const [videoURL, setVideoURL] =
    useState<string | null>(null);

  /*
   * Live weighted vehicle count.
   */
  const [vehicleCount, setVehicleCount] =
    useState<number>(0);

  /*
   * Stabilized count used internally
   * for the AI recommendation.
   */
  const [stableVehicleCount, setStableVehicleCount] =
    useState<number>(0);

  const [
    predictedGreenTime,
    setPredictedGreenTime,
  ] = useState<number>(0);

  const videoURLRef =
    useRef<string | null>(null);

  /*
   * Recent vehicle counts used for
   * short-term smoothing.
   */
  const vehicleHistoryRef =
    useRef<number[]>([]);

  /*
   * ============================================================
   * TRAFFIC HISTORY GRAPH
   * ============================================================
   *
   * Stores the detected weighted vehicle count over time.
   *
   * IMPORTANT:
   * - This is separate from vehicleHistoryRef.
   * - vehicleHistoryRef is used for smoothing.
   * - trafficHistory is used only for the graph.
   *
   * The graph remains after the video ends.
   * It is cleared only when:
   * 1. A new video is uploaded.
   * 2. Reset is pressed.
   */
  const [trafficHistory, setTrafficHistory] =
    useState<number[]>([]);

  /*
   * ============================================================
   * GREEN TIME CALCULATION
   * ============================================================
   */

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

    const calculatedTime =
      15 +
      Math.ceil(
        (vehicles - 10) * 1.2
      );

    return Math.min(
      calculatedTime,
      60
    );
  };

  /*
   * ============================================================
   * VEHICLE COUNT CHANGE
   * ============================================================
   */

  const handleVehicleCountChange = (
    count: number
  ) => {
    /*
     * Show the current AI vehicle count.
     */
    setVehicleCount(count);

    /*
     * ==========================================================
     * TRAFFIC GRAPH UPDATE
     * ==========================================================
     *
     * Add the current weighted vehicle count
     * to the graph history.
     *
     * Keep a reasonable maximum number of
     * points so a long video does not create
     * an unnecessarily huge React state.
     */
    setTrafficHistory((previous) => {
      const updated = [
        ...previous,
        count,
      ];

      /*
       * Keep the latest 300 graph points.
       *
       * This does NOT affect the AI smoothing.
       * It only controls how much history is
       * displayed on the graph.
       */
      if (updated.length > 300) {
        return updated.slice(
          updated.length - 300
        );
      }

      return updated;
    });

    /*
     * Store recent values.
     */
    vehicleHistoryRef.current.push(
      count
    );

    /*
     * Keep the latest seven values.
     */
    if (
      vehicleHistoryRef.current.length >
      7
    ) {
      vehicleHistoryRef.current.shift();
    }

    const history =
      vehicleHistoryRef.current;

    /*
     * Calculate short-term average.
     */
    const average =
      history.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / history.length;

    /*
     * Convert to a whole-number
     * traffic count.
     */
    const stableCount =
      Math.round(average);

    setStableVehicleCount(
      stableCount
    );

    /*
     * Calculate recommended green time
     * from stabilized traffic.
     */
    const greenTime =
      calculateGreenTime(
        stableCount
      );

    setPredictedGreenTime(
      greenTime
    );
  };

  /*
   * ============================================================
   * VIDEO UPLOAD
   * ============================================================
   */

  const handleVideoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Validate video.
     */

    if (
      !file.type.startsWith("video/")
    ) {
      alert(
        "Please select a valid video file."
      );

      return;
    }

    /*
     * Release old object URL.
     */

    if (
      videoURLRef.current
    ) {
      URL.revokeObjectURL(
        videoURLRef.current
      );
    }

    /*
     * Create new object URL.
     */

    const url =
      URL.createObjectURL(file);

    videoURLRef.current =
      url;

    setVideoURL(url);

    /*
     * Reset AI values.
     */

    setVehicleCount(0);

    setStableVehicleCount(0);

    setPredictedGreenTime(0);

    vehicleHistoryRef.current = [];

    /*
     * ==========================================================
     * RESET TRAFFIC GRAPH
     * ==========================================================
     *
     * A new video starts a completely new
     * traffic analysis session.
     */
    setTrafficHistory([]);
  };

  /*
   * ============================================================
   * RESET
   * ============================================================
   */

  const resetAnalysis = () => {
    /*
     * Release video.
     */

    if (
      videoURLRef.current
    ) {
      URL.revokeObjectURL(
        videoURLRef.current
      );

      videoURLRef.current =
        null;
    }

    /*
     * Reset video.
     */

    setVideoURL(null);

    /*
     * Reset AI.
     */

    setVehicleCount(0);

    setStableVehicleCount(0);

    setPredictedGreenTime(0);

    vehicleHistoryRef.current = [];

    /*
     * Reset traffic graph.
     */

    setTrafficHistory([]);
  };

  /*
   * ============================================================
   * CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      if (
        videoURLRef.current
      ) {
        URL.revokeObjectURL(
          videoURLRef.current
        );
      }
    };
  }, []);

  /*
   * ============================================================
   * AI RECOMMENDATION
   * ============================================================
   */

  const getRecommendation = () => {
    if (
      stableVehicleCount === 0
    ) {
      return "No traffic detected";
    }

    if (
      stableVehicleCount <= 4
    ) {
      return "Light traffic — short green phase";
    }

    if (
      stableVehicleCount <= 10
    ) {
      return "Moderate traffic — normal green phase";
    }

    if (
      stableVehicleCount <= 20
    ) {
      return "High traffic — extended green phase";
    }

    return "Heavy traffic — maximum green phase";
  };

  /*
   * ============================================================
   * GRAPH CALCULATIONS
   * ============================================================
   */

  const graphMax =
    trafficHistory.length > 0
      ? Math.max(
          5,
          ...trafficHistory
        )
      : 5;

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <section
      id="ai-analysis"
      className="
        rounded-2xl
        border
        border-cyan-400/20
        bg-slate-950/70
        p-5
        shadow-lg
      "
    >

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div
        className="
          mb-5
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h2
            className="
              text-xl
              font-bold
              tracking-wide
              text-cyan-300
            "
          >
            AI TRAFFIC ANALYSIS
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-400
            "
          >
            Real-time computer vision and
            adaptive signal prediction
          </p>

        </div>

        <div
          className="
            rounded-full
            border
            border-cyan-400/30
            px-3
            py-1
            text-xs
            text-cyan-300
          "
        >
          AI MODULE
        </div>

      </div>

      {/* ======================================================
          VIDEO + RESULTS
      ======================================================= */}

      <div
        className="
          grid
          gap-5
          lg:grid-cols-2
        "
      >

        {/* ====================================================
            VIDEO
        ===================================================== */}

        <div>

          <div
            className="
              mb-2
              flex
              items-center
              justify-between
            "
          >

            <h3
              className="
                text-sm
                font-semibold
                text-slate-200
              "
            >
              TRAFFIC VIDEO
            </h3>

            {videoURL && (
              <span
                className="
                  text-xs
                  text-green-400
                "
              >
                AI DETECTION ENABLED
              </span>
            )}

          </div>

          {/* ==================================================
              VEHICLE DETECTOR
          =================================================== */}

          {videoURL ? (
            <VehicleDetector
              videoURL={videoURL}
              onVehicleCountChange={
                handleVehicleCountChange
              }
            />
          ) : (
            <div
              className="
                relative
                flex
                aspect-video
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                border
                border-slate-700
                bg-black
              "
            >

              <div
                className="
                  text-center
                "
              >

                <div
                  className="
                    mb-2
                    text-4xl
                  "
                >
                  🎥
                </div>

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  No traffic video loaded
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  Upload a traffic video
                  to begin AI analysis
                </p>

              </div>

            </div>
          )}

          {/* ==================================================
              UPLOAD / RESET
          =================================================== */}

          <div
            className="
              mt-3
              flex
              gap-2
            "
          >

            <label
              className="
                cursor-pointer
                rounded-lg
                border
                border-cyan-400/30
                bg-cyan-400/10
                px-4
                py-2
                text-sm
                text-cyan-300
                transition
                hover:bg-cyan-400/20
              "
            >
              Upload Traffic Video

              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={
                  handleVideoUpload
                }
              />
            </label>

            {videoURL && (
              <button
                onClick={
                  resetAnalysis
                }
                className="
                  rounded-lg
                  border
                  border-red-400/30
                  bg-red-400/10
                  px-4
                  py-2
                  text-sm
                  text-red-300
                  transition
                  hover:bg-red-400/20
                "
              >
                Reset
              </button>
            )}

          </div>

          {/* ==================================================
              COMPUTER VISION ENGINE
          =================================================== */}

          <div
            className="
              mt-4
              rounded-xl
              border
              border-slate-700
              bg-slate-900/70
              p-4
            "
          >

            <p
              className="
                text-xs
                font-semibold
                text-cyan-300
              "
            >
              COMPUTER VISION ENGINE
            </p>

            <p
              className="
                mt-2
                text-xs
                text-slate-400
              "
            >
              TensorFlow.js + COCO-SSD
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Detecting cars, trucks,
              buses and motorcycles
              directly from the traffic
              video.
            </p>

          </div>

        </div>

        {/* ====================================================
            AI RESULTS
        ===================================================== */}

        <div>

          <h3
            className="
              mb-3
              text-sm
              font-semibold
              text-slate-200
            "
          >
            AI PREDICTION
          </h3>

          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >

            {/* =================================================
                VEHICLES DETECTED
            ================================================= */}

            <div
              className="
                rounded-xl
                border
                border-cyan-400/20
                bg-slate-900/70
                p-4
              "
            >

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                VEHICLES DETECTED
              </p>

              <p
                className="
                  mt-2
                  text-3xl
                  font-bold
                  text-cyan-300
                "
              >
                {vehicleCount}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-600
                "
              >
                AI detected traffic count
              </p>

            </div>

            {/* =================================================
                CURRENT ESP32 GREEN
            ================================================= */}

            <div
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/70
                p-4
              "
            >

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                CURRENT GREEN
              </p>

              <p
                className="
                  mt-2
                  text-3xl
                  font-bold
                  text-green-300
                "
              >
                30s
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-600
                "
              >
                ESP32 configured timing
              </p>

            </div>

            {/* =================================================
                AI PREDICTED GREEN
            ================================================= */}

            <div
              className="
                rounded-xl
                border
                border-cyan-400/30
                bg-cyan-400/5
                p-4
              "
            >

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                AI PREDICTED GREEN
              </p>

              <p
                className="
                  mt-2
                  text-3xl
                  font-bold
                  text-cyan-300
                "
              >
                {predictedGreenTime}s
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Recommended duration based
                on detected traffic
              </p>

            </div>

          </div>

          {/* ==================================================
              AI RECOMMENDATION
          =================================================== */}

          <div
            className="
              mt-4
              rounded-xl
              border
              border-purple-400/20
              bg-purple-400/5
              p-4
            "
          >

            <p
              className="
                text-xs
                text-slate-500
              "
            >
              AI RECOMMENDATION
            </p>

            <p
              className="
                mt-1
                font-semibold
                text-purple-300
              "
            >
              {getRecommendation()}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Based on the current traffic
              conditions, the AI recommends{" "}
              {predictedGreenTime} seconds
              of green time. The physical
              traffic signal continues using
              the existing ESP32 timing.
            </p>

          </div>

          {/* ==================================================
              AI SYSTEM INFORMATION
          =================================================== */}

          <div
            className="
              mt-3
              rounded-xl
              border
              border-slate-700
              bg-slate-900/50
              p-3
            "
          >

            <p
              className="
                text-xs
                font-semibold
                text-slate-400
              "
            >
              AI SYSTEM
            </p>

            <div
              className="
                mt-2
                space-y-1
                text-xs
                text-slate-500
              "
            >

              <p>
                Detection:
                {" "}
                <span
                  className="
                    text-cyan-300
                  "
                >
                  COCO-SSD
                </span>
              </p>

              <p>
                Vehicle types:
                {" "}
                <span
                  className="
                    text-cyan-300
                  "
                >
                  Car · Motorcycle · Bus · Truck
                </span>
              </p>

              <p>
                Recommendation:
                {" "}
                <span
                  className="
                    text-green-400
                  "
                >
                  Adaptive
                </span>
              </p>

              <p>
                Signal control:
                {" "}
                <span
                  className="
                    text-yellow-300
                  "
                >
                  ESP32
                </span>
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          TRAFFIC HISTORY GRAPH
      ======================================================= */}

      <div
        className="
          mt-6
          rounded-xl
          border
          border-cyan-400/20
          bg-slate-900/70
          p-5
        "
      >

        {/* GRAPH HEADER */}

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h3
              className="
                text-sm
                font-semibold
                tracking-wide
                text-slate-200
              "
            >
              TRAFFIC HISTORY
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Weighted vehicle count detected
              throughout the video
            </p>

          </div>

          {trafficHistory.length > 0 && (
            <div
              className="
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-400/5
                px-3
                py-1
                text-xs
                text-cyan-300
              "
            >
              {trafficHistory.length} samples
            </div>
          )}

        </div>

        {/* GRAPH */}

        {trafficHistory.length > 0 ? (
          <div
            className="
              relative
              h-64
              w-full
              overflow-hidden
              rounded-lg
              border
              border-slate-800
              bg-slate-950
            "
          >

            {/* Y AXIS GRID */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                flex
                flex-col
                justify-between
                p-4
              "
            >

              {[4, 3, 2, 1, 0].map(
                (line) => (
                  <div
                    key={line}
                    className="
                      flex
                      w-full
                      items-center
                    "
                  >

                    <div
                      className="
                        absolute
                        left-0
                        right-0
                        border-t
                        border-slate-800
                      "
                    />

                  </div>
                )
              )}

            </div>

            {/* Y AXIS LABEL */}

            <div
              className="
                absolute
                left-2
                top-2
                z-10
                text-[10px]
                text-slate-500
              "
            >
              VEHICLES
            </div>

            {/* GRAPH SVG */}

            <svg
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
              className="
                absolute
                inset-0
                h-full
                w-full
              "
            >

              {/* AREA UNDER GRAPH */}

              <polygon
                points={trafficHistory
                  .map(
                    (value, index) => {
                      const x =
                        trafficHistory.length ===
                        1
                          ? 0
                          : (index /
                              (trafficHistory.length -
                                1)) *
                            1000;

                      const y =
                        280 -
                        (value /
                          graphMax) *
                          240;

                      return `${x},${y}`;
                    }
                  )
                  .join(" ") +
                  ` 1000,280 0,280`}
                fill="rgba(34,211,238,0.08)"
              />

              {/* TRAFFIC LINE */}

              <polyline
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                points={trafficHistory
                  .map(
                    (value, index) => {
                      const x =
                        trafficHistory.length ===
                        1
                          ? 0
                          : (index /
                              (trafficHistory.length -
                                1)) *
                            1000;

                      const y =
                        280 -
                        (value /
                          graphMax) *
                          240;

                      return `${x},${y}`;
                    }
                  )
                  .join(" ")}
              />

              {/* CURRENT POINT */}

              {trafficHistory.length > 0 && (
                <circle
                  cx={
                    trafficHistory.length === 1
                      ? 0
                      : 1000
                  }
                  cy={
                    280 -
                    (trafficHistory[
                      trafficHistory.length -
                        1
                    ] /
                      graphMax) *
                      240
                  }
                  r="6"
                  fill="#22d3ee"
                />
              )}

            </svg>

            {/* Y AXIS VALUES */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-4
                left-2
                top-4
                flex
                flex-col
                justify-between
                text-[10px]
                text-slate-500
              "
            >

              <span>
                {graphMax}
              </span>

              <span>
                {Math.round(
                  graphMax * 0.75
                )}
              </span>

              <span>
                {Math.round(
                  graphMax * 0.5
                )}
              </span>

              <span>
                {Math.round(
                  graphMax * 0.25
                )}
              </span>

              <span>
                0
              </span>

            </div>

            {/* X AXIS LABEL */}

            <div
              className="
                absolute
                bottom-1
                right-3
                text-[10px]
                text-slate-600
              "
            >
              TIME →
            </div>

            {/* CURRENT VALUE */}

            <div
              className="
                absolute
                right-3
                top-3
                rounded-lg
                border
                border-cyan-400/20
                bg-black/50
                px-3
                py-2
              "
            >

              <p
                className="
                  text-[10px]
                  text-slate-500
                "
              >
                CURRENT
              </p>

              <p
                className="
                  text-lg
                  font-bold
                  text-cyan-300
                "
              >
                {
                  trafficHistory[
                    trafficHistory.length -
                      1
                  ]
                }
              </p>

            </div>

          </div>
        ) : (
          <div
            className="
              flex
              h-64
              items-center
              justify-center
              rounded-lg
              border
              border-slate-800
              bg-slate-950
            "
          >

            <div
              className="
                text-center
              "
            >

              <div
                className="
                  mb-2
                  text-3xl
                "
              >
                📈
              </div>

              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                No traffic history yet
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-600
                "
              >
                Upload and play a traffic
                video to generate the graph
              </p>

            </div>

          </div>
        )}

        {/* GRAPH STATUS */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            text-xs
          "
        >

          <span
            className="
              text-slate-500
            "
          >
            {trafficHistory.length > 0
              ? "Traffic history retained after video completion"
              : "Waiting for traffic detection"}
          </span>

          {trafficHistory.length > 0 && (
            <span
              className="
                text-cyan-400
              "
            >
              ● HISTORY ACTIVE
            </span>
          )}

        </div>

      </div>

    </section>
  );
}