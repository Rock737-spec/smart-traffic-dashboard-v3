"use client";

import {
  Cpu,
  Database,
  ShieldCheck,
  Clock3,
} from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";

export default function Footer() {
  const { theme } = useTheme();

  const year = new Date().getFullYear();

  return (
    <footer
      className={`mt-10 border-t transition-colors duration-300 ${
        theme === "dark"
          ? "bg-slate-950 border-slate-800"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="px-8 py-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="flex items-center gap-3">

            <Cpu
              className={
                theme === "dark"
                  ? "text-cyan-400"
                  : "text-cyan-600"
              }
              size={22}
            />

            <div>

              <p
                className={`text-xs uppercase ${
                  theme === "dark"
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                System
              </p>

              <p
                className={`font-semibold ${
                  theme === "dark"
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                Smart Traffic Controller
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <Database
              className={
                theme === "dark"
                  ? "text-cyan-400"
                  : "text-cyan-600"
              }
              size={22}
            />

            <div>

              <p
                className={`text-xs uppercase ${
                  theme === "dark"
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Database
              </p>

              <p
                className={`font-semibold ${
                  theme === "dark"
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                Firebase Realtime DB
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <ShieldCheck
              className={
                theme === "dark"
                  ? "text-green-400"
                  : "text-green-600"
              }
              size={22}
            />

            <div>

              <p
                className={`text-xs uppercase ${
                  theme === "dark"
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Status
              </p>

              <p
                className={`font-semibold ${
                  theme === "dark"
                    ? "text-green-400"
                    : "text-green-600"
                }`}
              >
                Operational
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <Clock3
              className={
                theme === "dark"
                  ? "text-cyan-400"
                  : "text-cyan-600"
              }
              size={22}
            />

            <div>

              <p
                className={`text-xs uppercase ${
                  theme === "dark"
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Version
              </p>

              <p
                className={`font-semibold ${
                  theme === "dark"
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                v2.0.0
              </p>

            </div>

          </div>

        </div>

        <div
          className={`mt-6 pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-2 text-sm ${
            theme === "dark"
              ? "border-slate-800 text-slate-400"
              : "border-slate-200 text-slate-500"
          }`}
        >

          <span>
            © {year} Smart Traffic Control System
          </span>

          <span>
            ESP32 • ESP-NOW • NRF24 • Firebase • Next.js
          </span>

        </div>

      </div>
    </footer>
  );
}