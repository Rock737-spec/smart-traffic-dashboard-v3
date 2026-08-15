"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";

import { database } from "@/lib/firebase";
import { mapFirebaseData } from "@/lib/firebaseMapper";
import { DashboardData } from "@/types/traffic";

const defaultData: DashboardData = {
  controllers: {
    master: {
      name: "Master ESP32",
      online: false,
      wifiRSSI: 0,
      firebase: false,
      espNow: false,
      nrf24: false,
      firmware: "--",
    },
    slave: {
      name: "Slave ESP32",
      online: false,
      wifiRSSI: 0,
      firebase: false,
      espNow: false,
      nrf24: false,
      firmware: "--",
    },
    ambulance: {
      name: "Ambulance ESP32",
      online: false,
      wifiRSSI: 0,
      firebase: false,
      espNow: false,
      nrf24: false,
      firmware: "--",
    },
  },

  signals: {
    signal1: {
      id: 1,
      color: "RED",
      countdown: 0,
      controller: "MASTER",
      emergency: false,
    },
    signal2: {
      id: 2,
      color: "RED",
      countdown: 0,
      controller: "MASTER",
      emergency: false,
    },
    signal3: {
      id: 3,
      color: "RED",
      countdown: 0,
      controller: "SLAVE",
      emergency: false,
    },
    signal4: {
      id: 4,
      color: "RED",
      countdown: 0,
      controller: "SLAVE",
      emergency: false,
    },
  },

  emergency: {
    active: false,
    selectedSignal: undefined,
    overrideTimer: 0,
    nrfConnected: false,
    keypadConnected: false,
    route: "signal1",
    countdown: 0,
  },

  analytics: {
    uptime: 0,
    totalPackets: 0,
    espNowPackets: 0,
    nrfPackets: 0,
    firebaseUpdates: 0,
    systemHealth: 0,
  },

  events: [],
};

export function useTrafficData() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    const dbRef = ref(database);

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const firebaseData = snapshot.val();

        if (firebaseData) {
          setFirebaseConnected(true);
          try {
            const mapped = mapFirebaseData(firebaseData);
            setData(mapped);
          } catch (err) {
            console.error("Mapping Error:", err);
          }
        } else {
          setFirebaseConnected(false);
          setData(defaultData);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Firebase Database Read Error:", error);
        setFirebaseConnected(false);
        setLoading(false);
      }
    );

    // Periodic Heartbeat Re-evaluator (Runs every 3 seconds to trigger timeout checks even if Firebase isn't pushing new data)
    const interval = setInterval(() => {
      setData((prevData) => {
        if (!prevData) return prevData;
        return { ...prevData };
      });
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    data,
    loading,
    firebaseConnected,
  };
}

export default useTrafficData;