"use client";

import { TrafficSignal } from "@/types/traffic";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  signals: {
    signal1: TrafficSignal;
    signal2: TrafficSignal;
    signal3: TrafficSignal;
    signal4: TrafficSignal;
  };
}

function SignalLamp({
  active,
  color,
}: {
  active: boolean;
  color: "red" | "yellow" | "green";
}) {
  const { theme } = useTheme();

  const base =
    "w-5 h-5 rounded-full transition-all duration-300";

  if (!active) {
    return (
      <div
        className={`${base} ${
          theme === "dark"
            ? "bg-slate-700"
            : "bg-gray-300"
        }`}
      />
    );
  }

  switch (color) {
    case "red":
      return (
        <div
          className={`${base} bg-red-500 shadow-[0_0_20px_rgba(239,68,68,.9)]`}
        />
      );

    case "yellow":
      return (
        <div
          className={`${base} bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,.9)]`}
        />
      );

    default:
      return (
        <div
          className={`${base} bg-green-500 shadow-[0_0_20px_rgba(34,197,94,.9)]`}
        />
      );
  }
}

function SignalCard({
  signal,
}: {
  signal: TrafficSignal;
}) {
  const { theme } = useTheme();

  const cardBorder = signal.emergency
    ? "border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,.35)]"
    : theme === "dark"
    ? "border-slate-700"
    : "border-gray-300";

  return (
    <div
      className={`rounded-3xl border p-6 transition-all duration-300 hover:scale-[1.02] ${cardBorder} ${
        theme === "dark"
          ? "bg-slate-900 text-white"
          : "bg-white text-black shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-xl font-bold">
            Signal {signal.id}
          </h2>

          <p
            className={
              theme === "dark"
                ? "text-slate-400 text-sm mt-1"
                : "text-gray-500 text-sm mt-1"
            }
          >
            {signal.controller}
          </p>
        </div>

        {signal.emergency && (
          <span className="bg-cyan-500/20 text-cyan-500 px-3 py-1 rounded-full text-xs font-bold">
            EMERGENCY
          </span>
        )}
      </div>

      <div className="flex justify-center gap-4 py-4">
        <SignalLamp
          color="red"
          active={signal.color === "RED"}
        />

        <SignalLamp
          color="yellow"
          active={signal.color === "YELLOW"}
        />

        <SignalLamp
          color="green"
          active={signal.color === "GREEN"}
        />
      </div>

      <div className="mt-6 text-center">
        <div className="text-5xl font-black text-cyan-500">
          {signal.countdown}
        </div>

        <div
          className={
            theme === "dark"
              ? "text-slate-400 mt-1"
              : "text-gray-500 mt-1"
          }
        >
          Seconds Remaining
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span
            className={
              theme === "dark"
                ? "text-slate-400"
                : "text-gray-500"
            }
          >
            Current Phase
          </span>

          <span
            className={`font-bold ${
              signal.color === "RED"
                ? "text-red-500"
                : signal.color === "YELLOW"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {signal.color}
          </span>
        </div>

        <div
          className={`h-2 rounded-full overflow-hidden ${
            theme === "dark"
              ? "bg-slate-800"
              : "bg-gray-200"
          }`}
        >
          <div
            className={`h-full transition-all duration-500 ${
              signal.color === "RED"
                ? "bg-red-500"
                : signal.color === "YELLOW"
                ? "bg-yellow-400"
                : "bg-green-500"
            }`}
            style={{
              width: `${Math.min(
                100,
                Math.max(signal.countdown, 5)
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SignalCards({
  signals,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <SignalCard signal={signals.signal1} />
      <SignalCard signal={signals.signal2} />
      <SignalCard signal={signals.signal3} />
      <SignalCard signal={signals.signal4} />
    </div>
  );
}