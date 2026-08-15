export type SignalColor = "RED" | "YELLOW" | "GREEN";

export interface Controller {
  name: string;
  online: boolean;
  wifiRSSI: number;
  firebase: boolean;
  espNow: boolean;
  nrf24: boolean;
  firmware: string;
}

export interface TrafficSignal {
  id: number;
  color: SignalColor;
  countdown: number;
  controller: string;
  emergency: boolean;
}

export interface EmergencyStatus {
  active: boolean;
  route: "signal1" | "signal2" | "signal3" | "signal4" | string;
  countdown: number;

  selectedSignal?: "signal1" | "signal2" | "signal3" | "signal4" | string;
  overrideTimer?: number;
  nrfConnected?: boolean;
  keypadConnected?: boolean;
}

export interface Analytics {
  uptime: number;
  totalPackets: number;
  espNowPackets: number;
  nrfPackets: number;
  firebaseUpdates: number;
  systemHealth: number;
}

/*
 * Event Log Model
 * Matches exactly what the Master ESP32 writes into:
 *
 * /eventLogs/log_xxxx
 */

export interface EventLogItem {
  timestamp: number;

  date: string;

  time: string;

  ambulanceID: string;

  route: string;

  signal: string;

  authentication: string;

  sirenDetected: string;

  startTime: string;

  endTime: string;

  duration: string;

  status: string;

  reason: string;
}

export interface DashboardData {
  controllers: {
    master: Controller;
    slave: Controller;
    ambulance: Controller;
  };

  signals: {
    signal1: TrafficSignal;
    signal2: TrafficSignal;
    signal3: TrafficSignal;
    signal4: TrafficSignal;
  };

  emergency: EmergencyStatus;

  analytics: Analytics;

  events: EventLogItem[];
}