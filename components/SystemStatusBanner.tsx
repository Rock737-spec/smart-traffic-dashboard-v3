"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from "lucide-react";

import { DashboardData } from "@/types/traffic";

interface Props {
  data: DashboardData;
  firebaseConnected: boolean;
}

export default function SystemStatusBanner({
  data,
  firebaseConnected,
}: Props) {

  let title = "All Systems Operational";
  let subtitle =
    "All controllers are communicating normally.";

  let color =
    "bg-green-500/10 border-green-500/30 text-green-400";

  let Icon = CheckCircle2;

  if (!firebaseConnected) {

    title = "Firebase Disconnected";
    subtitle =
      "Waiting for realtime database updates.";

    color =
      "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";

    Icon = AlertTriangle;
  }

  else if (data.emergency.active) {

    title = "Emergency Mode Active";
    subtitle =
      "Emergency vehicle priority is enabled.";

    color =
      "bg-red-500/10 border-red-500/30 text-red-400";

    Icon = ShieldCheck;
  }

  else if (!data.controllers.master.online) {

    title = "Master Controller Offline";
    subtitle =
      "Master ESP32 is not responding.";

    color =
      "bg-red-500/10 border-red-500/30 text-red-400";

    Icon = XCircle;
  }

  return (

    <div
      className={`border rounded-2xl p-5 flex items-center gap-4 ${color}`}
    >

      <Icon size={34} />

      <div>

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="text-sm opacity-80">
          {subtitle}
        </p>

      </div>

    </div>

  );
}