"use client";

import { DashboardData } from "@/types/traffic";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  data: DashboardData;
}

export default function LiveIntersection({
  data,
}: Props) {

  const { theme } = useTheme();

  const {
    signals,
    emergency,
  } = data;

  const dark = theme === "dark";

  return (
    <div
  className={`rounded-3xl border p-6 transition-colors duration-300 ${
    dark
      ? "bg-slate-900 border-slate-700 text-white"
      : "bg-white border-gray-300 text-black shadow-lg"
  }`}
>

      {/* HEADER */}

      <div className="mb-6">

      <h2
  className={`text-3xl font-bold ${
    dark ? "text-white" : "text-gray-900"
  }`}
>
          Live Intersection
        </h2>

        <p
  className={`mt-1 ${
    dark ? "text-slate-400" : "text-gray-500"
  }`}
>
          Real-time Digital Twin
        </p>

      </div>

      {/* ROAD CONTAINER */}

      <div
  className={`relative mx-auto w-[760px] h-[760px] rounded-3xl overflow-hidden ${
    dark
      ? "bg-[#050816]"
      : "bg-gray-100"
  }`}
>

        {/* ===============================
            TOP ROAD
        ================================ */}

<div
  className={`absolute left-1/2 top-0 -translate-x-1/2 w-28 h-full ${
    dark ? "bg-slate-600" : "bg-gray-400"
  }`}
/>

<div
  className={`absolute left-0 top-1/2 -translate-y-1/2 h-28 w-full ${
    dark ? "bg-slate-600" : "bg-gray-400"
  }`}
/>
        {/* ===============================
            ROAD SHADOWS
        ================================ */}

        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-28 h-full bg-gradient-to-r from-black/20 via-transparent to-black/20" />

        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-28 w-full bg-gradient-to-b from-black/20 via-transparent to-black/20" />
                {/* ======================================
            CENTRE YELLOW LANE MARKINGS
        ======================================= */}

        {/* TOP */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[4px] h-[250px] bg-yellow-400" />

        {/* BOTTOM */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[4px] h-[250px] bg-yellow-400" />

        {/* LEFT */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[4px] w-[250px] bg-yellow-400" />

        {/* RIGHT */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[4px] w-[250px] bg-yellow-400" />


        {/* ======================================
            CONTINUOUS STOP LINES
        ======================================= */}

        {/* TOP */}
        <div className="absolute left-1/2 top-[262px] -translate-x-1/2 w-28 h-[2px] bg-white z-30" />

        {/* BOTTOM */}
        <div className="absolute left-1/2 bottom-[262px] -translate-x-1/2 w-28 h-[2px] bg-white z-30" />

        {/* LEFT */}
        <div className="absolute left-[262px] top-1/2 -translate-y-1/2 h-28 w-[2px] bg-white z-30" />

        {/* RIGHT */}
        <div className="absolute right-[262px] top-1/2 -translate-y-1/2 h-28 w-[2px] bg-white z-30" />


        {/* ======================================
            ZEBRA CROSSINGS
        ======================================= */}

        {/* TOP */}
        <div className="absolute left-1/2 top-[208px] -translate-x-1/2 flex flex-col gap-[4px] z-20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`zt${i}`}
              className="w-28 h-[5px] bg-white rounded-full"
            />
          ))}
        </div>

        {/* BOTTOM */}
        <div className="absolute left-1/2 bottom-[208px] -translate-x-1/2 flex flex-col gap-[4px] z-20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`zb${i}`}
              className="w-28 h-[5px] bg-white rounded-full"
            />
          ))}
        </div>

        {/* LEFT */}
        <div className="absolute left-[208px] top-1/2 -translate-y-1/2 flex gap-[4px] z-20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`zl${i}`}
              className="w-[5px] h-28 bg-white rounded-full"
            />
          ))}
        </div>

        {/* RIGHT */}
        <div className="absolute right-[208px] top-1/2 -translate-y-1/2 flex gap-[4px] z-20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`zr${i}`}
              className="w-[5px] h-28 bg-white rounded-full"
            />
          ))}
        </div>
                {/* ======================================
            CENTRE ROUNDABOUT
        ======================================= */}

<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40">

{/* Outer Glow */}
<div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl scale-125" />

{/* Ring */}
<div
  className={`relative w-40 h-40 rounded-full border-[4px] border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)]
  ${dark ? "bg-slate-900" : "bg-white"}`}
>

  <div className="text-cyan-400 text-5xl font-black">
    ✕
  </div>

  <div
  className={`mt-2 font-bold tracking-widest ${
    dark ? "text-white" : "text-gray-900"
  }`}
>
    MASTER
  </div>

  <div
  className={`text-xs mt-1 ${
    dark ? "text-slate-400" : "text-gray-500"
  }`}
>
    CONTROLLER
  </div>

</div>

</div>


{/* ======================================
  ROAD EDGE SHADOWS
======================================= */}

<div
  className={`absolute left-[316px] top-0 h-full w-[2px] ${
    theme === "dark" ? "bg-black/20" : "bg-black/10"
  }`}
/>

<div
  className={`absolute left-[442px] top-0 h-full w-[2px] ${
    theme === "dark" ? "bg-black/20" : "bg-black/10"
  }`}
/>

<div
  className={`absolute left-0 top-[316px] w-full h-[2px] ${
    theme === "dark" ? "bg-black/20" : "bg-black/10"
  }`}
/>

<div
  className={`absolute left-0 top-[442px] w-full h-[2px] ${
    theme === "dark" ? "bg-black/20" : "bg-black/10"
  }`}
/>


{/* ======================================
  ROAD GLOW
======================================= */}

<div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-28 bg-cyan-400/5 pointer-events-none" />

<div className="absolute left-0 top-1/2 -translate-y-1/2 h-28 w-full bg-cyan-400/5 pointer-events-none" />


{/* ======================================
  EMERGENCY ROUTE
======================================= */}

{emergency.active && emergency.route === "signal1" && (
  <div className="absolute left-1/2 top-0 -translate-x-1/2 h-1/2 w-28 bg-cyan-400/20 animate-pulse z-10" />
)}

{emergency.active && emergency.route === "signal2" && (
  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-28 w-1/2 bg-cyan-400/20 animate-pulse z-10" />
)}

{emergency.active && emergency.route === "signal3" && (
  <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-1/2 w-28 bg-cyan-400/20 animate-pulse z-10" />
)}

{emergency.active && emergency.route === "signal4" && (
  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-28 w-1/2 bg-cyan-400/20 animate-pulse z-10" />
)}

{/* ======================================
    TOP SIGNAL
======================================= */}

<div className="absolute left-1/2 top-8 -translate-x-1/2 z-50 flex flex-col items-center">

  <div
    className={`w-16 h-16 rounded-full transition-all duration-300 shadow-2xl ${
      signals.signal1.color === "GREEN"
        ? "bg-green-500 shadow-green-400/80"
        : signals.signal1.color === "YELLOW"
        ? "bg-yellow-400 shadow-yellow-300/80"
        : "bg-red-500 shadow-red-400/80"
    }`}
  />

  <div className="mt-4 text-center">

    <div
      className={`text-3xl font-black tracking-wider ${
        theme === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      {signals.signal1.color}
    </div>

    <div className="text-cyan-500 text-2xl font-bold">
      {signals.signal1.countdown}s
    </div>

  </div>

</div>


{/* ======================================
  RIGHT SIGNAL
======================================= */}

<div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">

  <div
    className={`w-16 h-16 rounded-full transition-all duration-300 shadow-2xl ${
      signals.signal2.color === "GREEN"
        ? "bg-green-500 shadow-green-400/80"
        : signals.signal2.color === "YELLOW"
        ? "bg-yellow-400 shadow-yellow-300/80"
        : "bg-red-500 shadow-red-400/80"
    }`}
  />

  <div className="mt-4 text-center">

    <div
      className={`text-3xl font-black tracking-wider ${
        theme === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      {signals.signal2.color}
    </div>

    <div className="text-cyan-500 text-2xl font-bold">
      {signals.signal2.countdown}s
    </div>

  </div>

</div>


{/* ======================================
  BOTTOM SIGNAL
======================================= */}

<div className="absolute left-1/2 bottom-8 -translate-x-1/2 z-50 flex flex-col items-center">

  <div
    className={`w-16 h-16 rounded-full transition-all duration-300 shadow-2xl ${
      signals.signal3.color === "GREEN"
        ? "bg-green-500 shadow-green-400/80"
        : signals.signal3.color === "YELLOW"
        ? "bg-yellow-400 shadow-yellow-300/80"
        : "bg-red-500 shadow-red-400/80"
    }`}
  />

  <div className="mt-4 text-center">

    <div
      className={`text-3xl font-black tracking-wider ${
        theme === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      {signals.signal3.color}
    </div>

    <div className="text-cyan-500 text-2xl font-bold">
      {signals.signal3.countdown}s
    </div>

  </div>

</div>


{/* ======================================
  LEFT SIGNAL
======================================= */}

<div className="absolute left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">

  <div
    className={`w-16 h-16 rounded-full transition-all duration-300 shadow-2xl ${
      signals.signal4.color === "GREEN"
        ? "bg-green-500 shadow-green-400/80"
        : signals.signal4.color === "YELLOW"
        ? "bg-yellow-400 shadow-yellow-300/80"
        : "bg-red-500 shadow-red-400/80"
    }`}
  />

  <div className="mt-4 text-center">

    <div
      className={`text-3xl font-black tracking-wider ${
        theme === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      {signals.signal4.color}
    </div>

    <div className="text-cyan-500 text-2xl font-bold">
      {signals.signal4.countdown}s
    </div>

  </div>

</div>

{/* ======================================
    ROAD EDGE MARKINGS
======================================= */}

<div
  className={`absolute left-[318px] top-0 h-full w-[2px] ${
    theme === "dark" ? "bg-white/30" : "bg-gray-500/40"
  }`}
/>

<div
  className={`absolute left-[440px] top-0 h-full w-[2px] ${
    theme === "dark" ? "bg-white/30" : "bg-gray-500/40"
  }`}
/>

<div
  className={`absolute left-0 top-[318px] w-full h-[2px] ${
    theme === "dark" ? "bg-white/30" : "bg-gray-500/40"
  }`}
/>

<div
  className={`absolute left-0 top-[440px] w-full h-[2px] ${
    theme === "dark" ? "bg-white/30" : "bg-gray-500/40"
  }`}
/>

 {/* ======================================
    CORNER BLOCKS (Buildings)
======================================= */}

<div
  className={`absolute left-0 top-0 w-[300px] h-[300px] rounded-br-3xl border ${
    theme === "dark"
      ? "bg-slate-900 border-slate-700"
      : "bg-gray-100 border-gray-300"
  }`}
/>

<div
  className={`absolute right-0 top-0 w-[300px] h-[300px] rounded-bl-3xl border ${
    theme === "dark"
      ? "bg-slate-900 border-slate-700"
      : "bg-gray-100 border-gray-300"
  }`}
/>

<div
  className={`absolute left-0 bottom-0 w-[300px] h-[300px] rounded-tr-3xl border ${
    theme === "dark"
      ? "bg-slate-900 border-slate-700"
      : "bg-gray-100 border-gray-300"
  }`}
/>

<div
  className={`absolute right-0 bottom-0 w-[300px] h-[300px] rounded-tl-3xl border ${
    theme === "dark"
      ? "bg-slate-900 border-slate-700"
      : "bg-gray-100 border-gray-300"
  }`}
/>


{/* ======================================
    BUILDING GLOW
======================================= */}

<div className="absolute left-0 top-0 w-[300px] h-[300px] rounded-br-3xl shadow-[inset_0_0_40px_rgba(34,211,238,0.05)]" />

<div className="absolute right-0 top-0 w-[300px] h-[300px] rounded-bl-3xl shadow-[inset_0_0_40px_rgba(34,211,238,0.05)]" />

<div className="absolute left-0 bottom-0 w-[300px] h-[300px] rounded-tr-3xl shadow-[inset_0_0_40px_rgba(34,211,238,0.05)]" />

<div className="absolute right-0 bottom-0 w-[300px] h-[300px] rounded-tl-3xl shadow-[inset_0_0_40px_rgba(34,211,238,0.05)]" />


{/* ======================================
    INTERSECTION HIGHLIGHT
======================================= */}

<div
  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[210px] h-[210px] rounded-full ${
    theme === "dark"
      ? "border border-cyan-400/20"
      : "border border-cyan-500/30"
  }`}
/>

<div
  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full ${
    theme === "dark"
      ? "border border-cyan-400/10"
      : "border border-cyan-500/20"
  }`}
/>


{/* ======================================
    SUBTLE GRID
======================================= */}

<div
  className={`absolute inset-0 opacity-[0.03] ${
    theme === "dark"
      ? "bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]"
      : "bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)]"
  } bg-[size:40px_40px]`}
/>

{/* ======================================
    CONTROLLER STATUS HUD
======================================= */}

<div className="absolute top-6 left-6 z-50">

  <div
    className={`backdrop-blur-xl rounded-xl px-4 py-3 shadow-xl border ${
      theme === "dark"
        ? "bg-slate-900/90 border-cyan-500/20"
        : "bg-white/90 border-cyan-500/30"
    }`}
  >

    <div
      className={`text-[11px] uppercase tracking-widest ${
        theme === "dark" ? "text-slate-400" : "text-gray-500"
      }`}
    >
      MASTER
    </div>

    <div className="flex items-center gap-2 mt-2">

      <div
        className={`w-3 h-3 rounded-full ${
          data.controllers.master.online
            ? "bg-green-400 animate-pulse"
            : "bg-red-500"
        }`}
      />

      <span
        className={`font-bold ${
          data.controllers.master.online
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {data.controllers.master.online
          ? "ONLINE"
          : "OFFLINE"}
      </span>

    </div>

  </div>

</div>


{/* ======================================
  SLAVE HUD
======================================= */}

<div className="absolute top-6 right-6 z-50">

  <div
    className={`backdrop-blur-xl rounded-xl px-4 py-3 shadow-xl border ${
      theme === "dark"
        ? "bg-slate-900/90 border-cyan-500/20"
        : "bg-white/90 border-cyan-500/30"
    }`}
  >

    <div
      className={`text-[11px] uppercase tracking-widest ${
        theme === "dark" ? "text-slate-400" : "text-gray-500"
      }`}
    >
      SLAVE
    </div>

    <div className="flex items-center gap-2 mt-2">

      <div
        className={`w-3 h-3 rounded-full ${
          data.controllers.slave.online
            ? "bg-green-400 animate-pulse"
            : "bg-red-500"
        }`}
      />

      <span
        className={`font-bold ${
          data.controllers.slave.online
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {data.controllers.slave.online
          ? "ONLINE"
          : "OFFLINE"}
      </span>

    </div>

  </div>

</div>{/* ======================================
  EMERGENCY STATUS PANEL
======================================= */}

<div className="absolute bottom-6 left-6 z-50">

  <div
    className={`rounded-xl border px-4 py-3 backdrop-blur-xl shadow-xl transition-all duration-300 ${
      emergency.active
        ? "border-red-500 bg-red-500/10"
        : theme === "dark"
        ? "border-green-500 bg-green-500/10"
        : "border-green-500 bg-green-100"
    }`}
  >

    <div
      className={`text-[11px] uppercase tracking-widest ${
        theme === "dark"
          ? "text-slate-300"
          : "text-gray-600"
      }`}
    >
      Emergency
    </div>

    <div
      className={`mt-2 text-lg font-black ${
        emergency.active
          ? "text-red-500"
          : "text-green-500"
      }`}
    >
      {emergency.active ? "ACTIVE" : "NORMAL"}
    </div>

    {emergency.active && (
      <div className="mt-1 text-xs text-cyan-500">
        Route : {emergency.route}
      </div>
    )}

  </div>

</div>


{/* ======================================
  SYSTEM HEALTH PANEL
======================================= */}

<div className="absolute bottom-6 right-6 z-50">

  <div
    className={`backdrop-blur-xl rounded-xl px-4 py-3 shadow-xl border ${
      theme === "dark"
        ? "bg-slate-900/90 border-cyan-500/20"
        : "bg-white/90 border-cyan-500/30"
    }`}
  >

    <div
      className={`text-[11px] uppercase tracking-widest ${
        theme === "dark"
          ? "text-slate-400"
          : "text-gray-500"
      }`}
    >
      System Health
    </div>

    <div className="mt-2 text-2xl font-black text-cyan-500">
      {data.analytics.systemHealth}%
    </div>

    <div
      className={`w-36 h-2 rounded-full mt-3 overflow-hidden ${
        theme === "dark"
          ? "bg-slate-700"
          : "bg-gray-300"
      }`}
    >

      <div
        className="h-full rounded-full bg-cyan-500 transition-all duration-700"
        style={{
          width: `${data.analytics.systemHealth}%`,
        }}
      />

    </div>

  </div>

</div>


{/* ======================================
  OUTER GLOW
======================================= */}


{/* ===========================
      CONTROLLER LABELS
============================ */}

<div
  className={`absolute left-6 top-6 rounded-lg px-4 py-2 z-40 border ${
    theme === "dark"
      ? "bg-slate-900/90 border-cyan-500/30"
      : "bg-white/90 border-cyan-500/30"
  }`}
>

  <div
    className={`text-xs ${
      theme === "dark"
        ? "text-slate-400"
        : "text-gray-500"
    }`}
  >
    MASTER ESP32
  </div>

  <div
    className={`font-bold ${
      data.controllers.master.online
        ? "text-green-500"
        : "text-red-500"
    }`}
  >
    {data.controllers.master.online
      ? "ONLINE"
      : "OFFLINE"}
  </div>

</div>

<div
  className={`absolute right-6 bottom-6 rounded-lg px-4 py-2 z-40 border ${
    theme === "dark"
      ? "bg-slate-900/90 border-cyan-500/30"
      : "bg-white/90 border-cyan-500/30"
  }`}
>

  <div
    className={`text-xs ${
      theme === "dark"
        ? "text-slate-400"
        : "text-gray-500"
    }`}
  >
    SLAVE ESP32
  </div>

  <div
    className={`font-bold ${
      data.controllers.slave.online
        ? "text-green-500"
        : "text-red-500"
    }`}
  >
    {data.controllers.slave.online
      ? "ONLINE"
      : "OFFLINE"}
  </div>

</div>


{/* ===========================
      EMERGENCY ROUTE OVERLAY
============================ */}

{data.emergency.active && (
  <div className="absolute inset-0 pointer-events-none z-30">
    <div
      className={`absolute bg-cyan-400/70 animate-pulse ${
        data.emergency.route === "signal1"
          ? "top-0 left-1/2 -translate-x-1/2 w-2 h-1/2"
          : data.emergency.route === "signal2"
          ? "top-1/2 right-0 -translate-y-1/2 h-2 w-1/2"
          : data.emergency.route === "signal3"
          ? "bottom-0 left-1/2 -translate-x-1/2 w-2 h-1/2"
          : data.emergency.route === "signal4"
          ? "top-1/2 left-0 -translate-y-1/2 h-2 w-1/2"
          : "hidden"
      }`}
    />
  </div>
)}


{/* ===========================
      ROAD LABELS
============================ */}

<div
  className={`absolute top-3 left-1/2 -translate-x-1/2 text-xs tracking-[0.35em] font-semibold ${
    theme === "dark"
      ? "text-slate-400"
      : "text-gray-600"
  }`}
>
  NORTH
</div>

<div
  className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-xs tracking-[0.35em] font-semibold ${
    theme === "dark"
      ? "text-slate-400"
      : "text-gray-600"
  }`}
>
  SOUTH
</div>

<div
  className={`absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-xs tracking-[0.35em] font-semibold ${
    theme === "dark"
      ? "text-slate-400"
      : "text-gray-600"
  }`}
>
  WEST
</div>

<div
  className={`absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-xs tracking-[0.35em] font-semibold ${
    theme === "dark"
      ? "text-slate-400"
      : "text-gray-600"
  }`}
>
  EAST
</div>

</div>{/* ===========================
    BOTTOM STATUS BAR
============================ */}

<div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">

  <div
    className={`rounded-xl border p-4 ${
      theme === "dark"
        ? "bg-slate-900 border-slate-700"
        : "bg-white border-gray-300 shadow-sm"
    }`}
  >
    <p
      className={`text-xs uppercase ${
        theme === "dark"
          ? "text-slate-400"
          : "text-gray-500"
      }`}
    >
      Active Signal
    </p>

    <p className="text-xl font-bold text-cyan-500">
      {Object.values(data.signals).find(
        (s) => s.color === "GREEN"
      )?.id ?? "--"}
    </p>
  </div>

  <div
    className={`rounded-xl border p-4 ${
      theme === "dark"
        ? "bg-slate-900 border-slate-700"
        : "bg-white border-gray-300 shadow-sm"
    }`}
  >
    <p
      className={`text-xs uppercase ${
        theme === "dark"
          ? "text-slate-400"
          : "text-gray-500"
      }`}
    >
      Emergency
    </p>

    <p
      className={`text-xl font-bold ${
        data.emergency.active
          ? "text-red-500"
          : "text-green-500"
      }`}
    >
      {data.emergency.active ? "ACTIVE" : "NORMAL"}
    </p>
  </div>

  <div
    className={`rounded-xl border p-4 ${
      theme === "dark"
        ? "bg-slate-900 border-slate-700"
        : "bg-white border-gray-300 shadow-sm"
    }`}
  >
    <p
      className={`text-xs uppercase ${
        theme === "dark"
          ? "text-slate-400"
          : "text-gray-500"
      }`}
    >
      Master
    </p>

    <p
      className={`text-xl font-bold ${
        data.controllers.master.online
          ? "text-green-500"
          : "text-red-500"
      }`}
    >
      {data.controllers.master.online
        ? "ONLINE"
        : "OFFLINE"}
    </p>
  </div>

  <div
    className={`rounded-xl border p-4 ${
      theme === "dark"
        ? "bg-slate-900 border-slate-700"
        : "bg-white border-gray-300 shadow-sm"
    }`}
  >
    <p
      className={`text-xs uppercase ${
        theme === "dark"
          ? "text-slate-400"
          : "text-gray-500"
      }`}
    >
      Slave
    </p>

    <p
      className={`text-xl font-bold ${
        data.controllers.slave.online
          ? "text-green-500"
          : "text-red-500"
      }`}
    >
      {data.controllers.slave.online
        ? "ONLINE"
        : "OFFLINE"}
    </p>
  </div>

</div>

</div>
);
}