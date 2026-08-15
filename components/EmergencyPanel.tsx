"use client";

import {
  AlertTriangle,
  Radio,
  Timer,
  Route,
  ShieldCheck,
  Activity,
} from "lucide-react";

import {
  EmergencyStatus,
  Controller,
} from "@/types/traffic";

import { useTheme } from "@/components/ThemeProvider";

interface EmergencyPanelProps {
  emergency: EmergencyStatus;

  controllers?: {
    master: Controller;
    slave: Controller;
    ambulance: Controller;
  };
}

export default function EmergencyPanel({
  emergency,
  controllers,
}: EmergencyPanelProps) {
  const { theme } = useTheme();

  const active = emergency.active;

  const nrf =
    emergency.nrfConnected ??
    controllers?.ambulance?.nrf24 ??
    false;

  const keypad =
    emergency.keypadConnected ??
    controllers?.master?.online ??
    false;

  return (
    <div
      className={`rounded-3xl shadow-xl p-6 border transition-all ${
        theme === "dark"
          ? "bg-slate-900 border-slate-700 text-white"
          : "bg-white border-gray-300 text-black"
      }`}
    >
      {/* Header */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">
            Emergency Override
          </h2>

          <p
            className={
              theme === "dark"
                ? "text-slate-400 text-sm"
                : "text-gray-500 text-sm"
            }
          >
            Priority Vehicle Management
          </p>
        </div>

        <div
          className={`px-4 py-2 rounded-full font-bold text-sm ${
            active
              ? "bg-red-500/20 text-red-500 animate-pulse"
              : "bg-green-500/20 text-green-500"
          }`}
        >
          {active ? "ACTIVE" : "STANDBY"}
        </div>
      </div>

      {/* Alert */}

      <div
        className={`rounded-2xl p-5 mb-6 border ${
          active
            ? "bg-red-500/10 border-red-500/30"
            : theme === "dark"
            ? "bg-slate-800 border-slate-700"
            : "bg-gray-100 border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle
            size={32}
            className={
              active
                ? "text-red-500"
                : theme === "dark"
                ? "text-slate-500"
                : "text-gray-500"
            }
          />

          <div>
            <div className="text-lg font-bold">
              {active
                ? "Emergency Vehicle Detected"
                : "No Active Emergency"}
            </div>

            <div
              className={
                theme === "dark"
                  ? "text-slate-400 text-sm"
                  : "text-gray-600 text-sm"
              }
            >
              {active
                ? "Traffic signal priority is currently enabled."
                : "Traffic signals are operating normally."}
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}

      <div className="grid grid-cols-2 gap-4">
        <Card
          icon={<Route size={18} />}
          title="Priority Route"
          value={emergency.route || "--"}
        />

        <Card
          icon={<Timer size={18} />}
          title="Countdown"
          value={`${emergency.countdown}s`}
        />

        <Card
          icon={<Radio size={18} />}
          title="NRF24"
          value={
            nrf
              ? "Connected"
              : "Disconnected"
          }
          success={nrf}
        />

        <Card
          icon={<ShieldCheck size={18} />}
          title="Keypad"
          value={
            keypad
              ? "Connected"
              : "Disconnected"
          }
          success={keypad}
        />
      </div>

      {/* Footer */}

      <div
        className={`mt-6 rounded-xl border p-4 ${
          theme === "dark"
            ? "bg-slate-800 border-slate-700"
            : "bg-gray-100 border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Activity
            size={18}
            className="text-cyan-500"
          />

          <span className="font-semibold">
            System Message
          </span>
        </div>

        <p
          className={`text-sm leading-6 ${
            theme === "dark"
              ? "text-slate-400"
              : "text-gray-600"
          }`}
        >
          {active
            ? "Emergency override is active. Signal timing has been temporarily adjusted to provide priority passage for the emergency vehicle."
            : "All traffic controllers are operating under normal adaptive signal control."}
        </p>
      </div>
    </div>
  );
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  success?: boolean;
}

function Card({
  icon,
  title,
  value,
  success,
}: CardProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-xl p-4 border transition-all ${
        theme === "dark"
          ? "bg-slate-800 border-slate-700"
          : "bg-gray-50 border-gray-300"
      }`}
    >
      <div
        className={`flex items-center gap-2 text-xs uppercase ${
          theme === "dark"
            ? "text-slate-400"
            : "text-gray-500"
        }`}
      >
        {icon}
        {title}
      </div>

      <div
        className={`mt-2 text-lg font-bold ${
          success === undefined
            ? theme === "dark"
              ? "text-white"
              : "text-black"
            : success
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {value}
      </div>
    </div>
  );
}