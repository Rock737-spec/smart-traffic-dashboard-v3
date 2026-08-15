"use client";

import { DashboardData } from "@/types/traffic";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Cpu,
} from "lucide-react";

interface Props {
  data: DashboardData;
}

function Notification({
  title,
  message,
  type,
}: {
  title: string;
  message: string;
  type: "success" | "warning" | "danger";
}) {
  const color =
    type === "success"
      ? "border-green-500 bg-green-500/10"
      : type === "warning"
      ? "border-yellow-500 bg-yellow-500/10"
      : "border-red-500 bg-red-500/10";

  const icon =
    type === "success" ? (
      <CheckCircle2 className="text-green-400" size={20} />
    ) : type === "warning" ? (
      <AlertTriangle className="text-yellow-400" size={20} />
    ) : (
      <WifiOff className="text-red-400" size={20} />
    );

  return (
    <div
      className={`border rounded-xl p-4 ${color} flex items-start gap-3`}
    >
      {icon}

      <div>
        <h4 className="font-bold">{title}</h4>

        <p className="text-sm text-slate-300">
          {message}
        </p>
      </div>
    </div>
  );
}

export default function NotificationPanel({
  data,
}: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex items-center gap-3 mb-6">

        <Bell className="text-cyan-400" />

        <h2 className="text-2xl font-bold">
          Notifications
        </h2>

      </div>

      <div className="space-y-4">

        <Notification
          title="Firebase"
          message={
            data.controllers.master.firebase
              ? "Realtime Database Connected"
              : "Firebase Connection Lost"
          }
          type={
            data.controllers.master.firebase
              ? "success"
              : "danger"
          }
        />

        <Notification
          title="Master Controller"
          message={
            data.controllers.master.online
              ? "Operating Normally"
              : "Controller Offline"
          }
          type={
            data.controllers.master.online
              ? "success"
              : "danger"
          }
        />

        <Notification
          title="Slave Controller"
          message={
            data.controllers.slave.online
              ? "ESP-NOW Communication Active"
              : "ESP-NOW Lost"
          }
          type={
            data.controllers.slave.online
              ? "success"
              : "danger"
          }
        />

        <Notification
          title="Emergency Override"
          message={
            data.emergency.active
              ? `Route ${data.emergency.route} is active`
              : "No Emergency Vehicle Detected"
          }
          type={
            data.emergency.active
              ? "warning"
              : "success"
          }
        />

        <Notification
          title="Traffic Signals"
          message="All four junctions are reporting status."
          type="success"
        />

      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">

        <Cpu size={16} />

        <span className="text-sm">
          Live updates every Firebase refresh
        </span>

      </div>

    </div>
  );
}