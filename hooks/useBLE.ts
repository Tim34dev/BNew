import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BleManager, Device, Characteristic, State } from 'react-native-ble-plx';
import { BatteryTestData, ConnectionState, TestConfig, PIDData, TestResult } from '@/types/ble';

// JDY-23 BLE Module Configuration
const SERVICE_UUID = '0000FFE0-0000-1000-8000-00805F9B34FB';
const CHARACTERISTIC_UUID = '0000FFE1-0000-1000-8000-00805F9B34FB';
const DEVICE_NAME_PREFIX = 'JDY-23';

export function useBLE() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
  });
  const [testData, setTestData] = useState<BatteryTestData | null>(null);
  const [pidData, setPidData] = useState<PIDData | null>(null);
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  
  const bleManager = useRef<BleManager | null>(null);
  const connectedDevice = useRef<Device | null>(null);
  const characteristic = useRef<Characteristic | null>(null);
  const dataBuffer = useRef<string>('');

  // Initialize BLE Manager
  useEffect(() => {
    if (Platform.OS !== 'web') {
      bleManager.current = new BleManager();
      
      const subscription = bleManager.current.onStateChange((state) => {
        if (state === State.PoweredOn) {
          console.log('BLE is powered on');
        } else {
          console.log('BLE state:', state);
          if (connectedDevice.current) {
            disconnect();
          }
        }
      }, true);

      return () => {
        subscription.remove();
        bleManager.current?.destroy();
      };
    }
  }, []);

  // Request Android permissions
  const requestAndroidPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  // Parse incoming data from device
  const parseDeviceData = useCallback((data: string) => {
    try {
      console.log('Received:', data);
      
      if (data.startsWith('DATA:')) {
        const params = new URLSearchParams(data.substring(5).replace(/,/g, '&'));
        
        const newData: BatteryTestData = {
          voltage: parseFloat(params.get('Voltage') || '0'),
          current: parseFloat(params.get('Current') || '0'),
          targetCurrent: parseFloat(params.get('Target_Current') || '0'),
          capacity: parseFloat(params.get('Capacity') || '0'),
          testStatus: params.get('Test_Status') as 'STOPPED' | 'RUNNING' || 'STOPPED',
          elapsedTime: parseInt(params.get('Elapsed_Time') || '0'),
          internalResistance: params.get('Internal_Resistance_mOhm') ? 
            parseFloat(params.get('Internal_Resistance_mOhm') || '0') / 1000 : undefined,
          timestamp: Date.now(),
        };
        setTestData(newData);
      } else if (data.startsWith('PID:')) {
        const params = new URLSearchParams(data.substring(4).replace(/,/g, '&'));
        
        const newPidData: PIDData = {
          error: parseFloat(params.get('Error') || '0'),
          output: parseFloat(params.get('Output') || '0'),
          integral: parseFloat(params.get('Integral') || '0'),
        };
        setPidData(newPidData);
      } else if (data.startsWith('PID_DEBUG:')) {
        const params = new URLSearchParams(data.substring(10).replace(/,/g, '&'));
        
        const debugPidData: PIDData = {
          error: parseFloat(params.get('Error') || '0'),
          output: parseFloat(params.get('PWM_Output') || '0'),
          integral: parseFloat(params.get('Integral') || '0'),
          pTerm: parseFloat(params.get('P_Term') || '0'),
          iTerm: parseFloat(params.get('I_Term') || '0'),
          dTerm: parseFloat(params.get('D_Term') || '0'),
        };
        setPidData(debugPidData);
      } else if (data.startsWith('CONFIG:')) {
        const params = new URLSearchParams(data.substring(7).replace(/,/g, '&'));
        
        const config: TestConfig = {
          maxCurrent: parseFloat(params.get('Max_Current') || '20'),
          minCurrent: parseFloat(params.get('Min_Current') || '1'),
          cutoffVoltage: parseFloat(params.get('Cutoff_Voltage') || '10'),
          currentStep: parseFloat(params.get('Current_Step') || '1'),
        };
        setTestConfig(config);
      } else if (data.startsWith('RESULT:')) {
        const params = new URLSearchParams(data.substring(7).replace(/,/g, '&'));
        
        const result: TestResult = {
          finalCapacity: parseFloat(params.get('Final_Capacity_mAh') || '0'),
          internalResistance: params.get('Internal_Resistance_mOhm') ? 
            parseFloat(params.get('Internal_Resistance_mOhm') || '0') / 1000 : undefined,
          testDuration: parseInt(params.get('Test_Duration_Seconds') || '0'),
          finalVoltage: parseFloat(params.get('Final_Voltage') || '0'),
          openCircuitVoltage: parseFloat(params.get('Open_Circuit_Voltage') || '0'),
          averageCurrent: 0, // Will be calculated
          energyDelivered: 0, // Will be calculated
        };
        setTestResult(result);
      } else if (data.includes('BT_STATUS:CONNECTED')) {
        console.log('Bluetooth connection confirmed');
      } else if (data.includes('Test Started') || data.includes('TEST_STARTED')) {
        setTestData(prev => prev ? { ...prev, testStatus: 'RUNNING' } : null);
      } else if (data.includes('Test Stopped') || data.includes('TEST_STOPPED')) {
        setTestData(prev => prev ? { ...prev, testStatus: 'STOPPED' } : null);
      }
    } catch (error) {
      console.error('Error parsing device data:', error);
    }
  }, []);

  // Handle incoming BLE data
  const handleDataReceived = useCallback((data: string) => {
    dataBuffer.current += data;
    
    // Process complete lines
    const lines = dataBuffer.current.split('\n');
    dataBuffer.current = lines.pop() || ''; // Keep incomplete line in buffer
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        parseDeviceData(trimmedLine);
      }
    });
  }, [parseDeviceData]);

  // Start scanning for devices
  const startScanning = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'BLE is not supported on web platform');
      return;
    }

    if (!bleManager.current) return;

    const hasPermissions = await requestAndroidPermissions();
    if (!hasPermissions) {
      Alert.alert('Permissions Required', 'Bluetooth permissions are required to scan for devices');
      return;
    }

    setIsScanning(true);
    setAvailableDevices([]);

    try {
      bleManager.current.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setIsScanning(false);
          return;
        }

        if (device && device.name && device.name.includes(DEVICE_NAME_PREFIX)) {
          setAvailableDevices(prev => {
            const exists = prev.find(d => d.id === device.id);
            if (!exists) {
              return [...prev, device];
            }
            return prev;
          });
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        bleManager.current?.stopDeviceScan();
        setIsScanning(false);
      }, 10000);
    } catch (error) {
      console.error('Failed to start scanning:', error);
      setIsScanning(false);
    }
  };

  // Connect to a specific device
  const connectToDevice = async (deviceId?: string) => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'BLE is not supported on web platform');
      return;
    }

    if (!bleManager.current) return;

    // If no deviceId provided, start scanning
    if (!deviceId) {
      await startScanning();
      return;
    }

    setConnectionState(prev => ({ ...prev, isConnecting: true }));

    try {
      // Stop scanning if active
      bleManager.current.stopDeviceScan();
      setIsScanning(false);

      // Connect to device
      const device = await bleManager.current.connectToDevice(deviceId);
      connectedDevice.current = device;

      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();

      // Get the characteristic for communication
      const services = await device.services();
      const service = services.find(s => s.uuid.toUpperCase() === SERVICE_UUID);
      
      if (!service) {
        throw new Error('Service not found');
      }

      const characteristics = await service.characteristics();
      const char = characteristics.find(c => c.uuid.toUpperCase() === CHARACTERISTIC_UUID);
      
      if (!char) {
        throw new Error('Characteristic not found');
      }

      characteristic.current = char;

      // Start monitoring for notifications
      char.monitor((error, characteristic) => {
        if (error) {
          console.error('Monitor error:', error);
          return;
        }

        if (characteristic?.value) {
          const data = Buffer.from(characteristic.value, 'base64').toString('utf-8');
          handleDataReceived(data);
        }
      });

      setConnectionState({
        isConnected: true,
        isConnecting: false,
        deviceName: device.name || 'Battery Tester',
        deviceId: device.id,
        lastUpdate: Date.now(),
      });

      // Request initial status and config
      setTimeout(() => {
        sendCommand('GET_STATUS');
        sendCommand('GET_CONFIG');
      }, 1000);

    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionState({
        isConnected: false,
        isConnecting: false,
      });
      Alert.alert('Connection Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Disconnect from device
  const disconnect = async () => {
    try {
      if (connectedDevice.current) {
        await connectedDevice.current.cancelConnection();
        connectedDevice.current = null;
        characteristic.current = null;
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }

    setConnectionState({
      isConnected: false,
      isConnecting: false,
    });
    setTestData(null);
    setPidData(null);
    setTestResult(null);
    dataBuffer.current = '';
  };

  // Send command to device
  const sendCommand = async (command: string): Promise<string> => {
    if (!characteristic.current || !connectionState.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      const data = command + '\n';
      const base64Data = Buffer.from(data, 'utf-8').toString('base64');
      
      await characteristic.current.writeWithResponse(base64Data);
      console.log('Sent command:', command);
      
      return 'OK';
    } catch (error) {
      console.error('Send command error:', error);
      throw error;
    }
  };

  // Test control functions
  const startTest = async () => {
    return sendCommand('START_TEST');
  };

  const stopTest = async () => {
    return sendCommand('STOP_TEST');
  };

  const setTargetCurrent = async (current: number) => {
    return sendCommand(`SET_CURRENT:${current}`);
  };

  const getStatus = async () => {
    return sendCommand('GET_STATUS');
  };

  const getConfig = async () => {
    return sendCommand('GET_CONFIG');
  };

  return {
    connectionState,
    testData,
    pidData,
    testConfig,
    testResult,
    isScanning,
    availableDevices,
    startScanning,
    connectToDevice,
    disconnect,
    sendCommand,
    startTest,
    stopTest,
    setTargetCurrent,
    getStatus,
    getConfig,
  };
}