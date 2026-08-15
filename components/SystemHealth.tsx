"use client";

import { DashboardData } from "@/types/traffic";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  data: DashboardData;
}

function StatusBar({
  label,
  online,
}: {
  label: string;
  online: boolean;
}) {
  const { theme } = useTheme();

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span
          className={
            theme === "dark"
              ? "text-slate-300"
              : "text-gray-600"
          }
        >
          {label}
        </span>

        <span
          className={`font-bold ${
            online
              ? "text-emerald-500"
              : "text-red-500"
          }`}
        >
          {online ? "ONLINE" : "OFFLINE"}
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
          className={`h-full transition-all duration-700 ${
            online
              ? "bg-emerald-500 w-full"
              : "bg-red-500 w-1/4"
          }`}
        />
      </div>
    </div>
  );
}

export default function SystemHealth({
  data,
}: Props) {
  const { theme } = useTheme();

  const score = data.analytics.systemHealth;

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors ${
        theme === "dark"
          ? "bg-slate-900 border-slate-800 text-white"
          : "bg-white border-gray-200 text-black shadow-md"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            System Health
          </h2>

          <p
            className={
              theme === "dark"
                ? "text-slate-400 text-sm"
                : "text-gray-500 text-sm"
            }
          >
            Overall system monitoring
          </p>
        </div>

        <div
          className={`text-3xl font-extrabold ${
            score >= 90
              ? "text-emerald-500"
              : score >= 60
              ? "text-yellow-500"
              : "text-red-500"
          }`}
        >
          {score}%
        </div>
      </div>

      <div className="space-y-6">
        <StatusBar
          label="Master ESP32"
          online={data.controllers.master.online}
        />

        <StatusBar
          label="Slave ESP32"
          online={data.controllers.slave.online}
        />

        <StatusBar
          label="Ambulance ESP32"
          online={data.controllers.ambulance.online}
        />

        <StatusBar
          label="Firebase"
          online={data.controllers.master.firebase}
        />

        <StatusBar
          label="ESP-NOW"
          online={data.controllers.master.espNow}
        />

        <StatusBar
          label="NRF24"
          online={data.controllers.master.nrf24}
        />
      </div>
    </div>
  );
}