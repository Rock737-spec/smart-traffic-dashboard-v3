"use client";

import { DashboardData } from "@/types/traffic";
import {
  Cloud,
  Cpu,
  Radio,
  Ambulance,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  data: DashboardData;
}

function Node({
  title,
  online,
  icon,
}: {
  title: string;
  online: boolean;
  icon: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <div
      className={`w-44 rounded-2xl border p-5 transition-all duration-500 ${
        online
          ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
          : theme === "dark"
          ? "border-slate-700 bg-slate-900 text-white"
          : "border-gray-300 bg-white text-black shadow-md"
      }`}
    >
      <div className="flex justify-center mb-3">
        {icon}
      </div>

      <h3 className="text-center font-bold">
        {title}
      </h3>

      <div
        className={`mt-3 text-center text-sm font-bold ${
          online
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {online ? "ONLINE" : "OFFLINE"}
      </div>
    </div>
  );
}

function Link({
  active,
}: {
  active: boolean;
}) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center flex-1 px-4">

      <div
        className={`h-1 w-full rounded-full relative overflow-hidden ${
          active
            ? "bg-cyan-700"
            : theme === "dark"
            ? "bg-slate-700"
            : "bg-gray-300"
        }`}
      >

        {active && (
          <div className="absolute inset-y-0 w-8 bg-cyan-400 animate-pulse rounded-full" />
        )}

      </div>

    </div>
  );
}

export default function NetworkTopology({
  data,
}: Props) {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-2xl border p-8 transition-all ${
        theme === "dark"
          ? "bg-slate-900 border-slate-800 text-white"
          : "bg-white border-gray-300 shadow-md text-black"
      }`}
    >

      <div className="mb-8">

        <h2 className="text-2xl font-bold">
          Network Topology
        </h2>

        <p
          className={
            theme === "dark"
              ? "text-slate-400"
              : "text-gray-500"
          }
        >
          Live communication architecture
        </p>

      </div>

      <div className="flex items-center">

        <Node
          title="Firebase"
          online={data.controllers.master.firebase}
          icon={<Cloud size={42} className="text-cyan-500" />}
        />

        <Link active={data.controllers.master.firebase} />

        <Node
          title="Master ESP32"
          online={data.controllers.master.online}
          icon={<Cpu size={42} className="text-cyan-500" />}
        />

        <Link active={data.controllers.master.espNow} />

        <Node
          title="Slave ESP32"
          online={data.controllers.slave.online}
          icon={<Radio size={42} className="text-cyan-500" />}
        />

        <Link active={data.controllers.ambulance.nrf24} />

        <Node
          title="Ambulance"
          online={data.controllers.ambulance.online}
          icon={<Ambulance size={42} className="text-cyan-500" />}
        />

      </div>

    </div>
  );
}