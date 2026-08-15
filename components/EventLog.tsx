"use client";

import { useMemo, useState } from "react";
import {
  Search,
  X,
  CalendarDays,
  Clock3,
} from "lucide-react";

import { EventLogItem } from "@/types/traffic";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  events: EventLogItem[];
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const colour =
    status === "COMPLETED"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : status === "ACTIVE"
      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      : status === "FAILED"
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : "bg-slate-700 text-slate-300 border-slate-600";

  return (
    <span
      className={`px-2 py-1 rounded-lg border text-xs font-bold ${colour}`}
    >
      {status}
    </span>
  );
}

function AuthBadge({
  authentication,
}: {
  authentication: string;
}) {
  const ok =
    authentication.toUpperCase() ===
    "AUTHENTICATED";

  return (
    <span
      className={`px-2 py-1 rounded-lg text-xs font-bold ${
        ok
          ? "bg-green-500/20 text-green-400"
          : "bg-red-500/20 text-red-400"
      }`}
    >
      {authentication}
    </span>
  );
}

export default function EventLog({
  events,
}: Props) {

  const { theme } = useTheme();

  const [search, setSearch] =
    useState("");

  const [ambulanceFilter, setAmbulanceFilter] =
    useState("");

  const [routeFilter, setRouteFilter] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  function timeToMinutes(
    time: string
  ) {
    if (!time) return -1;

    const parts = time.split(":");

    if (parts.length < 2) return -1;

    return (
      Number(parts[0]) * 60 +
      Number(parts[1])
    );
  }

  const filteredEvents = useMemo(() => {

    return events.filter((event) => {

      const text = `
        ${event.date}
        ${event.time}
        ${event.ambulanceID}
        ${event.route}
        ${event.signal}
        ${event.authentication}
        ${event.duration}
        ${event.status}
      `.toLowerCase();

      const globalMatch =
        text.includes(
          search.toLowerCase()
        );

      const ambulanceMatch =
        ambulanceFilter === "" ||
        event.ambulanceID
          .toLowerCase()
          .includes(
            ambulanceFilter.toLowerCase()
          );

      const routeMatch =
        routeFilter === "" ||
        event.route
          .toLowerCase()
          .includes(
            routeFilter.toLowerCase()
          );

      const dateMatch =
        dateFilter === "" ||
        event.date === dateFilter;

      let timeMatch = true;

      if (
        startTime !== "" ||
        endTime !== ""
      ) {

        const eventMinutes =
          timeToMinutes(event.time);

        if (startTime !== "") {
          timeMatch =
            timeMatch &&
            eventMinutes >=
              timeToMinutes(startTime);
        }

        if (endTime !== "") {
          timeMatch =
            timeMatch &&
            eventMinutes <=
              timeToMinutes(endTime);
        }
      }

      return (
        globalMatch &&
        ambulanceMatch &&
        routeMatch &&
        dateMatch &&
        timeMatch
      );

    });

  }, [
    events,
    search,
    ambulanceFilter,
    routeFilter,
    dateFilter,
    startTime,
    endTime,
  ]);
  const authenticatedCount =
  filteredEvents.filter(
    (e) =>
      e.authentication.toUpperCase() ===
      "AUTHENTICATED"
  ).length;

const failedCount =
  filteredEvents.filter(
    (e) =>
      e.status.toUpperCase() ===
      "FAILED"
  ).length;

const completedCount =
  filteredEvents.filter(
    (e) =>
      e.status.toUpperCase() ===
      "COMPLETED"
  ).length;

return (

  <div
    className={`rounded-3xl border p-6 transition-colors ${
      theme === "dark"
        ? "bg-slate-900 border-slate-700 text-white"
        : "bg-white border-slate-300 text-slate-900 shadow-md"
    }`}
  >

    <div className="flex flex-col gap-6">

      <div>

        <h2 className="text-2xl font-bold">
          Emergency Event Log
        </h2>

        <p
          className={
            theme === "dark"
              ? "text-slate-400"
              : "text-slate-600"
          }
        >
          Search emergency vehicle records
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Global Search */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search everything..."
            className={`w-full rounded-xl border pl-10 pr-4 py-3 transition ${
              theme === "dark"
                ? "bg-slate-950 border-slate-700"
                : "bg-white border-slate-300"
            }`}
          />

        </div>

        {/* Ambulance */}

        <input
          value={ambulanceFilter}
          onChange={(e) =>
            setAmbulanceFilter(
              e.target.value
            )
          }
          placeholder="Ambulance ID..."
          className={`rounded-xl border px-4 py-3 transition ${
            theme === "dark"
              ? "bg-slate-950 border-slate-700"
              : "bg-white border-slate-300"
          }`}
        />

        {/* Route */}

        <input
          value={routeFilter}
          onChange={(e) =>
            setRouteFilter(
              e.target.value
            )
          }
          placeholder="Route..."
          className={`rounded-xl border px-4 py-3 transition ${
            theme === "dark"
              ? "bg-slate-950 border-slate-700"
              : "bg-white border-slate-300"
          }`}
        />

        {/* Date */}

        <div className="relative">

          <CalendarDays
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value
              )
            }
            className={`w-full rounded-xl border pl-10 pr-4 py-3 transition ${
              theme === "dark"
                ? "bg-slate-950 border-slate-700"
                : "bg-white border-slate-300"
            }`}
          />

        </div>

        {/* Start Time */}

        <div className="relative">

          <Clock3
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="time"
            value={startTime}
            onChange={(e) =>
              setStartTime(
                e.target.value
              )
            }
            className={`w-full rounded-xl border pl-10 pr-4 py-3 transition ${
              theme === "dark"
                ? "bg-slate-950 border-slate-700"
                : "bg-white border-slate-300"
            }`}
          />

        </div>

        {/* End Time */}

        <div className="relative">

          <Clock3
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="time"
            value={endTime}
            onChange={(e) =>
              setEndTime(
                e.target.value
              )
            }
            className={`w-full rounded-xl border pl-10 pr-4 py-3 transition ${
              theme === "dark"
                ? "bg-slate-950 border-slate-700"
                : "bg-white border-slate-300"
            }`}
          />

        </div>

      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">

        <button
          onClick={() => {
            setSearch("");
            setAmbulanceFilter("");
            setRouteFilter("");
            setDateFilter("");
            setStartTime("");
            setEndTime("");
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
        >

          <X size={18} />

          Clear Filters

        </button>

        <div className="text-cyan-500 font-bold">

          {filteredEvents.length} Records Found

        </div>

      </div>
              {/* Search Summary */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

<div
  className={`rounded-xl border p-4 ${
    theme === "dark"
      ? "bg-slate-950 border-slate-700"
      : "bg-slate-50 border-slate-200"
  }`}
>
  <p className="text-sm text-slate-500">
    Total Results
  </p>

  <h3 className="text-3xl font-bold text-cyan-500 mt-2">
    {filteredEvents.length}
  </h3>
</div>

<div
  className={`rounded-xl border p-4 ${
    theme === "dark"
      ? "bg-slate-950 border-slate-700"
      : "bg-slate-50 border-slate-200"
  }`}
>
  <p className="text-sm text-slate-500">
    Authenticated
  </p>

  <h3 className="text-3xl font-bold text-green-500 mt-2">
    {authenticatedCount}
  </h3>
</div>

<div
  className={`rounded-xl border p-4 ${
    theme === "dark"
      ? "bg-slate-950 border-slate-700"
      : "bg-slate-50 border-slate-200"
  }`}
>
  <p className="text-sm text-slate-500">
    Completed
  </p>

  <h3 className="text-3xl font-bold text-cyan-500 mt-2">
    {completedCount}
  </h3>
</div>

<div
  className={`rounded-xl border p-4 ${
    theme === "dark"
      ? "bg-slate-950 border-slate-700"
      : "bg-slate-50 border-slate-200"
  }`}
>
  <p className="text-sm text-slate-500">
    Failed
  </p>

  <h3 className="text-3xl font-bold text-red-500 mt-2">
    {failedCount}
  </h3>
</div>

</div>

</div>

{/* Table */}

<div
className={`mt-8 overflow-auto rounded-2xl border ${
theme === "dark"
  ? "border-slate-700"
  : "border-slate-300"
}`}
>

<table className="w-full text-sm">

<thead
  className={`sticky top-0 ${
    theme === "dark"
      ? "bg-slate-950"
      : "bg-slate-100"
  }`}
>

  <tr
    className={
      theme === "dark"
        ? "text-slate-400"
        : "text-slate-600"
    }
  >

    <th className="p-4 text-left">
      Date
    </th>

    <th className="p-4 text-left">
      Time
    </th>

    <th className="p-4 text-left">
      Ambulance
    </th>

    <th className="p-4 text-left">
      Route
    </th>

    <th className="p-4 text-left">
      Signal
    </th>

    <th className="p-4 text-left">
      Authentication
    </th>

    <th className="p-4 text-left">
      Duration
    </th>

    <th className="p-4 text-left">
      Status
    </th>

  </tr>

</thead>

<tbody>
{filteredEvents.length === 0 ? (

<tr>

  <td
    colSpan={8}
    className={`py-20 text-center ${
      theme === "dark"
        ? "text-slate-500"
        : "text-slate-400"
    }`}
  >
    No matching events found.
  </td>

</tr>

) : (

filteredEvents.map((event, index) => (

  <tr
    key={index}
    className={`transition ${
      theme === "dark"
        ? "border-t border-slate-800 hover:bg-slate-800/40"
        : "border-t border-slate-200 hover:bg-slate-50"
    }`}
  >

    <td className="p-4">
      {event.date}
    </td>

    <td className="p-4 font-mono">
      {event.time}
    </td>

    <td className="p-4 font-semibold text-cyan-500">
      {event.ambulanceID}
    </td>

    <td className="p-4">
      {event.route}
    </td>

    <td className="p-4">
      {event.signal}
    </td>

    <td className="p-4">
      <AuthBadge
        authentication={
          event.authentication
        }
      />
    </td>

    <td className="p-4">
      {event.duration}
    </td>

    <td className="p-4">
      <StatusBadge
        status={event.status}
      />
    </td>

  </tr>

))

)}

</tbody>

</table>

</div>

<div
className={`mt-6 flex flex-wrap justify-between items-center gap-4 text-sm ${
theme === "dark"
? "text-slate-400"
: "text-slate-500"
}`}
>

<span>
Showing{" "}
<strong>
{filteredEvents.length}
</strong>{" "}
of{" "}
<strong>
{events.length}
</strong>{" "}
records
</span>

<span>
Filter by Ambulance ID, Route,
Date, or a Time Range on a
selected date.
</span>

</div>

</div>

);

}