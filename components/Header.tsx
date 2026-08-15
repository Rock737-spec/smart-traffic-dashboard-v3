"use client";

import { Wifi, WifiOff, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  firebaseConnected: boolean;
}

export default function Header({
  firebaseConnected,
}: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className={`flex justify-between items-center px-8 py-6 border-b transition-all ${
        theme === "dark"
          ? "bg-slate-900 border-slate-800 text-white"
          : "bg-white border-gray-300 text-gray-900"
      }`}
    >
      <div>
        <h1 className="text-4xl font-bold">
          AI Smart Traffic Management System
        </h1>

        <p
          className={
            theme === "dark"
              ? "text-slate-400"
              : "text-gray-600"
          }
        >
          Digital Twin Dashboard
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">
            {new Date().toLocaleDateString()}
          </p>

          <p
            className={
              theme === "dark"
                ? "text-cyan-400"
                : "text-blue-600"
            }
          >
            {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Theme Button */}

        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl border transition ${
            theme === "dark"
              ? "border-slate-700 hover:bg-slate-800 text-white"
              : "border-gray-300 hover:bg-gray-100 text-gray-900"
          }`}
        >
          {theme === "dark" ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>

        {/* Firebase Status */}

        <div
          className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold ${
            firebaseConnected
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {firebaseConnected ? (
            <Wifi size={18} />
          ) : (
            <WifiOff size={18} />
          )}

          {firebaseConnected
            ? "Firebase Connected"
            : "Firebase Offline"}
        </div>
      </div>
    </header>
  );
}