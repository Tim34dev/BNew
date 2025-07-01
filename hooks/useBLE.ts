import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BleManager, Device, Characteristic, State } from 'react-native-ble-plx';
import { DeviceData, ConnectionState, DeviceConfig } from '@/types/ble';

// JDY-23 BLE Module Configuration
const SERVICE_UUID = '0000FFE0-0000-1000-8000-00805F9B34FB';
const CHARACTERISTIC_UUID = '0000FFE1-0000-1000-8000-00805F9B34FB';
const DEVICE_NAME_PREFIX = 'JDY-23';

export function useBLE() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
  });
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
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
      if (data.startsWith('DATA:')) {
        const values = data.substring(5).split(',');
        if (values.length >= 8) {
          const newData: DeviceData = {
            current: parseFloat(values[1]) || 0,
            voltage: parseFloat(values[2]) || 0,
            power: parseFloat(values[3]) || 0,
            peakCurrent: parseFloat(values[4]) || 0,
            minCurrent: parseFloat(values[5]) || 0,
            peakVoltage: parseFloat(values[6]) || 0,
            minVoltage: parseFloat(values[7]) || 0,
            uptime: parseInt(values[0]) || 0,
            energy: parseFloat(values[8]) || 0,
            alarm: false,
            zeroOffset: 0,
            timestamp: Date.now(),
          };
          setDeviceData(newData);
        }
      } else if (data.startsWith('STATUS:')) {
        // Parse status response
        const statusData = data.substring(7);
        const params = new URLSearchParams(statusData.replace(/,/g, '&'));
        
        const newData: DeviceData = {
          current: parseFloat(params.get('CURRENT') || '0'),
          voltage: parseFloat(params.get('VOLTAGE') || '0'),
          power: parseFloat(params.get('POWER') || '0'),
          peakCurrent: parseFloat(params.get('PEAK_I') || '0'),
          minCurrent: parseFloat(params.get('MIN_I') || '0'),
          peakVoltage: parseFloat(params.get('PEAK_V') || '0'),
          minVoltage: parseFloat(params.get('MIN_V') || '0'),
          uptime: parseInt(params.get('UPTIME') || '0'),
          energy: parseFloat(params.get('ENERGY') || '0'),
          alarm: params.get('ALARM') === '1',
          zeroOffset: parseFloat(params.get('ZERO_OFFSET') || '0'),
          timestamp: Date.now(),
        };
        setDeviceData(newData);
      } else if (data.startsWith('ALARM:')) {
        // Handle alarm notifications
        setDeviceData(prev => prev ? { ...prev, alarm: true } : null);
        Alert.alert('Alarm', data.substring(6));
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
        console.log('Received:', trimmedLine);
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
        deviceName: device.name || 'Current Monitor',
        deviceId: device.id,
        lastUpdate: Date.now(),
      });

      // Request initial status
      setTimeout(() => {
        sendCommand('STATUS');
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
    setDeviceData(null);
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

  // Calibrate zero current
  const calibrateZeroCurrent = async () => {
    return sendCommand('ZERO_CAL');
  };

  // Reset statistics
  const resetStatistics = async () => {
    return sendCommand('RESET');
  };

  // Set alarm thresholds
  const setAlarmThresholds = async (config: Partial<DeviceConfig>) => {
    const commands = [];
    
    if (config.currentAlarmHigh !== undefined) {
      commands.push(`ALARM_HIGH:${config.currentAlarmHigh}`);
    }
    if (config.currentAlarmLow !== undefined) {
      commands.push(`ALARM_LOW:${config.currentAlarmLow}`);
    }
    if (config.voltageAlarmHigh !== undefined) {
      commands.push(`VALARM_HIGH:${config.voltageAlarmHigh}`);
    }
    if (config.voltageAlarmLow !== undefined) {
      commands.push(`VALARM_LOW:${config.voltageAlarmLow}`);
    }
    if (config.alarmsEnabled !== undefined) {
      commands.push(config.alarmsEnabled ? 'ALARMS_ON' : 'ALARMS_OFF');
    }

    for (const command of commands) {
      await sendCommand(command);
      // Small delay between commands
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  return {
    connectionState,
    deviceData,
    isScanning,
    availableDevices,
    startScanning,
    connectToDevice,
    disconnect,
    sendCommand,
    calibrateZeroCurrent,
    resetStatistics,
    setAlarmThresholds,
  };
}