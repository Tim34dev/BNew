export interface BatteryTestData {
  voltage: number;
  current: number;
  targetCurrent: number;
  capacity: number;
  testStatus: 'STOPPED' | 'RUNNING';
  elapsedTime: number;
  internalResistance?: number;
  openCircuitVoltage?: number;
  finalVoltage?: number;
  testDuration?: number;
  timestamp: number;
}

export interface PIDData {
  error: number;
  output: number;
  integral: number;
  pTerm?: number;
  iTerm?: number;
  dTerm?: number;
}

export interface TestConfig {
  maxCurrent: number;
  minCurrent: number;
  cutoffVoltage: number;
  currentStep: number;
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
  voltage: number;
  current: number;
  capacity: number;
}

export interface TestResult {
  finalCapacity: number;
  internalResistance?: number;
  testDuration: number;
  finalVoltage: number;
  openCircuitVoltage: number;
  averageCurrent: number;
  energyDelivered: number;
}