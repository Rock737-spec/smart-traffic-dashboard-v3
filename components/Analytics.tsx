"use client";

import {
  Activity,
  Database,
  Radio,
  Wifi,
} from "lucide-react";

import { Analytics as AnalyticsType } from "@/types/traffic";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  analytics: AnalyticsType;
}

function ProgressBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  const { theme } = useTheme();

  return (
    <div
      className={`w-full h-2 rounded-full overflow-hidden ${
        theme === "dark"
          ? "bg-slate-800"
          : "bg-gray-200"
      }`}
    >
      <div
        className={`${color} h-full rounded-full transition-all duration-700`}
        style={{
          width: `${Math.min(value, 100)}%`,
        }}
      />
    </div>
  );
}

function Card({
  title,
  value,
  icon,
  color,
  progress,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  progress: number;
}) {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-2xl p-6 transition-all hover:scale-[1.02] ${
        theme === "dark"
          ? "bg-slate-900 border border-slate-800 hover:border-cyan-500 text-white"
          : "bg-white border border-gray-300 hover:border-cyan-500 shadow-md text-black"
      }`}
    >
      <div className="flex justify-between items-center">

        <div>

          <p
            className={
              theme === "dark"
                ? "text-slate-400 text-sm"
                : "text-gray-500 text-sm"
            }
          >
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

        </div>

        <div className={`${color} p-3 rounded-xl text-white`}>
          {icon}
        </div>

      </div>

      <div className="mt-5">
        <ProgressBar
          value={progress}
          color={color}
        />
      </div>

    </div>
  );
}

export default function Analytics({
  analytics,
}: Props) {

  const { theme } = useTheme();

  const health = analytics.systemHealth;

  return (

    <div>

      <h2
        className={`text-2xl font-bold mb-5 ${
          theme === "dark"
            ? "text-white"
            : "text-black"
        }`}
      >
        System Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <Card
          title="System Health"
          value={`${health}%`}
          progress={health}
          color="bg-green-500"
          icon={<Activity />}
        />

        <Card
          title="Firebase Updates"
          value={analytics.firebaseUpdates}
          progress={Math.min(
            analytics.firebaseUpdates,
            100
          )}
          color="bg-cyan-500"
          icon={<Database />}
        />

        <Card
          title="ESP-NOW Packets"
          value={analytics.espNowPackets}
          progress={Math.min(
            analytics.espNowPackets,
            100
          )}
          color="bg-yellow-500"
          icon={<Radio />}
        />

        <Card
          title="NRF24 Packets"
          value={analytics.nrfPackets}
          progress={Math.min(
            analytics.nrfPackets,
            100
          )}
          color="bg-purple-500"
          icon={<Wifi />}
        />

      </div>

    </div>

  );
}