import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Bluetooth, BluetoothOff, Loader, Search } from 'lucide-react-native';
import { ConnectionState } from '@/types/ble';
import { Device } from 'react-native-ble-plx';
import { DeviceList } from './DeviceList';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  isScanning: boolean;
  availableDevices: Device[];
  onConnect: () => void;
  onDisconnect: () => void;
  onDeviceSelect: (deviceId: string) => void;
}

export function ConnectionStatus({
  connectionState,
  isScanning,
  availableDevices,
  onConnect,
  onDisconnect,
  onDeviceSelect
}: ConnectionStatusProps) {
  const [showDeviceList, setShowDeviceList] = useState(false);

  const getStatusColor = () => {
    if (connectionState.isConnected) return '#10B981';
    if (connectionState.isConnecting) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusText = () => {
    if (connectionState.isConnected) return 'Connected';
    if (connectionState.isConnecting) return 'Connecting...';
    if (isScanning) return 'Scanning...';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (connectionState.isConnecting || isScanning) {
      return <Loader size={16} color={getStatusColor()} />;
    }
    return connectionState.isConnected ? 
      <Bluetooth size={16} color={getStatusColor()} /> :
      <BluetoothOff size={16} color={getStatusColor()} />;
  };

  const handleConnect = () => {
    if (availableDevices.length === 0) {
      onConnect(); // Start scanning
    } else {
      setShowDeviceList(true);
    }
  };

  const handleDeviceSelect = (deviceId: string) => {
    setShowDeviceList(false);
    onDeviceSelect(deviceId);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          {connectionState.deviceName && (
            <Text style={styles.deviceName}>
              {connectionState.deviceName}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: connectionState.isConnected ? '#EF4444' : '#0EA5E9'
            }
          ]}
          onPress={connectionState.isConnected ? onDisconnect : handleConnect}
          disabled={connectionState.isConnecting || isScanning}
        >
          {!connectionState.isConnected && availableDevices.length > 0 && (
            <Search size={16} color="#FFFFFF" style={styles.buttonIcon} />
          )}
          <Text style={styles.buttonText}>
            {connectionState.isConnected 
              ? 'Disconnect' 
              : availableDevices.length > 0 
                ? 'Select Device' 
                : 'Scan'
            }
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDeviceList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDeviceList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Device</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDeviceList(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <DeviceList
            devices={availableDevices}
            onDeviceSelect={handleDeviceSelect}
            isConnecting={connectionState.isConnecting}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  deviceName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginLeft: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0EA5E9',
  },
});