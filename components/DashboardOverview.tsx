"use client";

import {
  Cpu,
  TrafficCone,
  Siren,
  HeartPulse,
} from "lucide-react";

import { DashboardData } from "@/types/traffic";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  data: DashboardData;
}

function Card({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-2xl p-6 transition-all hover:shadow-lg ${
        theme === "dark"
          ? "bg-slate-900 border border-slate-800 hover:border-cyan-500 text-white"
          : "bg-white border border-gray-200 hover:border-blue-400 text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p
            className={`text-sm ${
              theme === "dark"
                ? "text-slate-400"
                : "text-gray-500"
            }`}
          >
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

          <p
            className={`text-sm mt-2 ${
              theme === "dark"
                ? "text-slate-500"
                : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        </div>

        <div className={color}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview({
  data,
}: Props) {
  const { theme } = useTheme();

  const online =
    Object.values(data.controllers).filter(
      (c) => c.online
    ).length;

  const activeSignal =
    Object.values(data.signals).find(
      (s) => s.color === "GREEN"
    );

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 ${
        theme === "dark"
          ? "text-white"
          : "text-gray-900"
      }`}
    >
      <Card
        title="Controllers Online"
        value={`${online}/3`}
        subtitle="ESP32 Devices"
        color="bg-cyan-500/20 p-4 rounded-xl"
        icon={<Cpu className="text-cyan-400" />}
      />

      <Card
        title="Active Green"
        value={
          activeSignal
            ? `Signal ${activeSignal.id}`
            : "--"
        }
        subtitle="Traffic Flow"
        color="bg-green-500/20 p-4 rounded-xl"
        icon={<TrafficCone className="text-green-400" />}
      />

      <Card
        title="Emergency"
        value={
          data.emergency.active
            ? "ACTIVE"
            : "NORMAL"
        }
        subtitle="Priority Status"
        color="bg-red-500/20 p-4 rounded-xl"
        icon={<Siren className="text-red-400" />}
      />

      <Card
        title="System Health"
        value={`${data.analytics.systemHealth}%`}
        subtitle="Overall Status"
        color="bg-emerald-500/20 p-4 rounded-xl"
        icon={<HeartPulse className="text-emerald-400" />}
      />
    </div>
  );
}