export interface Controller {
  online: boolean;
  firebase: boolean;
  espNow: boolean;
  nrf24: boolean;
}

export interface EmergencyStatus {
  active: boolean;
  route?: string;
  countdown?: number;
  nrfConnected?: boolean;
}

export interface TrafficSignal {
  id?: number | string;
  color: "GREEN" | "YELLOW" | "RED" | string;
  countdown: number;
}