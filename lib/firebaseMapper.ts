import { DashboardData, EventLogItem } from "@/types/traffic";

/**
 * Safely parses any input format
 * ("ONLINE", "OFFLINE", "TRUE", true, 1)
 * to a strict boolean.
 */
const parseBoolStatus = (
  val: unknown,
  fallback: boolean = false
): boolean => {
  if (typeof val === "boolean") return val;

  if (typeof val === "string") {
    const cleanStr = val.trim().toUpperCase();

    return (
      cleanStr === "ONLINE" ||
      cleanStr === "TRUE" ||
      cleanStr === "ACTIVE" ||
      cleanStr === "CONNECTED"
    );
  }

  if (typeof val === "number") {
    return val === 1;
  }

  return fallback;
};

/**
 * Checks if controller heartbeat
 * is still alive.
 */
const isNodeAlive = (
  nodeData: any,
  fallbackOnline: boolean = false
): boolean => {
  if (!nodeData) return fallbackOnline;

  const onlineFlag = parseBoolStatus(
    nodeData.online ?? fallbackOnline
  );

  if (!onlineFlag) return false;

  const timestamp =
    nodeData.lastSeen ??
    nodeData.last_updated ??
    0;

  if (
    timestamp &&
    typeof timestamp === "number"
  ) {
    const now = Date.now();

    if (timestamp > 1000000000000) {
      return now - timestamp < 15000;
    }
  }

  return onlineFlag;
};

/**
 * Converts
 *
 * /eventLogs
 *
 * object
 *
 * into
 *
 * EventLogItem[]
 *
 * sorted newest first.
 */
const mapEventLogs = (
  rawLogs: any
): EventLogItem[] => {
  if (!rawLogs) return [];

  const events: EventLogItem[] = Object.values(rawLogs).map(
    (log: any) => ({
      timestamp:
        Number(log.timestamp) || 0,

      date:
        log.date ?? "--",

      time:
        log.time ??
        log.startTime ??
        "--:--:--",

      ambulanceID:
        log.ambulanceID ?? "--",

      route:
        log.route ?? "--",

      signal:
        log.signal ?? "--",

      authentication:
        log.authentication ??
        "--",

      sirenDetected:
        log.sirenDetected ??
        "--",

      startTime:
        log.startTime ??
        "--:--:--",

      endTime:
        log.endTime ??
        "--:--:--",

      duration:
        log.duration ?? "--",

      status:
        log.status ??
        "UNKNOWN",

      reason:
        log.reason ??
        "None",
    })
  );

  events.sort(
    (a, b) =>
      b.timestamp - a.timestamp
  );

  return events;
};

export function mapFirebaseData(
  raw: any
): DashboardData {
  if (!raw) {
    throw new Error(
      "Received empty snapshot from Firebase."
    );
  }

  // --------------------------------------------------
  // MASTER STATUS
  // --------------------------------------------------

  const masterData =
    raw.controllers?.master ??
    raw.master ??
    {};

  const masterLastUpdated = Number(
    raw.status?.last_updated ??
      masterData.lastSeen ??
      0
  );

  let masterOnline = parseBoolStatus(
    masterData.online ??
      raw.status?.master ??
      raw.master,
    true
  );

  if (
    masterLastUpdated > 0 &&
    masterLastUpdated > 1000000000000
  ) {
    if (
      Date.now() - masterLastUpdated >
      15000
    ) {
      masterOnline = false;
    }
  }

  // --------------------------------------------------
  // SLAVE STATUS
  // --------------------------------------------------

  const slaveData =
    raw.controllers?.slave ??
    raw.slave ??
    {};

  const slaveOnline = isNodeAlive(
    slaveData,
    parseBoolStatus(
      raw.status?.espnow,
      false
    )
  );

  // --------------------------------------------------
  // EMERGENCY STATUS
  // --------------------------------------------------

  const emergencyData =
    raw.emergency ?? {};

  const emergencyActive =
    parseBoolStatus(
      emergencyData.active,
      false
    );

  const ambulanceData =
    raw.controllers?.ambulance ??
    raw.ambulance ??
    {};

  const ambulanceOnline =
    isNodeAlive(
      ambulanceData,
      emergencyActive
    );

  // --------------------------------------------------
  // SIGNAL DATA
  // --------------------------------------------------

  const signalsData =
    raw.signals ?? {};

  const getSignalTimer = (
    sigObj: any,
    fallbackKey: string
  ) =>
    Number(
      sigObj?.timer ??
        sigObj?.countdown ??
        raw[fallbackKey] ??
        0
    );

  return {
    controllers: {
      master: {
        name: "Master ESP32",

        online: masterOnline,

        wifiRSSI: masterOnline
          ? Number(
              masterData.wifiRSSI ??
                -50
            )
          : 0,

        firebase: masterOnline,

        espNow: masterOnline,

        nrf24: masterOnline,

        firmware:
          masterData.firmware ??
          "v2.3",
      },

      slave: {
        name: "Slave ESP32",

        online: slaveOnline,

        wifiRSSI: slaveOnline
          ? Number(
              slaveData.wifiRSSI ??
                -58
            )
          : 0,

        firebase: slaveOnline,

        espNow: slaveOnline,

        nrf24: slaveOnline,

        firmware:
          slaveData.firmware ??
          "v1.0.0",
      },

      ambulance: {
        name: "Ambulance ESP32",

        online: ambulanceOnline,

        wifiRSSI: ambulanceOnline
          ? Number(
              ambulanceData.wifiRSSI ??
                0
            )
          : 0,

        firebase: ambulanceOnline,

        espNow: ambulanceOnline,

        nrf24: ambulanceOnline,

        firmware:
          ambulanceData.firmware ??
          "v1.0",
        },
      },

        signals: {
          signal1: {
            id: 1,
    
            color:
              signalsData.signal1?.color ??
              raw.s1Color ??
              "RED",
    
            countdown: getSignalTimer(
              signalsData.signal1,
              "s1Count"
            ),
    
            controller: "MASTER",
    
            emergency:
              emergencyActive &&
              (emergencyData.route === "A" ||
                emergencyData.route ===
                  "signal1"),
          },
    
          signal2: {
            id: 2,
    
            color:
              signalsData.signal2?.color ??
              raw.s2Color ??
              "RED",
    
            countdown: getSignalTimer(
              signalsData.signal2,
              "s2Count"
            ),
    
            controller: "MASTER",
    
            emergency:
              emergencyActive &&
              (emergencyData.route === "B" ||
                emergencyData.route ===
                  "signal2"),
          },
    
          signal3: {
            id: 3,
    
            color:
              signalsData.signal3?.color ??
              raw.s3Color ??
              "RED",
    
            countdown: getSignalTimer(
              signalsData.signal3,
              "s3Count"
            ),
    
            controller: "SLAVE",
    
            emergency:
              emergencyActive &&
              (emergencyData.route === "C" ||
                emergencyData.route ===
                  "signal3"),
          },
    
          signal4: {
            id: 4,
    
            color:
              signalsData.signal4?.color ??
              raw.s4Color ??
              "RED",
    
            countdown: getSignalTimer(
              signalsData.signal4,
              "s4Count"
            ),
    
            controller: "SLAVE",
    
            emergency:
              emergencyActive &&
              (emergencyData.route === "D" ||
                emergencyData.route ===
                  "signal4"),
          },
        },
    
        emergency: {
          active: emergencyActive,
    
          selectedSignal:
            emergencyData.route ??
            undefined,
    
          overrideTimer: Number(
            emergencyData.countdown ??
              0
          ),
    
          nrfConnected:
            ambulanceOnline,
    
          keypadConnected:
            masterOnline,
    
          route:
            emergencyData.route ??
            "None",
    
          countdown: Number(
            emergencyData.countdown ??
              0
          ),
        },
    
        analytics: {
          uptime: Number(
            raw.analytics?.uptime ??
              raw.status?.last_updated ??
              0
          ),
    
          totalPackets: Number(
            raw.analytics
              ?.totalPackets ?? 0
          ),
    
          espNowPackets: Number(
            raw.analytics
              ?.espNowPackets ?? 0
          ),
    
          nrfPackets: Number(
            raw.analytics
              ?.nrfPackets ?? 0
          ),
    
          firebaseUpdates: Number(
            raw.analytics
              ?.firebaseUpdates ?? 0
          ),
    
          systemHealth:
            masterOnline
              ? slaveOnline
                ? 100
                : 75
              : slaveOnline
              ? 50
              : 0,
        },
    
        events: mapEventLogs(
          raw.eventLogs ??
          raw.events
        ),
      }
    }

