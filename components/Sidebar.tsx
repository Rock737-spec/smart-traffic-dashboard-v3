"use client";

import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Cpu,
  TrafficCone,
  Map,
  Siren,
  BrainCircuit,
  BarChart3,
  Network,
  Activity,
  ScrollText,
} from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "top",
  },
  {
    title: "Controllers",
    icon: Cpu,
    id: "controllers",
  },
  {
    title: "Traffic Signals",
    icon: TrafficCone,
    id: "signals",
  },
  {
    title: "Live Intersection",
    icon: Map,
    id: "intersection",
  },
  {
    title: "AI Traffic Analysis",
    icon: BrainCircuit,
    id: "ai-analysis",
  },
  {
    title: "Emergency",
    icon: Siren,
    id: "emergency",
  },
  {
    title: "System Analytics",
    icon: BarChart3,
    id: "analytics",
  },
  {
    title: "Network",
    icon: Network,
    id: "network",
  },
  {
    title: "System Health",
    icon: Activity,
    id: "health",
  },
  {
    title: "Event Log",
    icon: ScrollText,
    id: "events",
  },
];

export default function Sidebar() {
  const [active, setActive] = useState("top");

  const { theme } = useTheme();

  useEffect(() => {
    const sections = menuItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        threshold: 0.35,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    if (id === "top") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <aside
      className={`w-72 h-screen sticky top-0 border-r transition-all duration-300 ${
        theme === "dark"
          ? "bg-slate-950 border-slate-800 text-white"
          : "bg-white border-gray-300 text-black"
      }`}
    >
      {/* SIDEBAR HEADER */}

      <div className="p-6">
        <h1
          className={`text-2xl font-bold ${
            theme === "dark"
              ? "text-cyan-400"
              : "text-blue-600"
          }`}
        >
          CONTROL PANEL
        </h1>

        <p
          className={`text-sm mt-1 ${
            theme === "dark"
              ? "text-slate-500"
              : "text-gray-600"
          }`}
        >
          Navigation
        </p>
      </div>

      {/* NAVIGATION */}

      <nav className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const selected = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                selected
                  ? theme === "dark"
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-blue-600 text-white shadow-lg"
                  : theme === "dark"
                  ? "text-slate-400 hover:bg-slate-800 hover:text-cyan-400"
                  : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
              }`}
            >
              <Icon size={20} />

              <span className="font-medium">
                {item.title}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}