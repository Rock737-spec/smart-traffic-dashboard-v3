"use client";

import { Controller } from "@/types/traffic";
import { useTheme } from "@/components/ThemeProvider";

import {
  Cpu,
  Wifi,
  Database,
  Radio,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Props {
  controllers: {
    master: Controller;
    slave: Controller;
    ambulance: Controller;
  };
}

function StatusBadge({ value }: { value: boolean }) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
        value
          ? "bg-green-500/15 text-green-500"
          : "bg-red-500/15 text-red-500"
      }`}
    >
      {value ? (
        <CheckCircle2 size={14} />
      ) : (
        <XCircle size={14} />
      )}

      {value ? "ONLINE" : "OFFLINE"}
    </div>
  );
}

function Card({
  controller,
  title,
}: {
  controller: Controller;
  title: string;
}) {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
        theme === "dark"
          ? "bg-slate-900 border border-slate-800 hover:border-cyan-500 text-white"
          : "bg-white border border-gray-300 hover:border-blue-500 text-black shadow-md"
      }`}
    >
      {/* Header */}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl ${
              theme === "dark"
                ? "bg-cyan-500/10"
                : "bg-blue-100"
            }`}
          >
            <Cpu
              className={
                theme === "dark"
                  ? "text-cyan-400"
                  : "text-blue-600"
              }
            />
          </div>

          <div>
            <h2 className="font-bold text-lg">
              {title}
            </h2>

            <p
              className={
                theme === "dark"
                  ? "text-slate-500 text-sm"
                  : "text-gray-500 text-sm"
              }
            >
              Firmware {controller.firmware}
            </p>
          </div>
        </div>

        <StatusBadge value={controller.online} />
      </div>

      {/* Divider */}

      <div
        className={`my-5 border-t ${
          theme === "dark"
            ? "border-slate-800"
            : "border-gray-200"
        }`}
      />

      {/* WiFi */}

      <div className="flex justify-between py-2">
        <span
          className={`flex items-center gap-2 ${
            theme === "dark"
              ? "text-slate-400"
              : "text-gray-600"
          }`}
        >
          <Wifi size={17} />
          WiFi RSSI
        </span>

        <span
          className={`font-bold ${
            controller.wifiRSSI > -65
              ? "text-green-500"
              : controller.wifiRSSI > -80
              ? "text-yellow-500"
              : "text-red-500"
          }`}
        >
          {controller.wifiRSSI} dBm
        </span>
      </div>

      {/* Firebase */}

      <div className="flex justify-between py-2">
        <span
          className={`flex items-center gap-2 ${
            theme === "dark"
              ? "text-slate-400"
              : "text-gray-600"
          }`}
        >
          <Database size={17} />
          Firebase
        </span>

        <StatusBadge value={controller.firebase} />
      </div>

      {/* ESP NOW */}

      <div className="flex justify-between py-2">
        <span
          className={`flex items-center gap-2 ${
            theme === "dark"
              ? "text-slate-400"
              : "text-gray-600"
          }`}
        >
          <Radio size={17} />
          ESP-NOW
        </span>

        <StatusBadge value={controller.espNow} />
      </div>

      {/* NRF24 */}

      <div className="flex justify-between py-2">
        <span
          className={`flex items-center gap-2 ${
            theme === "dark"
              ? "text-slate-400"
              : "text-gray-600"
          }`}
        >
          <ShieldCheck size={17} />
          NRF24
        </span>

        <StatusBadge value={controller.nrf24} />
      </div>

      {/* Footer */}

      <div
        className={`mt-5 rounded-xl p-4 ${
          theme === "dark"
            ? "bg-slate-950 border border-slate-800"
            : "bg-gray-100 border border-gray-300"
        }`}
      >
        <p
          className={`text-xs ${
            theme === "dark"
              ? "text-slate-400"
              : "text-gray-600"
          }`}
        >
          {controller.online
            ? "Controller is communicating with the Smart Traffic Network."
            : "Heartbeat timeout. Waiting for controller reconnection."}
        </p>
      </div>
    </div>
  );
}

export default function ControllerCards({
  controllers,
}: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card
        title="Master ESP32"
        controller={controllers.master}
      />

      <Card
        title="Slave ESP32"
        controller={controllers.slave}
      />

      <Card
        title="Ambulance ESP32"
        controller={controllers.ambulance}
      />
    </div>
  );
}