"use client";

import { useEffect, useRef } from "react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ControllerCards from "@/components/ControllerCards";
import SignalCards from "@/components/SignalCards";
import LiveIntersection from "@/components/LiveIntersection";
import AITrafficAnalysis from "@/components/AITrafficAnalysis";
import AmbulanceCamera from "@/components/AmbulanceCamera";
import EmergencyPanel from "@/components/EmergencyPanel";
import Analytics from "@/components/Analytics";
import NetworkTopology from "@/components/NetworkTopology";
import SystemHealth from "@/components/SystemHealth";
import EventLog from "@/components/EventLog";
import Footer from "@/components/Footer";
import DashboardOverview from "@/components/DashboardOverview";
import SystemStatusBanner from "@/components/SystemStatusBanner";

import { useTrafficData } from "@/hooks/useTrafficData";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ToastProvider";

export default function DashboardPage() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const {
    data,
    loading,
    firebaseConnected,
  } = useTrafficData();

  const previous = useRef({
    firebase: false,
    emergency: false,
    master: false,
    slave: false,
    ambulance: false,
    nrf24: false,
  });

  useEffect(() => {
    if (loading) return;

    const prev = previous.current;

    // ============================================================
    // FIREBASE STATUS
    // ============================================================

    if (prev.firebase !== firebaseConnected) {
      showToast(
        firebaseConnected
          ? "Firebase Connected"
          : "Firebase Disconnected",
        firebaseConnected
          ? "Realtime database connection established."
          : "Lost connection to Firebase.",
        firebaseConnected
          ? "success"
          : "error"
      );
    }

    // ============================================================
    // EMERGENCY STATUS
    // ============================================================

    if (prev.emergency !== data.emergency.active) {
      showToast(
        data.emergency.active
          ? "🚑 Ambulance Detected"
          : "Emergency Cleared",
        data.emergency.active
          ? "Priority Mode Activated."
          : "Traffic returned to normal operation.",
        data.emergency.active
          ? "warning"
          : "success"
      );
    }

    // ============================================================
    // MASTER CONTROLLER
    // ============================================================

    if (
      prev.master !==
      data.controllers.master.online
    ) {
      showToast(
        data.controllers.master.online
          ? "Master ESP32 Connected"
          : "Master ESP32 Offline",
        data.controllers.master.online
          ? "Master controller communication restored."
          : "Master controller stopped responding.",
        data.controllers.master.online
          ? "success"
          : "error"
      );
    }

    // ============================================================
    // SLAVE CONTROLLER
    // ============================================================

    if (
      prev.slave !==
      data.controllers.slave.online
    ) {
      showToast(
        data.controllers.slave.online
          ? "Slave ESP32 Connected"
          : "Slave ESP32 Offline",
        data.controllers.slave.online
          ? "Slave controller communication restored."
          : "Slave controller stopped responding.",
        data.controllers.slave.online
          ? "success"
          : "error"
      );
    }

    // ============================================================
    // AMBULANCE CONTROLLER
    // ============================================================

    if (
      prev.ambulance !==
      data.controllers.ambulance.online
    ) {
      showToast(
        data.controllers.ambulance.online
          ? "Ambulance ESP32 Connected"
          : "Ambulance ESP32 Offline",
        data.controllers.ambulance.online
          ? "Ambulance controller connected."
          : "Ambulance controller disconnected.",
        data.controllers.ambulance.online
          ? "success"
          : "error"
      );
    }

    // ============================================================
    // NRF24 COMMUNICATION
    // ============================================================

    if (
      prev.nrf24 !==
      data.controllers.ambulance.nrf24
    ) {
      showToast(
        data.controllers.ambulance.nrf24
          ? "NRF24 Connected"
          : "NRF24 Disconnected",
        data.controllers.ambulance.nrf24
          ? "Wireless radio link established."
          : "Wireless radio link lost.",
        data.controllers.ambulance.nrf24
          ? "success"
          : "error"
      );
    }

    // ============================================================
    // UPDATE PREVIOUS STATES
    // ============================================================

    previous.current = {
      firebase: firebaseConnected,
      emergency: data.emergency.active,
      master: data.controllers.master.online,
      slave: data.controllers.slave.online,
      ambulance:
        data.controllers.ambulance.online,
      nrf24:
        data.controllers.ambulance.nrf24,
    };
  }, [
    loading,
    firebaseConnected,
    data,
    showToast,
  ]);

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          theme === "dark"
            ? "bg-slate-950 text-white"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="text-center">
          <div
            className="
              w-16
              h-16
              border-4
              border-cyan-500
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
              mb-6
            "
          />

          <h1 className="text-3xl font-bold">
            Smart Traffic Control
          </h1>

          <p
            className={
              theme === "dark"
                ? "mt-2 text-slate-400"
                : "mt-2 text-slate-600"
            }
          >
            Connecting to Firebase...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN DASHBOARD
  // ============================================================

  return (
    <div
      id="top"
      className={`min-h-screen flex transition-colors duration-300 ${
        theme === "dark"
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT */}

      <main
        className={`flex-1 overflow-y-auto transition-colors duration-300 ${
          theme === "dark"
            ? "bg-slate-950"
            : "bg-slate-50"
        }`}
      >
        <Header
          firebaseConnected={firebaseConnected}
        />

        <div className="p-6 space-y-8">

          {/* ======================================================
              SYSTEM STATUS
              ====================================================== */}

          <SystemStatusBanner
            data={data}
            firebaseConnected={firebaseConnected}
          />

          {/* ======================================================
              DASHBOARD OVERVIEW
              ====================================================== */}

          <DashboardOverview
            data={data}
          />

          {/* ======================================================
              TRAFFIC CONTROLLERS
              ====================================================== */}

          <section id="controllers">
            <ControllerCards
              controllers={data.controllers}
            />
          </section>

          {/* ======================================================
              TRAFFIC SIGNALS
              ====================================================== */}

          <section id="signals">
            <SignalCards
              signals={data.signals}
            />
          </section>

          {/* ======================================================
              LIVE INTERSECTION
              ====================================================== */}

          <section id="intersection">
            <LiveIntersection
              data={data}
            />
          </section>

          {/* ======================================================
              AI TRAFFIC ANALYSIS
              ====================================================== */}

          <section id="ai-analysis">
          <AITrafficAnalysis
  emergency={data.emergency}
/>
          </section>

          {/* ======================================================
              AMBULANCE CAMERA
              ====================================================== */}

          <section id="ambulance-camera">
            <AmbulanceCamera />
          </section>

          {/* ======================================================
              EMERGENCY SYSTEM
              ====================================================== */}

          <section id="emergency">
            <EmergencyPanel
              emergency={data.emergency}
            />
          </section>

          {/* ======================================================
              SYSTEM ANALYTICS
              ====================================================== */}

          <section id="analytics">
            <Analytics
              analytics={data.analytics}
            />
          </section>

          {/* ======================================================
              NETWORK
              ====================================================== */}

          <section id="network">
            <NetworkTopology
              data={data}
            />
          </section>

          {/* ======================================================
              SYSTEM HEALTH
              ====================================================== */}

          <section id="health">
            <SystemHealth
              data={data}
            />
          </section>

          {/* ======================================================
              EVENT LOG
              ====================================================== */}

          <section id="events">
            <EventLog
              events={data.events}
            />
          </section>

          {/* ======================================================
              FOOTER
              ====================================================== */}

          <Footer />

        </div>
      </main>
    </div>
  );
}