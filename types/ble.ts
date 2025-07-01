export interface DeviceData {
  current: number;
  voltage: number;
  power: number;
  peakCurrent: number;
  minCurrent: number;
  peakVoltage: number;
  minVoltage: number;
  uptime: number;
  energy: number;
  alarm: boolean;
  zeroOffset: number;
  timestamp: number;
}

export interface DeviceConfig {
  currentAlarmHigh: number;
  currentAlarmLow: number;
  voltageAlarmHigh: number;
  voltageAlarmLow: number;
  alarmsEnabled: boolean;
  dataLoggingEnabled: boolean;
  logInterval: number;
  calibrationFactor: number;
  voltageCalibrationFactor: number;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  deviceName?: string;
  deviceId?: string;
  lastUpdate?: number;
}

export interface DataPoint {
  timestamp: number;
  current: number;
  voltage: number;
  power: number;
}